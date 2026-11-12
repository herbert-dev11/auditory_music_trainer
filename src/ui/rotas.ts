// Navegação por hash (plans/009): funciona no GitHub Pages e com voltar/avançar do navegador.
// Barra comum no topo; a tela anterior é desmontada; título da aba e foco acompanham a troca.

import { montarBiblioteca, type DependenciasDoApp } from './biblioteca'
import { criar } from './dom'
import { montarInicio } from './inicio'
import { montarPartida } from './partida'
import { montarSelecao } from './selecao'
import { botaoDeTema } from './tema'
import { montarTeoria } from './teoria'
import { NOME_DO_SISTEMA } from './textos'

/** Monta a tela; pode devolver uma função que a desmonta. */
type Montar = (raiz: HTMLElement, deps: DependenciasDoApp) => (() => void) | void

const INICIO = '#/'

const TELAS: Record<string, { titulo: string; montar: Montar }> = {
  [INICIO]: { titulo: NOME_DO_SISTEMA, montar: montarInicio },
  '#/biblioteca': { titulo: 'Biblioteca de sons', montar: montarBiblioteca },
  '#/jogo': { titulo: 'Novo jogo', montar: montarSelecao },
  '#/jogo/partida': { titulo: 'Partida', montar: montarPartida },
  '#/teoria': { titulo: 'Teoria musical', montar: montarTeoria },
}

export function iniciarRotas(raiz: HTMLElement, deps: DependenciasDoApp): void {
  const voltar = criar('a', { href: INICIO, className: 'voltar' }, ['← Início'])
  const barra = criar('header', { className: 'barra' }, [voltar, botaoDeTema(deps.preferencias)])
  const tela = criar('div', { className: 'tela' })
  raiz.replaceChildren(barra, tela)

  let desmontar: (() => void) | void
  let primeiraVez = true

  const mostrar = () => {
    desmontar?.()
    const hash = location.hash in TELAS ? location.hash : INICIO
    const { titulo, montar } = TELAS[hash]

    voltar.hidden = hash === INICIO
    desmontar = montar(tela, deps)
    document.title = hash === INICIO ? NOME_DO_SISTEMA : `${titulo} — ${NOME_DO_SISTEMA}`
    window.scrollTo(0, 0)
    // Na troca de tela, o foco vai para o título (leitor de tela e teclado); na abertura, não.
    if (!primeiraVez) tela.querySelector<HTMLElement>('h1')?.focus()
    primeiraVez = false
  }

  window.addEventListener('hashchange', mostrar)
  mostrar()
}
