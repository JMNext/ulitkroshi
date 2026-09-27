import { Response, Router } from "express";
import { requireAuth } from "../shared/auth.middleware";
import { AuthenticatedRequest } from "../shared/types";
import * as service from "./game.service";

export const gameRouter = Router();

const checkAuth = (req: AuthenticatedRequest, res: Response): number => {
  const id = Number(req.user?.id);
  if (!id) res.status(401).json({ error: "Не авторизован" });
  return id;
};

gameRouter.get("/pharmacy/status", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const id = checkAuth(req, res); if (!id) return;
  const status = await service.getPetStatus(id);
  status ? res.json(status) : res.status(404).json({ error: "Не найден" });
});

gameRouter.post("/pharmacy/feed", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const id = checkAuth(req, res); if (!id) return;
  const resData = await service.feedPet(id);
  "error" in resData ? res.status(resData.status).json({ error: resData.error }) : res.json(resData.data);
});

gameRouter.get("/pharmacy/coins", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const id = checkAuth(req, res); if (!id) return;
  const coins = await service.getUserCoins(id);
  coins ? res.json(coins) : res.status(404).json({ error: "Не найден" });
});

const handleActionRoute = async (req: AuthenticatedRequest, res: Response) => {
  const id = checkAuth(req, res); if (!id) return;

  const actionType = req.body?.actionType || req.body?.type || req.query?.actionType;
  const rawTotal = req.body?.total !== undefined ? req.body.total : (req.body?.amt || req.query?.total);
  const total = rawTotal !== undefined && rawTotal !== null ? Number(rawTotal) : 0;

  const resData = await service.handleGameAction(id, actionType, total);

  if ("error" in resData) {
    return res.status(resData.status).json({ error: resData.error });
  }

  res.json(resData.data);
};

gameRouter.post("/pharmacy/action", requireAuth, handleActionRoute);
gameRouter.put("/pharmacy/action", requireAuth, handleActionRoute);

gameRouter.all("/pharmacy/action", (req, res) => {
  res.status(405).json({
    error: "Method Not Allowed (Ошибка 405)",
    message: "Фронтенд отправил метод, но сервер ожидает POST или PUT на /api-game/pharmacy/action."
  });
});
