# SportLink API Documentation

## Обзор

SportLink - это микросервисная платформа для поиска спортивных партнеров и команд.

## Микросервисы

| Сервис | Порт | Описание |
|--------|------|----------|
| Gateway Service | 8080 | API Gateway, маршрутизация и аутентификация |
| Profile Service | 8081 | Управление профилями пользователей |
| Matches Service | 8082 | Управление матчами и событиями |
| Rating Service | 8083 | Рейтинги и отзывы |
| Sports Places Service | 8084 | Спортивные площадки |
| Messaging Service | 8085 | Чаты и сообщения |
| Notification Service | 8086 | Уведомления |

## Аутентификация

Все API endpoints требуют JWT токен от Keycloak. Токен должен быть передан в заголовке:
```
Authorization: Bearer <token>
```

## API Endpoints

### Profile Service (`/api/v1/profiles`)

#### Профили
- `GET /api/v1/profiles` - Получить список всех профилей
- `GET /api/v1/profiles/search?sport={sport}&city={city}&minLevel={min}&maxLevel={max}` - Поиск профилей
- `GET /api/v1/profiles/{id}` - Получить профиль по ID
- `GET /api/v1/profiles/my` - Получить текущий профиль
- `POST /api/v1/profiles` - Создать профиль
- `PUT /api/v1/profiles/my` - Обновить профиль

#### Контакты
- `GET /api/v1/profiles/my/contacts` - Получить список контактов
- `POST /api/v1/profiles/{id}/contact` - Отправить запрос в контакты
- `PUT /api/v1/profiles/contacts/{contactId}/status?status={status}` - Обновить статус контакта
- `DELETE /api/v1/profiles/contacts/{contactId}` - Удалить контакт

### Complaints (`/api/v1/complaints`)

- `POST /api/v1/complaints` - Создать жалобу
- `GET /api/v1/complaints/target/{profileId}` - Получить жалобы на профиль
- `GET /api/v1/complaints/admin/pending` - Получить ожидающие жалобы (ADMIN)
- `PUT /api/v1/complaints/{id}/review?status={status}` - Рассмотреть жалобу (ADMIN)
- `DELETE /api/v1/complaints/{id}` - Удалить жалобу (ADMIN)

### Matches Service (`/api/v1/matches`)

- `GET /api/v1/matches` - Получить все матчи
- `POST /api/v1/matches/search` - Поиск матчей
- `GET /api/v1/matches/{id}` - Получить матч по ID
- `GET /api/v1/matches/organizer/my` - Получить мои организованные матчи
- `POST /api/v1/matches` - Создать матч
- `PUT /api/v1/matches/{id}` - Обновить матч
- `PATCH /api/v1/matches/{id}/status?status={status}` - Обновить статус матча
- `DELETE /api/v1/matches/{id}` - Удалить матч

#### Участники матча
- `GET /api/v1/matches/{id}/participants` - Получить участников матча
- `POST /api/v1/matches/{id}/join` - Присоединиться к матчу
- `POST /api/v1/matches/{id}/leave` - Покинуть матч
- `POST /api/v1/matches/participants/{participantId}/confirm` - Подтвердить участника
- `DELETE /api/v1/matches/participants/{participantId}` - Удалить участника

### Rating Service (`/api/v1/ratings`)

- `GET /api/v1/ratings/users/{userId}` - Получить рейтинг пользователя
- `GET /api/v1/ratings/users/{userId}/reviews?page={page}&size={size}` - Получить отзывы пользователя
- `GET /api/v1/ratings/users/{userId}/reviews/type?type={type}` - Получить отзывы по типу
- `GET /api/v1/ratings/matches/{matchId}/reviews` - Получить отзывы матча
- `POST /api/v1/ratings` - Создать отзыв
- `DELETE /api/v1/ratings/{reviewId}` - Удалить отзыв (ADMIN)

### Sports Places Service (`/api/v1/sports-places`)

- `GET /api/v1/sports-places` - Получить все площадки
- `POST /api/v1/sports-places/search` - Поиск площадок
- `GET /api/v1/sports-places/{id}` - Получить площадку по ID
- `POST /api/v1/sports-places` - Создать площадку
- `PUT /api/v1/sports-places/{id}` - Обновить площадку
- `PATCH /api/v1/sports-places/{id}/status?status={status}` - Обновить статус (ADMIN)
- `DELETE /api/v1/sports-places/{id}` - Удалить площадку (ADMIN)

### Messaging Service (`/api/v1/chats`)

- `GET /api/v1/chats` - Получить мои чаты
- `GET /api/v1/chats/direct` - Получить прямые чаты
- `GET /api/v1/chats/match` - Получить чаты матчей
- `GET /api/v1/chats/{id}` - Получить чат по ID
- `GET /api/v1/chats/{id}/messages?page={page}&size={size}` - Получить сообщения чата
- `POST /api/v1/chats/{id}/messages` - Отправить сообщение
- `POST /api/v1/chats/{id}/read` - Отметить как прочитанное
- `GET /api/v1/chats/{id}/unread-count` - Получить количество непрочитанных
- `DELETE /api/v1/chats/{id}` - Удалить чат
- `POST /api/v1/chats/direct?participantId={id}` - Создать/получить прямой чат

### Notification Service (`/api/v1/notifications`)

- `GET /api/v1/notifications?page={page}&size={size}` - Получить мои уведомления
- `GET /api/v1/notifications/unread?page={page}&size={size}` - Получить непрочитанные уведомления
- `GET /api/v1/notifications/count` - Получить количество уведомлений
- `GET /api/v1/notifications/{id}` - Получить уведомление по ID
- `POST /api/v1/notifications/{id}/read` - Отметить как прочитанное
- `POST /api/v1/notifications/read-all` - Отметить все как прочитанное
- `DELETE /api/v1/notifications/{id}` - Удалить уведомление
- `DELETE /api/v1/notifications` - Удалить все уведомления

## Модели данных

### Profile
```json
{
  "id": 1,
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "phone": "+79991234567",
  "city": "Москва",
  "age": 25,
  "avatarUrl": "https://...",
  "description": "Люблю футбол",
  "sports": [...],
  "ratingAvg": 4.5,
  "ratingCount": 10
}
```

### Match
```json
{
  "id": 1,
  "organizerId": "uuid",
  "title": "Футбол 5x5",
  "sport": "FOOTBALL",
  "scheduledAt": "2024-01-15T18:00:00Z",
  "sportsPlaceId": 1,
  "maxParticipants": 10,
  "currentParticipants": 5,
  "status": "OPEN"
}
```

### Review
```json
{
  "id": 1,
  "authorId": "uuid",
  "targetUserId": "uuid",
  "matchId": 1,
  "reviewType": "BEHAVIOR",
  "rating": 5,
  "skillLevel": "AS_EXPECTED",
  "comment": "Отличный игрок!",
  "createdAt": "2024-01-15T20:00:00Z"
}
```

### SportsPlace
```json
{
  "id": 1,
  "name": "Теннисный корт",
  "address": "ул. Ленина, 1",
  "latitude": 55.7558,
  "longitude": 37.6173,
  "placeType": "PAID",
  "status": "ACTIVE",
  "supportedSports": ["TENNIS"],
  "priceInfo": "500 руб/час"
}
```

### Message
```json
{
  "id": 1,
  "chatId": 1,
  "senderId": "uuid",
  "content": "Привет! Во сколько встреча?",
  "status": "SENT",
  "createdAt": "2024-01-15T17:00:00Z"
}
```

### Notification
```json
{
  "id": 1,
  "userId": "uuid",
  "type": "MATCH_INVITE",
  "title": "Приглашение в матч",
  "message": "Вас пригласили присоединиться к матчу",
  "status": "PENDING",
  "createdAt": "2024-01-15T16:00:00Z"
}
```

## Статусы

### Match Status
- `OPEN` - Открыт для набора участников
- `READY` - Готов к началу
- `IN_PROGRESS` - В процессе
- `FINISHED` - Завершен
- `CANCELLED` - Отменен

### Notification Status
- `PENDING` - Ожидает доставки
- `SENT` - Отправлено
- `DELIVERED` - Доставлено
- `READ` - Прочитано

### Contact Status
- `PENDING` - Ожидает подтверждения
- `ACCEPTED` - Принят
- `BLOCKED` - Заблокирован

## Запуск

### Требования
- Java 21
- PostgreSQL 14+
- Keycloak
- Docker & Docker Compose (опционально)

### Базы данных
Каждый сервис использует отдельную базу данных:
- sportlink_profiles
- sportlink_matches
- sportlink_ratings
- sportlink_places
- sportlink_messages
- sportlink_notifications
- keycloak

### Keycloak
1. Создать realm `sportlink`
2. Настроить OIDC clients для каждого сервиса
3. Создать пользователей и роли

### Запуск сервисов
```bash
# Запустить все сервисы
./gradlew bootRun

# Или по отдельности
cd services/profile-service && ./gradlew bootRun
```
