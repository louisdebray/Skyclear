import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import tailwindConfig from './tailwind.config.js'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Served at username.github.io/Skyclear/ in production — asset URLs need that prefix,
  // but dev stays at "/" so the local server keeps working normally.
  base: command === 'build' ? '/Skyclear/' : '/',
  css: {
    postcss: {
      plugins: [tailwindcss(tailwindConfig), autoprefixer()],
    },
  },
  server: {
    port: 5173,
  },
}))
