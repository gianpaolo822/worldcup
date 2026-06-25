import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const repoRoot = path.resolve(__dirname, '..');

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // 允许 Cursor 预览 / 局域网手机访问
    strictPort: true, // 5173 被占用时直接报错，避免静默换端口导致一直看旧代码
    fs: {
      // 允许读取并热更新 ../data 下的 JSON（阵容、比分覆盖等）
      allow: [repoRoot],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@data': path.resolve(repoRoot, 'data'),
    },
  },
});
