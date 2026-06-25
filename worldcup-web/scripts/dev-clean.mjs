#!/usr/bin/env node
/**
 * 结束占用 5173 的旧 Vite 进程，再启动 dev（避免预览到旧代码）。
 */
import { execSync, spawnSync } from 'node:child_process';

const PORT = 5173;

function killPort(port) {
  try {
    const pids = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    for (const pid of pids) {
      try {
        process.kill(Number(pid), 'SIGTERM');
      } catch {
        /* 进程可能已退出 */
      }
    }
    if (pids.length > 0) {
      console.log(`[dev:clean] 已结束占用 ${port} 端口的进程: ${pids.join(', ')}`);
    }
  } catch {
    /* 端口空闲 */
  }
}

killPort(PORT);

const result = spawnSync('npx', ['vite'], {
  stdio: 'inherit',
  shell: false,
});

process.exit(result.status ?? 1);
