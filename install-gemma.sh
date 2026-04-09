#!/usr/bin/env bash
#
# install-gemma.sh
#
# Installe Ollama et télécharge un modèle Gemma adapté à une machine CPU
# (sans GPU). Testé sur Linux. Sur macOS / Windows, installer Ollama
# manuellement depuis https://ollama.com/download puis lancer la section
# "pull" de ce script.
#
# Usage:
#   chmod +x install-gemma.sh
#   ./install-gemma.sh                    # installe gemma3:1b (défaut)
#   GEMMA_MODEL=gemma2:2b ./install-gemma.sh
#
set -euo pipefail

# --- Config --------------------------------------------------------------

# Modèle par défaut : petit, rapide en CPU (~1 Go RAM)
# Autres choix CPU-friendly :
#   gemma3:1b   (~815 Mo)  -> défaut, le plus léger
#   gemma2:2b   (~1.6 Go)
#   gemma:2b    (~1.4 Go)
# Si un "gemma4" sort un jour sur Ollama, il suffit d'exporter
# GEMMA_MODEL=gemma4:<taille> avant d'exécuter le script.
GEMMA_MODEL="${GEMMA_MODEL:-gemma3:1b}"

# --- Helpers -------------------------------------------------------------

log()  { printf "\033[1;34m[gemma]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[gemma]\033[0m %s\n" "$*" >&2; }
err()  { printf "\033[1;31m[gemma]\033[0m %s\n" "$*" >&2; }

require_linux() {
  if [[ "$(uname -s)" != "Linux" ]]; then
    err "Ce script d'install automatique ne gère que Linux."
    err "Sur macOS / Windows : installez Ollama via https://ollama.com/download"
    err "puis relancez ce script (il sautera l'étape d'install)."
  fi
}

command_exists() { command -v "$1" >/dev/null 2>&1; }

# --- 1. Vérifier les prérequis ------------------------------------------

log "Vérification des prérequis…"
if ! command_exists curl; then
  err "curl est requis. Installe-le (sudo apt install curl) puis relance."
  exit 1
fi

# --- 2. Installer Ollama si nécessaire ----------------------------------

if command_exists ollama; then
  log "Ollama est déjà installé : $(ollama --version 2>/dev/null || echo inconnu)"
else
  require_linux
  log "Installation d'Ollama via le script officiel…"
  curl -fsSL https://ollama.com/install.sh | sh
fi

# --- 3. Démarrer le service Ollama --------------------------------------

start_ollama_bg() {
  log "Démarrage d'ollama serve en arrière-plan…"
  nohup ollama serve >/tmp/ollama.log 2>&1 &
  sleep 2
}

if pgrep -x ollama >/dev/null 2>&1; then
  log "Service ollama déjà en cours d'exécution."
elif command_exists systemctl && systemctl list-unit-files 2>/dev/null | grep -q '^ollama\.service'; then
  log "Activation du service systemd ollama…"
  sudo systemctl enable --now ollama || start_ollama_bg
else
  start_ollama_bg
fi

# Petite attente pour que l'API réponde
for i in 1 2 3 4 5; do
  if curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# --- 4. Télécharger le modèle Gemma -------------------------------------

log "Téléchargement du modèle : ${GEMMA_MODEL}"
log "(cela peut prendre plusieurs minutes selon ta connexion)"
if ! ollama pull "${GEMMA_MODEL}"; then
  err "Impossible de télécharger ${GEMMA_MODEL}."
  err "Vérifie que le tag existe sur https://ollama.com/library"
  err "Exemples connus : gemma3:1b, gemma2:2b, gemma:2b"
  exit 1
fi

# --- 5. Petit smoke-test -------------------------------------------------

log "Test rapide du modèle…"
if echo "Dis bonjour en une phrase." | ollama run "${GEMMA_MODEL}" >/tmp/gemma-test.out 2>&1; then
  log "Réponse du modèle :"
  sed 's/^/    /' /tmp/gemma-test.out
else
  warn "Le smoke-test a échoué, mais le modèle est téléchargé."
  warn "Essaie manuellement : ollama run ${GEMMA_MODEL}"
fi

# --- 6. Fin --------------------------------------------------------------

cat <<EOF

✓ Installation terminée.

Pour discuter avec le modèle :
    ollama run ${GEMMA_MODEL}

Pour lister les modèles installés :
    ollama list

Pour arrêter le service (si lancé en nohup) :
    pkill -x ollama

EOF
