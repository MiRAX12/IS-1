import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// В режиме разработки запросы проксируются на WildFly, где приложение развёрнуто с контекстом /IS-1
const backend = 'http://localhost:8080';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: backend, rewrite: (path) => '/IS-1' + path },
      '/ws': { target: backend, ws: true, rewrite: (path) => '/IS-1' + path },
    },
  },
});
