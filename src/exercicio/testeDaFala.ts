// Classificação, resumo e exportação das tentativas da página de teste da fala (plans/012).
// Puro: a página entrega o que o navegador reconheceu; aqui só se compara, soma e formata.

import { normalizar } from '../dominio/normalizacao'

export type ClasseDaTentativa =
  /** A 1ª alternativa é a palavra esperada. */
  | 'primeira'
  /** A palavra esperada aparece, mas não na 1ª alternativa. */
  | 'outra'
  /** Nenhuma alternativa é a palavra esperada. */
  | 'diferente'
  /** Fala livre: não há palavra esperada para comparar. */
  | 'livre'
  | 'silencio'
  | 'erro'

export interface AlternativaReconhecida {
  texto: string
  confianca: number
}

export interface Tentativa {
  numero: number
  navegador: string
  /** null = fala livre. */
  esperado: string | null
  alternativas: AlternativaReconhecida[]
  latenciaMs: number | null
  classe: ClasseDaTentativa
  codigoDeErro?: string
}

export const ROTULO_DA_CLASSE: Record<ClasseDaTentativa, string> = {
  primeira: 'Acertou na 1ª alternativa',
  outra: 'Acertou em outra alternativa',
  diferente: 'Diferente',
  livre: 'Fala livre',
  silencio: 'Silêncio',
  erro: 'Erro',
}

/** Compara pelo texto normalizado: "Dó!" e "do" são iguais aqui. */
export function classificar(esperado: string | null, alternativas: readonly string[]): ClasseDaTentativa {
  if (esperado === null) return 'livre'
  const alvo = normalizar(esperado)
  const textos = alternativas.map(normalizar)
  if (textos[0] === alvo) return 'primeira'
  if (textos.includes(alvo)) return 'outra'
  return 'diferente'
}

export interface Resumo {
  total: number
  /** Tentativas com palavra esperada e alguma fala reconhecida (as que contam para a taxa). */
  avaliadas: number
  taxaNaPrimeira: number | null
  taxaEmAlguma: number | null
  latenciaMediaMs: number | null
}

export function resumir(tentativas: readonly Tentativa[]): Resumo {
  const avaliadas = tentativas.filter((t) => t.classe === 'primeira' || t.classe === 'outra' || t.classe === 'diferente')
  const naPrimeira = avaliadas.filter((t) => t.classe === 'primeira').length
  const emAlguma = avaliadas.filter((t) => t.classe !== 'diferente').length
  const latencias = tentativas.flatMap((t) => (t.latenciaMs === null ? [] : [t.latenciaMs]))
  const taxa = (n: number) => (avaliadas.length === 0 ? null : n / avaliadas.length)

  return {
    total: tentativas.length,
    avaliadas: avaliadas.length,
    taxaNaPrimeira: taxa(naPrimeira),
    taxaEmAlguma: taxa(emAlguma),
    latenciaMediaMs: latencias.length === 0 ? null : Math.round(latencias.reduce((a, b) => a + b, 0) / latencias.length),
  }
}

const celula = (valor: string) => (/[",\n]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor)

/** CSV para a fase 5 (sinônimos) e para medir o RNF07/RNF08. Alternativas separadas por " | ", com a confiança. */
export function paraCsv(tentativas: readonly Tentativa[]): string {
  const cabecalho = ['numero', 'navegador', 'esperado', 'resultado', 'latencia_ms', 'alternativas', 'erro']
  const linhas = tentativas.map((t) =>
    [
      String(t.numero),
      t.navegador,
      t.esperado ?? '',
      t.classe,
      t.latenciaMs === null ? '' : String(t.latenciaMs),
      t.alternativas.map((a) => `${a.texto} (${a.confianca.toFixed(2)})`).join(' | '),
      t.codigoDeErro ?? '',
    ]
      .map(celula)
      .join(','),
  )
  return [cabecalho.join(','), ...linhas].join('\n')
}

/** Nome curto do navegador a partir do user agent (só para o relatório do teste). */
export function nomeDoNavegador(userAgent: string): string {
  if (/CriOS/.test(userAgent)) return 'Chrome (iPhone)'
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'Safari (iPhone)'
  if (/Edg\//.test(userAgent)) return 'Edge'
  if (/Android/.test(userAgent) && /Chrome\//.test(userAgent)) return 'Chrome (Android)'
  if (/Chrome\//.test(userAgent)) return 'Chrome'
  if (/Firefox\//.test(userAgent)) return 'Firefox'
  if (/Safari\//.test(userAgent)) return 'Safari'
  return 'Outro'
}
