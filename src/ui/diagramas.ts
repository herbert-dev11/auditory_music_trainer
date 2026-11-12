// Desenhos do item: diagrama do braço do violão e teclado do piano (plans/006).
// Cada desenho devolve os elementos na mesma ordem do voicing, para a demonstração acender um por um.

import { nomeFalado, type Classe } from '../dominio/itens'
import type { Pestana } from '../dominio/violao'
import { criarSvg } from './dom'

export interface Diagrama {
  svg: SVGSVGElement
  /** Elemento de cada nota do voicing, na mesma ordem (corda/tecla que acende). */
  elementos: (SVGElement | undefined)[]
  /** Descrição em texto, para leitor de tela e para quem prefere ler. */
  descricao: string
}

// --- Violão: diagrama vertical, 6ª corda à esquerda, 5 casas visíveis ---

const ESQUERDA = 30
const ENTRE_CORDAS = 20
const TOPO = 34
const ENTRE_TRASTES = 24
const CASAS_VISIVEIS = 5

export function diagramaDoViolao(desenho: readonly (number | null)[], pestana: Pestana | null = null): Diagrama {
  const presas = desenho.filter((c): c is number => c !== null && c > 0)
  const maisAlta = Math.max(0, ...presas)
  const primeiraCasa = maisAlta <= CASAS_VISIVEIS ? 1 : Math.min(...presas)

  const x = (corda: number) => ESQUERDA + corda * ENTRE_CORDAS
  const largura = x(5) + ESQUERDA - 10
  const altura = TOPO + CASAS_VISIVEIS * ENTRE_TRASTES + 12
  const fundo = TOPO + CASAS_VISIVEIS * ENTRE_TRASTES

  const svg = criarSvg('svg', { viewBox: `0 0 ${largura} ${altura}`, class: 'diagrama violao', 'aria-hidden': 'true' })

  for (let t = 0; t <= CASAS_VISIVEIS; t++) {
    const y = TOPO + t * ENTRE_TRASTES
    svg.append(criarSvg('line', { x1: x(0), x2: x(5), y1: y, y2: y, class: 'traste' }))
  }
  for (let c = 0; c < 6; c++) {
    svg.append(criarSvg('line', { x1: x(c), x2: x(c), y1: TOPO, y2: fundo, class: 'corda' }))
  }
  if (primeiraCasa === 1) {
    svg.append(criarSvg('rect', { x: x(0) - 1, y: TOPO - 4, width: x(5) - x(0) + 2, height: 5, class: 'pestana-fixa' }))
  } else {
    svg.append(
      criarSvg('text', { x: 4, y: TOPO + ENTRE_TRASTES / 2 + 4, class: 'numero-da-casa' }, [`${primeiraCasa}ª`]),
    )
  }

  // Pestana: barra por trás dos pontos, da primeira à última corda que o indicador prende.
  if (pestana) {
    const y = TOPO + (pestana.casa - primeiraCasa + 0.5) * ENTRE_TRASTES
    svg.append(
      criarSvg('rect', {
        x: x(pestana.daCorda) - 7,
        y: y - 7,
        width: x(pestana.ateCorda) - x(pestana.daCorda) + 14,
        height: 14,
        rx: 7,
        class: 'pestana',
      }),
    )
  }

  const elementos: SVGElement[] = []
  desenho.forEach((casa, corda) => {
    if (casa === null) {
      svg.append(criarSvg('text', { x: x(corda), y: TOPO - 12, class: 'abafada', 'text-anchor': 'middle' }, ['×']))
      return
    }
    const marca =
      casa === 0
        ? criarSvg('circle', { cx: x(corda), cy: TOPO - 16, r: 5, class: 'solta' })
        : criarSvg('circle', {
            cx: x(corda),
            cy: TOPO + (casa - primeiraCasa + 0.5) * ENTRE_TRASTES,
            r: 7,
            class: 'ponto',
          })
    svg.append(marca)
    elementos.push(marca)
  })

  const texto = desenho.map((c) => (c === null ? 'x' : String(c))).join(' ')
  const comPestana = pestana ? `, pestana na ${pestana.casa}ª casa` : ''
  return { svg, elementos, descricao: `Violão, da 6ª para a 1ª corda: ${texto}${comPestana}` }
}

// --- Piano: duas oitavas, C3 a B4 (MIDI 48–71), que cobrem todos os itens ---

const PRIMEIRA_TECLA = 48
const ULTIMA_TECLA = 71
const LARGURA_BRANCA = 20
const ALTURA_BRANCA = 90
const LARGURA_PRETA = 12
const ALTURA_PRETA = 56
const CLASSES_PRETAS = new Set([1, 3, 6, 8, 10])

export function diagramaDoPiano(midis: readonly number[]): Diagrama {
  const marcadas = new Set(midis)
  const teclas = new Map<number, SVGRectElement>()
  const brancas: SVGRectElement[] = []
  const pretas: SVGRectElement[] = []
  let indiceDaBranca = 0

  for (let midi = PRIMEIRA_TECLA; midi <= ULTIMA_TECLA; midi++) {
    const preta = CLASSES_PRETAS.has(midi % 12)
    const classe = `${preta ? 'preta' : 'branca'}${marcadas.has(midi) ? ' marcada' : ''}`
    const tecla = preta
      ? criarSvg('rect', {
          x: indiceDaBranca * LARGURA_BRANCA - LARGURA_PRETA / 2,
          y: 0,
          width: LARGURA_PRETA,
          height: ALTURA_PRETA,
          rx: 2,
          class: classe,
        })
      : criarSvg('rect', {
          x: indiceDaBranca * LARGURA_BRANCA,
          y: 0,
          width: LARGURA_BRANCA,
          height: ALTURA_BRANCA,
          rx: 3,
          class: classe,
        })
    if (preta) pretas.push(tecla)
    else {
      brancas.push(tecla)
      indiceDaBranca++
    }
    teclas.set(midi, tecla)
  }

  const svg = criarSvg('svg', {
    viewBox: `-1 -1 ${indiceDaBranca * LARGURA_BRANCA + 2} ${ALTURA_BRANCA + 2}`,
    class: 'diagrama piano',
    'aria-hidden': 'true',
  })
  // Brancas primeiro, pretas por cima.
  svg.append(...brancas, ...pretas)

  const nomes = midis.map((m) => nomeFalado({ tipo: 'nota', raiz: (m % 12) as Classe }))
  return { svg, elementos: midis.map((m) => teclas.get(m)), descricao: `Piano, teclas: ${nomes.join(', ')}` }
}
