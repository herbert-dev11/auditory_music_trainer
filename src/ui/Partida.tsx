// Tela provisória da partida (plans/009): mostra a seleção; o jogo entra na fase 3.

import { Alert, Badge, Button, Container, Group, Stack, Text } from '@mantine/core'
import { NOME_DO_INSTRUMENTO } from '../dominio/instrumentos'
import { cifra } from '../dominio/itens'
import { itensDaSelecao, podeComecar } from '../exercicio/selecao'
import { TituloDaTela } from './Comum'
import { useDependencias } from './contexto'

export function Partida() {
  const { preferencias } = useDependencias()
  const selecao = preferencias.ultimaSelecao()
  const valida = selecao !== null && podeComecar(selecao)
  const itens = valida ? itensDaSelecao(selecao) : []

  return (
    <Container size="sm" py="lg">
      <Stack>
        <TituloDaTela>Partida</TituloDaTela>
        {valida ? (
          <>
            <Alert variant="light" title="Jogo em construção">
              O jogo entra na próxima fase. Sua seleção já está guardada.
            </Alert>
            <Text fw={600}>
              {NOME_DO_INSTRUMENTO[selecao.instrumento]}, {selecao.modo === 'nota' ? 'notas' : 'acordes'},{' '}
              {itens.length} itens
            </Text>
            <Group gap={6}>
              {itens.map((item) => (
                <Badge key={cifra(item)} variant="outline" size="lg">
                  {cifra(item)}
                </Badge>
              ))}
            </Group>
          </>
        ) : (
          <Text>Nenhuma seleção válida. Escolha pelo menos 2 itens para jogar.</Text>
        )}
        <Group>
          <Button component="a" href="#/jogo" variant="light">
            Mudar a seleção
          </Button>
          <Button component="a" href="#/biblioteca" variant="subtle">
            Treinar na biblioteca
          </Button>
        </Group>
      </Stack>
    </Container>
  )
}
