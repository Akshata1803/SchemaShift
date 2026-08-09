import { Router } from "express";
import { getRecentTestHistory, getDangerScoreTrends } from "../services/sandboxService";

export const historyRouter = Router();

historyRouter.get("/", async (req, res) => {
  try {
    const history = await getRecentTestHistory();
    return res.json(history);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

historyRouter.get("/trends", async (req, res) => {
  try {
    const trends = await getDangerScoreTrends();
    return res.json(trends);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});
