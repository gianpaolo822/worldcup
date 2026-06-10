/**
 * 串联：import（优先 Excel）或 sync → merge → standings
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tsx = path.join(root, 'node_modules', '.bin', 'tsx');
const importDir = path.join(root, 'data', 'import');
const hasXlsxImport =
  fs.existsSync(path.join(importDir, '2026FIFA World Cup.xlsx')) &&
  fs.existsSync(path.join(importDir, '世界杯奖项体系汇总.xlsx'));

function runTsx(script: string): void {
  const result = spawnSync(tsx, [path.join(root, 'scripts', script)], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runImport(): void {
  const result = spawnSync('python3', [path.join(root, 'scripts', 'import-from-xlsx.py')], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('[data:refresh] start');
if (hasXlsxImport) {
  console.log('[data:refresh] using data/import/*.xlsx');
  runImport();
} else {
  runTsx('sync-openfootball.ts');
}
runTsx('merge-overrides.ts');
runTsx('compute-standings.ts');
console.log('[data:refresh] done');
