import { describe, expect, it } from 'vitest'
import { CLASSES, QUALIDADE, QUALIDADES, type Item } from './itens'
import { voicingDoPiano as voicing } from './piano'

const LA_2 = 45 // amostra mais grave copiada
const DO_6 = 84 // amostra mais aguda copiada

describe('voicingDoPiano', () => {
  it('nota isolada fica na oitava C4–B4', () => {
    expect(voicing({ tipo: 'nota', raiz: 0 })).toEqual([60])
    expect(voicing({ tipo: 'nota', raiz: 11 })).toEqual([71])
  })

  it('C toca C3 E3 G3; B7M toca B3 D#4 F#4 A#4', () => {
    expect(voicing({ tipo: 'acorde', raiz: 0, qualidade: '' })).toEqual([48, 52, 55])
    expect(voicing({ tipo: 'acorde', raiz: 11, qualidade: '7M' })).toEqual([59, 63, 66, 70])
  })

  const acordes = QUALIDADES.flatMap((qualidade) =>
    CLASSES.map((raiz): Item => ({ tipo: 'acorde', raiz, qualidade })),
  )

  it.each(acordes)('%o toca exatamente as classes do acorde, com a raiz no baixo', (item) => {
    if (item.tipo !== 'acorde') throw new Error('só acordes')
    const midis = voicing(item)
    const classesTocadas = new Set(midis.map((m) => m % 12))
    const classesDoAcorde = new Set(QUALIDADE[item.qualidade].intervalos.map((i) => (item.raiz + i) % 12))

    expect(classesTocadas).toEqual(classesDoAcorde)
    expect(midis[0] % 12).toBe(item.raiz)
    expect(Math.min(...midis)).toBe(midis[0])
    expect(Math.min(...midis)).toBeGreaterThanOrEqual(LA_2)
    expect(Math.max(...midis)).toBeLessThanOrEqual(DO_6)
  })
})
