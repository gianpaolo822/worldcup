import lineupsJson from '@data/match-lineups.json';
import { matches, getPlayerById, getTeamById } from '@/lib/data';
import { playerNameZh } from '@/lib/playerUtils';
import type { MatchEvent } from '@/lib/lineup';

export type StatCategory = 'goals' | 'assists' | 'yellow' | 'red';

export interface TournamentStatRow {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  teamFlag: string;
  value: number;
  /** 点球进球数，仅进球榜有意义 */
  penaltyGoals?: number;
}

const CATEGORY_LABELS: Record<StatCategory, string> = {
  goals: '进球',
  assists: '助攻',
  yellow: '黄牌',
  red: '红牌',
};

export const STAT_CATEGORIES: StatCategory[] = ['goals', 'assists', 'yellow', 'red'];

export function statCategoryLabel(category: StatCategory): string {
  return CATEGORY_LABELS[category];
}

function isOwnGoal(ev: MatchEvent): boolean {
  return ev.type === 'goal' && !!ev.note?.includes('乌龙');
}

function isPenaltyGoal(ev: MatchEvent): boolean {
  return ev.type === 'goal' && !!ev.note?.includes('点球');
}

/** 进球榜展示：含点球时显示为「总进球（点球）」 */
export function formatStatValue(row: TournamentStatRow, category: StatCategory): string {
  if (category === 'goals' && row.penaltyGoals && row.penaltyGoals > 0) {
    return `${row.value}（${row.penaltyGoals}）`;
  }
  return String(row.value);
}

function emptyCounts(): Record<StatCategory, number> {
  return { goals: 0, assists: 0, yellow: 0, red: 0 };
}

function buildStatRows(
  counts: Map<string, Record<StatCategory, number>>,
  penaltyGoals: Map<string, number>,
): Record<StatCategory, TournamentStatRow[]> {
  const result: Record<StatCategory, TournamentStatRow[]> = {
    goals: [],
    assists: [],
    yellow: [],
    red: [],
  };

  for (const [playerId, stats] of counts) {
    const player = getPlayerById(playerId);
    const team = player ? getTeamById(player.teamId) : undefined;
    if (!player || !team) continue;

    const base = {
      playerId,
      playerName: playerNameZh(player),
      teamId: team.id,
      teamName: team.name,
      teamFlag: team.flag,
    };

    for (const category of STAT_CATEGORIES) {
      const value = stats[category];
      if (value <= 0) continue;
      const row: TournamentStatRow = { ...base, value };
      if (category === 'goals') {
        const penalties = penaltyGoals.get(playerId);
        if (penalties && penalties > 0) row.penaltyGoals = penalties;
      }
      result[category].push(row);
    }
  }

  for (const category of STAT_CATEGORIES) {
    result[category].sort((a, b) => b.value - a.value || a.playerName.localeCompare(b.playerName, 'zh-CN'));
  }

  return result;
}

function computeStatsCounts(teamId?: string): {
  counts: Map<string, Record<StatCategory, number>>;
  penaltyGoals: Map<string, number>;
} {
  const finishedIds = new Set(matches.filter((m) => m.status === 'finished').map((m) => m.id));
  const lineups = (lineupsJson as { lineups: Record<string, { events?: MatchEvent[] }> }).lineups;
  const counts = new Map<string, Record<StatCategory, number>>();
  const penaltyGoals = new Map<string, number>();

  const bump = (playerId: string, category: StatCategory, delta = 1) => {
    const player = getPlayerById(playerId);
    if (!player || (teamId && player.teamId !== teamId)) return;
    const row = counts.get(playerId) ?? emptyCounts();
    row[category] += delta;
    counts.set(playerId, row);
  };

  for (const [matchId, raw] of Object.entries(lineups)) {
    if (!finishedIds.has(matchId)) continue;

    for (const ev of raw.events ?? []) {
      if (ev.type === 'goal') {
        if (!isOwnGoal(ev)) {
          bump(ev.playerId, 'goals');
          if (isPenaltyGoal(ev)) {
            const player = getPlayerById(ev.playerId);
            if (player && (!teamId || player.teamId === teamId)) {
              penaltyGoals.set(ev.playerId, (penaltyGoals.get(ev.playerId) ?? 0) + 1);
            }
          }
          if (ev.relatedPlayerId) bump(ev.relatedPlayerId, 'assists');
        }
      } else if (ev.type === 'assist') {
        bump(ev.playerId, 'assists');
      } else if (ev.type === 'yellow') {
        bump(ev.playerId, 'yellow');
      } else if (ev.type === 'red') {
        bump(ev.playerId, 'red');
      }
    }
  }

  return { counts, penaltyGoals };
}

export function computeTournamentStats(): Record<StatCategory, TournamentStatRow[]> {
  const { counts, penaltyGoals } = computeStatsCounts();
  return buildStatRows(counts, penaltyGoals);
}

export function computeTeamTournamentStats(teamId: string): Record<StatCategory, TournamentStatRow[]> {
  const { counts, penaltyGoals } = computeStatsCounts(teamId);
  return buildStatRows(counts, penaltyGoals);
}

function countFinishedMatchesWithEvents(matchIds?: Set<string>): number {
  const finishedIds = new Set(matches.filter((m) => m.status === 'finished').map((m) => m.id));
  const lineups = (lineupsJson as { lineups: Record<string, { events?: MatchEvent[] }> }).lineups;
  return [...finishedIds].filter((id) => {
    if (matchIds && !matchIds.has(id)) return false;
    return (lineups[id]?.events?.length ?? 0) > 0;
  }).length;
}

/** 已结束且有事件数据的比赛场次 */
export function finishedMatchesWithEvents(): number {
  return countFinishedMatchesWithEvents();
}

/** 某队已结束且有事件数据的比赛场次 */
export function finishedTeamMatchesWithEvents(teamId: string): number {
  const teamMatchIds = new Set(
    matches.filter((m) => m.status === 'finished' && (m.homeTeam.id === teamId || m.awayTeam.id === teamId)).map((m) => m.id),
  );
  return countFinishedMatchesWithEvents(teamMatchIds);
}

export function statValueColor(category: StatCategory): string {
  if (category === 'yellow') return '#eab308';
  if (category === 'red') return 'var(--danger)';
  return 'var(--accent)';
}
