FROM node:22-slim AS base

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

COPY . .

COPY .env .env

RUN bun install --frozen-lockfile

RUN bun run build

# RUN cp -r public .next/standalone/

# RUN cp -r .next/static .next/standalone/.next/


FROM base AS production

# COPY --from=builder /client/.next .next
COPY --from=builder /client/package.json package.json
COPY --from=builder /client/.env .env
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

