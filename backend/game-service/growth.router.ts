/**
 * growth.router.ts — Роутер начисления XP (серверная авторитетность).
 *
 * POST /game/xp/gain — начислить XP за действие ухода или мини-игру
 */

import { Router, Response } from "express";
import { requireAuth } from "../shared/auth.middleware";
import { AuthenticatedRequest } from "../shared/types";
import { gainXp, XpAction } from "./growth.service";

const router = Router();

const VALID_ACTIONS: XpAction[] = ["feed", "wash", "sleep", "play", "mini_game", "daily_login"];

// POST /game/xp/gain
router.post("/xp/gain", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user?.id);
  if (!userId) return res.status(401).json({ error: "Не авторизован" });

  const { action, petIndex, miniGameScore } = req.body;

  // Валидация действия
  if (!VALID_ACTIONS.includes(action)) {
    return res.status(400).json({
      error: `Недопустимое действие. Допустимые: ${VALID_ACTIONS.join(", ")}`,
    });
  }

  // Валидация petIndex
  if (typeof petIndex !== "number" || petIndex < 0 || !Number.isInteger(petIndex)) {
    return res.status(400).json({ error: "petIndex должен быть неотрицательным целым числом" });
  }

  // Валидация miniGameScore
  if (action === "mini_game" && miniGameScore !== undefined) {
    if (typeof miniGameScore !== "number" || miniGameScore < 0) {
      return res.status(400).json({ error: "miniGameScore должен быть неотрицательным числом" });
    }
  }

  try {
    const result = await gainXp(userId, petIndex, action, miniGameScore);
    return res.json(result);
  } catch (err) {
    console.error("[growth.router] Ошибка начисления XP:", err);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

export default router;
