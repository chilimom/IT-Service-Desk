import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const devHost = process.env.VITE_DEV_HOST || 'localhost'
const devPort = Number(process.env.VITE_DEV_PORT || '3000')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: devHost,
    port: devPort,
  },
  preview: {
    host: devHost,
    port: devPort,
  },
})
