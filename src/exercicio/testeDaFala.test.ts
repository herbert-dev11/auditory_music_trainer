import { describe, expect, it } from 'vitest'
import { classificar, nomeDoNavegador, paraCsv, resumir, type Tentativa } from './testeDaFala'

describe('classificar', () => {
  it('compara pelo texto normalizado', () => {
    expect(classificar('dó', ['Dó!'])).toBe('primeira')
    expect(classificar('ré bemol', ['re bemol', 'rei bemol'])).toBe('primeira')
  })

  it('acerto fora da 1ª alternativa', () => {
    expect(classificar('si', ['sim', 'si'])).toBe('outra')
  })

  it('nenhuma alternativa igual', () => {
    expect(classificar('si', ['sim', 'assim'])).toBe('diferente')
    expect(classificar('dó', [])).toBe('diferente')
  })

  it('fala livre não compara', () => {
    expect(classificar(null, ['qualquer coisa'])).toBe('livre')
  })
})

const tentativa = (parcial: Partial<Tentativa>): Tentativa => ({
  numero: 1,
  navegador: 'Chrome',
  esperado: 'dó',
  alternativas: [],
  latenciaMs: null,
  classe: 'primeira',
  ...parcial,
})

describe('resumir', () => {
  it('taxas contam só tentativas com palavra esperada e fala reconhecida', () => {
    const resumo = resumir([
      tentativa({ classe: 'primeira', latenciaMs: 400 }),
      tentativa({ classe: 'outra', latenciaMs: 600 }),
      tentativa({ classe: 'diferente' }),
      tentativa({ classe: 'diferente' }),
      tentativa({ classe: 'silencio' }),
      tentativa({ classe: 'erro' }),
      tentativa({ classe: 'livre', esperado: null }),
    ])
    expect(resumo).toEqual({ total: 7, avaliadas: 4, taxaNaPrimeira: 0.25, taxaEmAlguma: 0.5, latenciaMediaMs: 500 })
  })

  it('sem tentativas avaliadas, sem taxa', () => {
    expect(resumir([])).toEqual({ total: 0, avaliadas: 0, taxaNaPrimeira: null, taxaEmAlguma: null, latenciaMediaMs: null })
  })
})

describe('paraCsv', () => {
  it('gera cabeçalho e uma linha por tentativa, com aspas quando preciso', () => {
    const csv = paraCsv([
      tentativa({
        numero: 1,
        esperado: 'si',
        classe: 'outra',
        latenciaMs: 512,
        alternativas: [
          { texto: 'sim', confianca: 0.9 },
          { texto: 'si', confianca: 0.42 },
        ],
      }),
      tentativa({ numero: 2, esperado: null, classe: 'erro', codigoDeErro: 'not-allowed', navegador: 'Safari, "teste"' }),
    ])
    expect(csv.split('\n')).toEqual([
      'numero,navegador,esperado,resultado,latencia_ms,alternativas,erro',
      '1,Chrome,si,outra,512,sim (0.90) | si (0.42),',
      '2,"Safari, ""teste""",,erro,,,not-allowed',
    ])
  })
})

describe('nomeDoNavegador', () => {
  it.each([
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/140.0 Mobile Safari/604.1', 'Chrome (iPhone)'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1', 'Safari (iPhone)'],
    ['Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/140.0 Safari/537.36 Edg/140.0', 'Edge'],
    ['Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36', 'Chrome (Android)'],
    ['Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/140.0 Safari/537.36', 'Chrome'],
    ['Mozilla/5.0 (Windows NT 10.0; rv:140.0) Gecko/20100101 Firefox/140.0', 'Firefox'],
    ['Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15', 'Safari'],
    ['curl/8.0', 'Outro'],
  ])('%s → %s', (userAgent, esperado) => {
    expect(nomeDoNavegador(userAgent)).toBe(esperado)
  })
})
