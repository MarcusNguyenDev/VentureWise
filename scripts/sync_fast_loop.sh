#!/usr/bin/env bash
#
# Regenerates the browser copy of the fast-loop analysers from the API originals.
#
# The fast loop has to run in the browser with no network call — that is the
# whole point of F-01 — but the same maths has to be available server side for
# replayed transcripts and the slow loop. Rather than let two hand-maintained
# copies drift, the API is the source of truth and this script regenerates the
# browser copy.
#
#   ./scripts/sync_fast_loop.sh          # regenerate
#   ./scripts/sync_fast_loop.sh --check  # fail if the copy is stale (for CI)
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$REPO_ROOT/api/src/speech_analysis"
SHARED_DIR="$REPO_ROOT/api/src/shared/types"
TARGET_DIR="$REPO_ROOT/front-end/lib/fast_loop"

SYNCED_FILES=(
  "pronoun_attribution.util.ts"
  "hedge_lexicon.const.ts"
  "hedge_detection.util.ts"
  "filler_lexicon.const.ts"
  "filler_detection.util.ts"
  "speaking_pace.util.ts"
  "transcript_word.type.ts"
)

is_check_only=false
if [[ "${1:-}" == "--check" ]]; then is_check_only=true; fi

build_dir="$(mktemp -d)"
trap 'rm -rf "$build_dir"' EXIT

header='// GENERATED FILE — DO NOT EDIT.
// Regenerate with ./scripts/sync_fast_loop.sh after changing the API original.
// Source: api/src/speech_analysis/'

for file_name in "${SYNCED_FILES[@]}"; do
  {
    printf '%s%s\n\n' "$header" "$file_name"
    # The only difference between the two copies is where the shared enum lives.
    sed "s#from '../shared/types/metric_verdict.enum'#from './metric_verdict.enum'#" \
      "$SOURCE_DIR/$file_name"
  } > "$build_dir/$file_name"
done

{
  printf '%s%s\n\n' "$header" "../shared/types/metric_verdict.enum.ts"
  cat "$SHARED_DIR/metric_verdict.enum.ts"
} > "$build_dir/metric_verdict.enum.ts"

if $is_check_only; then
  # Compared file by file, not directory to directory: the target also holds
  # hand-written browser-only code (the analyser, the hooks) that is not
  # generated from anything and must not count as drift.
  is_stale=false

  for generated_file in "$build_dir"/*.ts; do
    file_name="$(basename "$generated_file")"

    if ! diff -q "$generated_file" "$TARGET_DIR/$file_name" > /dev/null 2>&1; then
      echo "STALE: $file_name" >&2
      diff -u "$TARGET_DIR/$file_name" "$generated_file" || true
      is_stale=true
    fi
  done

  if $is_stale; then
    echo "fast loop copy is STALE — run ./scripts/sync_fast_loop.sh" >&2
    exit 1
  fi

  echo "fast loop copy is in sync"
  exit 0
fi

mkdir -p "$TARGET_DIR"
cp "$build_dir"/*.ts "$TARGET_DIR/"
echo "synced ${#SYNCED_FILES[@]} analysers + metric_verdict.enum.ts to front-end/lib/fast_loop/"
