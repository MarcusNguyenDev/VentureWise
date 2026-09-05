# syntax=docker/dockerfile:1
#
# Multi-stage build for the VentureWise front-end (Next.js).
# Runtime: Node 24 (Alpine). Package manager / script runner: bun.
#
#   development -> dev container + `docker compose up` (source is bind-mounted)
#   production  -> `next build` output served by `next start`
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
ENV NEXT_TELEMETRY_DISABLED=1
RUN mkdir -p "$BUN_INSTALL/bin" /workspace/node_modules /workspace/.next \
    && chown -R node:node "$BUN_INSTALL" /workspace \
    && printf 'export BUN_INSTALL=/home/node/.bun\nexport PATH=$BUN_INSTALL/bin:$PATH\n' > /etc/profile.d/bun.sh

WORKDIR /workspace

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
    && chmod 0440 /etc/sudoers.d/node

ENV NODE_ENV=development
USER node
EXPOSE 3000
CMD ["bun", "run", "dev"]

# ---------------------------------------------------------------- deps ------
FROM base AS deps

COPY --chown=node:node package.json bun.lock ./
RUN --mount=type=cache,target=/home/node/.bun/install/cache,uid=1000,gid=1000 \
    bun install --frozen-lockfile

# --------------------------------------------------------------- build ------
FROM deps AS build

ENV NODE_ENV=production
COPY --chown=node:node . .
RUN bun run build

# ---------------------------------------------------------- production ------
FROM base AS production

ENV NODE_ENV=production
ENV PORT=80

COPY --from=build --chown=node:node /workspace/node_modules ./node_modules
COPY --from=build --chown=node:node /workspace/.next ./.next
COPY --from=build --chown=node:node /workspace/public ./public
COPY --from=build --chown=node:node /workspace/package.json ./package.json
COPY --from=build --chown=node:node /workspace/next.config.ts ./next.config.ts

USER node
EXPOSE 80
CMD ["bun", "run", "start"]
