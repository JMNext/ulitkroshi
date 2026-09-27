import { dbPool } from "../shared/db";
import { DbUser } from "../shared/types";
import { getFirstRow, mapUserFields } from "../shared/utils";

export const getPetStatus = async (userId: number) => {
  try {
    const r = await dbPool.query<DbUser>("SELECT * FROM users WHERE id = \$1", [userId]);
    const u = getFirstRow(r);
    return u ? mapUserFields(u) : null;
  } catch {
    return null;
  }
};

export const feedPet = async (userId: number) => {
  try {
    const check = await dbPool.query("SELECT coins FROM users WHERE id = \$1", [userId]);
    if (!check.rows.length) return { error: "Не найден", status: 404 };

    const upd = await dbPool.query<DbUser>(
      `UPDATE users
       SET pet_healths[1] = LEAST(100, COALESCE(pet_healths[1], 100) + 20)
       WHERE id = $1 RETURNING *`,
      [userId]
    );
    const u = getFirstRow(upd);
    return u ? { data: mapUserFields(u), status: 200 } : { error: "Не найден", status: 404 };
  } catch {
    return { error: "Ошибка БД", status: 500 };
  }
};

export const getUserCoins = async (userId: number) => {
  try {
    const r = await dbPool.query<{ coins: number }>("SELECT coins FROM users WHERE id = \$1", [userId]);
    const u = getFirstRow(r);
    return u ? { coins: Number(u.coins ?? 0) } : null;
  } catch {
    return null;
  }
};

export const handleGameAction = async (userId: number, type: string | undefined, total?: number) => {
  if (!type || !["buy_medicine", "buy_shop_items", "mini_game_reward"].includes(type)) {
    return { error: "Неизвестное действие", status: 400 };
  }

  const price = type === "buy_shop_items" ? -(Number(total) || 0) : type === "mini_game_reward" ? Number(total) || 0 : type === "buy_medicine" ? -30 : 0;

  try {
    let q = "";
    if (type === "buy_medicine") {
      q = `UPDATE users
           SET coins = GREATEST(0, COALESCE(coins, 0) + $1),
               pet_healths[1] = GREATEST(1, COALESCE(pet_healths[1], 100) - 25)
           WHERE id = $2 RETURNING coins, pet_healths`;
    } else {
      q = `UPDATE users
           SET coins = GREATEST(0, COALESCE(coins, 0) + $1)
           WHERE id = $2 RETURNING coins, pet_healths`;
    }

    const r = await dbPool.query<any>(q, [price, userId]);
    const u = getFirstRow(r);
    if (!u) return { error: "Не найден", status: 404 };

    return {
      data: {
        coins: Number(u.coins ?? 0),
        petHealth: Array.isArray(u.pet_healths) && u.pet_healths.length > 0 ? Number(u.pet_healths[0] ?? 100) : 100
      },
      status: 200
    };
  } catch (err) {
    return { error: "Ошибка БД", status: 500 };
  }
};
