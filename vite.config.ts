import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:9137';

  return {
    plugins: [vue()],
    base: mode === "production" ? "/almoxarifado_ti/" : "/",
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    build: {
      outDir: "almoxarifado_ti"
    },
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  };
});
