import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sandboxRouter } from "./routes/sandboxRoutes";
import { historyRouter } from "./routes/historyRoutes";
import { authRouter } from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({
    app: "SchemaShift API",
    status: "operational",
    stack: "Node.js / Express / Prisma / Dockerode",
    concept: "terrarium",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/sandbox", sandboxRouter);
app.use("/api/history", historyRouter);

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`   SchemaShift Node/Express Server running        `);
  console.log(`   URL: http://localhost:${PORT}                   `);
  console.log(`==================================================`);
});
