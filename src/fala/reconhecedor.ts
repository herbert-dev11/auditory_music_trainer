// Contrato do reconhecimento de fala (architecture.md, regra 2). O jogo e as telas conhecem só esta
// interface; a Web Speech API é uma implementação, e Vosk/Whisper poderiam ser outras. Testes injetam um falso.

export interface Alternativa {
  texto: string
  /** 0 a 1; alguns navegadores devolvem 0 quando não informam. */
  confianca: number
}

export type ResultadoDaEscuta =
  /** Algo foi entendido. `alternativas` pode vir vazia quando o navegador ouviu, mas não reconheceu nada. */
  | { tipo: 'fala'; alternativas: Alternativa[]; latenciaMs: number | null }
  /** Ninguém falou dentro do tempo. */
  | { tipo: 'silencio' }
  /** Erro do navegador, com o código dele (ex.: 'not-allowed', 'network', 'audio-capture'). */
  | { tipo: 'erro'; codigo: string }

export interface OpcoesDeEscuta {
  /** Quantas alternativas pedir ao navegador (padrão 5). */
  maxAlternativas?: number
  /** Tempo máximo esperando a fala, em ms (padrão 8000). */
  tempoMaximoMs?: number
}

export interface ReconhecedorDeFala {
  /** O navegador tem reconhecimento de fala? */
  readonly disponivel: boolean
  /** Abre o microfone, espera uma fala e fecha. Precisa vir de um gesto do usuário na primeira vez. */
  ouvir(opcoes?: OpcoesDeEscuta): Promise<ResultadoDaEscuta>
  /** Fecha o microfone e descarta a escuta em andamento. */
  parar(): void
}
