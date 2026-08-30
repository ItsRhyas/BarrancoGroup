# syntax=docker/dockerfile:1

# ---------- Base ----------
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------- Dependencies (full install: prisma CLI + build tooling) ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# ---------- Build (generate Prisma client + compile NestJS) ----------
FROM base AS build
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
ENV DATABASE_URL=$DATABASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY . .
RUN pnpm exec prisma generate --schema=prisma/schema.prisma \
    && pnpm --filter backend build

# ---------- Production dependencies (lean runtime) ----------
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter backend --prod

# ---------- Runtime (default target) ----------
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
EXPOSE 3000
CMD ["node", "apps/backend/dist/main.js"]
