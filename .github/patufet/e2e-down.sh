#!/usr/bin/env bash
# patufet e2e hook: stop the application. Always runs, even after failures.
state_dir="${RUNNER_TEMP:-/tmp}/patufet-e2e"
if [ -f "$state_dir/serve.pid" ]; then
  pid=$(cat "$state_dir/serve.pid")
  kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
fi
rm -rf "$state_dir"
exit 0
