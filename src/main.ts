// Ponto de entrada do app: monta as dependências e abre a tela pedida na URL (plans/009).
import './estilo.css'
import { TocadorDeAmostras } from './audio/tocadorDeAmostras'
import { PreferenciasLocais } from './dados/preferencias'
import { NarradorDoNavegador } from './fala/narrador'
import { iniciarRotas } from './ui/rotas'
import { aplicarTema } from './ui/tema'

const preferencias = new PreferenciasLocais()
aplicarTema(preferencias.tema()) // antes de desenhar, para não piscar no tema errado

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  iniciarRotas(app, {
    tocadores: { violao: new TocadorDeAmostras('violao'), piano: new TocadorDeAmostras('piano') },
    narrador: new NarradorDoNavegador(),
    preferencias,
  })
}
