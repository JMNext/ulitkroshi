import express from 'express';
import cors from 'cors';
import { authRouter } from './auth.router';
import { dbClient, initDatabase } from './db';
import { gameRouter } from './game.router';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/game', gameRouter);

app.get('/', (_req, res) => {
  res.json({ message: "Главный шлюз Улиток-Тамагочи работает!" });
});

async function startServer() {
  try {
    await dbClient.connect();
    console.log('🚀 [SERVER] Успешное подключение к PostgreSQL!');
    
    await initDatabase();
    console.log('✅ [SERVER] Инициализация базы данных успешно завершена.');
    
    app.listen(PORT, () => {
      console.log(`🎉 [SERVER] Экспресс-сервер Улиток запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('❌ [SERVER] Ошибка при старте:', error);
  }
}

startServer();
