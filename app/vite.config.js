import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import tailwindConfig from './tailwind.config.js'

const appDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(appDir, '..')

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Served at username.github.io/Skyclear/ in production — asset URLs need that prefix,
  // but dev stays at "/" so the local server keeps working normally.
  base: command === 'build' ? '/Skyclear/' : '/',
  // index.html lives at the repo root, not inside app/, so the dev/build
  // root is pointed one level up. See README for why.
  root: repoRoot,
  publicDir: path.resolve(appDir, 'public'),
  css: {
    postcss: {
      plugins: [tailwindcss(tailwindConfig), autoprefixer()],
    },
  },
  build: {
    outDir: path.resolve(repoRoot, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
}))
