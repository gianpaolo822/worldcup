import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const DATA_DIR = path.join(root, 'data');
export const GENERATED_DIR = path.join(DATA_DIR, 'generated');

export const PATHS = {
  overrides: path.join(DATA_DIR, 'overrides.json'),
  teams: path.join(DATA_DIR, 'teams.json'),
  matches: path.join(DATA_DIR, 'matches.json'),
  standings: path.join(DATA_DIR, 'standings.json'),
  worldCupHistory: path.join(DATA_DIR, 'world-cup-history.json'),
  topScorers: path.join(DATA_DIR, 'top-scorers.json'),
  generatedTeams: path.join(GENERATED_DIR, 'teams.json'),
  generatedMatches: path.join(GENERATED_DIR, 'matches.json'),
  syncMeta: path.join(GENERATED_DIR, 'sync-meta.json'),
} as const;
