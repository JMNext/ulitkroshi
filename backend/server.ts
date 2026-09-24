import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { dbPool, initDatabase } from "./shared/db";
import { authRouter } from "./auth-service/auth.router";
import { gameRouter } from "./game-service/game.router";

const app = express();
const PORT = Number(process.env.SERVER_PORT) || 3005;

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.text({ type: ["text/plain", "application/json"] }));
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  if (typeof req.body === "string") {
    try { req.body = JSON.parse(req.body); } catch {}
  }
  next();
});

app.use("/auth", authRouter);
app.use("/game", gameRouter);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Единый монолитный сервер Улиткрошей успешно запущен! 🐌🔑" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

async function startServer(): Promise<void> {
  try {
    await dbPool.query("SELECT NOW()");
    await initDatabase();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[БЭКЕНД] Единый монолитный сервер запущен на порту ${PORT}! 🐌🔑`);
    });
  } catch (error: any) {
    console.error(error?.message || error);
    process.exit(1);
  }
}

startServer();
