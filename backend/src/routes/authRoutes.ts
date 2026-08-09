import { Router } from "express";
import { registerUser, loginUser } from "../services/authService";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ detail: "Email and password are required." });
    }
    const tokenData = await registerUser(email, password);
    return res.json(tokenData);
  } catch (err: any) {
    return res.status(400).json({ detail: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ detail: "Email and password are required." });
    }
    const tokenData = await loginUser(email, password);
    return res.json(tokenData);
  } catch (err: any) {
    return res.status(401).json({ detail: err.message });
  }
});
