# 2026 美加墨世界杯观赛项目

个人学习用途：**移动端 Web（数据查询）** + **静态 JSON 数据流水线**（一期）；Supabase / 管理后台 / 小程序延后二期。

> 完整计划：[`docs/MVP_PLAN.md`](docs/MVP_PLAN.md)

## 目录结构

```
2026worldcup/
├── package.json            # 数据脚本：data:sync / data:refresh
├── data/                   # JSON 数据（见 data/README.md）
├── scripts/                # openfootball 同步、合并、算积分榜
├── worldcup-web/           # 用户端 Web（Phase 2）
├── worldcup-admin/         # 【二期】管理后台
├── supabase/               # 【二期】数据库
├── worldcup-mini/          # 【二期】微信小程序
└── docs/
```

## 数据维护（日常）

```bash
# 安装（根目录，一次）
npm install

# 赛后改分：编辑 data/overrides.json 后执行
npm run data:refresh

# 提交并推送 → Vercel 自动部署
git add data/ && git commit -m "比分: ..." && git push
```

详见 [`docs/MVP_PLAN.md` 第 5 节](docs/MVP_PLAN.md#5-数据维护手册)。

## 开发顺序（一期 MVP）

1. [`docs/PREPARATION.md`](docs/PREPARATION.md) — 本机 + 可选 Vercel
2. **Phase 1** — `npm run data:refresh` 跑通（当前）
3. **Phase 2** — `worldcup-web`（已迁移，读 `data/*.json`）
4. **Phase 3** — 部署 + 分享验证（下一步）

## 合规

非官方数据工具。详见 [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md)。
