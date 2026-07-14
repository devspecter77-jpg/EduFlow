/**
 * Vite Configuration — Step 13
 * Production-optimized: code splitting, chunk optimization, compression.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ─── Development Server ─────────────────────────────────────────────────
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },

  // ─── Build Optimization ─────────────────────────────────────────────────
  build: {
    // Target modern browsers
    target: 'es2020',
    // Increase chunk warning limit
    chunkSizeWarningLimit: 1000,
    // Source maps only in development
    sourcemap: mode === 'development',
    // Minification
    minify: 'esbuild',

    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-forms';
            }
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'vendor-ui';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('date-fns') || id.includes('react-day-picker')) {
              return 'vendor-date';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            if (id.includes('xlsx') || id.includes('jspdf')) {
              return 'vendor-export';
            }
          }
        },
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? '';
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|ttf|eot)$/.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },

  // ─── Dependency Pre-bundling ─────────────────────────────────────────────
  optimizeDeps: {
    include: [
      'axios',
      'react',
      'react-dom',
      'react-router-dom',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'date-fns',
      'react-day-picker',
    ],
  },

  // ─── Environment Variables ──────────────────────────────────────────────
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
}));
