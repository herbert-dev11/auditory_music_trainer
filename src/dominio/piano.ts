// Voicing de piano: acorde em posição fundamental fechada (raiz + intervalos empilhados).
// Decisões no plans/004-piano.md.

import { QUALIDADE, type Item } from './itens'

/** Nota isolada toca de C4 a B4 (C4 = MIDI 60), o registro central do piano. */
const DO_4 = 60

/** A raiz do acorde fica entre C3 e B3 (C3 = MIDI 48). */
const DO_3 = 48

/** Notas MIDI a tocar, do grave para o agudo. */
export function voicingDoPiano(item: Item): number[] {
  if (item.tipo === 'nota') return [DO_4 + item.raiz]

  return QUALIDADE[item.qualidade].intervalos.map((intervalo) => DO_3 + item.raiz + intervalo)
}
