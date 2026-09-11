import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { dbPool } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_123";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string;
    is_suspended: boolean;
  };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ error: "🔒 Доступ запрещен. Токен отсутствует." });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; name: string };

    const userCheck = await dbPool.query("SELECT id, name, is_suspended FROM users WHERE id = $1", [decoded.id]);
    if (!userCheck.rows.length) {
      return res.status(401).json({ error: "Пользователь не найден." });
    }

    const dbUser = userCheck.rows[0];
    if (dbUser.is_suspended) {
      return res.status(403).json({ error: "🚫 Ваш аккаунт временно заблокирован администрацией." });
    }

    req.user = {
      id: dbUser.id,
      name: dbUser.name,
      is_suspended: dbUser.is_suspended
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Сессия истекла. Войдите заново." });
  }
};
