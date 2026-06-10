import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // 允许 Cursor 预览 / 局域网手机访问
    strictPort: false, // 5173 被旧进程占用时自动换端口，避免一直看到旧界面
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@data': path.resolve(__dirname, '../data'),
    },
  },
});
