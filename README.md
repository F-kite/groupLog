# groupLog

Веб-приложение для ведения журнала посещаемости студентов. Автоматически загружает расписание с сайта КузГТУ и позволяет отмечать присутствие студентов на каждой паре.

## Возможности

- **Журнал посещаемости** — отметка каждого студента по парам: присутствует, болеет, уважительная причина, отсутствует
- **Массовое редактирование** — выбрать несколько студентов и проставить статус сразу всем
- **Поддержка подгрупп** — расписание и отметки учитывают деление на подгруппы
- **Автозагрузка расписания** — парсинг с сайта kuzstu.ru по номеру недели и названию группы
- **Аналитика** — графики посещаемости по группе
- **Панель администратора** — управление пользователями, группами, студентами, преподавателями
- **Аутентификация** — вход и регистрация, JWT + refresh-токены

## Стек технологий

| Сервис | Технологии |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, SCSS, Recharts |
| Backend | Node.js, Express, PostgreSQL, Joi |
| Парсинг | Puppeteer (headless browser) |

## Запуск

### 1. Установить зависимости

```bash
npm install
npm --prefix ./app/frontend install
```

### 2. Настроить окружение

Создать файл `.env` в корне проекта:

```env
PORT=3001
DATABASE_URL=postgres://user:password@localhost:5432/grouplog
JWT_SECRET=your_secret_key
```

### 3. Запустить

```bash
# Запустить backend и frontend одновременно
npm run start-all

# Или по отдельности
npm run start-backend   # http://localhost:3001
npm run start-frontend  # http://localhost:5173
```

## API

Основные эндпоинты backend:

```
GET  /api/schedule/:group/:week       — расписание группы на неделю
GET  /api/attendances/groups/:group   — журнал посещаемости группы
POST /api/attendances                 — создать записи посещаемости
PUT  /api/attendances                 — обновить записи посещаемости

GET  /api/groups                      — список групп
GET  /api/students/groups/:group      — студенты группы
GET  /api/teachers                    — список преподавателей

POST /api/users/registration          — регистрация
POST /api/users/login                 — вход
POST /api/users/logout                — выход
```
