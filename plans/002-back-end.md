# 002 — Back-end: contas, histórico e estatísticas (rascunho, pós-MVP)

Escopo: [PROJECT.md](../docs/PROJECT.md), RF23 (hoje **W**); absorve o RF17 (recorde) e o RF21 (estatísticas). Fases B0–B6 do Roteiro.

> **Status: rascunho.** Não implementar antes do MVP (fases 0–6). Começa quando o orientador pedir front + back + banco, ou quando a fase 6 estiver concluída.

## Problema

Sem conta, o usuário perde o histórico ao trocar de navegador ou de dispositivo e não vê a própria evolução. O jogo continua funcionando **sem conta** (modo anônimo, dados no navegador), como no MVP.

**Dentro:** cadastro, login, sessão; salvar e listar partidas; estatísticas e recorde; preferências; sincronizar partidas feitas sem conta; exportar e excluir dados (LGPD).
**Fora (por enquanto):** login social, ranking público (fica C), fala no servidor (só se a Web Speech API não atingir o RNF07), painel administrativo, app nativo, pagamentos.

## Requisitos

Prefixo **RFB/RNFB** para não colidir com os do front.

| ID | Requisito | Prior. |
|---|---|---|
| RFB01 | Cadastrar usuário com e-mail, apelido e senha | M |
| RFB02 | Autenticar com e-mail e senha e manter a sessão (renovação de token) | M |
| RFB03 | Encerrar a sessão (invalidar o token de renovação) | M |
| RFB04 | Salvar uma partida com todas as respostas | M |
| RFB05 | Listar o histórico de partidas, da mais recente para a mais antiga, com paginação | M |
| RFB06 | Estatísticas: recorde, total de partidas, taxa de acerto, itens mais confundidos | M |
| RFB07 | Salvar e obter as preferências (última seleção do UC01) | S |
| RFB08 | Sincronizar ao entrar na conta as partidas feitas sem conta, sem duplicar | S |
| RFB09 | Exportar todos os dados do usuário em JSON (LGPD: acesso e portabilidade) | M |
| RFB10 | Excluir a conta e todos os dados (LGPD: eliminação) | M |
| RFB11 | Alterar o apelido | C |
| RFB12 | Ranking por maior sequência de acertos | C |

| ID | Requisito não funcional | Prior. |
|---|---|---|
| RNFB01 | Senhas só como hash **argon2id** | M |
| RNFB02 | Token de acesso de 15 min; token de renovação rotativo de 30 dias, guardado no banco só como hash | M |
| RNFB03 | Toda entrada validada por esquema (zod); erros no formato do `IA.md` | M |
| RNFB04 | CORS liberado só para a origem do front | M |
| RNFB05 | Limite de requisições nas rotas de autenticação (por exemplo, 5/min por IP) | M |
| RNFB06 | Minimização (LGPD): só e-mail, apelido, hash da senha, preferências e partidas; nenhum áudio (RNF03) | M |
| RNFB07 | HTTPS em produção; segredos só em variáveis de ambiente | M |
| RNFB08 | Logs sem dados sensíveis (senha, tokens e e-mail mascarados) | M |
| RNFB09 | Documentação OpenAPI em `/docs` | S |
| RNFB10 | Cobertura ≥ 80% nos serviços; testes de integração das rotas com banco de teste | S |
| RNFB11 | Até 300 ms nas rotas de partidas e estatísticas (meta a medir) | C |

## Decisões

- **Fastify 5 + zod + Drizzle ORM + PostgreSQL** (+ `@fastify/jwt`, `argon2`, `@fastify/cors`, `@fastify/rate-limit`, `@fastify/swagger`, `tsx`, Vitest; banco local no Docker Compose). Licenças conferidas em 2026-11-11 (MIT, Apache-2.0, PostgreSQL License, Unlicense); cada pacote entra em [licencas.md](../docs/licencas.md) no PR em que for instalado.
- **npm workspaces**: front na raiz, `api/` e `pacotes/contratos`. Camadas da API: `rotas → servicos → repositorios`; serviços não conhecem o Fastify, só os repositórios conhecem o Drizzle.
- **Id da partida gerado no front** (`crypto.randomUUID()`): `PUT /partidas/:id` é idempotente, e a sincronização pode ser repetida sem duplicar.
- **Cifras guardadas na forma canônica com sustenido** (`C#`, nunca `Db`): as estatísticas não contam a mesma nota duas vezes.
- **`calcularEstatisticas(partidas)` pura e compartilhada**: o front usa no MVP; a API usa a mesma função ou SQL equivalente, e um teste confere que dão o mesmo resultado.
- **Formato de erro do `IA.md`**: `{ error: "codigo_snake", details?: ... }`. O rascunho anterior usava `{ erro: { codigo, mensagem } }` (rejeitado para seguir o template).
- **D1, tokens no front:** acesso só em memória, renovação no `localStorage` (funciona com GitHub Pages). Alternativa rejeitada por ora: cookie `httpOnly` no mesmo domínio (mais seguro, mas sem GitHub Pages). Mitigar XSS: nunca `innerHTML` com dados externos, política de segurança de conteúdo.
- **D2, o que compartilhar:** só `pacotes/contratos` (tipos, esquemas, `calcularEstatisticas`). Mover todo o `dominio/` (rejeitado por ora).
- **D3, texto reconhecido da fala:** não guardar no servidor (RNFB06). Guardar com consentimento para medir o RNF07 fica em aberto.
- **D4, ranking:** fora; se entrar, só apelido e com opção de não aparecer.
- **D5, hospedagem:** decidir na B6 (Render, Railway, Fly.io; banco Neon ou Supabase), conforme os planos gratuitos da época.

## Dados

```
usuario 1───* partida 1───* resposta
usuario 1───1 preferencia
usuario 1───* token_renovacao
```

| Tabela | Colunas |
|---|---|
| `usuario` | `id` uuid PK; `email` único, minúsculas; `apelido` 2–30; `senha_hash` argon2id; `criado_em`, `atualizado_em` |
| `token_renovacao` | `id`; `usuario_id` FK cascade; `token_hash`; `expira_em` (30 dias); `revogado_em` nulo enquanto válido; `criado_em` |
| `preferencia` | `usuario_id` PK/FK cascade; `selecao` jsonb (tipo `Selecao`); `atualizado_em` |
| `partida` | `id` uuid **do front**; `usuario_id` FK cascade; `instrumento` (`violao`); `modo` (`nota`/`acorde`); `selecao` jsonb; `sequencia`; `encerrada_por` (`erro`/`parou`); `modo_resposta` (`voz`/`botoes`); `iniciada_em`, `encerrada_em` (dispositivo); `criado_em` (servidor) |
| `resposta` | `id`; `partida_id` FK cascade; `ordem`; `tentativa` 1 ou 2 (RN04); `item_esperado` (cifra canônica); `item_respondido` (nulo em "não entendi"); `resultado` (`acerto`/`erro`/`nao_entendi`); `tempo_ms`; `ouviu_de_novo` |

Índices: `partida (usuario_id, encerrada_em desc)`; `resposta (partida_id, ordem)`.

Contratos compartilhados (já usados pelo front desde a fase 3, em `src/contratos/`):

```ts
export type Instrumento = "violao";
export type ModoDeJogo = "nota" | "acorde";
export type Raiz = "naturais" | "sustenidos";
export type TipoDeAcorde = "maior" | "menor" | "setima";

export interface Selecao { instrumento: Instrumento; modo: ModoDeJogo; raizes: Raiz[]; tipos: TipoDeAcorde[] }
export type ResultadoDaResposta = "acerto" | "erro" | "nao_entendi";
export interface Resposta { ordem: number; tentativa: 1 | 2; itemEsperado: string; itemRespondido: string | null; resultado: ResultadoDaResposta; tempoMs: number; ouviuDeNovo: number }
export interface Partida { id: string; selecao: Selecao; sequencia: number; encerradaPor: "erro" | "parou"; modoResposta: "voz" | "botoes"; iniciadaEm: string; encerradaEm: string; respostas: Resposta[] }
export interface Estatisticas { recorde: number; totalDePartidas: number; taxaDeAcerto: number; maisConfundidos: { esperado: string; respondido: string; vezes: number }[] }
export interface Usuario { id: string; email: string; apelido: string }
export interface Tokens { tokenAcesso: string; tokenRenovacao: string; expiraEm: string }
export interface Sessao { usuario: Usuario; tokens: Tokens }
```

Variáveis de ambiente da API (validadas com zod; documentadas no `.env.example`): `PORTA`, `DATABASE_URL`, `JWT_SEGREDO`, `CORS_ORIGEM`.

## API

Base `/api/v1`, JSON. 🔒 = exige `Authorization: Bearer <token de acesso>`.

| Método | Rota | Entrada | Saída | Req. |
|---|---|---|---|---|
| POST | `/auth/cadastro` | `{ email, apelido, senha }` | 201 `Sessao` | RFB01 |
| POST | `/auth/login` | `{ email, senha }` | 200 `Sessao` | RFB02 |
| POST | `/auth/renovar` | `{ tokenRenovacao }` | 200 `Tokens` | RFB02 |
| POST | `/auth/sair` | `{ tokenRenovacao }` | 204 | RFB03 |
| GET / PATCH / DELETE | `/eu` 🔒 | — / `{ apelido }` / `{ senha }` | 200 `Usuario` / 200 / 204 | RFB11, RFB10 |
| GET | `/eu/exportar` 🔒 | — | 200 JSON com todos os dados | RFB09 |
| GET / PUT | `/preferencias` 🔒 | — / `Selecao` | 200 `Selecao` ou 204 | RFB07 |
| PUT | `/partidas/:id` 🔒 | `Partida` | 201 criada / 200 já existia | RFB04, RFB08 |
| POST | `/partidas/lote` 🔒 | `{ partidas }` (até 100) | 200 `{ criadas, jaExistiam }` | RFB08 |
| GET | `/partidas` 🔒 | `?limite=20&cursor=` | 200 `{ itens, proximoCursor }` | RFB05 |
| GET | `/partidas/:id` 🔒 | — | 200 `Partida` | RFB05 |
| GET | `/estatisticas` 🔒 | — | 200 `Estatisticas` | RFB06 |
| GET | `/ranking` | `?limite=10` | 200 lista | RFB12 |
| GET | `/saude` | — | 200 `{ status: "ok" }` | — |

Erros: 400 `entrada_invalida` (lista os campos em `details`), 401 `nao_autenticado`, 401 `credenciais_invalidas` (mesma resposta para e-mail ou senha errados), 404 `nao_encontrado` (inclui recurso de outro usuário), 409 `email_em_uso`, 429 `muitas_requisicoes`, 500 `erro_interno` (detalhes só no log).

Telas novas no front: cadastro, login, histórico, estatísticas, "Minha conta" (exportar e excluir) e política de privacidade. As telas continuam conhecendo só as interfaces de `src/dados/`; entram implementações `...Api` e um `src/dados/sessao.ts` que escolhe **com conta → API, sem conta → local**.

## Riscos

- Planos gratuitos de hospedagem mudam com frequência; conferir na B6.
- Token de renovação no `localStorage` é legível por XSS (aceito, com as mitigações de D1).
- Testes com banco real são lentos; rodam com banco de teste no Docker, nunca contra produção.

## Critério de pronto

| Fase | Entrega | Pronto quando |
|---|---|---|
| B0 | Workspaces, `pacotes/contratos`, Fastify, Docker Compose, Drizzle com a 1ª migração, `/saude`, CI da API | `docker compose up` + `npm run dev -w api` respondem em `/saude`; CI verde |
| B1 | Autenticação | Testes cobrem senha errada, e-mail repetido, token expirado e token revogado |
| B2 | Partidas: salvar (idempotente), lote, listar, detalhar | Enviar a mesma partida duas vezes mantém um único registro |
| B3 | Estatísticas e preferências | API e `calcularEstatisticas` do front dão o mesmo resultado |
| B4 | Integração no front | Jogar sem conta, entrar e ver as partidas antigas no histórico |
| B5 | LGPD | Excluir a conta apaga usuário, tokens, preferências, partidas e respostas |
| B6 | Produção e `/docs` | O front publicado conversa com a API publicada |
