#!/usr/bin/env bash
# patufet e2e hook: start the application on the GitHub runner, wait until
# it answers, and export what the tester needs.
#
# Read-only e2e of the PR's frontend only. FactGrid sends IPs with a bad
# reputation (GitHub runners included) to a PoW challenge page, so a backend
# started here cannot reach it. The SPA is built from the PR and pointed at the
# staging backend instead, which FactGrid lets through. Backend changes in the
# PR are therefore NOT exercised. There is no real login, but a simulated
# session (an oauth cookie with a fake token) unlocks the screens that need
# login. The backend rejects the fake token with session-expired before
# sending anything to FactGrid, so nothing can be written from here.
#
# Contract (see https://github.com/jmformenti/patufet/blob/v1/docs/e2e.md):
#   - Runs from the repository root with the PR branch checked out.
#   - Must exit non-zero if the app is not usable (the job then fails, no verdict).
#   - Must append KEY=VALUE lines to the file named by $PATUFET_E2E_ENV.
set -euo pipefail

port="${PATUFET_E2E_PORT:-3000}"  # override only to test the hook locally
app_url="http://localhost:$port"
backend_url="https://philobiblon.cog.berkeley.edu/ui-local"
state_dir="${RUNNER_TEMP:-/tmp}/patufet-e2e"
mkdir -p "$state_dir"

# 1. The staging backend and, through it, FactGrid answer
code=$(curl -s -o /dev/null -w '%{http_code}' "$backend_url/api/config" || true)
[ "$code" = "200" ] || { echo "Staging backend $backend_url/api/config answered ${code:-nothing}"; exit 1; }
siteinfo=$(curl -s "$backend_url/w/api.php?action=query&meta=siteinfo&format=json" || true)
if ! grep -q '"sitename"' <<<"$siteinfo"; then
  echo "FactGrid is not reachable through the staging backend. First bytes of the answer:"
  head -c 500 <<<"$siteinfo"; echo
  exit 1
fi

# 2. Build the PR's SPA as the Docker image does, and serve it with an SPA fallback.
# The Dockerfile builds with Node 22; take it from the runner's tool cache when
# the default `node` on the runner is another major version.
node22=$(ls -d "${RUNNER_TOOL_CACHE:-/opt/hostedtoolcache}"/node/22.*/x64/bin 2>/dev/null | sort -V | tail -n 1 || true)
[ -z "$node22" ] || export PATH="$node22:$PATH"
echo "Building with Node $(node --version)"
cd frontend
corepack enable
yarn install --immutable
API_BASE_URL="$backend_url/" yarn generate
# setsid: own process group, so e2e-down.sh also stops the server npx spawns
setsid nohup npx --yes serve@14.2.4 --single --no-clipboard --listen "$port" .output/public \
  > "$state_dir/serve.log" 2>&1 &
echo $! > "$state_dir/serve.pid"
cd ..

echo "Waiting for $app_url ..."
code=""
for _ in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$app_url/en/search/manid/query" || true)
  [ "$code" = "200" ] && break
  sleep 2
done
if [ "$code" != "200" ]; then
  echo "The frontend did not start in time (last status: ${code:-none})"
  cat "$state_dir/serve.log"
  exit 1
fi

# 3. Simulated session: same cookie format as signToken() in oauth.service.js
fake_cookie=$(node -e '
const b64 = (s) => Buffer.from(s).toString("base64url");
const payload = { username: "patufet-e2e", accessToken: { token: "patufet-e2e-fake", tokenSecret: "x" }, expiresAt: Date.now() + 55 * 60 * 1000 };
process.stdout.write(b64("{}") + "." + b64(JSON.stringify(payload)) + ".");
')
# Safety: the backend must reject the fake token, otherwise writes could go through
csrf=$(curl -s -H 'Authorization: OAuth oauth_token="patufet-e2e-fake", oauth_token_secret="x"' \
  "$backend_url/w/api.php?action=query&meta=tokens&type=csrf&format=json" || true)
if ! grep -q 'session-expired' <<<"$csrf"; then
  echo "The simulated session is not safe: the backend did not answer session-expired to the fake token. Answer:"
  head -c 500 <<<"$csrf"; echo
  exit 1
fi

{
  echo "APP_URL=$app_url"
  echo "BACKEND=staging ($backend_url), shared with the team: read-only flows only"
  echo "FAKE_SESSION_COOKIE=$fake_cookie"
  echo "LOGIN=simulated only: set the oauth cookie to FAKE_SESSION_COOKIE (e.g. document.cookie = 'oauth=<value>; path=/') and reload. The backend rejects its token, so any write fails with \"session expired\". Never use the real Login button."
} >> "$PATUFET_E2E_ENV"
