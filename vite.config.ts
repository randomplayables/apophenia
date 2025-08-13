import { defineConfig, ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  // Define the base server configuration object
  const serverConfig: {
    host: string;
    allowedHosts: string[];
    proxy?: Record<string, string | ProxyOptions>;
  } = {
    host: '0.0.0.0',
    allowedHosts: ['.loca.lt'],
  };

  // Only add the proxy object if we are NOT in production
  if (!isProduction) {
    serverConfig.proxy = {
      '/api': {
        target: 'http://172.31.12.157:3000',
        changeOrigin: true,
        // The incorrect 'rewrite' line has been removed from this section.
      },
    };
  }

  const config: any = {
    // The tailwindcss() plugin specific to this project is correctly kept here
    plugins: [react(), tailwindcss()], 
    server: serverConfig,
  };

  // ✅ Put esbuild options at the top level (not under build)
  if (isProduction) {
    config.esbuild = { drop: ['console', 'debugger'] };
  }
  
  return config;
});