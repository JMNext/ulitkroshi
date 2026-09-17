import { Router } from "express";
import { requireAuth } from "./auth.middleware";
import { GameService } from "./game.service";

export const gameRouter = Router();

gameRouter.get("/pharmacy/status/:userId", requireAuth, async (req: any, res: any) => {
  try {
    const userId = Number(req.user.id);
    const status = await GameService.getPetStatus(userId);
    if (!status) return res.status(404).json({ error: "Статус не найден" });
    return res.json(status);
  } catch (error) {
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

gameRouter.post("/pharmacy/feed", requireAuth, async (req: any, res: any) => {
  try {
    const userId = Number(req.user.id);
    const result = await GameService.feedPet(userId);
    if ("error" in result) return res.status(result.status).json({ error: result.error });
    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

gameRouter.get("/pharmacy/coins/:userId", requireAuth, async (req: any, res: any) => {
  try {
    const userId = Number(req.user.id);
    const result = await GameService.getUserCoins(userId);
    if (!result) return res.status(404).json({ error: "Пользователь не найден" });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

gameRouter.post("/pharmacy/action", requireAuth, async (req: any, res: any) => {
  try {
    const userId = Number(req.user.id);
    const { actionType, total } = req.body;
    const result = await GameService.handleGameAction(userId, actionType, total !== undefined ? Number(total) : undefined);
    if ("error" in result) return res.status(result.status).json({ error: result.error });
    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});
