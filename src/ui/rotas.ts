// Navegação por hash (plans/009, plans/010): funciona no GitHub Pages e com voltar/avançar do navegador.

import { useEffect, useState } from 'react'
import { NOME_DO_SISTEMA } from './textos'

export const ROTAS = {
  '#/': NOME_DO_SISTEMA,
  '#/biblioteca': 'Biblioteca de sons',
  '#/jogo': 'Novo jogo',
  '#/jogo/partida': 'Partida',
  '#/teoria': 'Teoria musical',
  '#/teste-da-fala': 'Teste da fala',
} as const

export type Rota = keyof typeof ROTAS

export const INICIO: Rota = '#/'

const rotaAtual = (): Rota => (location.hash in ROTAS ? (location.hash as Rota) : INICIO)

/** Rota atual, atualizada quando o hash muda. */
export function useRota(): Rota {
  const [rota, setRota] = useState(rotaAtual)
  useEffect(() => {
    const aoMudar = () => setRota(rotaAtual())
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])
  return rota
}

export const irPara = (rota: Rota) => {
  location.hash = rota
}
