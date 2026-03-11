# RBAC Dynamic Permissions System

A full-stack web platform where access to every page and action is controlled by atomic permissions assigned at runtime — not hardcoded to roles.

---

## Overview

This system replaces conventional role-locked access with fully dynamic, per-user permission assignment. Admins and Managers configure exactly what each user can access through a UI, with no code changes required. Every page requires one permission atom. If you hold it, the page renders. If not, you're redirected to a 403 screen.

### Roles

| Role | Description |
|------|-------------|
| Admin | Full system control — manages all users, configures the entire permission structure |
| Manager | Manages their team, configures agent access within their own permission ceiling |
| Agent | Works within modules their Manager has unlocked |
| Customer | Self-service portal access only |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL via Neon DB (managed, serverless) |
| ORM | Prisma |
| Auth | JWT (15 min, in-memory) + Refresh Token (7 days, httpOnly cookie) |

---

## Project Structure

```
full-stack-project-RBAC-Dynamic-Permissions-System/
├── backend/           # NestJS REST API
├── frontend/          # Next.js 14 application
└── README.md          # This file
```

---

## Figma Design Reference

- **Prototype Link:** https://www.figma.com/proto/UzR78Y4zXOMAeU42MZM1qI/Login-page?page-id=0%3A1&node-id=1-44&viewport=795%2C39%2C0.81&t=mDLuGY9VyGszPxRM-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=1%3A44&show-proto-sidebar=1
- **Design Link:** https://www.figma.com/design/UzR78Y4zXOMAeU42MZM1qI/Login-page?node-id=1-291&t=cx3r0tZhfxvMLyxK-0

---

## Local Setup

### Prerequisites

- Node.js 20+
- npm 10+
- A Neon DB account and project (free tier works)
- Docker (optional, for containerised setup)

### 1. Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment template and fill in your values
cp .env.example .env
# Edit .env — set DATABASE_URL, DIRECT_URL, JWT_SECRET, JWT_REFRESH_SECRET

# Run migrations
npx prisma migrate dev

# Seed the database (roles, permissions, default admin user)
npx prisma db seed

# Start development server
npm run start:dev
# Backend runs on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL=http://localhost:3001

# Start development server
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Docker (Full Stack)

```bash
# From the full-stack-project-RBAC-Dynamic-Permissions-System/ directory
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon DB pooled connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `DIRECT_URL` | Neon DB direct connection string (for migrations) | `postgresql://user:pass@direct-host/db?sslmode=require` |
| `JWT_SECRET` | Secret for signing access tokens | any strong random string |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | any strong random string (different from JWT_SECRET) |
| `JWT_EXPIRES_IN` | Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` |
| `PORT` | Backend server port | `3001` |
| `CORS_ORIGIN` | Allowed origin for CORS | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001` |

---

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Compile TypeScript |
| `npm run start:prod` | Start compiled app |
| `npx prisma migrate dev` | Run pending migrations |
| `npx prisma migrate deploy` | Deploy migrations (production) |
| `npx prisma db seed` | Seed roles, permissions, and default admin |
| `npx prisma studio` | Open Prisma database browser |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production build |
| `npm run lint` | Run ESLint |

---

## Default Seed Credentials

After running `npx prisma db seed`:

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `password` | Admin |

> Change this password immediately after first login in any non-local environment.

---

## Permission Atoms

| Atom | Module | Default: Admin | Default: Manager | Default: Agent | Default: Customer |
|------|--------|:---:|:---:|:---:|:---:|
| `dashboard.view` | Dashboard | ✓ | ✓ | ✓ | |
| `users.view` | Users | ✓ | ✓ | | |
| `users.manage` | Users | ✓ | ✓ | | |
| `leads.view` | Leads | ✓ | ✓ | ✓ | |
| `leads.manage` | Leads | ✓ | ✓ | | |
| `tasks.view` | Tasks | ✓ | ✓ | ✓ | |
| `tasks.manage` | Tasks | ✓ | ✓ | | |
| `reports.view` | Reports | ✓ | ✓ | | |
| `audit.view` | Audit Log | ✓ | | | |
| `customer_portal.view` | Customer Portal | ✓ | ✓ | | ✓ |
| `settings.view` | Settings | ✓ | ✓ | | |
| `settings.manage` | Settings | ✓ | | | |
| `permissions.manage` | Permissions | ✓ | | | |

---

## API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with email + password |
| POST | `/auth/refresh` | Refresh access token using httpOnly cookie |
| POST | `/auth/logout` | Logout and blacklist refresh token |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Paginated user list (scoped by caller role) |
| POST | `/users` | Create user |
| GET | `/users/:id` | Get user with resolved permissions |
| PATCH | `/users/:id` | Update user fields |
| PATCH | `/users/:id/status` | Suspend or ban user |

### Permissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/permissions` | List all permission atoms |
| GET | `/users/:id/permissions` | Get resolved permissions for a user |
| PUT | `/users/:id/permissions` | Update user's individual permission grants |

### Audit Log

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit` | Paginated audit log (scoped by caller role) |

---

