import { defineConfig } from 'vite';
import string from 'vite-plugin-string';
import checker from 'vite-plugin-checker';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: 'public',
  envDir: '..',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    manifest: true,
    target: 'es2022',
    sourcemap: false,
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
    checker({
      typescript: true,
    }),
  ],
});
