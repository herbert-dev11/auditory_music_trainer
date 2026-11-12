// Contrato da seleção do jogo (UC01). Definido uma vez; o back-end futuro reusa (plans/002, plans/009).

import type { Instrumento } from '../dominio/instrumentos'
import type { Qualidade } from '../dominio/itens'

export type ModoDeJogo = 'nota' | 'acorde'

/** Naturais: C D E F G A B. Sustenidos: C# D# F# G# A#. */
export type Raiz = 'naturais' | 'sustenidos'

export interface Selecao {
  instrumento: Instrumento
  modo: ModoDeJogo
  raizes: Raiz[]
  /** Só vale no modo 'acorde'. */
  qualidades: Qualidade[]
}
