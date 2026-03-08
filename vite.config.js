import { defineConfig, loadEnv } from 'vite' // <--- 1. Importas loadEnv
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 2. Cargamos las variables del .env según el modo (development/production)
  // process.cwd() busca el archivo en la raíz del proyecto
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 8001,
    },
  }
})