/** 积分榜表格列宽（排名 · 球队 · 赛胜平负进失净 · 积分） */
export const STANDINGS_GRID_COLUMNS =
  '24px minmax(4.75rem, 1fr) repeat(8, minmax(1.375rem, auto)) 2rem';

type StandingsStatHeader = { key: string; label: string; accent?: boolean };

export const STANDINGS_STAT_HEADERS: StandingsStatHeader[] = [
  { key: 'played', label: '赛' },
  { key: 'won', label: '胜' },
  { key: 'drawn', label: '平' },
  { key: 'lost', label: '负' },
  { key: 'gf', label: '进球' },
  { key: 'ga', label: '失球' },
  { key: 'gd', label: '净胜' },
  { key: 'points', label: '积分', accent: true },
];
