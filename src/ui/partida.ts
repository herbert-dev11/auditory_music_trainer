// Tela provisória da partida (plans/009): mostra a seleção; o jogo entra na fase 3.

import { NOME_DO_INSTRUMENTO } from '../dominio/instrumentos'
import { cifra } from '../dominio/itens'
import { itensDaSelecao, podeComecar } from '../exercicio/selecao'
import type { DependenciasDoApp } from './biblioteca'
import { criar } from './dom'

export function montarPartida(raiz: HTMLElement, { preferencias }: DependenciasDoApp): void {
  const selecao = preferencias.ultimaSelecao()
  const mudar = criar('a', { href: '#/jogo', className: 'secundario' }, ['Mudar a seleção'])

  if (!selecao || !podeComecar(selecao)) {
    raiz.replaceChildren(
      criar('main', {}, [
        criar('h1', { tabIndex: -1 }, ['Partida']),
        criar('p', {}, ['Nenhuma seleção válida. Escolha pelo menos 2 itens para jogar.']),
        mudar,
      ]),
    )
    return
  }

  const itens = itensDaSelecao(selecao)
  raiz.replaceChildren(
    criar('main', {}, [
      criar('h1', { tabIndex: -1 }, ['Partida']),
      criar('p', { className: 'em-breve' }, [
        'O jogo está em construção e entra na próxima fase. Sua seleção já está guardada:',
      ]),
      criar('p', {}, [
        `${NOME_DO_INSTRUMENTO[selecao.instrumento]}, ${selecao.modo === 'nota' ? 'notas' : 'acordes'}, ${itens.length} itens:`,
      ]),
      criar('ul', { className: 'lista-de-itens' }, itens.map((item) => criar('li', {}, [cifra(item)]))),
      criar('div', { className: 'acoes' }, [mudar, criar('a', { href: '#/biblioteca', className: 'secundario' }, ['Treinar na biblioteca'])]),
    ]),
  )
}
