// Dependências do app (tocadores, voz, preferências), injetadas pelo main.tsx e lidas pelas telas.
// As telas conhecem só as interfaces; os testes e o futuro back-end trocam as implementações.

import { createContext, useContext } from 'react'
import type { Tocador } from '../audio/tocador'
import type { RepositorioDePreferencias } from '../dados/preferencias'
import type { Instrumento } from '../dominio/instrumentos'
import type { Narrador } from '../fala/narrador'
import type { ReconhecedorDeFala } from '../fala/reconhecedor'

export interface DependenciasDoApp {
  tocadores: Record<Instrumento, Tocador>
  narrador: Narrador
  reconhecedor: ReconhecedorDeFala
  preferencias: RepositorioDePreferencias
}

export const ContextoDoApp = createContext<DependenciasDoApp | null>(null)

export function useDependencias(): DependenciasDoApp {
  const deps = useContext(ContextoDoApp)
  if (!deps) throw new Error('ContextoDoApp ausente: envolva a tela com <ContextoDoApp.Provider>')
  return deps
}
