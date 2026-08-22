import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        /**
         * Recharts is roughly two-thirds of the bundle and only three screens
         * use it. Splitting it out means the sign-in page and every table view
         * stop paying for a charting library they never render.
         */
        manualChunks: {
          charts: ['recharts'],
          vendor: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
        },
      },
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
  server: {
    port: 5174,
    /**
     * The API is proxied rather than called cross-origin so the browser never
     * has to be told about CORS in development, and the axios base URL is the
     * same relative `/api` in both environments.
     */
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
