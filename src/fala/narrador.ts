// Voz sintética (speechSynthesis) em pt-BR. As telas conhecem só a interface Narrador.

export interface Narrador {
  /** Diz o texto, interrompendo o que estiver sendo dito. Não faz nada se o navegador não tiver voz. */
  falar(texto: string): void
  /** Para de falar. */
  calar(): void
}

export class NarradorDoNavegador implements Narrador {
  falar(texto: string): void {
    if (!('speechSynthesis' in window)) return
    speechSynthesis.cancel()

    const fala = new SpeechSynthesisUtterance(texto)
    fala.lang = 'pt-BR'
    // As vozes podem ainda não ter carregado; nesse caso o navegador usa a voz padrão do idioma.
    const voz = speechSynthesis.getVoices().find((v) => v.lang.replace('_', '-').startsWith('pt-BR'))
    if (voz) fala.voice = voz
    speechSynthesis.speak(fala)
  }

  calar(): void {
    if ('speechSynthesis' in window) speechSynthesis.cancel()
  }
}
