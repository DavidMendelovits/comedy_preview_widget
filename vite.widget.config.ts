import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'widget/index.tsx'),
      name: 'ComedyWidget',
      fileName: (format) => `comedy-widget.${format}.js`,
      formats: ['iife', 'es'],
    },
    rollupOptions: {
      output: {
        assetFileNames: 'comedy-widget.[ext]',
      },
    },
    outDir: 'dist/widget',
    cssCodeSplit: false,
  },
})
