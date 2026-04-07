# OpenClaw Offline Deployment Guide (Windows)

Offline deployment for Windows machines with Node.js and npm mirror, no other internet.

---

## Quick Start (3 Steps)

### 1. Build (on a machine with network)

```bash
pnpm install && pnpm build && npm pack
# Output: openclaw-<version>.tgz
```

### 2. Transfer & Install (on Windows)

Copy `openclaw-<version>.tgz` to the Windows machine, then:

```powershell
# Make sure npm mirror is configured
npm config get registry

# Unpack
mkdir C:\openclaw && cd C:\openclaw
tar xzf path\to\openclaw-<version>.tgz
cd package

# Install production dependencies (skip channel plugin deps — not needed offline)
set OPENCLAW_DISABLE_BUNDLED_PLUGIN_POSTINSTALL=1
npm install --omit=dev
```

### 3. Start

```powershell
start.bat
```

That's it. Open the URL printed in the console:

```
http://127.0.0.1:18789/#token=42ad4476eeb7fc5c6a7f98ecd4f849e06cf75170b39600f2
```

The browser opens directly into the chat UI. No login, no onboarding.

---

## Configure LLM Provider

The only thing you need to configure is your model provider.

### Option A: Local Model (Ollama, vLLM, etc.)

Edit `~/.openclaw/openclaw.json` (Windows: `%APPDATA%\OpenClaw\openclaw.json`):

```json
{
  "gateway": {
    "mode": "local",
    "bind": "loopback",
    "port": 18789,
    "auth": {
      "mode": "token",
      "token": "42ad4476eeb7fc5c6a7f98ecd4f849e06cf75170b39600f2"
    }
  },
  "models": {
    "providers": {
      "ollama": {
        "baseUrl": "http://localhost:11434",
        "enabled": true
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "ollama/llama3"
      }
    }
  }
}
```

### Option B: OpenAI-compatible API

```json
{
  "models": {
    "providers": {
      "openai-compatible": {
        "baseUrl": "http://your-local-llm:8080",
        "apiKey": "your-api-key",
        "enabled": true
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "openai-compatible/your-model-name"
      }
    }
  }
}
```

### Option C: Cloud API (if network available)

```json
{
  "models": {
    "providers": {
      "anthropic": {
        "apiKey": "sk-ant-..."
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-20250514"
      }
    }
  }
}
```

---

## Pre-configured Defaults

| Setting       | Value                                                                            |
| ------------- | -------------------------------------------------------------------------------- |
| Gateway port  | `18789`                                                                          |
| Auth mode     | `token`                                                                          |
| Static token  | `42ad4476eeb7fc5c6a7f98ecd4f849e06cf75170b39600f2`                               |
| Bind          | `loopback` (localhost only)                                                      |
| Dashboard URL | `http://127.0.0.1:18789/#token=42ad4476eeb7fc5c6a7f98ecd4f849e06cf75170b39600f2` |

The `#token=` fragment in the URL auto-authenticates the browser session. After the first visit, the token is saved in browser localStorage and you can use `http://127.0.0.1:18789/` directly.

---

## Prerequisites

- **Node.js 22.14.0+** (official installer with bundled npm)
- **npm mirror** configured (`npm config set registry https://your-mirror/`)

---

## npm Mirror Must Include

| Package                          | Purpose            | Required |
| -------------------------------- | ------------------ | -------- |
| `sharp` + `@img/sharp-win32-x64` | Image processing   | Yes      |
| `@lydell/node-pty`               | Terminal emulation | Yes      |
| `esbuild` + `@esbuild/win32-x64` | Runtime bundler    | Yes      |
| `protobufjs`                     | Protocol buffers   | Yes      |

---

## Dev Iteration Workflow

```bash
# On build machine: modify source, rebuild, repack
pnpm build && npm pack

# On Windows: replace dist/ only (skip npm install if deps unchanged)
# Or full reinstall:
npm install -g .\openclaw-<version>.tgz
```

---

## Startup Scripts

| File        | Platform    | Usage                      |
| ----------- | ----------- | -------------------------- |
| `start.bat` | Windows     | Double-click or run in cmd |
| `start.sh`  | macOS/Linux | `./start.sh`               |

Both scripts:

1. Auto-create default config (if not exists) with static token
2. Print the dashboard URL
3. Start the gateway

---

## Environment Variables

| Variable                   | Purpose                             |
| -------------------------- | ----------------------------------- |
| `OPENCLAW_GATEWAY_TOKEN`   | Override the static auth token      |
| `OPENCLAW_GATEWAY_PORT`    | Override the gateway port           |
| `OPENCLAW_STATE_DIR`       | Override the config/state directory |
| `OPENCLAW_SKIP_CHANNELS=1` | Skip loading messaging channels     |

---

## Notes

- **Architecture**: Windows x64 only (ARM64 not supported)
- **Channels disabled**: Offline mode skips messaging channels (Slack, Telegram, WhatsApp, etc.). Only the LLM chat UI is available.
- **Provider deps**: Ollama, Anthropic, DeepSeek, Qwen, and OpenAI-compatible providers work without extra runtime deps. If you need Google (`@google/genai`) or Amazon Bedrock (`@aws-sdk/client-bedrock`), install them manually via `npm install --no-save <package>`.
- **Security**: The static token is for internal/offline use. Change it for any network-exposed deployment.
- **Config location**: Windows `%APPDATA%\OpenClaw\openclaw.json`, macOS/Linux `~/.openclaw/openclaw.json`
- **First browser visit**: Use the full URL with `#token=...`. Subsequent visits just use `http://127.0.0.1:18789/`
