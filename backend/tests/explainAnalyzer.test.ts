import { analyzeExplainPlanAndSql } from "../src/sandbox/explainAnalyzer";

describe("explainAnalyzer — Danger Scoring Engine", () => {
  describe("DDL Lock Risk Detection", () => {
    it("should assign high danger score and flag AccessExclusiveLock for ALTER TABLE with DEFAULT", () => {
      const sql = "ALTER TABLE users ADD COLUMN bio TEXT DEFAULT 'Software Engineer';";
      const result = analyzeExplainPlanAndSql(sql, null, 15, 50000);

      expect(result.dangerScore).toBeGreaterThanOrEqual(55);
      expect(result.locksDetectedJson).toContain("AccessExclusiveLock");
      expect(result.dangerReason).toContain("AccessExclusiveLock");
      expect(result.blastRadiusSentence).toContain("AccessExclusiveLock");
      expect(result.blastRadiusSentence).toContain("users");
    });

    it("should assign high danger score and flag AccessExclusiveLock for DROP COLUMN", () => {
      const sql = "ALTER TABLE users DROP COLUMN status;";
      const result = analyzeExplainPlanAndSql(sql, null, 20, 50000);

      expect(result.dangerScore).toBeGreaterThanOrEqual(50);
      expect(result.locksDetectedJson).toContain("AccessExclusiveLock");
      expect(result.dangerReason).toContain("invalidates dependent queries");
    });

    it("should assign critical danger score for destructive DROP TABLE or TRUNCATE operations", () => {
      const dropResult = analyzeExplainPlanAndSql("DROP TABLE orders;", null, 10, 100000);
      expect(dropResult.dangerScore).toBeGreaterThanOrEqual(90);
      expect(dropResult.locksDetectedJson).toContain("AccessExclusiveLock");
      expect(dropResult.dangerReason).toContain("Destructive operation");

      const truncateResult = analyzeExplainPlanAndSql("TRUNCATE TABLE audit_logs;", null, 10, 100000);
      expect(truncateResult.dangerScore).toBeGreaterThanOrEqual(90);
    });

    it("should flag ShareLock for CREATE INDEX without CONCURRENTLY", () => {
      const sql = "CREATE INDEX idx_orders_status ON orders(status);";
      const result = analyzeExplainPlanAndSql(sql, null, 40, 100000);

      expect(result.dangerScore).toBeGreaterThanOrEqual(60);
      expect(result.locksDetectedJson).toContain("ShareLock");
      expect(result.dangerReason).toContain("without CONCURRENTLY locks writes");
      expect(result.blastRadiusSentence).toContain("ShareLock");
    });

    it("should reward CREATE INDEX CONCURRENTLY with lower danger score and no ShareLock", () => {
      const sql = "CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);";
      const result = analyzeExplainPlanAndSql(sql, null, 40, 100000);

      expect(result.dangerScore).toBeLessThan(50);
      expect(result.locksDetectedJson).not.toContain("ShareLock");
      expect(result.dangerReason).toContain("safe for concurrent writes");
    });
  });

  describe("EXPLAIN Plan Tree Inspection & Sequential Scans", () => {
    it("should detect Sequential Scan from valid EXPLAIN JSON and add score penalty", () => {
      const mockExplainJson = JSON.stringify([
        {
          Plan: {
            "Node Type": "Seq Scan",
            "Relation Name": "orders",
            "Total Cost": 450.0,
            "Plan Rows": 50000,
          },
          "Execution Time": 85.0,
        },
      ]);

      const sql = "SELECT * FROM orders WHERE total_amount > 150.00;";
      const result = analyzeExplainPlanAndSql(sql, mockExplainJson, 85, 50000);

      expect(result.dangerScore).toBeGreaterThanOrEqual(40);
      expect(result.dangerReason).toContain("Sequential scan detected");
      expect(result.blastRadiusSentence).toContain("Scans all ~50,000 rows");
    });

    it("should detect Nested Loop Sequential Scan in deep plan trees", () => {
      const mockDeepExplainJson = JSON.stringify([
        {
          Plan: {
            "Node Type": "Nested Loop",
            Plans: [
              {
                "Node Type": "Index Scan",
                "Relation Name": "users",
              },
              {
                "Node Type": "Seq Scan",
                "Relation Name": "orders",
              },
            ],
          },
        },
      ]);

      const sql = "SELECT u.email, o.total_amount FROM users u JOIN orders o ON u.id = o.user_id;";
      const result = analyzeExplainPlanAndSql(sql, mockDeepExplainJson, 120, 50000);

      expect(result.dangerScore).toBeGreaterThanOrEqual(45);
      expect(result.dangerReason).toContain("Sequential scan detected");
    });

    it("should score indexed access paths as safe", () => {
      const mockIndexExplainJson = JSON.stringify([
        {
          Plan: {
            "Node Type": "Index Scan",
            "Relation Name": "users",
            "Total Cost": 12.5,
            "Plan Rows": 1,
          },
          "Execution Time": 4.2,
        },
      ]);

      const sql = "SELECT * FROM users WHERE id = 42;";
      const result = analyzeExplainPlanAndSql(sql, mockIndexExplainJson, 4.2, 50000);

      expect(result.dangerScore).toBeLessThan(30);
      expect(result.blastRadiusSentence).toContain("Touches minimal rows");
    });
  });

  describe("Edge Cases & Execution Time Penalties", () => {
    it("should handle null or empty EXPLAIN JSON gracefully without crashing", () => {
      const sql = "SELECT * FROM orders;";
      const resultWithNull = analyzeExplainPlanAndSql(sql, null, 10, 10000);
      expect(resultWithNull).toBeDefined();
      expect(typeof resultWithNull.dangerScore).toBe("number");

      const resultWithEmpty = analyzeExplainPlanAndSql(sql, "", 10, 10000);
      expect(resultWithEmpty).toBeDefined();
      expect(typeof resultWithEmpty.dangerScore).toBe("number");
    });

    it("should handle malformed non-JSON strings gracefully", () => {
      const sql = "SELECT * FROM users;";
      const malformedJson = "{ invalid json content ...";
      const result = analyzeExplainPlanAndSql(sql, malformedJson, 10, 10000);

      expect(result).toBeDefined();
      expect(result.dangerScore).toBeGreaterThanOrEqual(5);
      expect(result.dangerScore).toBeLessThanOrEqual(100);
    });

    it("should penalize high execution times (> 2000ms)", () => {
      const sql = "SELECT * FROM orders WHERE status = 'pending';";
      const resultSlow = analyzeExplainPlanAndSql(sql, null, 2500, 50000);
      const resultFast = analyzeExplainPlanAndSql(sql, null, 50, 50000);

      expect(resultSlow.dangerScore).toBeGreaterThan(resultFast.dangerScore);
      expect(resultSlow.dangerReason).toContain("Long execution time");
    });

    it("should enforce bounds between 5 and 100 on dangerScore", () => {
      const ultraLow = analyzeExplainPlanAndSql("SELECT 1;", null, 0.1, 1);
      expect(ultraLow.dangerScore).toBeGreaterThanOrEqual(5);

      const ultraHigh = analyzeExplainPlanAndSql("DROP TABLE users; ALTER TABLE users ADD COLUMN a INT DEFAULT 1;", null, 5000, 1000000);
      expect(ultraHigh.dangerScore).toBeLessThanOrEqual(100);
    });
  });
});
