import { PrismaClient } from "@prisma/client";
import { DockerodeSandboxEngine } from "../sandbox/dockerodeEngine";
import { suggestSqlRewrite } from "./aiOptimizerService";
import { verifyCorrectness } from "./correctnessVerifierService";
import { generateRollbackScript } from "./rollbackGeneratorService";

const prisma = new PrismaClient();
const sandboxEngine = new DockerodeSandboxEngine();

export async function runMigrationTest(sqlScript: string, targetSeedRows: number = 10000, userId?: string) {
  const cleanSql = sqlScript.trim();
  const seedRows = targetSeedRows || 10000;

  // 1. Create TestRun record
  const testRun = await prisma.testRun.create({
    data: {
      userId: userId || null,
      sqlSubmitted: cleanSql,
      status: "running",
    },
  });

  try {
    // 2. Provision Isolated Sandbox & Run Test
    const sandboxRes = await sandboxEngine.runSandboxTest(cleanSql, seedRows);

    const dangerScore = sandboxRes.dangerScore;
    const runStatus = dangerScore >= 60 ? "dangerous" : dangerScore >= 30 ? "warning" : "safe";

    await prisma.testRun.update({
      where: { id: testRun.id },
      data: { status: runStatus },
    });

    // 3. Save TestResult record
    await prisma.testResult.create({
      data: {
        testRunId: testRun.id,
        executionTimeMs: sandboxRes.executionTimeMs,
        dangerScore,
        dangerReason: sandboxRes.dangerReason,
        locksDetected: sandboxRes.locksDetected,
        rowsAffected: sandboxRes.rowsAffected,
        explainPlanJson: sandboxRes.explainPlanJson,
        blastRadiusSentence: sandboxRes.blastRadiusSentence,
      },
    });

    // 4. Generate AI Query Rewrite & Correctness Verification
    const aiRes = await suggestSqlRewrite(cleanSql, sandboxRes.dangerReason);
    const verifRes = await verifyCorrectness(cleanSql, aiRes.rewrittenSql);

    await prisma.rewriteComparison.create({
      data: {
        testRunId: testRun.id,
        rewrittenSql: aiRes.rewrittenSql,
        originalResultHash: verifRes.originalResultHash,
        rewrittenResultHash: verifRes.rewrittenResultHash,
        resultsMatch: verifRes.resultsMatch,
        explanation: aiRes.explanation,
      },
    });

    // 5. Generate Rollback Script
    const rollbackSql = generateRollbackScript(cleanSql);
    await prisma.rollbackScript.create({
      data: {
        testRunId: testRun.id,
        generatedRollbackSql: rollbackSql,
      },
    });

    return {
      run_id: testRun.id,
      status: runStatus,
      sql_submitted: cleanSql,
      execution_time_ms: sandboxRes.executionTimeMs,
      danger_score: dangerScore,
      danger_reason: sandboxRes.dangerReason,
      locks_detected: sandboxRes.locksDetected,
      blast_radius_sentence: sandboxRes.blastRadiusSentence,
      explain_plan_json: sandboxRes.explainPlanJson,
      engine: sandboxRes.engine,
      ai_rewrite: {
        rewritten_sql: aiRes.rewrittenSql,
        explanation: aiRes.explanation,
        results_match: verifRes.resultsMatch,
        original_hash: verifRes.originalResultHash,
        rewritten_hash: verifRes.rewrittenResultHash,
        source: aiRes.source,
      },
      rollback_sql: rollbackSql,
    };
  } catch (err: any) {
    await prisma.testRun.update({
      where: { id: testRun.id },
      data: { status: "failed" },
    });
    throw new Error(`Sandbox Execution Error: ${err.message}`);
  }
}

export async function compareSqlExecutions(originalSql: string, rewrittenSql: string, targetSeedRows: number = 10000) {
  const originalRes = await sandboxEngine.runSandboxTest(originalSql, targetSeedRows);
  const rewrittenRes = await sandboxEngine.runSandboxTest(rewrittenSql, targetSeedRows);

  const speedupFactor = Number((originalRes.executionTimeMs / (rewrittenRes.executionTimeMs || 1)).toFixed(1));

  return {
    original: {
      sql: originalSql,
      executionTimeMs: originalRes.executionTimeMs,
      dangerScore: originalRes.dangerScore,
      locksDetected: originalRes.locksDetected,
      blastRadius: originalRes.blastRadiusSentence,
    },
    rewritten: {
      sql: rewrittenSql,
      executionTimeMs: rewrittenRes.executionTimeMs,
      dangerScore: rewrittenRes.dangerScore,
      locksDetected: rewrittenRes.locksDetected,
      blastRadius: rewrittenRes.blastRadiusSentence,
    },
    metrics: {
      speedupFactor: speedupFactor > 0 ? speedupFactor : 1.0,
      timeSavedMs: Math.max(0, Number((originalRes.executionTimeMs - rewrittenRes.executionTimeMs).toFixed(2))),
      dangerScoreDrop: originalRes.dangerScore - rewrittenRes.dangerScore,
    },
  };
}

export async function getSyntheticSchemaInfo() {
  return {
    tables: [
      {
        name: "users",
        rowCount: "~50,000",
        columns: [
          { name: "id", type: "BIGSERIAL PRIMARY KEY" },
          { name: "email", type: "VARCHAR(255) UNIQUE NOT NULL" },
          { name: "full_name", type: "VARCHAR(255)" },
          { name: "role", type: "VARCHAR(50) DEFAULT 'user'" },
          { name: "status", type: "VARCHAR(50) DEFAULT 'active'" },
          { name: "created_at", type: "TIMESTAMPTZ DEFAULT NOW()" },
        ],
        indexes: ["users_pkey (id)", "users_email_key (email)"],
        sampleRows: [
          { id: 1, email: "alex.dev@terrarium.io", full_name: "Alex Dev", role: "admin", status: "active", created_at: "2026-01-15T08:30:00Z" },
          { id: 2, email: "sarah.lead@terrarium.io", full_name: "Sarah Lead", role: "developer", status: "active", created_at: "2026-01-16T11:20:00Z" },
        ],
      },
      {
        name: "orders",
        rowCount: "~100,000",
        columns: [
          { name: "id", type: "BIGSERIAL PRIMARY KEY" },
          { name: "user_id", type: "BIGINT REFERENCES users(id)" },
          { name: "order_number", type: "VARCHAR(100) UNIQUE NOT NULL" },
          { name: "total_amount", type: "NUMERIC(12,2)" },
          { name: "status", type: "VARCHAR(50)" },
          { name: "created_at", type: "TIMESTAMPTZ DEFAULT NOW()" },
        ],
        indexes: ["orders_pkey (id)", "orders_order_number_key (order_number)"],
        sampleRows: [
          { id: 1, user_id: 1, order_number: "ORD-2026-90412", total_amount: 249.99, status: "completed", created_at: "2026-02-01T14:05:00Z" },
          { id: 2, user_id: 2, order_number: "ORD-2026-90413", total_amount: 89.50, status: "pending", created_at: "2026-02-02T09:12:00Z" },
        ],
      },
      {
        name: "order_items",
        rowCount: "~250,000",
        columns: [
          { name: "id", type: "BIGSERIAL PRIMARY KEY" },
          { name: "order_id", type: "BIGINT REFERENCES orders(id)" },
          { name: "product_name", type: "VARCHAR(255)" },
          { name: "quantity", type: "INTEGER" },
          { name: "unit_price", type: "NUMERIC(10,2)" },
        ],
        indexes: ["order_items_pkey (id)"],
        sampleRows: [
          { id: 1, order_id: 1, product_name: "PostgreSQL Optimizer Guide", quantity: 1, unit_price: 49.99 },
          { id: 2, order_id: 1, product_name: "Terrarium Glass Dome", quantity: 2, unit_price: 100.00 },
        ],
      },
    ],
  };
}

export async function getRecentTestHistory(limit: number = 20) {
  const runs = await prisma.testRun.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { result: true },
  });

  return runs.map((r) => ({
    run_id: r.id,
    sql: r.sqlSubmitted,
    status: r.status,
    created_at: r.createdAt.toISOString(),
    danger_score: r.result?.dangerScore || 0,
    danger_reason: r.result?.dangerReason || "",
    execution_time_ms: r.result?.executionTimeMs || 0,
    blast_radius: r.result?.blastRadiusSentence || "",
  }));
}

export async function getDangerScoreTrends() {
  const runs = await prisma.testRun.findMany({
    orderBy: { createdAt: "asc" },
    take: 30,
    include: { result: true },
  });

  return runs.map((r) => ({
    timestamp: r.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    run_id: r.id,
    danger_score: r.result?.dangerScore || 0,
    status: r.status,
    execution_time_ms: r.result?.executionTimeMs || 0,
  }));
}
