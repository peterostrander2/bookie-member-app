#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${BACKEND_DIR:-}"
FRONTEND_DIR="${FRONTEND_DIR:-$ROOT_DIR}"

if [ -z "$BACKEND_DIR" ]; then
  if [ -d "$ROOT_DIR/../ai-betting-backend" ]; then
    BACKEND_DIR="$ROOT_DIR/../ai-betting-backend"
  elif [ -d "/Users/apple/ai-betting-backend" ]; then
    BACKEND_DIR="/Users/apple/ai-betting-backend"
  elif [ -d "/Users/apple/Desktop/ai-betting-backend-main" ]; then
    BACKEND_DIR="/Users/apple/Desktop/ai-betting-backend-main"
  fi
fi

if [ -z "$BACKEND_DIR" ] || [ ! -d "$BACKEND_DIR" ]; then
  echo "Final audit skipped: backend repo not found. Set BACKEND_DIR to run."
  exit 0
fi

if [ ! -x "$ROOT_DIR/scripts/final_audit.sh" ]; then
  chmod +x "$ROOT_DIR/scripts/final_audit.sh" || true
fi

"$ROOT_DIR/scripts/final_audit.sh" "$BACKEND_DIR" "$FRONTEND_DIR"
