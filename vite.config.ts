import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(() => ({
  // Vite plugins
  plugins: [tailwindcss()],

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/factories': resolve(__dirname, 'src/factories'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/i18n': resolve(__dirname, 'src/i18n'),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : true,
    watch: {
      // 3. tell vite to ignore watching
      ignored: [
        '**/src-tauri/**',
        '**/.yoyo/**',
        '**/examples/**',
        '**/PRPs/**',
        '**/scripts/**',
        '**/design/**',
        '**/docs/**',
        '**/.dev/**',
      ],
    },
  },

  // Build configuration
  build: {
    target: 'es2020',
    minify: 'esbuild' as const,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          tauri: ['@tauri-apps/api'],
          vendor: ['roughjs'],
        },
      },
    },
    // Optimize for production
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // CSS configuration
  css: {
    devSourcemap: true,
  },
}));
