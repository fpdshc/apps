#!/usr/bin/env bash
# Render docs/img/social-card.png, the 1200x630 link-preview image for the site.
#
# The card source is tools/og-card.html, which reproduces the left side of the hero
# band without the QR code. Run this after changing the hero copy, the palette or the
# logo; the output is committed because GitHub Pages serves it directly.
#
# Finds a Chromium in the usual places: $CHROME_BIN, a Playwright cache, or PATH.
set -euo pipefail

cd "$(dirname "$0")/.."

find_chrome() {
  if [ -n "${CHROME_BIN:-}" ] && [ -x "${CHROME_BIN}" ]; then
    printf '%s\n' "$CHROME_BIN"; return 0
  fi
  local candidate
  for candidate in \
    "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux*/chrome \
    /usr/bin/google-chrome /usr/bin/chromium /usr/bin/chromium-browser; do
    # shellcheck disable=SC2086
    for f in $candidate; do
      if [ -x "$f" ]; then printf '%s\n' "$f"; return 0; fi
    done
  done
  return 1
}

CHROME="$(find_chrome)" || {
  echo "No Chromium found. Set CHROME_BIN to a Chrome/Chromium binary." >&2
  exit 1
}

OUT=docs/img/social-card.png
"$CHROME" \
  --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 \
  --screenshot="$OUT" \
  "file://$(pwd)/tools/og-card.html" 2>&1 | grep -v '^Fontconfig' || true

python3 - "$OUT" <<'PY'
import sys
from PIL import Image

path = sys.argv[1]
im = Image.open(path)
if im.size != (1200, 630):
    raise SystemExit(f"FAIL: {path} is {im.size}, expected (1200, 630)")
print(f"OK - {path} is {im.size[0]}x{im.size[1]}, {im.mode}")
PY
