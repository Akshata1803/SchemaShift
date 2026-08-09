import sqlite3 from "sqlite3";
import crypto from "crypto";

export interface VerificationResult {
  originalResultHash: string;
  rewrittenResultHash: string;
  resultsMatch: boolean;
  originalRowsCount: number;
  rewrittenRowsCount: number;
}

export function computeResultHash(rows: any[]): string {
  const canonicalStr = JSON.stringify(rows);
  return crypto.createHash("sha256").update(canonicalStr).digest("hex");
}

export async function verifyCorrectness(originalSql: string, rewrittenSql: string): Promise<VerificationResult> {
  const origClean = stripSqlComments(originalSql);
  const rewrClean = stripSqlComments(rewrittenSql);

  return new Promise((resolve) => {
    const db = new sqlite3.Database(":memory:");

    db.serialize(() => {
      db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, full_name TEXT, role TEXT, status TEXT, created_at TEXT);");
      db.run("CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, order_number TEXT, total_amount REAL, status TEXT, created_at TEXT);");

      db.run("INSERT INTO users VALUES (1, 'u1@test.com', 'User 1', 'customer', 'active', '2026-01-01');");
      db.run("INSERT INTO orders VALUES (1, 1, 'ORD-1', 99.9, 'completed', '2026-01-01');");

      let origHash = "N/A (DDL)";
      let origRows: any[] = [];

      let rewrHash = "N/A (DDL)";
      let rewrRows: any[] = [];

      const isOrigSelect = origClean.toUpperCase().startsWith("SELECT") || origClean.toUpperCase().startsWith("WITH");
      const isRewrSelect = rewrClean.toUpperCase().startsWith("SELECT") || rewrClean.toUpperCase().startsWith("WITH");

      const runRewr = () => {
        if (isRewrSelect) {
          db.all(rewrClean, (err, rows) => {
            if (!err && rows) {
              rewrRows = rows;
              rewrHash = computeResultHash(rows);
            } else {
              rewrHash = `error: ${err?.message || "failed"}`;
            }
            finish();
          });
        } else {
          finish();
        }
      };

      const finish = () => {
        db.close();

        let resultsMatch = false;
        if (isOrigSelect || isRewrSelect) {
          if (!origHash.startsWith("error") && !rewrHash.startsWith("error")) {
            if (origHash === rewrHash) {
              resultsMatch = true;
            } else if (origRows.length === rewrRows.length && origRows.length > 0) {
              // Primary key ID matching
              const origIds = origRows.map((r) => r.id || r[Object.keys(r)[0]]);
              const rewrIds = rewrRows.map((r) => r.id || r[Object.keys(r)[0]]);
              resultsMatch = JSON.stringify(origIds) === JSON.stringify(rewrIds);
            }
          }
        } else {
          resultsMatch = true;
        }

        resolve({
          originalResultHash: origHash,
          rewrittenResultHash: rewrHash,
          resultsMatch,
          originalRowsCount: origRows.length,
          rewrittenRowsCount: rewrRows.length,
        });
      };

      if (isOrigSelect) {
        db.all(origClean, (err, rows) => {
          if (!err && rows) {
            origRows = rows;
            origHash = computeResultHash(rows);
          } else {
            origHash = `error: ${err?.message || "failed"}`;
          }
          runRewr();
        });
      } else {
        runRewr();
      }
    });
  });
}

export function stripSqlComments(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .trim()
    .replace(/;$/, "");
}
