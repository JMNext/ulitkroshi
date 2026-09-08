import { Router } from 'express';
import { dbClient } from './db';

export const gameRouter = Router();

const HUNGER_SPEED_PER_HOUR = 5; 
const BOREDOM_SPEED_PER_HOUR = 3;

async function getUpdatedUserState(userId: number): Promise<any> {
  const result = await dbClient.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (!result.rows.length) return null;

  const user = result.rows[0]; 
  if (user.pet_status === 'dead') return user;

  const hoursPassed = (new Date().getTime() - new Date(user.updated_at).getTime()) / (1000 * 60 * 60);

  if (hoursPassed > 0) {
    const newSatiety = Math.max(0, user.pet_satiety - Math.floor(hoursPassed * HUNGER_SPEED_PER_HOUR));
    const newHappiness = Math.max(0, user.pet_happiness - Math.floor(hoursPassed * BOREDOM_SPEED_PER_HOUR));
    const newStatus = newSatiety <= 0 ? 'dead' : user.pet_status;

    const updateResult = await dbClient.query(
      'UPDATE users SET pet_satiety = $1, pet_happiness = $2, pet_status = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [newSatiety, newHappiness, newStatus, userId]
    );
    return updateResult.rows[0]; 
  }
  return user;
}

gameRouter.get('/status/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "❌ Некорректный ID пользователя" });
  
  const userState = await getUpdatedUserState(userId);
  if (!userState) return res.status(404).json({ error: "❌ Пользователь не найден" });
  res.json(userState);
});

gameRouter.post('/feed', async (req, res) => {
  const userId = Number(req.body.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "❌ userId обязателен и должен быть числом" });

  const user = await getUpdatedUserState(userId);
  if (!user) return res.status(404).json({ error: "❌ Пользователь не найден" });
  if (user.pet_status === 'dead') return res.status(400).json({ error: "❌ Поздно... Улитка уже мертва" });

  const newSatiety = Math.min(100, user.pet_satiety + 20);
  const updateResult = await dbClient.query(
    'UPDATE users SET pet_satiety = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [newSatiety, userId]
  );
  res.json({ message: "Улитка успешно поела!", user: updateResult.rows[0] }); 
});

gameRouter.get('/pharmacy/coins/:userId', async (req, res) => {
  const result = await dbClient.query('SELECT coins FROM users WHERE id = $1', [Number(req.params.userId)]);
  if (!result.rows.length) return res.status(404).json({ error: "❌ Юзер не найден" });
  res.json({ coins: result.rows[0].coins }); 
});

gameRouter.post('/pharmacy/coins/update', async (req, res) => {
  const result = await dbClient.query(
    'UPDATE users SET coins = coins + $1 WHERE id = $2 RETURNING coins',
    [Number(req.body.amount), Number(req.body.userId)]
  );
  res.json({ coins: result.rows[0].coins }); 
});
