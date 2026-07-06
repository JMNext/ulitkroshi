# Документация по настройки и установки серверов окружения

## Схема редиректа nginx

```text
мой-домен.com:80   ──► 301 → https://www.мой-домен.com
мой-домен.com:443  ──► 301 → https://www.мой-домен.com

www.мой-домен.com:80  ──► 301 → https://www.мой-домен.com
www.мой-домен.com:443 ──► :8098

dev-app.мой-домен.com:80  ──► 301 → https://dev-app.мой-домен.com
dev-app.мой-домен.com:443 ──► :8088
```

## Для запуска Ansible конфигурации используется WSL

1. Устанавливаем Python Ansible (из wsl)
```bash
sudo apt install python3-pip
pip3 install ansible
echo 'export PATH=$HOME/.local/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
ansible --version
```

2. Проверка статуса
```bash
ansible-playbook -i inventory.yml setup-server.yml -v --limit development --tags "status"
```

3. Переходим в папку с проектом инфраструктуры и устанавливаем необходимые переменные
```bash
cd /mnt/d/.../source/infrastructure/Ansible
export DEV_APP_PASSWORD="2uKph9UlP2hu"
```

4. Запускаем развёртывание для среды (в примере develop)
```bash
ansible-playbook -i inventory.yml setup-server.yml -v --limit development
```

> [!WARNING]
> Игнорируем ошибку с Debian.yml - это не критично

## Архитектура и подход к конфигурации

### Обзор решения

Разработана полностью автоматизированная система развертывания сервера для проекта Улиткроши с использованием **Ansible** и **Docker**. Решение обеспечивает идемпотентную, безопасную и масштабируемую конфигурацию как для development, так и для production окружений.

```mermaid
graph TB
    subgraph "Control Machine WSL/Ubuntu"
        A[Ansible Playbook]
        B[Inventory.yml]
        C[SSH Keys]
    end
    
    subgraph "Target Server Ubuntu 24.04"
        D[SSH Daemon Port 2022]
        E[UFW Firewall]
        F[Docker Engine]
        G[Nginx Proxy]
        H[Certbot SSL]
        I[Fail2ban]
        J[Monitoring Agent]
    end
    
    subgraph "Application Layer"
        K[Backend API Port 8080]
        L[Frontend UI Port 8088]
        M[Seq Logs Port 5341]
        N[FreeSwitch Ports]
    end
    
    A -->|SSH| D
    A -->|Configures| E
    A -->|Installs| F
    A -->|Sets up| G
    A -->|Obtains| H
    A -->|Enables| I
    A -->|Deploys| J
    
    G --> K
    G --> L
    G --> M
    D -->|Protected by| I
    E -->|Controls| G
    F -->|Runs| J
```

### 1. Структура директорий

```mermaid
graph LR
    subgraph "Ansible Infrastructure"
        A[ansible/]
        B[inventory.yml]
        C[setup-server.yml]
        D[tasks/]
        E[templates/]
        F[files/]
        G[handlers/]
    end
    
    subgraph "Tasks"
        D1[docker-setup.yml]
        D2[user-setup.yml]
        D3[firewall-setup.yml]
        D4[nginx-setup.yml]
        D5[fail2ban-setup.yml]
        D6[agent-setup.yml]
    end
    
    subgraph "Templates"
        E1[nginx-app.conf.j2]
        E2[sshd_config.j2]
        E3[fail2ban-ssh.conf.j2]
        E4[docker-compose-agent.yml.j2]
        E5[logrotate.conf.j2]
        E6[agent.env.j2]
    end
    
    A --> D
    A --> E
    A --> F
    A --> G
    D --> D1 & D2 & D3 & D4 & D5 & D6
    E --> E1 & E2 & E3 & E4 & E5 & E6
```

### 2. Процесс развертывания

```mermaid
sequenceDiagram
    participant Admin as Администратор
    participant Ansible as Ansible Control
    participant Server as Target Server
    participant Docker as Docker Engine
    participant Nginx as Nginx Proxy
    
    Admin->>Ansible: Запуск playbook
    Ansible->>Server: SSH подключение (root)
    Ansible->>Server: Установка Python3 и six
    Ansible->>Server: Настройка UFW firewall
    
    par Security Setup
        Ansible->>Server: Создание пользователя sysop
        Ansible->>Server: Настройка SSH (port 2022, ключи)
        Ansible->>Server: Включение fail2ban
    end
    
    par Application Setup
        Ansible->>Server: Установка Docker + Compose
        Ansible->>Docker: Создание сетей
        Ansible->>Server: Установка Nginx + Certbot
        Ansible->>Nginx: Настройка vhosts
        Ansible->>Server: Получение SSL сертификатов
        Ansible->>Docker: Развертывание агента
    end
    
    Server-->>Admin: Готово ✅
```

### 3. Компоненты безопасности

```mermaid
flowchart TD
    subgraph "Security Layer"
        A[SSH Port 2022]
        B[Key-based Auth]
        C[UFW Firewall]
        D[Fail2ban]
        E[SSL/TLS Certificates]
    end
    
    subgraph "Access Control"
        F[sysop user]
        G[sudo group]
        H[authorized_keys]
        I[Docker group]
    end
    
    subgraph "Network Protection"
        J[Rate Limiting]
        K[Port Filtering]
        L[Brute Force Protection]
        M[HTTPS Only]
    end
    
    A --> B
    B --> F
    F --> G
    G --> C
    C --> D
    D --> L
    E --> M
```

### 4. Инвентаризация и окружения

```mermaid
graph TD
    subgraph "Environments"
        A[development]
        B[production]
    end
    
    subgraph "Development"
        C[dev-app.biolivestick.com]
        D[Port 2022]
        E[Debug enabled]
        F[Agent active]
    end
    
    subgraph "Production"
        G[app.biolivestick.com]
        H[Port 2022]
        I[Debug disabled]
        J[Agent optional]
    end
    
    A --> C
    A --> D
    A --> E
    A --> F
    
    B --> G
    B --> H
    B --> I
    B --> J
```

### 5. Мульти-доменная Nginx конфигурация

```mermaid
flowchart LR
    subgraph "Incoming Traffic"
        A[HTTP :80]
        B[HTTPS :443]
    end
    
    subgraph "Nginx Router"
        C[www.dev-app]
        D[dev-app]
        E[apex domain]
    end
    
    subgraph "Backend Services"
        F[Backend API :8080]
        G[Frontend :8088]
        H[App UI :8098]
    end
    
    A --> C
    A --> D
    A --> E
    B --> C
    B --> D
    B --> E
    
    C --> H
    D --> G
    D --> F
    E --> C
```

### 6. Docker сеть и контейнеры

```mermaid
graph TB
    subgraph "Docker Networks"
        A[cure-services-network]
        B[monitoring-network]
    end
    
    subgraph "Containers"
        C[orion-app-dev Agent]
        D[Future Backend]
        E[Future Frontend]
    end
    
    subgraph "Volumes"
        F[/var/log/orion-agent]
        G[/opt/orion-agent/data]
        H[/var/run/docker.sock]
    end
    
    C --> A
    C --> B
    D --> A
    E --> A
    
    C -.-> F
    C -.-> G
    C -.-> H
```

### 7. Пошаговый workflow

```mermaid
stateDiagram-v2
    [*] --> Bootstrap: Запуск playbook
    
    state Bootstrap {
        [*] --> CheckPython
        CheckPython --> InstallPython: если нет
        InstallPython --> InstallSix
        CheckPython --> InstallSix: если есть
        InstallSix --> GatherFacts
    }
    
    Bootstrap --> DockerSetup
    DockerSetup --> UserSetup
    UserSetup --> FirewallSetup
    FirewallSetup --> NginxSetup
    
    state NginxSetup {
        [*] --> DeployHTTP
        DeployHTTP --> GetCerts
        GetCerts --> DeploySSL
        DeploySSL --> ReloadNginx
    }
    
    NginxSetup --> AgentSetup
    AgentSetup --> [*]: Сервер готов
```
### 8. Логика получения SSL

```mermaid
flowchart TD
    A[Проверка доменов] --> B{Существует сертификат?}
    B -->|Да| C[Использовать существующий]
    B -->|Нет| D[Запрос certbot --webroot]
    
    D --> E{Успешно?}
    E -->|Да| F[Добавить в ssl_domains]
    E -->|Нет| G[Оставить HTTP only]
    
    C --> H[Включить SSL в Nginx]
    F --> H
    G --> I[HTTP редирект на себя]
    
    H --> J[Настройка auto-renewal]
    J --> K[SSL ready]
```

### 9. Система мониторинга

```mermaid
graph TB
    subgraph "Logging"
        A[Application Logs]
        B[Nginx Access Logs]
        C[Error Logs]
    end
    
    subgraph "Log Rotation"
        D[Logrotate Daily]
        E[Compression]
        F[7-14 days retention]
    end
    
    subgraph "Monitoring Agent"
        G[Health Checks]
        H[Docker Metrics]
        I[System Metrics]
    end
    
    subgraph "Alerting"
        J[Agent API]
        K[Health Endpoints]
        L[Fail2ban Alerts]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    
    G --> K
    H --> G
    I --> G
    G --> J
    L --> J
```
### 10. Многоуровневая защита

```mermaid
mindmap
  root((Security Layers))
    Network
      UFW Firewall
      Rate limiting
      DDoS protection
    Access
      SSH keys only
      Non-root user
      sudo controls
    Application
      HTTPS enforced
      Security headers
      CORS policies
    Monitoring
      Fail2ban
      Access logs
      Auth monitoring
    Updates
      Auto security
      Regular patches
      Vulnerability scan
```
### 11. Переменные окружения

```yaml
# Обязательные переменные
DEV_SERVER_IP: "IP сервера разработки"
PROD_SERVER_IP: "IP production сервера"
ROOT_PASSWORD: "Временный пароль root"

# Опциональные
AGENT_API_KEY: "Ключ для мониторинга"
AGENT_IMAGE: "Образ агента"
```

### 12. Структура vhosts

```yaml
vhosts:
  - name: "www"
    domain: "www.biolivestick.com"
    backend_port: 8098
    health_check: true
    has_api: true
    
  - name: "dev"
    domain: "dev-app.biolivestick.com"
    backend_port: 8088
    health_check: true
    has_api: false
```

### 13. Итоговое состояние

```mermaid
graph TD
    subgraph "Production Ready"
        A[✅ Сервер настроен]
        B[✅ Firewall активен]
        C[✅ Docker работает]
        D[✅ Nginx + SSL]
        E[✅ Мониторинг]
        F[✅ Log rotation]
    end
    
    subgraph "Автоматизация"
        G[Одной командой]
        H[Идемпотентно]
        I[Без ручных правок]
        J[Повторяемо]
    end
    
    A --> G
    B --> H
    C --> I
    D --> J
    E --> I
    F --> H
```

# Версионирование
**Версия документации/продукта:** 1.0  
**Последнее обновление:** 2026-06-08
**Поддержка:** developers@biolivestick.com