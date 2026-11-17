# Rumo ao Pré-Sal — notas para desenvolvimento

RPG de estudo (Phaser 4 + TypeScript + Vite) para o concurso da Petrobras. Interface e conteúdo em **português do Brasil**.
Cargo configurado: Engenheiro(a) de Equipamentos Júnior – Mecânica, com base no Edital PSP RH 2018.1 (Cesgranrio) — ver `src/content/cargo.ts`.

## Comandos
- `npm run dev` (porta 5173) · `npm test` (vitest: valida conteúdo, mapas e motor; sorteia 300× cada questão gerada) · `npm run check` (tsc) · `npm run build`
- Rode `npm test` e `npm run check` após qualquer mudança em `src/content/`, `src/learning/` ou nos mapas.

## Mapa do código
- `src/content/<materia>/materia.ts` + `topicos/*.ts` → descobertos por `import.meta.glob` em `learning/content.ts`. Guia: `docs/CONTEUDO.md`.
  - Matéria: `field` ('horta' = planta na vila; 'refinaria' = equipamento), `exam` (itens do edital), `equipment` padrão.
  - Tópico: `edital` (ids de itens de qualquer matéria), `equipment`, `games` (sort/match/order), questões `mc`, `ce` e `gen` (geradas, com `generate(rng)`).
  - Card da lição: `body`, `example`, `hot` (🔥 Sempre cai: só o que caiu, com prova e ano — confira no histórico de provas, `docs/MATERIAL.md`), `tip`, `trap`, `lab`. A aba "Revisão rápida" do Caderno (`ui/notebook.ts`) junta hot/tip/trap.
  - Questões com `difficulty` 1–3: o nível 2 libera com 30% de maestria no tópico e o 3 com 60%. Meta: 20–26 questões por tópico e nível 3 em todos.
  - **Roteiro em toda questão** (o teste exige): `roteiro` (id de um roteiro do tópico, em `roteiros`, ou de formato `fmt.*` em `content/roteiros.ts`) + `steps` (um texto por passo, com os dados da questão; nas geradas, `steps` sai do `generate`; `{ do, show }` sobrepõe o passo do roteiro). `learning/content.ts` resolve (`solveOf`, `stepProblems`); `ui/steps.ts` mostra um passo por vez (P = próximo, V = conferir, T = tudo) antes de responder (conta como dica) e no feedback (ao errar, a alternativa certa só acende no fim do roteiro). Caderno › Roteiros lista todos e treina só um tipo (`planRoteiro`). Guia: `docs/CONTEUDO.md`.
- `learning/` é puro (sem DOM/Phaser) e testado: `srs.ts` (ts-fsrs v6, FSRS-7, API assíncrona `DefaultScheduler`), `mastery.ts` (itens = questões + jogos), `session.ts` (`SessionRunner` materializa questões geradas; `planSimulado`/`simuladoVerdict` montam e corrigem o simulado; `planRoteiro` treina um tipo de questão), `games.ts` (nota/revisão e **nível** dos minijogos: `gameLevel`, `byLevel`, `nextGameLevel`; tabela `GAMES` em `config.ts`), `gen.ts` (`numericOptions`, `fmt`, `pickOne`).
- `learning/labs/`: modelos das **bancadas** (`pump`, `venturi`, `exchanger`, `fec`, `piston`, `cycle`, `vapor`, `compressor`, `tensile`, `beam`, `coldwork`, `charpy`, `vibration`, `ramp`, `gears`, `corrosion`, `motor`, `shaft`, `spring`): `params`, `outputs`, `compute`, `experiments`. Tabelas simplificadas de água e R-134a (saturação, superaquecido, interpolação) em `learning/labs/fluids.ts`. Controles e leituras com `show: (v) => boolean` só aparecem quando fazem sentido; leituras `hidden` servem só para metas e desenho. Desenho em `ui/labs/<nome>View.ts` (Canvas 2D num quadro lógico de 960 × 560, registrado em `ui/labs/views.ts`); `ui/labs/bench.ts` monta canvas + controles + leituras; `ui/labs/index.ts` = modo livre; `ui/games/lab.ts` = partida com tarefas.
  - Jogo `type: 'lab'`: tarefas `predict` (com `change` e `expect`) e `goal` (com `goals` e `solution`). `tests/labs.test.ts` confere tudo contra o modelo.
  - Card da lição com `lab: { lab, preset }` ganha o botão "Ver na bancada" (tecla B).
- `game/flows.ts`: roteiros async/await (mentores, `topicFlow` de canteiro/equipamento, jogos, Salão de Jogos, revisões, `simuladoFlow` do Centro de Pesquisas, `homeFlow`). `game/missions.ts` (principal, diárias e baú), `game/npcs.ts` (Dona Cida = loja).
- Progressão: `game/career.ts` (cargos por nível e presentes), `game/items.ts` (Armazém: ☕ e 🛡️, visual por slot com cargo mínimo, amostras do poço), `game/achievements.ts` (conquistas com `progress()`), `game/progress.ts` (`checkProgress` paga conquistas, amostras e promoções; `bindProgress` liga aos eventos). Interface em `ui/shop.ts` (loja, mochila — tecla I —, painel de conquistas).
- `scenes/WorldScene.ts`: uma cena para todos os mapas (`MAPS`); trocar de mapa = `scene.restart({ mapId, play })` via `warps`. O save guarda `player.map`.
- Mapas em ASCII: `world/maps/vila.ts` e `world/maps/refinaria.ts` (legenda em `world/mapTypes.ts`; `c` = concreto). Horta: `world/Garden.ts`; pátio de equipamentos: `world/Yard.ts` (`yards` no mapa).
- `art/`: toda a arte é procedural (PixelBuffer → canvas textures). Personagens: `art/characters.ts`; equipamentos e ícones da refinaria: `art/equipment.ts`.
- `ui/`: HTML/CSS sobre o canvas. `ui/UI.ts` controla camadas modais; `core/input.ts` roteia o teclado. Minijogos em `ui/games/` (moldura comum em `shell.ts`); estilos em `styles/games.css`.
- `core/state.ts`: save em localStorage (`migrate()` completa campos novos — ao adicionar campos ao save, dê default em `defaults()`).

## Convenções
- Nunca renomeie ids de questões, jogos ou tópicos já existentes (o progresso FSRS fica preso a eles). Questões e jogos compartilham o mesmo espaço de ids.
- Cards novos entram no **fim** do array `lesson` (o `lessonRef` é a posição do card).
- Texto de conteúdo com `\n` dentro de strings TS: use o Edit. Heredoc no Bash transforma `\\n` em quebra de linha real e quebra a string.
- Material do usuário (provas, listas, apostilas) fica fora do projeto, em `Área de Trabalho\Transpetro` — avaliação em `docs/MATERIAL.md`. Não copie questões das provas literalmente: escreva questões autorais inspiradas no conceito. A prova Transpetro 2023 é o simulado lacrado do usuário: não use.
- Textos com marcação leve (`**negrito**`, `*itálico*`, `==destaque==`, `x_{sub}`, `x^{sup}`, listas `- `, `{nome}`) via `ui/dom.ts#md`. Evite `*` em fórmulas.
- Questões geradas: números "de prova" (conta de mão), distratores = erros típicos com `why`; alternativas em ordem crescente.
- Linguagem neutra de gênero nas falas (o jogador pode ser qualquer pessoa).
- Fonte pixelada só para números/rótulos curtos (o "c" vira "o" em negrito); textos de estudo em Nunito.
- Emojis: evite os recentes (ex.: 🪙) — o Windows 10 não tem.
- Phaser 4: `pixelArt: true`, sem `setTintFill` (use `setTint` + `setTintMode`), `TextureManager.generate` não existe mais.
- Depuração no navegador (modo dev): `window.__world` (WorldScene) e `window.__state` (save). Antes de testar com "Novo jogo", faça backup do save do usuário (localStorage `rumo-ao-pre-sal/save-v1`) e restaure depois.
  - Use sempre `window.__state`: um `import()` dinâmico de `core/state.ts` no console cria outra instância (URL com `?t=` do Vite). Para testar telas sem gravar nada, neutralize antes `__state.saveNow` e `__state.touch`.
