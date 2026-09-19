import cors from "cors";
import express from "express";
import { authRouter } from "./auth.router";
import { gameRouter } from "./game.router";
import { dbPool, initDatabase } from "./db/db";

const serverApp = express();
const SERVER_PORT = Number(process.env.PORT) || 3001;

serverApp.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

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
    await initDatabase();

    serverApp.listen(SERVER_PORT, "0.0.0.0", () => {});
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ [SERVER] Ошибка при старте сервера Улиткрошей:", error.message);
    } else {
      console.error("❌ [SERVER] Неизвестная ошибка при старте сервера Улиткрошей:", error);
    }
  }
}

startServer();
