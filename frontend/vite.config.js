import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Reuse the repository-root certificate documented in backend/README.md.
// Vite stays on HTTP when the local certificate pair has not been created.
const httpsKeyPath = fileURLToPath(new URL('../backend-local.key', import.meta.url))
const httpsCertPath = fileURLToPath(new URL('../backend-local.crt', import.meta.url))
const localHttpsEnabled = existsSync(httpsKeyPath) && existsSync(httpsCertPath)
const localHttpsOptions = localHttpsEnabled
  ? {
      key: readFileSync(httpsKeyPath),
      cert: readFileSync(httpsCertPath),
    }
  : undefined
const apiTarget = process.env.VITE_API_TARGET || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to the LAN only in HTTPS mode so a phone can load this secure page.
    host: localHttpsEnabled ? '0.0.0.0' : undefined,
    https: localHttpsOptions,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        // Keep TLS verification enabled by default; local self-signed backend
        // certificates can opt out with VITE_API_TLS_INSECURE=true.
        secure: process.env.VITE_API_TLS_INSECURE !== 'true',
      },
    },
  },
})
