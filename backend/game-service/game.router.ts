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
  resData && "error" in resData ? res.status(resData.status).json({ error: resData.error }) : res.json(resData);
});

gameRouter.get("/pharmacy/coins", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const id = checkAuth(req, res); if (!id) return;
  const coins = await service.getUserCoins(id);
  coins ? res.json(coins) : res.status(404).json({ error: "Не найден" });
});

gameRouter.post("/pharmacy/action", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  const id = checkAuth(req, res); if (!id) return;

  const actionType = String(req.body?.actionType || "").trim();
  const rawTotal = req.body?.total;
  const total = rawTotal !== undefined && rawTotal !== null ? Number(rawTotal) : 0;

  const resData = await service.handleGameAction(id, actionType, total);

  if (resData && "error" in resData) {
    return res.status(resData.status || 400).json({
      error: resData.error,
      coins: 0,
      serverDebug: {
        userId: id,
        incomingBody: req.body,
        serviceResult: resData
      }
    });
  }

  res.json({
    ...resData,
    serverDebug: {
      userId: id,
      incomingBody: req.body,
      status: "Успешно обработано сервером"
    }
  });
});
