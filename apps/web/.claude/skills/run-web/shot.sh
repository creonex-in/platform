#!/usr/bin/env bash
# Headless-Chrome driver for @creonex/web (Next.js).
# Screenshots a route and dumps its <title> so you can confirm a real render.
# Usage:  bash shot.sh <path> [outfile]
#   bash shot.sh /            home.png
#   bash shot.sh /creators    creators.png
# Env: BASE (default http://localhost:3001), CHROME (override browser path).
set -u
BASE="${BASE:-http://localhost:3001}"
PATH_="${1:-/}"
OUT="${2:-shot.png}"

# Locate a Chromium-family browser (Windows + Linux).
if [ -z "${CHROME:-}" ]; then
  for c in \
    "/c/Program Files/Google/Chrome/Application/chrome.exe" \
    "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
    "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
    "$(command -v google-chrome 2>/dev/null)" \
    "$(command -v chromium 2>/dev/null)" \
    "$(command -v chromium-browser 2>/dev/null)"; do
    [ -n "$c" ] && [ -x "$c" ] && CHROME="$c" && break
  done
fi
[ -z "${CHROME:-}" ] && { echo "No Chrome/Edge/Chromium found. Set CHROME=/path/to/browser"; exit 1; }

URL="$BASE$PATH_"
echo "browser: $CHROME"
echo "shooting: $URL -> $OUT"
"$CHROME" --headless --disable-gpu --hide-scrollbars \
  --window-size=1280,1600 --virtual-time-budget=8000 \
  --screenshot="$OUT" "$URL" 2>/dev/null
echo "screenshot exit: $? ($(ls -la "$OUT" 2>/dev/null | awk '{print $5}') bytes)"

echo -n "title: "
"$CHROME" --headless --disable-gpu --dump-dom --virtual-time-budget=8000 "$URL" 2>/dev/null \
  | grep -oE "<title>[^<]*</title>" | head -1
