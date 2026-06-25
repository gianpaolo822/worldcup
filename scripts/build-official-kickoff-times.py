#!/usr/bin/env python3
"""从 FIFA 官方赛程（2025-12 更新）生成 data/official-kickoff-times.json。"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "official-kickoff-times.json"
BEIJING = timezone(timedelta(hours=8))
EST = ZoneInfo("America/New_York")
YEAR = 2026

# FIFA 球场城市 → IANA 时区（与 import-from-xlsx.py 一致）
FIFA_CITY_TZ: dict[str, str] = {
    "Mexico City": "America/Mexico_City",
    "Guadalajara": "America/Mexico_City",
    "Monterrey": "America/Monterrey",
    "Toronto": "America/Toronto",
    "Vancouver": "America/Vancouver",
    "Los Angeles": "America/Los_Angeles",
    "San Francisco Bay Area": "America/Los_Angeles",
    "Seattle": "America/Los_Angeles",
    "New York/New Jersey": "America/New_York",
    "Boston": "America/New_York",
    "Philadelphia": "America/New_York",
    "Miami": "America/New_York",
    "Atlanta": "America/New_York",
    "Houston": "America/Chicago",
    "Dallas": "America/Chicago",
    "Kansas City": "America/Chicago",
}

FIFA_CITY_ZH: dict[str, str] = {
    "Mexico City": "墨西哥城",
    "Guadalajara": "萨波潘",
    "Monterrey": "蒙特雷",
    "Toronto": "多伦多",
    "Vancouver": "温哥华",
    "Los Angeles": "洛杉矶",
    "San Francisco Bay Area": "圣克拉拉",
    "Seattle": "西雅图",
    "New York/New Jersey": "纽约/新泽西",
    "Boston": "福克斯堡",
    "Philadelphia": "费城",
    "Miami": "迈阿密",
    "Atlanta": "亚特兰大",
    "Houston": "休斯顿",
    "Dallas": "阿灵顿",
    "Kansas City": "堪萨斯城",
}

# Match | Date | Time (EST) | Time (Local) | ... | City
# 来源：FIFA FWC26 Match Schedule (Dec 2025) / inside.fifa.com 媒体稿
SCHEDULE_ROWS = """
1|11-Jun-26|15:00|13:00|Mexico City
2|11-Jun-26|22:00|20:00|Guadalajara
3|12-Jun-26|15:00|15:00|Toronto
4|12-Jun-26|21:00|18:00|Los Angeles
5|13-Jun-26|21:00|21:00|Boston
6|13-Jun-26|00:00|21:00|Vancouver
7|13-Jun-26|18:00|18:00|New York/New Jersey
8|13-Jun-26|15:00|12:00|San Francisco Bay Area
9|14-Jun-26|19:00|19:00|Philadelphia
10|14-Jun-26|13:00|12:00|Houston
11|14-Jun-26|16:00|15:00|Dallas
12|14-Jun-26|22:00|20:00|Monterrey
13|15-Jun-26|18:00|18:00|Miami
14|15-Jun-26|12:00|12:00|Atlanta
15|15-Jun-26|21:00|18:00|Los Angeles
16|15-Jun-26|15:00|12:00|Seattle
17|16-Jun-26|15:00|15:00|New York/New Jersey
18|16-Jun-26|18:00|18:00|Boston
19|16-Jun-26|21:00|20:00|Kansas City
20|16-Jun-26|00:00|21:00|San Francisco Bay Area
21|17-Jun-26|19:00|19:00|Toronto
22|17-Jun-26|16:00|15:00|Dallas
23|17-Jun-26|13:00|12:00|Houston
24|17-Jun-26|22:00|20:00|Mexico City
25|18-Jun-26|12:00|12:00|Atlanta
26|18-Jun-26|15:00|12:00|Los Angeles
27|18-Jun-26|18:00|15:00|Vancouver
28|18-Jun-26|21:00|19:00|Guadalajara
29|19-Jun-26|21:00|21:00|Philadelphia
30|19-Jun-26|18:00|18:00|Boston
31|19-Jun-26|23:00|20:00|San Francisco Bay Area
32|19-Jun-26|15:00|12:00|Seattle
33|20-Jun-26|16:00|16:00|Toronto
34|20-Jun-26|20:00|19:00|Kansas City
35|20-Jun-26|13:00|12:00|Houston
36|20-Jun-26|00:00|22:00|Monterrey
37|21-Jun-26|18:00|18:00|Miami
38|21-Jun-26|12:00|12:00|Atlanta
39|21-Jun-26|15:00|12:00|Los Angeles
40|21-Jun-26|21:00|18:00|Vancouver
41|22-Jun-26|20:00|20:00|New York/New Jersey
42|22-Jun-26|17:00|17:00|Philadelphia
43|22-Jun-26|13:00|12:00|Dallas
44|22-Jun-26|23:00|20:00|San Francisco Bay Area
45|23-Jun-26|16:00|16:00|Boston
46|23-Jun-26|19:00|19:00|Toronto
47|23-Jun-26|13:00|12:00|Houston
48|23-Jun-26|22:00|20:00|Guadalajara
49|24-Jun-26|18:00|18:00|Miami
50|24-Jun-26|18:00|18:00|Atlanta
51|24-Jun-26|15:00|12:00|Vancouver
52|24-Jun-26|15:00|12:00|Seattle
53|24-Jun-26|21:00|19:00|Mexico City
54|24-Jun-26|21:00|19:00|Monterrey
55|25-Jun-26|16:00|16:00|Philadelphia
56|25-Jun-26|16:00|16:00|New York/New Jersey
57|25-Jun-26|19:00|18:00|Dallas
58|25-Jun-26|19:00|18:00|Kansas City
59|25-Jun-26|22:00|19:00|Los Angeles
60|25-Jun-26|22:00|19:00|San Francisco Bay Area
61|26-Jun-26|15:00|15:00|Boston
62|26-Jun-26|15:00|15:00|Toronto
63|26-Jun-26|23:00|20:00|Seattle
64|26-Jun-26|23:00|20:00|Vancouver
65|26-Jun-26|20:00|19:00|Houston
66|26-Jun-26|20:00|18:00|Guadalajara
67|27-Jun-26|17:00|17:00|New York/New Jersey
68|27-Jun-26|17:00|17:00|Philadelphia
69|27-Jun-26|22:00|21:00|Kansas City
70|27-Jun-26|22:00|21:00|Dallas
71|27-Jun-26|19:30|19:30|Miami
72|27-Jun-26|19:30|19:30|Atlanta
73|28-Jun-26|15:00|12:00|Los Angeles
74|29-Jun-26|16:30|16:30|Boston
75|29-Jun-26|21:00|19:00|Monterrey
76|29-Jun-26|13:00|12:00|Houston
77|30-Jun-26|17:00|17:00|New York/New Jersey
78|30-Jun-26|13:00|12:00|Dallas
79|30-Jun-26|21:00|19:00|Mexico City
80|1-Jul-26|12:00|12:00|Atlanta
81|1-Jul-26|20:00|17:00|San Francisco Bay Area
82|1-Jul-26|16:00|13:00|Seattle
83|2-Jul-26|19:00|19:00|Toronto
84|2-Jul-26|15:00|12:00|Los Angeles
85|2-Jul-26|23:00|20:00|Vancouver
86|3-Jul-26|18:00|18:00|Miami
87|3-Jul-26|21:30|20:30|Kansas City
88|3-Jul-26|14:00|13:00|Dallas
89|4-Jul-26|17:00|17:00|Philadelphia
90|4-Jul-26|13:00|12:00|Houston
91|5-Jul-26|16:00|16:00|New York/New Jersey
92|5-Jul-26|20:00|18:00|Mexico City
93|6-Jul-26|15:00|14:00|Dallas
94|6-Jul-26|20:00|17:00|Seattle
95|7-Jul-26|12:00|12:00|Atlanta
96|7-Jul-26|16:00|13:00|Vancouver
97|9-Jul-26|16:00|16:00|Boston
98|10-Jul-26|15:00|12:00|Los Angeles
99|11-Jul-26|17:00|17:00|Miami
100|11-Jul-26|21:00|20:00|Kansas City
101|14-Jul-26|15:00|14:00|Dallas
102|15-Jul-26|15:00|15:00|Atlanta
103|18-Jul-26|17:00|17:00|Miami
104|19-Jul-26|15:00|15:00|New York/New Jersey
"""


def parse_est_date(text: str) -> tuple[int, int]:
    m = re.match(r"(\d+)-(\w+)-(\d+)", text.strip())
    if not m:
        raise ValueError(f"bad date: {text}")
    months = {
        "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
        "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
    }
    return months[m.group(2)], int(m.group(1))


def parse_time(text: str) -> tuple[int, int]:
    parts = text.strip().split(":")
    return int(parts[0]), int(parts[1])


def est_to_local(est_date: str, est_time: str, fifa_city: str) -> datetime:
    month, day = parse_est_date(est_date)
    hour, minute = parse_time(est_time)
    est_dt = datetime(YEAR, month, day, hour, minute, tzinfo=EST)
    tz = ZoneInfo(FIFA_CITY_TZ[fifa_city])
    return est_dt.astimezone(tz)


def build_match(seq: int, est_date: str, est_time: str, local_time: str, fifa_city: str) -> dict:
    local_dt = est_to_local(est_date, est_time, fifa_city)
    expected_h, expected_m = parse_time(local_time)
    if (local_dt.hour, local_dt.minute) != (expected_h, expected_m):
        raise ValueError(
            f"match {seq}: local mismatch {local_dt:%H:%M} vs official {local_time} ({fifa_city})"
        )
    utc_dt = local_dt.astimezone(timezone.utc)
    beijing_dt = local_dt.astimezone(BEIJING)
    return {
        "seq": seq,
        "fifaCity": fifa_city,
        "cityZh": FIFA_CITY_ZH[fifa_city],
        "localDate": f"{local_dt.month}月{local_dt.day}日",
        "localTime": f"{local_dt.hour:02d}:{local_dt.minute:02d}",
        "beijingTime": beijing_dt.strftime("%Y-%m-%d %H:%M"),
        "kickoffAt": utc_dt.isoformat().replace("+00:00", "Z"),
    }


def main() -> None:
    matches: list[dict] = []
    for line in SCHEDULE_ROWS.strip().splitlines():
        if not line.strip():
            continue
        seq_s, est_date, est_time, local_time, fifa_city = line.split("|")
        matches.append(build_match(int(seq_s), est_date, est_time, local_time, fifa_city))

    payload = {
        "source": "FIFA FWC26 Match Schedule (December 2025 update)",
        "sourceUrl": "https://inside.fifa.com/organisation/media-releases/updated-world-cup-2026-match-schedule-venues-kick-off-times-104-matches",
        "pdfUrl": "https://digitalhub.fifa.com/m/1be9ce37eb98fcc5/original/FWC26-Match-Schedule/_English.pdf",
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "matchCount": len(matches),
        "matches": matches,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[official-kickoffs] wrote {len(matches)} matches → {OUT}")


if __name__ == "__main__":
    main()
