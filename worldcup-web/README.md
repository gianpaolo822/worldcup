# worldcup-web

用户端：**移动端 Web**，赛程 / 积分榜 / 历史数据。数据来自仓库根目录 `data/*.json`。

## 本地开发

```bash
# 1. 根目录刷新数据
cd .. && npm run data:refresh

# 2. 安装并启动
cd worldcup-web
npm install
npm run dev
```

**先保持终端运行**（不要关），浏览器打开 http://localhost:5173

若出现 `ERR_CONNECTION_REFUSED`，说明 dev 服务未启动或已退出，请重新执行 `npm run dev`。

## 构建

```bash
npm run build   # prebuild 会自动执行根目录 data:refresh
npm run preview
```

## 数据更新

赛后改 `../data/overrides.json` → 根目录 `npm run data:refresh` → 重启 dev 或重新 build。

详见 [`../docs/MVP_PLAN.md`](../docs/MVP_PLAN.md) 第 5 节。
