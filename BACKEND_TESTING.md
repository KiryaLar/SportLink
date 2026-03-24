# SportLink Backend - Инструкция по запуску и тестированию

## 📋 Требования

- Java 21
- Docker & Docker Compose
- curl или Postman для тестирования API

## 🚀 Быстрый старт

### 1. Запуск инфраструктуры

```bash
# Запуск PostgreSQL, Kafka и Keycloak
docker-compose up -d
```

**Сервисы:**
- PostgreSQL: `localhost:5433` (user: sportlink, password: sportlink)
- Keycloak: `localhost:8443` (admin/admin)
- Kafka: `localhost:9092`
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

### 3. Логин

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

### 4. Создание профиля (после логина)

Сохраните токен из предыдущего запроса:

```bash
export TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

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

### 5. Получение списка площадок (seed данные)

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
    "locationName": "Парк Горького",
    "latitude": 55.7297,
    "longitude": 37.6015,
    "maxParticipants": 10,
    "minLevel": 1,
    "maxLevel": 5,
    "description": "Ищем игроков на футбол"
  }'
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

## 📊 Тестовые пользователи

После импорта realm в Keycloak доступны:

| Email | Пароль | Роль |
|-------|--------|------|
| admin@sportlink.ru | admin123 | ADMIN, USER |
| user1@sportlink.ru | user123 | USER |
| user2@sportlink.ru | user123 | USER |

## 🔍 Мониторинг

### Kafka UI
Откройте `http://localhost:8090` для просмотра:
- Топиков (`keycloak-profile-updates`, `match-events`, `notification-events`)
- Сообщений в реальном времени

### Actuator endpoints
```bash
# Health check
curl http://localhost:8080/actuator/health

# Gateway routes
curl http://localhost:8080/actuator/gateway/routes

# Metrics
curl http://localhost:8080/actuator/metrics
```

## 🐛 Отладка

### Логи сервисов
Каждый сервис пишет логи в консоль. Уровень логирования: `DEBUG`

### Частые проблемы

**1. Ошибка подключения к Keycloak:**
```
issuer-uri: http://localhost:8443/realms/sportlink
```
Убедитесь, что Keycloak запущен и realm импортирован.

**2. Ошибка БД:**
```
database "profiles" does not exist
```
Запустите `init-db.sql` или пересоздайте контейнер PostgreSQL.

**3. JWT token истёк:**
Получите новый токен через `/api/v1/auth/login`.

## 📝 API Documentation

Swagger UI доступен по адресу:
```
http://localhost:8080/swagger-ui.html
```

## 🛑 Остановка

```bash
# Остановить все сервисы
docker-compose down

# Остановить с удалением данных (для чистого запуска)
docker-compose down -v
```
