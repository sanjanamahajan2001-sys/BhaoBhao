import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // dev port (npm run dev) - different from app port
    host: true, // allow external access
    cors: true, // Enable CORS for proxy requests
  },
  preview: {
    port: 2173, // preview port (npm run preview) - production
    host: true, // allow external access
    allowedHosts: ['app.bhaobhao.in'], // allow domain access
  },
})
