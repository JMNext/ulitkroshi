import { dbPool } from "./db";

export const GameService = {
  async getPetStatus(userId: number) {
    try {
      const result = await dbPool.query("SELECT * FROM users WHERE id = $1", [userId]);
      return result.rows.length ? result.rows[0] : null;
    } catch {
      return null;
    }
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
    try {
      const result = await dbPool.query("SELECT coins FROM users WHERE id = $1", [userId]);
      return result.rows.length ? result.rows[0] : null;
    } catch {
      return null;
    }
  },

  async handleGameAction(userId: number, actionType: string, total?: number) {
    let priceChange = 0;

    if (actionType === "buy_medicine") {
      priceChange = -30;
    } else if (actionType === "buy_shop_items") {
      priceChange = -(Number(total) || 0);
    } else if (actionType === "mini_game_reward") {
      priceChange = Number(total) || 0;
    } else {
      return { error: "Неизвестное действие", status: 400 };
    }

    try {
      const result = await dbPool.query(
        "UPDATE users SET coins = GREATEST(0, coins + $1) WHERE id = $2 RETURNING coins",
        [priceChange, userId]
      );

      if (!result.rows || result.rows.length === 0) {
        return { error: "Пользователь не найден", status: 404 };
      }

      const updatedCoins = result.rows[0].coins;
      return { data: { coins: Number(updatedCoins) }, status: 200 };
    } catch (dbError) {
      console.error("🚨 КРИТИЧЕСКАЯ ОШИБКА SQL ЗАПРОСА В БАЗУ ДАННЫХ:", dbError);
      return { error: "Ошибка базы данных", status: 500 };
    }
  }
};
