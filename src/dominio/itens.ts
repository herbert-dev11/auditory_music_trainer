// Itens do jogo (notas e acordes), cifras e nomes falados.
// Princípio do docs/nomenclatura.md: gerar, não cadastrar. Um acorde é raiz + qualidade.

/** Classe de altura: 0 = dó ... 11 = si, ignorando a oitava (RN01). */
export type Classe = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

/** Sufixo da cifra: '' = maior. */
export type Qualidade = '' | 'm' | '7' | 'm7' | '7M'

export type Item =
  | { tipo: 'nota'; raiz: Classe }
  | { tipo: 'acorde'; raiz: Classe; qualidade: Qualidade }

export const CLASSES: readonly Classe[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export const QUALIDADES: readonly Qualidade[] = ['', 'm', '7', 'm7', '7M']

// Cifra canônica com sustenido (C#, nunca Db), como no plano 002.
const CIFRA_DA_CLASSE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

const NOME_DA_CLASSE = [
  'dó',
  'dó sustenido',
  'ré',
  'ré sustenido',
  'mi',
  'fá',
  'fá sustenido',
  'sol',
  'sol sustenido',
  'lá',
  'lá sustenido',
  'si',
] as const

/** Tabela única de qualidades: o nome serve para reconhecer, os intervalos para tocar. */
export const QUALIDADE: Record<Qualidade, { falado: string; intervalos: readonly number[] }> = {
  '': { falado: 'maior', intervalos: [0, 4, 7] },
  m: { falado: 'menor', intervalos: [0, 3, 7] },
  '7': { falado: 'com sétima', intervalos: [0, 4, 7, 10] },
  m7: { falado: 'menor com sétima', intervalos: [0, 3, 7, 10] },
  '7M': { falado: 'com sétima maior', intervalos: [0, 4, 7, 11] },
}

export function cifra(item: Item): string {
  const raiz = CIFRA_DA_CLASSE[item.raiz]
  return item.tipo === 'nota' ? raiz : raiz + item.qualidade
}

export function nomeFalado(item: Item): string {
  const raiz = NOME_DA_CLASSE[item.raiz]
  return item.tipo === 'nota' ? raiz : `${raiz} ${QUALIDADE[item.qualidade].falado}`
}

/**
 * Mesmo item? Compara pela classe de altura (RN01: "ré bemol" e "dó sustenido" são iguais) e pela qualidade.
 * A classe já é um número 0–11, então a enarmonia sai de graça.
 */
export function mesmoItem(a: Item, b: Item): boolean {
  if (a.tipo !== b.tipo || a.raiz !== b.raiz) return false
  return a.tipo === 'nota' || (b.tipo === 'acorde' && a.qualidade === b.qualidade)
}

/** As 12 notas, depois os acordes agrupados por qualidade. */
export function todosOsItens(): Item[] {
  const notas: Item[] = CLASSES.map((raiz) => ({ tipo: 'nota', raiz }))
  const acordes: Item[] = QUALIDADES.flatMap((qualidade) =>
    CLASSES.map((raiz): Item => ({ tipo: 'acorde', raiz, qualidade })),
  )
  return [...notas, ...acordes]
}
