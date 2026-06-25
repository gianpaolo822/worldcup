import type { Player, TopScorer } from '@/types';
import playerPhotosJson from '@data/player-photos.json';

const POSITION_LABELS: Record<string, string> = {
  G: '门将',
  D: '后卫',
  M: '中场',
  F: '前锋',
};

export function positionLabel(position: string): string {
  return POSITION_LABELS[position] ?? position;
}

export function slugifyName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function historicalPlayerId(scorer: TopScorer): string {
  return `historical-${slugifyName(scorer.nameEn || scorer.name)}`;
}

export function calcAge(birthDate: string | undefined, refYear = 2026): number | null {
  if (!birthDate) return null;
  const year = Number(birthDate.slice(0, 4));
  if (!Number.isFinite(year)) return null;
  return refYear - year;
}

/** 阵容/详情页：中文姓名（无则显示待补充） */
export function playerNameZh(player: Player): string {
  return player.nameZh?.trim() || '待补充';
}

/** 事件时间轴等：号码 + 中文姓名，如「7号拉迪斯拉夫·克雷伊奇」 */
export function playerNameWithNumber(player: Player): string {
  return `${player.number}号${playerNameZh(player)}`;
}

/** 阵容/详情页：英文姓名 */
export function playerNameEn(player: Player): string {
  return player.nameEn;
}

/** 阵容/详情页：中文俱乐部（无则不展示英文） */
export function playerClubZh(player: Player): string | undefined {
  return player.club?.trim() || undefined;
}

const playerPhotoEntries = new Map(
  Object.entries((playerPhotosJson as { photos?: Record<string, { path?: string; url?: string }> }).photos ?? {}),
);

/** 球员头像地址：优先本地 public 路径，否则远程 URL */
export function getPlayerPhotoPath(playerId: string): string | undefined {
  const entry = playerPhotoEntries.get(playerId);
  if (!entry) return undefined;
  return entry.path?.trim() || entry.url?.trim() || undefined;
}

export function groupPlayersByPosition(players: Player[]): Record<string, Player[]> {
  const order = ['G', 'D', 'M', 'F'];
  const groups: Record<string, Player[]> = {};
  for (const player of players) {
    const key = player.position || '其他';
    groups[key] ??= [];
    groups[key].push(player);
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.number - b.number);
  }
  const sorted: Record<string, Player[]> = {};
  for (const key of order) {
    if (groups[key]) sorted[key] = groups[key];
  }
  for (const [key, list] of Object.entries(groups)) {
    if (!sorted[key]) sorted[key] = list;
  }
  return sorted;
}
