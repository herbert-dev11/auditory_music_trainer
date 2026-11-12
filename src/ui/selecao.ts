// Tela "Novo jogo": seleção do que treinar (UC01, RF02, RN07, plans/009).

import type { Selecao } from '../contratos/selecao'
import { INSTRUMENTOS, NOME_DO_INSTRUMENTO } from '../dominio/instrumentos'
import { cifra, nomeFalado, QUALIDADES } from '../dominio/itens'
import { itensDaSelecao, MINIMO_DE_ITENS, podeComecar, RAIZES, SELECAO_PADRAO } from '../exercicio/selecao'
import type { DependenciasDoApp } from './biblioteca'
import { criar } from './dom'
import { NOME_DA_RAIZ, TITULO_DO_GRUPO } from './textos'

interface Opcao<T> {
  valor: T
  titulo: string
  detalhe?: string
}

export function montarSelecao(raiz: HTMLElement, { preferencias }: DependenciasDoApp): void {
  let selecao: Selecao = structuredClone(preferencias.ultimaSelecao() ?? SELECAO_PADRAO)

  const resumo = criar('p', { className: 'resumo', role: 'status' })
  const listaDeItens = criar('ul', { className: 'lista-de-itens', ariaLabel: 'Itens no jogo' })
  const aviso = criar('p', { className: 'aviso' }, [`Selecione pelo menos ${MINIMO_DE_ITENS} itens.`])
  const comecar = criar('button', { type: 'button', className: 'primario' }, ['Começar'])

  // --- Grupos de opções (rádio = uma escolha; caixa = várias) ---
  let contador = 0
  const grupo = <T extends string>(
    legenda: string,
    tipo: 'radio' | 'checkbox',
    opcoes: readonly Opcao<T>[],
    marcado: (valor: T) => boolean,
    mudar: (valor: T, ligado: boolean) => void,
  ) => {
    const nome = `grupo-${contador++}`
    return criar('fieldset', {}, [
      criar('legend', {}, [legenda]),
      criar(
        'div',
        { className: 'opcoes' },
        opcoes.map(({ valor, titulo, detalhe }) => {
          const entrada = criar('input', { type: tipo, name: nome, value: valor, checked: marcado(valor) })
          entrada.addEventListener('change', () => {
            mudar(valor, entrada.checked)
            atualizar()
          })
          return criar('label', { className: 'opcao' }, [
            entrada,
            criar('span', { className: 'titulo' }, [titulo]),
            ...(detalhe ? [criar('span', { className: 'detalhe' }, [detalhe])] : []),
          ])
        }),
      ),
    ])
  }

  const alternar = <T>(lista: T[], valor: T, ligado: boolean) =>
    ligado ? [...lista.filter((v) => v !== valor), valor] : lista.filter((v) => v !== valor)

  const instrumento = grupo(
    'Instrumento',
    'radio',
    INSTRUMENTOS.map((i) => ({ valor: i, titulo: NOME_DO_INSTRUMENTO[i] })),
    (i) => selecao.instrumento === i,
    (i) => (selecao = { ...selecao, instrumento: i }),
  )

  const modo = grupo(
    'O que treinar',
    'radio',
    [
      { valor: 'nota', titulo: 'Notas', detalhe: 'Uma nota de cada vez: "dó", "ré sustenido"' },
      { valor: 'acorde', titulo: 'Acordes', detalhe: 'Várias notas juntas: "lá menor", "sol com sétima"' },
    ] as const,
    (m) => selecao.modo === m,
    (m) => (selecao = { ...selecao, modo: m }),
  )

  const raizes = grupo(
    'Notas de base',
    'checkbox',
    RAIZES.map((r) => ({ valor: r, titulo: NOME_DA_RAIZ[r].titulo, detalhe: NOME_DA_RAIZ[r].exemplo })),
    (r) => selecao.raizes.includes(r),
    (r, ligado) => (selecao = { ...selecao, raizes: alternar(selecao.raizes, r, ligado) }),
  )

  const tipos = grupo(
    'Tipos de acorde',
    'checkbox',
    QUALIDADES.map((q) => ({ valor: q, titulo: TITULO_DO_GRUPO[q] })),
    (q) => selecao.qualidades.includes(q),
    (q, ligado) => (selecao = { ...selecao, qualidades: alternar(selecao.qualidades, q, ligado) }),
  )

  function atualizar() {
    preferencias.salvarUltimaSelecao(selecao)
    tipos.hidden = selecao.modo !== 'acorde'

    const itens = itensDaSelecao(selecao)
    resumo.textContent = `${itens.length} ${itens.length === 1 ? 'item' : 'itens'} no jogo`
    listaDeItens.replaceChildren(
      ...itens.map((item) => criar('li', { title: nomeFalado(item) }, [cifra(item)])),
    )
    const pronto = podeComecar(selecao)
    aviso.hidden = pronto
    comecar.disabled = !pronto
  }

  comecar.addEventListener('click', () => {
    if (!podeComecar(selecao)) return
    preferencias.salvarUltimaSelecao(selecao)
    location.hash = '#/jogo/partida'
  })

  raiz.replaceChildren(
    criar('main', { className: 'selecao' }, [
      criar('h1', { tabIndex: -1 }, ['Novo jogo']),
      criar('p', {}, ['Escolha o instrumento e o que vai entrar no jogo.']),
      instrumento,
      modo,
      raizes,
      tipos,
      criar('section', { className: 'resultado', ariaLabel: 'Itens no jogo' }, [resumo, listaDeItens, aviso, comecar]),
    ]),
  )
  atualizar()
}
