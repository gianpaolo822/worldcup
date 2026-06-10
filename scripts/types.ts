/** 与 worldcup-web 共享的数据类型（构建时 import JSON 对齐此结构） */

export type MatchStatus = 'upcoming' | 'live' | 'finished';

export interface Team {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  group: string;
  flag: string;
  color: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  time: string;
  kickoffAt: string | null;
  venue: string;
  venueShort: string;
  venueCity?: string;
  matchday: number;
  group?: string;
  stage?: string;
}

export interface StandingRow {
  rank: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export type StandingsByGroup = Record<string, StandingRow[]>;

export interface WorldCupEdition {
  year: number;
  host: string;
  champion: string;
  runnerUp: string;
  score: string;
  goldenBoot: string;
  goldenBall: string;
  goldenGlove: string;
}

export interface TopScorer {
  rank: number;
  name: string;
  nameEn: string;
  country: string;
  goals: number;
  tournaments: string;
  /** 详情页扩展字段，后期手工补充 */
  birthDate?: string;
  birthPlace?: string;
  club?: string;
  height?: number;
  weight?: number;
  position?: string;
  bio?: string;
}

export type PlayerPosition = 'G' | 'D' | 'M' | 'F';

export interface Player {
  id: string;
  teamId: string;
  number: number;
  name: string;
  nameEn: string;
  nat: string;
  position: PlayerPosition | string;
  height?: number;
  weight?: number;
  birthDate?: string;
  birthPlace?: string;
  club?: string;
  group?: string;
  status?: 'active' | 'injured';
  injuryNote?: string;
}

export interface Coach {
  teamId: string;
  name: string;
  nameEn: string;
  nationality?: string;
  birthDate?: string;
  group?: string;
}

export interface Venue {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  cityEn?: string;
  country: string;
  countryEn?: string;
  capacity?: number;
  matchCount?: number;
  note?: string;
}

export interface MatchOverride {
  _note?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: MatchStatus;
}

export interface OverridesFile {
  $schema?: string;
  matches: Record<string, MatchOverride>;
}

export interface SyncMeta {
  syncedAt: string;
  source: string;
  note?: string;
}
