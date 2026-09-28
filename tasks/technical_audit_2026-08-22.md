# Технический аудит проекта «Улиткроши» (Отчет от 22 августа 2026 г.)

**Дата проведения аудита:** 22 августа 2026 г.  
**Анализируемый период:** с 13 августа 2026 г. по 22 августа 2026 г.  
**Цель аудита:** Оценка наличия новых изменений в исходном Git-репозитории разработчиков (`git@github-boss:ulitkroshi/main-source.git`), проверка статуса публичного фронтенда (`https://ulitkroshi.website.twcstorage.ru/`) и текущего состояния VDS-сервера (`91.200.150.9`).

---

## 1. Сводка результатов повторного аудита

| Компонент / Направление | Состояние на 22.08.2026 | Динамика с 13.08.2026 | Ключевой вывод |
|---|---|---|---|
| **1. Исходный Git-репозиторий** | `git@github-boss:ulitkroshi/main-source.git` | 🔴 **0 новых коммитов** | Новые коммиты отсутствуют. Последний доступный коммит — `fc64a42` ("глобальный фикс фронта 1.2") от 23.07.2026. |
| **2. Публичный демо-фронтенд** | `https://ulitkroshi.website.twcstorage.ru/` | 🟡 **Без изменений (S3)** | Сборка на Timeweb Cloud Object Storage не обновлялась (Last-Modified: 08.08.2026). Продолжает работать в режиме **Mock API**. |
| **3. Бэкенд на VDS-сервере** | `dev-api.biolivestick.com` (`91.200.150.9`) | 🔴 **Бэкенд не запущен (502)** | Запущены только контейнеры `openproject` и `hexafra-db`. .NET Web API, Redis и RabbitMQ остановлены/не развернуты. |
| **4. Файловая система VDS** | `/root`, `/opt`, `/etc/nginx` | ⚪ **Без изменений** | Конфигурации Nginx и окружение на VDS за последние 9 дней не подвергались правкам. |

---

## 2. Подробные данные аудита

### 2.1. Аудит Git-репозитория авторов (`git@github-boss:ulitkroshi/main-source.git`)
Проведена сверка указателей веток через `git fetch boss` и `git ls-remote boss`:

* **Ветка `main`**: `3c05ebd9b154bb3f0c75d2d05152c6af2d89c088` (без изменений)
* **Ветка `develop`**: `fe39bc0b17036b55699a2d9d4181178ebdd2f7dc` (без изменений)
* **Ветка `feature/global-patch`**: `fc64a42c66742bb95ee9fa2e4d25d253de242de8` (без изменений, 23.07.2026)
* **Ветка `feature/project-setup`**: `0f6d3e60f8f138dd0c4df18805fc83d0184430c0` (без изменений, 17.07.2026)

**Вывод:** За период 13–22 августа 2026 г. сторонними разработчиками (@zuevus и @Renko-hub) **не было отправлено ни одного нового коммита**.

---

### 2.2. Аудит демо-фронтенда (`https://ulitkroshi.website.twcstorage.ru/`)
Проведен HTTP-анализ заголовков и содержимого клиентского бандла:

* **HTTP Response Headers:**
  * `date: Sat, 22 Aug 2026 11:37:56 GMT`
  * `last-modified: Sat, 08 Aug 2026 18:58:29 GMT`
  * `etag: "b70a805285fb773f2908c40f418048d7"`
  * `x-rgw-object-type: Normal` (Timeweb Cloud S3)
* **Логика работы:**
  * Клиентский бандл `assets/index-kaM1Uekz.js` не перезаливался.
  * Приложение использует исключительно локальный заглушечный сервис **Mock API** (`createMockUser`, `mock_access_token_*`).
  * Связь с бэкендом на VDS (`dev-api.biolivestick.com`) отсутствует.

---

### 2.3. Аудит VDS-сервера (`91.200.150.9:2022`)
Проведено SSH-исследование состояния хоста:

1. **Docker контейнеры (`docker ps -a`):**
   * `openproject` (OpenProject 17) — Up 2 weeks (`0.0.0.0:8080->80/tcp`)
   * `hexafra-db` (Postgres 17) — Up 2 weeks (`5432/tcp`)
   * Игровой бэкенд .NET, Redis и RabbitMQ **не запущены**.
2. **Nginx и REST API:**
   * Конфигурация Nginx проксирует `dev-api.biolivestick.com` на `127.0.0.1:5000`.
   * Прямой запрос к эндпоинтам `https://dev-api.biolivestick.com/api/auth` возвращает `502 Bad Gateway`.

---

## 3. Схема текущего состояния системы (на 22.08.2026)

```mermaid
flowchart TD
    subgraph Client ["Пользователь / Браузер"]
        UserBrowser ["PWA App (Phaser 3 + React)"]
    end

    subgraph TimewebS3 ["Timeweb Cloud (S3 Storage)"]
        S3Bucket ["ulitkroshi.website.twcstorage.ru\n(Сборка от 08.08.2026)"]
    end

    subgraph InternalMock ["Клиентская логика PWA"]
        MockAPI ["Mock API / Zustand Store\n(Автономный режим работы)"]
    end

    subgraph VDS ["VDS Сервер 91.200.150.9"]
        Nginx ["Nginx (80/443)"]
        DevAPI ["dev-api.biolivestick.com:5000\n(Не запущен / 502 Bad Gateway)"]
        OpenProject ["OpenProject :8080 (Работает)"]
        Postgres ["PostgreSQL 17 :5432 (Работает)"]
    end

    UserBrowser -- 1. HTML/JS (без изменений) --> S3Bucket
    UserBrowser -- 2. Игровые механики --> MockAPI
    UserBrowser -.- 3. Запрос /api (502 Bad Gateway) -.- Nginx
    Nginx -.- 502 Bad Gateway -.- DevAPI
```

---

## 4. Заключение и выводы аудита

1. **Отсутствие активности сторонних разработчиков:** В период с 13 по 22 августа 2026 г. команда разработчиков не вносила новых изменений ни в исходный репозиторий, ни на VDS-сервер.
2. **Текущий статус фронтенда:** Демо-версия на S3 полностью работоспособна как PWA-приложение в автономном режимах (мини-игры, уход за питомцем, капча), но работает без бэкенда на Mock-данных.
3. **Готовность к самостоятельной разработке:** Рабочий репозиторий `git@github.com:JMNext/ulitkroshi.git` содержит наиболее актуальный код проекта и готов к развертыванию бэкенда на VDS-сервере силaми ИИ-агента.
