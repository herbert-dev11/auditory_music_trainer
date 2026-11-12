import { describe, expect, it } from 'vitest'
import type { Item } from './itens'
import { voicing } from './instrumentos'

describe('voicing', () => {
  const doMaior: Item = { tipo: 'acorde', raiz: 0, qualidade: '' }

  it('no violão usa o desenho do violão', () => {
    expect(voicing('violao', doMaior)).toEqual([48, 55, 60, 64, 67]) // x35553
    expect(voicing('violao', doMaior, true)).toEqual([48, 52, 55, 60, 64]) // x32010, simplificado
  })

  it('no piano empilha as notas do acorde', () => {
    expect(voicing('piano', doMaior)).toEqual([48, 52, 55])
  })
})
