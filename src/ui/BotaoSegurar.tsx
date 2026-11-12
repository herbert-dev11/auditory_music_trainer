// Botão grande de "segure para falar" (plans/013), usado no jogo e na página de teste da fala.

import { Button, Stack, Text } from '@mantine/core'
import { temMouse, type SituacaoDaFala, type useSegurarParaFalar } from './useSegurarParaFalar'

interface Props {
  situacao: SituacaoDaFala
  disponivel: boolean
  dica: string
  props: ReturnType<typeof useSegurarParaFalar>['propsDoBotao']
  /** Texto quando o botão ainda não está disponível. */
  textoIndisponivel?: string
}

export function BotaoSegurar({ situacao, disponivel, dica, props, textoIndisponivel = 'Espere a pergunta' }: Props) {
  const texto =
    situacao === 'segurando'
      ? 'Ouvindo... solte quando terminar'
      : situacao === 'processando'
        ? 'Entendendo...'
        : disponivel
          ? 'Segure para falar'
          : textoIndisponivel
  return (
    <Stack gap={4}>
      <Button
        size="xl"
        fullWidth
        color={situacao === 'segurando' ? 'red' : undefined}
        disabled={!disponivel || situacao === 'processando'}
        aria-pressed={situacao === 'segurando'}
        {...props}
      >
        {texto}
      </Button>
      <Text size="xs" c="dimmed" ta="center" role="status" mih={18}>
        {dica || (disponivel && temMouse() ? 'No computador, você também pode segurar a barra de espaço.' : '')}
      </Text>
    </Stack>
  )
}
