import { dbPool } from "../db/db";
import { MappedUser, DbUser, GameActionResult } from "../types/express";
import { mapUserFields } from "../types/utils";

export const GameService = {
  async getPetStatus(userId: number): Promise<MappedUser | null> {
    try {
      const result = await dbPool.query<DbUser>("SELECT * FROM users WHERE id = \$1", [userId]);
      if (!result.rows || result.rows.length === 0) return null;
      return mapUserFields(result.rows[0]);
    } catch {
      return null;
    }
  },

  async feedPet(userId: number): Promise<GameActionResult<MappedUser>> {
    try {
      const updateResult = await dbPool.query<DbUser>(
        "UPDATE users SET pet_health = LEAST(100, COALESCE(pet_health, 100) + 20) WHERE id = \$1 RETURNING *",
        [userId]
      );
      if (!updateResult.rows || updateResult.rows.length === 0) {
        return { error: "Пользователь не найден", status: 404 };
      }
      return { data: mapUserFields(updateResult.rows[0]), status: 200 };
    } catch {
      return { error: "Ошибка базы данных при кормлении", status: 500 };
    }
  },

  async getUserCoins(userId: number): Promise<{ coins: number } | null> {
    try {
      const result = await dbPool.query<{ coins: number }>("SELECT coins FROM users WHERE id = \$1", [userId]);
      return result.rows.length ? { coins: Number(result.rows[0].coins ?? 0) } : null;
    } catch {
      return null;
    }
  },

  async handleGameAction(
    userId: number,
    actionType: string | undefined,
    total?: number
  ): Promise<GameActionResult<{ coins: number }>> {
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
      const result = await dbPool.query<{ coins: string | number }>(
        "UPDATE users SET coins = GREATEST(0, COALESCE(coins, 0) + \$1) WHERE id = \$2 RETURNING coins",
        [priceChange, userId]
      );

      if (!result.rows || result.rows.length === 0) {
        console.error(`🛑 [BACKEND ERROR] Запрос UPDATE прошёл успешно, но строка пользователя с ID ${userId} НЕ НАЙДЕНА в таблице users!`);
        return { error: "Пользователь не найден в БД", status: 404 };
      }

      const dbRow = result.rows[0];
      const updatedCoins = dbRow ? Number(dbRow.coins ?? 0) : 0;

      return { data: { coins: updatedCoins }, status: 200 };
    } catch (dbError: any) {
      console.error("🚨 [BACKEND DB CATCH CRITICAL]:", dbError.message || dbError);
      return { error: "Ошибка базы данных", status: 500 };
    }
  }
};
