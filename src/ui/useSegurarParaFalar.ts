// "Segure para falar" (plans/013): o microfone só abre enquanto a pessoa segura o botão (ou a barra de
// espaço no computador) e fecha ao soltar. Usado pelo jogo e pela página de teste da fala.

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import type { ReconhecedorDeFala, ResultadoDaEscuta } from '../fala/reconhecedor'

/** Janela de escuta curta: no máximo isto por toque; depois fecha sozinha e usa o que ouviu. */
export const JANELA_MAXIMA_MS = 4000
/** Toques mais curtos que isto são ignorados (toque sem querer não gasta a segunda chance). */
export const TOQUE_MINIMO_MS = 300

export type SituacaoDaFala = 'livre' | 'segurando' | 'processando'

interface Opcoes {
  reconhecedor: ReconhecedorDeFala
  /** Quando false, o botão não responde e qualquer escuta em andamento é cancelada. */
  ativo: boolean
  onResultado: (resultado: ResultadoDaEscuta) => void
  onToqueCurto?: () => void
}

const digitando = (alvo: EventTarget | null) =>
  alvo instanceof HTMLElement && (alvo.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(alvo.tagName))

export function useSegurarParaFalar({ reconhecedor, ativo, onResultado, onToqueCurto }: Opcoes) {
  const [situacao, setSituacao] = useState<SituacaoDaFala>('livre')
  const situacaoRef = useRef<SituacaoDaFala>('livre')
  const escutaAtual = useRef(0)
  const inicioDoToque = useRef(0)
  // Callbacks mais recentes, sem recriar os handlers a cada render.
  const callbacks = useRef({ onResultado, onToqueCurto })
  callbacks.current = { onResultado, onToqueCurto }

  const mudar = (nova: SituacaoDaFala) => {
    situacaoRef.current = nova
    setSituacao(nova)
  }

  const comecar = useCallback(() => {
    if (!ativo || situacaoRef.current !== 'livre') return
    inicioDoToque.current = performance.now()
    mudar('segurando')
    const minha = ++escutaAtual.current
    void reconhecedor.ouvir({ tempoMaximoMs: JANELA_MAXIMA_MS }).then((resultado) => {
      if (minha !== escutaAtual.current) return // cancelada ou trocada por outra
      mudar('livre')
      callbacks.current.onResultado(resultado)
    })
  }, [ativo, reconhecedor])

  /** Fecha o microfone e entrega o que foi ouvido (também usado pelo fim do cronômetro). */
  const concluir = useCallback(() => {
    if (situacaoRef.current !== 'segurando') return
    mudar('processando')
    reconhecedor.concluir()
  }, [reconhecedor])

  const soltar = useCallback(() => {
    if (situacaoRef.current !== 'segurando') return
    if (performance.now() - inicioDoToque.current < TOQUE_MINIMO_MS) {
      escutaAtual.current++
      reconhecedor.parar()
      mudar('livre')
      callbacks.current.onToqueCurto?.()
      return
    }
    concluir()
  }, [concluir, reconhecedor])

  const cancelar = useCallback(() => {
    escutaAtual.current++
    if (situacaoRef.current !== 'livre') reconhecedor.parar()
    mudar('livre')
  }, [reconhecedor])

  useEffect(() => {
    if (!ativo) cancelar()
  }, [ativo, cancelar])
  useEffect(() => cancelar, [cancelar])

  // Barra de espaço no computador (segurar o mouse é ruim no desktop).
  useEffect(() => {
    if (!ativo) return
    const apertou = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || digitando(e.target)) return
      e.preventDefault()
      if (!e.repeat) comecar()
    }
    const soltou = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || digitando(e.target)) return
      e.preventDefault()
      soltar()
    }
    window.addEventListener('keydown', apertou)
    window.addEventListener('keyup', soltou)
    return () => {
      window.removeEventListener('keydown', apertou)
      window.removeEventListener('keyup', soltou)
    }
  }, [ativo, comecar, soltar])

  const propsDoBotao = {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      // Captura: soltar fora do botão ainda conta como soltar.
      e.currentTarget.setPointerCapture(e.pointerId)
      comecar()
    },
    onPointerUp: soltar,
    onPointerCancel: soltar,
    onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
    className: 'botao-segurar',
    'data-situacao': situacao,
  }

  return { situacao, situacaoRef, propsDoBotao, concluir, cancelar }
}

/** Telas com mouse (computador) mostram a dica da barra de espaço. */
export const temMouse = () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
