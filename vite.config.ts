import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 相对路径，兼容 GitHub Pages 子路径部署（如 /up-you-go-book/）
  base: './',
})
