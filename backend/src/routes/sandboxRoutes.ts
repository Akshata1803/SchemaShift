import { Router } from "express";
import { runMigrationTest, compareSqlExecutions, getSyntheticSchemaInfo } from "../services/sandboxService";

export const sandboxRouter = Router();

sandboxRouter.post("/test", async (req, res) => {
  try {
    const { sql, target_seed_rows } = req.body;
    if (!sql || !sql.trim()) {
      return res.status(400).json({ error: "SQL script cannot be empty." });
    }

    const result = await runMigrationTest(sql, target_seed_rows);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Sandbox execution error." });
  }
});

sandboxRouter.post("/compare", async (req, res) => {
  try {
    const { original_sql, rewritten_sql, target_seed_rows } = req.body;
    if (!original_sql || !rewritten_sql) {
      return res.status(400).json({ error: "Both original_sql and rewritten_sql are required." });
    }

    const result = await compareSqlExecutions(original_sql, rewritten_sql, target_seed_rows);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Comparison execution error." });
  }
});

sandboxRouter.get("/schema", async (req, res) => {
  try {
    const schema = await getSyntheticSchemaInfo();
    return res.json(schema);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load schema." });
  }
});
