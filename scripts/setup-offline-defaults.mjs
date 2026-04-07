#!/usr/bin/env node
/**
 * Writes a default gateway config for offline / air-gapped deployments.
 * Runs during postinstall or can be invoked manually.
 *
 * - Pre-configures gateway.mode, auth token, and bind mode
 * - Skips if a config already exists (never overwrites user config)
 * - Users only need to add their LLM provider settings afterwards
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const STATIC_TOKEN = "42ad4476eeb7fc5c6a7f98ecd4f849e06cf75170b39600f2";

function resolveStateDir() {
  if (process.env.OPENCLAW_STATE_DIR) {
    return process.env.OPENCLAW_STATE_DIR;
  }
  if (process.platform === "win32") {
    return path.join(
      process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
      "OpenClaw",
    );
  }
  return path.join(os.homedir(), ".openclaw");
}

function run() {
  const stateDir = resolveStateDir();
  const configPath = path.join(stateDir, "openclaw.json");

  if (fs.existsSync(configPath)) {
    console.log(`[setup-offline-defaults] Config already exists at ${configPath}, skipping.`);
    return;
  }

  const defaultConfig = {
    gateway: {
      mode: "local",
      bind: "loopback",
      port: 18789,
      auth: {
        mode: "token",
        token: STATIC_TOKEN,
      },
    },
    agents: {
      defaults: {},
    },
  };

  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2) + "\n", "utf8");
  console.log(`[setup-offline-defaults] Default config written to ${configPath}`);
  console.log(`[setup-offline-defaults] Gateway token: ${STATIC_TOKEN}`);
  console.log(
    `[setup-offline-defaults] Dashboard URL:  http://127.0.0.1:18789/#token=${STATIC_TOKEN}`,
  );
}

run();
