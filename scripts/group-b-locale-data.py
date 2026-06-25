#!/usr/bin/env python3
"""B 组球员中文名/俱乐部，合并进 data/player-locale.json"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALE = ROOT / "data" / "player-locale.json"

GROUP_B: dict[str, dict[str, str]] = {
    # —— 加拿大 ——
    "canada-1": {"nameZh": "戴恩·圣克莱尔", "club": "迈阿密国际"},
    "canada-2": {"nameZh": "阿利斯泰尔·约翰斯顿", "club": "凯尔特人"},
    "canada-3": {"nameZh": "吕克·德·富热罗勒", "club": "登德尔（外租）"},
    "canada-4": {"nameZh": "阿尔菲·琼斯", "club": "米德尔斯堡"},
    "canada-5": {"nameZh": "乔尔·沃特曼", "club": "芝加哥火焰"},
    "canada-6": {"nameZh": "马修·舒瓦尼耶", "club": "洛杉矶FC"},
    "canada-7": {"nameZh": "斯蒂芬·欧斯塔基奥", "club": "洛杉矶FC（外租）"},
    "canada-8": {"nameZh": "伊斯梅拉·科内", "club": "萨索洛（外租）"},
    "canada-9": {"nameZh": "赛尔·拉林", "club": "南安普顿（外租）"},
    "canada-10": {"nameZh": "乔纳森·戴维", "club": "尤文图斯"},
    "canada-11": {"nameZh": "利亚姆·米勒", "club": "赫尔城"},
    "canada-12": {"nameZh": "塔尼·奥卢瓦塞伊", "club": "比利亚雷亚尔"},
    "canada-13": {"nameZh": "德里克·科内利乌斯", "club": "格拉斯哥流浪者（外租）"},
    "canada-14": {"nameZh": "雅各布·沙菲尔堡", "club": "洛杉矶FC"},
    "canada-15": {"nameZh": "莫伊斯·邦比托", "club": "尼斯"},
    "canada-16": {"nameZh": "马克西姆·克里波", "club": "奥兰多城"},
    "canada-17": {"nameZh": "塔琼·布坎南", "club": "比利亚雷亚尔"},
    "canada-18": {"nameZh": "欧文·古德曼", "club": "巴恩斯利（外租）"},
    "canada-19": {"nameZh": "阿方索·戴维斯", "club": "拜仁慕尼黑"},
    "canada-20": {"nameZh": "阿里·艾哈迈德", "club": "诺维奇"},
    "canada-21": {"nameZh": "乔纳森·奥索里奥", "club": "多伦多FC"},
    "canada-22": {"nameZh": "里奇·拉雷亚", "club": "多伦多FC"},
    "canada-23": {"nameZh": "尼科·西古尔", "club": "斯普利特海杜克"},
    "canada-24": {"nameZh": "普罗米斯·戴维", "club": "圣吉罗斯联合"},
    "canada-25": {"nameZh": "内森-迪伦·萨利巴", "club": "安德莱赫特"},
    "canada-26": {"nameZh": "马塞洛·弗洛雷斯", "club": "墨西哥老虎"},
    # —— 波黑 ——
    "bosnia-and-herzegovina-1": {"nameZh": "尼古拉·瓦西利", "club": "圣保利"},
    "bosnia-and-herzegovina-2": {"nameZh": "尼哈德·穆亚基奇", "club": "加济安泰普（外租）"},
    "bosnia-and-herzegovina-3": {"nameZh": "丹尼斯·哈日卡杜尼奇", "club": "桑普多利亚（外租）"},
    "bosnia-and-herzegovina-4": {"nameZh": "塔里克·穆哈雷莫维奇", "club": "萨索洛"},
    "bosnia-and-herzegovina-5": {"nameZh": "塞阿德·科拉希纳茨", "club": "亚特兰大"},
    "bosnia-and-herzegovina-6": {"nameZh": "本杰明·塔希罗维奇", "club": "布隆德比"},
    "bosnia-and-herzegovina-7": {"nameZh": "阿马尔·德迪奇", "club": "本菲卡"},
    "bosnia-and-herzegovina-8": {"nameZh": "阿尔明·吉戈维奇", "club": "伯尔尼年轻人"},
    "bosnia-and-herzegovina-9": {"nameZh": "萨梅德·巴日达尔", "club": "比亚韦斯托克雅盖隆（外租）"},
    "bosnia-and-herzegovina-10": {"nameZh": "埃尔梅丁·德米罗维奇", "club": "斯图加特"},
    "bosnia-and-herzegovina-11": {"nameZh": "埃丁·哲科", "club": "沙尔克04"},
    "bosnia-and-herzegovina-12": {"nameZh": "姆拉登·尤尔卡斯", "club": "巴尼亚卢卡博尔茨"},
    "bosnia-and-herzegovina-13": {"nameZh": "伊万·巴西奇", "club": "阿斯塔纳"},
    "bosnia-and-herzegovina-14": {"nameZh": "伊万·苏尼奇", "club": "帕福斯"},
    "bosnia-and-herzegovina-15": {"nameZh": "阿马尔·梅米奇", "club": "比尔森胜利"},
    "bosnia-and-herzegovina-16": {"nameZh": "阿米尔·哈吉艾哈梅托维奇", "club": "赫尔城（外租）"},
    "bosnia-and-herzegovina-17": {"nameZh": "杰尼斯·布尔尼奇", "club": "卡尔斯鲁厄"},
    "bosnia-and-herzegovina-18": {"nameZh": "尼古拉·卡蒂奇", "club": "沙尔克04"},
    "bosnia-and-herzegovina-19": {"nameZh": "凯里姆·阿拉伊贝戈维奇", "club": "萨尔茨堡红牛"},
    "bosnia-and-herzegovina-20": {"nameZh": "埃斯米尔·巴伊拉克塔雷维奇", "club": "埃因霍温"},
    "bosnia-and-herzegovina-21": {"nameZh": "斯特耶潘·拉德尔日奇", "club": "里耶卡"},
    "bosnia-and-herzegovina-22": {"nameZh": "马丁·兹洛米斯利奇", "club": "里耶卡"},
    "bosnia-and-herzegovina-23": {"nameZh": "哈里斯·塔巴科维奇", "club": "门兴格拉德巴赫（外租）"},
    "bosnia-and-herzegovina-24": {"nameZh": "尼达尔·切利克", "club": "朗斯"},
    "bosnia-and-herzegovina-25": {"nameZh": "约沃·卢基奇", "club": "克卢日大学"},
    "bosnia-and-herzegovina-26": {"nameZh": "埃尔明·马赫米奇", "club": "利贝雷茨斯洛瓦恩"},
    # —— 卡塔尔 ——
    "qatar-1": {"nameZh": "马哈茂德·阿布纳达", "club": "赖扬"},
    "qatar-2": {"nameZh": "罗-罗", "club": "萨德"},
    "qatar-3": {"nameZh": "卢卡斯·门德斯", "club": "沃克拉"},
    "qatar-4": {"nameZh": "伊萨·拉耶", "club": "阿拉伯"},
    "qatar-5": {"nameZh": "贾西姆·贾贝尔", "club": "赖扬"},
    "qatar-6": {"nameZh": "阿卜杜勒阿齐兹·哈特姆", "club": "赖扬"},
    "qatar-7": {"nameZh": "艾哈迈德·阿拉埃丁", "club": "赖扬"},
    "qatar-8": {"nameZh": "埃德米尔森·儒尼奥尔", "club": "杜海勒"},
    "qatar-9": {"nameZh": "穆罕默德·蒙塔里", "club": "加拉法"},
    "qatar-10": {"nameZh": "哈桑·海多斯", "club": "萨德"},
    "qatar-11": {"nameZh": "阿克拉姆·阿菲夫", "club": "萨德"},
    "qatar-12": {"nameZh": "卡里姆·布迪亚夫", "club": "杜海勒"},
    "qatar-13": {"nameZh": "阿尤布·阿尔-奥伊", "club": "加拉法"},
    "qatar-14": {"nameZh": "霍马姆·艾哈迈德", "club": "文化莱昂内萨（外租）"},
    "qatar-15": {"nameZh": "优素福·阿卜杜里萨格", "club": "沃克拉（外租）"},
    "qatar-16": {"nameZh": "布阿莱姆·库希", "club": "萨德"},
    "qatar-17": {"nameZh": "艾哈迈德·阿尔-加内希", "club": "加拉法"},
    "qatar-18": {"nameZh": "苏丹·阿尔-布拉克", "club": "杜海勒"},
    "qatar-19": {"nameZh": "阿尔莫埃兹·阿里", "club": "杜海勒"},
    "qatar-20": {"nameZh": "艾哈迈德·法提希", "club": "阿拉伯"},
    "qatar-21": {"nameZh": "萨拉赫·扎卡里亚", "club": "杜海勒"},
    "qatar-22": {"nameZh": "米沙尔·巴尔沙姆", "club": "萨德"},
    "qatar-23": {"nameZh": "阿西姆·马迪博", "club": "沃克拉（外租）"},
    "qatar-24": {"nameZh": "塔辛·贾姆希德", "club": "杜海勒"},
    "qatar-25": {"nameZh": "阿尔-哈希米·阿尔-侯赛因", "club": "阿拉伯"},
    "qatar-26": {"nameZh": "穆罕默德·阿尔-曼纳伊", "club": "沙马尔"},
    # —— 瑞士 ——
    "switzerland-1": {"nameZh": "格雷戈尔·科贝尔", "club": "多特蒙德"},
    "switzerland-2": {"nameZh": "米罗·穆海姆", "club": "汉堡"},
    "switzerland-3": {"nameZh": "西尔万·维德默", "club": "美因茨"},
    "switzerland-4": {"nameZh": "尼科·埃尔维迪", "club": "门兴格拉德巴赫"},
    "switzerland-5": {"nameZh": "曼努埃尔·阿坎吉", "club": "国际米兰（外租）"},
    "switzerland-6": {"nameZh": "丹尼斯·扎卡里亚", "club": "摩纳哥"},
    "switzerland-7": {"nameZh": "布雷尔·恩博洛", "club": "雷恩"},
    "switzerland-8": {"nameZh": "雷莫·弗罗伊勒", "club": "博洛尼亚"},
    "switzerland-9": {"nameZh": "约翰·曼赞比", "club": "弗赖堡"},
    "switzerland-10": {"nameZh": "格拉尼特·扎卡", "club": "桑德兰"},
    "switzerland-11": {"nameZh": "丹·恩多耶", "club": "诺丁汉森林"},
    "switzerland-12": {"nameZh": "伊冯·姆沃戈", "club": "洛里昂"},
    "switzerland-13": {"nameZh": "里卡多·罗德里格斯", "club": "皇家贝蒂斯"},
    "switzerland-14": {"nameZh": "阿顿·贾沙里", "club": "AC米兰"},
    "switzerland-15": {"nameZh": "吉布里尔·索乌", "club": "塞维利亚"},
    "switzerland-16": {"nameZh": "克里斯蒂安·法斯纳赫特", "club": "伯尔尼年轻人"},
    "switzerland-17": {"nameZh": "鲁本·巴尔加斯", "club": "塞维利亚"},
    "switzerland-18": {"nameZh": "埃拉伊·乔默特", "club": "瓦伦西亚"},
    "switzerland-19": {"nameZh": "诺阿·奥卡福", "club": "利兹联"},
    "switzerland-20": {"nameZh": "米歇尔·埃比舍尔", "club": "比萨（外租）"},
    "switzerland-21": {"nameZh": "马文·凯勒", "club": "伯尔尼年轻人"},
    "switzerland-22": {"nameZh": "法比安·里德", "club": "奥格斯堡"},
    "switzerland-23": {"nameZh": "泽基·阿姆杜尼", "club": "伯恩利"},
    "switzerland-24": {"nameZh": "奥雷勒·阿门达", "club": "法兰克福"},
    "switzerland-25": {"nameZh": "卢卡·雅克", "club": "斯图加特"},
    "switzerland-26": {"nameZh": "塞德里克·伊滕", "club": "杜塞尔多夫"},
}


def main() -> None:
    data = json.loads(LOCALE.read_text(encoding="utf-8"))
    players = data.setdefault("players", {})
    players.update(GROUP_B)
    LOCALE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[group-b-locale] merged {len(GROUP_B)} entries → {LOCALE}")


if __name__ == "__main__":
    main()
