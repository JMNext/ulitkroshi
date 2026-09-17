import { Router } from "express";
import { BackendAuthService, phoneSessions } from "./auth.service";
import { dbPool } from "./db";
import { loginSchema, registerSchema } from "./schemas/auth.schema";

export const authRouter = Router();

authRouter.post("/login", async (req: any, res: any) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);
    const authData = await BackendAuthService.login(phone, password);
    if (!authData) return res.status(401).json({ error: "Неверный логин или пароль" });
    return res.json(authData);
  } catch { return res.status(400).json({ error: "Ошибка валидации" }); }
});

authRouter.post("/logout", async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (token) await BackendAuthService.invalidateToken(token);
    return res.json({ success: true });
  } catch { return res.status(500).json({ error: "Ошибка сервера" }); }
});

authRouter.get("/me", async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    const parts = authHeader?.startsWith("Bearer ") ? authHeader.split(" ") : null;
    if (!parts || parts.length !== 2) return res.status(401).json({ error: "Нет токена" });
    const user = await BackendAuthService.getMe(parts[1]);
    if (!user) return res.status(401).json({ error: "Невалидный токен" });
    return res.json(user);
  } catch { return res.status(500).json({ error: "Ошибка сервера" }); }
});

authRouter.post("/refresh", async (req: any, res: any) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Токен обязателен" });
  try {
    const tokenStr = refreshToken.startsWith("Bearer ") ? refreshToken.split(" ")[1] : refreshToken;
    const authData = await BackendAuthService.refreshTokens(tokenStr);
    if (!authData) return res.status(401).json({ error: "Невалидный токен" });
    return res.json(authData);
  } catch { return res.status(401).json({ error: "Ошибка refresh" }); }
});

authRouter.post("/register", async (req: any, res: any) => {
  try {
    const { name, phone } = registerSchema.parse(req.body);
    const authData = await BackendAuthService.registerUser(name, phone);
    return res.status(201).json(authData);
  } catch { return res.status(400).json({ error: "Имя или телефон уже заняты!" }); }
});

authRouter.post("/login/phone-check", async (req: any, res: any) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Телефон обязателен" });
  const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
  try {
    const userCheck = await dbPool.query("SELECT id FROM users WHERE phone = $1", [cleanPhone]);
    if (!userCheck.rows || userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    return res.json({ success: true, isLogin: true });
  } catch { return res.status(500).json({ error: "Ошибка сервера" }); }
});

authRouter.post("/login/cleanup-registration", async (req: any, res: any) => {
  let phone = req.body?.phone;
  if (!phone && typeof req.body === "string") { try { phone = JSON.parse(req.body).phone; } catch {} }
  if (!phone) return res.json({ success: true });
  const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
  try {
    await dbPool.query("DELETE FROM users WHERE phone = $1 AND (password IS NULL OR password = '')", [cleanPhone]);
    return res.json({ success: true });
  } catch { return res.status(500).json({ error: "Ошибка базы данных" }); }
});

authRouter.post("/login/phone", async (req: any, res: any) => {
  const { phone, chosenPetName } = req.body;
  if (!phone) return res.status(400).json({ error: "Телефон обязателен" });
  const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
  try {
    const userCheck = await dbPool.query("SELECT id FROM users WHERE phone = $1", [cleanPhone]);
    const isLogin = userCheck.rows && userCheck.rows.length > 0;
    const sessionId = await BackendAuthService.requestSmsCode(cleanPhone, chosenPetName || "Булька");
    return res.json({ success: true, sessionId, isLogin });
  } catch { return res.status(500).json({ error: "Ошибка при отправке СМС" }); }
});

authRouter.get("/login/get-mvp-code", (req: any, res: any) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) return res.status(400).json({ error: "sessionId обязателен" });
  const session = phoneSessions.get(sessionId);
  return res.json({ code: session?.code || null });
});

authRouter.post("/login/verify-sms", (req: any, res: any) => {
  const { phone, code } = req.body;
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "").trim() : "";
  const sessionId = BackendAuthService.verifySmsCode(cleanPhone, code);
  if (!sessionId) return res.status(400).json({ error: "Неверный код" });
  return res.json({ sessionId });
});

authRouter.post("/login/fruit", async (req: any, res: any) => {
  const { sessionId, fruitCode, phone } = req.body;
  try {
    const authData = await BackendAuthService.processFruitLogin(sessionId, fruitCode, phone);
    if (!authData || !authData.user || !authData.accessToken) {
      return res.status(401).json({ error: "Неверный порядок фруктов капчи!" });
    }
    return res.json(authData);
  } catch (error) { return res.status(500).json({ error: "Ошибка при обработке капчи" }); }
});
