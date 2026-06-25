/**
 * 从 Wikipedia / Wikidata 拉取球员头像，保存到 worldcup-web/public/players/
 *
 * 用法:
 *   npx tsx scripts/fetch-player-photos.ts
 *   npx tsx scripts/fetch-player-photos.ts --teams mexico,south-africa
 *   npx tsx scripts/fetch-player-photos.ts --dry-run
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATA_DIR } from './paths.ts';

const USER_AGENT = '2026worldcup-data-bot/1.0 (local dev; contact: project maintainer)';

interface Player {
  id: string;
  teamId: string;
  nameEn: string;
  birthDate?: string;
}

interface PhotoEntry {
  path?: string;
  url?: string;
  source: 'wikipedia' | 'wikidata' | 'override';
  sourceTitle?: string;
  sourceUrl?: string;
}

interface PhotoManifest {
  updatedAt: string;
  photos: Record<string, PhotoEntry>;
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_PLAYERS_DIR = path.join(ROOT, 'worldcup-web/public/players');
const MANIFEST_PATH = path.join(DATA_DIR, 'player-photos.json');
const OVERRIDES_PATH = path.join(DATA_DIR, 'player-photo-overrides.json');

const DEFAULT_TEAMS = ['mexico', 'south-africa'];

function parseArgs() {
  const args = process.argv.slice(2);
  let teams = DEFAULT_TEAMS;
  let urlsOnly = false;
  for (const arg of args) {
    if (arg.startsWith('--teams=')) {
      teams = arg.slice('--teams='.length).split(',').map((t) => t.trim()).filter(Boolean);
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--urls-only') {
      urlsOnly = true;
    }
  }
  return { teams, dryRun, urlsOnly };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function birthYear(birthDate?: string): number | null {
  if (!birthDate) return null;
  const year = Number(birthDate.slice(0, 4));
  return Number.isFinite(year) ? year : null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

async function searchWikipediaImage(nameEn: string): Promise<{ url: string; title: string; pageUrl: string } | null> {
  const queries = [`${nameEn} footballer`, `${nameEn} soccer`, nameEn];
  for (const q of queries) {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: q,
      gsrlimit: '5',
      prop: 'pageimages|info',
      inprop: 'url',
      piprop: 'thumbnail',
      pithumbsize: '400',
      format: 'json',
      origin: '*',
    });
    const data = await fetchJson<{
      query?: { pages?: Record<string, { title?: string; fullurl?: string; thumbnail?: { source?: string } }> };
    }>(`https://en.wikipedia.org/w/api.php?${params}`);

    const pages = Object.values(data.query?.pages ?? {});
    for (const page of pages) {
      const title = page.title ?? '';
      const thumb = page.thumbnail?.source;
      if (!thumb) continue;
      const lower = title.toLowerCase();
      if (
        lower.includes('football') ||
        lower.includes('soccer') ||
        lower.includes('fútbol') ||
        lower.includes('futbol') ||
        q !== nameEn
      ) {
        return { url: thumb, title, pageUrl: page.fullurl ?? '' };
      }
    }
  }
  return null;
}

async function searchWikidataImage(
  nameEn: string,
  expectedBirthYear: number | null,
): Promise<{ url: string; title: string; pageUrl: string } | null> {
  const params = new URLSearchParams({
    action: 'wbsearchentities',
    search: nameEn,
    language: 'en',
    type: 'item',
    limit: '5',
    format: 'json',
    origin: '*',
  });
  const search = await fetchJson<{
    search?: { id: string; label: string; description?: string }[];
  }>(`https://www.wikidata.org/w/api.php?${params}`);

  for (const hit of search.search ?? []) {
    const desc = (hit.description ?? '').toLowerCase();
    if (
      desc &&
      !desc.includes('football') &&
      !desc.includes('soccer') &&
      !desc.includes('association football')
    ) {
      continue;
    }

    const entity = await fetchJson<{
      entities?: Record<
        string,
        {
          claims?: {
            P18?: { mainsnak?: { datavalue?: { value?: string } } }[];
            P569?: { mainsnak?: { datavalue?: { value?: { time?: string } } } }[];
          };
        }
      >;
    }>(`https://www.wikidata.org/wiki/Special:EntityData/${hit.id}.json`);

    const item = entity.entities?.[hit.id];
    const imageName = item?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    if (!imageName) continue;

    if (expectedBirthYear != null) {
      const wTime = item?.claims?.P569?.[0]?.mainsnak?.datavalue?.value?.time;
      if (wTime) {
        const wYear = Number(wTime.slice(1, 5));
        if (Number.isFinite(wYear) && Math.abs(wYear - expectedBirthYear) > 2) continue;
      }
    }

    const fileUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageName)}?width=400`;
    return {
      url: fileUrl,
      title: hit.label,
      pageUrl: `https://www.wikidata.org/wiki/${hit.id}`,
    };
  }
  return null;
}

async function downloadImage(url: string, destPath: string): Promise<void> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buf);
}

async function loadJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function main() {
  const { teams, dryRun, urlsOnly } = parseArgs();
  const players = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'players.json'), 'utf8')) as Player[];
  const targets = players.filter((p) => teams.includes(p.teamId));

  const existing = await loadJson<PhotoManifest>(MANIFEST_PATH, {
    updatedAt: '',
    photos: {},
  });
  const overrides = await loadJson<Record<string, PhotoEntry>>(OVERRIDES_PATH, {});

  if (!dryRun) {
    await fs.mkdir(PUBLIC_PLAYERS_DIR, { recursive: true });
  }

  const photos: Record<string, PhotoEntry> = { ...existing.photos };
  let fetched = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`目标球队: ${teams.join(', ')} · 共 ${targets.length} 名球员`);
  if (dryRun) console.log('(dry-run 模式，不写入文件)');
  if (urlsOnly) console.log('(urls-only 模式，仅写入远程 URL，不下载图片)');

  for (const player of targets) {
    const dest = path.join(PUBLIC_PLAYERS_DIR, `${player.id}.jpg`);
    const publicPath = `/players/${player.id}.jpg`;

    if (overrides[player.id]) {
      photos[player.id] = overrides[player.id];
      console.log(`✓ ${player.id} ${player.nameEn} — override`);
      skipped++;
      continue;
    }

    if (photos[player.id] && !dryRun) {
      try {
        await fs.access(dest);
        console.log(`· ${player.id} ${player.nameEn} — 已有本地文件，跳过`);
        skipped++;
        continue;
      } catch {
        // re-fetch
      }
    }

    process.stdout.write(`… ${player.id} ${player.nameEn}`);

    try {
      let hit =
        (await searchWikipediaImage(player.nameEn)) ??
        (await searchWikidataImage(player.nameEn, birthYear(player.birthDate)));

      if (!hit) {
        console.log(' — 未找到');
        failed++;
        await sleep(300);
        continue;
      }

      console.log(` — ${hit.title}`);

      if (!dryRun) {
        if (urlsOnly) {
          photos[player.id] = {
            url: hit.url,
            source: hit.pageUrl.includes('wikidata') ? 'wikidata' : 'wikipedia',
            sourceTitle: hit.title,
            sourceUrl: hit.pageUrl,
          };
        } else {
          await downloadImage(hit.url, dest);
          photos[player.id] = {
            path: publicPath,
            source: hit.pageUrl.includes('wikidata') ? 'wikidata' : 'wikipedia',
            sourceTitle: hit.title,
            sourceUrl: hit.pageUrl,
          };
        }
        fetched++;
      }

      await sleep(400);
    } catch (err) {
      console.log(` — 错误: ${err instanceof Error ? err.message : err}`);
      failed++;
      await sleep(500);
    }
  }

  if (!dryRun) {
    const manifest: PhotoManifest = {
      updatedAt: new Date().toISOString(),
      photos,
    };
    await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }

  console.log('\n完成');
  console.log(`新增/更新: ${fetched} · 跳过: ${skipped} · 未找到: ${failed}`);
  console.log(`清单: ${MANIFEST_PATH}`);
  console.log(`图片目录: ${PUBLIC_PLAYERS_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
