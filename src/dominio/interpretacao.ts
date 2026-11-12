// Fala → nota ou acorde (fase 5, primeira versão; plans/011, docs/nomenclatura.md).
// Normaliza, troca sinônimos, acha a primeira palavra que é nota, lê o acidente e a qualidade.
// A lista de sinônimos cresce com o CSV da página de teste da fala (plans/012).

import type { Classe, Item, Qualidade } from './itens'
import { normalizar } from './normalizacao'

const NOTAS: Record<string, number> = { do: 0, re: 2, mi: 4, fa: 5, sol: 7, la: 9, si: 11 }

/** Palavras que o reconhecimento costuma trocar, já normalizadas (sem acento). */
const SINONIMOS: Record<string, string> = {
  dor: 'do',
  sim: 'si',
  sustenida: 'sustenido',
  '7': 'setima',
}

/** Qualidades faladas; as mais longas primeiro, porque "menor com sétima" começa com "menor". */
const QUALIDADES_FALADAS: readonly [string, Qualidade][] = (
  [
    ['menor com setima', 'm7'],
    ['com setima maior', '7M'],
    ['com setima', '7'],
    ['setima', '7'],
    ['menor', 'm'],
    ['maior', ''],
  ] as [string, Qualidade][]
).sort((a, b) => b[0].length - a[0].length)

/**
 * Interpreta uma transcrição. `tipo` é o modo do jogo:
 * - 'nota': só a nota (qualidade falada é ignorada: "dó maior" vale como "dó");
 * - 'acorde': nota + qualidade; a nota sozinha vale como maior (RN03).
 * Devolve null quando não há nota ("menor", "banana"): é o "não entendi" (RN04).
 */
export function interpretar(texto: string, tipo: Item['tipo']): Item | null {
  const palavras = normalizar(texto.replace(/#/g, ' sustenido '))
    .split(' ')
    .filter(Boolean)
    .map((p) => SINONIMOS[p] ?? p)

  // Palavras antes da nota são ignoradas ("é dó", "acho que é ré").
  const inicio = palavras.findIndex((p) => p in NOTAS)
  if (inicio === -1) return null

  let classe = NOTAS[palavras[inicio]]
  let seguinte = inicio + 1
  if (palavras[seguinte] === 'sustenido') {
    classe += 1
    seguinte++
  } else if (palavras[seguinte] === 'bemol') {
    classe -= 1
    seguinte++
  }
  const raiz = (((classe % 12) + 12) % 12) as Classe

  if (tipo === 'nota') return { tipo: 'nota', raiz }

  const resto = palavras.slice(seguinte).join(' ')
  const qualidade = QUALIDADES_FALADAS.find(([falado]) => resto === falado || resto.startsWith(`${falado} `))
  return { tipo: 'acorde', raiz, qualidade: qualidade?.[1] ?? '' }
}

/** Testa todas as alternativas do reconhecimento e fica com a primeira que fizer sentido. */
export function interpretarAlternativas(
  alternativas: readonly string[],
  tipo: Item['tipo'],
): { item: Item; texto: string } | null {
  for (const texto of alternativas) {
    const item = interpretar(texto, tipo)
    if (item) return { item, texto }
  }
  return null
}
