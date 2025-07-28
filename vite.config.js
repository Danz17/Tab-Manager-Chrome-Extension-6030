import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        newtab: path.resolve(__dirname, 'newtab.html'),
        popup: path.resolve(__dirname, 'popup.html'),
        welcome: path.resolve(__dirname, 'welcome.html'),
        settings: path.resolve(__dirname, 'settings.html'),
        background: path.resolve(__dirname, 'background.js'),
        content: path.resolve(__dirname, 'content.js')
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
});