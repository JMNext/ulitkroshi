import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { authRouter } from "./auth.router";
import { dbPool, initDatabase } from "../shared/db";

const app = express();
const PORT = Number(process.env.AUTH_PORT) || 3001;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.text({ type: ["text/plain", "application/json"] }));
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  if (typeof req.body === "string") {
    try {
      req.body = JSON.parse(req.body);
    } catch {}
  }
  next();
});

app.use("/auth", authRouter);

app.get("/", (_req, res) => {
  res.json({ message: "Микросервис авторизации Улиткрошей работает! 🔑" });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("🚨 [AUTH SERVICE CRITICAL ERROR]:", err.message || err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

async function startServer() {
  try {
    await dbPool.query("SELECT NOW()");
    await initDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 [AUTH SERVICE] Запущен на порту ${PORT}`);
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ [AUTH SERVICE] Ошибка при старте:", error.message);
    }
  }
}

startServer();
