# worldcup-web

用户端：**移动端 Web**，赛程 / 积分榜 / 历史数据。数据来自仓库根目录 `data/*.json`。

## 本地开发

```bash
# 1. 根目录刷新数据
cd .. && npm run data:refresh

# 2. 安装并启动
cd worldcup-web
npm install
npm run dev:clean   # 推荐：先清掉旧 Vite，再启动
```

**先保持终端运行**（不要关），浏览器打开终端里显示的地址（固定 **http://127.0.0.1:5173/**）。

### 预览不到最新修改？

常见原因：**5173 上仍有旧的 Vite 进程**，浏览器一直打开旧地址，而新代码跑在 5174/5175 等端口。

| 做法 | 命令 |
|------|------|
| **推荐** | `npm run dev:clean` |
| 手动清理 | `lsof -ti :5173 \| xargs kill -9` 然后 `npm run dev` |
| 强制刷新 | 浏览器 **Cmd+Shift+R** |

验证是否在跑新代码：终端应显示 `Local: http://127.0.0.1:5173/`；若 `npm run dev` 报 `Port 5173 is already in use`，说明旧进程未关，请用 `dev:clean`。

若出现 `ERR_CONNECTION_REFUSED`，说明 dev 服务未启动或已退出，请重新执行 `npm run dev:clean`。

## 构建

```bash
npm run build   # prebuild 会自动执行根目录 data:build
npm run preview
```

## 数据更新

赛后改 `../data/overrides.json` → 根目录 `npm run data:refresh` → 重启 dev 或重新 build。

详见 [`../docs/MVP_PLAN.md`](../docs/MVP_PLAN.md) 第 5 节。
