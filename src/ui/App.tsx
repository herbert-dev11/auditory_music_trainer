// Raiz da interface: tema do Mantine, dependências e a tela da rota atual (plans/010).

import { MantineProvider } from '@mantine/core'
import { useEffect, useMemo, useRef, type ComponentType } from 'react'
import { Biblioteca } from './Biblioteca'
import { Barra } from './Comum'
import { ContextoDoApp, type DependenciasDoApp } from './contexto'
import { Inicio } from './Inicio'
import { Partida } from './Partida'
import { INICIO, ROTAS, useRota, type Rota } from './rotas'
import { Selecao } from './Selecao'
import { gerenciadorDeTema, tema, variaveisDoTema } from './tema'
import { Teoria } from './Teoria'
import { NOME_DO_SISTEMA } from './textos'

const TELAS: Record<Rota, ComponentType> = {
  '#/': Inicio,
  '#/biblioteca': Biblioteca,
  '#/jogo': Selecao,
  '#/jogo/partida': Partida,
  '#/teoria': Teoria,
}

export function App({ deps }: { deps: DependenciasDoApp }) {
  const rota = useRota()
  const Tela = TELAS[rota]
  const gerenciador = useMemo(() => gerenciadorDeTema(deps.preferencias), [deps.preferencias])

  // Na troca de tela: título da aba, rolagem para o topo e foco no título (na abertura, sem foco).
  const primeiraVez = useRef(true)
  useEffect(() => {
    document.title = rota === INICIO ? NOME_DO_SISTEMA : `${ROTAS[rota]} — ${NOME_DO_SISTEMA}`
    window.scrollTo(0, 0)
    if (!primeiraVez.current) document.querySelector<HTMLElement>('.titulo-da-tela')?.focus()
    primeiraVez.current = false
  }, [rota])

  return (
    <MantineProvider
      theme={tema}
      colorSchemeManager={gerenciador}
      defaultColorScheme="auto"
      cssVariablesResolver={variaveisDoTema}
    >
      <ContextoDoApp.Provider value={deps}>
        <Barra rota={rota} />
        <main>
          {/* key: cada rota monta a tela do zero e desmonta a anterior (para a voz e a demonstração). */}
          <Tela key={rota} />
        </main>
      </ContextoDoApp.Provider>
    </MantineProvider>
  )
}
