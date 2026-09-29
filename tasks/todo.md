# Чек-лист актуализации документации проекта «Улиткроши»

## Задачи
- [x] 1. Актуализация `tasks/todo.md` (фиксация плана)
- [x] 2. Подготовка и обновление `AGENTS.md` (строго до 300 строк, актуализация стэка на Node.js/PostgreSQL, Ansible NTFS `ANSIBLE_CONFIG=./ansible.cfg`, Debian 13, Certbot SSL, Self-Hosted Runner и триггеры CI/CD)
- [x] 3. Проверка объема `AGENTS.md` (проверка `wc -l AGENTS.md` <= 300 — текущий объем 147 строк)
- [x] 4. Создание и актуализация `README.md` для человека (архитектура, стек, диаграммы Mermaid, ссылка на стенд, CI/CD, Ansible на NTFS, Debian 13 особенности, Certbot SSL решение, описание игровых механик и локальный запуск)
- [x] 5. Обновление `tasks/lessons.md` с извлеченными уроками (NTFS permissions для `ansible.cfg`, standalone certbot, Debian 13 trixie специфики, регистр файлов)
- [x] 6. Фиксация изменений в git и push в `develop`
- [x] 7. Отчет пользователю с подробными пояснениями

## Обзор результатов
1. **Файл `AGENTS.md`:**
   - Полностью переработан и сокращен со 272 до 147 строк (лимит: 300 строк).
   - Содержит все критические правила для ИИ-агента: актуальный стек (Node.js 22 + Express + PostgreSQL 17), параметры VDS, правила запуска Ansible с `ANSIBLE_CONFIG=./ansible.cfg`, решение проблем с Debian 13 (`bookworm`, `libicu-dev`) и Certbot (`--standalone` первичный запуск).
2. **Файл `README.md`:**
   - Написан подробный, визуально привлекательный и структурированный документ для людей.
   - Включает Mermaid-диаграмму архитектуры, бейджи продакшна и статуса, обоснование выбора Self-Hosted Runner, описание триггеров CI/CD, инструкцию по решению NTFS-ограничений в Ansible, специфику Debian 13 и Certbot, а также полное описание игровых механик и руководство по локальному запуску.
3. **Файл `tasks/lessons.md`:**
   - Дополнен 5 новыми уроками (Windows vs Linux case sensitivity, NTFS world-writable gotcha в Ansible, Debian 13 trixie специфики, Certbot standalone bootstrap, конфликты имен контейнеров).
4. **Продакшн стенд:**
   - Успешно развернут и доступен по безопасному HTTPS с валидным сертификатом Let's Encrypt: `https://ulitkroshi.intelcosystem.com`.
