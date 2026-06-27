import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/petate/' porque GitHub Pages sirve el sitio en
// https://<usuario>.github.io/petate/
export default defineConfig({
  plugins: [react()],
  base: '/petate/',
  server: {
    port: 3000,
  },
})
