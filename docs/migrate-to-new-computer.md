# 新电脑迁移步骤

旧电脑已把分支推到 GitHub。在新电脑按下面顺序做即可。

- 仓库：https://github.com/gianpaolo822/worldcup
- 分支：`cursor/wc2026-m103-bronze-france-england`
- 预览地址：http://127.0.0.1:5173/

不需要建 Pull Request。日常改分仍走 `data/overrides.json`，不要手改 `matches.json` 或 `standings.json`。

## 1. 安装一次

- [Node.js LTS](https://nodejs.org/)（装好后终端执行 `node -v`）
- Git

Python 3 只有在还要从 Excel 全量导入（`npm run data:import`）时才需要。日常改分和预览不必安装。

## 2. 拉代码并切到迁移分支

```bash
git clone https://github.com/gianpaolo822/worldcup.git
cd worldcup
git checkout cursor/wc2026-m103-bronze-france-england
```

`git clone` 或 `git pull` 若询问密码：用户名填 GitHub 用户名，密码粘贴 Personal Access Token（勾选 `repo`），不是网页登录密码。

确认分支：

```bash
git status -sb
git log -1 --oneline
```

应停在 `cursor/wc2026-m103-bronze-france-england`，最新提交含「迁移准备」。

## 3. 安装依赖

在仓库根目录执行（根目录和前端各装一次）：

```bash
npm install
npm install --prefix worldcup-web
```

## 4. 校验数据

仍在仓库根目录：

```bash
npm run data:merge
npm run data:lineup:validate
```

期望输出：

- `overrides applied=104`
- `104 matches OK`

## 5. 启动预览

```bash
cd worldcup-web
npm run dev:clean
```

终端出现 `Local: http://127.0.0.1:5173/` 后，在浏览器打开：

- 首页：http://127.0.0.1:5173/
- 决赛：http://127.0.0.1:5173/match/wc2026-m104

决赛应为西班牙 1-0 阿根廷（加时）。

请用 `dev:clean`，不要只跑 `npm run dev`。5173 上若留着旧进程，浏览器会一直看到旧页面。

## 6. 验收

| 步骤 | 期望 |
|------|------|
| `git checkout` | 当前分支为 `cursor/wc2026-m103-bronze-france-england` |
| `data:merge` | `overrides applied=104` |
| `data:lineup:validate` | `104 matches OK` |
| `dev:clean` | 终端打印 `Local: http://127.0.0.1:5173/` |
| 决赛页 | 西班牙 1-0 阿根廷，加时 |

可选：在仓库根目录跑生产构建 `npm run build:web`。构建失败时先以第 4、5 步为准。

## 之后在新电脑上改数据

```bash
# 改 data/overrides.json 后
npm run data:merge

# 改 data/match-lineups.json 后
npm run data:lineup:validate

# 预览
cd worldcup-web && npm run dev:clean
```
