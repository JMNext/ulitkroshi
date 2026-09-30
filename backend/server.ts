import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { dbPool, initDatabase } from "./shared/db";
import { authRouter } from "./auth-service/auth.router";
import { gameRouter } from "./game-service/game.router";
import growthRouter from "./game-service/growth.router";

const app = express();
const PORT = Number(process.env.SERVER_PORT) || 3005;

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/game", gameRouter);
app.use("/game", growthRouter);

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
