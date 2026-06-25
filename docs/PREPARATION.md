# 开发前准备工作（一期 · 静态 Web MVP）

与 [`MVP_PLAN.md`](MVP_PLAN.md) 一致。

## 本机（必做）

- [ ] Node.js LTS（`node -v`）
- [ ] 根目录执行 `npm install`
- [ ] 执行 `npm run data:refresh` 无报错
- [ ] 阅读 [`COMPLIANCE.md`](COMPLIANCE.md)

## 本地预览（避免看到旧界面）

开发时**只认终端里 `Local:` 打印的地址**（本项目固定 **5173**）。

```bash
cd worldcup-web
npm run dev:clean   # 推荐：结束旧 Vite 后再启动
```

若改代码后浏览器无变化：

1. 确认终端 dev 仍在运行，且地址为 `http://127.0.0.1:5173/`
2. **Cmd+Shift+R** 强制刷新
3. 若 `npm run dev` 提示端口占用 → 改用 `npm run dev:clean`

原因：旧 Vite 占 5173 时，新服务可能静默跑到 5174+，而浏览器仍打开 5173，看到的便是**几天前的旧代码**。

## Git（建议）

- [ ] 仓库初始化并关联远程
- [ ] 确认 `data/matches.json` 等生成文件纳入版本控制（便于部署可复现）

## Web 部署（Phase 3）

### Vercel（推荐）

1. 将项目推送到 GitHub（仓库根目录为 `2026worldcup/`）
2. [Vercel](https://vercel.com) → Import Project → 选择仓库
3. 框架选 **Other**（根目录已有 `vercel.json`，一般无需手改）：
   - Install：`npm install && npm install --prefix worldcup-web`
   - Build：`npm run build:web`
   - Output：`worldcup-web/dist`
4. Deploy 后在微信内打开预览链接自测
5. 验证改分：改 `data/overrides.json` → push → 等 redeploy → 刷新页面

本地模拟生产构建：

```bash
npm install
npm install --prefix worldcup-web
npm run build:web
```

### 构建命令说明

| 命令 | 用途 |
|------|------|
| `npm run data:import` | 本机从 Excel 全量导入（需 Python + openpyxl） |
| `npm run data:refresh` | 有 xlsx 时 import，否则 openfootball sync |
| `npm run data:build` | **部署用**：merge overrides + 算积分榜 |
| `npm run build:web` | 部署用完整前端构建 |

部署不跑 Python；依赖仓库内已提交的 `data/generated/` 与 `data/*.json`。

- [ ] 静态托管账号（Vercel）
- [ ] 仓库接入并完成首次 Deploy
- [ ] 微信内打开无报错

## 一期不需要

- Supabase 项目
- 微信公众平台认证 / AppID
- 管理后台

---

## 二期再办（备忘）

- [ ] Supabase 独立项目 + Auth
- [ ] `worldcup-admin` 部署
- [ ] 微信认证与小程序（若验证通过）
