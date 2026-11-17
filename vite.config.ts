import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Caminhos relativos: o build funciona em qualquer pasta (GitHub Pages, itch.io, arquivo local servido).
  base: './',
  server: { port: 5173 },
  build: {
    target: 'es2022',
    // O Phaser sozinho já passa de 1 MB; não é problema para um jogo.
    chunkSizeWarningLimit: 2500,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
