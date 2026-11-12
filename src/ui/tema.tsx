// Tema do Mantine guardado nas nossas preferências (plans/007, plans/010).

import {
  createTheme,
  SegmentedControl,
  useMantineColorScheme,
  type CSSVariablesResolver,
  type MantineColorScheme,
  type MantineColorSchemeManager,
} from '@mantine/core'
import type { RepositorioDePreferencias, Tema } from '../dados/preferencias'

/**
 * Paleta do app antes do Mantine (plans/007), mantida a pedido do autor (plans/010):
 * marrom #8a4b14 no claro (tom 7) e âmbar #e0a56b no escuro (tom 3); os outros tons fazem a escala.
 */
const MADEIRA = [
  '#fbf3ea',
  '#f3e1cc',
  '#e9c9a6',
  '#e0a56b',
  '#d48f4f',
  '#c07a3a',
  '#a5622a',
  '#8a4b14',
  '#6b3a10',
  '#4d290b',
] as const

export const tema = createTheme({
  colors: { madeira: MADEIRA },
  primaryColor: 'madeira',
  primaryShade: { light: 7, dark: 3 },
  // O texto sobre o âmbar do escuro é ajustado no estilo.css: o autoContrast do Mantine usa o tom do claro.
  defaultRadius: 'md',
  fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  headings: { fontWeight: '700' },
})

/** Fundo, texto e bordas da paleta anterior. `--fundo` é o fundo da página; `body` do Mantine é o dos cartões. */
export const variaveisDoTema: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-primary-color-contrast': '#ffffff',
    '--fundo': '#fafaf7',
    '--mantine-color-body': '#ffffff',
    '--mantine-color-text': '#1d1d1b',
    '--mantine-color-dimmed': '#5b5b57',
    '--mantine-color-default-border': '#d6d6d0',
  },
  dark: {
    // No escuro, o destaque é âmbar claro: texto e ícones por cima dele ficam escuros, como na paleta anterior.
    '--mantine-primary-color-contrast': '#171715',
    '--fundo': '#171715',
    '--mantine-color-body': '#22221f',
    '--mantine-color-text': '#ececea',
    '--mantine-color-dimmed': '#a9a9a3',
    '--mantine-color-default-border': '#3a3a35',
  },
})

const PARA_MANTINE: Record<Tema, MantineColorScheme> = { sistema: 'auto', claro: 'light', escuro: 'dark' }
const DO_MANTINE: Record<MantineColorScheme, Tema> = { auto: 'sistema', light: 'claro', dark: 'escuro' }

/** Faz o Mantine ler e gravar o tema no RepositorioDePreferencias (chave treinador:tema). */
export function gerenciadorDeTema(preferencias: RepositorioDePreferencias): MantineColorSchemeManager {
  return {
    get: () => PARA_MANTINE[preferencias.tema()],
    set: (valor) => preferencias.salvarTema(DO_MANTINE[valor]),
    subscribe: () => {},
    unsubscribe: () => {},
    clear: () => preferencias.salvarTema('sistema'),
  }
}

/** Tema já resolvido ('light' ou 'dark'), para marcar o <html> antes do primeiro desenho e não piscar. */
export function temaResolvido(preferencias: RepositorioDePreferencias): 'light' | 'dark' {
  const escolhido = PARA_MANTINE[preferencias.tema()]
  if (escolhido !== 'auto') return escolhido
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function EscolhaDeTema() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  return (
    <SegmentedControl
      size="xs"
      aria-label="Tema"
      value={colorScheme}
      onChange={(valor) => setColorScheme(valor as MantineColorScheme)}
      data={[
        { value: 'auto', label: 'Sistema' },
        { value: 'light', label: 'Claro' },
        { value: 'dark', label: 'Escuro' },
      ]}
    />
  )
}
