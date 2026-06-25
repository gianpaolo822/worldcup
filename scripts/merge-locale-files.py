#!/usr/bin/env python3
"""合并 data/locale/*.json + data/player-locale.json 中的既有条目 → data/player-locale.json"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALE_DIR = ROOT / "data" / "locale"
LOCALE_PATH = ROOT / "data" / "player-locale.json"
PLAYERS_PATH = ROOT / "data" / "players.json"


def main() -> None:
    base = {"players": {}}
    if LOCALE_PATH.exists():
        base = json.loads(LOCALE_PATH.read_text(encoding="utf-8"))

    players = json.loads(PLAYERS_PATH.read_text(encoding="utf-8"))
    valid_ids = {p["id"] for p in players}
    merged: dict[str, dict[str, str]] = dict(base.get("players", {}))

    file_count = 0
    added = 0
    for path in sorted(LOCALE_DIR.glob("*.json")):
        if path.name.startswith("_"):
            continue
        chunk = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(chunk, dict):
            raise SystemExit(f"无效 locale 文件（应为 dict）: {path}")
        file_count += 1
        for pid, entry in chunk.items():
            if pid not in valid_ids:
                print(f"[merge-locale] 警告: {path.name} 中未知 id {pid}")
                continue
            merged[pid] = entry
            added += 1

    out = {"$schema": "./player-locale.schema.json", "players": merged}
    LOCALE_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[merge-locale] files={file_count} total={len(merged)} updated_from_dir={added}")


if __name__ == "__main__":
    main()
