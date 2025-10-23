import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // Import the plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      globals: {
        Buffer: true, // Default: true | false. Also can be 'dev' or 'build'.
        global: true, // Default: true | false. Also can be 'dev' or 'build'.
        process: true, // Default: true | false. Some libraries check process.env
      },
      // Whether to polyfill `node:` protocol imports.
      // protocolImports: true, // Default: true | false.
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // We might not need the 'define' for global anymore if the plugin handles it,
  // but keeping it shouldn't hurt. You can experiment removing it later if needed.
  define: {
    global: 'window',
  },
})
