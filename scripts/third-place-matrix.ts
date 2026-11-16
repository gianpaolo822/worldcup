/**
 * FIFA World Cup 2026 Annex C — 第三名额对阵分配（节选）
 * 列顺序对应 1A / 1B / 1D / 1E / 1G / 1I / 1K / 1L 的 32 强对手组
 */

export const WINNER_THIRD_SLOTS = ['1A', '1B', '1D', '1E', '1G', '1I', '1K', '1L'] as const;

export type WinnerThirdSlot = (typeof WINNER_THIRD_SLOTS)[number];

/** key = 8 个晋级第三名的组字母，按字母序拼接，如 "B,D,E,F,I,J,K,L" */
export const THIRD_PLACE_MATRIX: Record<string, Record<WinnerThirdSlot, string>> = {
  'B,D,E,F,I,J,K,L': {
    '1A': 'E',
    '1B': 'J',
    '1D': 'B',
    '1E': 'D',
    '1G': 'I',
    '1I': 'F',
    '1K': 'L',
    '1L': 'K',
  },
};

/**
 * 当 1C / 1F / 1H / 1J 槽位无可用第三名时，按 Annex C 组合 #67 对阵表
 * 以小组第二身份落位（与 FIFA 官方 32 强对阵一致）
 */
export const RUNNER_UP_FALLBACK_FOR_WINNER_SLOTS: Record<
  string,
  Partial<Record<'1C' | '1F' | '1H' | '1J', string>>
> = {
  'B,D,E,F,I,J,K,L': {
    '1C': 'F',
    '1F': 'C',
    '1H': 'J',
    '1J': 'H',
  },
};

/** 32 强中「第二名 vs 第二名」四场，按 Annex C 组合 #67 */
export const RUNNER_UP_PAIRINGS: Record<string, Array<[string, string]>> = {
  'B,D,E,F,I,J,K,L': [
    ['A', 'B'],
    ['E', 'I'],
    ['K', 'L'],
    ['D', 'G'],
  ],
};

/** 项目赛程 id 与 bracket 槽位对应 */
export const ROUND_OF_32_MATCH_SLOTS: Record<
  string,
  { home: string; away: string; kind: 'winner-third' | 'winner-runner-up' | 'runner-up-pair'; pairIndex?: number }
> = {
  'wc2026-m073': { home: '1B', away: '3', kind: 'winner-third' },
  'wc2026-m074': { home: '1A', away: '3', kind: 'winner-third' },
  'wc2026-m075': { home: '1D', away: '3', kind: 'winner-third' },
  'wc2026-m076': { home: '1C', away: '2', kind: 'winner-runner-up' },
  'wc2026-m077': { home: '1F', away: '2', kind: 'winner-runner-up' },
  'wc2026-m078': { home: '1E', away: '3', kind: 'winner-third' },
  'wc2026-m079': { home: '1H', away: '2', kind: 'winner-runner-up' },
  'wc2026-m080': { home: '1G', away: '3', kind: 'winner-third' },
  'wc2026-m081': { home: '1I', away: '3', kind: 'winner-third' },
  'wc2026-m082': { home: '1J', away: '2', kind: 'winner-runner-up' },
  'wc2026-m083': { home: '1L', away: '3', kind: 'winner-third' },
  'wc2026-m084': { home: '1K', away: '3', kind: 'winner-third' },
  'wc2026-m085': { home: '2', away: '2', kind: 'runner-up-pair', pairIndex: 0 },
  'wc2026-m086': { home: '2', away: '2', kind: 'runner-up-pair', pairIndex: 1 },
  'wc2026-m087': { home: '2', away: '2', kind: 'runner-up-pair', pairIndex: 2 },
  'wc2026-m088': { home: '2', away: '2', kind: 'runner-up-pair', pairIndex: 3 },
};

export function matrixKeyFromGroups(groups: string[]): string {
  return [...groups].sort().join(',');
}
