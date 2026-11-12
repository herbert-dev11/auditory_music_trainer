// Máquina de estados da partida (UC02, plans/011): (estado, evento) → estado.
// Pura: sem relógio, som, voz nem DOM. A tela agenda o tempo, toca, pergunta, escuta e manda os eventos.
// O sorteio recebe o número aleatório no evento, para os testes serem previsíveis.

import { mesmoItem, type Item } from '../dominio/itens'

/** RN02: tempo para responder. */
export const TEMPO_PARA_RESPONDER_MS: Record<Item['tipo'], number> = { nota: 5000, acorde: 8000 }

/** RF04: contagem regressiva antes do primeiro exercício. */
export const CONTAGEM_INICIAL = 3

export type ResultadoDaResposta = 'acerto' | 'erro' | 'nao_entendi'

/** Registro de cada resposta, no formato do contrato Resposta do plans/002. */
export interface RespostaRegistrada {
  ordem: number
  tentativa: 1 | 2
  esperado: Item
  /** O que foi entendido (null = não entendi ou silêncio). */
  entendido: Item | null
  /** Texto reconhecido que gerou a resposta (null = silêncio). */
  texto: string | null
  resultado: ResultadoDaResposta
  tempoMs: number
  ouviuDeNovo: number
}

export type Fase =
  | { nome: 'explicacao' }
  | { nome: 'contagem'; restante: number }
  /** Tocando o som e fazendo a pergunta; o microfone está fechado (RNF02). */
  | { nome: 'tocando' }
  /** Microfone aberto, cronômetro correndo. */
  | { nome: 'ouvindo' }
  | { nome: 'acerto'; entendido: Item; texto: string }
  /** Segunda chance (RN04): não entendeu ou ninguém falou. */
  | { nome: 'nao-entendi'; motivo: 'nao-entendi' | 'silencio' }
  /** Errou (RN05) ou gastou a segunda chance. */
  | { nome: 'erro'; entendido: Item | null; texto: string | null }
  | { nome: 'resultado' }

export interface EstadoDaPartida {
  itens: readonly Item[]
  fase: Fase
  /** Item da rodada atual (null antes do primeiro sorteio). */
  atual: Item | null
  /** Número da rodada (1, 2, ...); muda a cada item sorteado. */
  rodada: number
  /** Sequência de acertos: a pontuação (RF14). */
  sequencia: number
  acertados: Item[]
  segundaChanceUsada: boolean
  ouviuDeNovo: number
  respostas: RespostaRegistrada[]
  encerradaPor: 'erro' | 'parou' | null
}

export type EventoDaPartida =
  | { tipo: 'comecar' }
  /** Um segundo da contagem; o último já sorteia o primeiro item. */
  | { tipo: 'tique'; aleatorio: number }
  /** O som e a pergunta terminaram: pode abrir o microfone (RF07). */
  | { tipo: 'prontoParaOuvir' }
  /** O reconhecimento terminou. `entendido` null = "não entendi". */
  | { tipo: 'respondeu'; entendido: Item | null; texto: string | null; tempoMs: number }
  | { tipo: 'silencio'; tempoMs: number }
  /** Depois do aviso de "não entendi", reabre o microfone. */
  | { tipo: 'continuarOuvindo' }
  /** RN06: toca de novo e reinicia o cronômetro, sem gastar a segunda chance. */
  | { tipo: 'ouvirDeNovo' }
  /** Depois de um acerto, vai para o próximo item. */
  | { tipo: 'seguir'; aleatorio: number }
  /** Depois de um erro (e do som certo, E1), mostra o resultado. */
  | { tipo: 'verResultado' }
  /** A5: o usuário parou. */
  | { tipo: 'parar' }
  /** Do resultado, joga de novo com a mesma seleção (volta à contagem). */
  | { tipo: 'jogarDeNovo' }

export function novaPartida(itens: readonly Item[]): EstadoDaPartida {
  return {
    itens,
    fase: { nome: 'explicacao' },
    atual: null,
    rodada: 0,
    sequencia: 0,
    acertados: [],
    segundaChanceUsada: false,
    ouviuDeNovo: 0,
    respostas: [],
    encerradaPor: null,
  }
}

/** Sorteia um item sem repetir o anterior (com um item só, repete). `aleatorio` em [0, 1). */
export function sortear(itens: readonly Item[], anterior: Item | null, aleatorio: number): Item {
  const candidatos = anterior ? itens.filter((i) => !mesmoItem(i, anterior)) : itens
  const lista = candidatos.length > 0 ? candidatos : itens
  return lista[Math.min(lista.length - 1, Math.floor(aleatorio * lista.length))]
}

const novaRodada = (estado: EstadoDaPartida, aleatorio: number): EstadoDaPartida => ({
  ...estado,
  fase: { nome: 'tocando' },
  atual: sortear(estado.itens, estado.atual, aleatorio),
  rodada: estado.rodada + 1,
  segundaChanceUsada: false,
  ouviuDeNovo: 0,
})

function registrar(
  estado: EstadoDaPartida,
  resposta: Pick<RespostaRegistrada, 'entendido' | 'texto' | 'resultado' | 'tempoMs'>,
): RespostaRegistrada[] {
  return [
    ...estado.respostas,
    {
      ordem: estado.rodada,
      tentativa: estado.segundaChanceUsada ? 2 : 1,
      esperado: estado.atual as Item,
      ouviuDeNovo: estado.ouviuDeNovo,
      ...resposta,
    },
  ]
}

/** Não entendeu ou ninguém falou: segunda chance (RN04) ou, se já usada, erro. */
function semResposta(
  estado: EstadoDaPartida,
  motivo: 'nao-entendi' | 'silencio',
  texto: string | null,
  tempoMs: number,
): EstadoDaPartida {
  const respostas = registrar(estado, { entendido: null, texto, resultado: 'nao_entendi', tempoMs })
  if (!estado.segundaChanceUsada) {
    return { ...estado, respostas, segundaChanceUsada: true, fase: { nome: 'nao-entendi', motivo } }
  }
  return { ...estado, respostas, fase: { nome: 'erro', entendido: null, texto } }
}

export function reduzir(estado: EstadoDaPartida, evento: EventoDaPartida): EstadoDaPartida {
  const { fase } = estado

  // A5: parar vale a partir da contagem até antes do resultado.
  if (evento.tipo === 'parar') {
    if (fase.nome === 'explicacao' || fase.nome === 'resultado') return estado
    return { ...estado, fase: { nome: 'resultado' }, encerradaPor: estado.encerradaPor ?? 'parou' }
  }

  switch (evento.tipo) {
    case 'comecar':
      return fase.nome === 'explicacao' ? { ...estado, fase: { nome: 'contagem', restante: CONTAGEM_INICIAL } } : estado

    case 'tique':
      if (fase.nome !== 'contagem') return estado
      return fase.restante > 1
        ? { ...estado, fase: { nome: 'contagem', restante: fase.restante - 1 } }
        : novaRodada(estado, evento.aleatorio)

    case 'prontoParaOuvir':
      return fase.nome === 'tocando' ? { ...estado, fase: { nome: 'ouvindo' } } : estado

    case 'respondeu': {
      if (fase.nome !== 'ouvindo' || !estado.atual) return estado
      if (!evento.entendido) return semResposta(estado, 'nao-entendi', evento.texto, evento.tempoMs)

      const acertou = mesmoItem(evento.entendido, estado.atual)
      const respostas = registrar(estado, {
        entendido: evento.entendido,
        texto: evento.texto,
        resultado: acertou ? 'acerto' : 'erro',
        tempoMs: evento.tempoMs,
      })
      if (acertou) {
        return {
          ...estado,
          respostas,
          sequencia: estado.sequencia + 1,
          acertados: [...estado.acertados, estado.atual],
          fase: { nome: 'acerto', entendido: evento.entendido, texto: evento.texto ?? '' },
        }
      }
      // RN05: entendida e errada encerra na hora, sem segunda chance.
      return { ...estado, respostas, fase: { nome: 'erro', entendido: evento.entendido, texto: evento.texto } }
    }

    case 'silencio':
      return fase.nome === 'ouvindo' ? semResposta(estado, 'silencio', null, evento.tempoMs) : estado

    case 'continuarOuvindo':
      return fase.nome === 'nao-entendi' ? { ...estado, fase: { nome: 'ouvindo' } } : estado

    case 'ouvirDeNovo':
      if (fase.nome !== 'ouvindo' && fase.nome !== 'nao-entendi') return estado
      return { ...estado, fase: { nome: 'tocando' }, ouviuDeNovo: estado.ouviuDeNovo + 1 }

    case 'seguir':
      return fase.nome === 'acerto' ? novaRodada(estado, evento.aleatorio) : estado

    case 'verResultado':
      return fase.nome === 'erro' ? { ...estado, fase: { nome: 'resultado' }, encerradaPor: 'erro' } : estado

    case 'jogarDeNovo':
      return fase.nome === 'resultado'
        ? { ...novaPartida(estado.itens), fase: { nome: 'contagem', restante: CONTAGEM_INICIAL } }
        : estado
  }
}
