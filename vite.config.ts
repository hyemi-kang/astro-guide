import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // relative base: works from any sub-path (GitHub Pages project sites) without knowing the repository name
  base: './',
})
