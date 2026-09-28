# Чек-лист синхронизации и настройки CI/CD проекта «Улиткроши» (VDS JMNext)

## Задачи
- [x] 1. Анализ текущего состояния Git (ветки, различия между `boss/main`, локальными ветками и `origin`)
- [x] 2. Анализ механизмов CI/CD и деплоя первоначальных разработчиков (`boss/main`)
- [x] 3. Анализ инфраструктуры `cure-infra` (ветка `integrate-cure-infra`, Ansible роли, Gitea runner, Nginx, Docker)
- [x] 4. Оценка достаточности настроек и согласование архитектуры CI/CD (Self-Hosted Runner через systemd, автодеплой по push в develop + тег)
- [ ] 5. Подтягивание всех актуальных наработок первоначальных разработчиков (`boss/main`) в рабочую ветку (`feature/global-patch`) и пуш в `origin`
- [ ] 6. Подготовка конфигурации развертывания проекта под Docker Compose (бэкенд Node.js 23 + PostgreSQL + Nginx)
- [ ] 7. Создание Ansible-плейбука для VDS JMNext (подготовка сервера, Docker, systemd GitHub Actions Runner)
- [ ] 8. Создание пайплайна GitHub Actions (`.github/workflows/deploy.yml`)
- [ ] 9. Фиксация результатов анализа и документации в `tasks/`

## Обзор результатов
*(Будет заполняться по мере выполнения)*
