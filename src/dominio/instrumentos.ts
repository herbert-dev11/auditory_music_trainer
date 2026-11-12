// Instrumentos do jogo. Os itens são os mesmos nos dois; muda só como soam (plans/004-piano.md).

import type { Item } from './itens'
import { voicingDoPiano } from './piano'
import { voicingDoViolao } from './violao'

export type Instrumento = 'violao' | 'piano'

export const INSTRUMENTOS: readonly Instrumento[] = ['violao', 'piano']

export const NOME_DO_INSTRUMENTO: Record<Instrumento, string> = {
  violao: 'Violão',
  piano: 'Piano',
}

/**
 * Notas MIDI que o instrumento toca para o item, do grave para o agudo.
 * `simplificado` só muda o violão (versão de 4 cordas dos acordes com pestana, plano 008).
 */
export function voicing(instrumento: Instrumento, item: Item, simplificado = false): number[] {
  return instrumento === 'violao' ? voicingDoViolao(item, simplificado) : voicingDoPiano(item)
}
