// Peças usadas em várias telas.

import { Anchor, Container, Group, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { INICIO, type Rota } from './rotas'
import { EscolhaDeTema } from './tema'
import { NOME_DO_SISTEMA } from './textos'

/** Título da tela; recebe o foco na troca de tela (leitor de tela e teclado). */
export function TituloDaTela({ children }: { children: ReactNode }) {
  return (
    <Title order={1} tabIndex={-1} className="titulo-da-tela">
      {children}
    </Title>
  )
}

/** Barra comum no topo: volta ao início e escolha do tema. */
export function Barra({ rota }: { rota: Rota }) {
  return (
    <Container size="md" py="sm" component="header">
      <Group justify="space-between" wrap="nowrap">
        {rota === INICIO ? (
          <Text fw={700} size="sm" c="dimmed">
            {NOME_DO_SISTEMA}
          </Text>
        ) : (
          <Anchor href={INICIO} fw={600} underline="never">
            ← Início
          </Anchor>
        )}
        <EscolhaDeTema />
      </Group>
    </Container>
  )
}
