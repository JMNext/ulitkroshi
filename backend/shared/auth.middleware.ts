import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { dbPool } from "./db";
import { AuthenticatedRequest } from "./types";
import { getFirstRow } from "./utils";

export const JWT_SECRET = "snail_game_super_secret_secure_key_2026";

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ error: "Токен отсутствует." });
    }

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS public.token_blacklist (
        token TEXT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const blacklistCheck = await dbPool.query(
      "SELECT token FROM public.token_blacklist WHERE token = \$1",
      [token]
    );

    if (blacklistCheck.rows.length > 0) {
      return res.status(401).json({ error: "Сессия отозвана. Войдите заново." });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; name: string };

    const userCheck = await dbPool.query("SELECT id, name FROM users WHERE id = \$1", [decoded.id]);
    const dbUser = getFirstRow(userCheck);

    if (!dbUser) {
      return res.status(401).json({ error: "Пользователь не найден." });
    }

    req.user = { id: Number(dbUser.id), name: dbUser.name || `Player_${dbUser.id}` };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Сессия истекла. Войдите заново." });
  }
};
