import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // React com Fast Refresh no desenvolvimento (plans/010).
  plugins: [react()],
  // Endereços relativos: o build funciona em https://<usuário>.github.io/auditory_music_trainer/
  // sem fixar o nome do repositório (plans/012). A navegação é por hash, então a página é sempre a mesma.
  base: './',
})
