import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import { dbPool } from "./db/db";
import { AuthenticatedRequest } from "./types/express";

const JWT_SECRET = "snail_game_super_secret_secure_key_2026";

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ error: "Токен отсутствует." });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; name: string };
    const userCheck = await dbPool.query("SELECT id, name, is_suspended FROM users WHERE id = $1", [decoded.id]);

    if (!userCheck.rows || userCheck.rows.length === 0) {
      return res.status(401).json({ error: "Пользователь не найден." });
    }

    const dbUser = userCheck.rows[0];

    if (dbUser.is_suspended) {
      return res.status(403).json({ error: "Аккаунт заблокирован." });
    }

    req.user = { id: Number(dbUser.id), name: dbUser.name || "Игрок" };
    next();
  } catch {
    return res.status(401).json({ error: "Сессия истекла. Войдите заново." });
  }
};
