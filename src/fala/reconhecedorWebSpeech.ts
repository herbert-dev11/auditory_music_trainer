// Reconhecimento com a Web Speech API (Chrome: serviço do Google; iPhone: serviço da Apple).
// O áudio não é gravado pelo app (RNF03): só o texto devolvido pelo navegador. Plans/012.

import type { OpcoesDeEscuta, ReconhecedorDeFala, ResultadoDaEscuta } from './reconhecedor'

// Tipos mínimos: a Web Speech API não está em todas as versões da lib DOM do TypeScript.
interface AlternativaDoNavegador {
  transcript: string
  confidence: number
}
interface EventoDeResultado {
  results: ArrayLike<ArrayLike<AlternativaDoNavegador>>
}
interface EventoDeErro {
  error: string
}
interface ReconhecimentoDoNavegador {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  onresult: ((evento: EventoDeResultado) => void) | null
  onerror: ((evento: EventoDeErro) => void) | null
  onnomatch: (() => void) | null
  onspeechend: (() => void) | null
  onend: (() => void) | null
  start(): void
  /** Fecha o microfone e entrega o resultado. */
  stop(): void
  /** Fecha o microfone e descarta. */
  abort(): void
}
type ConstrutorDoReconhecimento = new () => ReconhecimentoDoNavegador

function construtor(): ConstrutorDoReconhecimento | undefined {
  if (typeof window === 'undefined') return undefined
  const janela = window as unknown as Record<string, ConstrutorDoReconhecimento | undefined>
  return janela.SpeechRecognition ?? janela.webkitSpeechRecognition
}

export class ReconhecedorWebSpeech implements ReconhecedorDeFala {
  private atual: ReconhecimentoDoNavegador | null = null
  /** Quando o usuário soltou o botão na escuta atual (para medir o tempo de resposta). */
  private momentoDoConcluir: number | null = null

  get disponivel(): boolean {
    return construtor() !== undefined
  }

  ouvir({ maxAlternativas = 5, tempoMaximoMs = 8000 }: OpcoesDeEscuta = {}): Promise<ResultadoDaEscuta> {
    const Reconhecimento = construtor()
    if (!Reconhecimento) return Promise.resolve({ tipo: 'erro', codigo: 'sem-suporte' })
    this.parar()
    this.momentoDoConcluir = null

    return new Promise((resolve) => {
      const reconhecimento = new Reconhecimento()
      reconhecimento.lang = 'pt-BR'
      reconhecimento.interimResults = false
      reconhecimento.continuous = false
      reconhecimento.maxAlternatives = maxAlternativas

      let terminou = false
      let fimDaFala: number | null = null
      const terminar = (resultado: ResultadoDaEscuta) => {
        if (terminou) return
        terminou = true
        clearTimeout(limite)
        clearTimeout(relogioDeSeguranca)
        if (this.atual === reconhecimento) this.atual = null
        resolve(resultado)
      }
      // Janela máxima: fecha o microfone e usa o que ouviu; se o navegador não responder, conta como silêncio.
      let relogioDeSeguranca: ReturnType<typeof setTimeout> | undefined
      const limite = setTimeout(() => {
        reconhecimento.stop()
        relogioDeSeguranca = setTimeout(() => {
          reconhecimento.abort()
          terminar({ tipo: 'silencio' })
        }, 3000)
      }, tempoMaximoMs)

      reconhecimento.onspeechend = () => {
        fimDaFala = performance.now()
      }
      reconhecimento.onresult = (evento) => {
        const resultado = evento.results[0]
        const alternativas = Array.from({ length: resultado?.length ?? 0 }, (_, i) => ({
          texto: resultado[i].transcript.trim(),
          confianca: resultado[i].confidence,
        }))
        // Do fim da fala ao resultado (RNF08); sem o aviso do navegador, conta a partir de quando soltou o botão.
        const referencia = fimDaFala ?? this.momentoDoConcluir
        const latenciaMs = referencia === null ? null : Math.round(performance.now() - referencia)
        terminar({ tipo: 'fala', alternativas, latenciaMs })
      }
      reconhecimento.onnomatch = () => terminar({ tipo: 'fala', alternativas: [], latenciaMs: null })
      reconhecimento.onerror = (evento) =>
        terminar(evento.error === 'no-speech' ? { tipo: 'silencio' } : { tipo: 'erro', codigo: evento.error })
      // Terminou sem resultado nem erro (alguns navegadores fazem isso no silêncio).
      reconhecimento.onend = () => terminar({ tipo: 'silencio' })

      this.atual = reconhecimento
      try {
        reconhecimento.start()
      } catch {
        terminar({ tipo: 'erro', codigo: 'nao-iniciou' })
      }
    })
  }

  concluir(): void {
    if (!this.atual) return
    this.momentoDoConcluir = performance.now()
    // stop() mantém a escuta viva até o navegador entregar o resultado (onresult/onend).
    this.atual.stop()
  }

  parar(): void {
    const atual = this.atual
    this.atual = null
    atual?.abort()
  }
}
