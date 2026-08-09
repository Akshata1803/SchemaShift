export interface AnalysisResult {
  dangerScore: number;
  dangerReason: string;
  locksDetectedJson: string;
  blastRadiusSentence: string;
}

export function analyzeExplainPlanAndSql(
  sql: string,
  explainJsonStr: string | null,
  executionTimeMs: number,
  seedRowCount: number
): AnalysisResult {
  const sqlUpper = sql.toUpperCase().trim();
  let dangerScore = 10;
  const reasons: string[] = [];
  const locksDetected: string[] = [];

  let affectedTable = "target table";
  const tableMatch = sql.match(/(?:FROM|UPDATE|INTO|TABLE|JOIN)\s+([a-zA-Z0-9_]+)/i);
  if (tableMatch) {
    affectedTable = tableMatch[1];
  }

  // 1. Lock Detection
  if (sqlUpper.includes("ALTER TABLE")) {
    if (sqlUpper.includes("ADD COLUMN") && sqlUpper.includes("DEFAULT")) {
      dangerScore += 45;
      locksDetected.push("AccessExclusiveLock");
      reasons.push(`Adding a column with DEFAULT forces a full table rewrite on \`${affectedTable}\` under AccessExclusiveLock.`);
    } else if (sqlUpper.includes("DROP COLUMN")) {
      dangerScore += 40;
      locksDetected.push("AccessExclusiveLock");
      reasons.push(`Dropping a column from \`${affectedTable}\` takes AccessExclusiveLock and invalidates dependent queries.`);
    } else {
      dangerScore += 30;
      locksDetected.push("AccessExclusiveLock");
      reasons.push(`DDL modification on \`${affectedTable}\` requires exclusive table-level locking.`);
    }
  }

  if (sqlUpper.includes("CREATE INDEX") && !sqlUpper.includes("CONCURRENTLY")) {
    dangerScore += 55;
    locksDetected.push("ShareLock");
    reasons.push(`Building index on \`${affectedTable}\` without CONCURRENTLY locks writes to the table for the entire build duration.`);
  } else if (sqlUpper.includes("CREATE INDEX CONCURRENTLY")) {
    dangerScore += 15;
    reasons.push(`Index built concurrently on \`${affectedTable}\` — safe for concurrent writes.`);
  }

  if (sqlUpper.includes("DROP TABLE") || sqlUpper.includes("TRUNCATE")) {
    dangerScore += 90;
    locksDetected.push("AccessExclusiveLock");
    reasons.push(`Destructive operation: permanently removes or truncates \`${affectedTable}\`.`);
  }

  // 2. EXPLAIN Tree Inspection
  let seqScanDetected = false;
  if (explainJsonStr) {
    try {
      const parsed = JSON.parse(explainJsonStr);
      const rootPlan = Array.isArray(parsed) && parsed.length > 0 ? parsed[0].Plan : parsed.Plan || parsed;
      seqScanDetected = inspectPlanNode(rootPlan);
    } catch (e) {
      // Fallback inspection
    }
  }

  if (seqScanDetected || (sqlUpper.startsWith("SELECT *") && sqlUpper.includes("WHERE") && !sqlUpper.includes("ID ="))) {
    dangerScore += 35;
    reasons.push(`Sequential scan detected on \`${affectedTable}\` scanning ~${seedRowCount.toLocaleString()} rows without an index.`);
  }

  if (executionTimeMs > 2000) {
    dangerScore += 30;
    reasons.push(`Long execution time of ${(executionTimeMs / 1000).toFixed(2)} seconds in isolation sandbox.`);
  } else if (executionTimeMs > 500) {
    dangerScore += 15;
    reasons.push(`Execution time of ${executionTimeMs.toFixed(1)}ms could degrade high-concurrency production connection pools.`);
  }

  dangerScore = Math.min(100, Math.max(5, dangerScore));
  if (reasons.length === 0) {
    reasons.push(`Query executed efficiently in ${executionTimeMs.toFixed(1)}ms using indexed access paths.`);
  }

  // Blast Radius Plain-English Impact Sentence
  const lockDesc = locksDetected.length > 0 ? locksDetected.join(", ") : "RowLocks";
  const estLockSec = (Math.max(0.5, executionTimeMs / 100.0)).toFixed(1);

  let blastRadiusSentence = "";
  if (locksDetected.includes("AccessExclusiveLock") || locksDetected.includes("ShareLock")) {
    blastRadiusSentence = `Locks the \`${affectedTable}\` table (~${seedRowCount.toLocaleString()} rows) for approximately ${estLockSec} seconds with ${lockDesc}, blocking concurrent traffic.`;
  } else if (seqScanDetected) {
    blastRadiusSentence = `Scans all ~${seedRowCount.toLocaleString()} rows of \`${affectedTable}\` sequentially, consuming high CPU and I/O bandwidth.`;
  } else {
    blastRadiusSentence = `Touches minimal rows on \`${affectedTable}\` with fast index lookup (~${executionTimeMs.toFixed(1)}ms total lock duration).`;
  }

  return {
    dangerScore,
    dangerReason: reasons.join(" • "),
    locksDetectedJson: JSON.stringify(locksDetected),
    blastRadiusSentence,
  };
}

function inspectPlanNode(node: any): boolean {
  if (!node) return false;
  let hasSeq = node["Node Type"] && String(node["Node Type"]).includes("Seq Scan");
  if (Array.isArray(node.Plans)) {
    for (const child of node.Plans) {
      if (inspectPlanNode(child)) hasSeq = true;
    }
  }
  return hasSeq;
}
