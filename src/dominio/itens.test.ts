import { describe, expect, it } from 'vitest'
import { cifra, nomeFalado, todosOsItens, type Item } from './itens'

const nota = (raiz: Item['raiz']): Item => ({ tipo: 'nota', raiz })
const acorde = (raiz: Item['raiz'], qualidade: Extract<Item, { tipo: 'acorde' }>['qualidade']): Item => ({
  tipo: 'acorde',
  raiz,
  qualidade,
})

describe('cifra', () => {
  it('escreve notas sempre com sustenido', () => {
    expect(cifra(nota(0))).toBe('C')
    expect(cifra(nota(1))).toBe('C#')
    expect(cifra(nota(10))).toBe('A#')
  })

  it('junta raiz e sufixo da qualidade', () => {
    expect(cifra(acorde(0, ''))).toBe('C')
    expect(cifra(acorde(1, 'm'))).toBe('C#m')
    expect(cifra(acorde(2, '7'))).toBe('D7')
    expect(cifra(acorde(3, 'm7'))).toBe('D#m7')
    expect(cifra(acorde(5, '7M'))).toBe('F7M')
  })
})

describe('nomeFalado', () => {
  it('nota isolada é só o nome da nota', () => {
    expect(nomeFalado(nota(0))).toBe('dó')
    expect(nomeFalado(nota(6))).toBe('fá sustenido')
    expect(nomeFalado(nota(11))).toBe('si')
  })

  it('acorde é raiz + qualidade falada', () => {
    expect(nomeFalado(acorde(0, ''))).toBe('dó maior')
    expect(nomeFalado(acorde(1, 'm'))).toBe('dó sustenido menor')
    expect(nomeFalado(acorde(2, '7'))).toBe('ré com sétima')
    expect(nomeFalado(acorde(3, 'm7'))).toBe('ré sustenido menor com sétima')
    expect(nomeFalado(acorde(5, '7M'))).toBe('fá com sétima maior')
  })
})

describe('todosOsItens', () => {
  const itens = todosOsItens()

  it('tem 12 notas e 60 acordes', () => {
    expect(itens.filter((i) => i.tipo === 'nota')).toHaveLength(12)
    expect(itens.filter((i) => i.tipo === 'acorde')).toHaveLength(60)
  })

  it('não repete cifra', () => {
    const cifras = itens.map((i) => `${i.tipo}:${cifra(i)}`)
    expect(new Set(cifras).size).toBe(itens.length)
  })
})
