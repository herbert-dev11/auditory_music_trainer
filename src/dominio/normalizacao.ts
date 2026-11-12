// Normalização do texto reconhecido (docs/nomenclatura.md, passo 1): minúsculas, sem acentos, sem pontuação.
// Usada pela página de teste da fala (plans/012) e pela interpretação da fala (fase 5).

const ACENTOS = /[̀-ͯ]/g

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(ACENTOS, '')
    .toLowerCase()
    .replace(/[^a-z0-9#\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
