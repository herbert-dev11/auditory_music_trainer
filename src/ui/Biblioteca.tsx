// Biblioteca de sons (UC03, RF16): todas as notas e acordes, com abas Violão / Piano (RF22),
// desenho e demonstração nota por nota (RF26), modo simplificado (RF28) e anúncio por voz (RF25).

import {
  Alert,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { inicioDoUltimoPasso, roteiroDoAcorde, roteiroNotaPorNota, type Passo } from '../dominio/demonstracao'
import { INSTRUMENTOS, NOME_DO_INSTRUMENTO, voicing, type Instrumento } from '../dominio/instrumentos'
import { cifra, nomeFalado, QUALIDADES, todosOsItens, type Item } from '../dominio/itens'
import { casas, pestana } from '../dominio/violao'
import { TituloDaTela } from './Comum'
import { useDependencias } from './contexto'
import { descricaoDoPiano, descricaoDoViolao, DiagramaDoPiano, DiagramaDoViolao } from './Diagramas'
import { TITULO_DO_GRUPO } from './textos'

/** O nome é dito logo depois que o som acaba, para a voz não cobrir a nota (plano 005). */
const FOLGA_DA_VOZ_MS = 250

type Carga = 'carregando' | 'pronto' | 'erro'

const ITENS = todosOsItens()
const GRUPOS: { titulo: string; itens: Item[] }[] = [
  { titulo: 'Notas', itens: ITENS.filter((i) => i.tipo === 'nota') },
  ...QUALIDADES.map((q) => ({
    titulo: TITULO_DO_GRUPO[q],
    itens: ITENS.filter((i) => i.tipo === 'acorde' && i.qualidade === q),
  })),
]

const chave = (item: Item) => `${item.tipo}:${cifra(item)}`

export function Biblioteca() {
  const { tocadores, narrador, preferencias } = useDependencias()
  const [ativo, setAtivo] = useState<Instrumento>('violao')
  const [carga, setCarga] = useState<Record<Instrumento, Carga | undefined>>({ violao: undefined, piano: undefined })
  const [selecionado, setSelecionado] = useState<Item | null>(null)
  const [acesos, setAcesos] = useState<number[]>([])
  const [status, setStatus] = useState('')
  const [anunciar, setAnunciar] = useState(() => preferencias.anunciarNomes())
  const [simplificado, setSimplificado] = useState(() => preferencias.simplificado())

  // A voz é lida dentro de passos agendados; o ref evita ler um valor velho.
  const anunciarRef = useRef(anunciar)
  anunciarRef.current = anunciar

  // --- Agenda da demonstração (cancelada a cada clique novo, troca de aba e ao sair da tela) ---
  const agendados = useRef<number[]>([])
  const cancelar = useCallback(() => {
    agendados.current.forEach(clearTimeout)
    agendados.current = []
    narrador.calar()
    setAcesos([])
  }, [narrador])
  useEffect(() => cancelar, [cancelar])
  const agendar = (emMs: number, acao: () => void) => agendados.current.push(window.setTimeout(acao, emMs))

  // --- Carregamento dos sons do instrumento ativo (o tocador só baixa uma vez) ---
  const carregar = useCallback(
    (instrumento: Instrumento) => {
      setCarga((c) => (c[instrumento] === 'pronto' ? c : { ...c, [instrumento]: 'carregando' }))
      tocadores[instrumento]
        .carregar()
        .then(() => setCarga((c) => ({ ...c, [instrumento]: 'pronto' })))
        .catch(() => setCarga((c) => ({ ...c, [instrumento]: 'erro' })))
    },
    [tocadores],
  )
  useEffect(() => carregar(ativo), [ativo, carregar])
  const pronto = carga[ativo] === 'pronto'

  const demonstrar = (item: Item, modo: 'nota-por-nota' | 'acorde') => {
    cancelar()
    const instrumento = ativo
    const midis = voicing(instrumento, item, simplificado)
    const roteiro = modo === 'nota-por-nota' ? roteiroNotaPorNota(midis.length) : roteiroDoAcorde(midis.length)
    const ultimo = inicioDoUltimoPasso(roteiro)
    setStatus(`Tocando no ${NOME_DO_INSTRUMENTO[instrumento].toLowerCase()}: ${nomeFalado(item)} (${cifra(item)})`)

    const executar = async (passo: Passo) => {
      setAcesos(passo.indices)
      try {
        const restanteMs = await tocadores[instrumento].tocar(passo.indices.map((i) => midis[i]))
        if (passo.emMs !== ultimo) return
        // Último passo: espera o som acabar para apagar o desenho e dizer o nome.
        agendar(restanteMs, () => setAcesos([]))
        if (anunciarRef.current) agendar(restanteMs + FOLGA_DA_VOZ_MS, () => narrador.falar(nomeFalado(item)))
      } catch {
        setStatus('Não foi possível tocar o som.')
      }
    }

    // O primeiro passo roda já, dentro do clique: o navegador só libera o áudio num gesto do usuário.
    roteiro.forEach((passo) => (passo.emMs === 0 ? void executar(passo) : agendar(passo.emMs, () => void executar(passo))))
  }

  const selecionar = (item: Item) => {
    setSelecionado(item)
    demonstrar(item, 'nota-por-nota')
  }

  const trocarInstrumento = (valor: string | null) => {
    if (!valor) return
    cancelar()
    setAtivo(valor as Instrumento)
  }

  const conteudo = (
    <Stack gap="lg" pt="md">
      <Group justify="space-between">
        <Text size="sm" c="dimmed" role="status" mih={22}>
          {carga[ativo] === 'carregando' ? (
            <Group gap={8} component="span">
              <Loader size="xs" /> Carregando sons de {NOME_DO_INSTRUMENTO[ativo].toLowerCase()}...
            </Group>
          ) : (
            status || (pronto ? 'Clique num item para ver o desenho e ouvir nota por nota.' : '')
          )}
        </Text>
        <Switch
          label="Anunciar nomes por voz"
          checked={anunciar}
          onChange={(e) => {
            const ligado = e.currentTarget.checked
            setAnunciar(ligado)
            preferencias.salvarAnunciarNomes(ligado)
            if (!ligado) narrador.calar()
          }}
        />
      </Group>

      {carga[ativo] === 'erro' && (
        <Alert color="red" variant="light" title="Não foi possível carregar os sons">
          <Stack gap="xs" align="flex-start">
            <Text size="sm">Confira a conexão e tente de novo.</Text>
            <Button size="xs" variant="light" color="red" onClick={() => carregar(ativo)}>
              Tentar de novo
            </Button>
          </Stack>
        </Alert>
      )}

      {selecionado && (
        <PainelDoItem
          item={selecionado}
          instrumento={ativo}
          simplificado={simplificado}
          acesos={acesos}
          onDemonstrar={(modo) => demonstrar(selecionado, modo)}
          onSimplificado={(ligado) => {
            cancelar()
            setSimplificado(ligado)
            preferencias.salvarSimplificado(ligado)
          }}
        />
      )}

      {GRUPOS.map((grupo) => (
        <Stack key={grupo.titulo} gap="xs">
          <Title order={2} size="h4">
            {grupo.titulo}
          </Title>
          <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 6 }} spacing="xs">
            {grupo.itens.map((item) => (
              <UnstyledButton
                key={chave(item)}
                className="item"
                disabled={!pronto}
                data-selecionado={(selecionado && chave(selecionado) === chave(item)) || undefined}
                aria-label={`Tocar ${cifra(item)}, ${nomeFalado(item)}`}
                onClick={() => selecionar(item)}
              >
                <Text fw={700} size="xl" lh={1.2}>
                  {cifra(item)}
                </Text>
                <Text size="xs" c="dimmed">
                  {nomeFalado(item)}
                </Text>
              </UnstyledButton>
            ))}
          </SimpleGrid>
        </Stack>
      ))}
    </Stack>
  )

  return (
    <Container size="md" py="lg">
      <Stack gap={4} mb="md">
        <TituloDaTela>Biblioteca de sons</TituloDaTela>
        <Text c="dimmed">Ouça e veja as notas e os acordes antes de jogar.</Text>
      </Stack>

      <Tabs value={ativo} onChange={trocarInstrumento} keepMounted={false}>
        <Tabs.List>
          {INSTRUMENTOS.map((i) => (
            <Tabs.Tab key={i} value={i} fz="md" fw={600}>
              {NOME_DO_INSTRUMENTO[i]}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {INSTRUMENTOS.map((i) => (
          <Tabs.Panel key={i} value={i}>
            {conteudo}
          </Tabs.Panel>
        ))}
      </Tabs>

      <Creditos />
    </Container>
  )
}

interface PropsDoPainel {
  item: Item
  instrumento: Instrumento
  simplificado: boolean
  acesos: number[]
  onDemonstrar: (modo: 'nota-por-nota' | 'acorde') => void
  onSimplificado: (ligado: boolean) => void
}

/** Painel do item selecionado, fixo no topo enquanto a lista rola (plano 006). */
function PainelDoItem({ item, instrumento, simplificado, acesos, onDemonstrar, onSimplificado }: PropsDoPainel) {
  const ehAcorde = item.tipo === 'acorde'
  const noViolao = instrumento === 'violao'
  const desenho = casas(item, simplificado)
  const barra = pestana(item, simplificado)
  const midis = voicing(instrumento, item, simplificado)
  const descricao = noViolao ? descricaoDoViolao(desenho, barra) : descricaoDoPiano(midis)

  return (
    <Paper withBorder shadow="md" p="md" radius="lg" className="painel-do-item" aria-label="Item selecionado">
      <Group justify="space-between" align="center" wrap="wrap" gap="lg">
        <Stack gap={6}>
          <Group gap="xs" align="baseline">
            <Title order={2}>{cifra(item)}</Title>
            <Text c="dimmed">{nomeFalado(item)}</Text>
          </Group>
          <Text size="sm" c="dimmed">
            {descricao}
          </Text>
          <Group gap="xs" mt={4}>
            {ehAcorde && (
              <Button variant="light" onClick={() => onDemonstrar('nota-por-nota')}>
                Nota por nota
              </Button>
            )}
            <Button variant="default" onClick={() => onDemonstrar('acorde')}>
              {ehAcorde ? 'Acorde' : 'Tocar de novo'}
            </Button>
          </Group>
          {ehAcorde && noViolao && (
            <Switch
              mt={4}
              label="Simplificado"
              description="Versão mais fácil do acorde"
              checked={simplificado}
              onChange={(e) => onSimplificado(e.currentTarget.checked)}
            />
          )}
        </Stack>
        {noViolao ? (
          <DiagramaDoViolao casas={desenho} pestana={barra} acesos={acesos} />
        ) : (
          <DiagramaDoPiano midis={midis} acesos={acesos} />
        )}
      </Group>
    </Paper>
  )
}

/** Crédito obrigatório dos sons (CC BY, RNF05). Texto em CREDITS.md. */
function Creditos() {
  const link = (href: string, texto: string) => (
    <a href={href} target="_blank" rel="noopener">
      {texto}
    </a>
  )
  const ccBy = link('https://creativecommons.org/licenses/by/3.0/', 'CC BY 3.0')
  return (
    <Stack component="footer" gap={4} mt={48} pt="md" className="creditos">
      <Text size="xs" c="dimmed">
        Violão nylon: "ClassicalGuitar-multisampled", de{' '}
        {link('https://freesound.org/people/quartertone/packs/11573/', 'quartertone (Freesound)')}, licença {ccBy}.
        Reempacotado por Nicholaus P. Brosowsky em{' '}
        {link('https://github.com/nbrosowsky/tonejs-instruments', 'tonejs-instruments')}.
      </Text>
      <Text size="xs" c="dimmed">
        Piano: {link('https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html', 'Salamander Grand Piano')}, de
        Alexander Holm, licença {ccBy}. Versão em mp3 do projeto {link('https://github.com/Tonejs/audio', 'Tone.js audio')}.
      </Text>
    </Stack>
  )
}
