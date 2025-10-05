import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: ['prettier'],
    extends: [
      'js/recommended',
      'eslint:recommended',
      'plugin:prettier/recommended',
    ],
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    languageOptions: { globals: globals.browser },
  },
]);
