// Página de teste da fala (fase 4, plans/012): o que o Chrome e o iPhone entendem quando se fala
// uma nota ou um acorde. Mostra as alternativas, classifica e exporta em CSV para a fase 5.

import {
  Alert,
  Badge,
  Button,
  Container,
  Group,
  NativeSelect,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import {
  classificar,
  nomeDoNavegador,
  paraCsv,
  resumir,
  ROTULO_DA_CLASSE,
  type ClasseDaTentativa,
  type Tentativa,
} from '../exercicio/testeDaFala'
import { TituloDaTela } from './Comum'
import { useDependencias } from './contexto'

const LIVRE = '(fala livre)'

/** Palavras para testar: notas, bemóis e os acordes dos casos do docs/nomenclatura.md. */
const PALAVRAS: { grupo: string; itens: string[] }[] = [
  { grupo: 'Notas naturais', itens: ['dó', 'ré', 'mi', 'fá', 'sol', 'lá', 'si'] },
  { grupo: 'Sustenidos', itens: ['dó sustenido', 'ré sustenido', 'fá sustenido', 'sol sustenido', 'lá sustenido'] },
  { grupo: 'Bemóis', itens: ['ré bemol', 'mi bemol', 'sol bemol', 'lá bemol', 'si bemol'] },
  {
    grupo: 'Acordes',
    itens: [
      'dó maior',
      'sol maior',
      'lá menor',
      'dó sustenido menor',
      'ré com sétima',
      'mi bemol menor com sétima',
      'fá com sétima maior',
    ],
  },
]

const COR_DA_CLASSE: Record<ClasseDaTentativa, string> = {
  primeira: 'green',
  outra: 'yellow',
  diferente: 'red',
  livre: 'gray',
  silencio: 'gray',
  erro: 'red',
}

const MENSAGEM_DE_ERRO: Record<string, string> = {
  'not-allowed': 'O microfone foi bloqueado. Libere o microfone para este site nas configurações do navegador.',
  'service-not-allowed': 'O serviço de fala não está liberado. No iPhone, confira se o Ditado ou a Siri estão ativados.',
  'audio-capture': 'Nenhum microfone encontrado.',
  network: 'Sem conexão com o serviço de fala. O reconhecimento precisa de internet.',
  'language-not-supported': 'O português do Brasil não está disponível neste navegador.',
  'sem-suporte': 'Este navegador não reconhece fala.',
}

const porcentagem = (valor: number | null) => (valor === null ? '—' : `${Math.round(valor * 100)}%`)

export function TesteDaFala() {
  const { reconhecedor } = useDependencias()
  const navegador = useMemo(() => nomeDoNavegador(navigator.userAgent), [])
  const [esperado, setEsperado] = useState('dó')
  const [ouvindo, setOuvindo] = useState(false)
  const [tentativas, setTentativas] = useState<Tentativa[]>([])
  const [aviso, setAviso] = useState('')

  // Ao sair da página, o microfone fecha.
  useEffect(() => () => reconhecedor.parar(), [reconhecedor])

  const ultima = tentativas[0]
  const resumo = resumir(tentativas)

  const falar = async () => {
    setOuvindo(true)
    setAviso('')
    const palavra = esperado === LIVRE ? null : esperado
    const resultado = await reconhecedor.ouvir()
    setOuvindo(false)

    const base = { numero: tentativas.length + 1, navegador, esperado: palavra }
    const nova: Tentativa =
      resultado.tipo === 'fala'
        ? {
            ...base,
            alternativas: resultado.alternativas,
            latenciaMs: resultado.latenciaMs,
            classe: classificar(palavra, resultado.alternativas.map((a) => a.texto)),
          }
        : resultado.tipo === 'silencio'
          ? { ...base, alternativas: [], latenciaMs: null, classe: 'silencio' }
          : { ...base, alternativas: [], latenciaMs: null, classe: 'erro', codigoDeErro: resultado.codigo }
    // Mais recente primeiro.
    setTentativas((anteriores) => [nova, ...anteriores])
  }

  const parar = () => {
    reconhecedor.parar()
    setOuvindo(false)
  }

  const csv = () => paraCsv([...tentativas].reverse())
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(csv())
      setAviso('Resultados copiados.')
    } catch {
      setAviso('Não foi possível copiar. Use "Baixar CSV".')
    }
  }
  const baixar = () => {
    const url = URL.createObjectURL(new Blob([csv()], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `teste-da-fala-${navegador.replace(/\W+/g, '-').toLowerCase()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Container size="sm" py="lg">
      <Stack gap="lg">
        <div>
          <TituloDaTela>Teste da fala</TituloDaTela>
          <Text c="dimmed">
            Escolha uma palavra, toque em Falar e diga a palavra. A página mostra o que o navegador entendeu.
          </Text>
        </div>

        <Alert variant="light" title="Privacidade">
          Ao falar, o áudio vai para o serviço de reconhecimento do navegador (Google no Chrome, Apple no iPhone). O
          app não grava nem guarda a sua voz; guarda só o texto, nesta página, até você sair dela.
        </Alert>

        {!reconhecedor.disponivel && (
          <Alert color="red" variant="light" title="Este navegador não reconhece fala">
            Use o Chrome (computador ou Android) ou o iPhone. Navegador detectado: {navegador}.
          </Alert>
        )}

        <Paper withBorder p="lg" radius="lg">
          <Stack>
            <NativeSelect
              label="Palavra esperada"
              value={esperado}
              onChange={(e) => setEsperado(e.currentTarget.value)}
              disabled={ouvindo}
              size="md"
            >
              <option value={LIVRE}>{LIVRE}</option>
              {PALAVRAS.map(({ grupo, itens }) => (
                <optgroup key={grupo} label={grupo}>
                  {itens.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </optgroup>
              ))}
            </NativeSelect>

            {ouvindo ? (
              <Button size="xl" fullWidth color="red" variant="light" onClick={parar}>
                Ouvindo... fale agora (toque para parar)
              </Button>
            ) : (
              <Button size="xl" fullWidth onClick={falar} disabled={!reconhecedor.disponivel}>
                Falar
              </Button>
            )}

            <Text size="sm" role="status" c="dimmed" mih={20}>
              {ouvindo ? `Diga: "${esperado === LIVRE ? 'qualquer coisa' : esperado}"` : aviso}
            </Text>

            {ultima && !ouvindo && <ResultadoDaTentativa tentativa={ultima} />}
          </Stack>
        </Paper>

        {tentativas.length > 0 && (
          <Stack gap="sm">
            <Title order={2} size="h4">
              Sessão ({navegador})
            </Title>
            <SimpleGrid cols={{ base: 2, xs: 4 }} spacing="xs">
              <Numero titulo="Tentativas" valor={String(resumo.total)} />
              <Numero titulo="Na 1ª alternativa" valor={porcentagem(resumo.taxaNaPrimeira)} />
              <Numero titulo="Em alguma" valor={porcentagem(resumo.taxaEmAlguma)} />
              <Numero
                titulo="Tempo médio"
                valor={resumo.latenciaMediaMs === null ? '—' : `${resumo.latenciaMediaMs} ms`}
              />
            </SimpleGrid>
            <Group gap="xs">
              <Button variant="light" onClick={copiar}>
                Copiar CSV
              </Button>
              <Button variant="light" onClick={baixar}>
                Baixar CSV
              </Button>
              <Button variant="subtle" color="gray" onClick={() => setTentativas([])}>
                Limpar
              </Button>
            </Group>
            <Table.ScrollContainer minWidth={520}>
              <Table striped verticalSpacing="xs" fz="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>#</Table.Th>
                    <Table.Th>Esperado</Table.Th>
                    <Table.Th>Entendido</Table.Th>
                    <Table.Th>Resultado</Table.Th>
                    <Table.Th>Tempo</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {tentativas.map((t) => (
                    <Table.Tr key={t.numero}>
                      <Table.Td>{t.numero}</Table.Td>
                      <Table.Td>{t.esperado ?? '—'}</Table.Td>
                      <Table.Td>{t.alternativas.map((a) => a.texto).join(' | ') || '—'}</Table.Td>
                      <Table.Td>
                        <Badge color={COR_DA_CLASSE[t.classe]} variant="light">
                          {ROTULO_DA_CLASSE[t.classe]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{t.latenciaMs === null ? '—' : `${t.latenciaMs} ms`}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Stack>
        )}
      </Stack>
    </Container>
  )
}

function ResultadoDaTentativa({ tentativa }: { tentativa: Tentativa }) {
  if (tentativa.classe === 'erro') {
    return (
      <Alert color="red" variant="light" title="Erro do reconhecimento">
        {MENSAGEM_DE_ERRO[tentativa.codigoDeErro ?? ''] ?? `Código do navegador: ${tentativa.codigoDeErro}`}
      </Alert>
    )
  }
  if (tentativa.classe === 'silencio') {
    return <Text>Nada foi ouvido. Toque em Falar e diga a palavra logo em seguida.</Text>
  }
  return (
    <Stack gap={6}>
      <Group gap="xs">
        <Text fw={600}>Entendi:</Text>
        <Badge color={COR_DA_CLASSE[tentativa.classe]} variant="light">
          {ROTULO_DA_CLASSE[tentativa.classe]}
        </Badge>
        {tentativa.latenciaMs !== null && (
          <Text size="sm" c="dimmed">
            {tentativa.latenciaMs} ms
          </Text>
        )}
      </Group>
      {tentativa.alternativas.length === 0 ? (
        <Text c="dimmed">O navegador ouviu, mas não reconheceu nenhuma palavra.</Text>
      ) : (
        <ol className="alternativas">
          {tentativa.alternativas.map((a, i) => (
            <li key={i}>
              <Text span fw={i === 0 ? 700 : 400} size={i === 0 ? 'xl' : 'md'}>
                {a.texto}
              </Text>{' '}
              <Text span size="xs" c="dimmed">
                {a.confianca > 0 ? `${Math.round(a.confianca * 100)}%` : 'sem confiança informada'}
              </Text>
            </li>
          ))}
        </ol>
      )}
    </Stack>
  )
}

function Numero({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <Paper withBorder p="sm" radius="md">
      <Text size="xs" c="dimmed">
        {titulo}
      </Text>
      <Text fw={700} size="lg">
        {valor}
      </Text>
    </Paper>
  )
}
