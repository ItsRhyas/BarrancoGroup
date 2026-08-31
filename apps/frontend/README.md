# Mairin — Frontend

Cliente web de **Mairin**, videojuego de drag & drop para el reto "Plataforma de
aprendizaje basado en juegos" (Ideathon 2026). El jugador reconstruye escenas
sobre "Derechos y Dignidad de la Mujer" arrastrando escenarios y personajes a
sus lugares correctos.

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
  lib/           Persistencia local (session) y cliente de API (api, progress)
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
con la API de progreso del backend:

- `POST /api/sessions` — registra la sesión (al iniciar un juego nuevo).
- `POST /api/attempts` — registra cada intento (éxito/fallo + endingId).
- `GET  /api/progress?sessionToken=…` — devuelve los niveles completados.

El `sessionToken` (UUID v4) se genera en el cliente y persiste en `localStorage`,
un token estable por dispositivo. Al cargar, el cliente reconcilia el progreso
local con el del servidor (unión; el servidor nunca revoca capítulos locales).

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
