# syntax=docker/dockerfile:1
#
# Multi-stage build for the VentureWise API (NestJS).
# Runtime: Node 24 (Alpine). Package manager / script runner: bun.
#
#   development -> dev container + `docker compose up` (source is bind-mounted)
#   production  -> compiled dist/, prod dependencies only
#
# Select with `--target` (compose: `build.target`).

# ---------------------------------------------------------------- base ------
FROM node:24-alpine AS base

# musl-linked bun, taken straight from the official Alpine image.
COPY --from=oven/bun:1-alpine /usr/local/bin/bun /usr/local/bin/bun
RUN ln -sf /usr/local/bin/bun /usr/local/bin/bunx \
    && apk add --no-cache libstdc++ libgcc ca-certificates \
    && bun --version

ENV BUN_INSTALL=/home/node/.bun
ENV PATH=$BUN_INSTALL/bin:$PATH
RUN mkdir -p "$BUN_INSTALL/bin" /app/node_modules \
    && chown -R node:node "$BUN_INSTALL" /app \
    && printf 'export BUN_INSTALL=/home/node/.bun\nexport PATH=$BUN_INSTALL/bin:$PATH\n' > /etc/profile.d/bun.sh

WORKDIR /app

# --------------------------------------------------------- development ------
# Dev container / `docker compose up`: no source is baked in, it is mounted.
FROM base AS development

RUN apk add --no-cache \
        bash \
        curl \
        docker-cli \
        docker-cli-compose \
        git \
        openssh-client \
        sudo \
    # Passwordless sudo for the dev user (dev image only) so postStart can
    # fix docker socket ownership.
    && echo 'node ALL=(root) NOPASSWD:ALL' > /etc/sudoers.d/node \
    && chmod 0440 /etc/sudoers.d/node \
    # The repo root is bind-mounted at /workspaces; these are the
    # mount points for the named volumes that shadow it.
    && mkdir -p /workspaces/api/node_modules \
    && chown -R node:node /workspaces

WORKDIR /workspaces/api
ENV NODE_ENV=development
USER node
EXPOSE 3001 9229
CMD ["bun", "run", "start:dev"]

# ---------------------------------------------------------------- deps ------
FROM base AS deps

COPY --chown=node:node package.json bun.lock ./
RUN --mount=type=cache,target=/home/node/.bun/install/cache,uid=1000,gid=1000 \
    bun install --frozen-lockfile

# --------------------------------------------------------------- build ------
FROM deps AS build

COPY --chown=node:node . .
RUN bun run build \
    && bun install --frozen-lockfile --production

# ---------------------------------------------------------- production ------
FROM base AS production

ENV NODE_ENV=production
ENV PORT=80

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package.json ./package.json

USER node
EXPOSE 80
CMD ["node", "dist/main"]
