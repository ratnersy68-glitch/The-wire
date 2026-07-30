import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://<owner>.github.io/The-wire/ via GitHub Pages, so assets
// need the repo name as a base path rather than the domain root.
export default defineConfig({
  base: '/The-wire/',
  plugins: [react()],
})
