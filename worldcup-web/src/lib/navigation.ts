export type TeamTab = 'schedule' | 'squad' | 'overview';

export function parseTeamTab(raw: string | null): TeamTab {
  if (raw === 'squad' || raw === 'overview') return raw;
  return 'schedule';
}

export function teamPath(teamId: string, tab: TeamTab = 'schedule'): string {
  if (tab === 'schedule') return `/team/${teamId}`;
  return `/team/${teamId}?tab=${tab}`;
}

export function readReturnTo(state: unknown): string | undefined {
  if (!state || typeof state !== 'object' || !('returnTo' in state)) return undefined;
  const value = (state as { returnTo: unknown }).returnTo;
  return typeof value === 'string' && value.startsWith('/') ? value : undefined;
}

export function buildReturnTo(pathname: string, search: string): string {
  return `${pathname}${search}`;
}
