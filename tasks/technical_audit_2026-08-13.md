# Технический аудит проекта «Улиткроши» (Отчет от 13 августа 2026 г.)

**Период аудита:** с 30 июля 2026 г. по 13 августа 2026 г.  
**Цель аудита:** Проверка изменений в исходном Git-репозитории разработчиков (`git@github-boss:ulitkroshi/main-source.git`), анализ нового демо-фронтенда (`https://ulitkroshi.website.twcstorage.ru/`) и проверка состояния VDS-сервера (`91.200.150.9`).

---

## 1. Резюме аудита

| Направление аудита | Состояние / Результат | Ключевой вывод |
|---|---|---|
| **1. Документация проекта** | 🟢 **Обновлена** | Файлы `AGENTS.md` и `AGENTS.local.md` актуализированы. Добавлены репозитории, кредиты OpenProject, вехи и ссылки. |
| **2. Публичный демо-фронтенд** | 🟡 **Задеплоен на Timeweb S3** | Ссылка `https://ulitkroshi.website.twcstorage.ru/` ведет на S3 Object Storage (Timeweb Cloud). Фронтенд работает в автономном **Offline/Mock режиме** (к бэкенду на VDS не обращается). |
| **3. Git-репозиторий разработчиков** | 🔴 **Изменения отсутствуют (0 коммитов)** | В репозитории `git@github-boss:ulitkroshi/main-source.git` с 30.07.2026 по 13.08.2026 **не появилось ни одного нового коммита** (последний коммит `fc64a42` от 23.07.2026). |
| **4. VDS-сервер (`91.200.150.9`)** | 🔴 **Бэкенд не запущен (502 Bad Gateway)** | На VDS работают только Docker-контейнеры `openproject` и `hexafra-db`. Контейнеры .NET Web API, Redis и RabbitMQ **отсутствуют/остановлены**. Запросы к `dev-api.biolivestick.com` отдают 502 Bad Gateway. |

---

## 2. Детальные результаты исследования

### 2.1. Анализ нового публичного фронтенда (`https://ulitkroshi.website.twcstorage.ru/`)
* **Где задеплоен:** Фронтенд развернут **НЕ на VDS-сервере**, а размещен как статический сайт в **Timeweb Cloud Object Storage (S3)**.
  * HTTP-заголовки ответа: `server: nginx`, `x-rgw-object-type: Normal`, `x-amz-request-id: tx00000...`, домен `twcstorage.ru`.
* **Взаимодействие с бэкендом:** 
  * Анализ загружаемого клиентского бандла (`assets/index-kaM1Uekz.js`) показал, что приложение полностью использует встроенный заглушечный сервис **Mock API**:
    * Авторизация генерирует `mock_access_token_fruit_*` и `mock_access_token_qr_*`.
    * Профиль возвращает объект `createMockUser` (`mock-uid-12345`).
    * Регистрация возвращает `"Mock registration successful"`.
    * Аналитика выводит `"Yandex.Metrika Mock"`.
  * Приложение **не осуществляет HTTP/REST или WebSocket (SignalR) запросов** к хосту бэкенда (`dev-api.biolivestick.com` / `91.200.150.9`).

---

### 2.2. Анализ изменений в Git-репозитории `git@github-boss:ulitkroshi/main-source.git`
К локальному репозиторию был подключен внешнеполитический remote `boss` (`git@github-boss:ulitkroshi/main-source.git`) и выполнена синхронизация `git fetch boss`.

* **Статус веток:**
  * `boss/main`: `3c05ebd` (Merge pull request #1, 09.07.2026)
  * `boss/develop`: `fe39bc0` (Merge pull request #3, 14.07.2026)
  * `boss/feature/global-patch`: `fc64a42` (глобальный фикс фронта 1.2, 23.07.2026)
  * `boss/feature/project-setup`: `0f6d3e6` (косяки адаптива..., 17.07.2026)
* **Вывод:** С момента снятия копии 30.07.2026 исходный репозиторий разработчиков **не обновлялся**. Авторы не отправляли (`push`) новые коммиты.

---

### 2.3. Анализ состояния VDS-сервера (`91.200.150.9:2022`)
Проведено SSH-инспектирование хоста `91.200.150.9` в режиме чтения:

1. **Docker-контейнеры (`docker ps -a`):**
   * `openproject` (OpenProject 17) — Up 8 days (port 8080->80)
   * `hexafra-db` (Postgres 17) — Up 8 days (port 5432)
   * Контейнеры бэкенда `ulitkroshi-api`, `redis`, `rabbitmq` **отсутствуют в списке запущенных и остановленных**.
2. **Nginx Reverse Proxy:**
   * Проксирует `dev-api.biolivestick.com` на `127.0.0.1:5000`.
   * Так как сервис на порту 5000 не запущен, при обращении к REST API получаем ошибку **`502 Bad Gateway`**.
3. **Файловая система VDS:**
   * С 30.07.2026 изменений в конфигурациях приложения или Docker-файлах на сервере не производилось. Последние операции в `bash_history` касались настройки OpenProject и сети.

---

## 3. Итоговая схема архитектуры на 13.08.2026

```mermaid
flowchart TD
    subgraph Client ["Пользователь / Браузер"]
        UserBrowser ["PWA App (Phaser 3 + React)"]
    end

    subgraph TimewebS3 ["Timeweb Cloud (S3 Object Storage)"]
        S3Bucket ["ulitkroshi.website.twcstorage.ru\n(Статические JS/CSS/Assets)"]
    end

    subgraph InternalMock ["Клиентская логика PWA"]
        MockAPI ["Zustand Local Storage & Mock API\n(mock_access_token, MockUser)"]
    end

    subgraph VDS ["VDS Сервер 91.200.150.9"]
        Nginx ["Nginx (80/443)"]
        DevAPI ["dev-api.biolivestick.com:5000\n(Остановлен / 502 Bad Gateway)"]
        OpenProject ["OpenProject :8080 (Работает)"]
        Postgres ["PostgreSQL 17 :5432 (Работает)"]
    end

    UserBrowser -- 1. Загрузка HTML/JS --> S3Bucket
    UserBrowser -- 2. Игровой процесс / Авторизация --> MockAPI
    UserBrowser -.- 3. Запрос /api (Не подключен / 502) -.- Nginx
    Nginx -.- 502 Bad Gateway -.- DevAPI
```

---

## 4. Рекомендации и дальнейшие шаги

1. **По фронтенду:**
   * Разработка демо на S3 Timeweb позволяет протестировать анимации Phaser и UI автономно, но приложение остается обособленным от серверной базы данных.
2. **По бэкенду:**
   * Для перевода приложения с Mock API на реальный сервер требуется развернуть .NET 10 Web API на VDS через `docker-compose` в `deployment/` и запустить сервер на порту 5000.
3. **По синхронизации репозиториев:**
   * Попросить сторонних разработчиков при необходимости закоммитить и запушить свои локальные наработки в `git@github-boss:ulitkroshi/main-source.git`, после чего мы сможем быстро слить (`merge`/`rebase`) их в рабочий репозиторий `JMNext/ulitkroshi.git`.
