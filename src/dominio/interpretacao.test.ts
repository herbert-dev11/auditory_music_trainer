import { describe, expect, it } from 'vitest'
import { interpretar, interpretarAlternativas } from './interpretacao'
import type { Item } from './itens'

// Casos do docs/nomenclatura.md, "Casos de teste".
describe('interpretar no modo nota', () => {
  it.each([
    ['dó', 0],
    ['do', 0],
    ['dor', 0],
    ['Ré bemol', 1],
    ['dó sustenido', 1],
    ['si', 11],
    ['sim', 11],
    ['fá bemol', 4],
    ['si sustenido', 0],
    ['Sol', 7],
    ['lá', 9],
    ['dó#', 1],
  ] as const)('%j → classe %i', (fala, raiz) => {
    expect(interpretar(fala, 'nota')).toEqual({ tipo: 'nota', raiz })
  })

  it('qualidade falada é ignorada no modo nota', () => {
    expect(interpretar('dó maior', 'nota')).toEqual({ tipo: 'nota', raiz: 0 })
    expect(interpretar('lá menor', 'nota')).toEqual({ tipo: 'nota', raiz: 9 })
  })

  it.each(['banana', '', 'menor', 'sustenido'])('%j → não entendi', (fala) => {
    expect(interpretar(fala, 'nota')).toBeNull()
  })
})

describe('interpretar no modo acorde', () => {
  const acorde = (raiz: Item['raiz'], qualidade: Extract<Item, { tipo: 'acorde' }>['qualidade']) => ({
    tipo: 'acorde',
    raiz,
    qualidade,
  })

  it.each([
    ['dó', acorde(0, '')], // RN03: nota sozinha = maior
    ['sol maior', acorde(7, '')],
    ['dó sustenido menor', acorde(1, 'm')],
    ['lá menor', acorde(9, 'm')],
    ['ré com sétima', acorde(2, '7')],
    ['mi bemol menor com sétima', acorde(3, 'm7')],
    ['fá com sétima maior', acorde(5, '7M')],
    ['ré sétima', acorde(2, '7')],
    ['ré com 7', acorde(2, '7')],
    ['Lá menor!', acorde(9, 'm')],
  ] as const)('%j → %o', (fala, esperado) => {
    expect(interpretar(fala, 'acorde')).toEqual(esperado)
  })

  it.each(['menor', 'banana', 'com sétima'])('%j → não entendi (falta a nota)', (fala) => {
    expect(interpretar(fala, 'acorde')).toBeNull()
  })

  it('palavras antes da nota são ignoradas', () => {
    expect(interpretar('é dó', 'acorde')).toEqual(acorde(0, ''))
    expect(interpretar('acho que é ré menor', 'acorde')).toEqual(acorde(2, 'm'))
  })

  it('palavras depois da qualidade são ignoradas', () => {
    expect(interpretar('lá menor né', 'acorde')).toEqual(acorde(9, 'm'))
  })

  it('palavra solta depois da nota que não é qualidade vale como maior (RN03)', () => {
    expect(interpretar('dó sim', 'acorde')).toEqual(acorde(0, ''))
  })
})

describe('interpretarAlternativas', () => {
  it('fica com a primeira alternativa que fizer sentido', () => {
    expect(interpretarAlternativas(['assim', 'sim', 'si'], 'nota')).toEqual({
      item: { tipo: 'nota', raiz: 11 },
      texto: 'sim',
    })
  })

  it('nenhuma faz sentido: não entendi', () => {
    expect(interpretarAlternativas(['banana', 'menor'], 'acorde')).toBeNull()
    expect(interpretarAlternativas([], 'nota')).toBeNull()
  })
})
