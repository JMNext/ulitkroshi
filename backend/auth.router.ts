import { Router } from 'express';
import { BackendAuthService } from './auth.service';
import { loginSchema, registerSchema } from './schemas/auth.schema';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);
    const authData = await BackendAuthService.login(phone, password);
    if (!authData) return res.status(401).json({ error: "Неверный логин или пароль" });
    res.json(authData);
  } catch (err: any) {
    res.status(400).json({ error: err.errors?.[0]?.message || "Ошибка валидации" });
  }
});

authRouter.post('/logout', (_req, res) => {
  res.json({ success: true });
});

authRouter.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  if (!token) return res.status(401).json({ error: "Нет токена" });
  try {
    const user = await BackendAuthService.getMe(token);
    if (!user) return res.status(401).json({ error: "Невалидный токен" });
    res.json(user);
  } catch { 
    res.status(500).json({ error: "Ошибка сервера" }); 
  }
});

authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh токен обязателен" });
  try {
    const authData = await BackendAuthService.refreshTokens(refreshToken);
    if (!authData) return res.status(404).json({ error: "Пользователь не найден или токен невалиден" });
    res.json(authData);
  } catch { 
    res.status(401).json({ error: "Ошибка refresh" }); 
  }
});

authRouter.post('/register', async (req, res) => {
  try {
    const { name, phone } = registerSchema.parse(req.body);
    const authData = await BackendAuthService.registerUser(name, phone);
    res.status(201).json(authData);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(400).json({ error: "Этот никнейм или телефон уже заняты!" });
  }
});

authRouter.post('/login/phone', async (req, res) => {
  const { phone, chosenPetName } = req.body;
  if (!phone) return res.status(400).json({ error: "Телефон обязателен" });
  try {
    const sessionId = await BackendAuthService.requestSmsCode(phone, chosenPetName);
    res.json({ success: true, sessionId });
  } catch {
    res.status(500).json({ error: "Ошибка при отправке СМС" });
  }
});

authRouter.post('/login/verify-sms', (req, res) => {
  const { phone, code } = req.body;
  const sessionId = BackendAuthService.verifySmsCode(phone, code);
  if (!sessionId) return res.status(400).json({ error: "Неверный код" });
  res.json({ sessionId });
});

authRouter.post('/login/fruit', async (req, res) => {
  const { sessionId, fruitCode } = req.body;
  if (!sessionId || !Array.isArray(fruitCode)) {
    return res.status(400).json({ error: "Передайте sessionId и массив выбранных фруктов (fruitCode)" });
  }
  try {
    const authData = await BackendAuthService.processFruitLogin(sessionId, fruitCode);
    if (!authData) return res.status(401).json({ error: "Неверный порядок фруктов или сессия не подтверждена" });
    res.json(authData);
  } catch {
    res.status(500).json({ error: "Ошибка при обработке капчи" });
  }
});

authRouter.get('/check-name', async (req, res) => {
  const name = req.query.name as string;
  if (!name) return res.status(400).json({ error: "Параметр name обязателен" });
  try {
    const isAvailable = await BackendAuthService.isNameAvailable(name);
    res.json({ available: isAvailable });
  } catch {
    res.status(500).json({ error: "Ошибка проверки имени" });
  }
});
