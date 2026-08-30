import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/coffee/',
  server: {
    // Local dev against the docker compose api container (or `node server/src/index.js`)
    proxy: {
      '/api': 'http://localhost:3001',
      '/realtime': { target: 'ws://localhost:3001', ws: true },
    },
  },
})
