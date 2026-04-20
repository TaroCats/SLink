# SLink

短链接服务（Rust + Actix-Web）+ 管理控制台（React + Vite）。

## 目录结构

- `api/`：后端 API（Rust / Actix-Web / SQLx / SQLite）
- `frontend/`：前端 Web（React / Vite / Tailwind）
- `scripts/`：开发与测试脚本

## 本地开发

前端（默认通过 Vite proxy 访问后端）：

```bash
cd frontend
npm ci
npm run dev -- --port 5174
```

后端：

```bash
cd api
cargo run
```

一键同时启动（前后端）：

```bash
./scripts/dev.sh
```

## 自动化烟测

启动临时后端（临时 SQLite）并跑一轮接口烟测：

```bash
./scripts/smoke.sh
```
