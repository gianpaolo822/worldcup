import lineupsJson from '@data/match-lineups.json';
import type { Player, Team } from '@/types';
import { getPlayerById, getTeamById } from '@/lib/data';
import type { LineupSlot } from '@/lib/lineup/slots';

export type { LineupSlot } from '@/lib/lineup/slots';

export {
  ALL_LINEUP_SLOTS,
  normalizeFormation,
  validateFormationSlots,
  isSupportedFormation,
  SUPPORTED_FORMATIONS,
  FORMATION_REQUIRED_SLOTS,
} from '@/lib/lineup/slots';

export interface LineupStarterEntry {
  playerId: string;
  captain?: boolean;
}

export interface TeamLineupRaw {
  teamId: string;
  formation: string;
  starters: Partial<Record<string, LineupStarterEntry>>;
  bench?: { playerId: string; note?: string }[];
}

export type MatchEventPhase = 'regular' | 'extra_time' | 'penalties';

export type MatchEventType =
  | 'goal'
  | 'assist'
  | 'yellow'
  | 'red'
  | 'sub_out'
  | 'sub_in'
  | 'pen_scored'
  | 'pen_missed'
  | 'pen_saved'
  | 'phase';

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  playerId: string;
  relatedPlayerId?: string;
  note?: string;
  phase?: MatchEventPhase;
  penOrder?: number;
}

export interface MatchTeamStats {
  shots?: number;
  shotsOnTarget?: number;
  shotsOffTarget?: number;
  attacks?: number;
  dangerousAttacks?: number;
  possession?: number;
  passAccuracy?: number;
  corners?: number;
  freeKicks?: number;
  offsides?: number;
  fouls?: number;
  yellowCards?: number;
  redCards?: number;
}

export interface MatchStats {
  home: MatchTeamStats;
  away: MatchTeamStats;
}

export interface MatchLineupRaw {
  formation: string;
  home: TeamLineupRaw;
  away: TeamLineupRaw;
  events?: MatchEvent[];
  stats?: MatchStats;
}

export interface ResolvedStarter {
  player: Player;
  captain?: boolean;
}

export interface ResolvedTeamLineup {
  formation: string;
  starters: Partial<Record<LineupSlot, ResolvedStarter>>;
  bench: { player: Player; note?: string }[];
}

export interface ResolvedMatchLineup {
  formation: string;
  home: ResolvedTeamLineup;
  away: ResolvedTeamLineup;
  events: MatchEvent[];
  stats?: MatchStats;
}

const lineupsFile = lineupsJson as {
  lineups: Record<string, MatchLineupRaw>;
};

function resolveTeamLineup(raw: TeamLineupRaw): ResolvedTeamLineup | null {
  const starters: Partial<Record<LineupSlot, ResolvedStarter>> = {};

  for (const [slotKey, entry] of Object.entries(raw.starters)) {
    if (!entry?.playerId) continue;
    const slot = slotKey as LineupSlot;
    const player = getPlayerById(entry.playerId);
    if (!player) {
      console.warn(`[lineup] 未知球员 ${entry.playerId}（${slotKey}）`);
      continue;
    }
    if (player.teamId !== raw.teamId) {
      console.warn(`[lineup] 球员 ${entry.playerId} 不属于 ${raw.teamId}`);
    }
    starters[slot] = { player, captain: entry.captain };
  }

  if (Object.keys(starters).length === 0) return null;

  const bench: { player: Player; note?: string }[] = [];
  for (const b of raw.bench ?? []) {
    const player = getPlayerById(b.playerId);
    if (player) bench.push({ player, note: b.note });
  }

  return {
    formation: raw.formation,
    starters,
    bench,
  };
}

export function getMatchLineup(matchId: string): ResolvedMatchLineup | null {
  const raw = lineupsFile.lineups[matchId];
  if (!raw) return null;

  const home = resolveTeamLineup(raw.home);
  const away = resolveTeamLineup(raw.away);
  if (!home || !away) return null;

  const homeTeam = getTeamById(raw.home.teamId);
  const awayTeam = getTeamById(raw.away.teamId);
  if (!homeTeam || !awayTeam) return null;

  return {
    formation: raw.formation,
    home,
    away,
    events: raw.events ?? [],
    stats: raw.stats,
  };
}

export function getLineupTeams(matchId: string): { home: Team; away: Team } | null {
  const raw = lineupsFile.lineups[matchId];
  if (!raw) return null;
  const home = getTeamById(raw.home.teamId);
  const away = getTeamById(raw.away.teamId);
  if (!home || !away) return null;
  return { home, away };
}
