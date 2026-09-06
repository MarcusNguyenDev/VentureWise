FROM node:24-slim AS base

WORKDIR /api

RUN apt-get update && apt-get install -y curl git procps poppler-utils unzip

RUN npm install -g bun

RUN bun upgrade

RUN bun install -g @usebruno/cli

ENV PATH="/root/.bun/bin:$PATH"

FROM base AS development

# The repo root is bind-mounted at /workspaces; pre-create the node_modules
# mount point so the named volume comes up owned by `node`, and let git accept
# a worktree that belongs to the host user.
RUN mkdir -p /workspaces/api/node_modules \
    && chown -R node:node /workspaces \
    && git config --system --add safe.directory /workspaces

WORKDIR /workspaces/api
USER node
EXPOSE 3001
CMD ["bun", "run", "dev"]

FROM base AS test 
COPY . .
RUN bun install --frozen-lockfile
RUN bun run test


FROM base AS builder

COPY . .

RUN bun install --frozen-lockfile

RUN bun run build

FROM base AS production

COPY --from=builder /api/dist ./dist
COPY --from=builder /api/package.json ./package.json
COPY --from=builder /api/tsconfig.json ./tsconfig.json
# --frozen-lockfile has nothing to freeze against without this.
COPY --from=builder /api/bun.lock ./bun.lock

RUN NODE_ENV=production bun install --frozen-lockfile --production

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

# No .env is baked in: the deploy supplies the runtime env through compose's
# `env_file` (see docker-compose.prod.yml), so no secret lives in a layer.
CMD ["bun", "run", "start:prod"]