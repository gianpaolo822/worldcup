/**
 * 合并 data/generated/players.json + data/player-locale.json → data/players.json
 */

import fs from 'node:fs';
import { PATHS } from './paths.js';
import type { Player, PlayerInjuryOverride, PlayerInjuryOverridesFile, PlayerLocaleEntry, PlayerLocaleFile } from './types.js';

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function normalizeBasePlayer(raw: Record<string, unknown>): Player {
  const nameEn = String(raw.nameEn ?? raw.name ?? '');
  const clubEn = raw.clubEn != null ? String(raw.clubEn) : raw.club != null ? String(raw.club) : undefined;

  const player: Player = {
    id: String(raw.id),
    teamId: String(raw.teamId),
    number: Number(raw.number),
    nameEn,
    nat: String(raw.nat ?? ''),
    position: String(raw.position ?? ''),
  };

  if (raw.nameZh != null && String(raw.nameZh).trim()) player.nameZh = String(raw.nameZh).trim();
  if (raw.height != null) player.height = Number(raw.height);
  if (raw.weight != null) player.weight = Number(raw.weight);
  if (raw.birthDate != null) player.birthDate = String(raw.birthDate);
  if (raw.birthPlace != null) player.birthPlace = String(raw.birthPlace);
  if (clubEn) player.clubEn = clubEn;
  if (raw.group != null) player.group = String(raw.group);
  if (raw.status === 'injured' || raw.status === 'active') player.status = raw.status;
  if (raw.injuryNote != null) player.injuryNote = String(raw.injuryNote);

  return player;
}

function applyLocale(player: Player, locale?: PlayerLocaleEntry): Player {
  if (!locale) return player;

  const next: Player = { ...player };

  if (locale.nameZh?.trim()) next.nameZh = locale.nameZh.trim();
  if (locale.club?.trim()) next.club = locale.club.trim();

  return next;
}

function applyInjuryOverride(player: Player, override?: PlayerInjuryOverride): Player {
  if (!override) return player;

  const next: Player = { ...player };

  if (override.status === 'injured' || override.status === 'active') {
    next.status = override.status;
  }

  if (override.injuryNote === null) {
    delete next.injuryNote;
  } else if (override.injuryNote != null) {
    next.injuryNote = override.injuryNote;
  }

  return next;
}

function main(): void {
  if (!fs.existsSync(PATHS.generatedPlayers)) {
    throw new Error(`缺少 ${PATHS.generatedPlayers}，请先运行 npm run data:import`);
  }

  const basePlayers = readJson<Record<string, unknown>[]>(PATHS.generatedPlayers).map(normalizeBasePlayer);
  const localeFile = fs.existsSync(PATHS.playerLocale)
    ? readJson<PlayerLocaleFile>(PATHS.playerLocale)
    : { players: {} };
  const injuryOverrides = fs.existsSync(PATHS.playerInjuryOverrides)
    ? readJson<PlayerInjuryOverridesFile>(PATHS.playerInjuryOverrides)
    : { players: {} };

  const localeMap = localeFile.players ?? {};
  const injuryMap = injuryOverrides.players ?? {};
  const merged = basePlayers.map((player) => {
    const withLocale = applyLocale(player, localeMap[player.id]);
    return applyInjuryOverride(withLocale, injuryMap[player.id]);
  });

  const unknownLocaleIds = Object.keys(localeMap).filter((id) => !basePlayers.some((p) => p.id === id));
  if (unknownLocaleIds.length > 0) {
    console.warn(
      `[data:locale] player-locale 中存在未知球员 id（将被忽略）: ${unknownLocaleIds.slice(0, 5).join(', ')}${
        unknownLocaleIds.length > 5 ? ` …共 ${unknownLocaleIds.length} 个` : ''
      }`,
    );
  }

  const unknownInjuryIds = Object.keys(injuryMap).filter((id) => !basePlayers.some((p) => p.id === id));
  if (unknownInjuryIds.length > 0) {
    console.warn(
      `[data:locale] player-injury-overrides 中存在未知球员 id（将被忽略）: ${unknownInjuryIds.slice(0, 5).join(', ')}${
        unknownInjuryIds.length > 5 ? ` …共 ${unknownInjuryIds.length} 个` : ''
      }`,
    );
  }

  const withZh = merged.filter((p) => p.nameZh).length;
  const withClub = merged.filter((p) => p.club).length;
  const injured = merged.filter((p) => p.status === 'injured').length;

  fs.writeFileSync(PATHS.players, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  console.log(
    `[data:locale] players=${merged.length} locale=${Object.keys(localeMap).length} injuryOverrides=${Object.keys(injuryMap).length} nameZh=${withZh} clubZh=${withClub} injured=${injured}`,
  );
}

main();
