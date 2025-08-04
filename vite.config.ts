import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react(), tailwindcss()],
    server: {
      // Add this to make Vite's development server use your private IP
      host: '0.0.0.0',
      proxy: {
        // Configure a proxy for API requests
        '/api': {
          target: 'http://172.31.12.157:3000',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        }
      }
    },
  };

  if (command === 'build') {
    (config as any).build = {
      esbuild: {
        drop: ['console', 'debugger'],
      },
    };
  }

  return config;
})