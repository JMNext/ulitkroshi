# Отчет по техническому аудиту проекта «Улиткроши» (22.09.2026 — 27.09.2026)
## Аудит релиза «Версия 1.2» и проверка сервера `https://ulitkroshi.webtm.ru`

> **Дата аудита:** 27 сентября 2026 г.  
> **Анализируемый период:** 22.09.2026 — 27.09.2026  
> **Оригинальный репозиторий:** `git@github-boss:ulitkroshi/main-source.git` (ветка `main`, коммиты `e49e185`..`23c7f50`)  
> **Рабочий игровой сервер:** `https://ulitkroshi.webtm.ru` (IP `91.200.150.9`)  
> **Предыдущий демо-стенд S3:** `https://ulitkroshi.website.twcstorage.ru/` (заморожен на 24.09.2026)  
> **Документ разработчика:** `Отчёт_о_готовности_проекта_Улиткроши_Версия_1_2.docx`

---

## 1. Сводный вердикт и реальная готовность софта

1. **Работа с реальным бэкендом (Client-Server):**
   * **Флаг `isMock = false` активирован.** Фронтенд на сервере действительно переведен в режим сетевых запросов.
   * На сервере `91.200.150.9` запущен монолитный сервер Node.js/Express (`backend/server.ts`, порт 3005) и СУБД PostgreSQL.
   * **Авторизация и сессии работают с БД:** Регистрация, верификация SMS (через MVP-код), генерация фруктового графического пароля, выдача парных JWT-токенов (`accessToken` / `refreshToken`), запрос профиля (`/auth/me`) и сохранение характеристик питомца (`PUT /auth/pet/stats`) успешно сохраняются в таблице `users` PostgreSQL.
2. **КРИТИЧЕСКИЙ БЛОКЕР №1: Неработоспособность игрового API (`/game/*`):**
   * В конфигурации Nginx на сервере настроен прокси для `/auth`, но **забыт блок для `/game`**.
   * Запросы `POST /game/pharmacy/action` и `POST /game/pharmacy/feed` возвращают ошибку веб-сервера **`405 Not Allowed`**.
   * Запрос `GET /game/pharmacy/coins` возвращает HTML-страницу (`index.html`) вместо JSON.
   * **Следствие:** Игровая экономика, начисление монет в 4 мини-играх и покупка еды на сервере **НЕ РАБОТАЮТ**. Фронтенд скрывает эту ошибку через `catch { return true; }` и сохраняет баланс исключительно в `localStorage` браузера клиента.
3. **КРИТИЧЕСКИЙ БЛОКЕР №2: Ошибка SSL-сертификата (Self-Signed):**
   * На домене `https://ulitkroshi.webtm.ru` установлен **самоподписанный SSL-сертификат**.
   * При переходе на сайт обычный пользователь видит полноэкранное предупреждение браузера: `NET::ERR_CERT_AUTHORITY_INVALID` («Подключение не защищено»).
4. **Общая оценка готовности MVP:** **~70%** (Ядро UI/Phaser, 4 мини-игры и авторизация с БД готовы, но маршрутизация API экономики и безопасность SSL сломаны).

---

## 2. Анализ отчета разработчика Renko («Версия 1.2») vs Реальность в коде

| Пункт отчета Renko | Заявлено в docx-отчете | Реальное состояние в кодовой базе и на сервере | Статус проверки |
|---|---|---|---|
| **Прямой адрес сервера** | `http://ulitkroshi.webtm.ru/` (100% готов) | Сервер доступен, но HTTP редиректит на HTTPS с самоподписанным SSL (`curl (60) SSL certificate problem`). | ⚠️ Частично |
| **Хэширование паролей** | *«Хэширование паролей на бэкенде через библиотеку bcrypt (95%)»* | В коде `backend/auth-service/auth.service.ts` используется стандартный `crypto.createHash("sha256")`. Библиотеки `bcrypt` в зависимостях нет. | ❌ Несоответствие |
| **Блокировка пользователей** | *«requireAuth Middleware: при is_suspended = true сервер блокирует доступ...»* | В схеме БД и в `auth.middleware.ts` колонка и проверка `is_suspended` **полностью отсутствуют**. | ❌ Фикция в отчете |
| **SMS-шлюз (SMS.ru)** | *«Интеграция с SMS-шлюзом...»* | В `auth.service.ts` грубая синтаксическая ошибка: `url = https://sms.ru{SMS_RU_API_KEY}&to=...` (пропущен `$` и путь `/sms/send?api_id=`). Реальные SMS не уходят, код берется через эндпоинт `/auth/login/get-mvp-code`. | ⚠️ Работает через MVP-костыль |
| **Игровая экономика и античит** | *«Контроль начисления монет в GameService. Защита от спама 429...»* | Из-за ошибки Nginx все запросы к `/game/pharmacy/action` падают с `405 Not Allowed`. Баланс монет в БД PostgreSQL **всегда равен 0**, монеты живут только в `localStorage`. | ❌ Не работает на сервере |
| **Сканер QR-кодов** | *«100% добавление персонажей с упаковок. Без дубликатов (100%)»* | Вся логика выполняется на клиенте в `profile.slice.ts` по формуле `(clean.length % 19) + 1` без обращения к серверу. Таблицы кодов в БД нет. | ❌ Фикция на клиенте |
| **Инвентарь еды** | *«Списание при покупках продуктов питания...»* | Таблицы инвентаря в PostgreSQL нет. Купленная еда хранится только в Zustand/LocalStorage и обнуляется при новом входе. | ⚠️ Только на клиенте |
| **Модуль мини-игр** | 4 мини-игры: «Сбор урожая», «Змейка», «Мемори», «Фруктовые гонки» | Все 4 игры полностью реализованы на Phaser 3, интегрированы с `BaseMiniGameOverlay.tsx` и `GameInputController.ts`. | ✅ Выполнено (100%) |
| **Динамическое масштабирование** | Поддержка 90% существующих разрешений | Модуль `mainLayoutHelper.ts` и Tailwind адаптивность корректно отрабатывают для Fold, Mobile, Tablet, iPad и Desktop. | ✅ Выполнено (100%) |

---

## 3. Детальные результаты тестирования API на сервере `ulitkroshi.webtm.ru`

### 3.1. Успешно работающие эндпоинты (`/auth/*`):
* `POST /auth/login/phone-check` ➔ `{"success": true, "isLogin": false}` (200 OK)
* `POST /auth/login/phone` ➔ `{"success": true, "sessionId": "sess_...", "isLogin": false}` (200 OK)
* `GET /auth/login/get-mvp-code?sessionId=...` ➔ `{"code": "4268"}` (200 OK)
* `POST /auth/login/verify-sms` ➔ `{"sessionId": "fruit_..."}` (200 OK)
* `POST /auth/register/fruit` ➔ Возвращает `accessToken`, `refreshToken` и профиль пользователя с созданием записи в PostgreSQL:
  ```json
  {
    "id": 4,
    "phone": "79991112233",
    "name": "Player#6175",
    "discriminator": "6175",
    "coins": 0,
    "unlockedPets": 1,
    "petNames": ["Тест"],
    "petHealths": [100],
    "petExperiences": [0],
    "petStars": [1]
  }
  ```
* `GET /auth/me` (с JWT) ➔ Успешно валидирует токен и возвращает профиль игрока из БД (200 OK).
* `PUT /auth/pet/stats` ➔ Успешно сохраняет здоровье, опыт и звезды питомца в массивы `pet_healths`, `pet_experiences`, `pet_stars` таблицы `users` (200 OK).

### 3.2. Неработающие эндпоинты (`/game/*`):
* `POST /game/pharmacy/action` ➔ **`HTTP 405 Not Allowed` (Nginx)**. Эндпоинт начисления монет за мини-игры и покупки в аптеке заблокирован Nginx.
* `POST /game/pharmacy/feed` ➔ **`HTTP 405 Not Allowed` (Nginx)**. Серверное кормление заблокировано.
* `GET /game/pharmacy/coins` ➔ Возвращает HTML `<!doctype html>` (200 OK Nginx static fallback). В приложении падает JSON.parse.

---

## 4. Архитектура базы данных PostgreSQL (Текущее состояние)

В базе данных на сервере инициализированы 2 таблицы:
```sql
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(100),
  player_name VARCHAR(60) UNIQUE,
  unlocked_pets INT DEFAULT 1,
  pet_names TEXT[] DEFAULT ARRAY[]::TEXT[],
  pet_healths INT[] DEFAULT ARRAY[]::INTEGER[],
  pet_experiences INT[] DEFAULT ARRAY[]::INTEGER[],
  pet_stars INT[] DEFAULT ARRAY[]::INTEGER[],
  coins INT DEFAULT 0,
  last_minigame_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP - INTERVAL '1 minute',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.token_blacklist (
  token TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Архитектурные замечания по БД:
1. **Отсутствие таблиц сущностей:** Нет таблиц `user_inventory` (купленная еда), `promo_codes` (QR-коды продукции), `transactions` (история монет).
2. **Баг в `backend/game-service/game.service.ts`:**
   В коде обновления здоровья при кормлении написан запрос:
   `UPDATE users SET pet_healths = LEAST(100, COALESCE(pet_healths, 100) + 20)`
   Поскольку колонка `pet_healths` объявлена как массив `INT[]`, этот SQL-запрос при вызове упадет с ошибкой PostgreSQL `operator does not exist: integer[] + integer`.

---

## 5. Что необходимо исправить разработчику для завершения Версии 1.2

1. **Исправить Nginx на сервере (Срочно):**
   Добавить в конфигурационный файл `/etc/nginx/sites-available/...` проксирование для `/game`:
   ```nginx
   location /game/ {
       proxy_pass http://127.0.0.1:3005;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```
2. **Установить валидный бесплатный SSL-сертификат Let's Encrypt:**
   Выполнить на сервере: `certbot --nginx -d ulitkroshi.webtm.ru`, чтобы браузеры открывали игру без предупреждений о небезопасном подключении.
3. **Исправить SQL-запросы работы с массивами в `game.service.ts`** (или перевести `feed` на работу через `PUT /auth/pet/stats`, который уже корректно обновляет массивы).
4. **Устранить хардкод `localhost:3005` в `navigator.sendBeacon`** (`auth.api.ts`).
5. **Исправить отправку реальных SMS в `auth.service.ts`** (`https://sms.ru/sms/send?api_id=...`).
