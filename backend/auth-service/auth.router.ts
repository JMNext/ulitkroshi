import { Request, Response, Router } from "express";
import { requireAuth } from "../shared/auth.middleware";
import { AuthenticatedRequest } from "../shared/types";
import * as service from "./auth.service";
import { phoneCheckSchema, smsPhoneSchema, verifySmsSchema, verifyFruitSchema, petStatsSchema } from "./validation.schemas";

export const authRouter = Router();

authRouter.post("/login/phone-check", async (req: Request, res: Response) => {
  const parsed = phoneCheckSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Ошибка телефона" });
  res.json({ success: true, isLogin: await service.checkUserExists(parsed.data.phone) });
});

authRouter.get("/login/phone-check", async (req: Request, res: Response) => {
  const parsed = phoneCheckSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Ошибка телефона" });
  res.json({ success: true, isLogin: await service.checkUserExists(parsed.data.phone) });
});

authRouter.post("/login/phone", async (req: Request, res: Response) => {
  const parsed = smsPhoneSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Ошибка телефона" });
  const { phone, chosenPetName } = parsed.data;
  res.json({ success: true, sessionId: await service.requestSmsCode(phone, chosenPetName), isLogin: await service.checkUserExists(phone) });
});

authRouter.get("/login/phone", async (req: Request, res: Response) => {
  const parsed = smsPhoneSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Ошибка телефона" });
  const { phone, chosenPetName } = parsed.data;
  res.json({ success: true, sessionId: await service.requestSmsCode(phone, chosenPetName), isLogin: await service.checkUserExists(phone) });
});

authRouter.post("/login/verify-sms", async (req: Request, res: Response) => {
  const parsed = verifySmsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Ошибка параметров" });
  const sId = service.verifySmsCode(parsed.data.phone, parsed.data.code);
  sId ? res.json({ sessionId: sId }) : res.status(400).json({ error: "Неверный код" });
});

authRouter.get("/login/verify-sms", async (req: Request, res: Response) => {
  const parsed = verifySmsSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Ошибка параметров" });
  const sId = service.verifySmsCode(parsed.data.phone, parsed.data.code);
  sId ? res.json({ sessionId: sId }) : res.status(400).json({ error: "Неверный код" });
});

authRouter.post("/login/fruit", async (req: Request, res: Response) => {
  const data = await service.processFruitLogin(req.body.fruitCode, req.body.phone);
  data ? res.json(data) : res.status(401).json({ error: "Неверный пароль" });
});

authRouter.post("/register/fruit", async (req: Request, res: Response) => {
  const parsed = verifyFruitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Ошибка параметров" });
  try {
    const data = await service.processFruitRegister(parsed.data.sessionId, parsed.data.fruitCode, parsed.data.phone, parsed.data.petName);
    data ? res.json(data) : res.status(500).json({ error: "Сессия истекла" });
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка БД при регистрации", message: err?.message });
  }
});

authRouter.post("/refresh", async (req: Request, res: Response) => {
  const token = req.body?.refreshToken as string;
  if (!token) return res.status(400).json({ error: "Нет токена" });
  const data = await service.refreshTokens(token);
  data ? res.json(data) : res.status(401).json({ error: "Недействительный токен" });
});

authRouter.post("/logout", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.split(" ")[1] : null;
  if (token) await service.invalidateToken(token);
  res.json({ success: true });
});

authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.split(" ")[1] : null;
  if (!token) return res.status(401).json({ error: "Нет токена" });
  const user = await service.getMe(token);
  user ? res.json({ user }) : res.status(401).json({ error: "Не найден" });
});

authRouter.get("/login/get-mvp-code", (req: Request, res: Response) => {
  res.json({ code: service.phoneSessions.get(req.query.sessionId as string)?.code || "1111" });
});

authRouter.post("/login/cleanup-registration", async (req: Request, res: Response) => {
  if (req.body?.phone) service.cleanupSessionsByPhone(req.body.phone);
  res.json({ success: true });
});

authRouter.put("/pet/stats", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.user?.id);
  if (!id) return res.status(401).json({ error: "Не авторизован" });
  const parsed = petStatsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Неверные параметры" });
  const ok = await service.syncPetStats(id, parsed.data.petHealth, parsed.data.petExperience, parsed.data.petStars, parsed.data.petIndex);
  ok ? res.json({ success: true }) : res.status(500).json({ error: "Ошибка обновления" });
});
