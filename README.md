# Электронный журнал — Колледж Бизнеса и Права

Полноценный фуллстек на **TypeScript**: фронт на React 18 + Vite, бэк на Express + Prisma + SQLite + JWT. Три роли — **админ**, **преподаватель**, **студент**.

## Структура

```
e-journal/
  src/             — фронт (React + TS + Vite)
  backend/         — бэк (Express + Prisma + SQLite + JWT)
  package.json     — корневой, запускает обе части одной командой
```

## Быстрый старт

Один раз — установка и инициализация БД:

```bash
# 1. Зависимости фронта
npm install

# 2. Зависимости бэка + миграции + seed демо-данных
npm run setup:server
```

Запуск разработки (фронт + бэк одной командой):

```bash
npm run dev
```

- Фронт: http://localhost:5173 (откроется автоматически)
- Бэк: http://localhost:4000
- БД: `backend/prisma/dev.db` (SQLite-файл)

## Демо-доступы

Пароль для всех — `123456`.

| Роль | Email | Группа |
|------|-------|--------|
| Админ | `admin@college.by` | — |
| Преподаватель | `teacher@college.by` | ведёт Математику, Экономику, Право, Менеджмент |
| Студент | `student1@college.by` | БП-21 (Морозов А.) |
| Студент | `student2@college.by` | ЭП-22 (Соколова М.) |
| Студент | `student3@college.by` | ЮР-21 (Волков Н.) |

Три студента в **разных группах** — для проверки изоляции прав. Каждый видит только свои оценки/посещаемость и расписание своей группы.

## Возможности по ролям

### Админ
- CRUD пользователей (студенты, преподаватели, админы)
- CRUD предметов с привязкой преподавателей
- CRUD групп с куратором и составом студентов
- Доступ к расписанию всех групп

### Преподаватель
- Список своих групп
- **Журнал оценок (10-балльная):** ввод 1–10 или «Н» прямо в ячейку, автоподсчёт среднего
- **Зачёты:** переключатель в журнале — отдельный режим Зачёт/Незачёт
- Отметка посещаемости в один клик
- Своё расписание

### Студент
- Свои оценки по предметам со средним баллом
- Свои зачёты
- Свои пропуски и статистика посещаемости
- Расписание своей группы

## Стек

**Фронт:** React 18, TypeScript, Vite, React Router 6, кастомный CSS  
**Бэк:** Node.js + Express, Prisma ORM, SQLite, bcryptjs, jsonwebtoken, zod, CORS

## REST API

Все эндпоинты — под префиксом `/api`, требуют `Authorization: Bearer <jwt>` (кроме `/auth/login`).

### Auth
```
POST /api/auth/login      { email, password, role? } → { token, user }
GET  /api/auth/me
POST /api/auth/logout
```

### Users [admin only для записи]
```
GET    /api/users?role=admin|teacher|student
GET    /api/users/:id
POST   /api/users         { firstName, lastName, email, role, groupId?, subjectIds?, password? }
PATCH  /api/users/:id
DELETE /api/users/:id
```

### Subjects [admin only для записи]
```
GET    /api/subjects
POST   /api/subjects      { name, description?, teacherIds }
PATCH  /api/subjects/:id
DELETE /api/subjects/:id
```

### Groups [admin only для записи]
```
GET    /api/groups
GET    /api/groups/:id
POST   /api/groups        { name, year, homeroomTeacherId?, studentIds }
PATCH  /api/groups/:id
DELETE /api/groups/:id
```

### Grades — оценки 1–10 [teacher/admin для записи]
```
GET    /api/grades?studentId&groupId&subjectId&from&to
POST   /api/grades        { studentId, subjectId, groupId, date, value (1..10 или "Н") }
PUT    /api/grades/:id
DELETE /api/grades/:id
```

### Assessments — зачёты [teacher/admin для записи]
```
GET    /api/assessments?studentId&groupId&subjectId&from&to
POST   /api/assessments   { studentId, subjectId, groupId, date, passed: bool }
PUT    /api/assessments/:id
DELETE /api/assessments/:id
```

### Attendance [teacher/admin для записи]
```
GET    /api/attendance?studentId&groupId&subjectId&from&to
POST   /api/attendance    { studentId, subjectId, groupId, date, status }
PUT    /api/attendance/:id
```
Статус: `present | absent | late | excused`.

### Schedule [admin для записи]
```
GET    /api/schedule?groupId&teacherId
POST   /api/schedule      { groupId, subjectId, teacherId, dayOfWeek (1..6), lessonNumber, room? }
PUT    /api/schedule/:id
DELETE /api/schedule/:id
```

## Изоляция прав на бэке

JWT содержит `userId` и `role`. Middleware:
- `requireAuth` — проверка валидности токена
- `requireRole("admin", ...)` — допуск по роли

Дополнительно в выборках:
- Студент видит только записи с `studentId = req.user.userId`
- Расписание студенту — только по его `groupId`
- На POST/PUT/DELETE — проверка роли

## Сброс и повторный seed

```bash
cd backend
npm run prisma:reset
```
