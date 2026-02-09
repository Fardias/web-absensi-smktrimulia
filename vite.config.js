import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
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
