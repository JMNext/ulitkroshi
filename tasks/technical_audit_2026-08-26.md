# Технический аудит проекта «Улиткроши» (Отчет от 26 августа 2026 г.)

**Дата проведения аудита:** 26 августа 2026 г.  
**Анализируемый период:** с 22 августа 2026 г. по 26 августа 2026 г.  
**Цель аудита:** Оценка наличия новых изменений в исходном Git-репозитории разработчиков (`git@github-boss:ulitkroshi/main-source.git`), проверка статуса публичного демо-фронтенда (`https://ulitkroshi.website.twcstorage.ru/`) и текущего состояния VDS-сервера (`91.200.150.9`).

---

## 1. Сводка результатов аудита

| Компонент / Направление | Состояние на 26.08.2026 | Динамика с 22.08.2026 | Ключевой вывод |
|---|---|---|---|
| **1. Публичный демо-фронтенд** | `https://ulitkroshi.website.twcstorage.ru/` | 🟢 **НОВЫЙ ДЕПЛОЙ (25.08.2026)** | Разработчики задеплоили обновленную сборку на Timeweb Cloud S3 (25.08.2026 15:35:51 GMT). Код продолжает работать в **Mock API** режиме. |
| **2. Исходный Git-репозиторий** | `git@github-boss:ulitkroshi/main-source.git` | 🔴 **0 новых коммитов** | В внешнем Git-репозитории новые коммиты отсутствуют. Последний доступный коммит — `fc64a42` ("глобальный фикс фронта 1.2") от 23.07.2026. |
| **3. Бэкенд на VDS-сервере** | `dev-api.biolivestick.com` (`91.200.150.9`) | 🔴 **Бэкенд не запущен (502)** | Запущены только контейнеры `openproject` и `hexafra-db`. .NET Web API, Redis и RabbitMQ остановлены/не развернуты. |
| **4. Файловая система VDS** | `/root`, `/opt`, `/etc/nginx` | ⚪ **Без изменений** | Конфигурации Nginx и окружение на VDS за последние 4 дня не подвергались изменениям. |

---

## 2. Подробные данные аудита

### 2.1. Аудит обновленного демо-фронтенда (`https://ulitkroshi.website.twcstorage.ru/`)
Проведен HTTP-анализ заголовков и содержимого клиентского бандла:

* **HTTP Response Headers:**
  * `date: Wed, 26 Aug 2026 10:04:28 GMT`
  * `last-modified: Tue, 25 Aug 2026 15:35:51 GMT` *(Зафиксирована обнова от 25 августа)*
  * `etag: "3bacbeae8c8c6ec5f2bcd169e0275fde"` *(Новый ETag бандла)*
  * `x-rgw-object-type: Normal` (Timeweb Cloud S3)
* **Анализ сборки:**
  * Обновленный главный клиентский бандл: `/assets/index-Dm8eE9eZ.js`.
  * Пересобраны компоненты Phaser 3 и React UI.
  * **Логика работы API:** Приложение по-прежнему полностью использует автономный заглушечный сервис **Mock API** (`mock_access_token_*`). Прямых вызовов к бэкенду на VDS (`dev-api.biolivestick.com`) не обнаружено.

---

### 2.2. Аудит Git-репозитория авторов (`git@github-boss:ulitkroshi/main-source.git`)
Проведена сверка указателей веток через `git fetch boss` и `git ls-remote boss`:

* **Ветка `main`**: `3c05ebd9b154bb3f0c75d2d05152c6af2d89c088` (без изменений)
* **Ветка `develop`**: `fe39bc0b17036b55699a2d9d4181178ebdd2f7dc` (без изменений)
* **Ветка `feature/global-patch`**: `fc64a42c66742bb95ee9fa2e4d25d253de242de8` (без изменений, 23.07.2026)
* **Ветка `feature/project-setup`**: `0f6d3e60f8f138dd0c4df18805fc83d0184430c0` (без изменений, 17.07.2026)

**Вывод:** Исходные файлы проекта в GitHub-репозитории авторов не обновлялись (изменения фронтенда от 25.08 были задеплоены на S3 мимо коммитов в Git).

---

### 2.3. Аудит VDS-сервера (`91.200.150.9:2022`)
Проведено SSH-исследование состояния хоста:

1. **Docker контейнеры (`docker ps -a`):**
   * `openproject` (OpenProject 17) — Up 3 weeks (`0.0.0.0:8080->80/tcp`)
   * `hexafra-db` (Postgres 17) — Up 3 weeks (`5432/tcp`)
   * Контейнеры бэкенда .NET, Redis и RabbitMQ **не запущены**.
2. **Nginx и REST API:**
   * Конфигурация Nginx проксирует `dev-api.biolivestick.com` на `127.0.0.1:5000`.
   * Прямой запрос к эндпоинтам `https://dev-api.biolivestick.com/api/auth` возвращает `502 Bad Gateway`.

---

## 3. Схема текущего состояния системы (на 26.08.2026)

```mermaid
flowchart TD
    subgraph Client ["Пользователь / Браузер"]
        UserBrowser ["PWA App (Phaser 3 + React)"]
    end

    subgraph TimewebS3 ["Timeweb Cloud (S3 Storage)"]
        S3Bucket ["ulitkroshi.website.twcstorage.ru\n(Новая сборка от 25.08.2026)"]
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

    UserBrowser -- 1. HTML/JS (Обновлен 25.08) --> S3Bucket
    UserBrowser -- 2. Игровые механики --> MockAPI
    UserBrowser -.- 3. Запрос /api (502 Bad Gateway) -.- Nginx
    Nginx -.- 502 Bad Gateway -.- DevAPI
```

---

## 4. Заключение и выводы аудита

1. **Активность авторов на фронтенде:** 25 августа 2026 г. сторонние разработчики выложили новую версию сборки PWA-фронтенда на площадку Timeweb Cloud S3.
2. **Отсутствие коммитов в Git:** Исходный код новой сборки не закоммичен в `git@github-boss:ulitkroshi/main-source.git`.
3. **Статус серверной части:** Бэкенд на VDS остается в остановленном состоянии. Приложение на S3 продолжает работать в автономном режиме с Mock API.
