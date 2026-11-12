import { describe, expect, it } from 'vitest'
import { normalizar } from './normalizacao'

describe('normalizar', () => {
  it.each([
    ['Dó', 'do'],
    ['dó sustenido', 'do sustenido'],
    ['Ré  bemol.', 're bemol'],
    ['  Lá menor!  ', 'la menor'],
    ['Fá, com sétima maior?', 'fa com setima maior'],
    ['SOL', 'sol'],
    ['ré-bemol', 're bemol'],
    ['C#m', 'c#m'],
    ['', ''],
  ])('%j → %j', (entrada, esperado) => {
    expect(normalizar(entrada)).toBe(esperado)
  })
})
