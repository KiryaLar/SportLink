# SportLink Frontend

React + TypeScript frontend для платформы SportLink.

## 🚀 Быстрый старт

### Установка зависимостей
```bash
cd frontend
npm install
```

### Запуск разработки
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

### Сборка для production
```bash
npm run build
```

### Preview production сборки
```bash
npm run preview
```

## 📁 Структура проекта

```
frontend/
├── src/
│   ├── api/              # API клиенты для каждого сервиса
│   ├── components/       # React компоненты
│   │   ├── common/       # Переиспользуемые UI компоненты
│   │   └── layout/       # Layout компоненты
│   ├── hooks/            # Кастомные хуки
│   ├── pages/            # Страницы приложения
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript типы
│   ├── utils/            # Утилиты
│   ├── App.tsx           # Главный компонент
│   └── main.tsx          # Точка входа
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🛠 Технологический стек

- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик
- **Material-UI (MUI)** - UI компоненты
- **React Router v6** - роутинг
- **Zustand** - state management
- **Axios** - HTTP клиент
- **React Hook Form** - формы
- **Zod** - валидация

## 📦 Доступные страницы

| Страница | Путь | Описание |
|----------|------|----------|
| Login | `/login` | Вход в систему |
| Register | `/register` | Регистрация |
| Home | `/` | Главная страница |
| Profile | `/profile` | Профиль пользователя |
| Matches | `/matches` | Список матчей |
| Match Create | `/matches/create` | Создание матча |
| Match Detail | `/matches/:id` | Детали матча |
| Places | `/places` | Карта площадок |
| Players | `/players` | Список игроков |
| Chats | `/chats` | Чаты |
| Notifications | `/notifications` | Уведомления |
| Admin | `/admin` | Админ-панель |

## 🔐 Аутентификация

Приложение использует JWT токены от Keycloak через Gateway Service.

Токены хранятся в localStorage:
```typescript
{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
```

## 📝 API Clients

Для каждого микросервиса создан свой API клиент:

```typescript
import authApi from './api/auth.api';
import profileApi from './api/profile.api';
import matchesApi from './api/matches.api';

// Использование
const user = await profileApi.getMyProfile();
const matches = await matchesApi.getAllMatches();
```

## 🎨 UI Компоненты

Используется Material-UI (MUI) v5.

Пример использования:
```tsx
import { Button, TextField } from '@mui/material';

<Button variant="contained">Нажми меня</Button>
<TextField label="Email" />
```

## 🧪 Тестирование

```bash
# Запуск тестов
npm run test

# Запуск тестов в watch режиме
npm run test -- --watch
```

## 📊 Environment переменные

Создайте файл `.env` в корне frontend:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

## 🚧 В разработке

- [ ] Страницы матчей (MatchesPage, MatchCreatePage, MatchDetailPage)
- [ ] Страница площадок с картой (PlacesPage)
- [ ] Чаты с WebSocket (ChatsPage)
- [ ] Уведомления (NotificationsPage)
- [ ] Админ-панель (AdminPage)
- [ ] Страница профиля (ProfilePage)
- [ ] Страница игроков (PlayersPage)
