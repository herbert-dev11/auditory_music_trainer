// Tela provisória da teoria musical (RF19, plans/009): o conteúdo entra num plano próprio.

import { Alert, Anchor, Container, List, Stack, Text } from '@mantine/core'
import { TituloDaTela } from './Comum'

export function Teoria() {
  return (
    <Container size="sm" py="lg">
      <Stack>
        <TituloDaTela>Teoria musical</TituloDaTela>
        <Alert variant="light" title="Em breve">
          Esta parte ainda está sendo escrita.
        </Alert>
        <Text>Ela vai explicar:</Text>
        <List spacing="xs">
          <List.Item>O que é uma nota e como se chamam (dó, ré, mi...)</List.Item>
          <List.Item>Sustenido e bemol: por que dó sustenido e ré bemol são a mesma nota</List.Item>
          <List.Item>Como um acorde é formado: maior, menor, com sétima</List.Item>
          <List.Item>Progressões de acordes</List.Item>
        </List>
        <Text>
          Enquanto isso, a <Anchor href="#/biblioteca">Biblioteca de sons</Anchor> mostra o desenho e as notas de
          cada acorde.
        </Text>
      </Stack>
    </Container>
  )
}
