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

## 部署：初始化管理员

通过 compose 配置初始化管理员用户名与密码（`docker-compose.yml` 的 `environment`）：

```yaml
- ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
- ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
```

- 直接改 compose 里的默认值，或在同目录 `.env` / 宿主机环境变量中设置（密码含 `$` 时 compose 里需写成 `$$`）。
- **仅首次初始化生效**：数据库里还没有管理员（或还是默认的 `admin`/`admin123`）时，按环境变量创建/改写管理员；之后改环境变量不会覆盖已有账号，修改用户名/密码请用控制台「设置 → 账号设置」。
- 不设置时保持默认 `admin` / `admin123`，与旧行为一致。
