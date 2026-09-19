import { Router, Request, Response, RequestHandler } from "express";
import { requireAuth } from "../shared/auth.middleware";
import { dbPool } from "../shared/db";
import { verifyFruitSchema } from "./auth.schema";
import { BackendAuthService, phoneSessions } from "./auth.service";
import { DbUser, AuthenticatedRequest } from "../shared/types";
import { getNormalizedPhone, getFirstRow, mapUserFields } from "../shared/utils";

export const authRouter = Router();

authRouter.post("/login/phone-check", (async (req: Request, res: Response) => {
  const incomingPhone = req.body?.phone;
  if (!incomingPhone) return res.status(400).json({ error: "Телефон не передан" });

  const cleanPhone = getNormalizedPhone(incomingPhone);
  const userCheck = await dbPool.query<DbUser>("SELECT id, password FROM users WHERE phone = \$1", [cleanPhone]);
  const user = getFirstRow(userCheck);

  if (!user || !user.password || String(user.password).trim() === "") {
    return res.json({ success: true, isLogin: false });
  }
  return res.json({ success: true, isLogin: true });
}) as RequestHandler);

authRouter.post("/login/phone", (async (req: Request, res: Response) => {
  const incomingPhone = req.body?.phone;
  const chosenPetName = (req.body?.chosenPetName as string) || "";
  if (!incomingPhone) return res.status(400).json({ error: "Телефон не передан" });

  const cleanPhone = getNormalizedPhone(incomingPhone);
  const userCheck = await dbPool.query<DbUser>("SELECT id, password FROM users WHERE phone = \$1", [cleanPhone]);
  const user = getFirstRow(userCheck);
  const isLogin = !!(user && user.password);

  const sessionId = await BackendAuthService.requestSmsCode(cleanPhone, chosenPetName);
  return res.json({ success: true, sessionId, isLogin });
}) as RequestHandler);

authRouter.post("/login/verify-sms", (req: Request, res: Response) => {
  const incomingPhone = req.body?.phone;
  const incomingCode = req.body?.code as string;
  const cleanPhone = getNormalizedPhone(incomingPhone);

  const sessionId = BackendAuthService.verifySmsCode(cleanPhone, incomingCode);
  if (!sessionId) return res.status(400).json({ error: "Неверный код СМС" });
  return res.json({ sessionId });
});

authRouter.post("/login/fruit", (async (req: Request, res: Response) => {
  const validatedData = verifyFruitSchema.parse(req.body);
  const { fruitCode, phone } = validatedData;

  const authData = await BackendAuthService.processFruitLogin(fruitCode, phone);
  if (!authData) return res.status(401).json({ error: "Неверный фруктовый пароль!" });
  return res.json(authData);
}) as RequestHandler);

authRouter.post("/register/fruit", (async (req: Request, res: Response) => {
  const validatedData = verifyFruitSchema.parse(req.body);
  const { fruitCode, phone, petName } = validatedData;

  const authData = await BackendAuthService.processFruitRegister(fruitCode, phone, petName);
  if (!authData) return res.status(500).json({ error: "Не удалось сохранить пароль" });
  return res.json(authData);
}) as RequestHandler);

authRouter.post("/refresh", (async (req: Request, res: Response) => {
  const refreshToken = req.body?.refreshToken as string;
  if (!refreshToken) return res.status(400).json({ error: "Токен обновления отсутствует" });

  const authData = await BackendAuthService.refreshTokens(refreshToken);
  if (!authData) return res.status(401).json({ error: "Недействительный токен обновления" });
  return res.json(authData);
}) as RequestHandler);

authRouter.post("/logout", (async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ") : null;

  if (token) {
    await dbPool.query(
      "INSERT INTO public.token_blacklist (token) VALUES (\$1) ON CONFLICT DO NOTHING",
      [token]
    );
  }
  return res.json({ success: true });
}) as RequestHandler);

authRouter.get("/me", requireAuth, (async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) return res.status(401).json({ error: "Неавторизован" });

  const userCheck = await dbPool.query<DbUser>("SELECT * FROM users WHERE id = \$1", [req.user.id]);
  const user = getFirstRow(userCheck);
  if (!user) return res.status(401).json({ error: "Пользователь не найден" });

  return res.json(mapUserFields(user));
}) as RequestHandler);

authRouter.get("/login/get-mvp-code", (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) return res.status(400).json({ error: "sessionId обязателен" });

  const session = phoneSessions.get(sessionId);
  return res.json({ code: session?.code || null });
});

authRouter.post("/login/cleanup-registration", (async (req: Request, res: Response) => {
  const incomingPhone = req.body?.phone;
  const cleanPhone = getNormalizedPhone(incomingPhone);
  await dbPool.query("DELETE FROM users WHERE phone = \$1 AND (password IS NULL OR password = '')", [cleanPhone]);
  return res.json({ success: true });
}) as RequestHandler);
