import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  },
  base: '/migros-analytics/', // Replace with your repository name
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
