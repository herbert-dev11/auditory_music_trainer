import { describe, expect, it } from 'vitest'
import { inicioDoUltimoPasso, roteiroDoAcorde, roteiroNotaPorNota } from './demonstracao'

describe('roteiroNotaPorNota', () => {
  it('toca cada nota sozinha e depois o acorde inteiro', () => {
    expect(roteiroNotaPorNota(3, { intervaloMs: 100, pausaAntesDoAcordeMs: 50 })).toEqual([
      { emMs: 0, indices: [0] },
      { emMs: 100, indices: [1] },
      { emMs: 200, indices: [2] },
      { emMs: 250, indices: [0, 1, 2] },
    ])
  })

  it('nota isolada é um passo só', () => {
    expect(roteiroNotaPorNota(1)).toEqual([{ emMs: 0, indices: [0] }])
  })

  it('sem notas, sem passos', () => {
    expect(roteiroNotaPorNota(0)).toEqual([])
  })

  it('usa 450 ms entre notas e 650 ms antes do acorde por padrão', () => {
    expect(inicioDoUltimoPasso(roteiroNotaPorNota(6))).toBe(5 * 450 + 650)
  })
})

describe('roteiroDoAcorde', () => {
  it('toca tudo de uma vez', () => {
    expect(roteiroDoAcorde(4)).toEqual([{ emMs: 0, indices: [0, 1, 2, 3] }])
    expect(roteiroDoAcorde(0)).toEqual([])
  })
})

describe('inicioDoUltimoPasso', () => {
  it('é 0 para roteiro vazio', () => {
    expect(inicioDoUltimoPasso([])).toBe(0)
  })
})
