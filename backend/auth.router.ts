import { Router } from "express";
import { BackendAuthService, phoneSessions } from "./auth.service";
import { dbPool } from "./db";
import { loginSchema, registerSchema } from "./schemas/auth.schema";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);
    const authData = await BackendAuthService.login(phone, password);
    if (!authData) return res.status(401).json({ error: "Неверный логин или пароль" });
    res.json(authData);
  } catch {
    res.status(400).json({ error: "Ошибка валидации" });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (token && typeof (BackendAuthService as any).invalidateToken === "function") {
      await (BackendAuthService as any).invalidateToken(token);
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Ошибка сервера при выходе" });
  }
});

authRouter.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const parts = authHeader?.startsWith("Bearer ") ? authHeader.split(" ") : null;
    if (!parts || parts.length !== 2) return res.status(401).json({ error: "Нет токена" });

    const user = await BackendAuthService.getMe(parts[1]);
    if (!user) return res.status(401).json({ error: "Невалидный токен" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

authRouter.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Токен обязателен" });
  try {
    const tokenStr = refreshToken.startsWith("Bearer ") ? refreshToken.split(" ")[1] : refreshToken;
    const authData = await BackendAuthService.refreshTokens(tokenStr);
    if (!authData) return res.status(404).json({ error: "Невалидный токен" });
    res.json(authData);
  } catch {
    res.status(401).json({ error: "Ошибка refresh" });
  }
});

authRouter.post("/register", async (req, res) => {
  try {
    const { name, phone } = registerSchema.parse(req.body);
    const authData = await BackendAuthService.registerUser(name, phone);
    res.status(201).json(authData);
  } catch {
    res.status(400).json({ error: "Имя или телефон уже заняты!" });
  }
});

authRouter.post("/login/phone-check", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Телефон обязателен" });

  const cleanPhone = phone.replace(/[^0-9]/g, "").trim();

  try {
    const userCheck = await dbPool.query("SELECT id FROM users WHERE phone = $1", [cleanPhone]);

    if (!userCheck.rows || userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь с таким номером не найден. Зарегистрируйся!" });
    }

    res.json({ success: true, isLogin: true });
  } catch (error) {
    console.error("🚨 Ошибка в phone-check:", error);
    res.status(500).json({ error: "Ошибка сервера при проверке телефона" });
  }
});

authRouter.post("/login/cleanup-registration", async (req, res) => {
  let phone = req.body?.phone;
  if (!phone && typeof req.body === "string") {
    try {
      phone = JSON.parse(req.body).phone;
    } catch {}
  }
  if (!phone) return res.json({ success: true, message: "Телефон пуст" });

  const cleanPhone = phone.replace(/[^0-9]/g, "").trim();

  try {
    await dbPool.query("DELETE FROM users WHERE phone = $1 AND (password IS NULL OR password = '')", [cleanPhone]);
    res.json({ success: true });
  } catch (error) {
    console.error("🚨 Ошибка в cleanup:", error);
    res.status(500).json({ error: "Ошибка базы данных" });
  }
});

authRouter.post("/login/phone", async (req, res) => {
  const { phone, chosenPetName } = req.body;
  if (!phone) return res.status(400).json({ error: "Телефон обязателен" });

  const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
  console.log("📩 [BACKEND] Получен номер телефона:", cleanPhone);

  try {
    const userCheck = await dbPool.query("SELECT id FROM users WHERE phone = $1", [cleanPhone]);
    const isLogin = userCheck.rows && userCheck.rows.length > 0;

    const sessionId = await BackendAuthService.requestSmsCode(cleanPhone, chosenPetName || "Булька");
    res.json({ success: true, sessionId, isLogin });
  } catch (error) {
    console.error("🚨 КРИТИЧЕСКАЯ ОШИБКА В /login/phone:", error);
    res.status(500).json({ error: "Ошибка при отправке СМС" });
  }
});

authRouter.get("/login/get-mvp-code", (req, res) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) return res.status(400).json({ error: "sessionId обязателен" });
  const session = phoneSessions.get(sessionId);
  res.json({ code: session?.code || null });
});

authRouter.post("/login/verify-sms", (req, res) => {
  const { phone, code } = req.body;
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "").trim() : "";
  const sessionId = BackendAuthService.verifySmsCode(cleanPhone, code);
  if (!sessionId) return res.status(400).json({ error: "Неверный код" });
  res.json({ sessionId });
});

authRouter.post("/login/fruit", async (req, res) => {
  const { sessionId, fruitCode, phone, isLoginFlow } = req.body;

  try {
    if (isLoginFlow && phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
      const userResult = await dbPool.query("SELECT * FROM users WHERE phone = $1", [cleanPhone]);
      if (!userResult.rows.length) return res.status(401).json({ error: "Пользователь не найден" });

      const tokens = await BackendAuthService.login(cleanPhone, userResult.rows[0].password);
      return res.json(tokens);
    }
    const authData = await BackendAuthService.processFruitLogin(sessionId, fruitCode);
    if (!authData) return res.status(401).json({ error: "Неверный порядок фруктов или сессия не подтверждена" });
    res.json(authData);
  } catch (error) {
    console.error("🚨 Ошибка в обработке фруктов:", error);
    res.status(500).json({ error: "Ошибка при обработке капчи" });
  }
});
