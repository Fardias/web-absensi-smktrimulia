import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // PWA Configuration
    VitePWA({
      registerType: 'autoUpdate',
      outDir: '../api-absensi-smktrimulia/public', // Output PWA files ke Laravel public
      includeAssets: ['vite.svg', 'images/**/*', 'image/**/*'],
      manifest: {
        name: 'SISENUS - Absensi SMK Trimulia',
        short_name: 'SISENUS',
        description: 'Sistem Absensi Siswa SMK Trimulia',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        // Exclude Laravel files from service worker
        globIgnores: ['**/index.php', '**/.htaccess', '**/robots.txt'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    }),
    // Bundle analyzer - only in analyze mode
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  
  // Build optimizations
  build: {
    // Output ke folder Laravel public
    outDir: '../api-absensi-smktrimulia/public',
    emptyOutDir: false, // Jangan hapus file Laravel lainnya
    
    // Generate source maps for debugging
    sourcemap: mode === 'development',
    
    // Optimize chunks
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'ui-vendor': ['sweetalert2', 'react-hot-toast'],
          'utils-vendor': ['axios', 'jspdf', 'xlsx'],
          
          // App chunks
          'admin-pages': [
            './src/pages/admin/Rekap.jsx',
            './src/pages/admin/KelolaDataSiswa.jsx',
            './src/pages/admin/ImportSiswa.jsx',
            './src/pages/admin/Pengaturan.jsx',
          ],
          'gurket-pages': [
            './src/pages/gurket/LihatAbsensi.jsx',
            './src/pages/gurket/LihatAbsensiHariIni.jsx',
            './src/pages/gurket/SiswaIzinSakit.jsx',
          ],
          'siswa-pages': [
            './src/pages/siswa/Home.jsx',
            './src/pages/siswa/AbsenDatang.jsx',
            './src/pages/siswa/AbsenPulang.jsx',
            './src/pages/siswa/RiwayatAbsensi.jsx',
          ],
        },
      },
    },
    
    // Minification (esbuild lebih cepat dari terser)
    minify: 'esbuild',
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  
  // Development optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'chart.js',
      'react-chartjs-2',
    ],
  },
  
  // server: {
  //   https: true,
  //   host: true,
  // },
}))
