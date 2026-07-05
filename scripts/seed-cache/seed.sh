#!/usr/bin/env bash
# Seeds the backend SPARQL cache: fires every query in a queries.json (from
# generate-queries.mjs) at POST /api/search (v=2) and re-polls the ones that
# answer indexLoading=true until they are materialized.
#
# Usage:
#   API_BASE_URL=https://host/path ./seed.sh queries.json
#
# Env:
#   POLL_SECONDS  Seconds between polling rounds (default 30)
#   MAX_WAIT      Max total seconds to wait for all loads (default 3600)
#   SEED_Q        Search term sent with each request (default "a"; only used
#                 to satisfy the required q param, it does not affect caching)
set -euo pipefail

QUERIES_FILE="${1:?Usage: API_BASE_URL=... $0 queries.json}"
: "${API_BASE_URL:?Set API_BASE_URL to the backend base URL}"
POLL_SECONDS="${POLL_SECONDS:-30}"
MAX_WAIT="${MAX_WAIT:-3600}"
SEED_Q="${SEED_Q:-a}"

command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }

ENDPOINT="${API_BASE_URL%/}/api/search"
TOTAL=$(jq length "$QUERIES_FILE")

# Returns the indexLoading flag ("true"/"false") for entry $1, firing the request.
fire () {
  local idx="$1"
  local hint searchVars sparql response
  hint=$(jq -r ".[$idx].hint" "$QUERIES_FILE")
  searchVars=$(jq -r ".[$idx].searchVars" "$QUERIES_FILE")
  sparql=$(jq -r ".[$idx].sparql" "$QUERIES_FILE")
  response=$(curl -sS -X POST "$ENDPOINT" \
    --data-urlencode "v=2" \
    --data-urlencode "q=$SEED_Q" \
    --data-urlencode "hint=$hint" \
    --data-urlencode "searchVars=$searchVars" \
    --data-urlencode "sparqlQuery=$sparql" \
    -H 'Content-Type: application/x-www-form-urlencoded') || { echo "request failed for $hint" >&2; echo "error"; return; }
  echo "$response" | jq -r '.indexLoading'
}

echo "Seeding $TOTAL queries against $ENDPOINT"

# Pass 1: register every query (the backend loads them in the background).
declare -a PENDING=()
for ((i = 0; i < TOTAL; i++)); do
  hint=$(jq -r ".[$i].hint" "$QUERIES_FILE")
  loading=$(fire "$i")
  case "$loading" in
    true) echo "[$((i + 1))/$TOTAL] $hint: loading"; PENDING+=("$i") ;;
    false) echo "[$((i + 1))/$TOTAL] $hint: already cached" ;;
    *) echo "[$((i + 1))/$TOTAL] $hint: ERROR" ;;
  esac
done

# Pass 2: poll the pending ones until everything is materialized.
ELAPSED=0
while ((${#PENDING[@]} > 0)); do
  if ((ELAPSED >= MAX_WAIT)); then
    echo "Timed out after ${MAX_WAIT}s with ${#PENDING[@]} queries still loading" >&2
    exit 1
  fi
  echo "${#PENDING[@]} still loading; polling again in ${POLL_SECONDS}s..."
  sleep "$POLL_SECONDS"
  ELAPSED=$((ELAPSED + POLL_SECONDS))
  STILL=()
  for i in "${PENDING[@]}"; do
    loading=$(fire "$i")
    if [[ "$loading" == "true" ]]; then
      STILL+=("$i")
    else
      echo "$(jq -r ".[$i].hint" "$QUERIES_FILE"): done"
    fi
  done
  PENDING=("${STILL[@]:-}")
  [[ "${PENDING[0]:-}" == "" ]] && PENDING=()
done

echo "All $TOTAL queries materialized."
