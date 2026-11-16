/** 淘汰赛 W/L 占位解析与晋级球队回填（scripts + web 共用） */

export interface BracketTeam {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  group: string;
  flag: string;
  color: string;
}

export interface BracketMatch {
  id: string;
  homeTeam: BracketTeam;
  awayTeam: BracketTeam;
  homeScore: number | null;
  awayScore: number | null;
  homePenScore?: number | null;
  awayPenScore?: number | null;
  wentToExtraTime?: boolean;
  winnerTeamId?: string | null;
  status: 'upcoming' | 'live' | 'finished';
  time: string;
  kickoffAt: string | null;
  stage?: string;
}

export type BracketSlotKind = 'winner' | 'loser';

export interface BracketSlot {
  kind: BracketSlotKind;
  matchNum: number;
}

export interface FeederSpec {
  home: BracketSlot | null;
  away: BracketSlot | null;
}

const PLACEHOLDER_NAME = /^(\d[A-Z]|[WL]\d+|2[A-L]|3[A-Z0-9/]+)$/;

export function parseBracketSlot(teamId: string): BracketSlot | null {
  const w = /^w(\d+)$/i.exec(teamId);
  if (w) return { kind: 'winner', matchNum: Number.parseInt(w[1], 10) };
  const l = /^l(\d+)$/i.exec(teamId);
  if (l) return { kind: 'loser', matchNum: Number.parseInt(l[1], 10) };
  return null;
}

export function matchIdFromNum(matchNum: number): string {
  return `wc2026-m${String(matchNum).padStart(3, '0')}`;
}

export function matchNumFromId(matchId: string): number | null {
  const m = /^wc2026-m(\d+)$/.exec(matchId);
  return m ? Number.parseInt(m[1], 10) : null;
}

export function isBracketPlaceholderTeam(team: BracketTeam): boolean {
  return (
    team.flag === '🏳️' ||
    PLACEHOLDER_NAME.test(team.name) ||
    PLACEHOLDER_NAME.test(team.nameEn) ||
    parseBracketSlot(team.id) != null
  );
}

function hasPenaltyShootout(match: BracketMatch): boolean {
  return match.homePenScore != null && match.awayPenScore != null;
}

/** 淘汰赛完赛后的晋级球队 id */
export function getMatchWinnerTeamId(match: BracketMatch): string | null {
  if (match.status !== 'finished') return null;
  if (match.winnerTeamId) return match.winnerTeamId;

  if (hasPenaltyShootout(match)) {
    if (match.homePenScore! > match.awayPenScore!) return match.homeTeam.id;
    if (match.awayPenScore! > match.homePenScore!) return match.awayTeam.id;
    return null;
  }

  if (match.homeScore != null && match.awayScore != null) {
    if (match.homeScore > match.awayScore) return match.homeTeam.id;
    if (match.awayScore > match.homeScore) return match.awayTeam.id;
  }

  return null;
}

export function getMatchLoserTeamId(match: BracketMatch): string | null {
  const winnerId = getMatchWinnerTeamId(match);
  if (!winnerId) return null;
  if (winnerId === match.homeTeam.id) return match.awayTeam.id;
  if (winnerId === match.awayTeam.id) return match.homeTeam.id;
  return null;
}

function findTeamOnMatch(match: BracketMatch, teamId: string): BracketTeam | undefined {
  if (match.homeTeam.id === teamId) return match.homeTeam;
  if (match.awayTeam.id === teamId) return match.awayTeam;
  return undefined;
}

function resolveBracketTeam(
  team: BracketTeam,
  resolvedById: Map<string, BracketMatch>,
  teamsById: Map<string, BracketTeam>,
): BracketTeam {
  const slot = parseBracketSlot(team.id);
  if (!slot) return team;

  const source = resolvedById.get(matchIdFromNum(slot.matchNum));
  if (!source) return team;

  const pickedId =
    slot.kind === 'winner' ? getMatchWinnerTeamId(source) : getMatchLoserTeamId(source);
  if (!pickedId) return team;

  return teamsById.get(pickedId) ?? findTeamOnMatch(source, pickedId) ?? team;
}

/** 按场次顺序回填 W/L 占位为真实球队 */
export function resolveKnockoutBracket(
  matches: BracketMatch[],
  teamsById: Map<string, BracketTeam>,
): BracketMatch[] {
  const resolvedById = new Map<string, BracketMatch>();

  for (const match of matches) {
    if (!match.stage || match.stage === '小组赛') {
      resolvedById.set(match.id, match);
    }
  }

  const knockoutMatches = matches
    .filter((m) => m.stage && m.stage !== '小组赛')
    .sort((a, b) => (matchNumFromId(a.id) ?? 0) - (matchNumFromId(b.id) ?? 0));

  for (const match of knockoutMatches) {
    const homeTeam = resolveBracketTeam(match.homeTeam, resolvedById, teamsById);
    const awayTeam = resolveBracketTeam(match.awayTeam, resolvedById, teamsById);
    const next = { ...match, homeTeam, awayTeam };
    resolvedById.set(match.id, next);
  }

  return matches.map((m) => resolvedById.get(m.id) ?? m);
}

export function buildFeederSpec(match: BracketMatch): FeederSpec | null {
  const home = parseBracketSlot(match.homeTeam.id);
  const away = parseBracketSlot(match.awayTeam.id);
  if (!home && !away) return null;
  return { home, away };
}

/** 从仍含 W/L 占位的基础赛程构建「下一场 ← 上游场次」映射 */
export function buildFeederMap(templateMatches: BracketMatch[]): Map<string, FeederSpec> {
  const map = new Map<string, FeederSpec>();
  for (const match of templateMatches) {
    if (!match.stage || match.stage === '小组赛') continue;
    const spec = buildFeederSpec(match);
    if (spec) map.set(match.id, spec);
  }
  return map;
}

export function findMatchByNum(matches: BracketMatch[], matchNum: number): BracketMatch | undefined {
  return matches.find((m) => matchNumFromId(m.id) === matchNum);
}

export interface BracketRow {
  feeders: BracketMatch[];
  next: BracketMatch;
}

/** FIFA 官方淘汰赛对阵树：各场次主客队 W/L 占位（与 2026 世界杯 Match 89–104 一致） */
export const KNOCKOUT_BRACKET_SLOTS: Record<string, { home: string; away: string }> = {
  'wc2026-m089': { home: 'w78', away: 'w81' },
  'wc2026-m090': { home: 'w85', away: 'w77' },
  'wc2026-m091': { home: 'w76', away: 'w86' },
  'wc2026-m092': { home: 'w74', away: 'w83' },
  'wc2026-m093': { home: 'w87', away: 'w79' },
  'wc2026-m094': { home: 'w75', away: 'w80' },
  'wc2026-m096': { home: 'w73', away: 'w84' },
  'wc2026-m095': { home: 'w82', away: 'w88' },
  'wc2026-m097': { home: 'w89', away: 'w90' },
  'wc2026-m098': { home: 'w93', away: 'w94' },
  'wc2026-m099': { home: 'w91', away: 'w92' },
  'wc2026-m100': { home: 'w95', away: 'w96' },
  'wc2026-m101': { home: 'w97', away: 'w98' },
  'wc2026-m102': { home: 'w99', away: 'w100' },
  'wc2026-m103': { home: 'l101', away: 'l102' },
  'wc2026-m104': { home: 'w101', away: 'w102' },
};

export function placeholderBracketTeam(id: string): BracketTeam {
  const label = id.toUpperCase();
  return {
    id,
    name: label,
    nameEn: label,
    code: label.length <= 3 ? label : label.slice(0, 3),
    group: '',
    flag: '🏳️',
    color: 'from-neutral-600 to-neutral-800',
  };
}

export function applyKnockoutBracketSlots(matches: BracketMatch[]): BracketMatch[] {
  return matches.map((match) => {
    const slot = KNOCKOUT_BRACKET_SLOTS[match.id];
    if (!slot) return match;
    return {
      ...match,
      homeTeam: placeholderBracketTeam(slot.home),
      awayTeam: placeholderBracketTeam(slot.away),
    };
  });
}

/** 当前轮次每场比赛对应的上游对阵（用于 bracket 连线） */
export function getKnockoutBracketRows(
  currentMatches: BracketMatch[],
  nextMatches: BracketMatch[],
  feederMap: Map<string, FeederSpec>,
): BracketRow[] {
  return nextMatches.map((next) => {
    const spec = feederMap.get(next.id);
    if (!spec) return { feeders: [], next };

    const feeders: BracketMatch[] = [];
    if (spec.home) {
      const m = findMatchByNum(currentMatches, spec.home.matchNum);
      if (m) feeders.push(m);
    }
    if (spec.away) {
      const m = findMatchByNum(currentMatches, spec.away.matchNum);
      if (m) feeders.push(m);
    }
    return { feeders, next };
  });
}
