// Tela provisória da teoria musical (RF19, plans/009): conteúdo entra num plano próprio.

import { criar } from './dom'

export function montarTeoria(raiz: HTMLElement): void {
  raiz.replaceChildren(
    criar('main', {}, [
      criar('h1', { tabIndex: -1 }, ['Teoria musical']),
      criar('p', { className: 'em-breve' }, ['Em breve. Esta parte vai explicar:']),
      criar('ul', {}, [
        criar('li', {}, ['O que é uma nota e como se chamam (dó, ré, mi...)']),
        criar('li', {}, ['Sustenido e bemol: por que dó sustenido e ré bemol são a mesma nota']),
        criar('li', {}, ['Como um acorde é formado: maior, menor, com sétima']),
        criar('li', {}, ['Progressões de acordes']),
      ]),
      criar('p', {}, [
        'Enquanto isso, a ',
        criar('a', { href: '#/biblioteca' }, ['Biblioteca de sons']),
        ' mostra o desenho e as notas de cada acorde.',
      ]),
    ]),
  )
}
