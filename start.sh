#!/usr/bin/env bash
set -e

echo ""
echo "  ========================================"
echo "   OpenClaw Gateway - Offline Starter"
echo "  ========================================"
echo ""

# Skip channel plugins (Slack, Telegram, etc.) — not needed offline
export OPENCLAW_SKIP_CHANNELS=1
# Skip bundled plugin dep install on any accidental postinstall re-run
export OPENCLAW_DISABLE_BUNDLED_PLUGIN_POSTINSTALL=1

# Setup default config if not exists
node scripts/setup-offline-defaults.mjs

echo ""
echo "  Starting gateway on http://127.0.0.1:18789"
echo ""
echo "  Dashboard URL (copy to browser):"
echo "  http://127.0.0.1:18789/#token=42ad4476eeb7fc5c6a7f98ecd4f849e06cf75170b39600f2"
echo ""
echo "  Press Ctrl+C to stop."
echo "  ========================================"
echo ""

node openclaw.mjs gateway run --bind loopback --port 18789
