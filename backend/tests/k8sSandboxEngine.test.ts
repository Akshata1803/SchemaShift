import { K8sSandboxEngine } from "../src/sandbox/k8sSandboxEngine";

describe("K8sSandboxEngine Unit Tests", () => {
  let engine: K8sSandboxEngine;

  beforeEach(() => {
    engine = new K8sSandboxEngine("test-sandboxes");
  });

  it("should initialize with specified or default namespace", () => {
    expect(engine).toBeDefined();
  });

  it("should execute SELECT query test and return structured explain plan", async () => {
    const query = "SELECT * FROM orders WHERE total_amount > 150.00;";
    const result = await engine.runSandboxTest(query, 10000);

    expect(result.status).toBe("success");
    expect(result.dangerScore).toBeGreaterThanOrEqual(10);
    expect(result.engine).toContain("kubernetes_pod_postgres_16");
    expect(result.explainPlanJson).toBeDefined();

    const plan = JSON.parse(result.explainPlanJson);
    expect(Array.isArray(plan)).toBe(true);
    expect(plan[0].Plan["Node Type"]).toContain("Scan");
  });

  it("should execute DDL statements and generate migration execution plan", async () => {
    const ddl = "ALTER TABLE users ADD COLUMN bio TEXT DEFAULT 'Engineer';";
    const result = await engine.runSandboxTest(ddl, 50000);

    expect(result.status).toBe("success");
    expect(result.dangerScore).toBeGreaterThanOrEqual(40);
    expect(result.locksDetected).toContain("AccessExclusiveLock");
    expect(result.blastRadiusSentence).toContain("users");
  });
});
