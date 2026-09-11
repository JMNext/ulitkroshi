import { dbPool } from "./db";

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

export const GameService = {
  async getPetStatus(userId: number) {
    const result = await dbPool.query(UPDATE_PET_STATE_QUERY, [userId]);
    return result.rows.length ? result.rows[0] : null;
  },

  async feedPet(userId: number) {
    const state = await this.getPetStatus(userId);
    if (!state) return { error: "Пользователь не найден", status: 404 };
    if (state.pet_status === "dead") return { error: "Улитка уже мертва", status: 400 };

    const updateResult = await dbPool.query("UPDATE users SET pet_satiety = LEAST(100, pet_satiety + 20) WHERE id = $1 RETURNING *", [
      userId
    ]);
    return { data: updateResult.rows[0], status: 200 };
  },

  async getUserCoins(userId: number) {
    const result = await dbPool.query("SELECT coins FROM users WHERE id = $1", [userId]);
    return result.rows.length ? result.rows[0] : null;
  },

  async handleGameAction(userId: number, actionType: string, total?: number) {
    let priceChange = 0;

    if (actionType === "buy_medicine") {
      priceChange = -30;
    } else if (actionType === "buy_shop_items") {
      const cost = Number(total);
      if (isNaN(cost) || cost <= 0) return { error: "Стоимость товара некорректна", status: 400 };
      priceChange = -cost;
    } else if (actionType === "mini_game_reward") {
      const timeCheck = await dbPool.query("SELECT last_minigame_at FROM users WHERE id = $1", [userId]);
      if (timeCheck.rows.length) {
        const lastGame = new Date(timeCheck.rows[0].last_minigame_at).getTime();
        const now = Date.now();
        if (now - lastGame < 5000) {
          return { error: "🛑 Стоп читер! Запросы отправляются слишком часто.", status: 429 };
        }
      }
      priceChange = 15;
      await dbPool.query("UPDATE users SET last_minigame_at = NOW() WHERE id = $1", [userId]);
    } else {
      return { error: "Неизвестное действие", status: 400 };
    }

    const result = await dbPool.query("UPDATE users SET coins = GREATEST(0, coins + $1) WHERE id = $2 RETURNING coins", [
      priceChange,
      userId
    ]);

    return { data: result.rows.length ? result.rows[0] : null, status: 200 };
  }
};
