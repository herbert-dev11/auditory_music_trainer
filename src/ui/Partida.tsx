// Tela do jogo, respondido por voz (UC02, plans/011). A máquina de estados (exercicio/partida.ts) decide;
// esta tela agenda o tempo, toca, pergunta, escuta, interpreta e manda os eventos.

import { Alert, Badge, Button, Container, Group, List, Paper, Progress, Stack, Text, Title } from '@mantine/core'
import { useEffect, useMemo, useReducer, useState } from 'react'
import type { Selecao } from '../contratos/selecao'
import { interpretarAlternativas } from '../dominio/interpretacao'
import { NOME_DO_INSTRUMENTO, voicing } from '../dominio/instrumentos'
import { cifra, nomeFalado, type Item } from '../dominio/itens'
import { novaPartida, reduzir, TEMPO_PARA_RESPONDER_MS, type EstadoDaPartida } from '../exercicio/partida'
import { itensDaSelecao, podeComecar } from '../exercicio/selecao'
import { TituloDaTela } from './Comum'
import { useDependencias } from './contexto'

/** Depois de um acerto, quanto esperar antes do próximo item. */
const PAUSA_DEPOIS_DO_ACERTO_MS = 400
/** Depois do som certo, no erro, quanto esperar antes do resultado. */
const PAUSA_ANTES_DO_RESULTADO_MS = 600

const MENSAGEM_DE_ERRO_DA_FALA: Record<string, string> = {
  'not-allowed': 'O microfone foi bloqueado. Libere o microfone para este site nas configurações do navegador.',
  'service-not-allowed': 'O reconhecimento de fala não está liberado. No iPhone, confira se o Ditado está ativado.',
  'audio-capture': 'Nenhum microfone encontrado.',
  network: 'Sem conexão com o serviço de fala. O reconhecimento precisa de internet.',
}

const nomeComCifra = (item: Item) => `${nomeFalado(item)} (${cifra(item)})`

export function Partida() {
  const { preferencias } = useDependencias()
  const [selecao] = useState(() => preferencias.ultimaSelecao())

  if (!selecao || !podeComecar(selecao)) {
    return (
      <Container size="sm" py="lg">
        <Stack>
          <TituloDaTela>Partida</TituloDaTela>
          <Text>Nenhuma seleção válida. Escolha pelo menos 2 itens para jogar.</Text>
          <Group>
            <Button component="a" href="#/jogo">
              Escolher o que treinar
            </Button>
          </Group>
        </Stack>
      </Container>
    )
  }
  return <Jogo selecao={selecao} />
}

function Jogo({ selecao }: { selecao: Selecao }) {
  const { tocadores, narrador, reconhecedor } = useDependencias()
  const itens = useMemo(() => itensDaSelecao(selecao), [selecao])
  const [estado, despachar] = useReducer(reduzir, itens, novaPartida)
  const [carga, setCarga] = useState<'carregando' | 'pronto' | 'erro'>('carregando')
  const [erroDeFala, setErroDeFala] = useState<string | null>(null)
  const [erroDeSom, setErroDeSom] = useState(false)
  const [inicioDaEscuta, setInicioDaEscuta] = useState<number | null>(null)
  // Muda para reabrir o microfone depois de um erro do reconhecimento ("Tentar de novo").
  const [tentativaDeEscuta, setTentativaDeEscuta] = useState(0)

  const tocador = tocadores[selecao.instrumento]
  const limiteMs = TEMPO_PARA_RESPONDER_MS[selecao.modo]
  const pergunta = selecao.modo === 'nota' ? 'Que nota é essa?' : 'Que acorde é esse?'

  useEffect(() => {
    tocador
      .carregar()
      .then(() => setCarga('pronto'))
      .catch(() => setCarga('erro'))
  }, [tocador])

  // Ao sair da tela: fecha o microfone e cala a voz.
  useEffect(
    () => () => {
      reconhecedor.parar()
      narrador.calar()
    },
    [reconhecedor, narrador],
  )

  // Efeitos de cada fase. A limpeza cancela o que estava em andamento quando a fase muda.
  useEffect(() => {
    let cancelada = false
    const relogios: number[] = []
    const esperar = (ms: number) => new Promise<void>((pronto) => relogios.push(window.setTimeout(pronto, ms)))
    const { fase, atual } = estado
    const tocar = (item: Item) => tocador.tocar(voicing(selecao.instrumento, item, false))

    switch (fase.nome) {
      case 'contagem':
        relogios.push(window.setTimeout(() => despachar({ tipo: 'tique', aleatorio: Math.random() }), 1000))
        break

      case 'tocando':
        // Som → espera acabar → pergunta → espera a voz → microfone (RF06, RF07, RNF02).
        void (async () => {
          try {
            const restanteMs = await tocar(atual as Item)
            await esperar(restanteMs)
            if (cancelada) return
            await narrador.falar(pergunta)
            if (!cancelada) despachar({ tipo: 'prontoParaOuvir' })
          } catch {
            if (!cancelada) setErroDeSom(true)
          }
        })()
        break

      case 'ouvindo':
        void (async () => {
          setErroDeFala(null)
          const inicio = performance.now()
          setInicioDaEscuta(inicio)
          const resultado = await reconhecedor.ouvir({ tempoMaximoMs: limiteMs })
          if (cancelada) return
          const tempoMs = Math.round(performance.now() - inicio)
          if (resultado.tipo === 'fala') {
            const textos = resultado.alternativas.map((a) => a.texto)
            const interpretado = interpretarAlternativas(textos, selecao.modo)
            despachar({
              tipo: 'respondeu',
              entendido: interpretado?.item ?? null,
              texto: interpretado?.texto ?? textos[0] ?? null,
              tempoMs,
            })
          } else if (resultado.tipo === 'silencio') {
            despachar({ tipo: 'silencio', tempoMs })
          } else {
            setErroDeFala(resultado.codigo)
          }
        })()
        break

      case 'acerto':
        void (async () => {
          await narrador.falar('Acertou!')
          await esperar(PAUSA_DEPOIS_DO_ACERTO_MS)
          if (!cancelada) despachar({ tipo: 'seguir', aleatorio: Math.random() })
        })()
        break

      case 'nao-entendi':
        // RN04: avisa e reabre o microfone, sem tocar de novo.
        void (async () => {
          await narrador.falar(fase.motivo === 'silencio' ? 'Não ouvi. Fale de novo.' : 'Não entendi. Fale de novo.')
          if (!cancelada) despachar({ tipo: 'continuarOuvindo' })
        })()
        break

      case 'erro':
        // E1: diz o certo, toca o som certo mais uma vez e mostra o resultado.
        void (async () => {
          await narrador.falar(`Errou! Era ${nomeFalado(atual as Item)}.`)
          if (cancelada) return
          try {
            const restanteMs = await tocar(atual as Item)
            await esperar(restanteMs + PAUSA_ANTES_DO_RESULTADO_MS)
          } catch {
            // Sem som, segue para o resultado mesmo assim.
          }
          if (!cancelada) despachar({ tipo: 'verResultado' })
        })()
        break
    }

    return () => {
      cancelada = true
      relogios.forEach(clearTimeout)
      if (fase.nome === 'ouvindo') reconhecedor.parar()
    }
    // A fase muda de objeto a cada transição; `tentativaDeEscuta` reabre o microfone depois de um erro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.fase, tentativaDeEscuta])

  /** O clique libera o áudio e a voz no navegador (no iPhone, só depois de um gesto). */
  const liberarAudioEVoz = () => {
    tocador.tocar([]).catch(() => {})
    void narrador.falar('Vamos começar!')
  }

  const parar = () => {
    reconhecedor.parar()
    narrador.calar()
    despachar({ tipo: 'parar' })
  }

  const { fase } = estado
  const emJogo = fase.nome !== 'explicacao' && fase.nome !== 'resultado'

  return (
    <Container size="sm" py="lg">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <TituloDaTela>Partida</TituloDaTela>
            <Text c="dimmed" size="sm">
              {NOME_DO_INSTRUMENTO[selecao.instrumento]} · {selecao.modo === 'nota' ? 'notas' : 'acordes'} ·{' '}
              {itens.length} itens
            </Text>
          </div>
          {emJogo && (
            <Badge size="xl" variant="light" aria-label={`Sequência de acertos: ${estado.sequencia}`}>
              {estado.sequencia} {estado.sequencia === 1 ? 'acerto' : 'acertos'}
            </Badge>
          )}
        </Group>

        {fase.nome === 'explicacao' && (
          <Explicacao
            carga={carga}
            disponivel={reconhecedor.disponivel}
            pergunta={pergunta}
            limiteMs={limiteMs}
            onComecar={() => {
              liberarAudioEVoz()
              despachar({ tipo: 'comecar' })
            }}
          />
        )}

        {emJogo && (
          <Paper withBorder radius="lg" p="xl" className="painel-do-jogo">
            <Stack align="center" ta="center" gap="md" aria-live="polite">
              <ConteudoDaFase
                estado={estado}
                pergunta={pergunta}
                limiteMs={limiteMs}
                inicioDaEscuta={inicioDaEscuta}
              />
            </Stack>
          </Paper>
        )}

        {erroDeFala && fase.nome === 'ouvindo' && (
          <Alert color="red" variant="light" title="Problema no reconhecimento de fala">
            <Stack gap="xs" align="flex-start">
              <Text size="sm">
                {MENSAGEM_DE_ERRO_DA_FALA[erroDeFala] ?? `O navegador devolveu o erro "${erroDeFala}".`}
              </Text>
              <Button size="xs" variant="light" color="red" onClick={() => setTentativaDeEscuta((n) => n + 1)}>
                Tentar de novo
              </Button>
            </Stack>
          </Alert>
        )}

        {erroDeSom && (
          <Alert color="red" variant="light" title="Não foi possível tocar o som">
            Confira a conexão e tente de novo mais tarde.
          </Alert>
        )}

        {emJogo && (
          <Group grow>
            <Button
              size="lg"
              variant="light"
              disabled={fase.nome !== 'ouvindo' && fase.nome !== 'nao-entendi'}
              onClick={() => despachar({ tipo: 'ouvirDeNovo' })}
            >
              Ouvir de novo
            </Button>
            <Button size="lg" variant="default" onClick={parar}>
              Parar
            </Button>
          </Group>
        )}

        {fase.nome === 'resultado' && (
          <Resultado
            estado={estado}
            onJogarDeNovo={() => {
              liberarAudioEVoz()
              despachar({ tipo: 'jogarDeNovo' })
            }}
          />
        )}
      </Stack>
    </Container>
  )
}

interface PropsDaExplicacao {
  carga: 'carregando' | 'pronto' | 'erro'
  disponivel: boolean
  pergunta: string
  limiteMs: number
  onComecar: () => void
}

/** RF03: como o jogo funciona, antes de começar. */
function Explicacao({ carga, disponivel, pergunta, limiteMs, onComecar }: PropsDaExplicacao) {
  return (
    <Paper withBorder radius="lg" p="lg">
      <Stack>
        <Title order={2} size="h3">
          Como funciona
        </Title>
        <List spacing="xs">
          <List.Item>Depois de uma contagem de 3 segundos, o app toca um som e pergunta "{pergunta}".</List.Item>
          <List.Item>
            Responda falando o nome, por exemplo{' '}
            {pergunta === 'Que nota é essa?' ? '"dó", "fá sustenido" ou "si bemol"' : '"dó", "lá menor" ou "sol com sétima"'}.
          </List.Item>
          <List.Item>Você tem {limiteMs / 1000} segundos para responder. Pode tocar em "Ouvir de novo" quando quiser.</List.Item>
          <List.Item>Se o app não entender, você tem mais uma chance. O jogo acaba no primeiro erro.</List.Item>
        </List>
        <Alert variant="light" title="Privacidade">
          O áudio da sua resposta vai para o serviço de reconhecimento do navegador (Google no Chrome, Apple no
          iPhone). O app não grava nem guarda a sua voz.
        </Alert>
        {!disponivel && (
          <Alert color="red" variant="light" title="Este navegador não reconhece fala">
            Para jogar, use o Chrome (computador ou Android) ou o iPhone.
          </Alert>
        )}
        {carga === 'erro' && (
          <Alert color="red" variant="light" title="Não foi possível carregar os sons">
            Confira a conexão e recarregue a página.
          </Alert>
        )}
        <Button size="xl" fullWidth onClick={onComecar} disabled={!disponivel || carga !== 'pronto'}>
          {carga === 'carregando' ? 'Carregando sons...' : 'Começar'}
        </Button>
      </Stack>
    </Paper>
  )
}

interface PropsDaFase {
  estado: EstadoDaPartida
  pergunta: string
  limiteMs: number
  inicioDaEscuta: number | null
}

function ConteudoDaFase({ estado, pergunta, limiteMs, inicioDaEscuta }: PropsDaFase) {
  const { fase, atual } = estado
  switch (fase.nome) {
    case 'contagem':
      return (
        <Text fw={800} className="contagem" aria-label={`Começa em ${fase.restante}`}>
          {fase.restante}
        </Text>
      )
    case 'tocando':
      return (
        <>
          <Text size="xl" fw={700}>
            Ouça...
          </Text>
          <Text c="dimmed">{pergunta}</Text>
        </>
      )
    case 'ouvindo':
      return (
        <>
          <Text size="xl" fw={700}>
            Fale agora
          </Text>
          <Text c="dimmed">{pergunta}</Text>
          {inicioDaEscuta !== null && <Cronometro inicio={inicioDaEscuta} limiteMs={limiteMs} />}
        </>
      )
    case 'acerto':
      return (
        <>
          <Text size="2rem" fw={800} c="green">
            Acertou!
          </Text>
          <Entendido item={fase.entendido} texto={fase.texto} />
        </>
      )
    case 'nao-entendi':
      return (
        <>
          <Text size="xl" fw={700} c="yellow.8">
            {fase.motivo === 'silencio' ? 'Não ouvi nada' : 'Não entendi'}
          </Text>
          <Text>Fale de novo. Esta é a sua segunda chance.</Text>
          {fase.motivo === 'nao-entendi' && <UltimoTexto estado={estado} />}
        </>
      )
    case 'erro':
      return (
        <>
          <Text size="2rem" fw={800} c="red">
            Errou!
          </Text>
          <Text size="lg">Era {nomeComCifra(atual as Item)}.</Text>
          {fase.entendido ? (
            <Entendido item={fase.entendido} texto={fase.texto ?? ''} />
          ) : (
            <Text c="dimmed">Não deu para entender a resposta.</Text>
          )}
        </>
      )
    default:
      return null
  }
}

/** RF09: o que o sistema entendeu. */
function Entendido({ item, texto }: { item: Item; texto: string }) {
  return (
    <Stack gap={2} align="center">
      <Text>
        Entendi: <strong>{nomeComCifra(item)}</strong>
      </Text>
      {texto && (
        <Text size="xs" c="dimmed">
          ouvido: "{texto}"
        </Text>
      )}
    </Stack>
  )
}

function UltimoTexto({ estado }: { estado: EstadoDaPartida }) {
  const texto = estado.respostas.at(-1)?.texto
  return texto ? (
    <Text size="xs" c="dimmed">
      ouvido: "{texto}"
    </Text>
  ) : null
}

/** RF08: barra que esvazia com o tempo para responder (RN02). */
function Cronometro({ inicio, limiteMs }: { inicio: number; limiteMs: number }) {
  const [agora, setAgora] = useState(() => performance.now())
  useEffect(() => {
    const relogio = window.setInterval(() => setAgora(performance.now()), 100)
    return () => clearInterval(relogio)
  }, [inicio])
  const restanteMs = Math.max(0, limiteMs - (agora - inicio))
  const segundos = Math.ceil(restanteMs / 1000)
  return (
    <Stack gap={4} w="100%">
      <Progress value={(restanteMs / limiteMs) * 100} size="lg" radius="xl" transitionDuration={100} aria-hidden="true" />
      <Text size="sm" c="dimmed" aria-label={`${segundos} segundos para responder`}>
        {segundos} s
      </Text>
    </Stack>
  )
}

/** RF14: sequência de acertos e itens acertados. */
function Resultado({ estado, onJogarDeNovo }: { estado: EstadoDaPartida; onJogarDeNovo: () => void }) {
  const erro = estado.encerradaPor === 'erro' ? estado.atual : null
  return (
    <Paper withBorder radius="lg" p="xl">
      <Stack align="center" ta="center">
        <Title order={2}>Fim de jogo</Title>
        <Text className="placar" fw={800}>
          {estado.sequencia}
        </Text>
        <Text c="dimmed">{estado.sequencia === 1 ? 'acerto seguido' : 'acertos seguidos'}</Text>
        {erro && <Text>Errou em: {nomeComCifra(erro)}</Text>}
        {estado.encerradaPor === 'parou' && <Text c="dimmed">Você parou o jogo.</Text>}
        {estado.acertados.length > 0 && (
          <Group gap={6} justify="center" aria-label="Itens acertados">
            {estado.acertados.map((item, i) => (
              <Badge key={i} variant="light" color="green" size="lg" title={nomeFalado(item)}>
                {cifra(item)}
              </Badge>
            ))}
          </Group>
        )}
        <Stack w="100%" gap="xs" mt="md">
          <Button size="lg" fullWidth onClick={onJogarDeNovo}>
            Jogar de novo
          </Button>
          <Group grow>
            <Button component="a" href="#/jogo" variant="light">
              Mudar seleção
            </Button>
            <Button component="a" href="#/" variant="default">
              Início
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  )
}
