import { Response, Router, RequestHandler } from "express";
import { requireAuth } from "../shared/auth.middleware";
import { GameService } from "./game.service";
import { AuthenticatedRequest } from "../shared/types";

export const gameRouter = Router();

gameRouter.get("/pharmacy/status", requireAuth, (async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user?.id);
  if (!userId) return res.status(401).json({ error: "Не авторизован" });

  const status = await GameService.getPetStatus(userId);
  if (!status) return res.status(404).json({ error: "Статус не найден" });
  return res.json(status);
}) as RequestHandler);

gameRouter.post("/pharmacy/feed", requireAuth, (async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user?.id);
  if (!userId) return res.status(401).json({ error: "Не авторизован" });

  const result = await GameService.feedPet(userId);
  if ("error" in result) return res.status(result.status).json({ error: result.error });
  return res.json(result.data);
}) as RequestHandler);

gameRouter.get("/pharmacy/coins", requireAuth, (async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user?.id);
  if (!userId) return res.status(401).json({ error: "Не авторизован" });

  const result = await GameService.getUserCoins(userId);
  if (!result) return res.status(404).json({ error: "Пользователь не найден" });
  return res.json(result);
}) as RequestHandler);

gameRouter.post("/pharmacy/action", requireAuth, (async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user?.id);
  if (!userId) return res.status(401).json({ error: "Не авторизован" });

  const actionType = req.body?.actionType as string | undefined;
  const total = req.body?.total;

  const result = await GameService.handleGameAction(
    userId,
    actionType,
    total !== undefined ? Number(total) : undefined
  );
  if ("error" in result) return res.status(result.status).json({ error: result.error });
  return res.json(result.data);
}) as RequestHandler);
