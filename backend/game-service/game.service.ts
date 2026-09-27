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
       SET pet_healths = ARRAY[LEAST(100, COALESCE(pet_healths[1], 100) + 20)]::INTEGER[]
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
  const cleanType = String(type || "").trim();

  if (!cleanType || !["buy_medicine", "buy_shop_items", "mini_game_reward"].includes(cleanType)) {
    return { error: `Неизвестное действие: ${cleanType}`, status: 400 };
  }

  // Гарантированно парсим число из GET-запроса, защищаясь от NaN и строк
  const parsedTotal = total !== undefined && !isNaN(Number(total)) ? Math.abs(Math.round(Number(total))) : 0;
  const price = cleanType === "buy_shop_items" ? -parsedTotal : cleanType === "mini_game_reward" ? parsedTotal : cleanType === "buy_medicine" ? -30 : 0;

  try {
    let q = "";
    if (cleanType === "buy_medicine") {
      q = `UPDATE users
           SET coins = GREATEST(0, COALESCE(coins, 0) + $1),
               pet_healths = ARRAY[GREATEST(1, COALESCE(pet_healths[1], 100) - 25)]::INTEGER[]
           WHERE id = $2 RETURNING coins`;
    } else {
      q = `UPDATE users
           SET coins = GREATEST(0, COALESCE(coins, 0) + $1)
           WHERE id = $2 RETURNING coins`;
    }

    const r = await dbPool.query<any>(q, [price, userId]);
    const u = getFirstRow(r);
    if (!u) return { error: "Пользователь не найден", status: 404 };

    return {
      data: {
        coins: Number(u.coins ?? 0),
        petHealth: 100
      },
      status: 200
    };
  } catch (err) {
    return { error: "Ошибка транзакции БД", status: 500 };
  }
};
