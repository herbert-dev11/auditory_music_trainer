// Roteiro da demonstração "nota por nota": cada nota do voicing soa sozinha, uma de cada vez,
// e depois o acorde inteiro (plans/006-demonstracao-nota-por-nota.md).
// O roteiro fala em índices do voicing; a tela usa os mesmos índices para acender a corda ou a tecla.

export interface Passo {
  /** Quando o passo começa, em ms desde o início da demonstração. */
  emMs: number
  /** Índices das notas do voicing que soam neste passo. */
  indices: number[]
}

export interface OpcoesDeDemonstracao {
  /** Espaço entre uma nota e a seguinte. */
  intervaloMs?: number
  /** Pausa extra entre a última nota sozinha e o acorde inteiro. */
  pausaAntesDoAcordeMs?: number
}

export function roteiroNotaPorNota(quantidade: number, opcoes: OpcoesDeDemonstracao = {}): Passo[] {
  const { intervaloMs = 450, pausaAntesDoAcordeMs = 650 } = opcoes
  if (quantidade <= 0) return []
  if (quantidade === 1) return [{ emMs: 0, indices: [0] }]

  const todos = Array.from({ length: quantidade }, (_, i) => i)
  const separadas = todos.map((i) => ({ emMs: i * intervaloMs, indices: [i] }))
  const acorde = { emMs: (quantidade - 1) * intervaloMs + pausaAntesDoAcordeMs, indices: todos }
  return [...separadas, acorde]
}

/** Só o acorde inteiro, de uma vez. */
export function roteiroDoAcorde(quantidade: number): Passo[] {
  if (quantidade <= 0) return []
  return [{ emMs: 0, indices: Array.from({ length: quantidade }, (_, i) => i) }]
}

/** Momento do último passo (0 se o roteiro for vazio). */
export const inicioDoUltimoPasso = (roteiro: readonly Passo[]) => roteiro.at(-1)?.emMs ?? 0
