FROM node:24-slim AS base

WORKDIR /client

RUN apt-get update && apt-get install -y curl git procps poppler-utils unzip

RUN npm install -g bun

RUN bun upgrade

FROM base AS development

# The repo root is bind-mounted at /workspaces; pre-create the node_modules and
# .next mount points so the named volumes come up owned by `node`, and let git
# accept a worktree that belongs to the host user.
RUN mkdir -p /workspaces/front-end/node_modules /workspaces/front-end/.next \
    && chown -R node:node /workspaces \
    && git config --system --add safe.directory /workspaces

WORKDIR /workspaces/front-end
USER node
EXPOSE 3000
CMD ["bun", "run", "dev"]

FROM base AS test 

COPY . .

COPY .env .env

RUN bun install --frozen-lockfile

RUN bun run test


FROM base AS builder

# Stated rather than relied upon. `next build` defaults to production when
# NODE_ENV is unset, which is what happens here today — but a base image or a
# build arg that sets it to anything else would silently produce the broken
# prerender described in docker-compose.yml. Pinning it costs nothing.
ENV NODE_ENV=production

COPY . .

RUN bun install --frozen-lockfile

# NEXT_PUBLIC_* values are inlined into the client bundle, so the deploy env
# has to be present here rather than at run time. BuildKit keeps the secret on
# a tmpfs for this RUN only, so it never lands in a layer:
#
#   docker build --secret id=fe_env,src=.env --target production .
#
# Without the secret the build still succeeds and falls back to the defaults
# baked into the code.
RUN --mount=type=secret,id=fe_env,target=/client/.env \
    bun run build

# RUN cp -r public .next/standalone/

# RUN cp -r .next/static .next/standalone/.next/


FROM base AS production

# COPY --from=builder /client/.next .next
COPY --from=builder /client/package.json package.json
COPY --from=builder /client/.next .next
COPY --from=builder /client/public public
COPY --from=builder /client/tsconfig.json tsconfig.json
COPY --from=builder /client/next.config.ts next.config.ts
COPY --from=builder /client/node_modules node_modules

# RUN bun install --frozen-lockfile --production

EXPOSE 80

ENV NODE_ENV=production
ENV PORT=80


# CMD ["node", ".next/standalone/server.js"]
CMD ["bun", "run", "start"]

