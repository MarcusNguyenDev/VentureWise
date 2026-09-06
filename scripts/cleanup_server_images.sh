#!/usr/bin/env bash
#
# Reclaims disk on the deployment host.
#
# The deploy already prunes dangling images each run, so this exists for the
# cases that leaves behind: a host that has been redeployed many times, a stack
# that has been stopped for a while, or a disk that has filled up between
# deploys.
#
# Safe by default — it removes what nothing references. It never touches the
# named volumes, so mongo-data and redis-data survive: losing those is losing
# the database, which is a very different operation from reclaiming space.
#
#   ./cleanup_server_images.sh           # show what would be removed
#   ./cleanup_server_images.sh --apply   # actually remove it
#
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$HOME/venturewise}"
is_dry_run=true
[[ "${1:-}" == "--apply" ]] && is_dry_run=false

if ! command -v podman >/dev/null 2>&1; then
  echo "podman not found on this host" >&2
  exit 1
fi

echo "=== images currently in use by the running stack ==="
podman ps --format '  {{.Image}}' | sort -u || true

echo
echo "=== dangling images (untagged, unreferenced) ==="
dangling=$(podman images --filter dangling=true --format '{{.ID}}  {{.Size}}' || true)
printf '%s\n' "${dangling:-  none}"

echo
echo "=== stopped containers ==="
stopped=$(podman ps -a --filter status=exited --format '{{.ID}}  {{.Names}}' || true)
printf '%s\n' "${stopped:-  none}"

echo
echo "=== dangling volumes (NOT including mongo-data or redis-data) ==="
# Named volumes attached to the stack are never listed as dangling while the
# stack exists, but the filter is stated explicitly so a reader can see that
# the database is out of scope here.
dangling_volumes=$(podman volume ls --filter dangling=true --format '{{.Name}}' \
  | grep -vE '(mongo-data|redis-data)$' || true)
printf '%s\n' "${dangling_volumes:-  none}"

if $is_dry_run; then
  echo
  echo "Dry run. Re-run with --apply to remove the above."
  exit 0
fi

echo
echo "--- removing ---"
podman container prune -f
podman image prune -f
# `-a` is deliberately not used: it would delete the images the stack is about
# to start from if the stack happens to be stopped when this runs.
podman volume ls --filter dangling=true --format '{{.Name}}' \
  | grep -vE '(mongo-data|redis-data)$' \
  | xargs -r -n1 podman volume rm || true

echo
echo "=== disk after ==="
podman system df
