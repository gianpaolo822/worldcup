# 数据目录

## 文件分工

| 文件 | 谁维护 | 说明 |
|------|--------|------|
| `overrides.json` | **你（日常）** | 比分与状态覆盖，见 `docs/MVP_PLAN.md` 第 5 节 |
| `overrides.schema.json` | 仓库 | JSON Schema，可选校验 |
| `world-cup-history.json` | 你（偶尔） | 历届世界杯 |
| `top-scorers.json` | 你（偶尔） | 历史射手榜 |
| `generated/` | `npm run data:sync` | openfootball 原始输出，可提交 |
| `teams.json` | 脚本 | 球队列表 |
| `matches.json` | 脚本 | 合并 overrides 后的赛程 |
| `standings.json` | 脚本 | 由 matches 自动计算，**勿手改** |

## 常用命令（在仓库根目录）

```bash
npm run data:import     # 从 data/import/*.xlsx 导入（推荐）
npm run data:refresh    # 有 xlsx 时等同 import+merge+standings；否则走 openfootball
npm run data:sync       # 仅拉取 openfootball / 种子
npm run data:merge      # 仅合并 overrides
npm run data:standings  # 仅算积分榜
```

## Excel 数据源

将以下文件放入 `data/import/` 后执行 `npm run data:import`：

- `2026FIFA World Cup.xlsx` — 分组、赛程、球场等
- `世界杯奖项体系汇总.xlsx` — 历届冠亚军与奖项（→ `world-cup-history.json`）

赛后改分仍只改 `overrides.json`；场次 `id` 格式为 `wc2026-m001`（对应 Excel 序号）。

## 赛后改分（复制用）

1. 编辑 `overrides.json`
2. `npm run data:refresh`
3. `git add data/ && git commit && git push`
