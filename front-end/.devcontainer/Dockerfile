# Runtime is Node 24; bun is the package manager / script runner.
FROM node:24-bookworm

# Pull the bun binary straight from the official image (Debian-based, glibc-compatible).
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun
RUN ln -sf /usr/local/bin/bun /usr/local/bin/bunx \
    && chmod 755 /usr/local/bin/bun \
    && bun --version

# bun's global bin dir, on PATH for the non-root `node` user
# (also via profile.d, so login shells don't drop it).
ENV BUN_INSTALL=/home/node/.bun
ENV PATH=$BUN_INSTALL/bin:$PATH
RUN mkdir -p $BUN_INSTALL/bin \
    && chown -R node:node $BUN_INSTALL \
    && printf 'export BUN_INSTALL=/home/node/.bun\nexport PATH=$BUN_INSTALL/bin:$PATH\n' > /etc/profile.d/bun.sh
