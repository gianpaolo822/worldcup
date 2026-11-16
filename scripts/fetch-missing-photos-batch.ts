/**
 * One-off batch lookup for players missed by fetch-player-photos-sportsdb.ts
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR } from './paths.ts';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Target {
  id: string;
  queries: string[];
  birthDate?: string;
  natHint?: string;
}

const TARGETS: Target[] = [
  { id: 'south-korea-9', queries: ['Cho Guesung', 'Guesung Cho', 'Cho Gue-sang'], birthDate: '1998-01-25', natHint: 'South Korea' },
  { id: 'south-korea-10', queries: ['Lee Jae-sung', 'Jae-sung Lee', 'Lee Jaesung'], birthDate: '1992-08-10', natHint: 'South Korea' },
  { id: 'south-korea-14', queries: ['Cho Wije', 'Wi-je Cho', 'Cho Wi-je'], birthDate: '2001-08-25', natHint: 'South Korea' },
  { id: 'qatar-2', queries: ['Ro-Ro', 'Ró-Ró Qatar', 'Abdelkarim Hassan'], birthDate: '1990-08-06', natHint: 'Qatar' },
  { id: 'qatar-5', queries: ['Jassem Gaber', 'Jassim Gaber'], birthDate: '2002-02-20', natHint: 'Qatar' },
  { id: 'qatar-6', queries: ['Abdulaziz Hatem'], birthDate: '1990-10-28', natHint: 'Qatar' },
  { id: 'qatar-20', queries: ['Ahmed Fatehi', 'Ahmed Fathi Qatar'], birthDate: '1993-01-25', natHint: 'Qatar' },
  { id: 'australia-1', queries: ['Mathew Ryan', 'Mat Ryan', 'Mat Ryan Levante'], birthDate: '1992-04-08', natHint: 'Australia' },
  { id: 'australia-7', queries: ['Mathew Leckie', 'Matthew Leckie'], birthDate: '1991-02-04', natHint: 'Australia' },
  { id: 'australia-8', queries: ['Conor Metcalfe', 'Connor Metcalfe'], birthDate: '1999-11-05', natHint: 'Australia' },
  { id: 'australia-11', queries: ['Awer Mabil'], birthDate: '1995-09-15', natHint: 'Australia' },
  { id: 'australia-12', queries: ['Paul Izzo'], birthDate: '1995-01-06', natHint: 'Australia' },
  { id: 'australia-13', queries: ["Aiden O'Neill", 'Aiden O Neill'], birthDate: '1998-07-04', natHint: 'Australia' },
  { id: 'australia-14', queries: ['Cameron Devlin'], birthDate: '1998-06-07', natHint: 'Australia' },
  { id: 'australia-15', queries: ['Kai Trewin'], birthDate: '2001-05-18', natHint: 'Australia' },
  { id: 'japan-7', queries: ['Ao Tanaka', 'Aō Tanaka', 'Tanaka Ao'], birthDate: '1998-09-10', natHint: 'Japan' },
  { id: 'japan-20', queries: ['Ayumu Seko'], birthDate: '2000-06-07', natHint: 'Japan' },
  { id: 'japan-21', queries: ['Hiroki Ito', 'Hiroki Itō'], birthDate: '1999-05-12', natHint: 'Japan' },
  { id: 'iran-20', queries: ['Shahriyar Moghanlou', 'Shahriar Moghanlou'], birthDate: '1994-12-21', natHint: 'Iran' },
  { id: 'iran-22', queries: ['Hossein Hosseini', 'Hossein Hosseini Sepahan'], birthDate: '1992-06-30', natHint: 'Iran' },
  { id: 'iran-26', queries: ['Amirmohammad Razzaghinia', 'Amir Mohammad Razzaghinia'], birthDate: '2006-04-11', natHint: 'Iran' },
  { id: 'iraq-1', queries: ['Fahad Talib', 'Fahad Talib Al-Talaba'], birthDate: '1994-10-21', natHint: 'Iraq' },
  { id: 'iraq-5', queries: ['Akam Hashim', 'Akam Mohsin Hashim'], birthDate: '1998-08-16', natHint: 'Iraq' },
  { id: 'iraq-13', queries: ['Ali Yousif', 'Ali Yousef Iraq'], birthDate: '1996-01-19', natHint: 'Iraq' },
  { id: 'jordan-6', queries: ['Amer Jamous'], birthDate: '2002-07-03', natHint: 'Jordan' },
  { id: 'jordan-17', queries: ['Salim Obaid', 'Salim Obeid'], birthDate: '1992-01-17', natHint: 'Jordan' },
  { id: 'jordan-23', queries: ['Ihsan Haddad'], birthDate: '1994-02-05', natHint: 'Jordan' },
  { id: 'saudi-arabia-8', queries: ['Aiman Yahya', 'Ayman Yahya'], birthDate: '2001-05-14', natHint: 'Saudi' },
  { id: 'saudi-arabia-9', queries: ['Firas Al-Brikan', 'Feras Al-Brikan'], birthDate: '2000-05-14', natHint: 'Saudi' },
  { id: 'saudi-arabia-13', queries: ['Nawaf Boushalh', 'Nawaf Bu-Washl', 'Nawaf Boushal'], birthDate: '1999-09-16', natHint: 'Saudi' },
  { id: 'saudi-arabia-14', queries: ['Hassan Kadish'], birthDate: '1992-09-26', natHint: 'Saudi' },
  { id: 'saudi-arabia-17', queries: ['Khalid Al-Ghannam', 'Khalid Al Ghannam'], birthDate: '2000-11-07', natHint: 'Saudi' },
  { id: 'saudi-arabia-18', queries: ["Alaa Al-Hajji", "Ala'a Al-Hajji"], birthDate: '1995-12-03', natHint: 'Saudi' },
  { id: 'saudi-arabia-19', queries: ['Abdullah Al-Hamdan', 'Abdullah Al-Hamddan'], birthDate: '1999-09-12', natHint: 'Saudi' },
  { id: 'saudi-arabia-25', queries: ['Jehad Thakri', 'Jehad Thikri'], birthDate: '2001-07-21', natHint: 'Saudi' },
  { id: 'united-states-5', queries: ['Antonee Robinson'], birthDate: '1997-08-08', natHint: 'United States' },
  { id: 'colombia-5', queries: ['Kevin Castaño', 'Kevin Castano'], birthDate: '2000-09-29', natHint: 'Colombia' },
  { id: 'belgium-10', queries: ['Leandro Trossard'], birthDate: '1994-12-04', natHint: 'Belgium' },
  { id: 'spain-9', queries: ['Gavi', 'Pablo Gavi', 'Pablo Martin Paez Gavira'], birthDate: '2004-08-05', natHint: 'Spain' },
  { id: 'spain-11', queries: ['Yéremi Pino', 'Yeremi Pino'], birthDate: '2002-10-20', natHint: 'Spain' },
  { id: 'spain-12', queries: ['Pedro Porro'], birthDate: '1999-09-13', natHint: 'Spain' },
  { id: 'spain-16', queries: ['Rodri', 'Rodrigo Hernandez', 'Rodrigo Hernández'], birthDate: '1996-06-22', natHint: 'Spain' },
  { id: 'spain-20', queries: ['Pedri', 'Pedro Gonzalez', 'Pedro González'], birthDate: '2002-11-25', natHint: 'Spain' },
  { id: 'portugal-12', queries: ['José Sá', 'Jose Sa', 'Jose Sa Wolves'], birthDate: '1993-01-17', natHint: 'Portugal' },
  { id: 'portugal-22', queries: ['Rui Silva Sporting', 'Rui Silva Portugal'], birthDate: '1994-02-07', natHint: 'Portugal' },
  { id: 'portugal-23', queries: ['Vitinha', 'Vitor Ferreira', 'Vitinha PSG'], birthDate: '2000-02-13', natHint: 'Portugal' },
  { id: 'portugal-24', queries: ['Samú Costa', 'Samu Costa'], birthDate: '2000-11-27', natHint: 'Portugal' },
  { id: 'cape-verde-6', queries: ['Kevin Pina'], birthDate: '1997-01-27', natHint: 'Cape Verde' },
  { id: 'cape-verde-8', queries: ['João Paulo', 'Joao Paulo FCSB', 'Joao Paulo Cape Verde'], birthDate: '1998-05-26', natHint: 'Cape Verde' },
  { id: 'cape-verde-20', queries: ['Ryan Mendes'], birthDate: '1990-01-08', natHint: 'Cape Verde' },
  { id: 'cape-verde-23', queries: ['CJ dos Santos', 'CJ Dos Santos', 'Christopher dos Santos'], birthDate: '2000-08-24', natHint: 'Cape Verde' },
  { id: 'egypt-15', queries: ['Karim Hafez'], birthDate: '1996-03-12', natHint: 'Egypt' },
  { id: 'egypt-16', queries: ['El Mahdy Soliman', 'Mahdy Soliman'], birthDate: '1987-06-08', natHint: 'Egypt' },
  { id: 'egypt-17', queries: ['Mohanad Lasheen'], birthDate: '1996-05-29', natHint: 'Egypt' },
  { id: 'egypt-18', queries: ['Nabil Dunga', 'Nabil Dengam'], birthDate: '1996-04-06', natHint: 'Egypt' },
  { id: 'egypt-25', queries: ['Ahmed Sayed', 'Ahmed Sayed Zizo', 'Zizo'], birthDate: '1996-01-10', natHint: 'Egypt' },
];

interface SportsDbPlayer {
  strPlayer?: string;
  strThumb?: string;
  strCutout?: string;
  strNationality?: string;
  dateBorn?: string;
}

async function searchPlayers(q: string): Promise<SportsDbPlayer[]> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(q)}`,
      { headers: { 'User-Agent': '2026worldcup-data-bot/1.0' } },
    );
    if (res.status === 429) {
      await sleep(3000 * (attempt + 1));
      continue;
    }
    if (!res.ok) return [];
    const data = (await res.json()) as { player?: SportsDbPlayer[] | null };
    return data.player ?? [];
  }
  return [];
}

function scoreCandidate(c: SportsDbPlayer, target: Target): number {
  if (!c.strCutout && !c.strThumb) return -1;
  let score = 0;
  const nat = (c.strNationality ?? '').toLowerCase();
  const hint = (target.natHint ?? '').toLowerCase();
  if (hint && nat.includes(hint)) score += 40;
  if (target.birthDate && c.dateBorn === target.birthDate) score += 50;
  else if (target.birthDate && c.dateBorn?.slice(0, 4) === target.birthDate.slice(0, 4)) score += 20;
  if (c.strCutout) score += 5;
  return score;
}

async function main() {
  const manifestPath = path.join(DATA_DIR, 'player-photos.json');
  const overridesPath = path.join(DATA_DIR, 'player-photo-overrides.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')) as {
    updatedAt: string;
    photos: Record<string, { url: string; source: string; sourceTitle?: string }>;
  };
  const overrides = JSON.parse(await fs.readFile(overridesPath, 'utf8')) as Record<
    string,
    { url: string; source: string; sourceTitle?: string }
  >;

  const found: string[] = [];
  const missed: string[] = [];

  for (const target of TARGETS) {
    if (manifest.photos[target.id]?.url) {
      found.push(`${target.id} (已有)`);
      continue;
    }

    let best: { c: SportsDbPlayer; score: number } | null = null;

    for (const q of target.queries) {
      await sleep(2500);
      const candidates = await searchPlayers(q);
      for (const c of candidates) {
        const score = scoreCandidate(c, target);
        if (score >= 25 && (!best || score > best.score)) {
          best = { c, score };
        }
      }
      if (best && best.score >= 50) break;
    }

    if (!best) {
      missed.push(target.id);
      console.log(`✗ ${target.id}`);
      continue;
    }

    const entry = {
      url: best.c.strCutout || best.c.strThumb!,
      source: 'override' as const,
      sourceTitle: best.c.strPlayer,
    };
    manifest.photos[target.id] = entry;
    overrides[target.id] = entry;
    found.push(`${target.id} → ${best.c.strPlayer}`);
    console.log(`✓ ${target.id} → ${best.c.strPlayer} (${best.score})`);
  }

  manifest.updatedAt = new Date().toISOString();
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await fs.writeFile(overridesPath, `${JSON.stringify(overrides, null, 2)}\n`, 'utf8');

  console.log(`\n补全 ${found.length} · 仍缺 ${missed.length}`);
  if (missed.length) console.log(missed.join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
