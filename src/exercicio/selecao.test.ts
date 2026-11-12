import { describe, expect, it } from 'vitest'
import type { Selecao } from '../contratos/selecao'
import { cifra } from '../dominio/itens'
import { itensDaSelecao, lerSelecao, podeComecar, SELECAO_PADRAO } from './selecao'

const selecao = (parcial: Partial<Selecao>): Selecao => ({ ...SELECAO_PADRAO, ...parcial })
const cifras = (s: Selecao) => itensDaSelecao(s).map(cifra)

describe('itensDaSelecao', () => {
  it('notas naturais: as 7 notas sem acidente', () => {
    expect(cifras(selecao({ modo: 'nota', raizes: ['naturais'] }))).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })

  it('notas sustenidas: as 5 com sustenido', () => {
    expect(cifras(selecao({ modo: 'nota', raizes: ['sustenidos'] }))).toEqual(['C#', 'D#', 'F#', 'G#', 'A#'])
  })

  it('naturais + menores = Cm a Bm', () => {
    expect(cifras(selecao({ modo: 'acorde', raizes: ['naturais'], qualidades: ['m'] }))).toEqual([
      'Cm',
      'Dm',
      'Em',
      'Fm',
      'Gm',
      'Am',
      'Bm',
    ])
  })

  it('acordes ficam agrupados por qualidade, na ordem da biblioteca', () => {
    const itens = cifras(selecao({ modo: 'acorde', raizes: ['sustenidos'], qualidades: ['7', ''] }))
    expect(itens).toEqual(['C#', 'D#', 'F#', 'G#', 'A#', 'C#7', 'D#7', 'F#7', 'G#7', 'A#7'])
  })

  it('tudo marcado: 12 notas, ou 60 acordes', () => {
    const tudo = selecao({ raizes: ['naturais', 'sustenidos'], qualidades: ['', 'm', '7', 'm7', '7M'] })
    expect(itensDaSelecao({ ...tudo, modo: 'nota' })).toHaveLength(12)
    expect(itensDaSelecao({ ...tudo, modo: 'acorde' })).toHaveLength(60)
  })

  it('no modo nota, as qualidades são ignoradas', () => {
    expect(itensDaSelecao(selecao({ modo: 'nota', qualidades: [] }))).toHaveLength(7)
  })

  it('sem raiz ou sem tipo de acorde, nenhum item', () => {
    expect(itensDaSelecao(selecao({ raizes: [] }))).toEqual([])
    expect(itensDaSelecao(selecao({ modo: 'acorde', qualidades: [] }))).toEqual([])
  })
})

describe('podeComecar (RN07)', () => {
  it('precisa de pelo menos 2 itens', () => {
    expect(podeComecar(selecao({ modo: 'nota', raizes: ['naturais'] }))).toBe(true)
    expect(podeComecar(selecao({ raizes: [] }))).toBe(false)
    expect(podeComecar(selecao({ modo: 'acorde', qualidades: [] }))).toBe(false)
  })
})

describe('lerSelecao', () => {
  it('aceita uma seleção válida', () => {
    const valida: Selecao = { instrumento: 'piano', modo: 'acorde', raizes: ['sustenidos'], qualidades: ['m7'] }
    expect(lerSelecao(valida)).toEqual(valida)
  })

  it('descarta valores desconhecidos dentro das listas', () => {
    expect(
      lerSelecao({ instrumento: 'violao', modo: 'acorde', raizes: ['naturais', 'bemois'], qualidades: ['m', 'dim'] }),
    ).toEqual({ instrumento: 'violao', modo: 'acorde', raizes: ['naturais'], qualidades: ['m'] })
  })

  it.each([
    null,
    'texto',
    42,
    { instrumento: 'ukulele', modo: 'nota', raizes: [], qualidades: [] },
    { instrumento: 'violao', modo: 'intervalo', raizes: [], qualidades: [] },
    { instrumento: 'violao', modo: 'nota', raizes: 'naturais', qualidades: [] },
    { instrumento: 'violao', modo: 'nota', raizes: [] },
  ])('recusa %o', (valor) => {
    expect(lerSelecao(valor)).toBeNull()
  })
})
