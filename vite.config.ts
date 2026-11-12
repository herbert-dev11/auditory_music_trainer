import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// React com Fast Refresh no desenvolvimento (plans/010).
export default defineConfig({
  plugins: [react()],
})
