import type { Player, TopScorer } from '@/types';

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
