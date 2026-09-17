import cors from "cors";
import express from "express";
import { authRouter } from "./auth.router/auth.router";
import { dbPool, initDatabase } from "./db/db";
import { gameRouter } from "./game.router";

const serverApp = express();
const SERVER_PORT = process.env.PORT || 3001;

serverApp.use(cors());
serverApp.use(express.json());
serverApp.use(express.text({ type: ["text/plain", "application/json"] }));
serverApp.use(express.urlencoded({ extended: true }));

serverApp.use((req, _res, next) => {
  if (typeof req.body === "string") {
    try {
      req.body = JSON.parse(req.body);
    } catch {}
  }
  next();
});

serverApp.use("/auth", authRouter);
serverApp.use("/game", gameRouter);

serverApp.get("/", (_req, res) => {
  res.json({ message: "Главный шлюз Улиткрошей работает! 🐌" });
});

async function startServer() {
  try {
    await dbPool.query("SELECT NOW()");
    console.log("🚀 [SERVER] Успешное подключение к PostgreSQL пулу Улиткрошей!");

    await initDatabase();
    console.log("✅ [SERVER] Таблица пользователей гарантированно создана в PostgreSQL.");

    serverApp.listen(SERVER_PORT, () => {
      console.log(`🎉 [SERVER] Экспресс-сервер Улиткрошей запущен на порту ${SERVER_PORT}`);
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ [SERVER] Ошибка при старте сервера Улиткрошей:", error.message);
    } else {
      console.error("❌ [SERVER] Неизвестная ошибка при старте сервера Улиткрошей:", error);
    }
  }
}

startServer();
