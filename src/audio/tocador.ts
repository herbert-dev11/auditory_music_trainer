// Contrato do tocador. O jogo e as telas conhecem só esta interface,
// para os testes injetarem um falso (sem Tone.js nem Web Audio).

export interface OpcoesDeToque {
  /** Atraso entre uma corda e a seguinte, em ms (dedilhado do acorde). */
  intervaloMs?: number
  /** Quanto tempo cada nota soa, em segundos. */
  duracaoS?: number
}

export interface Tocador {
  /** Carrega as amostras. Se já carregou, resolve na hora; depois de uma falha, tenta de novo. */
  carregar(): Promise<void>
  /**
   * Toca as notas MIDI na ordem dada. Precisa vir de um gesto do usuário (clique).
   * Resolve logo que o som é agendado, com quantos ms faltam para ele acabar
   * (dedilhado + duração da nota), para a tela saber quando falar ou seguir.
   */
  tocar(midis: readonly number[], opcoes?: OpcoesDeToque): Promise<number>
}
