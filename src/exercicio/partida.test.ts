import { describe, expect, it } from 'vitest'
import type { Item } from '../dominio/itens'
import { novaPartida, reduzir, sortear, type EstadoDaPartida, type EventoDaPartida } from './partida'

const DO: Item = { tipo: 'nota', raiz: 0 }
const RE: Item = { tipo: 'nota', raiz: 2 }
const MI: Item = { tipo: 'nota', raiz: 4 }
const ITENS = [DO, RE, MI]

const aplicar = (estado: EstadoDaPartida, ...eventos: EventoDaPartida[]) => eventos.reduce(reduzir, estado)

/** Partida já com o microfone aberto, na 1ª rodada, com o item DO (aleatorio 0). */
function ouvindoDo(): EstadoDaPartida {
  return aplicar(
    novaPartida(ITENS),
    { tipo: 'comecar' },
    { tipo: 'tique', aleatorio: 0 },
    { tipo: 'tique', aleatorio: 0 },
    { tipo: 'tique', aleatorio: 0 },
    { tipo: 'prontoParaOuvir' },
  )
}

const respondeu = (entendido: Item | null, texto: string | null = 'x'): EventoDaPartida => ({
  tipo: 'respondeu',
  entendido,
  texto,
  tempoMs: 1200,
})

describe('sortear', () => {
  it('não repete o item anterior', () => {
    for (const aleatorio of [0, 0.3, 0.6, 0.99]) {
      expect(sortear(ITENS, RE, aleatorio)).not.toEqual(RE)
    }
  })

  it('com 2 itens, alterna', () => {
    expect(sortear([DO, RE], DO, 0.5)).toEqual(RE)
    expect(sortear([DO, RE], RE, 0)).toEqual(DO)
  })

  it('com 1 item só, repete', () => {
    expect(sortear([DO], DO, 0.5)).toEqual(DO)
  })

  it('sem anterior, sorteia de todos; aleatorio 0.999 pega o último', () => {
    expect(sortear(ITENS, null, 0)).toEqual(DO)
    expect(sortear(ITENS, null, 0.999)).toEqual(MI)
  })
})

describe('início', () => {
  it('começa na explicação (RF03) e vai para a contagem 3-2-1 (RF04)', () => {
    let estado = novaPartida(ITENS)
    expect(estado.fase).toEqual({ nome: 'explicacao' })
    estado = reduzir(estado, { tipo: 'comecar' })
    expect(estado.fase).toEqual({ nome: 'contagem', restante: 3 })
    estado = reduzir(estado, { tipo: 'tique', aleatorio: 0 })
    expect(estado.fase).toEqual({ nome: 'contagem', restante: 2 })
    estado = aplicar(estado, { tipo: 'tique', aleatorio: 0 }, { tipo: 'tique', aleatorio: 0.5 })
    expect(estado.fase).toEqual({ nome: 'tocando' })
    expect(estado.atual).toEqual(RE)
    expect(estado.rodada).toBe(1)
  })

  it('o microfone só abre depois do som e da pergunta (RF07)', () => {
    expect(ouvindoDo().fase).toEqual({ nome: 'ouvindo' })
  })
})

describe('respostas', () => {
  it('acerto soma 1 e o próximo item não repete', () => {
    let estado = reduzir(ouvindoDo(), respondeu(DO, 'dó'))
    expect(estado.fase).toEqual({ nome: 'acerto', entendido: DO, texto: 'dó' })
    expect(estado.sequencia).toBe(1)
    expect(estado.acertados).toEqual([DO])
    estado = reduzir(estado, { tipo: 'seguir', aleatorio: 0 })
    expect(estado.fase).toEqual({ nome: 'tocando' })
    expect(estado.atual).not.toEqual(DO)
    expect(estado.rodada).toBe(2)
  })

  it('acerto sem texto reconhecido mostra texto vazio', () => {
    expect(reduzir(ouvindoDo(), respondeu(DO, null)).fase).toEqual({ nome: 'acerto', entendido: DO, texto: '' })
  })

  it('resposta entendida e errada encerra na hora (RN05)', () => {
    let estado = reduzir(ouvindoDo(), respondeu(RE, 'ré'))
    expect(estado.fase).toEqual({ nome: 'erro', entendido: RE, texto: 'ré' })
    expect(estado.sequencia).toBe(0)
    estado = reduzir(estado, { tipo: 'verResultado' })
    expect(estado.fase).toEqual({ nome: 'resultado' })
    expect(estado.encerradaPor).toBe('erro')
  })

  it('não entendi usa a segunda chance; na segunda vez, erro (RN04)', () => {
    let estado = reduzir(ouvindoDo(), respondeu(null, 'banana'))
    expect(estado.fase).toEqual({ nome: 'nao-entendi', motivo: 'nao-entendi' })
    expect(estado.segundaChanceUsada).toBe(true)
    estado = aplicar(estado, { tipo: 'continuarOuvindo' }, respondeu(null, 'banana'))
    expect(estado.fase).toEqual({ nome: 'erro', entendido: null, texto: 'banana' })
  })

  it('silêncio também usa a segunda chance (RN04)', () => {
    let estado = reduzir(ouvindoDo(), { tipo: 'silencio', tempoMs: 5000 })
    expect(estado.fase).toEqual({ nome: 'nao-entendi', motivo: 'silencio' })
    estado = aplicar(estado, { tipo: 'continuarOuvindo' }, { tipo: 'silencio', tempoMs: 5000 })
    expect(estado.fase.nome).toBe('erro')
  })

  it('depois da segunda chance, ainda dá para acertar', () => {
    const estado = aplicar(ouvindoDo(), respondeu(null), { tipo: 'continuarOuvindo' }, respondeu(DO, 'dó'))
    expect(estado.fase.nome).toBe('acerto')
    expect(estado.sequencia).toBe(1)
  })

  it('a segunda chance volta a valer na rodada seguinte', () => {
    const estado = aplicar(
      ouvindoDo(),
      respondeu(null),
      { tipo: 'continuarOuvindo' },
      respondeu(DO),
      { tipo: 'seguir', aleatorio: 0 },
      { tipo: 'prontoParaOuvir' },
      respondeu(null),
    )
    expect(estado.fase).toEqual({ nome: 'nao-entendi', motivo: 'nao-entendi' })
  })
})

describe('ouvir de novo (RN06)', () => {
  it('toca de novo, reabre o microfone e não gasta a segunda chance', () => {
    let estado = reduzir(ouvindoDo(), { tipo: 'ouvirDeNovo' })
    expect(estado.fase).toEqual({ nome: 'tocando' })
    expect(estado.atual).toEqual(DO)
    expect(estado.segundaChanceUsada).toBe(false)
    expect(estado.ouviuDeNovo).toBe(1)
    estado = reduzir(estado, { tipo: 'prontoParaOuvir' })
    expect(estado.fase).toEqual({ nome: 'ouvindo' })
  })

  it('vale também depois de um "não entendi"', () => {
    const estado = aplicar(ouvindoDo(), respondeu(null), { tipo: 'ouvirDeNovo' })
    expect(estado.fase).toEqual({ nome: 'tocando' })
    expect(estado.segundaChanceUsada).toBe(true)
  })

  it('não vale enquanto o som toca', () => {
    const tocando = aplicar(novaPartida(ITENS), { tipo: 'comecar' }, ...Array(3).fill({ tipo: 'tique', aleatorio: 0 }))
    expect(reduzir(tocando, { tipo: 'ouvirDeNovo' })).toBe(tocando)
  })
})

describe('parar (A5) e jogar de novo', () => {
  it('parar vai para o resultado, encerrada pelo usuário', () => {
    const estado = reduzir(ouvindoDo(), { tipo: 'parar' })
    expect(estado.fase).toEqual({ nome: 'resultado' })
    expect(estado.encerradaPor).toBe('parou')
  })

  it('parar na explicação ou no resultado não faz nada', () => {
    const explicacao = novaPartida(ITENS)
    expect(reduzir(explicacao, { tipo: 'parar' })).toBe(explicacao)
    const resultado = aplicar(ouvindoDo(), { tipo: 'parar' })
    expect(reduzir(resultado, { tipo: 'parar' })).toBe(resultado)
  })

  it('parar enquanto mostra o erro, antes do resultado, conta como parada', () => {
    const estado = aplicar(ouvindoDo(), respondeu(RE), { tipo: 'parar' })
    expect(estado.fase).toEqual({ nome: 'resultado' })
    expect(estado.encerradaPor).toBe('parou')
  })

  it('jogar de novo zera tudo e volta à contagem', () => {
    const estado = aplicar(ouvindoDo(), respondeu(DO), { tipo: 'parar' }, { tipo: 'jogarDeNovo' })
    expect(estado.fase).toEqual({ nome: 'contagem', restante: 3 })
    expect(estado.sequencia).toBe(0)
    expect(estado.acertados).toEqual([])
    expect(estado.respostas).toEqual([])
    expect(estado.encerradaPor).toBeNull()
  })
})

describe('registro das respostas', () => {
  it('guarda esperado, entendido, resultado, tempo, tentativa e vezes que ouviu de novo', () => {
    const estado = aplicar(
      ouvindoDo(),
      { tipo: 'ouvirDeNovo' },
      { tipo: 'prontoParaOuvir' },
      { tipo: 'silencio', tempoMs: 5000 },
      { tipo: 'continuarOuvindo' },
      respondeu(DO, 'dó'),
    )
    expect(estado.respostas).toEqual([
      { ordem: 1, tentativa: 1, esperado: DO, entendido: null, texto: null, resultado: 'nao_entendi', tempoMs: 5000, ouviuDeNovo: 1 },
      { ordem: 1, tentativa: 2, esperado: DO, entendido: DO, texto: 'dó', resultado: 'acerto', tempoMs: 1200, ouviuDeNovo: 1 },
    ])
  })
})

describe('eventos fora de hora são ignorados', () => {
  it.each<[string, EventoDaPartida]>([
    ['tique', { tipo: 'tique', aleatorio: 0 }],
    ['prontoParaOuvir', { tipo: 'prontoParaOuvir' }],
    ['respondeu', respondeu(DO)],
    ['silencio', { tipo: 'silencio', tempoMs: 0 }],
    ['continuarOuvindo', { tipo: 'continuarOuvindo' }],
    ['seguir', { tipo: 'seguir', aleatorio: 0 }],
    ['verResultado', { tipo: 'verResultado' }],
    ['jogarDeNovo', { tipo: 'jogarDeNovo' }],
  ])('%s na explicação', (_, evento) => {
    const explicacao = novaPartida(ITENS)
    expect(reduzir(explicacao, evento)).toBe(explicacao)
  })

  it('resposta sem item sorteado (estado inconsistente) é ignorada', () => {
    const inconsistente: EstadoDaPartida = { ...novaPartida(ITENS), fase: { nome: 'ouvindo' } }
    expect(reduzir(inconsistente, respondeu(DO))).toBe(inconsistente)
  })

  it('comecar fora da explicação', () => {
    const ouvindo = ouvindoDo()
    expect(reduzir(ouvindo, { tipo: 'comecar' })).toBe(ouvindo)
  })
})
