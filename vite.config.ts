import { defineConfig, ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';

  // Define the base server configuration object
  const serverConfig: {
    host: string;
    allowedHosts?: string[]; // Make optional if not needed everywhere
    proxy?: Record<string, string | ProxyOptions>;
  } = {
    host: '0.0.0.0',
    allowedHosts: ['.loca.lt'], // You can add this back if you use localtunnel
  };

  // Only add the proxy object if we are NOT in production
  if (!isProduction) {
    serverConfig.proxy = {
      '/api': {
        target: 'http://172.31.12.157:3000', // Make sure this target is correct for your setup
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    };
  }

  const config = {
    // The crucial change is ensuring tailwindcss() is included here
    plugins: [react(), tailwindcss()], 
    server: serverConfig,
  };

  if (command === 'build') {
    (config as any).build = {
      esbuild: {
        drop: ['console', 'debugger'],
      },
    };
  }
  
  return config;
});