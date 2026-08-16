import { copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves 404.html for any unknown path, so a copy of the built
// index.html lets client-side routes (react-router) survive a hard refresh.
function spa404(): Plugin {
  return {
    name: 'spa-404',
    apply: 'build',
    closeBundle() {
      const dist = fileURLToPath(new URL('./dist', import.meta.url))
      copyFileSync(`${dist}/index.html`, `${dist}/404.html`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/YesTyping/',
  plugins: [react(), spa404()],
})