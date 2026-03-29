# SportLink

**Платформа для поиска партнеров и команд для занятий спортом**

SportLink помогает спортсменам-любителям находить игроков для совместных тренировок или матчей в выбранном виде спорта. Пользователи создают профили с указанием уровня игры и предпочтительных видов спорта, просматривают ленту потенциальных партнеров или открытые игры, а также отмечают на карте подходящие площадки.

---

## 📋 Содержание

- [Архитектура](#-архитектура)
- [Технологический стек](#-технологический-стек)
- [Быстрый старт](#-быстрый-старт)
- [Запуск через Docker](#-запуск-через-docker)
- [Локальная разработка](#-локальная-разработка)
- [Тестирование API](#-тестирование-api)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Мониторинг](#-мониторинг)
- [Frontend (React)](#-frontend-react)
- [Документация](#-документация)

---

## 🏗 Архитектура

```
┌──────────────┐
│   Frontend   │ (React / Mobile)
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                    API Gateway :8080                    │
│  - OAuth2/JWT аутентификация                            │
│  - Маршрутизация запросов                               │
└──────┬──────────────────────────────────────────────────┘
       │
       ├──► Profile Service :8081      (профили, контакты)
       ├──► Matches Service :8082      (матчи, события)
       ├──► Rating Service :8083       (отзывы, рейтинги)
       ├──► Sports Places :8084        (площадки)
       ├──► Messaging :8085            (чаты, WebSocket)
       └──► Notifications :8086        (уведомления)
       
       Межсервисное взаимодействие: Kafka (асинхронно)
```

### Микросервисы

| Сервис | Порт | Описание |
|--------|------|----------|
| **Gateway Service** | 8080 | API Gateway, OAuth2, маршрутизация |
| **Profile Service** | 8081 | Профили пользователей, контакты, жалобы |
| **Matches Service** | 8082 | Матчи, события, участники |
| **Rating Service** | 8083 | Отзывы, рейтинги, агрегация |
| **Sports Places** | 8084 | Спортивные площадки, поиск по карте |
| **Messaging** | 8085 | Чаты, сообщения, WebSocket |
| **Notifications** | 8086 | Email/push уведомления |

---

## 🛠 Технологический стек

### Backend
- **Язык:** Kotlin 2.2
- **Фреймворк:** Spring Boot 4.0
- **Базы данных:** PostgreSQL 17 (отдельная БД на сервис)
- **Message Broker:** Apache Kafka 3.9 (KRaft mode)
- **Аутентификация:** Keycloak 26 (OAuth2/OIDC)
- **Сборка:** Gradle 8.12

### Инфраструктура
- **Контейнеризация:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Мониторинг:** Spring Actuator, Prometheus

### Frontend (🧪 Тестируется)
- **Web:** React 18 + TypeScript + Vite
- **UI:** Material-UI
- **State:** Zustand
- **HTTP:** Axios
- **WebSocket:** STOMP (для чатов)
- **Карты:** Leaflet

> 📝 **Backend — база готова, сейчас допиливается. Frontend тестируется.** Для тестирования используйте `test-api.ps1` / `test-api.sh` или Postman.

---

## 🚀 Быстрый старт

### Требования
- Java 21
- Docker & Docker Compose
- Git

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-org/SportLink.git
cd SportLink
```

### 2. Запуск инфраструктуры
```bash
# Запуск PostgreSQL, Kafka, Keycloak
docker-compose up -d postgres kafka keycloak

# Проверка статуса
docker-compose ps
```

### 3. Запуск микросервисов

**Вариант A: Через Gradle (для разработки)**
```bash
# Запуск всех сервисов
./gradlew bootRun --parallel

# Или по отдельности
./gradlew :services:gateway-service:bootRun
./gradlew :services:profile-service:bootRun
./gradlew :services:matches-service:bootRun
```

**Вариант B: Через Docker (production-like)**
```bash
# Сборка и запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f gateway-service
```

### 4. Проверка работоспособности
```bash
# Health check Gateway
curl http://localhost:8080/actuator/health

# Health check Profile Service
curl http://localhost:8081/actuator/health
```

---

## 🐳 Запуск через Docker

### Полная сборка и запуск
```bash
# Сборка образов всех сервисов
docker-compose build

# Запуск
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

### Остановка
```bash
# Остановка сервисов
docker-compose down

# Остановка с удалением данных
docker-compose down -v
```

### Переменные окружения
Скопируйте `.env.example` в `.env` и настройте при необходимости:
```bash
cp .env.example .env
```

---

## 💻 Локальная разработка

### 1. Запуск инфраструктуры
```bash
docker-compose up -d postgres kafka keycloak
```

### 2. Компиляция проекта
```bash
# Сборка всех сервисов
./gradlew build -x test

# Сборка конкретного сервиса
./gradlew :services:gateway-service:bootJar -x test
```

### 3. Запуск сервиса
```bash
# Gateway Service
./gradlew :services:gateway-service:bootRun

# Profile Service
./gradlew :services:profile-service:bootRun
```

### 4. Hot Reload (опционально)
```bash
# Запуск с поддержкой hot reload
./gradlew :services:gateway-service:bootRun --continuous
```

---

## 🧪 Тестирование API

### 1. Регистрация пользователя
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Иван Тестов"
  }'
```

### 2. Логин (получение токена)
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Использование токена
```bash
export TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."

# Получение списка площадок
curl http://localhost:8080/api/v1/sports-places \
  -H "Authorization: Bearer $TOKEN"

# Создание профиля
curl -X PUT http://localhost:8080/api/v1/profiles/my \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Москва",
    "sports": [{"sport": "FOOTBALL", "level": 2}]
  }'
```

### 4. Автоматическое тестирование
```bash
# PowerShell (Windows)
.\test-api.ps1

# Bash (Linux/Mac)
./test-api.sh
```

### 5. Postman Collection
Импортируйте коллекцию из `.github/postman/SportLink.postman_collection.json` или используйте готовые запросы в Postman.

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Проект использует GitHub Actions для автоматизации сборки, тестирования и деплоя.

#### Триггеры
- **Push** в ветки `main` или `develop`
- **Pull Request** в `main` или `develop`
- **Ручной запуск** через GitHub UI

#### Этапы pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Build & Test                                            │
│     └─> Сборка проекта + запуск тестов                      │
│                                                             │
│  2. Code Quality                                            │
│     └─> Ktlint + Detekt (статический анализ)                │
│                                                             │
│  3. Build Docker Images (main branch)                       │
│     └─> Сборка образов для каждого сервиса                  │
│     └─> Push в GitHub Container Registry (GHCR)             │
│                                                             │
│  4. Deploy to Staging (main branch)                         │
│     └─> Автоматический деплой на staging                    │
│                                                             │
│  5. Deploy to Production (manual approval)                  │
│     └─> Требует подтверждения в GitHub UI                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Запуск pipeline

#### Автоматический запуск
```bash
# Push в удалённый репозиторий
git push origin main
```

#### Ручной запуск
1. Перейдите на вкладку **Actions** в GitHub
2. Выберите workflow **CI/CD Pipeline**
3. Нажмите **Run workflow**
4. Выберите ветку и нажмите **Run workflow**

#### Локальное тестирование pipeline
```bash
# Установка act (локальный runner для GitHub Actions)
brew install act  # macOS
choco install act  # Windows

# Запуск pipeline локально
act push

# Запуск конкретного job
act build-and-test

# Запуск с секретами
act -s GITHUB_TOKEN=your_token
```

---

## 📊 Мониторинг

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

---

### Postman Collection
1. Откройте Postman
2. Import → File → `.github/postman/SportLink.postman_collection.json`
3. Используйте переменные окружения из коллекции

---

## 👥 Пользовательские роли

### Пользователь (игрок)
- Регистрация и создание профиля
- Поиск партнёров и матчей
- Создание и участие в матчах
- Переписка в чатах
- Оценка участников после матча

### Администратор
- Доступ к админ-панели
- Модерация пользователей и контента
- Управление площадками
- Просмотр жалоб и рейтингов

**Тестовые учётные данные:**
| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@sportlink.ru | admin123 |
| User | user1@sportlink.ru | user123 |

---

## 💻 Frontend (React)

> ⚠️ **Frontend тестится, Backend — база готова, сейчас допиливается!**
>
> Backend уже имеет необходимую базу и основные endpoints — сейчас финальная полировка.
> Frontend тоже на подходе, но лучше пока тестировать API руками.
> 
> **Что уже работает:**
> - ✅ Вход и регистрация
> - ✅ Создание и просмотр матчей
> - ✅ Карта площадок (Leaflet)
>
> **Что допиливается:**
> - ⏳ Чаты (WebSocket)
> - ⏳ Уведомления
> - ⏳ Админ-панель
>
> **👉 Рекомендация:** Для тестирования используйте готовые скрипты:
> ```powershell
> # Windows
> .\test-api.ps1
> 
> # Linux/Mac
> ./test-api.sh
> ```
> Или импортируйте Postman collection из `.github/postman/`

### Как запустить

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### Что можно потестировать

| Страница | URL | Готовность |
|----------|-----|------------|
| Вход | `/login` | ✅ Можно логиниться |
| Регистрация | `/register` | ✅ Можно регистрироваться |
| Главная | `/` | ✅ Работает |
| Матчи | `/matches` | ✅ Создание и просмотр |
| Площадки | `/places` | ✅ Карта с площадками |
| Чаты | `/chats` | ⏳ Скоро будет |
| Уведомления | `/notifications` | ⏳ Скоро будет |
| Админка | `/admin` | ⏳ Скоро будет |

### Команды для разработки

```bash
npm run dev      # Запустить dev-сервер
npm run build    # Собрать продакшен
npm run test     # Запустить тесты
```

---

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

---
