@echo off
title OpenClaw Gateway
echo.
echo  ========================================
echo   OpenClaw Gateway - Offline Starter
echo  ========================================
echo.

:: Setup default config if not exists
node scripts\setup-offline-defaults.mjs

:: Start gateway
echo.
echo  Starting gateway on http://127.0.0.1:18789
echo.
echo  Dashboard URL (copy to browser):
echo  http://127.0.0.1:18789/#token=42ad4476eeb7fc5c6a7f98ecd4f849e06cf75170b39600f2
echo.
echo  Press Ctrl+C to stop.
echo  ========================================
echo.

node openclaw.mjs gateway run --bind loopback --port 18789
