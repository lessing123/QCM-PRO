#!/bin/sh
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     QCM — Démarrage Docker           ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Attente de MySQL ─────────────────────────────────────────────
echo "⏳ Connexion à MySQL en cours..."

MAX_RETRIES=40
RETRY=0

until npx prisma db push --skip-generate 2>/dev/null; do
  RETRY=$((RETRY + 1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "❌ Impossible de joindre MySQL après $MAX_RETRIES tentatives. Abandon."
    exit 1
  fi
  echo "   MySQL pas encore prêt — tentative $RETRY/$MAX_RETRIES (attente 3s)..."
  sleep 3
done

echo "✅ Schéma MySQL appliqué avec succès!"
echo ""

# ── Seeding initial (optionnel) ──────────────────────────────────
if [ "${SEED_DB:-false}" = "true" ]; then
  echo "🌱 Seeding de la base de données..."
  npx tsx prisma/seed.ts && echo "✅ Seed terminé!" || echo "⚠️  Seed ignoré (données existantes ou erreur)"
  echo ""
fi

# ── Démarrage du serveur ─────────────────────────────────────────
echo "🚀 Démarrage du serveur sur le port ${PORT:-3001}..."
echo ""

exec node dist/server.js
