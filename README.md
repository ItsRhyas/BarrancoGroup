# Mairin: El retrato roto

Juego web de reconstrucción de escenas con mecánica de arrastrar y soltar (drag & drop). El jugador elige una escena y coloca a los personajes en las ranuras correctas para reconstruir la historia de cada capítulo. La validación ocurre al llenar todas las ranuras: si la combinación coincide con la solución esperada, se muestra el final correcto; de lo contrario, un final incorrecto con opción de reintentar.

Proyecto monorepo (pnpm workspaces) con frontend React + Vite y backend NestJS + Prisma/PostgreSQL.

---

## Stack

| Capa | Tecnología |
|---|---|
| Monorepo | pnpm workspaces, TypeScript estricto |
| Frontend | React 19, Vite, TypeScript, React Compiler, dnd-kit |
| Backend | NestJS 11, Prisma 7 (adapter `pg`) |
| Base de datos | PostgreSQL 17 |
| Contenido | Markdown con frontmatter validado (Zod) → TypeScript generado |
| Tests | Vitest (frontend + scripts), Jest (backend) |
| Infraestructura | Docker Compose, Nginx |

---

## Estructura del monorepo

```
apps/
  frontend/   # Juego completo (React + Vite)
  backend/    # API NestJS + Prisma
packages/
  shared/     # Tipos/utilitarios compartidos (placeholder)
  sdk/        # Cliente SDK (placeholder)
  ui/         # Componentes UI reutilizables (placeholder)
prisma/       # Esquema y migraciones de la base de datos
docker/       # Compose y config de Nginx
scripts/      # Utilidades de desarrollo (generador de ER)
docs/         # Documentación (modelo ER)
```

---

## Frontend

### Arquitectura

El frontend es una SPA sin dependencia del backend para jugar: todo el juego (niveles, escenas, personajes, validación) vive en el cliente y se genera desde contenido Markdown.

**Máquina de pantallas** (`App.tsx`): flujo `start → intro → chapter-select → game`, con botón de retroceso global (Overlay) y aviso de rotación de dispositivo (RotateDevice). La introducción solo se muestra la primera vez (flag persistido).

**Lógica de juego** (`src/game/`), separada de React para ser testeable de forma pura:

| Módulo | Responsabilidad |
|---|---|
| `types.ts` | Tipos de dominio: `Level`, `SceneDef`, `CharacterDef`, `ExpectedSolution`, `AssetRegistry`, `BoardState`, `BoardAction` |
| `reducer.ts` | Reducer puro del tablero: `PLACE_SCENE`, `PLACE_CHARACTER`, `RESET_LEVEL`, `LOAD_LEVEL` |
| `selectors.ts` | `isLevelComplete`: detecta cuándo todas las ranuras están llenas |
| `validation.ts` | Compara el tablero con la solución esperada y devuelve el final correcto o incorrecto |
| `unlock.ts` | Regla de desbloqueo de capítulos: el capítulo 0 siempre disponible; el capítulo *n* se desbloquea al completar *n-1* |
| `levels.ts` / `assets.ts` | Re-exportan el contenido generado |

**Componentes** (`src/components/`):

- `GameBoard`: orquesta el nivel; `DndContext` con sensores de puntero y táctil, y colisión `inflatedPointerWithin`.
- `ElementArea`: panel de elementos arrastrables (escenas y personajes).
- `DraggableItem` / `SceneSlot` / `CharacterSlot`: piezas arrastrables y zonas de destino; las ranuras de personaje se anclan por porcentaje dentro de la escena (`anchorX`/`anchorY`).
- `AssetView`: resuelve cada asset desde el registro (`emoji` o `image`); las imágenes declaran `aspectRatio` para evitar desbordes.
- `EndDialog`: pop-up de final con avanzar/reintentar.
- `StartScreen`, `ChapterSelect`, `IntroScreen`: pantallas de navegación.

**Persistencia de sesión** (`src/lib/session.ts`):

- `localStorage`: capítulos completados e intro vista.
- `sessionStorage`: último capítulo jugado.
- Fallback en memoria cuando el almacenamiento no está disponible (modo privado), para que la UI nunca falle.

### Pipeline de contenido

El contenido vive en Markdown y se convierte a TypeScript en build. Esto permite editar historia, escenas y personajes sin tocar componentes.

1. **Fuente**: `apps/frontend/content/story/chapter-*.md` (un archivo por capítulo, con frontmatter YAML) e `intro.md`.
2. **Esquemas**: `scripts/build-levels.schema.ts` valida el frontmatter con Zod (ids, ranuras, solución esperada, finales — exactamente un final correcto y al menos uno incorrecto).
3. **Generador**: `scripts/build-levels.ts` lee los archivos, valida referencias cruzadas (ranuras vs. solución esperada), verifica que existan las imágenes y escribe:
   - `src/game/levels.generated.ts`
   - `src/game/intro.generated.ts`
4. **Assets**: los ids usan prefijos que se mapean a archivos en `public/images/`:

   | Prefijo | Ratio | Ejemplo | Archivo |
   |---|---|---|---|
   | `scene:` | 16:9 | `scene:classroom` | `public/images/scene-classroom.svg` |
   | `char:` | 1:1 | `char:mairin` | `public/images/char-mairin.svg` |
   | `ending:` | 1:1 | `ending:correct-1` | `public/images/ending-correct-1.svg` |

   El generador corre en modo estricto (`--strict-images`) y **falla el build si falta cualquier imagen referenciada**. Las rutas se ejecutan en `predev` y `prebuild`.

El formato exacto del frontmatter está documentado en `apps/frontend/content/story/CONTENT.md`.

---

## Backend

API NestJS minimalista (módulo `AppModule` con `PrismaModule` y `AppController`).

- **Endpoints**: `GET /health` — verifica conectividad con la base de datos (`SELECT 1`) y devuelve estado + timestamp.
- **Prisma**: cliente generado en `apps/backend/src/generated/prisma` (regenerado con `prisma generate`; no se versiona). Usa el adapter `pg` para PostgreSQL.
- **CORS**: habilitado (`app.enableCors()`).

El esquema de datos modela el dominio del juego para telemetría y persistencia futura de intentos:

| Modelo | Propósito |
|---|---|
| `Level` / `Scene` / `Character` | Contenido del juego |
| `LevelItem` | Elementos disponibles por nivel |
| `SceneSlot` / `CharacterSlot` | Ranuras de escena y de personaje (anclas %) |
| `ExpectedPlacement` | Solución esperada por nivel |
| `Ending` | Finales correctos/incorrectos |
| `GameSession` / `Attempt` / `AttemptItem` | Sesiones e intentos de los jugadores |

---

## Base de datos

Comandos Prisma (desde la raíz del monorepo):

```bash
pnpm db:generate   # genera el cliente Prisma
pnpm db:push       # sincroniza el esquema con la base de datos
pnpm db:migrate    # crea/aplica migraciones de desarrollo
pnpm db:studio     # abre Prisma Studio
pnpm db:seed       # ejecuta el seed (prisma/seed.ts)
```

---

## Docker

- **Dev**: `pnpm docker:dev` — levanta PostgreSQL + Nginx (el frontend corre con Vite en local).
- **Prod**: `pnpm docker:prod` — construye y levanta PostgreSQL, backend (NestJS en Node 24), frontend (build estático servido por Nginx) y Nginx como proxy.
- `docker-compose.yml` define los servicios base; los overrides viven en `docker/compose/`.

---

## Scripts

Desde la raíz:

```bash
pnpm start       # levanta todo el entorno con un solo comando (ver Puesta en marcha)
pnpm dev         # levanta todos los workspaces en paralelo (frontend + backend)
pnpm build       # compila todos los workspaces
pnpm lint        # ESLint en todos los workspaces
pnpm test        # tests de todos los workspaces
pnpm frontend ... # atajo para apps/frontend (p. ej. pnpm frontend run build:levels)
pnpm backend ...  # atajo para apps/backend
```

Dentro de `apps/frontend`:

```bash
pnpm dev                # Vite dev server
pnpm build              # tsc -b && vite build
pnpm build:levels       # regenera levels.generated.ts e intro.generated.ts
pnpm test               # Vitest (componentes + scripts)
```

---

## Testing

- **Frontend**: Vitest con jsdom (`src/**/*.spec.{ts,tsx}`) + suite de scripts (`vitest.scripts.config.ts`) que cubre el pipeline de contenido y las validaciones del generador.
- **Backend**: Jest (unit + e2e con Supertest).
- La lógica pura del juego (reducer, validación, desbloqueo, sesión) se testea sin dependencias de React ni DnD.

---

## Flujo de trabajo Git

El proyecto sigue Git Flow simplificado (`main` / `develop` / `feature/*` / `bugfix/*` / `hotfix/*` / `release/*`) con Conventional Commits. La referencia completa está en `conventions.md`.

---

## Puesta en marcha

**Un solo comando** (crea `.env`, instala dependencias, genera el cliente Prisma, levanta PostgreSQL y arranca frontend + backend):

```bash
pnpm dev-startup
```

El script `scripts/dev-startup.mjs` es idempotente: cada paso solo se ejecuta si hace falta (por ejemplo, `.env` se crea la primera vez, `pnpm install` solo corre si faltan dependencias). Es seguro ejecutarlo tantas veces como quieras. Está escrito en Node, así que funciona en cualquier terminal (PowerShell, Git Bash, WSL, bash).

Requisitos: Node.js 24+, pnpm 10, Docker (para la base de datos).