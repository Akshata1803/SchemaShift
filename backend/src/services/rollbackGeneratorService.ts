export function generateRollbackScript(sql: string): string {
  const sqlClean = sql.trim().replace(/;$/, "");

  // 1. CREATE INDEX [CONCURRENTLY] idx_name ON table(col)
  const idxMatch = sqlClean.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:CONCURRENTLY\s+)?(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_]+)/i);
  if (idxMatch) {
    const idxName = idxMatch[1];
    return `-- Rollback Migration for ${idxName}\nDROP INDEX CONCURRENTLY IF EXISTS ${idxName};`;
  }

  // 2. ALTER TABLE table_name ADD COLUMN col_name data_type
  const addColMatch = sqlClean.match(/ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+ADD\s+(?:COLUMN\s+)?([a-zA-Z0-9_]+)/i);
  if (addColMatch) {
    const tblName = addColMatch[1];
    const colName = addColMatch[2];
    return `-- Rollback Migration: Drop added column\nALTER TABLE ${tblName} DROP COLUMN IF EXISTS ${colName};`;
  }

  // 3. ALTER TABLE table_name DROP COLUMN col_name
  const dropColMatch = sqlClean.match(/ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+DROP\s+(?:COLUMN\s+)?([a-zA-Z0-9_]+)/i);
  if (dropColMatch) {
    const tblName = dropColMatch[1];
    const colName = dropColMatch[2];
    return `-- Rollback Migration: Restore dropped column\nALTER TABLE ${tblName} ADD COLUMN ${colName} VARCHAR(255);`;
  }

  // 4. CREATE TABLE table_name
  const createTblMatch = sqlClean.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
  if (createTblMatch) {
    const tblName = createTblMatch[1];
    return `-- Rollback Migration: Drop created table\nDROP TABLE IF EXISTS ${tblName} CASCADE;`;
  }

  return `-- Generic Migration Rollback Template\n-- Revert changes for:\n-- ${sqlClean}\n\nBEGIN;\n-- Add inverse DDL statements here\nCOMMIT;`;
}
