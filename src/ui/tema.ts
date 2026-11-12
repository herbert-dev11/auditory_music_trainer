// Tema claro / escuro (plans/007). 'sistema' segue o sistema operacional (prefers-color-scheme).

import type { RepositorioDePreferencias, Tema } from '../dados/preferencias'
import { criar } from './dom'

const PROXIMO: Record<Tema, Tema> = { sistema: 'claro', claro: 'escuro', escuro: 'sistema' }
const ROTULO: Record<Tema, string> = { sistema: 'Tema: do sistema', claro: 'Tema: claro', escuro: 'Tema: escuro' }

export function aplicarTema(tema: Tema): void {
  if (tema === 'sistema') delete document.documentElement.dataset.tema
  else document.documentElement.dataset.tema = tema
}

/** Botão que alterna sistema → claro → escuro e guarda a escolha. */
export function botaoDeTema(preferencias: RepositorioDePreferencias): HTMLButtonElement {
  let tema = preferencias.tema()
  const botao = criar('button', { type: 'button', className: 'alternar' })
  const mostrar = () => {
    botao.textContent = ROTULO[tema]
    botao.title = `Mudar para: ${ROTULO[PROXIMO[tema]].replace('Tema: ', '')}`
  }
  botao.addEventListener('click', () => {
    tema = PROXIMO[tema]
    preferencias.salvarTema(tema)
    aplicarTema(tema)
    mostrar()
  })
  mostrar()
  return botao
}
