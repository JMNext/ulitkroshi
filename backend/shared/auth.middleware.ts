import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { dbPool } from "./db";
import { AuthenticatedRequest } from "./types";
import { getFirstRow } from "./utils";

export const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123_sigmarillion";

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Токен отсутствует." });

    const bl = await dbPool.query("SELECT token FROM public.token_blacklist WHERE token = \$1", [token]);
    if (bl.rows.length) return res.status(401).json({ error: "Сессия отозвана. Войдите заново." });

    const dec = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = getFirstRow(await dbPool.query("SELECT * FROM users WHERE id = \$1", [dec.id]));
    if (!user) return res.status(401).json({ error: "Пользователь не найден." });

    req.user = {
      id: Number(user.id),
      name: String(user.player_name || `Player_${user.id}`),
      ...user
    };
    next();
  } catch {
    return res.status(401).json({ error: "Сессия истекла. Войдите заново." });
  }
};
