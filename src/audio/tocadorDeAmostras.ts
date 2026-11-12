// Tocador de amostras gravadas (Tone.js Sampler), configurado por instrumento.
// Fontes e licenças dos sons: CREDITS.md e docs/pesquisa-de-sons.md.

import * as Tone from 'tone'
import type { Instrumento } from '../dominio/instrumentos'
import type { OpcoesDeToque, Tocador } from './tocador'

interface ConfiguracaoDeAmostras {
  /** Pasta dentro de public/samples/. */
  pasta: string
  /** Notas com amostra (o Sampler transpõe para as que faltam). */
  amostras: readonly string[]
  /** Tempo de decaimento depois de soltar a nota, em segundos. */
  release: number
  /** Atraso padrão entre notas do acorde: dedilhado no violão, juntas no piano. */
  intervaloMs: number
}

const CONFIGURACAO: Record<Instrumento, ConfiguracaoDeAmostras> = {
  // tonejs-instruments, violão nylon (quartertone, CC BY 3.0): B1 a A#5
  violao: {
    pasta: 'guitar-nylon',
    amostras: [
      'B1', 'D2', 'E2', 'F#2', 'G#2', 'A2', 'B2',
      'C#3', 'D3', 'E3', 'F#3', 'G3', 'A3', 'B3',
      'C#4', 'D#4', 'E4', 'F#4', 'G#4', 'A4', 'B4',
      'C#5', 'D5', 'E5', 'F#5', 'G5', 'G#5', 'A5', 'A#5',
    ],
    release: 1,
    intervaloMs: 30,
  },
  // Salamander Grand Piano (Alexander Holm, CC BY 3.0), versão leve do Tone.js: A2 a C6
  piano: {
    pasta: 'piano',
    amostras: ['A2', 'C3', 'D#3', 'F#3', 'A3', 'C4', 'D#4', 'F#4', 'A4', 'C5', 'D#5', 'F#5', 'A5', 'C6'],
    release: 1,
    intervaloMs: 0,
  },
}

/** 'C#3' → 'Cs3.mp3', o nome dos arquivos nas duas fontes. */
const arquivo = (nota: string) => `${nota.replace('#', 's')}.mp3`

export class TocadorDeAmostras implements Tocador {
  private sampler: Tone.Sampler | null = null
  private carregando: Promise<void> | null = null
  private readonly configuracao: ConfiguracaoDeAmostras

  constructor(instrumento: Instrumento) {
    this.configuracao = CONFIGURACAO[instrumento]
  }

  carregar(): Promise<void> {
    // Carrega uma vez só: voltar à biblioteca não baixa os sons de novo (plans/009).
    if (this.sampler) return Promise.resolve()
    if (this.carregando) return this.carregando
    const { pasta, amostras, release } = this.configuracao

    this.carregando = new Promise<void>((resolve, reject) => {
      const sampler = new Tone.Sampler({
        urls: Object.fromEntries(amostras.map((nota) => [nota, arquivo(nota)])),
        baseUrl: `${import.meta.env.BASE_URL}samples/${pasta}/`,
        release,
        onload: () => {
          this.sampler = sampler
          resolve()
        },
        onerror: (erro) => {
          sampler.dispose()
          reject(erro)
        },
      }).toDestination()
    }).finally(() => {
      this.carregando = null
    })
    return this.carregando
  }

  async tocar(midis: readonly number[], opcoes: OpcoesDeToque = {}): Promise<number> {
    const { intervaloMs = this.configuracao.intervaloMs, duracaoS = 2 } = opcoes
    if (!this.sampler) throw new Error('sons_nao_carregados')

    // O navegador só libera o áudio depois de um gesto do usuário.
    await Tone.start()

    const agora = Tone.now()
    midis.forEach((midi, i) => {
      const frequencia = Tone.Frequency(midi, 'midi').toFrequency()
      this.sampler?.triggerAttackRelease(frequencia, duracaoS, agora + (i * intervaloMs) / 1000)
    })

    return Math.max(0, midis.length - 1) * intervaloMs + duracaoS * 1000
  }
}
