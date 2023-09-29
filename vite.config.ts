/* eslint-disable import/no-extraneous-dependencies, import/no-default-export */
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './',
  root: path.resolve(__dirname, './src'),
  publicDir: path.resolve(__dirname, './assets'),
  build: {
    outDir: path.join(__dirname, './dist'),
    assetsDir: 'public',
    rollupOptions: {
      output: {
        format: 'umd',
      },
    },
  },
  resolve: {
    alias: {
      'ludum-dare-54': path.resolve(__dirname, './src'),
      ponczek: path.resolve(__dirname, './ponczek/src'),
    },
  },
  server: {
    port: 1234,
  },
  preview: {
    port: 1234,
  },
});
