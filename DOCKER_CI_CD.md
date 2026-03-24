# SportLink Docker & CI/CD Documentation

## 📋 Обзор

Этот документ описывает Docker-инфраструктуру и CI/CD pipeline для проекта SportLink.

## 🐳 Docker

### Архитектура контейнеров

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                           │
│                   sportlink_network                         │
│                                                             │
│  ┌─────────────────┐    ┌───────────────────────────────┐  │
│  │    Gateway      │───>│   Profile Service             │  │
│  │    :8080        │    │   :8081                       │  │
│  └────────┬────────┘    └───────────────────────────────┘  │
│           │                                                 │
│           ├─────────> Matches Service (:8082)              │
│           ├─────────> Rating Service (:8083)               │
│           ├─────────> Sports Places Service (:8084)        │
│           ├─────────> Messaging Service (:8085)            │
│           └─────────> Notification Service (:8086)         │
│                                                             │
│  ┌─────────────────┐    ┌───────────────────────────────┐  │
│  │    PostgreSQL   │    │      Kafka                    │  │
│  │    :5432        │    │      :9092                    │  │
│  └─────────────────┘    └───────────────────────────────┘  │
│                                                             │
│  ┌─────────────────┐                                        │
│  │    Keycloak     │                                        │
│  │    :8080        │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### Запуск всех сервисов

```bash
# Запуск инфраструктуры и всех микросервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Остановка с удалением данных
docker-compose down -v
```

### Запуск отдельных сервисов

```bash
# Только инфраструктура
docker-compose up -d postgres kafka keycloak

# Конкретный сервис
docker-compose up -d gateway-service profile-service

# Пересборка образа
docker-compose build --no-cache profile-service
```

### Переменные окружения

Скопируйте `.env.example` в `.env` и настройте переменные:

```bash
cp .env.example .env
```

Основные переменные:
- `POSTGRES_USER`, `POSTGRES_PASSWORD` - учётные данные БД
- `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD` - админ Keycloak
- `GATEWAY_PORT`, `PROFILES_PORT`, etc. - порты сервисов
- `MAIL_USERNAME`, `MAIL_PASSWORD` - SMTP для уведомлений

## 🔧 CI/CD Pipeline

### Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                           │
│                                                             │
│  Push/Pull Request ──> Build & Test ──> Code Quality       │
│                            │                                │
│                            ▼                                │
│                     (main branch)                           │
│                            │                                │
│                            ▼                                │
│                   Build Docker Images                       │
│                            │                                │
│                            ▼                                │
│                   Deploy to Staging                         │
│                            │                                │
│                    [Manual Approval]                        │
│                            │                                │
│                            ▼                                │
│                   Deploy to Production                      │
└─────────────────────────────────────────────────────────────┘
```

### Основные pipeline

| Workflow | Файл | Описание |
|----------|------|----------|
| **CI/CD Pipeline** | `ci-cd.yml` | Полный pipeline для main branch |
| **Profile Service CI** | `profile-service-ci.yml` | Тесты и сборка profile-service |
| **Matches Service CI** | `matches-service-ci.yml` | Тесты и сборка matches-service |
| **Rating Service CI** | `rating-service-ci.yml` | Тесты и сборка rating-service |
| **Gateway Service CI** | `gateway-service-ci.yml` | Тесты и сборка gateway-service |
| **Sports Places CI** | `sports-places-service-ci.yml` | Тесты и сборка sports-places-service |
| **Messaging CI** | `messaging-service-ci.yml` | Тесты и сборка messaging-service |
| **Notification CI** | `notification-service-ci.yml` | Тесты и сборка notification-service |

### Триггеры

#### Автоматический запуск:
- Push в `main` или `develop`
- Pull Request в `main` или `develop`
- Изменения в соответствующих директориях сервисов

#### Ручное подтверждение:
- Деплой в production требует approval в GitHub

### Настройка GitHub Environments

1. Перейдите в **Settings → Environments**
2. Создайте окружения:
   - `staging` (автоматический деплой)
   - `production` (требует approval)

3. Добавьте secrets:
   ```
   DOCKER_USERNAME - логин в Docker registry
   DOCKER_PASSWORD - пароль от Docker registry
   DEPLOY_KEY - ключ для деплоя на сервер
   ```

### Локальное тестирование pipeline

```bash
# Установите act
brew install act

# Запуск pipeline локально
act push

# Запуск конкретного job
act build-and-test

# Запуск с переопределением secrets
act -s GITHUB_TOKEN=your_token
```

## 📊 Мониторинг

### Health Checks

Каждый сервис имеет health check endpoint:

```bash
# Gateway
curl http://localhost:8080/actuator/health

# Profile Service
curl http://localhost:8081/actuator/health

# и т.д. для всех сервисов
```

### Логи

```bash
# Логи конкретного сервиса
docker-compose logs gateway-service

# Follow режим
docker-compose logs -f matches-service

# Последние 100 строк
docker-compose logs --tail=100 profile-service
```

### Метрики

```bash
# Prometheus metrics
curl http://localhost:8080/actuator/prometheus

# Gateway routes
curl http://localhost:8080/actuator/gateway/routes
```

## 🚀 Деплой

### Вариант 1: Docker Compose (для staging)

```bash
# На сервере
git pull origin main
docker-compose pull
docker-compose up -d
```

### Вариант 2: Kubernetes (для production)

```bash
# Применить манифесты
kubectl apply -f k8s/base/
kubectl apply -f k8s/overlays/production/

# Обновить деплойменты
kubectl rollout restart deployment -l app=sportlink

# Проверить статус
kubectl get pods -l app=sportlink
```

### Вариант 3: Docker Swarm

```bash
# Инициализация
docker swarm init

# Деплой стека
docker stack deploy -c docker-compose.prod.yml sportlink

# Проверка
docker stack ps sportlink
```

## 🔒 Безопасность

### Best Practices

1. **Не коммитьте .env файл**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Используйте secrets для чувствительных данных**
   ```yaml
   secrets:
     db_password:
       external: true
   ```

3. **Обновляйте базовые образы регулярно**
   ```bash
   docker pull eclipse-temurin:21-jre-alpine
   ```

4. **Сканируйте образы на уязвимости**
   ```bash
   docker scan profile-service:latest
   ```

## 📝 Troubleshooting

### Сервис не запускается

```bash
# Проверьте логи
docker-compose logs <service-name>

# Проверьте health check
docker inspect --format='{{.State.Health.Status}}' <container-name>

# Пересоберите образ
docker-compose build --no-cache <service-name>
```

### Проблемы с подключением к БД

```bash
# Проверьте, что PostgreSQL запущен
docker-compose ps postgres

# Проверьте логи БД
docker-compose logs postgres

# Проверьте переменные окружения
docker-compose exec gateway-service env | grep POSTGRES
```

### Проблемы с Keycloak

```bash
# Проверьте, что realm импортирован
curl http://localhost:8443/realms/sportlink

# Перезапустите Keycloak
docker-compose restart keycloak

# Проверьте логи
docker-compose logs keycloak
```

## 📚 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
