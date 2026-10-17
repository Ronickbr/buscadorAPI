import { authPlugin } from './server/auth.js';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [authPlugin],
  build: { rollupOptions: { input: { main: 'index.html', consulta: 'consulta.html', admin: 'admin.html' } } },
  server: {
    port: 3000,
    open: false,
  }
});

