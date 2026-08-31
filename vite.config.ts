import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production Pages builds set BASE_PATH=/gym-day/; local dev stays at /.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
})
