// Preferências do usuário guardadas no navegador. As telas conhecem só a interface;
// quando houver back-end, entra uma implementação ...Api (plans/002-back-end.md).

import type { Selecao } from '../contratos/selecao'
import { lerSelecao } from '../exercicio/selecao'

/** 'sistema' segue o tema do sistema operacional (plans/007). */
export type Tema = 'sistema' | 'claro' | 'escuro'

export interface RepositorioDePreferencias {
  /** Anunciar por voz o nome do item tocado na biblioteca (plans/005). Padrão: desligado. */
  anunciarNomes(): boolean
  salvarAnunciarNomes(ligado: boolean): void
  /** Tema de cores (plans/007). Padrão: 'sistema'. */
  tema(): Tema
  salvarTema(tema: Tema): void
  /** Acordes de violão simplificados, versão de 4 cordas (plans/008). Padrão: desligado. */
  simplificado(): boolean
  salvarSimplificado(ligado: boolean): void
  /** Última seleção do jogo (UC01, plans/009); null se nunca escolheu ou se o dado salvo não servir. */
  ultimaSelecao(): Selecao | null
  salvarUltimaSelecao(selecao: Selecao): void
}

const CHAVE_ULTIMA_SELECAO = 'treinador:ultimaSelecao'
const CHAVE_SIMPLIFICADO = 'treinador:simplificado'
const CHAVE_ANUNCIAR_NOMES = 'treinador:anunciarNomes'
const CHAVE_TEMA = 'treinador:tema'
const TEMAS: readonly string[] = ['sistema', 'claro', 'escuro']

/** localStorage pode falhar (aba anônima, armazenamento bloqueado): aí a preferência vale só nesta visita. */
export class PreferenciasLocais implements RepositorioDePreferencias {
  private readonly emMemoria = new Map<string, string>()

  anunciarNomes(): boolean {
    return this.ler(CHAVE_ANUNCIAR_NOMES) === 'sim'
  }

  salvarAnunciarNomes(ligado: boolean): void {
    this.gravar(CHAVE_ANUNCIAR_NOMES, ligado ? 'sim' : 'nao')
  }

  tema(): Tema {
    const salvo = this.ler(CHAVE_TEMA)
    return salvo !== null && TEMAS.includes(salvo) ? (salvo as Tema) : 'sistema'
  }

  salvarTema(tema: Tema): void {
    this.gravar(CHAVE_TEMA, tema)
  }

  simplificado(): boolean {
    return this.ler(CHAVE_SIMPLIFICADO) === 'sim'
  }

  salvarSimplificado(ligado: boolean): void {
    this.gravar(CHAVE_SIMPLIFICADO, ligado ? 'sim' : 'nao')
  }

  ultimaSelecao(): Selecao | null {
    const salvo = this.ler(CHAVE_ULTIMA_SELECAO)
    if (salvo === null) return null
    try {
      return lerSelecao(JSON.parse(salvo))
    } catch {
      return null // JSON corrompido
    }
  }

  salvarUltimaSelecao(selecao: Selecao): void {
    this.gravar(CHAVE_ULTIMA_SELECAO, JSON.stringify(selecao))
  }

  private ler(chave: string): string | null {
    try {
      return localStorage.getItem(chave)
    } catch {
      return this.emMemoria.get(chave) ?? null
    }
  }

  private gravar(chave: string, valor: string): void {
    this.emMemoria.set(chave, valor)
    try {
      localStorage.setItem(chave, valor)
    } catch {
      // segue só em memória
    }
  }
}
