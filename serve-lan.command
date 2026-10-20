#!/bin/zsh
set -eu
cd -- "$(dirname -- "$0")"
lan_address="$(ipconfig getifaddr en0 2>/dev/null || true)"
if [[ -n "$lan_address" ]]; then
  print -r -- "Сайт в локальной сети: http://${lan_address}:4173/"
fi
print -r -- "На этом компьютере: http://127.0.0.1:4173/"
print -r -- "Для остановки нажмите Ctrl+C."
exec python3 -m http.server 4173 --bind 0.0.0.0 --directory dist
