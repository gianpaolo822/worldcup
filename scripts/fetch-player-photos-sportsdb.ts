/**
 * 从 TheSportsDB 拉取球员头像 URL，写入 data/player-photos.json
 * Wikipedia 在部分网络环境下不可用，TheSportsDB 作为可访问的数据源。
 *
 * 用法:
 *   npx tsx scripts/fetch-player-photos-sportsdb.ts
 *   npx tsx scripts/fetch-player-photos-sportsdb.ts --teams mexico,south-africa
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATA_DIR } from './paths.ts';

const USER_AGENT = '2026worldcup-data-bot/1.0';

interface Player {
  id: string;
  teamId: string;
  nameEn: string;
  nat: string;
  birthDate?: string;
}

interface PhotoEntry {
  url: string;
  source: 'thesportsdb' | 'override';
  sourceTitle?: string;
}

interface PhotoManifest {
  updatedAt: string;
  photos: Record<string, PhotoEntry>;
}

const NATIONALITY_HINT: Record<string, string[]> = {
  mexico: ['Mexico', 'Mexican'],
  'south-africa': ['South Africa', 'South African'],
  canada: ['Canada', 'Canadian'],
  switzerland: ['Switzerland', 'Swiss'],
  qatar: ['Qatar', 'Qatari'],
  'bosnia-and-herzegovina': ['Bosnia', 'Bosnian', 'Herzegovina'],
};

const NAT_CODE: Record<string, string> = {
  MEX: 'Mexico',
  RSA: 'South Africa',
  ZAF: 'South Africa',
  CAN: 'Canada',
  SUI: 'Switzerland',
  QAT: 'Qatar',
  BIH: 'Bosnia',
};

function parseArgs() {
  const args = process.argv.slice(2);
  let teams = ['mexico', 'south-africa'];
  for (const arg of args) {
    if (arg.startsWith('--teams=')) {
      teams = arg.slice('--teams='.length).split(',').map((t) => t.trim()).filter(Boolean);
    }
  }
  return { teams };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function birthYear(birthDate?: string): number | null {
  if (!birthDate) return null;
  const year = Number(birthDate.slice(0, 4));
  return Number.isFinite(year) ? year : null;
}

interface SportsDbPlayer {
  strPlayer?: string;
  strThumb?: string;
  strCutout?: string;
  strNationality?: string;
  dateBorn?: string;
  relevance?: string;
}

async function searchSportsDb(nameEn: string, retries = 3): Promise<SportsDbPlayer[]> {
  const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(nameEn)}`;
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (res.status === 429) {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { player?: SportsDbPlayer[] | null };
    return data.player ?? [];
  }
  throw new Error('HTTP 429');
}

function pickBestMatch(
  candidates: SportsDbPlayer[],
  player: Player,
  teamId: string,
): SportsDbPlayer | null {
  const hints = NATIONALITY_HINT[teamId] ?? [NAT_CODE[player.nat] ?? ''].filter(Boolean);
  const expectedYear = birthYear(player.birthDate);
  const nameLower = player.nameEn.toLowerCase();

  const scored = candidates
    .filter((c) => c.strThumb || c.strCutout)
    .map((c) => {
      let score = Number(c.relevance ?? 0);
      const cName = (c.strPlayer ?? '').toLowerCase();
      const nat = c.strNationality ?? '';

      if (cName === nameLower) score += 50;
      else if (cName.includes(nameLower) || nameLower.includes(cName)) score += 20;

      if (hints.some((h) => nat.toLowerCase().includes(h.toLowerCase()))) score += 40;

      if (expectedYear != null && c.dateBorn) {
        const y = Number(c.dateBorn.slice(0, 4));
        if (Number.isFinite(y)) {
          const diff = Math.abs(y - expectedYear);
          if (diff === 0) score += 30;
          else if (diff <= 1) score += 15;
          else if (diff > 3) score -= 25;
        }
      }

      if (c.strCutout) score += 5;
      return { c, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < 25) return null;
  return best.c;
}

async function loadJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

async function main() {
  const { teams } = parseArgs();
  const playersPath = path.join(DATA_DIR, 'players.json');
  const manifestPath = path.join(DATA_DIR, 'player-photos.json');
  const overridesPath = path.join(DATA_DIR, 'player-photo-overrides.json');

  const players = JSON.parse(await fs.readFile(playersPath, 'utf8')) as Player[];
  const targets = players.filter((p) => teams.includes(p.teamId));
  const existing = await loadJson<PhotoManifest>(manifestPath, { updatedAt: '', photos: {} });
  const overrides = await loadJson<Record<string, PhotoEntry>>(overridesPath, {});

  const photos: Record<string, PhotoEntry> = { ...existing.photos };
  let ok = 0;
  let miss = 0;

  console.log(`TheSportsDB 拉取 · ${teams.join(', ')} · ${targets.length} 人`);

  for (const player of targets) {
    if (overrides[player.id]) {
      photos[player.id] = overrides[player.id];
      console.log(`✓ ${player.id} ${player.nameEn} — override`);
      ok++;
      continue;
    }

    process.stdout.write(`… ${player.id} ${player.nameEn}`);

    try {
      const candidates = await searchSportsDb(player.nameEn);
      const hit = pickBestMatch(candidates, player, player.teamId);

      if (!hit) {
        console.log(' — 未找到');
        miss++;
      } else {
        const url = hit.strCutout || hit.strThumb!;
        photos[player.id] = {
          url,
          source: 'thesportsdb',
          sourceTitle: hit.strPlayer,
        };
        console.log(` — ${hit.strPlayer}`);
        ok++;
      }

      await sleep(600);
    } catch (err) {
      console.log(` — 错误: ${err instanceof Error ? err.message : err}`);
      miss++;
      await sleep(500);
    }
  }

  const manifest: PhotoManifest = {
    updatedAt: new Date().toISOString(),
    photos,
  };
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`\n完成 · 成功 ${ok} · 未找到 ${miss}`);
  console.log(`已写入 ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
