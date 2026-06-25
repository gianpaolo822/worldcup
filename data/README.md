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
| `generated/players.json` | `npm run data:import` | 球员英文基底（勿手改） |
| `player-locale.json` | **你（渐进）** | 球员中文名、中文俱乐部 |
| `players.json` | 脚本 | 合并 generated + player-locale |
| `matches.json` | 脚本 | 合并 overrides 后的赛程 |
| `standings.json` | 脚本 | 由 matches 自动计算，**勿手改** |
| `match-lineups.json` | **你（赛前）** | 首发阵容与比赛事件，按 `match id` |

## 首发阵容

编辑 `data/match-lineups.json`，键为场次 id（如 `wc2026-m001`）。`starters` 使用 4-2-3-1 槽位：

`GK` `RB` `RCB` `LCB` `LB` `RDM` `LDM` `CAM` `RW` `LW` `ST`

球员 `playerId` 必须与 `players.json` 一致；中文名来自 `player-locale.json`。保存后重新 build / 刷新前端即可。

## 常用命令（在仓库根目录）

```bash
npm run data:import     # 从 data/import/*.xlsx 导入（推荐）
npm run data:refresh    # 有 xlsx 时等同 import+merge+standings；否则走 openfootball
npm run data:sync       # 仅拉取 openfootball / 种子
npm run data:merge      # 仅合并 overrides
npm run data:locale     # 合并球员中文（player-locale.json）
```

## 球员中文名 / 俱乐部

编辑 `data/player-locale.json`，按球员 `id` 补充：

```json
{
  "players": {
    "usa-1": { "nameZh": "马特·特纳", "club": "新英格兰革命（外租）" }
  }
}
```

保存后执行 `npm run data:locale`（`data:import` / `data:build` 会自动跑）。

也可在 Excel「球员名单」增加列 **中文名**、**中文俱乐部**，重新 `npm run data:import` 时会写入 generated 基底；仍以 `player-locale.json` 覆盖为准。

## 参考文档

- `docs/COMPETITION_RULES.md` — 2026 世界杯竞赛规则（含 12 组第三取 8 晋级规则）

## Excel 数据源

将以下文件放入 `data/import/` 后执行 `npm run data:import`：

- `2026FIFA World Cup.xlsx` — 分组、赛程、球场等
- `世界杯奖项体系汇总.xlsx` — 历届冠亚军与奖项（→ `world-cup-history.json`）

赛后改分仍只改 `overrides.json`；场次 `id` 格式为 `wc2026-m001`（对应 Excel 序号）。

## 赛后改分（复制用）

1. 编辑 `overrides.json`
2. `npm run data:refresh`
3. `git add data/ && git commit && git push`
