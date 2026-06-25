import matchesJson from '@data/matches.json';
import standingsJson from '@data/standings.json';
import teamsJson from '@data/teams.json';
import playersJson from '@data/players.json';
import coachesJson from '@data/coaches.json';
import venuesJson from '@data/venues.json';
import worldCupHistoryJson from '@data/world-cup-history.json';
import topScorersJson from '@data/top-scorers.json';
import type { Coach, Match, Player, StandingsByGroup, Team, TopScorer, Venue, WorldCupEdition } from '@/types';
import { historicalPlayerId } from '@/lib/playerUtils';
import { getMatchKickoffMs, resolveMatchDisplay } from '@/lib/matchDisplay';

export const matches = matchesJson as Match[];
export const standings = standingsJson as StandingsByGroup;
export const teams = teamsJson as Team[];
export const players = playersJson as Player[];
export const coaches = coachesJson as Coach[];
export const venues = venuesJson as Venue[];
export const worldCupHistory = worldCupHistoryJson as WorldCupEdition[];
export const topScorers = topScorersJson as TopScorer[];

export const groups = [...new Set(teams.map((t) => t.group))].sort();

export const matchdays = [...new Set(matches.map((m) => m.matchday))].sort((a, b) => a - b);

const teamById = new Map(teams.map((t) => [t.id, t]));
const playerById = new Map(players.map((p) => [p.id, p]));
const coachByTeamId = new Map(coaches.map((c) => [c.teamId, c]));
const venueByName = new Map(venues.map((v) => [v.name, v]));

/** 赛程与球场表中文名不一致时的别名 */
const VENUE_NAME_ALIASES: Record<string, string> = {
  阿克隆体育场: '阿克伦体育场',
};

function resolveVenueName(name: string): string {
  return VENUE_NAME_ALIASES[name] ?? name;
}
const historicalById = new Map(topScorers.map((s) => [historicalPlayerId(s), s]));

const BEIJING_TZ = 'Asia/Shanghai';

/** 北京时间开球时间展示（优先 kickoffAt，与导入脚本一致） */
export function formatMatchKickoffBeijing(match: Match): string {
  if (match.kickoffAt) {
    const parts = new Intl.DateTimeFormat('zh-CN', {
      timeZone: BEIJING_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date(match.kickoffAt));
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
  }
  return match.time;
}

/** 赛程日期键 YYYY-MM-DD（北京时间，与开球展示一致） */
export function getMatchDateKey(match: Match): string {
  if (match.kickoffAt) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: BEIJING_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(match.kickoffAt));
  }
  const fromTime = match.time?.split(' ')[0];
  if (fromTime && /^\d{4}-\d{2}-\d{2}$/.test(fromTime)) return fromTime;
  return 'unknown';
}

export function formatScheduleDate(dateKey: string): string {
  if (dateKey === 'unknown') return '日期待定';
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${month}月${day}日 周${weekdays[date.getDay()]}`;
}

export function sortMatchesByKickoff(list: Match[]): Match[] {
  return [...list].sort((a, b) => {
    const ta = a.kickoffAt ?? a.time;
    const tb = b.kickoffAt ?? b.time;
    return ta.localeCompare(tb);
  });
}

/** 赛程 Tab：所有比赛日（升序） */
export const scheduleDates = [...new Set(matches.map(getMatchDateKey))]
  .filter((d) => d !== 'unknown')
  .sort();

/** 赛程 Tab：参赛队（按中文名排序，用于国家筛选） */
export const scheduleTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

export function getMatchById(id: string): Match | undefined {
  return matches.find((m) => m.id === id);
}

export function getTeamById(id: string): Team | undefined {
  return teamById.get(id);
}

export function getPlayerById(id: string): Player | undefined {
  return playerById.get(id);
}

export function getHistoricalScorerById(id: string): TopScorer | undefined {
  return historicalById.get(id);
}

export function getCoachByTeamId(teamId: string): Coach | undefined {
  return coachByTeamId.get(teamId);
}

export function getVenueByName(name: string): Venue | undefined {
  const resolved = resolveVenueName(name);
  return venueByName.get(resolved) ?? venueByName.get(name);
}

/** 赛程卡片：城市 · 体育场 */
export function formatMatchVenue(match: Match): string {
  const city = match.venueCity ?? getVenueByName(match.venue)?.city;
  if (city && match.venue) return `${city} · ${match.venue}`;
  if (match.venue) return match.venue;
  return match.venueShort || '—';
}

export function getMatchesByTeam(teamId: string): Match[] {
  return sortMatchesByKickoff(
    matches.filter((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId),
  );
}

export function getPlayersByTeam(teamId: string): Player[] {
  return players.filter((p) => p.teamId === teamId).sort((a, b) => a.number - b.number);
}

export function getGroupMatches(group: string, excludeMatchId?: string): Match[] {
  return sortMatchesByKickoff(
    matches.filter((m) => m.group === group && m.id !== excludeMatchId),
  );
}

export function getMatchesByMatchday(matchday: number): Match[] {
  return matches.filter((m) => m.matchday === matchday);
}

export function getMatchesByGroup(group: string): Match[] {
  return matches.filter((m) => m.group === group);
}

export function getStandingsByGroup(group: string) {
  return standings[group] ?? [];
}

/** 同开球时间时 id 较小者优先（如 wc2026-m001 早于 m002） */
function compareMatchId(a: Match, b: Match): number {
  return a.id.localeCompare(b.id);
}

/** 首页「焦点赛事」：优先进行中；否则取未开球且最近即将开球的场次（不含已结束），开球时间相同则 id 靠前 */
export function pickHeroMatch(nowMs = Date.now()): Match | undefined {
  const live = matches.find((m) => resolveMatchDisplay(m, nowMs).status === 'live');
  if (live) return live;

  const upcoming = matches
    .map((m) => ({ match: m, kickoff: getMatchKickoffMs(m) }))
    .filter((x): x is { match: Match; kickoff: number } => {
      if (x.kickoff == null) return false;
      if (x.match.status === 'finished') return false;
      return x.kickoff > nowMs;
    });

  if (upcoming.length > 0) {
    upcoming.sort((a, b) => {
      if (a.kickoff !== b.kickoff) return a.kickoff - b.kickoff;
      return compareMatchId(a.match, b.match);
    });
    return upcoming[0].match;
  }

  return matches.find((m) => m.status !== 'finished') ?? matches[0];
}

/** 按开赛时间排序后的第一场（揭幕战） */
export function getOpeningMatch(): Match | undefined {
  return sortMatchesByKickoff(matches)[0];
}
