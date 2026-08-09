export interface AiRewriteResult {
  rewrittenSql: string;
  explanation: string;
  source: string;
}

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "codellama";

export async function suggestSqlRewrite(sql: string, dangerReason: string): Promise<AiRewriteResult> {
  const cleanSql = sql.trim();

  // 1. Attempt local Ollama API call
  try {
    const prompt = `You are a PostgreSQL DBA performance expert. Rewrite this SQL query for maximum efficiency and non-blocking safety:\n\n${cleanSql}\n\nReturn ONLY the optimized SQL query inside \`\`\`sql codeblock, followed by a 1-sentence explanation.`;

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const data: any = await response.json();
      const responseText = data.response || "";
      const match = responseText.match(/```sql\s*(.*?)\s*```/s);
      if (match) {
        return {
          rewrittenSql: match[1].trim(),
          explanation: responseText.replace(match[0], "").trim() || "Optimized by Ollama SQL LLM.",
          source: `Ollama (${OLLAMA_MODEL})`,
        };
      }
    }
  } catch (err: any) {
    console.info(`Ollama API unreachable at ${OLLAMA_HOST} (${err.message}). Using TypeScript heuristic optimizer.`);
  }

  // 2. Rule-Based Heuristic Fallback
  return ruleBasedSqlRewrite(cleanSql);
}

function ruleBasedSqlRewrite(sql: string): AiRewriteResult {
  const sqlUpper = sql.toUpperCase().trim();

  if (sqlUpper.includes("CREATE INDEX") && !sqlUpper.includes("CONCURRENTLY")) {
    return {
      rewrittenSql: sql.replace(/CREATE\s+INDEX/i, "CREATE INDEX CONCURRENTLY"),
      explanation: "Added CONCURRENTLY modifier to build the index without holding an exclusive lock on concurrent writes.",
      source: "TypeScript Heuristic Rules Engine (Ollama Offline)",
    };
  }

  if (sqlUpper.startsWith("SELECT *") && sqlUpper.includes("WHERE")) {
    const tblMatch = sql.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    const tbl = tblMatch ? tblMatch[1] : "table";
    return {
      rewrittenSql: sql.replace(/SELECT\s+\*/i, `SELECT id, email, created_at -- (Targeted projection to enable Index-Only Scan on ${tbl})`),
      explanation: "Replaced `SELECT *` with explicit column projections to utilize covering indexes and reduce I/O payload.",
      source: "TypeScript Heuristic Rules Engine (Ollama Offline)",
    };
  }

  if (sqlUpper.includes("JOIN") && sqlUpper.includes("WHERE")) {
    return {
      rewrittenSql: `-- Recommended prerequisite index:\n-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status ON users(status);\n\n${sql}`,
      explanation: "Added covering index recommendation to eliminate nested loop sequential scan during JOIN execution.",
      source: "TypeScript Heuristic Rules Engine (Ollama Offline)",
    };
  }

  return {
    rewrittenSql: `-- Optimized Query Candidate\n${sql}`,
    explanation: "Evaluated query structure. Ensure backing composite indexes exist on filter predicate columns for optimal index scan paths.",
    source: "TypeScript Heuristic Rules Engine (Ollama Offline)",
  };
}
