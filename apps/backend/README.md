# Mairin — Backend

API REST de **Mairin** construida con NestJS + Prisma + PostgreSQL. Se encarga
de la autenticación (JWT) y del registro de progreso de partidas. El contenido
del juego (capítulos, escenas, personajes) vive en el frontend; aquí solo se
persisten cuentas y telemetría de intentos.

## Stack

- **NestJS 11** + TypeScript.
- **Prisma 7** con adapter `pg` para PostgreSQL 17.
- **JWT** (`@nestjs/jwt`) para autenticación.
- **Jest** (unit + e2e con Supertest).

## Endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/health` | público | Estado de la API + conectividad con la BD (`SELECT 1`) |
| `POST` | `/auth/register` | público | Crea una cuenta y devuelve `{ accessToken, role }` |
| `POST` | `/auth/login` | público | Autentica y devuelve `{ accessToken, role }` |
| `POST` | `/sessions` | JWT | Registra una sesión de juego |
| `POST` | `/attempts` | JWT | Registra un intento (`levelId`, `success`, `endingId`, `attemptNumber`) |
| `GET` | `/progress` | JWT | Devuelve `{ completedLevels: string[] }` |

Todos los endpoints salvo los marcados `@Public()` pasan por `JwtAuthGuard` +
`RolesGuard`. Roles disponibles: `ADMIN`, `USUARIO`, `AUDITOR`.

## Estructura

```
src/
  auth/        Registro, login, JWT, guards y decoradores
  progress/    Sesiones, intentos y progreso
  prisma/      Módulo y servicio Prisma
  generated/   Cliente Prisma generado (no versionado)
```

## Scripts

```sh
pnpm --filter backend dev        # nest start --watch
pnpm --filter backend build      # nest build
pnpm --filter backend test       # jest
pnpm --filter backend test:e2e   # jest e2e
```

## Configuración

Variables requeridas (ver `.env.example` en la raíz del monorepo):

- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` — identidad de la BD.
- `DATABASE_URL` — conexión PostgreSQL (en dev híbrido apunta a `localhost:5432`).
- `PORT` — puerto de la API (default `3000`).
- `JWT_SECRET` — secreto para firmar los tokens (expiración fija en 1 día).