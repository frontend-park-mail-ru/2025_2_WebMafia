import { defineConfig } from 'vite';
import string from 'vite-plugin-string';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: 'public',
  envDir: '..',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    manifest: true,
  },
  server: {
    port: 8090,
    open: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./public/static/js', import.meta.url)),
    },
  },
  plugins: [
    string({
      include: '**/*.hbs',
    }),
  ],
});
