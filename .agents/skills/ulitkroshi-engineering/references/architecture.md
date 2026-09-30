# Архитектурное руководство: Frontend, Phaser 3 и Backend

## 1. Frontend & Phaser 3 Модель Взаимодействия

### Структура каталогов
```
frontend/src/
├── MainScene/              # Главный экран (Тамагочи)
│   ├── components/         # React UI компоненты (PetCharacter, HUD, Модалки)
│   └── store/              # Zustand сторы состояния питомца
├── game/                   # Игровой контекст Phaser
│   ├── scenes/             # Boot, Preloader, Login, MainGame
│   ├── MiniGames/          # Мини-игры (CatchGame, RacingGame, SnakeGame, MemoryGame)
│   └── MiniGamesShared/    # Общие контроллеры, адаптивный ресайз
└── api/                    # Axios клиент с интерцепторами обновления токенов
```

### Принцип разделения контекстов
1. **Phaser Canvas** инициализируется внутри `#game-container` со стилями:
   ```css
   #game-container {
     position: absolute;
     inset: 0;
     width: 100%;
     height: 100dvh;
     overflow: hidden;
     z-index: 0;
   }
   ```
2. **React Root** размещается поверх с прозрачным фоном и `pointer-events-none` по умолчанию:
   ```css
   #root {
     position: absolute;
     inset: 0;
     width: 100%;
     height: 100dvh;
     pointer-events: none;
     z-index: 10;
   }
   ```
   Интерактивные элементы UI (кнопки, плашки, модальные окна) явно включают `pointer-events-auto`.

### Мобильная специфика WebKit (iOS)
- **Видео с альфа-каналом:** Тег `<video>` должен содержать `<source>` в строгом порядке:
  ```html
  <video muted playsinline loop>
    <source src="anim.mov" type='video/mp4; codecs="hvc1"' />
    <source src="anim.mov" type='video/quicktime; codecs="hvc1"' />
    <source src="anim.webm" type="video/webm; codecs=vp9,vorbis" />
  </video>
  ```
- **Web Audio Fallback:** При загрузке в `PreloaderScene` обязательно устанавливать таймаут на 3000 мс для перехода на экран логина, если Web Audio API заблокирован браузером до первого тапа.

---

## 2. Backend & API Модель

### Структура монолита
```
backend/
├── auth-service/           # Маршруты и логика авторизации
│   ├── routes/
│   └── auth.service.ts
├── game-service/           # Маршруты и механики игры
│   ├── routes/
│   └── pet.service.ts
├── shared/                 # Общие ресурсы
│   ├── db.ts               # Пул соединений PostgreSQL
│   ├── auth.middleware.ts  # Проверка JWT и блэклиста
│   └── logger.ts           # Структурированное логирование
└── server.ts               # Точка сборки Express приложения (:3005)
```

### Сетевая безопасность и проксирование
Nginx транслирует входящий трафик:
- `https://ulitkroshi.intelcosystem.com/auth/*` -> `http://backend:3005/auth/*`
- `https://ulitkroshi.intelcosystem.com/game/*` -> `http://backend:3005/game/*`
- Все статические файлы обслуживаются напрямую из `/var/www/frontend/dist`.
