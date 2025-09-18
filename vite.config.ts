import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: true,
        proxy: {
          '^/api/.*': {
            target: process.env.NODE_ENV === 'development' && process.env.DOCKER === 'true' 
              ? 'http://backend-dev:3001' 
              : 'http://localhost:3001',
            changeOrigin: true,
            secure: false
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            assetFileNames: '[name].[hash][extname]',
            chunkFileNames: '[name].[hash].js',
            entryFileNames: '[name].[hash].js'
          }
        }
      }
    };
});
