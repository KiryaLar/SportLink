# SportLink Backend - Инструкция по запуску и тестированию

## 📋 Требования

- Java 21
- Docker & Docker Compose
- curl или Postman для тестирования API

## 🚀 Быстрый старт

### 1. Запуск инфраструктуры
```bash
# Запуск PostgreSQL, Kafka и Keycloak
docker-compose up -d postgres kafka keycloak

# Проверка статуса
docker-compose ps
```

**Сервисы:**
- PostgreSQL: `localhost:5433` (user: sportlink, password: sportlink)
- Keycloak: `localhost:8443` (admin/admin)
- Kafka: `localhost:29092`
- Kafka UI: `localhost:8090`

**Важно:** Keycloak автоматически импортирует realm из `infra/keycloak/sportlink-realm.json` при первом запуске.

### 2. Запуск микросервисов

В отдельных терминалах запустите каждый сервис:

```bash
# Gateway Service (API точка входа)
./gradlew :services:gateway-service:bootRun

# Profile Service
./gradlew :services:profile-service:bootRun

# Matches Service
./gradlew :services:matches-service:bootRun

# Rating Service
./gradlew :services:rating-service:bootRun

# Sports Places Service
./gradlew :services:sports-places-service:bootRun

# Messaging Service
./gradlew :services:messaging-service:bootRun

# Notification Service
./gradlew :services:notification-service:bootRun
```

Или все сразу (если есть gradle daemon):
```bash
./gradlew bootRun --parallel
```

## 🧪 Тестирование API

### 1. Проверка здоровья сервисов
```bash
# Gateway
curl http://localhost:8080/actuator/health

# Profile Service (напрямую)
curl http://localhost:8081/actuator/health
```

### 2. Регистрация пользователя
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Иван Тестов"
  }'
```

**Ожидаемый ответ:**
```json
{
  "userId": "abc123-...",
  "message": "Пользователь успешно зарегистрирован."
}
```

### 3. Логин (получение токена)
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Ожидаемый ответ:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 300
}
```

Сохраните токен:
```bash
export TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Создание профиля (после логина)
```bash
curl -X PUT http://localhost:8080/api/v1/profiles/my \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "city": "Москва",
    "description": "Люблю футбол и теннис",
    "sports": [
      {
        "sport": "FOOTBALL",
        "level": 2,
        "description": "Играю по выходным"
      }
    ]
  }'
```

### 5. Получение списка площадок
```bash
curl http://localhost:8080/api/v1/sports-places \
  -H "Authorization: Bearer $TOKEN"
```

**Ожидаемый ответ:** Список из ~25 спортивных площадок Москвы

### 6. Создание матча
```bash
curl -X POST http://localhost:8080/api/v1/matches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Футбол 5x5",
    "sport": "FOOTBALL",
    "scheduledAt": "2024-04-15T18:00:00",
    "sportsPlaceId": 1,
    "maxParticipants": 10,
    "minLevel": 1,
    "maxLevel": 5,
    "description": "Ищем игроков на футбол"
  }'
```

**Ожидаемый ответ:**
```json
{
  "id": 1,
  "organizerId": "uuid",
  "title": "Футбол 5x5",
  "sport": "FOOTBALL",
  "scheduledAt": "2024-04-15T18:00:00Z",
  "sportsPlaceId": 1,
  "maxParticipants": 10,
  "currentParticipants": 1,
  "minLevel": 1,
  "maxLevel": 5,
  "description": "Ищем игроков на футбол",
  "status": "OPEN"
}
```

### 7. Поиск матчей
```bash
# Все матчи
curl "http://localhost:8080/api/v1/matches" \
  -H "Authorization: Bearer $TOKEN"

# С фильтрами
curl -X POST "http://localhost:8080/api/v1/matches/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sport": "FOOTBALL",
    "status": "OPEN"
  }'
```

## 🧪 Автоматическое тестирование

### PowerShell (Windows)
```powershell
.\test-api.ps1
```

### Bash (Linux/Mac)
```bash
./test-api.sh
```

## 📊 Тестовые пользователи

| Email | Пароль | Роль |
|-------|--------|------|
| admin@sportlink.ru | admin123 | ADMIN, USER |
| user1@sportlink.ru | user123 | USER |
| user2@sportlink.ru | user123 | USER |

## 🔍 Мониторинг

### Health Check endpoints
```bash
# Gateway
curl http://localhost:8080/actuator/health

# Profile Service
curl http://localhost:8081/actuator/health

# Matches Service
curl http://localhost:8082/actuator/health
```

### Metrics (Prometheus format)
```bash
curl http://localhost:8080/actuator/prometheus
```

### Gateway Routes
```bash
curl http://localhost:8080/actuator/gateway/routes
```

### Kafka UI
Откройте `http://localhost:8090` для просмотра:
- Топиков Kafka
- Сообщений в реальном времени
- Consumer groups

## 📚 Документация

| Документ | Описание |
|----------|----------|
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Полная документация по API endpoints |
| [DOCKER_CI_CD.md](./DOCKER_CI_CD.md) | Docker и CI/CD документация |
| [Swagger UI](http://localhost:8080/swagger-ui.html) | Интерактивная API документация |

## 🔧 Troubleshooting

### Сервис не запускается
```bash
# Проверьте логи
docker-compose logs <service-name>

# Проверьте health check
docker inspect --format='{{.State.Health.Status}}' <container-name>
```

### Ошибки подключения к БД
```bash
# Проверьте статус PostgreSQL
docker-compose ps postgres

# Проверьте логи БД
docker-compose logs postgres
```

### Проблемы с Keycloak
```bash
# Проверьте импорт realm
curl http://localhost:8443/realms/sportlink

# Перезапустите Keycloak
docker-compose restart keycloak
```

### Ошибки компиляции
```bash
# Очистите кэш Gradle
./gradlew clean

# Пересоберите проект
./gradlew build -x test
```

## 🛑 Остановка

```bash
# Остановка сервисов
docker-compose down

# Остановка с удалением данных
docker-compose down -v
```
