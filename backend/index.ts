import cors from "cors";
import express from "express";
import { authRouter } from "./auth.router";
import { dbPool, initDatabase } from "./db";
import { gameRouter } from "./game.router";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

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
app.use("/game", gameRouter);

app.get("/", (_req, res) => {
  res.json({ message: "Главный шлюз Улиткрошей работает! 🐌" });
});

async function startServer() {
  try {
    // ШАГ 1: Проверяем физическую связь с базой данных
    await dbPool.query("SELECT NOW()");
    console.log("🚀 [SERVER] Успешное подключение к PostgreSQL пулу Улиткрошей!");

    // ШАГ 2: СТРОГО СНАЧАЛА создаем таблицу в базе, если её нет!
    await initDatabase();
    console.log("✅ [SERVER] Таблица пользователей гарантированно создана в PostgreSQL.");

    // ШАГ 3: И только после этого открываем порты для фронтенда!
    app.listen(PORT, () => {
      console.log(`🎉 [SERVER] Экспресс-сервер Улиткрошей запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error("❌ [SERVER] Ошибка при старте сервера Улиткрошей:", error);
  }
}

startServer();
