#!/usr/bin/env bash
# Start Mintlify for Playwright: fixed port, no browser, Node LTS when needed.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOCS_DIR="$REPO_ROOT/docs"
MINT_PORT="${MINT_PORT:-3333}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: '$1' is not installed or not on PATH" >&2
    exit 1
  fi
}

mintlify_node_bin_dir() {
  local candidate major
  for candidate in \
    "/opt/homebrew/opt/node@22/bin" \
    "/usr/local/opt/node@22/bin" \
    "/opt/homebrew/opt/node@20/bin" \
    "/usr/local/opt/node@20/bin"; do
    if [[ -x "$candidate/node" ]]; then
      major=$("$candidate/node" -p "process.versions.node.split('.')[0]")
      if [[ "$major" -lt 25 ]]; then
        echo "$candidate"
        return 0
      fi
    fi
  done
  return 1
}

require_cmd mint
if [[ ! -d "$DOCS_DIR" ]]; then
  echo "error: Mintlify content directory not found: $DOCS_DIR" >&2
  exit 1
fi

node_bin_dir=""
current_major=$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo "99")
if [[ "$current_major" -ge 25 ]]; then
  node_bin_dir=$(mintlify_node_bin_dir) || {
    echo "error: mintlify requires Node LTS (<25); current node is $(node -v 2>/dev/null || echo unknown)" >&2
    exit 1
  }
fi

if [[ -n "$node_bin_dir" ]]; then
  cd "$DOCS_DIR"
  exec env PATH="$node_bin_dir:$PATH" mint dev --no-open --port="$MINT_PORT"
else
  cd "$DOCS_DIR"
  exec mint dev --no-open --port="$MINT_PORT"
fi
