FROM node:24-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN corepack enable && pnpm install --frozen-lockfile --filter backend --ignore-scripts

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY . .
RUN pnpm exec prisma generate --schema=prisma/schema.prisma && pnpm --filter backend build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/node_modules ./node_modules
WORKDIR /app/apps/backend
EXPOSE 3000
CMD ["node", "dist/main.js"]
