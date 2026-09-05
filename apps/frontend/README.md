# Mairin — Frontend

Cliente web de **Mairin**, videojuego de drag & drop para el reto "Plataforma de
aprendizaje basado en juegos" (Ideathon 2026). El jugador reconstruye escenas de
la historia de Mairin arrastrando escenarios y personajes a sus lugares
correctos. Los cinco capítulos abordan valores sociales: respeto, inclusión,
comunidad y escucha de las personas mayores.

## Stack

- **React 19** + **TypeScript** + **Vite 8** (Rolldown) con React Compiler.
- **@dnd-kit/core** para drag & drop (puntero + táctil).
- **Vitest** + **Testing Library** (entorno jsdom).
- Lógica de juego en funciones puras (`src/game`) separada de los componentes.

## Estructura

```
src/
  game/          Estado del juego (reducer, selectors, validación, desbloqueo)
  components/    Componentes React (tablero, pantallas, diálogos, DnD)
  lib/           Persistencia local (session) y cliente de API (api, auth, progress)
content/story/   Historia en JSON (capítulos + intro)
scripts/         Build de niveles (JSON → código tipado)
public/images/   SVGs de escenas, personajes y finales
```

## Contenido (historia)

Los capítulos viven en `content/story/*.json`. Al editar, regenerá el código con:

```sh
pnpm --filter frontend run build:levels
```

El script valida con zod y falla si falta algún SVG referenciado.

## Progreso y backend

El progreso se guarda primero en `localStorage` (offline-first) y se sincroniza
con la API de progreso del backend usando una cuenta anónima por dispositivo:

- `POST /auth/register` / `POST /auth/login` — crean/autentican una cuenta anónima
  generada en el cliente (username + password aleatorios persistidos en `localStorage`);
  devuelven un JWT (`accessToken`).
- `POST /sessions` — registra una sesión de juego (autenticado con Bearer token).
- `POST /attempts` — registra cada intento (éxito/fallo + endingId).
- `GET  /progress` — devuelve los niveles completados del usuario autenticado.

El token JWT se guarda en `localStorage`/memoria; al expirar, el cliente
re-autentica con las mismas credenciales anónimas. Al cargar, el cliente
reconcilia el progreso local con el del servidor (unión; el servidor nunca
revoca capítulos locales). Si el backend no está disponible, el juego funciona
completo en local y el progreso se re-sincroniza después (`backfillMissing`).

### Configuración

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `/api` | Base de la API. En producción el proxy nginx expone `/api`. |

En desarrollo, Vite proxy `/api` hacia `http://localhost:3000` (configurable con
`VITE_PROXY_TARGET`).

## Scripts

```sh
pnpm --filter frontend dev       # servidor de desarrollo
pnpm --filter frontend build     # build de producción
pnpm --filter frontend test      # unit tests (vitest)
pnpm --filter frontend lint      # eslint
```
