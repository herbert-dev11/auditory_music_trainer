// Desenhos do item: braço do violão e teclado do piano (plans/006, plans/008, plans/010).
// `acesos` são índices do voicing: a demonstração acende a corda ou a tecla que está soando.

import type { ReactElement } from 'react'
import { nomeFalado, type Classe } from '../dominio/itens'
import type { Pestana } from '../dominio/violao'

const classe = (base: string, aceso: boolean) => (aceso ? `${base} ativo` : base)

// --- Violão: diagrama vertical, 6ª corda à esquerda, 5 casas visíveis ---

const ESQUERDA = 30
const ENTRE_CORDAS = 20
const TOPO = 34
const ENTRE_TRASTES = 24
const CASAS_VISIVEIS = 5
const x = (corda: number) => ESQUERDA + corda * ENTRE_CORDAS

interface PropsDoViolao {
  casas: readonly (number | null)[]
  pestana: Pestana | null
  acesos: readonly number[]
}

export function DiagramaDoViolao({ casas, pestana, acesos }: PropsDoViolao) {
  const presas = casas.filter((c): c is number => c !== null && c > 0)
  const primeiraCasa = Math.max(0, ...presas) <= CASAS_VISIVEIS ? 1 : Math.min(...presas)
  const yDaCasa = (casa: number) => TOPO + (casa - primeiraCasa + 0.5) * ENTRE_TRASTES
  const fundo = TOPO + CASAS_VISIVEIS * ENTRE_TRASTES

  // Índice no voicing de cada corda tocada (as cordas null não entram no voicing).
  let indice = 0
  const marcas = casas.map((casa, corda) => {
    if (casa === null) {
      return (
        <text key={corda} x={x(corda)} y={TOPO - 12} className="abafada" textAnchor="middle">
          ×
        </text>
      )
    }
    const aceso = acesos.includes(indice++)
    return casa === 0 ? (
      <circle key={corda} cx={x(corda)} cy={TOPO - 16} r={5} className={classe('solta', aceso)} />
    ) : (
      <circle key={corda} cx={x(corda)} cy={yDaCasa(casa)} r={7} className={classe('ponto', aceso)} />
    )
  })

  return (
    <svg viewBox={`0 0 ${x(5) + ESQUERDA - 10} ${fundo + 12}`} className="diagrama violao" aria-hidden="true">
      {Array.from({ length: CASAS_VISIVEIS + 1 }, (_, t) => (
        <line key={`t${t}`} x1={x(0)} x2={x(5)} y1={TOPO + t * ENTRE_TRASTES} y2={TOPO + t * ENTRE_TRASTES} className="traste" />
      ))}
      {Array.from({ length: 6 }, (_, c) => (
        <line key={`c${c}`} x1={x(c)} x2={x(c)} y1={TOPO} y2={fundo} className="corda" />
      ))}
      {primeiraCasa === 1 ? (
        <rect x={x(0) - 1} y={TOPO - 4} width={x(5) - x(0) + 2} height={5} className="pestana-fixa" />
      ) : (
        <text x={4} y={TOPO + ENTRE_TRASTES / 2 + 4} className="numero-da-casa">
          {primeiraCasa}ª
        </text>
      )}
      {pestana && (
        <rect
          x={x(pestana.daCorda) - 7}
          y={yDaCasa(pestana.casa) - 7}
          width={x(pestana.ateCorda) - x(pestana.daCorda) + 14}
          height={14}
          rx={7}
          className="pestana"
        />
      )}
      {marcas}
    </svg>
  )
}

export function descricaoDoViolao(casas: readonly (number | null)[], pestana: Pestana | null): string {
  const texto = casas.map((c) => (c === null ? 'x' : String(c))).join(' ')
  return `Violão, da 6ª para a 1ª corda: ${texto}${pestana ? `, pestana na ${pestana.casa}ª casa` : ''}`
}

// --- Piano: duas oitavas, C3 a B4 (MIDI 48–71), que cobrem todos os itens ---

const PRIMEIRA_TECLA = 48
const ULTIMA_TECLA = 71
const LARGURA_BRANCA = 20
const ALTURA_BRANCA = 90
const LARGURA_PRETA = 12
const ALTURA_PRETA = 56
const CLASSES_PRETAS = new Set([1, 3, 6, 8, 10])

interface PropsDoPiano {
  midis: readonly number[]
  acesos: readonly number[]
}

export function DiagramaDoPiano({ midis, acesos }: PropsDoPiano) {
  const midisAcesos = new Set(acesos.map((i) => midis[i]))
  const brancas: ReactElement[] = []
  const pretas: ReactElement[] = []
  let indiceDaBranca = 0

  for (let midi = PRIMEIRA_TECLA; midi <= ULTIMA_TECLA; midi++) {
    const preta = CLASSES_PRETAS.has(midi % 12)
    const nome = `${preta ? 'preta' : 'branca'}${midis.includes(midi) ? ' marcada' : ''}`
    const className = classe(nome, midisAcesos.has(midi))
    if (preta) {
      pretas.push(
        <rect key={midi} x={indiceDaBranca * LARGURA_BRANCA - LARGURA_PRETA / 2} y={0} width={LARGURA_PRETA} height={ALTURA_PRETA} rx={2} className={className} />,
      )
    } else {
      brancas.push(
        <rect key={midi} x={indiceDaBranca * LARGURA_BRANCA} y={0} width={LARGURA_BRANCA} height={ALTURA_BRANCA} rx={3} className={className} />,
      )
      indiceDaBranca++
    }
  }

  return (
    <svg viewBox={`-1 -1 ${indiceDaBranca * LARGURA_BRANCA + 2} ${ALTURA_BRANCA + 2}`} className="diagrama piano" aria-hidden="true">
      {brancas}
      {pretas}
    </svg>
  )
}

export function descricaoDoPiano(midis: readonly number[]): string {
  const nomes = midis.map((m) => nomeFalado({ tipo: 'nota', raiz: (m % 12) as Classe }))
  return `Piano, teclas: ${nomes.join(', ')}`
}
