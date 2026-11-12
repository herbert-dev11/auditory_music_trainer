// Tela inicial (RF01, plans/009): nome do sistema e as opções principais.

import { criar } from './dom'
import { NOME_DO_SISTEMA } from './textos'

export function montarInicio(raiz: HTMLElement): void {
  const opcao = (href: string, titulo: string, detalhe: string, principal = false) =>
    criar('li', {}, [
      criar('a', { href, className: principal ? 'cartao-menu principal' : 'cartao-menu' }, [
        criar('span', { className: 'titulo' }, [titulo]),
        criar('span', { className: 'detalhe' }, [detalhe]),
      ]),
    ])

  // Contas de usuário só com o back-end (RF23, plans/002): por enquanto, desabilitado.
  const conta = criar('li', {}, [
    criar('button', { type: 'button', className: 'cartao-menu', disabled: true }, [
      criar('span', { className: 'titulo' }, ['Entrar / Sair']),
      criar('span', { className: 'detalhe' }, ['Em breve: contas de usuário']),
    ]),
  ])

  raiz.replaceChildren(
    criar('main', { className: 'inicio' }, [
      criar('h1', { tabIndex: -1 }, [NOME_DO_SISTEMA]),
      criar('p', { className: 'subtitulo' }, [
        'Ouça uma nota ou um acorde de violão ou de piano e responda falando o nome.',
      ]),
      criar('nav', { ariaLabel: 'Menu principal' }, [
        criar('ul', { className: 'menu' }, [
          opcao('#/jogo', 'Iniciar jogo', 'Escolha o instrumento e o que treinar', true),
          opcao('#/biblioteca', 'Biblioteca de sons', 'Ouça e veja as notas e os acordes antes de jogar'),
          opcao('#/teoria', 'Teoria musical', 'Notas, acordes, sustenido e bemol'),
          conta,
        ]),
      ]),
    ]),
  )
}
