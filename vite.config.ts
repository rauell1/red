import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = Number(process.env.PORT || env.PORT) || 3000;

  return {
    plugins: [react()],
    publicDir: 'public',
    server: {
      host: '0.0.0.0',
      port: 5000,
      strictPort: true,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
    preview: { host: '0.0.0.0', port: 5000, allowedHosts: true },
    build: {
      outDir: 'dist/client',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React is shared by the static app and the lazy hero. Three/R3F stay in the hero's dynamic graph.
            if (id.includes('node_modules/react')) return 'vendor';
          },
        },
      },
    },
  };
});
