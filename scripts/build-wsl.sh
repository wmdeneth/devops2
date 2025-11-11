#!/usr/bin/env bash
# Simple helper to run docker compose build inside WSL
set -e
cd "$(dirname "${BASH_SOURCE[0]}")/.."
echo "Running docker compose build from WSL..."
docker compose build

echo "Build finished."