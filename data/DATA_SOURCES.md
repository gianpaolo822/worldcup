# 数据来源

| 数据 | 来源 | 许可 | 更新方式 |
|------|------|------|----------|
| 2026 赛程 / 球队 | `data/import/2026FIFA World Cup.xlsx`（用户整理） | 自行维护 | `npm run data:import` 或 `data:refresh` |
| 2026 赛程 / 球队（备选） | [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) | 开放数据 | 删除 import xlsx 后 `npm run data:sync` |
| 比分 / 状态覆盖 | `data/overrides.json` | 自行维护 | 手改 + `npm run data:refresh` |
| 积分榜 | 由 `matches.json` 计算 | — | `npm run data:standings`（勿手改） |
| 历届世界杯 | `data/world-cup-history.json` | 手工整理公开事实 | 手改 + git push |
| 历史射手榜 | `data/top-scorers.json` | 手工整理公开事实 | 手改 + git push |

更新本表时请注明拉取日期与 commit/版本。

## 一期 vs 二期

- **一期（当前）**：上述 JSON + Git 部署，无 Supabase
- **二期**：`scripts/import-json-to-supabase.ts`（待建）灌库 + 管理后台
