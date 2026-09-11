import { Response, Router } from "express";
import { AuthenticatedRequest, requireAuth } from "./auth.middleware";
import { GameService } from "./game.service";

export const gameRouter = Router();

gameRouter.get("/status/:userId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Некорректный ID" });

  try {
    const pet = await GameService.getPetStatus(userId);
    if (!pet) return res.status(404).json({ error: "Пользователь не найден" });

    console.log(`🔎 [LOG STATUS] Юзер ID: ${userId} | Текущие монеты в RETURNING:`, pet.coins);
    res.json([pet]);
  } catch (error) {
    console.error("🚨 Ошибка в /status/:userId:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

gameRouter.post("/feed", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.body.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "userId обязателен" });

  try {
    const result = await GameService.feedPet(userId);
    if (result.error) return res.status(result.status).json({ error: result.error });

    res.json({ message: "Улитка успешно поела!", user: result.data });
  } catch (error) {
    console.error("🚨 Ошибка в /feed:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

gameRouter.get("/pharmacy/coins/:userId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Некорректный ID" });

  try {
    const user = await GameService.getUserCoins(userId);
    if (!user) return res.status(404).json({ error: "Юзер не найден" });

    console.log(`💰 [LOG GET COINS] Юзер ID: ${userId} | Запрос баланса выдал из Базы:`, user.coins);
    res.json({ coins: user.coins });
  } catch (error) {
    console.error("🚨 Ошибка в /pharmacy/coins/:userId:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

gameRouter.post("/pharmacy/action", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { userId, actionType, total } = req.body;
  if (!userId || !actionType) return res.status(400).json({ error: "Не все параметры переданы" });

  try {
    console.log(`🛒 [LOG ACTION START] Юзер ID: ${userId} | Действие: ${actionType}`);

    const result = await GameService.handleGameAction(Number(userId), actionType, total);
    if (result.error) return res.status(result.status).json({ error: result.error });
    if (!result.data) return res.status(404).json({ error: "Юзер не найден" });

    console.log(`💸 [LOG ACTION END] Баланс ПОСЛЕ UPDATE в базе стал:`, result.data.coins);
    res.json({ coins: result.data.coins });
  } catch (error) {
    console.error("🚨 Ошибка в /pharmacy/action:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
