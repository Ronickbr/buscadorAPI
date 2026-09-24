import { authPlugin } from './server/auth.js';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [authPlugin],
  build: { rollupOptions: { input: { main: 'index.html', consulta: 'consulta.html' } } },
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api-proxy': {
        target: 'http://apisbrasilpro.site',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
});

