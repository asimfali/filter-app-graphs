#!/bin/bash

set -e

# /opt/tmdata-frontend/ — намеренно НЕ под /opt/tmdata: туда каждый backend-деплой
# (drf_catalog_service/deploy.sh) делает `rsync -a --delete`, и всё, что не в его
# --exclude, стирается на следующем же деплое бэкенда. Отдельная директория рядом —
# rsync бэкенда её вообще не видит, никакой exclude не нужен и не может протухнуть.
FRONTEND_DIR="/opt/tmdata-frontend/graphs"
DEV_DIR="$(pwd)"
GIT_REMOTE="local"
TMDATA_USER="tmdata"

echo "=== FRONTEND-GRAPHS DEPLOY: $(date) ==="

# Обновление кода
echo "→ Обновление кода..."
git pull "$GIT_REMOTE" prod
echo "  ✓ $(git log -1 --oneline)"

# Проверка Node.js
if ! command -v node &>/dev/null; then
    echo "→ Установка Node.js..."
    sudo apt-get install -y nodejs npm
fi

# Установка зависимостей и сборка
echo "→ Сборка frontend..."
if [ "${CLEAN_INSTALL:-0}" = "1" ]; then
    echo "  → Чистая установка..."
    rm -rf node_modules package-lock.json
    npm cache clean --force
fi
npm install --legacy-peer-deps
npm run build
echo "  ✓ Сборка завершена"

# Синхронизация dist в продакшн
echo "→ Синхронизация в $FRONTEND_DIR..."
sudo mkdir -p "$FRONTEND_DIR"
sudo rsync -a --delete "$DEV_DIR/dist/" "$FRONTEND_DIR/dist/"
sudo chown -R "$TMDATA_USER:$TMDATA_USER" "$FRONTEND_DIR"
echo "  ✓ Готово"

# Перезапуск nginx
sudo systemctl reload nginx

echo "=== FRONTEND-GRAPHS DEPLOY DONE: $(date) ==="
