# 013 — Segurar para falar e janela de escuta curta

Escopo: [PROJECT.md](../docs/PROJECT.md) v0.3: RF07 (quando o microfone abre), RNF02, RNF07 (taxa de acerto). Muda o jogo do [plano 011](011-jogo-com-botoes.md) e a página do [plano 012](012-teste-da-fala.md).

## Problema

No teste do autor, o microfone do navegador às vezes não escuta bem e devolve muito ruído. Com o microfone abrindo sozinho depois da pergunta e ficando aberto até o fim do cronômetro, entra som do ambiente, o fim do próprio instrumento e conversas, que o reconhecimento transforma em palavras. Com a Web Speech API, o app não controla o microfone (sensibilidade e filtro são do navegador); o que dá para controlar é **quando** e **por quanto tempo** ele fica aberto.

**Dentro:** botão "segure para falar" no jogo e na página de teste, barra de espaço no computador, janela de escuta curta.
**Fora:** trocar o reconhecimento (Vosk/Whisper, avaliados depois com o CSV); comparação aproximada de palavras (próximo ajuste da fase 5).

## Decisões

- **Segurar para falar** (decisão do autor): o microfone só abre enquanto a pessoa segura o botão e fecha ao soltar; o resultado vem logo em seguida. Escolhido entre as opções de [pesquisa da fala](012-teste-da-fala.md) junto com a janela curta. Microfone abrindo sozinho (rejeitado: capta ruído enquanto ninguém fala).
- **No computador, barra de espaço** (o autor apontou que segurar o mouse é ruim no desktop): segurar a barra de espaço faz o mesmo que segurar o botão. A dica aparece só em telas com mouse (`pointer: fine`).
- **Janela de escuta curta: no máximo 4 s por toque.** O nome de uma nota ou acorde cabe folgado; se a pessoa continuar segurando, a escuta fecha sozinha e usa o que ouviu.
- **Toque curto (menos de 0,3 s) é ignorado**, sem gastar a segunda chance: mostra "Segure o botão enquanto fala". Um toque sem querer não deve contar como silêncio.
- **O cronômetro (RN02) continua**: começa quando o botão fica disponível, depois da pergunta. Se acabar sem ninguém segurar, conta como silêncio (RN04); se a pessoa estiver segurando, a escuta fecha e usa o que ouviu.
- **`ReconhecedorDeFala.concluir()`**: fecha o microfone e entrega o que foi ouvido (o `parar()` continua descartando). Na Web Speech, é a diferença entre `stop()` e `abort()`.
- **Um hook só para as duas telas** (`ui/useSegurarParaFalar.ts`): estados livre, segurando e processando; toque, mouse e barra de espaço; toque curto; cancelamento ao sair da fase ou da tela.
- **Também na página de teste da fala**: o CSV precisa medir a fala nas mesmas condições do jogo.
- **Também resolve o iPhone**: cada escuta começa num toque, que é o gesto que o Safari pode exigir (risco do plano 011).
- **Botão grande, sem menu de toque longo** (`touch-action`, `user-select` e menu de contexto desligados), com estado visível: "Segure para falar", "Ouvindo... solte quando terminar", "Entendendo...".

## Dados

Nenhum.

## API

Telas alteradas: **Partida** (o botão "segure para falar" aparece quando é a vez de responder, acima de "Ouvir de novo" e "Parar") e **Teste da fala** (o botão "Falar" vira "segure para falar").

## Riscos

- Algumas pessoas esquecem de segurar; a dica do toque curto e o texto do botão orientam.
- Soltar cedo demais corta o fim da palavra; a janela de 4 s e o "solte quando terminar" ajudam.
- `ui/` e `fala/` sem teste automático; conferência à mão no Chrome (com barra de espaço) e no iPhone.

## Critério de pronto

- [x] `concluir()` na interface e na implementação Web Speech (também mede o tempo de resposta a partir de quando soltou o botão)
- [x] Hook `useSegurarParaFalar` e componente `BotaoSegurar` (toque, mouse, barra de espaço, toque curto, janela máxima, cancelamento)
- [x] Jogo: microfone só enquanto segura; cronômetro com silêncio e com fechamento da escuta no fim do tempo
- [x] Página de teste com o mesmo botão
- [x] Plano 011, plano 012, PROJECT.md, [architecture.md](../docs/architecture.md) atualizados
- [ ] Conferido à mão no Chrome do computador e no iPhone

## Histórico

- 2026-11-12: pedido do autor depois de testar a fala ("o microfone do navegador não escuta bem e retorna muito ruído"); escolheu janela curta e segurar para falar.
