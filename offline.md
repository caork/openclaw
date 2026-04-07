# OpenClaw 离线安装部署指南（Windows）

适用场景：目标 Windows 机器有 Node.js 和 npm mirror，但无其他外网访问。

---

## 整体思路

`dist/` 是纯 JavaScript，跨平台通用。但 `node_modules/` 包含平台相关的原生二进制（如 `sharp`、`node-pty`），**不能从 Mac/Linux 直接拷贝到 Windows**。

策略：**有网机器上构建 JS → 传输到 Windows → Windows 上用 npm mirror 安装依赖 → 运行**

---

## 前置条件

### 构建机器（Mac / Linux，有网络）

- Node.js 22.14.0+
- pnpm（`corepack enable && corepack prepare pnpm`）
- Git

### 目标 Windows 机器

- Node.js **22.14.0+**（官方安装包，自带 npm）
- npm mirror 已配置（`npm config set registry https://your-mirror/`）
- 无其他外网

---

## 步骤一：构建机器上打包

```bash
cd /path/to/openclaw

# 1. 安装依赖
pnpm install

# 2. 完整构建
pnpm build

# 3. 打包成 npm tarball
npm pack
# 产出: openclaw-<version>.tgz
```

`npm pack` 产出的 tarball 包含 `dist/`、`package.json`、`openclaw.mjs` 等运行时文件，但**不含** `node_modules/`。

---

## 步骤二：传输到 Windows

将 `openclaw-<version>.tgz` 拷贝到 Windows 机器（U 盘、内网共享等）。

只需要这一个文件。

---

## 步骤三：Windows 上安装

### 方式 A：全局安装（推荐）

```powershell
# 确认 npm mirror 已配置
npm config get registry

# 全局安装 tarball
npm install -g .\openclaw-<version>.tgz

# 验证
openclaw --version
openclaw --help
```

安装过程会自动：
- 解压 tarball 到全局 `node_modules/openclaw/`
- 触发 `postinstall` 脚本
- 从 npm mirror 下载 production dependencies 的 Windows 原生二进制
- 注册 `openclaw` 命令

### 方式 B：本地目录安装

```powershell
# 1. 创建工作目录
mkdir C:\openclaw
cd C:\openclaw

# 2. 解压 tarball
tar xzf path\to\openclaw-<version>.tgz
cd package

# 3. 安装生产依赖（从 npm mirror 拉取）
npm install --omit=dev

# 4. 安装捆绑插件的运行时依赖
node scripts\postinstall-bundled-plugins.mjs

# 5. 验证
node openclaw.mjs --version
```

---

## 步骤四：启动 Gateway

```powershell
# 全局安装方式
openclaw gateway run --bind loopback --port 18789

# 本地目录方式
node openclaw.mjs gateway run --bind loopback --port 18789
```

---

## 配置本地模型（无外网必须）

没有外网无法调用 OpenAI / Anthropic 等云端 API，需要配置本地模型服务：

```powershell
# Ollama
openclaw config set providers.ollama.baseUrl http://localhost:11434
openclaw config set providers.ollama.enabled true

# 或任何兼容 OpenAI API 的本地服务
openclaw config set providers.openai-compatible.baseUrl http://your-local-llm:8080
openclaw config set providers.openai-compatible.enabled true
```

---

## npm mirror 需要包含的关键包

确保 mirror 至少镜像以下包（含 **win32-x64** 平台二进制）：

| 包名 | 用途 | 是否必须 |
|------|------|---------|
| `sharp` + `@img/sharp-win32-x64` | 图片处理 | 是 |
| `@lydell/node-pty` | 终端模拟 | 是 |
| `esbuild` + `@esbuild/win32-x64` | 运行时打包 | 是 |
| `protobufjs` | 协议缓冲 | 是 |
| `@discordjs/opus` | Discord 语音 | 否 |
| `@matrix-org/matrix-sdk-crypto-nodejs` | Matrix 加密 | 否 |

---

## 开发迭代流程

如果需要修改源码后重新部署：

```bash
# --- 在构建机器上 ---

# 1. 修改源码（src/ 下的 TypeScript 文件）
# 2. 重新构建
pnpm build
# 3. 重新打包
npm pack

# --- 传输 .tgz 到 Windows ---

# --- 在 Windows 上 ---

# 全局安装：直接覆盖安装
npm install -g .\openclaw-<version>.tgz

# 本地安装：只替换 dist/ 目录即可（依赖未变时无需重新 npm install）
```

**快速迭代技巧：** 如果只改了 JS 逻辑没改 `package.json` 依赖，可以只拷贝 `dist/` 目录覆盖到 Windows，跳过 `npm install` 步骤。

---

## 环境变量参考

| 变量 | 用途 |
|------|------|
| `OPENCLAW_SKIP_CHANNELS=1` | 跳过加载消息通道（无网络测试时有用） |
| `OPENCLAW_DISABLE_BUNDLED_PLUGIN_POSTINSTALL=1` | 跳过插件依赖安装 |
| `OPENCLAW_PROFILE=dev` | 开发模式 |
| `NODE_ENV=production` | 生产模式 |

---

## 注意事项

1. **Node.js 版本**：必须 22.14.0+，且使用官方安装包（自带 npm）
2. **架构**：当前仅支持 Windows **x64**，不支持 ARM64 Windows
3. **原生模块**：`node_modules/` 中的 `.node` 二进制必须匹配 Windows x64
4. **符号链接**：Windows 下 npm 使用 junction 替代符号链接，hoisted 布局下通常不影响
5. **npm 路径**：OpenClaw 运行时要求 npm 与 Node.js 捆绑安装，不支持独立安装的 npm
