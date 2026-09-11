import { Router } from "express";
import { dbPool } from "./db";

export const gameRouter = Router();

const UPDATE_PET_STATE_QUERY = `
  UPDATE users 
  SET 
    pet_satiety = CASE 
      WHEN pet_status = 'dead' THEN 0 
      ELSE GREATEST(0, pet_satiety - FLOOR(EXTRACT(EPOCH FROM (NOW() - updated_at)) / 3600) * 5) 
    END,
    pet_happiness = CASE 
      WHEN pet_status = 'dead' THEN 0 
      ELSE GREATEST(0, pet_happiness - FLOOR(EXTRACT(EPOCH FROM (NOW() - updated_at)) / 3600) * 3) 
    END,
    pet_status = CASE 
      WHEN pet_status = 'dead' THEN 'dead'
      WHEN GREATEST(0, pet_satiety - FLOOR(EXTRACT(EPOCH FROM (NOW() - updated_at)) / 3600) * 5) <= 0 THEN 'dead'
      ELSE 'alive'
    END,
    updated_at = CASE 
      WHEN FLOOR(EXTRACT(EPOCH FROM (NOW() - updated_at)) / 3600) >= 1 
      THEN updated_at + (FLOOR(EXTRACT(EPOCH FROM (NOW() - updated_at)) / 3600) * INTERVAL '1 hour')
      ELSE updated_at
    END
  WHERE id = $1 
  RETURNING *;
`;

gameRouter.get("/status/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Некорректный ID" });

  try {
    const result = await dbPool.query(UPDATE_PET_STATE_QUERY, [userId]);
    if (!result.rows || result.rows.length === 0) return res.status(404).json({ error: "Пользователь не найден" });

    console.log(`🔎 [LOG STATUS] Юзер ID: ${userId} | Текущие монеты в RETURNING:`, result.rows[0].coins);
    res.json(result.rows);
  } catch (error) {
    console.error("🚨 Ошибка в /status/:userId:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

gameRouter.post("/feed", async (req, res) => {
  const userId = Number(req.body.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "userId обязателен" });

  try {
    const stateResult = await dbPool.query(UPDATE_PET_STATE_QUERY, [userId]);
    if (!stateResult.rows || stateResult.rows.length === 0) return res.status(404).json({ error: "Пользователь не найден" });
    if (stateResult.rows[0].pet_status === "dead") return res.status(400).json({ error: "Улитка уже мертва" });

    const updateResult = await dbPool.query("UPDATE users SET pet_satiety = LEAST(100, pet_satiety + 20) WHERE id = $1 RETURNING *", [
      userId
    ]);
    res.json({ message: "Улитка успешно поела!", user: updateResult.rows[0] });
  } catch (error) {
    console.error("🚨 Ошибка в /feed:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

gameRouter.get("/pharmacy/coins/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Некорректный ID" });

  try {
    const result = await dbPool.query("SELECT coins FROM users WHERE id = $1", [userId]);
    if (!result.rows || result.rows.length === 0) return res.status(404).json({ error: "Юзер не найден" });

    console.log(`💰 [LOG GET COINS] Юзер ID: ${userId} | Запрос баланса выдал из Базы:`, result.rows[0].coins);
    res.json({ coins: result.rows[0].coins });
  } catch (error) {
    console.error("🚨 Ошибка в /pharmacy/coins/:userId:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

gameRouter.post("/pharmacy/action", async (req, res) => {
  const { userId, actionType, total } = req.body;
  if (!userId || !actionType) return res.status(400).json({ error: "Не все параметры переданы" });

  let priceChange = 0;
  if (actionType === "buy_medicine") priceChange = -30;
  if (actionType === "mini_game_reward") priceChange = 15;

  if (actionType === "buy_shop_items") {
    const cost = Number(total);
    if (isNaN(cost) || cost <= 0) return res.status(400).json({ error: "Стоимость товара некорректна" });
    priceChange = -cost;
  }

  try {
    const currentCheck = await dbPool.query("SELECT coins FROM users WHERE id = $1", [Number(userId)]);
    console.log(
      `🛒 [LOG ACTION START] Юзер ID: ${userId} | Действие: ${actionType} | Цена: ${priceChange} | Баланс ДО операции:`,
      currentCheck.rows[0]?.coins
    );

    const result = await dbPool.query("UPDATE users SET coins = GREATEST(0, coins + $1) WHERE id = $2 RETURNING coins", [
      priceChange,
      Number(userId)
    ]);
    if (!result.rows || result.rows.length === 0) return res.status(404).json({ error: "Юзер не найден" });

    console.log(`💸 [LOG ACTION END] Баланс ПОСЛЕ UPDATE в базе стал:`, result.rows[0].coins);
    res.json({ coins: result.rows[0].coins });
  } catch (error) {
    console.error("🚨 Ошибка в /pharmacy/action:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
