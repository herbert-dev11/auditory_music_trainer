// Tela da biblioteca de sons (UC03, RF16): todas as notas e acordes, com
// abas Violão / Piano (RF22, plano 004), anúncio do nome por voz (RF25, plano 005),
// desenho do item com demonstração nota por nota (RF26, plano 006) e tema (plano 007).

import type { Tocador } from '../audio/tocador'
import type { RepositorioDePreferencias } from '../dados/preferencias'
import { inicioDoUltimoPasso, roteiroDoAcorde, roteiroNotaPorNota, type Passo } from '../dominio/demonstracao'
import { INSTRUMENTOS, NOME_DO_INSTRUMENTO, voicing, type Instrumento } from '../dominio/instrumentos'
import { cifra, nomeFalado, QUALIDADES, todosOsItens, type Item } from '../dominio/itens'
import { casas, pestana } from '../dominio/violao'
import type { Narrador } from '../fala/narrador'
import { diagramaDoPiano, diagramaDoViolao, type Diagrama } from './diagramas'
import { criar } from './dom'
import { TITULO_DO_GRUPO } from './textos'

/** Dependências do app, injetadas pelo main.ts em todas as telas. */
export interface DependenciasDoApp {
  tocadores: Record<Instrumento, Tocador>
  narrador: Narrador
  preferencias: RepositorioDePreferencias
}

/** O nome é dito logo depois que o som acaba, para a voz não cobrir a nota (plano 005). */
const FOLGA_DA_VOZ_MS = 250

/** Monta a tela; devolve a função que a desmonta (cancela demonstração e voz ao sair). */
export function montarBiblioteca(raiz: HTMLElement, deps: DependenciasDoApp): () => void {
  const { tocadores, narrador, preferencias } = deps
  const itens = todosOsItens()
  const botoesDosItens: HTMLButtonElement[] = []
  const carregados = new Set<Instrumento>()
  let ativo: Instrumento = 'violao'
  let anunciar = preferencias.anunciarNomes()
  let simplificado = preferencias.simplificado()
  let selecionado: Item | null = null
  let diagrama: Diagrama | null = null
  let agendados: ReturnType<typeof setTimeout>[] = []

  const status = criar('p', { className: 'status', role: 'status' })
  const tentarDeNovo = criar('button', { type: 'button', className: 'secundario', hidden: true }, [
    'Tentar de novo',
  ])

  // --- Agenda da demonstração (cancelada a cada clique novo) ---
  const agendar = (emMs: number, acao: () => void) => agendados.push(setTimeout(acao, emMs))
  const cancelar = () => {
    agendados.forEach(clearTimeout)
    agendados = []
    narrador.calar()
    acender([])
  }
  const acender = (indices: readonly number[]) => {
    diagrama?.elementos.forEach((el, i) => el?.classList.toggle('ativo', indices.includes(i)))
  }

  // --- Voz (RF25) ---
  const botaoDaVoz = criar('button', { type: 'button', className: 'alternar' })
  const mostrarVoz = () => {
    botaoDaVoz.setAttribute('aria-pressed', String(anunciar))
    botaoDaVoz.textContent = anunciar ? 'Anunciar nomes: ligado' : 'Anunciar nomes: desligado'
  }
  botaoDaVoz.addEventListener('click', () => {
    anunciar = !anunciar
    preferencias.salvarAnunciarNomes(anunciar)
    if (!anunciar) narrador.calar()
    mostrarVoz()
  })
  mostrarVoz()

  // --- Painel do item selecionado (RF26) ---
  const detalhe = criar('section', { className: 'detalhe', hidden: true, ariaLabel: 'Item selecionado' })

  const mostrarDetalhe = (item: Item) => {
    const midis = voicing(ativo, item, simplificado)
    diagrama =
      ativo === 'violao'
        ? diagramaDoViolao(casas(item, simplificado), pestana(item, simplificado))
        : diagramaDoPiano(midis)
    const ehAcorde = item.tipo === 'acorde'

    // "Simplificado" (plano 008): só no violão e só para acordes.
    const botaoSimplificado = criar('button', { type: 'button', className: 'alternar' }, [
      simplificado ? 'Simplificado: ligado' : 'Simplificado: desligado',
    ])
    botaoSimplificado.setAttribute('aria-pressed', String(simplificado))
    botaoSimplificado.title = 'Mostra a versão mais fácil do acorde, sem pestana inteira'
    botaoSimplificado.addEventListener('click', () => {
      simplificado = !simplificado
      preferencias.salvarSimplificado(simplificado)
      cancelar()
      mostrarDetalhe(item)
      // Mantém o foco no botão, que foi redesenhado (navegação por teclado).
      detalhe.querySelector<HTMLButtonElement>('[data-simplificado]')?.focus()
    })
    botaoSimplificado.dataset.simplificado = ''
    const acoes = ehAcorde ? [botaoNotaPorNota(), botaoTodas()] : [botaoTodas()]
    if (ehAcorde && ativo === 'violao') acoes.push(botaoSimplificado)

    detalhe.replaceChildren(
      criar('div', { className: 'detalhe-texto' }, [
        criar('h2', {}, [cifra(item), ' ', criar('span', { className: 'nome' }, [nomeFalado(item)])]),
        criar('p', { className: 'descricao' }, [diagrama.descricao]),
        criar('div', { className: 'acoes' }, acoes),
      ]),
      diagrama.svg,
    )
    detalhe.hidden = false

    function botaoNotaPorNota() {
      const botao = criar('button', { type: 'button', className: 'secundario' }, ['Nota por nota'])
      botao.addEventListener('click', () => demonstrar(item, 'nota-por-nota'))
      return botao
    }
    function botaoTodas() {
      const botao = criar('button', { type: 'button', className: 'secundario' }, [ehAcorde ? 'Acorde' : 'Tocar de novo'])
      botao.addEventListener('click', () => demonstrar(item, 'acorde'))
      return botao
    }
  }

  const demonstrar = (item: Item, modo: 'nota-por-nota' | 'acorde') => {
    cancelar()
    const instrumento = ativo
    const midis = voicing(instrumento, item, simplificado)
    const roteiro = modo === 'nota-por-nota' ? roteiroNotaPorNota(midis.length) : roteiroDoAcorde(midis.length)
    const ultimo = inicioDoUltimoPasso(roteiro)
    status.textContent = `Tocando no ${NOME_DO_INSTRUMENTO[instrumento].toLowerCase()}: ${nomeFalado(item)} (${cifra(item)})`

    const executar = async (passo: Passo) => {
      acender(passo.indices)
      try {
        const restanteMs = await tocadores[instrumento].tocar(passo.indices.map((i) => midis[i]))
        if (passo.emMs !== ultimo) return
        // Último passo: espera o som acabar para apagar o desenho e dizer o nome.
        agendar(restanteMs, () => acender([]))
        if (anunciar) agendar(restanteMs + FOLGA_DA_VOZ_MS, () => narrador.falar(nomeFalado(item)))
      } catch {
        status.textContent = 'Não foi possível tocar o som.'
      }
    }

    // O primeiro passo roda já, dentro do clique: o navegador só libera o áudio num gesto do usuário.
    roteiro.forEach((passo) => (passo.emMs === 0 ? void executar(passo) : agendar(passo.emMs, () => void executar(passo))))
  }

  const selecionar = (item: Item) => {
    selecionado = item
    cancelar()
    mostrarDetalhe(item)
    demonstrar(item, 'nota-por-nota')
  }

  // --- Itens ---
  const botaoDoItem = (item: Item) => {
    const botao = criar(
      'button',
      {
        type: 'button',
        className: 'item',
        disabled: true,
        ariaLabel: `Tocar ${cifra(item)}, ${nomeFalado(item)}`,
      },
      [criar('span', { className: 'cifra' }, [cifra(item)]), criar('span', { className: 'nome' }, [nomeFalado(item)])],
    )
    botao.addEventListener('click', () => selecionar(item))
    botoesDosItens.push(botao)
    return criar('li', {}, [botao])
  }

  const grupo = (titulo: string, doGrupo: Item[]) =>
    criar('section', {}, [criar('h2', {}, [titulo]), criar('ul', { className: 'grade' }, doGrupo.map(botaoDoItem))])

  const painel = criar('div', { id: 'painel-da-biblioteca', role: 'tabpanel' }, [
    grupo(
      'Notas',
      itens.filter((i) => i.tipo === 'nota'),
    ),
    ...QUALIDADES.map((q) =>
      grupo(
        TITULO_DO_GRUPO[q],
        itens.filter((i) => i.tipo === 'acorde' && i.qualidade === q),
      ),
    ),
  ])

  // --- Abas Violão / Piano (padrão de abas do WAI-ARIA: setas trocam de aba) ---
  const abas = INSTRUMENTOS.map((instrumento) => {
    const aba = criar('button', { type: 'button', role: 'tab', id: `aba-${instrumento}`, className: 'aba' }, [
      NOME_DO_INSTRUMENTO[instrumento],
    ])
    aba.setAttribute('aria-controls', painel.id)
    aba.addEventListener('click', () => escolher(instrumento))
    aba.addEventListener('keydown', (evento) => {
      if (evento.key !== 'ArrowRight' && evento.key !== 'ArrowLeft') return
      const passo = evento.key === 'ArrowRight' ? 1 : -1
      const proximo = INSTRUMENTOS[(INSTRUMENTOS.indexOf(instrumento) + passo + INSTRUMENTOS.length) % INSTRUMENTOS.length]
      escolher(proximo)
      document.getElementById(`aba-${proximo}`)?.focus()
    })
    return aba
  })
  const listaDeAbas = criar('div', { className: 'abas', role: 'tablist', ariaLabel: 'Instrumento' }, abas)

  const habilitarItens = (sim: boolean) => botoesDosItens.forEach((b) => (b.disabled = !sim))

  const carregar = async (instrumento: Instrumento) => {
    status.textContent = `Carregando sons de ${NOME_DO_INSTRUMENTO[instrumento].toLowerCase()}...`
    tentarDeNovo.hidden = true
    habilitarItens(false)
    try {
      await tocadores[instrumento].carregar()
      carregados.add(instrumento)
      if (instrumento !== ativo) return // o usuário trocou de aba enquanto carregava
      status.textContent = 'Sons prontos. Clique num item para ver e ouvir.'
      habilitarItens(true)
    } catch {
      if (instrumento !== ativo) return
      status.textContent = 'Não foi possível carregar os sons. Confira a conexão.'
      tentarDeNovo.hidden = false
    }
  }

  function escolher(instrumento: Instrumento) {
    cancelar()
    ativo = instrumento
    abas.forEach((aba, i) => {
      const selecionada = INSTRUMENTOS[i] === instrumento
      aba.setAttribute('aria-selected', String(selecionada))
      aba.tabIndex = selecionada ? 0 : -1
    })
    painel.setAttribute('aria-labelledby', `aba-${instrumento}`)
    if (selecionado) mostrarDetalhe(selecionado) // mesmo item, desenho do outro instrumento

    if (carregados.has(instrumento)) {
      tentarDeNovo.hidden = true
      status.textContent = `${NOME_DO_INSTRUMENTO[instrumento]} pronto. Clique num item para ver e ouvir.`
      habilitarItens(true)
    } else {
      void carregar(instrumento)
    }
  }

  tentarDeNovo.addEventListener('click', () => carregar(ativo))

  raiz.replaceChildren(
    criar('main', {}, [
      criar('h1', { tabIndex: -1 }, ['Biblioteca de sons']),
      criar('p', {}, ['Ouça as notas e os acordes antes de jogar. Clique num item para ver o desenho e ouvir nota por nota.']),
      criar('div', { className: 'controles' }, [listaDeAbas, botaoDaVoz]),
      status,
      tentarDeNovo,
      detalhe,
      painel,
      rodapeDeCreditos(),
    ]),
  )

  escolher(ativo)
  return cancelar
}

/** Crédito obrigatório dos sons (CC BY, RNF05). Texto em CREDITS.md. */
function rodapeDeCreditos(): HTMLElement {
  const link = (href: string, texto: string) => criar('a', { href, target: '_blank', rel: 'noopener' }, [texto])
  const ccBy = () => link('https://creativecommons.org/licenses/by/3.0/', 'CC BY 3.0')
  return criar('footer', {}, [
    criar('p', {}, [
      'Violão nylon: "ClassicalGuitar-multisampled", de ',
      link('https://freesound.org/people/quartertone/packs/11573/', 'quartertone (Freesound)'),
      ', licença ',
      ccBy(),
      '. Reempacotado por Nicholaus P. Brosowsky em ',
      link('https://github.com/nbrosowsky/tonejs-instruments', 'tonejs-instruments'),
      '.',
    ]),
    criar('p', {}, [
      'Piano: ',
      link('https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html', 'Salamander Grand Piano'),
      ', de Alexander Holm, licença ',
      ccBy(),
      '. Versão em mp3 do projeto ',
      link('https://github.com/Tonejs/audio', 'Tone.js audio'),
      '.',
    ]),
  ])
}
