#!/usr/bin/env bash
# Roda todos os testes no navegador. Precisa do Playwright instalado (npm i -g playwright).
# Uso: tests/run-all.sh         (o robô de balanceamento roda separado: node tests/bot-balanceamento.js)
cd "$(dirname "$0")"
export SP="${SP:-$(mktemp -d)}"          # pasta das capturas de tela
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
fail=0
for t in [0-9]*.js; do
  out=$(node "$t" 2>&1); echo "$out" > "$SP/${t%.js}.log"
  if echo "$out" | grep -q "errors \[\]" && ! echo "$out" | grep -q "Error:"; then
    echo "✅ $t"
  else
    echo "❌ $t"; echo "$out" | grep -E "Error|waiting for|intercepts|element is" | head -6; fail=1
  fi
done
echo "Capturas de tela em: $SP"
exit $fail
