#!/usr/bin/env bash
# Starts the built server, makes one request to /stream/ in each mode, and reports
# whether the server process is still alive afterwards.
#
#   pnpm install && pnpm build && ./check.sh
#
# Expected today: "server alive after: NO" for both modes.
set -u
PORT="${PORT:-4316}"
for MODE in error endless; do
	PORT="$PORT" bun run dist-server/entry.bun-server.js >"server-$MODE.log" 2>&1 &
	PID=$!
	for _ in $(seq 1 30); do curl -sf "localhost:$PORT/" >/dev/null && break; sleep 0.5; done
	curl -s -m 2 "localhost:$PORT/stream/?mode=$MODE" -o /dev/null \
		-w "mode=$MODE curl exit=%{exitcode} http=%{http_code}  "
	sleep 2
	if kill -0 "$PID" 2>/dev/null; then
		echo "server alive after: yes"
		kill "$PID"
	else
		wait "$PID"
		echo "server alive after: NO (exit $?)"
	fi
done
