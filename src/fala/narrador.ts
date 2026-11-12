// Voz sintética (speechSynthesis) em pt-BR. As telas conhecem só a interface Narrador.

export interface Narrador {
  /**
   * Diz o texto, interrompendo o que estiver sendo dito. Resolve quando a fala termina (o jogo só abre o
   * microfone depois da pergunta, RNF02). Sem voz no navegador, resolve na hora.
   */
  falar(texto: string): Promise<void>
  /** Para de falar. */
  calar(): void
}

/** Se o navegador não avisar o fim da fala, desiste depois deste tempo (por caractere, mais uma folga). */
const MS_POR_CARACTERE = 120
const FOLGA_MS = 1500

export class NarradorDoNavegador implements Narrador {
  falar(texto: string): Promise<void> {
    if (!('speechSynthesis' in window)) return Promise.resolve()
    speechSynthesis.cancel()

    return new Promise((resolve) => {
      const fala = new SpeechSynthesisUtterance(texto)
      fala.lang = 'pt-BR'
      // As vozes podem ainda não ter carregado; nesse caso o navegador usa a voz padrão do idioma.
      const voz = speechSynthesis.getVoices().find((v) => v.lang.replace('_', '-').startsWith('pt-BR'))
      if (voz) fala.voice = voz

      let terminou = false
      const terminar = () => {
        if (terminou) return
        terminou = true
        clearTimeout(limite)
        resolve()
      }
      const limite = setTimeout(terminar, texto.length * MS_POR_CARACTERE + FOLGA_MS)
      fala.onend = terminar
      fala.onerror = terminar
      speechSynthesis.speak(fala)
    })
  }

  calar(): void {
    if ('speechSynthesis' in window) speechSynthesis.cancel()
  }
}
