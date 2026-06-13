#!/usr/bin/env bash
# Smoke driver for @creonex/api (NestJS). Hits the real running server.
# Usage: BASE=http://localhost:3000 bash smoke.sh
# Assumes the server is already running (pnpm dev / pnpm start).
set -u
BASE="${BASE:-http://localhost:3000}"
fail=0

check() {
  local name="$1" url="$2" want="$3"
  local code
  code=$(curl -s -m 15 -o /tmp/api_body -w "%{http_code}" "$url")
  if [ "$code" = "$want" ]; then
    echo "PASS  $name  ($code)  $url"
  else
    echo "FAIL  $name  got $code want $want  $url"
    head -c 300 /tmp/api_body; echo
    fail=1
  fi
}

echo "== creonex-api smoke @ $BASE =="
# 1. health — global prefix is /api, AppController GET() -> /api
check "health"        "$BASE/api"                 200
# 2. swagger UI mounted at /api/docs
check "swagger-ui"    "$BASE/api/docs"            200
# 3. auth-gated route returns 401 without a session cookie
check "users/me 401"  "$BASE/api/v1/users/me"     401
# 4. better-auth handler is mounted (GET session -> 200, returns null when no cookie)
check "auth/session"  "$BASE/api/auth/get-session" 200

# health body sanity
if ! grep -q '"service":"creonex-api"' /tmp/api_body 2>/dev/null; then
  curl -s -m 15 "$BASE/api" | grep -q '"service":"creonex-api"' \
    && echo "PASS  health-body" || { echo "FAIL  health-body"; fail=1; }
else
  echo "PASS  health-body"
fi

[ "$fail" = 0 ] && echo "ALL PASS" || echo "SOME FAILED"
exit $fail
