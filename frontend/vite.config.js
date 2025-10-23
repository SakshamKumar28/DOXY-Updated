import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import nodeStdlibBrowser from 'node-stdlib-browser' // Import the library itself

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      // Keep your project alias
      "@": path.resolve(__dirname, "./src"),
      // Add explicit aliases for Node built-ins simple-peer might use
      // Map them to the browser-friendly versions from node-stdlib-browser
      ...nodeStdlibBrowser,
      // You might need to add specific aliases if the error persists for certain modules
      // e.g., 'stream': 'stream-browserify',
      //       'process': 'process/browser', // Already handled by nodePolyfills?
      //       'buffer': 'buffer/',          // Already handled by nodePolyfills?
    },
  },
  // Ensure 'esnext' target for modern features like import.meta
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    esbuildOptions: {
      // Define global specifically for esbuild optimization if needed
      // define: {
      //   global: 'globalThis',
      // },
      target: 'esnext' // Apply target to optimized dependencies
    },
    // Explicitly include simple-peer if Vite has trouble finding it
    include: ['simple-peer'],
  },
})

