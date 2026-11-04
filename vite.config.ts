import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_URL ?? (process.env.GITHUB_ACTIONS ? '/ace8-weapon-chart/' : '/'),
  plugins: [react()],
});
