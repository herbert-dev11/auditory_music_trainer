import { describe, expect, it } from 'vitest'
import { CLASSES, QUALIDADE, QUALIDADES, type Item } from './itens'
import { casas, pestana, voicingDoViolao as voicing } from './violao'

// Desenho no formato usual (6ª → 1ª corda), ex.: 'x02210'. Nenhuma casa passa de 9 aqui.
const desenho = (item: Item, simplificado = false) =>
  casas(item, simplificado)
    .map((c) => (c === null ? 'x' : String(c)))
    .join('')

const acorde = (raiz: Item['raiz'], qualidade: Extract<Item, { tipo: 'acorde' }>['qualidade']): Item => ({
  tipo: 'acorde',
  raiz,
  qualidade,
})

const acordes = QUALIDADES.flatMap((qualidade) => CLASSES.map((raiz) => acorde(raiz, qualidade)))

const MI_GRAVE = 40 // E2, a corda mais grave do violão
const LA_SUSTENIDO_AGUDO = 82 // A#5, a amostra mais aguda

describe('desenho completo (padrão): formas com pestana', () => {
  it.each([
    [acorde(7, ''), '355433'], // G, forma de mi
    [acorde(6, ''), '244322'], // F#, forma de mi
    [acorde(5, ''), '133211'], // F, forma de mi
    [acorde(0, ''), 'x35553'], // C, forma de lá
    [acorde(2, ''), 'x57775'], // D, forma de lá
    [acorde(1, 'm'), 'x46654'], // C#m, forma de lá
    [acorde(0, '7'), 'x35353'], // C7, forma de lá
    // Na casa 0, as formas viram os abertos de E e de A
    [acorde(9, 'm'), 'x02210'], // Am
    [acorde(4, 'm'), '022000'], // Em
    [acorde(4, '7M'), '021100'], // E7M
    [acorde(9, '7'), 'x02020'], // A7
  ] as const)('%o → %s', (item, esperado) => {
    expect(desenho(item)).toBe(esperado)
  })

  it.each(acordes)('%o toca exatamente as classes do acorde, com a raiz no baixo', (item) => {
    if (item.tipo !== 'acorde') throw new Error('só acordes')
    const midis = voicing(item)
    const tocadas = new Set(midis.map((m) => m % 12))
    const doAcorde = new Set(QUALIDADE[item.qualidade].intervalos.map((i) => (item.raiz + i) % 12))

    expect(tocadas).toEqual(doAcorde)
    expect(midis[0] % 12).toBe(item.raiz)
    expect(Math.min(...midis)).toBe(midis[0])
    expect(Math.min(...midis)).toBeGreaterThanOrEqual(MI_GRAVE)
    expect(Math.max(...midis)).toBeLessThanOrEqual(LA_SUSTENIDO_AGUDO)
  })

  it('C toca C3 G3 C4 E4 G4, do grave para o agudo', () => {
    expect(voicing(acorde(0, ''))).toEqual([48, 55, 60, 64, 67])
  })
})

describe('desenho simplificado: abertos quando existem, senão 4 cordas', () => {
  it.each([
    // Acordes abertos
    [acorde(0, ''), 'x32010'], // C
    [acorde(2, ''), 'xx0232'], // D
    [acorde(7, ''), '320003'], // G
    [acorde(2, 'm'), 'xx0231'], // Dm
    [acorde(0, '7'), 'x32310'], // C7 (sem a quinta, como se toca)
    [acorde(11, '7'), 'x21202'], // B7
    [acorde(0, '7M'), 'x32000'], // C7M
    [acorde(5, '7M'), 'xx3210'], // F7M
    // Sem forma aberta: versão de 4 cordas da forma com pestana
    [acorde(5, ''), 'xx3211'], // F (forma de mi: 4ª à 1ª corda)
    [acorde(6, ''), 'xx4322'], // F#
    [acorde(5, 'm'), 'xx3111'], // Fm
    [acorde(11, 'm'), 'x2443x'], // Bm sem pestana (forma de lá: 5ª à 2ª corda)
    [acorde(1, '7'), 'x4646x'], // C#7
  ] as const)('%o → %s', (item, esperado) => {
    expect(desenho(item, true)).toBe(esperado)
  })

  it('abertos de E e de A e notas isoladas são iguais nos dois modos', () => {
    for (const item of [acorde(4, ''), acorde(4, 'm'), acorde(9, ''), acorde(9, '7'), { tipo: 'nota', raiz: 0 } as Item]) {
      expect(desenho(item, true)).toBe(desenho(item))
    }
  })

  it.each(acordes)('%o simplificado toca só notas do acorde, com raiz, terça e sétima', (item) => {
    if (item.tipo !== 'acorde') throw new Error('só acordes')
    const midis = voicing(item, true)
    const tocadas = new Set(midis.map((m) => m % 12))
    const doAcorde = QUALIDADE[item.qualidade].intervalos.map((i) => (item.raiz + i) % 12)
    const quinta = (item.raiz + 7) % 12

    expect([...tocadas].every((c) => doAcorde.includes(c))).toBe(true)
    expect(doAcorde.filter((c) => c !== quinta).every((c) => tocadas.has(c))).toBe(true) // a quinta pode faltar
    expect(Math.min(...midis)).toBeGreaterThanOrEqual(MI_GRAVE)
    expect(Math.max(...midis)).toBeLessThanOrEqual(LA_SUSTENIDO_AGUDO)
  })
})

describe('nota isolada', () => {
  it.each([
    [0, 'x3xxxx'], // C3: 5ª corda, casa 3
    [2, 'xx0xxx'], // D3: corda ré solta
    [4, 'xx2xxx'], // E3: 4ª corda, casa 2
    [11, 'xxxx0x'], // B3: corda si solta
  ] as const)('classe %i fica numa corda só: %s', (raiz, esperado) => {
    expect(desenho({ tipo: 'nota', raiz })).toBe(esperado)
  })

  it('fica na oitava C3–B3', () => {
    expect(voicing({ tipo: 'nota', raiz: 0 })).toEqual([48])
    expect(voicing({ tipo: 'nota', raiz: 11 })).toEqual([59])
  })
})

describe('pestana', () => {
  it('forma de mi: da 6ª à 1ª corda, na casa da raiz', () => {
    expect(pestana(acorde(6, ''))).toEqual({ casa: 2, daCorda: 0, ateCorda: 5 }) // F#
  })

  it('forma de lá: da 5ª à 1ª corda', () => {
    expect(pestana(acorde(0, ''))).toEqual({ casa: 3, daCorda: 1, ateCorda: 5 }) // C
  })

  it('simplificado: F encolhe para as duas cordas mais finas; C aberto não tem', () => {
    expect(pestana(acorde(5, ''), true)).toEqual({ casa: 1, daCorda: 4, ateCorda: 5 })
    expect(pestana(acorde(0, ''), true)).toBeNull()
  })

  it('simplificado com uma corda só na casa da pestana não tem barra', () => {
    expect(pestana(acorde(1, 'm'), true)).toBeNull() // C#m simplificado: x4665x
  })

  it('abertos de E e de A e notas isoladas não têm pestana', () => {
    expect(pestana(acorde(4, 'm'))).toBeNull() // Em
    expect(pestana(acorde(9, ''))).toBeNull() // A
    expect(pestana({ tipo: 'nota', raiz: 0 })).toBeNull()
  })

  it.each([false, true])('cobre só cordas presas naquela casa ou acima (simplificado: %s)', (simplificado) => {
    for (const item of acordes) {
      const barra = pestana(item, simplificado)
      if (!barra) continue
      const desenhoDoItem = casas(item, simplificado)
      for (let corda = barra.daCorda; corda <= barra.ateCorda; corda++) {
        const casa = desenhoDoItem[corda]
        expect(casa, `${desenho(item, simplificado)} corda ${corda}`).not.toBeNull()
        expect(casa).toBeGreaterThanOrEqual(barra.casa)
      }
    }
  })
})
