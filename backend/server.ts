import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { dbPool, initDatabase } from "./shared/db";
import { authRouter } from "./auth-service/auth.router";
import { gameRouter } from "./game-service/game.router";
import { requireAuth } from "./shared/auth.middleware";
import { AuthenticatedRequest } from "./shared/types";
import * as service from "./game-service/game.service";

const app = express();
const PORT = Number(process.env.SERVER_PORT) || 3005;

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ЖЕЛЕЗОБЕТОННЫЙ МОСТ: Ловим GET-запрос, который Nginx никогда не заблокирует, и пишем монеты напрямую в базу!
app.get("/game/pharmacy/action", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  const id = Number(req.user?.id);
  if (!id) return res.status(401).json({ error: "Не авторизован" });

  const actionType = String(req.query?.actionType || "mini_game_reward").trim();
  const rawTotal = req.query?.total;
  const total = rawTotal !== undefined && rawTotal !== null ? Number(rawTotal) : 0;

  const resData = await service.handleGameAction(id, actionType, total);
  if (resData && "error" in resData) return res.status(resData.status || 400).json({ error: resData.error });

  res.json(resData);
});

app.use("/auth", authRouter);
app.use("/game", gameRouter);
app.use("/api-game", gameRouter);
app.use("/api/v1", gameRouter);

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
