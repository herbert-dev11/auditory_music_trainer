// Tela "Novo jogo": seleção do que treinar (UC01, RF02, RN07, plans/009).

import { Alert, Badge, Button, Checkbox, Container, Group, Paper, Radio, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useEffect, useState, type ReactNode } from 'react'
import type { ModoDeJogo, Raiz, Selecao as SelecaoDoJogo } from '../contratos/selecao'
import { INSTRUMENTOS, NOME_DO_INSTRUMENTO, type Instrumento } from '../dominio/instrumentos'
import { cifra, nomeFalado, QUALIDADES, type Qualidade } from '../dominio/itens'
import { itensDaSelecao, MINIMO_DE_ITENS, podeComecar, RAIZES, SELECAO_PADRAO } from '../exercicio/selecao'
import { TituloDaTela } from './Comum'
import { useDependencias } from './contexto'
import { irPara } from './rotas'
import { NOME_DA_RAIZ, TITULO_DO_GRUPO } from './textos'

// O valor de um campo não pode ser vazio: a qualidade '' (maior) vira 'maior' na tela.
const idDaQualidade = (q: Qualidade) => (q === '' ? 'maior' : q)
const qualidadeDoId = (id: string) => (id === 'maior' ? '' : id) as Qualidade

function ConteudoDoCartao({ titulo, detalhe, indicador }: { titulo: string; detalhe?: string; indicador: ReactNode }) {
  return (
    <Group wrap="nowrap" align="flex-start">
      {indicador}
      <div>
        <Text fw={600}>{titulo}</Text>
        {detalhe && (
          <Text size="sm" c="dimmed">
            {detalhe}
          </Text>
        )}
      </div>
    </Group>
  )
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Stack gap="xs">
      <Title order={2} size="h4">
        {titulo}
      </Title>
      {children}
    </Stack>
  )
}

export function Selecao() {
  const { preferencias } = useDependencias()
  const [selecao, setSelecao] = useState<SelecaoDoJogo>(() => preferencias.ultimaSelecao() ?? SELECAO_PADRAO)

  // A última seleção fica guardada a cada mudança.
  useEffect(() => preferencias.salvarUltimaSelecao(selecao), [preferencias, selecao])

  const mudar = (parcial: Partial<SelecaoDoJogo>) => setSelecao((atual) => ({ ...atual, ...parcial }))
  const itens = itensDaSelecao(selecao)
  const pronto = podeComecar(selecao)

  return (
    <Container size="md" py="lg">
      <Stack gap="xl">
        <div>
          <TituloDaTela>Novo jogo</TituloDaTela>
          <Text c="dimmed">Escolha o instrumento e o que vai entrar no jogo.</Text>
        </div>

        <Radio.Group value={selecao.instrumento} onChange={(v) => mudar({ instrumento: v as Instrumento })} aria-label="Instrumento">
          <Secao titulo="Instrumento">
            <SimpleGrid cols={{ base: 1, xs: 2 }}>
              {INSTRUMENTOS.map((i) => (
                <Radio.Card key={i} value={i} className="cartao-opcao" p="md">
                  <ConteudoDoCartao titulo={NOME_DO_INSTRUMENTO[i]} indicador={<Radio.Indicator />} />
                </Radio.Card>
              ))}
            </SimpleGrid>
          </Secao>
        </Radio.Group>

        <Radio.Group value={selecao.modo} onChange={(v) => mudar({ modo: v as ModoDeJogo })} aria-label="O que treinar">
          <Secao titulo="O que treinar">
            <SimpleGrid cols={{ base: 1, xs: 2 }}>
              <Radio.Card value="nota" className="cartao-opcao" p="md">
                <ConteudoDoCartao titulo="Notas" detalhe='Uma nota de cada vez: "dó", "ré sustenido"' indicador={<Radio.Indicator />} />
              </Radio.Card>
              <Radio.Card value="acorde" className="cartao-opcao" p="md">
                <ConteudoDoCartao titulo="Acordes" detalhe='Várias notas juntas: "lá menor", "sol com sétima"' indicador={<Radio.Indicator />} />
              </Radio.Card>
            </SimpleGrid>
          </Secao>
        </Radio.Group>

        <Checkbox.Group value={selecao.raizes} onChange={(v) => mudar({ raizes: v as Raiz[] })} aria-label="Notas de base">
          <Secao titulo="Notas de base">
            <SimpleGrid cols={{ base: 1, xs: 2 }}>
              {RAIZES.map((r) => (
                <Checkbox.Card key={r} value={r} className="cartao-opcao" p="md">
                  <ConteudoDoCartao titulo={NOME_DA_RAIZ[r].titulo} detalhe={NOME_DA_RAIZ[r].exemplo} indicador={<Checkbox.Indicator />} />
                </Checkbox.Card>
              ))}
            </SimpleGrid>
          </Secao>
        </Checkbox.Group>

        {selecao.modo === 'acorde' && (
          <Checkbox.Group
            value={selecao.qualidades.map(idDaQualidade)}
            onChange={(v) => mudar({ qualidades: v.map(qualidadeDoId) })}
            aria-label="Tipos de acorde"
          >
            <Secao titulo="Tipos de acorde">
              <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }}>
                {QUALIDADES.map((q) => (
                  <Checkbox.Card key={idDaQualidade(q)} value={idDaQualidade(q)} className="cartao-opcao" p="md">
                    <ConteudoDoCartao titulo={TITULO_DO_GRUPO[q]} indicador={<Checkbox.Indicator />} />
                  </Checkbox.Card>
                ))}
              </SimpleGrid>
            </Secao>
          </Checkbox.Group>
        )}

        <Paper withBorder p="lg" radius="lg">
          <Stack>
            <Text fw={700} role="status">
              {itens.length} {itens.length === 1 ? 'item' : 'itens'} no jogo
            </Text>
            {itens.length > 0 && (
              <Group gap={6} aria-label="Itens no jogo">
                {itens.map((item) => (
                  <Badge key={cifra(item)} variant="light" size="lg" title={nomeFalado(item)}>
                    {cifra(item)}
                  </Badge>
                ))}
              </Group>
            )}
            {!pronto && (
              <Alert variant="light" color="orange">
                Selecione pelo menos {MINIMO_DE_ITENS} itens.
              </Alert>
            )}
            <Group>
              <Button size="md" disabled={!pronto} onClick={() => irPara('#/jogo/partida')}>
                Começar
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
