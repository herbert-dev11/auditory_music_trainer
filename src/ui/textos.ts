// Textos de interface usados em mais de uma tela.

import type { Raiz } from '../contratos/selecao'
import type { Qualidade } from '../dominio/itens'

export const NOME_DO_SISTEMA = 'Treinador Musical Auditivo'

/** Nome do grupo de acordes de cada qualidade (biblioteca e seleção). */
export const TITULO_DO_GRUPO: Record<Qualidade, string> = {
  '': 'Acordes maiores',
  m: 'Acordes menores',
  '7': 'Acordes com sétima',
  m7: 'Acordes menores com sétima',
  '7M': 'Acordes com sétima maior',
}

export const NOME_DA_RAIZ: Record<Raiz, { titulo: string; exemplo: string }> = {
  naturais: { titulo: 'Naturais', exemplo: 'C D E F G A B' },
  sustenidos: { titulo: 'Sustenidos', exemplo: 'C# D# F# G# A#' },
}
