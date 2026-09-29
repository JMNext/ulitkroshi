# Ansible плейбуки для подготовки VDS сервера JMNext

Данный набор плейбуков подготавливает VDS сервер под управление CI/CD проекта «Улиткроши».

## Что настраивается на сервере:
1. **Базовая безопасность (роль `common`)**: UFW фаервол (порты 22, 80, 443), fail2ban, утилиты curl, git, htop, часовой пояс Europe/Moscow.
2. **Docker Engine (роль `docker`)**: официальный Docker CE + Docker Compose v2 plugin.
3. **GitHub Actions Runner (роль `github-runner`)**: официальный раннер GitHub под управлением systemd демона с автоматическим автозапуском при перезагрузке.

## Быстрый запуск:

1. Укажите IP-адрес вашего сервера в `inventories/development/hosts`.
2. В файле `inventories/development/group_vars/all.yml` укажите токен регистрации раннера:
   * GitHub -> Репозиторий `JMNext/ulitkroshi` -> Settings -> Actions -> Runners -> New self-hosted runner.
   * Скопируйте токен из команды регистрации и вставьте в `github_runner_token`.
3. Запустите плейбук:
   ```bash
   ansible-playbook -i inventories/development/hosts playbooks/setup-server.yml
   ```
