// Itens que entram no jogo a partir da seleção (UC01, RF02, RN07). Puro: sem DOM nem armazenamento.

import type { ModoDeJogo, Raiz, Selecao } from '../contratos/selecao'
import { INSTRUMENTOS } from '../dominio/instrumentos'
import { CLASSES, QUALIDADES, type Classe, type Item } from '../dominio/itens'

/** RN07: o jogo só começa com pelo menos 2 itens. */
export const MINIMO_DE_ITENS = 2

export const RAIZES: readonly Raiz[] = ['naturais', 'sustenidos']
export const MODOS: readonly ModoDeJogo[] = ['nota', 'acorde']

export const SELECAO_PADRAO: Selecao = {
  instrumento: 'violao',
  modo: 'nota',
  raizes: ['naturais'],
  qualidades: ['', 'm'],
}

const NATURAIS = new Set<Classe>([0, 2, 4, 5, 7, 9, 11])

export const raizDaClasse = (classe: Classe): Raiz => (NATURAIS.has(classe) ? 'naturais' : 'sustenidos')

/** Notas ou acordes da seleção; acordes agrupados por qualidade, na ordem da biblioteca. */
export function itensDaSelecao(selecao: Selecao): Item[] {
  const raizes = CLASSES.filter((c) => selecao.raizes.includes(raizDaClasse(c)))
  if (selecao.modo === 'nota') return raizes.map((raiz) => ({ tipo: 'nota', raiz }))

  return QUALIDADES.filter((q) => selecao.qualidades.includes(q)).flatMap((qualidade) =>
    raizes.map((raiz): Item => ({ tipo: 'acorde', raiz, qualidade })),
  )
}

export const podeComecar = (selecao: Selecao) => itensDaSelecao(selecao).length >= MINIMO_DE_ITENS

/**
 * Valida uma seleção vinda de fora (armazenamento, versão antiga do app). Devolve null se não servir.
 * Valores desconhecidos dentro das listas são descartados.
 */
export function lerSelecao(valor: unknown): Selecao | null {
  if (typeof valor !== 'object' || valor === null) return null
  const { instrumento, modo, raizes, qualidades } = valor as Record<string, unknown>

  if (!INSTRUMENTOS.includes(instrumento as never)) return null
  if (!MODOS.includes(modo as never)) return null
  if (!Array.isArray(raizes) || !Array.isArray(qualidades)) return null

  return {
    instrumento: instrumento as Selecao['instrumento'],
    modo: modo as ModoDeJogo,
    raizes: RAIZES.filter((r) => raizes.includes(r)),
    qualidades: QUALIDADES.filter((q) => qualidades.includes(q)),
  }
}
