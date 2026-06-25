/**
 * 解析 data/official/fifa-members.md → data/fifa-members.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './paths.js';

export interface FifaMember {
  nameZh: string;
  nameEn: string;
  code: string;
}

export interface FifaMembersFile {
  source: string;
  updatedAt: string;
  members: FifaMember[];
}

const SOURCE_MD = path.join(DATA_DIR, 'official', 'fifa-members.md');
const OUTPUT = path.join(DATA_DIR, 'fifa-members.json');

export function parseFifaMembersMarkdown(markdown: string): FifaMember[] {
  const members: FifaMember[] = [];

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || trimmed.includes('中文全称') || trimmed.includes(':---')) {
      continue;
    }

    const cells = trimmed
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);

    if (cells.length < 3) continue;

    const [nameZh, nameEn, code] = cells;
    if (!/^[A-Z]{3}$/.test(code)) continue;

    members.push({ nameZh, nameEn, code });
  }

  return members;
}

export function writeFifaMembersJson(members: FifaMember[]): void {
  const payload: FifaMembersFile = {
    source: 'data/official/fifa-members.md',
    updatedAt: new Date().toISOString().slice(0, 10),
    members,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function main(): void {
  const markdown = fs.readFileSync(SOURCE_MD, 'utf8');
  const members = parseFifaMembersMarkdown(markdown);

  if (members.length < 200) {
    throw new Error(`[data:fifa:import] 解析成员数量异常: ${members.length}`);
  }

  writeFifaMembersJson(members);
  console.log(`[data:fifa:import] members=${members.length} → ${OUTPUT}`);
}

if (process.argv[1]?.endsWith('import-fifa-members.ts')) {
  main();
}
