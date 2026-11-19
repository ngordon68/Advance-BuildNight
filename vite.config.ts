import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // MapLibre GL alone is ~800 kB minified; raise the warning threshold accordingly.
  build: { chunkSizeWarningLimit: 1200 },
})
