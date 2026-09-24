# TaskFlow — Full-Stack Project Management Platform

A responsive task management application with authentication, Kanban workflow, drag & drop task status management, filtering, analytics and a MongoDB-backed REST API.

![stack](https://img.shields.io/badge/stack-React%20%26%20TypeScript%20%2B%20Tailwind%2C%20Express%2C%20MongoDB-blue)

## Features

- **Authentication** — JWT-based register/login, protected routes
- **Dashboard** — total / completed / pending task cards, progress chart (tasks completed per day), status & category distribution charts
- **Task management** — create, edit, delete; priority levels (low/medium/high), due dates, categories
- **Search & filtering** — search by text, filter by status / priority / category, sort by date or priority
- **Kanban board** — TODO / IN PROGRESS / DONE columns with drag & drop (HTML5 DnD, no extra deps)

## Tech Stack

| Layer     | Tech                                            |
|-----------|-------------------------------------------------|
| Frontend  | React + TypeScript, Vite, Tailwind CSS, Recharts, React Router |
| Backend   | Node.js + Express + TypeScript                  |
| Database  | MongoDB + Mongoose                              |
| Auth      | JSON Web Tokens (JWT) + bcrypt                  |

## Getting Started

### Prerequisites

- Node.js 18+ (tested on v24)
- MongoDB — local (`mongodb://127.0.0.1:27017/taskflow`) or [MongoDB Atlas](https://www.mongodb.com/atlas)

> On Windows PowerShell, script execution is often disabled, so use `npm.cmd ...` instead of `npm ...` if you hit a `SecurityError`.

### 1. Backend

```bash
cd server
cp .env.example .env     # then edit MONGODB_URI / JWT_SECRET
npm.cmd install
npm.cmd run dev          # http://localhost:5000
```

### 2. Frontend

```bash
cd client
cp .env.example .env     # optional; defaults are already sane
npm.cmd install
npm.cmd run dev          # http://localhost:5173
```

The Vite dev server proxies `/api` requests to the backend, so no extra config is needed locally.

## API Reference

| Method | Endpoint             | Auth | Description                         |
|--------|----------------------|------|-------------------------------------|
| POST   | `/api/auth/register` | –    | Create account                      |
| POST   | `/api/auth/login`    | –    | Log in, returns JWT                 |
| GET    | `/api/auth/me`       | ✓    | Current user                        |
| GET    | `/api/tasks`         | ✓    | List tasks (filters + search + sort)|
| POST   | `/api/tasks`         | ✓    | Create task                         |
| PATCH  | `/api/tasks/:id`     | ✓    | Update task                         |
| DELETE | `/api/tasks/:id`     | ✓    | Delete task                         |
| GET    | `/api/tasks/stats`   | ✓    | Dashboard analytics                 |

### Task query params (`GET /api/tasks`)

- `status` — `todo` | `in_progress` | `done`
- `priority` — `low` | `medium` | `high`
- `category` — any category string
- `search` — text match on title/description
- `sort` — `createdAt` (default) | `dueDate` | `priority` | `title`
- `order` — `asc` | `desc`

## Deployment

- **Frontend** → Vercel (set `VITE_API_URL` to your deployed backend URL)
- **Backend** → Render / Railway (set `MONGODB_URI`, `JWT_SECRET`)
- **Database** → MongoDB Atlas