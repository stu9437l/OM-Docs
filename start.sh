#!/usr/bin/env bash
# Optional static preview — no Python packages required.
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-8790}"
echo "OM Docs Hosting Bundle (docs only — no File Compare)"
echo "  Hub: http://127.0.0.1:${PORT}/"
exec python3 -m http.server "$PORT" --bind 0.0.0.0
