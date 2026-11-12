// Ponto de entrada: monta as dependências e desenha o app em React (plans/010).
import '@mantine/core/styles.css'
import './estilo.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TocadorDeAmostras } from './audio/tocadorDeAmostras'
import { PreferenciasLocais } from './dados/preferencias'
import { NarradorDoNavegador } from './fala/narrador'
import { ReconhecedorWebSpeech } from './fala/reconhecedorWebSpeech'
import { App } from './ui/App'
import { temaResolvido } from './ui/tema'

const preferencias = new PreferenciasLocais()
// Marca o tema antes do primeiro desenho, para não piscar no tema errado.
document.documentElement.setAttribute('data-mantine-color-scheme', temaResolvido(preferencias))

const deps = {
  tocadores: { violao: new TocadorDeAmostras('violao'), piano: new TocadorDeAmostras('piano') },
  narrador: new NarradorDoNavegador(),
  reconhecedor: new ReconhecedorWebSpeech(),
  preferencias,
}

const app = document.querySelector<HTMLDivElement>('#app')
if (app) {
  createRoot(app).render(
    <StrictMode>
      <App deps={deps} />
    </StrictMode>,
  )
}
