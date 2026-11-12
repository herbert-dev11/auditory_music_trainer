# 005 — Anúncio do nome por voz na biblioteca (acessibilidade)

Escopo: [PROJECT.md](../docs/PROJECT.md) v0.3, RF25 (novo) e UC03, passo 4.

## Problema

Uma pessoa cega que usa a biblioteca ouve o som, mas não tem como saber qual nota ou acorde tocou sem ler a tela. O RNF11 cobre só teclado e contraste. O autor pediu que o app diga o nome do item em voz alta.

**Dentro:** botão liga/desliga do anúncio por voz na biblioteca, preferência guardada no navegador.
**Fora:** anúncio por voz no jogo (a pergunta falada já é o RF06; dizer a resposta certa no erro fica para a fase 6); escolha da voz ou da velocidade da fala.

## Decisões

- **Um RF novo (RF25, prioridade S, no MVP)** em vez de ampliar o RNF11: é uma funcionalidade que o usuário liga, não uma qualidade geral da interface.
- **O nome vem de `nomeFalado`** (`C#m` → "dó sustenido menor"), a mesma função que a tela mostra. Nada de texto escrito à mão para a voz.
- **Ordem: primeiro o som, depois o nome.** O som funciona como pergunta e o nome como resposta, igual ao jogo. Falar antes do som (rejeitado: a voz ocuparia o tempo em que o ouvido deveria se concentrar no som).
- ~~O nome é dito 1 s depois do início do som (`ATRASO_DA_VOZ_MS`).~~ **Emendado em 2026-11-12:** no violão a voz entrava antes de o som acabar (o som dura ~2 s). Agora `Tocador.tocar` devolve quantos ms faltam para o som acabar, e a voz entra logo depois (`FOLGA_DA_VOZ_MS` = 250 ms em `ui/biblioteca.ts`). Com a demonstração nota por nota ([plano 006](006-demonstracao-nota-por-nota.md)), conta o fim do último passo, o acorde inteiro.
- **Um clique novo cancela a fala pendente e a que estiver tocando**, para as vozes não se acumularem quando o usuário clica rápido.
- **Voz atrás da interface `Narrador`** (`fala/narrador.ts`), implementada com `speechSynthesis` em pt-BR. A mesma interface serve para a pergunta falada da fase 6 (RF06).
- **Preferência guardada no navegador via `RepositorioDePreferencias`** (`dados/preferencias.ts`), a interface que o [architecture.md](../docs/architecture.md) já previa. As telas não tocam no `localStorage`. Se o armazenamento falhar (aba anônima), a escolha vale só nesta visita.
- **Desligado por padrão**: quem usa leitor de tela já ouve o status ("Tocando: dó maior") pela região `role="status"`; o anúncio é para quem não usa leitor.
- **Botão com `aria-pressed`** e o texto "Anunciar nomes: ligado/desligado", acessível por teclado.

## Dados

Uma chave no `localStorage`: `treinador:anunciarNomes` (`sim`/`nao`). Nenhum dado pessoal, nenhum áudio gravado (RNF03).

## API

Tela alterada: **Biblioteca**. Ganha o botão "Anunciar nomes", ao lado das abas.

## Riscos

- O sistema operacional pode não ter voz pt-BR instalada; o navegador cai na voz padrão, com sotaque errado. Aceito; a fase 6 trata isso para a pergunta.
- Quem usa leitor de tela e liga o anúncio ouve o nome duas vezes (leitor e voz). Aceito: a pessoa pode desligar.
- `ui/` e `fala/` não têm testes automáticos ([testing.md](../docs/testing.md): navegador e voz real são conferidos à mão).

## Critério de pronto

- [x] `fala/narrador.ts`: interface `Narrador` e implementação com `speechSynthesis`
- [x] `dados/preferencias.ts`: `RepositorioDePreferencias` e implementação local, tolerante a falha do armazenamento
- [x] Botão "Anunciar nomes" na biblioteca, com `aria-pressed`, preferência salva e fala cancelada a cada clique novo
- [x] PROJECT.md (RF25, UC03) e [architecture.md](../docs/architecture.md) atualizados
- [ ] Conferido à mão no Chrome: o nome é dito depois do som, a preferência sobrevive a recarregar a página, funciona só pelo teclado

## Histórico

- 2026-11-11: pedido do autor feito em outra sessão do Claude e repassado à sessão que estava com o plano 004; plano escrito e implementado no mesmo dia.
- 2026-11-12: o autor notou que, no violão, a voz falava antes de o som acabar; a voz passou a esperar o fim do som (decisão emendada acima).
