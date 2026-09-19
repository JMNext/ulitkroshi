import { dbPool } from "../shared/db";
import { MappedUser, DbUser, GameActionResult } from "../shared/types";
import { mapUserFields } from "../shared/utils";

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
      const userCheck = await dbPool.query<{ coins: number }>("SELECT coins FROM users WHERE id = \$1", [userId]);
      if (!userCheck.rows || userCheck.rows.length === 0) {
        return { error: "Пользователь не найден", status: 404 };
      }

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
  ): Promise<GameActionResult<{ coins: number; petHealth?: number }>> {
    let priceChange = 0;
    let shouldDamagePet = false;

    if (actionType === "buy_medicine") {
      priceChange = 0;
      shouldDamagePet = true;
    } else if (actionType === "buy_shop_items") {
      priceChange = -(Number(total) || 0);
    } else if (actionType === "mini_game_reward") {
      priceChange = Number(total) || 0;
    } else {
      return { error: "Неизвестное действие", status: 400 };
    }

    try {
      let result;
      if (shouldDamagePet) {
        result = await dbPool.query<{ coins: string | number; pet_health: string | number }>(
          "UPDATE users SET coins = GREATEST(0, COALESCE(coins, 0) + \$1), pet_health = GREATEST(1, COALESCE(pet_health, 100) - 25) WHERE id = \$2 RETURNING coins, pet_health",
          [priceChange, userId]
        );
      } else {
        result = await dbPool.query<{ coins: string | number; pet_health: string | number }>(
          "UPDATE users SET coins = GREATEST(0, COALESCE(coins, 0) + \$1) WHERE id = \$2 RETURNING coins, pet_health",
          [priceChange, userId]
        );
      }

      if (!result.rows || result.rows.length === 0) {
        console.error(`🛑 [GAME SERVICE ERROR] Строка пользователя с ID ${userId} НЕ НАЙДЕНА!`);
        return { error: "Пользователь не найден в БД", status: 404 };
      }

      const dbRow = result.rows[0];
      const updatedCoins = dbRow ? Number(dbRow.coins ?? 0) : 0;
      const updatedHealth = dbRow ? Number(dbRow.pet_health ?? 100) : 100;

      return { data: { coins: updatedCoins, petHealth: updatedHealth }, status: 200 };
    } catch (dbError: any) {
      console.error("🚨 [GAME SERVICE DB CATCH CRITICAL]:", dbError.message || dbError);
      return { error: "Ошибка базы данных", status: 500 };
    }
  }
};
