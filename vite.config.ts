import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

// GitHub Pages base path. If repo is renamed, edit this.
const BASE = process.env.GITHUB_PAGES_BASE ?? '/ookini-kok/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE : '/',
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: false,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
}));
