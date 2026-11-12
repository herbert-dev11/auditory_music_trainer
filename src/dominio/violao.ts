// Voicing de violão: como um item soa no instrumento, em notas MIDI.
// Desenho completo (padrão): formas móveis com pestana, raiz na 6ª corda (forma de mi) ou na 5ª
// (forma de lá) (plans/003). Simplificado (botão, plans/008): acordes abertos quando existem;
// senão, a versão de 4 cordas da forma com pestana.

import type { Item, Qualidade } from './itens'

/** Afinação padrão, 6ª → 1ª corda: E2 A2 D3 G3 B3 E4. */
const AFINACAO = [40, 45, 50, 55, 59, 64] as const

/** Nota isolada toca na oitava C3–B3 (C3 = MIDI 48). */
const DO_3 = 48

/** Casas de cada corda, 6ª → 1ª; null = corda não tocada. */
type Casas = readonly (number | null)[]

/** Dedo indicador deitado sobre várias cordas na mesma casa (cordas contadas de 0 = 6ª a 5 = 1ª). */
export interface Pestana {
  casa: number
  daCorda: number
  ateCorda: number
}

interface Desenho {
  casas: Casas
  pestana: Pestana | null
}

// --- Acordes abertos: os desenhos que se aprendem primeiro (conferidos nota por nota no plano 008) ---

/** 'x32010' → [null, 3, 2, 0, 1, 0]. */
const ler = (texto: string): Casas => [...texto].map((c) => (c === 'x' ? null : Number(c)))

// Usados só no modo simplificado.
// Os abertos de E e de A (E, Em, E7, Em7, E7M, A, Am, A7, Am7, A7M) não estão aqui:
// saem das formas móveis de mi e de lá na casa 0, sem pestana, nos dois modos.
// F maior também não: o simplificado (xx3211) sai da regra das 4 cordas.
const ABERTOS: Partial<Record<Qualidade, Partial<Record<number, Desenho>>>> = {
  '': {
    0: { casas: ler('x32010'), pestana: null }, // C
    2: { casas: ler('xx0232'), pestana: null }, // D
    7: { casas: ler('320003'), pestana: null }, // G
  },
  m: {
    2: { casas: ler('xx0231'), pestana: null }, // Dm
  },
  '7': {
    0: { casas: ler('x32310'), pestana: null }, // C7 (sem a quinta, como se toca)
    2: { casas: ler('xx0212'), pestana: null }, // D7
    7: { casas: ler('320001'), pestana: null }, // G7
    11: { casas: ler('x21202'), pestana: null }, // B7
  },
  m7: {
    2: { casas: ler('xx0211'), pestana: null }, // Dm7
  },
  '7M': {
    0: { casas: ler('x32000'), pestana: null }, // C7M
    2: { casas: ler('xx0222'), pestana: null }, // D7M
    5: { casas: ler('xx3210'), pestana: null }, // F7M
    7: { casas: ler('320002'), pestana: null }, // G7M
  },
}

// --- Formas móveis (pestana): casas relativas à casa da raiz ---

const FORMA_DE_MI: Record<Qualidade, Casas> = {
  '': [0, 2, 2, 1, 0, 0],
  m: [0, 2, 2, 0, 0, 0],
  '7': [0, 2, 0, 1, 0, 0],
  m7: [0, 2, 0, 0, 0, 0],
  '7M': [0, 2, 1, 1, 0, 0],
}

const FORMA_DE_LA: Record<Qualidade, Casas> = {
  '': [null, 0, 2, 2, 2, 0],
  m: [null, 0, 2, 2, 1, 0],
  '7': [null, 0, 2, 0, 2, 0],
  m7: [null, 0, 2, 0, 1, 0],
  '7M': [null, 0, 2, 1, 2, 0],
}

const CLASSE_DA_6A_CORDA = 4 // mi
const CLASSE_DA_5A_CORDA = 9 // lá

/** Casa onde a raiz cai numa corda solta de determinada classe (0–11). */
const casaDaRaiz = (raiz: number, classeDaCorda: number) => (raiz - classeDaCorda + 12) % 12

/**
 * Versão simplificada de um desenho com pestana, com 4 cordas:
 * - pestana desde a 6ª corda (forma de mi, F completo): ficam a 4ª à 1ª;
 * - pestana desde a 5ª corda (forma de lá): ficam a 5ª à 2ª (a raiz está na 5ª; sai a 1ª, onde a pestana prende).
 * Mantém raiz, terça e sétima (testado). A pestana encolhe para as cordas presas na casa dela;
 * com uma corda só, vira um dedo comum.
 */
function simplificar({ casas: completo, pestana: barra }: Desenho): Desenho {
  if (!barra) return { casas: completo, pestana: null }

  const [primeira, ultima] = barra.daCorda === 0 ? [2, 5] : [1, 4]
  const casas = completo.map((c, corda) => (corda < primeira || corda > ultima ? null : c))
  const naCasaDaBarra = casas.flatMap((c, corda) => (c === barra.casa ? [corda] : []))
  const pestana =
    naCasaDaBarra.length >= 2
      ? { casa: barra.casa, daCorda: naCasaDaBarra[0], ateCorda: naCasaDaBarra[naCasaDaBarra.length - 1] }
      : null
  return { casas, pestana }
}

function desenho(item: Item, simplificado: boolean): Desenho {
  if (item.tipo === 'nota') {
    // Nota isolada: uma corda só, a que deixa a casa mais baixa (corda solta quando dá). Igual nos dois modos.
    const midi = DO_3 + item.raiz
    const casasPossiveis = AFINACAO.map((solta) => midi - solta)
    const menor = Math.min(...casasPossiveis.filter((c) => c >= 0))
    return { casas: casasPossiveis.map((c) => (c === menor ? c : null)), pestana: null }
  }

  if (!simplificado) return formaMovel(item)
  return ABERTOS[item.qualidade]?.[item.raiz] ?? simplificar(formaMovel(item))
}

/** Forma de mi ou de lá, a de casa mais baixa. Na casa 0 vira o acorde aberto de E ou A. */
function formaMovel(item: Extract<Item, { tipo: 'acorde' }>): Desenho {
  const casaMi = casaDaRaiz(item.raiz, CLASSE_DA_6A_CORDA)
  const casaLa = casaDaRaiz(item.raiz, CLASSE_DA_5A_CORDA)
  const [forma, casa, cordaDaRaiz] = casaMi <= casaLa ? [FORMA_DE_MI, casaMi, 0] : [FORMA_DE_LA, casaLa, 1]

  return {
    casas: forma[item.qualidade].map((c) => (c === null ? null : c + casa)),
    // Na casa 0 a forma vira acorde aberto (E, A...): sem pestana.
    pestana: casa === 0 ? null : { casa, daCorda: cordaDaRaiz, ateCorda: 5 },
  }
}

/**
 * Desenho do item no braço, 6ª → 1ª corda (null = corda não tocada).
 * `simplificado` (botão "Simplificado", plano 008): acorde aberto quando existe; senão, a versão de 4 cordas.
 */
export function casas(item: Item, simplificado = false): (number | null)[] {
  return [...desenho(item, simplificado).casas]
}

/** Pestana do desenho, se houver (para o diagrama desenhar a barra). */
export function pestana(item: Item, simplificado = false): Pestana | null {
  return desenho(item, simplificado).pestana
}

/** Notas MIDI a tocar, do grave para o agudo (ordem do dedilhado). O som sai sempre do desenho. */
export function voicingDoViolao(item: Item, simplificado = false): number[] {
  return casas(item, simplificado).flatMap((casa, corda) => (casa === null ? [] : [AFINACAO[corda] + casa]))
}
