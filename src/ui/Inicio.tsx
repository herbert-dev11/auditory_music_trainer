// Tela inicial (RF01, plans/009): nome do sistema e as opções principais.

import { Anchor, Badge, Card, Container, Group, SimpleGrid, Stack, Text } from '@mantine/core'
import { TituloDaTela } from './Comum'
import { NOME_DO_SISTEMA } from './textos'

interface Opcao {
  href?: string
  titulo: string
  detalhe: string
  principal?: boolean
}

function CartaoDoMenu({ href, titulo, detalhe, principal }: Opcao) {
  const desabilitado = !href
  return (
    <Card
      component={desabilitado ? 'div' : 'a'}
      href={href}
      withBorder
      padding="lg"
      radius="lg"
      className="cartao-menu"
      data-principal={principal || undefined}
      data-desabilitado={desabilitado || undefined}
      aria-disabled={desabilitado || undefined}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Text fw={700} size="lg">
          {titulo}
        </Text>
        {desabilitado && (
          <Badge variant="light" color="gray">
            Em breve
          </Badge>
        )}
      </Group>
      <Text size="sm" mt={4} className="detalhe">
        {detalhe}
      </Text>
    </Card>
  )
}

export function Inicio() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="xs" align="center" ta="center" mb="xl">
        <TituloDaTela>{NOME_DO_SISTEMA}</TituloDaTela>
        <Text size="lg" c="dimmed" maw={480}>
          Ouça uma nota ou um acorde de violão ou de piano e responda falando o nome.
        </Text>
      </Stack>
      <nav aria-label="Menu principal">
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
          <CartaoDoMenu href="#/jogo" titulo="Iniciar jogo" detalhe="Escolha o instrumento e o que treinar" principal />
          <CartaoDoMenu href="#/biblioteca" titulo="Biblioteca de sons" detalhe="Ouça e veja as notas e os acordes" />
          <CartaoDoMenu href="#/teoria" titulo="Teoria musical" detalhe="Notas, acordes, sustenido e bemol" />
          {/* Contas só com o back-end (RF23, plans/002). */}
          <CartaoDoMenu titulo="Entrar / Sair" detalhe="Contas de usuário" />
        </SimpleGrid>
      </nav>
      {/* Ferramenta de teste da fase 4 (plans/012), não faz parte do jogo. */}
      <Text ta="center" size="sm" mt="xl">
        <Anchor href="#/teste-da-fala" c="dimmed">
          Teste da fala
        </Anchor>
      </Text>
    </Container>
  )
}
