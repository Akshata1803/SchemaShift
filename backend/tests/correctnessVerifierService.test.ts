import { computeResultHash, verifyCorrectness, stripSqlComments } from "../src/services/correctnessVerifierService";

describe("correctnessVerifierService — SHA-256 Hash Verification & Equivalence", () => {
  describe("computeResultHash Unit Tests", () => {
    it("should generate a deterministic 64-character SHA-256 hex hash", () => {
      const rows = [{ id: 1, email: "user@test.com", status: "active" }];
      const hash1 = computeResultHash(rows);
      const hash2 = computeResultHash(rows);

      expect(typeof hash1).toBe("string");
      expect(hash1.length).toBe(64);
      expect(hash1).toEqual(hash2);
    });

    it("should produce identical hashes for identical result sets", () => {
      const datasetA = [
        { id: 1, name: "Alice", score: 95 },
        { id: 2, name: "Bob", score: 88 },
      ];
      const datasetB = [
        { id: 1, name: "Alice", score: 95 },
        { id: 2, name: "Bob", score: 88 },
      ];

      expect(computeResultHash(datasetA)).toEqual(computeResultHash(datasetB));
    });

    it("should produce different hashes for different result sets", () => {
      const datasetA = [{ id: 1, name: "Alice", score: 95 }];
      const datasetB = [{ id: 1, name: "Alice", score: 99 }];

      expect(computeResultHash(datasetA)).not.toEqual(computeResultHash(datasetB));
    });

    it("should handle empty arrays deterministically", () => {
      const emptyHash = computeResultHash([]);
      expect(emptyHash).toBe("4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"); // SHA-256 of "[]"
    });

    it("should handle nulls, booleans, and nested values without throwing", () => {
      const complexRows = [
        { id: 1, meta: null, is_active: true, tags: ["admin", "dev"] },
        { id: 2, meta: { role: "guest" }, is_active: false, tags: [] },
      ];

      const hash = computeResultHash(complexRows);
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });
  });

  describe("stripSqlComments Utility Tests", () => {
    it("should strip both single-line -- and multi-line /* */ comments", () => {
      const sqlWithComments = `-- Single line comment\nSELECT * FROM users; /* Block comment */`;
      const clean = stripSqlComments(sqlWithComments);
      expect(clean).toBe("SELECT * FROM users");
    });
  });

  describe("verifyCorrectness SQLite Execution Tests", () => {
    it("should return resultsMatch = true for identical SELECT queries", async () => {
      const originalSql = "SELECT id, email, status FROM users WHERE status = 'active';";
      const rewrittenSql = "SELECT id, email, status FROM users WHERE status = 'active';";

      const res = await verifyCorrectness(originalSql, rewrittenSql);

      expect(res.resultsMatch).toBe(true);
      expect(res.originalResultHash).toEqual(res.rewrittenResultHash);
      expect(res.originalRowsCount).toBe(1);
      expect(res.rewrittenRowsCount).toBe(1);
    });

    it("should return resultsMatch = false for queries returning different data", async () => {
      const originalSql = "SELECT * FROM users WHERE role = 'customer';";
      const rewrittenSql = "SELECT * FROM users WHERE role = 'admin';";

      const res = await verifyCorrectness(originalSql, rewrittenSql);

      expect(res.resultsMatch).toBe(false);
      expect(res.originalResultHash).not.toEqual(res.rewrittenResultHash);
    });

    it("should strip SQL comments before executing queries", async () => {
      const originalSql = `-- This is a test comment\nSELECT id, email FROM users WHERE id = 1;`;
      const rewrittenSql = `/* Multi-line comment */ SELECT id, email FROM users WHERE id = 1;`;

      const res = await verifyCorrectness(originalSql, rewrittenSql);

      expect(res.resultsMatch).toBe(true);
      expect(res.originalRowsCount).toBe(1);
    });

    it("should handle DDL operations without errors", async () => {
      const ddlSql1 = "ALTER TABLE users ADD COLUMN bio TEXT DEFAULT 'Engineer';";
      const ddlSql2 = "ALTER TABLE users ADD COLUMN bio TEXT DEFAULT 'Engineer';";

      const res = await verifyCorrectness(ddlSql1, ddlSql2);

      expect(res.resultsMatch).toBe(true);
      expect(res.originalResultHash).toBe("N/A (DDL)");
      expect(res.rewrittenResultHash).toBe("N/A (DDL)");
    });

    it("should handle invalid SQL gracefully by returning error hash state without crashing", async () => {
      const invalidSql = "SELECT * FROM non_existent_table_xyz;";
      const validSql = "SELECT * FROM users;";

      const res = await verifyCorrectness(invalidSql, validSql);

      expect(res.resultsMatch).toBe(false);
      expect(res.originalResultHash).toContain("error:");
    });
  });
});
