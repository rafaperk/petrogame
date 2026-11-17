# 🛢️ Rumo ao Pré-Sal

RPG de exploração (visão de cima, estilo "vida na vila") para **estudar para o concurso da Petrobras**.
Você anda pela Vila Maré e pela Refinaria Escola, aprende com mentores, joga minijogos de fixação e revisa no
momento certo — o jogo usa repetição espaçada (FSRS, o mesmo algoritmo do Anki) para decidir **quando** cada
questão (e cada jogo) volta.

> **Cargo configurado:** Engenheiro(a) de Equipamentos Júnior – Mecânica (nível superior).
> **Edital de referência:** Edital nº 1 – PETROBRAS/PSP RH 2018.1 (Fundação Cesgranrio) — o último da Petrobras para
> este cargo feito pela Cesgranrio. O próximo edital ainda não saiu; quando sair, basta ajustar `src/content/cargo.ts`
> e os itens `exam` de cada matéria.

## A prova (edital de referência)

| Parte | Questões | Regra |
| --- | --- | --- |
| Conhecimentos Básicos — Português (10) e Inglês (10) | 20 | Eliminatória: ≥ 50% e não zerar nenhuma das duas. Só desempata. |
| Conhecimentos Específicos — Bloco 1 (20), Bloco 2 (15), Bloco 3 (15) | 50 | Eliminatória (≥ 50%) e **classificatória**. Desempate começa pelo Bloco 1. |

## Como rodar

Requisitos: [Node.js](https://nodejs.org) 24+ (testado com o 26).

Versão publicada: **https://rafaperk.github.io/petrogame/** (atualiza sozinha a cada push na `main`,
via `.github/workflows/deploy.yml`). O save fica no navegador: o do site e o do `localhost` são separados.

```bash
npm install
npm run dev        # abre em http://localhost:5173
```

| Comando | O que faz |
| --- | --- |
| `npm test` | valida **todo o conteúdo** (ids, respostas, edital, pátios) e sorteia 300× cada questão gerada |
| `npm run check` | checagem de tipos (TypeScript) |
| `npm run build` | gera a versão final em `dist/` (dá para publicar no GitHub Pages, itch.io etc.) |

O progresso fica salvo no navegador (localStorage). No menu (**Esc**) dá para **exportar/importar** o save em arquivo.

## Como jogar

- **WASD / setas**: andar · **Shift**: correr · **E / Espaço / Enter**: interagir
- **C**: Caderno (matérias, **revisão rápida**, **roteiros**, **edital verticalizado**, conquistas, estatísticas) · **M**: missões
  · **I**: mochila · **Esc**: menu
- Questões: **1–5** ou **A–E** escolhem, **Enter** responde, **P** abre o próximo passo do roteiro, **V** confere o
  passo, **T** mostra tudo, **L** revê a lição
- Esteira: **1–4** ou setas · Conexões: **1–9** e **A–J** · Procedimento: **A–L**
- Bancadas: arraste no desenho ou use os controles · na lição, **B** abre a bancada do card

## O mundo

- **Vila Maré** — Conhecimentos Básicos: Biblioteca (Português, Profª Lúcia), Porto (Inglês, Capitão Harris),
  **Horta do Saber** (cada tópico é uma planta) e o **Salão de Jogos** (minijogos de todas as matérias). Na praça,
  o **Armazém da Dona Cida** (loja); a leste, o **Centro de Pesquisas** (simulados); e a sua **casa** (guarda-roupa).
- **Refinaria Escola** (estrada a leste) — Conhecimentos Específicos, uma unidade por bloco:
  Laboratório de Fundamentos (Bloco 1, Engº Otávio), Casa de Máquinas (Bloco 2, Engª Beatriz) e Oficina de
  Manutenção (Bloco 3, Mestra Dandara). **Cada tópico é um equipamento**: cinza = parado, lâmpada = maestria
  (🔴 → 🔵), chave inglesa 🔧 = hora da manutenção (revisão). Bases vazias = espaço para novos tópicos.

## O ciclo de aprendizado (por que não é "só um quiz bonito")

1. **Aprender** — o mentor (ou o próprio equipamento) explica o tópico em cards curtos: explicação, exemplo,
   **🔥 Sempre cai** (o que a banca repete, com as provas em que caiu), macete e *pegadinha da banca*. O
   **Caderno › Revisão rápida** junta esses quadros de todos os tópicos, com filtro por tipo.
2. **Praticar** — questões do básico ao difícil, com **correção comentada de cada alternativa**. Errou? A questão volta no fim da sessão.
   Toda questão tem um **roteiro passo a passo** do seu tipo ("Bernoulli entre duas seções", "Afirmativas I, II e
   III"...): os passos aparecem **um de cada vez** e a conta de cada um fica escondida até você pedir — travou na
   velocidade? abra só esse passo e tente o resto sozinho. O **Caderno › Roteiros** junta todos, com "Como
   reconhecer", "Para as próximas" e treino só daquele tipo de questão.
3. **Jogar** — minijogos que treinam a memória de outros jeitos:
   - 📦 **Esteira**: separar conceitos parecidos antes que o item passe;
   - 🔗 **Conexões**: ligar termos, siglas e processos às definições;
   - 📋 **Procedimento**: montar sequências (partida de bomba, ciclos, soldagem);
   - 🧮 **Ordem de serviço**: contas de engenharia com **valores sorteados** — os distratores são os erros típicos.
   - 🔬 **Bancada**: simulações animadas do que acontece *dentro* do equipamento — bomba centrífuga (rotor, voluta,
     curvas, NPSH e cavitação), Venturi/Bernoulli (piezômetros, Pitot, manômetro de mercúrio), trocador de calor
     (perfis de temperatura, MLDT), diagrama ferro-carbono (regra da alavanca e microscópio), cilindro com pistão
     (processos, diagramas P–V e T–S, Q = ΔU + W), ciclos Otto, Diesel e Brayton (motor de 4 tempos e turbina a
     gás funcionando, com o rendimento comparado ao de Carnot), ciclos a vapor (usina de Rankine com reaquecimento
     e regeneração, e o refrigerador por compressão de vapor, com a cúpula de saturação nos diagramas T–s e P–h) e
     o compressor alternativo (válvulas automáticas, espaço morto, rendimento volumétrico e dois estágios com
     resfriador intermediário), o ensaio de tração (máquina universal, diagrama tensão × deformação, escoamento a
     0,2 %, descarga e encruamento, estricção e ruptura), a viga em flexão (reações, diagramas de cortante e de
     momento fletor, tensão na seção, cisalhamento e flecha), o laminador com forno de recozimento (encruamento,
     recuperação, recristalização, crescimento de grão, trabalho a quente e o microscópio com os grãos), o pêndulo
     Charpy (energia de impacto, transição dúctil-frágil e a superfície de fratura), o motor sobre molas (vibração
     livre e forçada, ressonância, isolamento, absorvedor dinâmico e modos naturais), a rampa (atrito estático e
     cinético, plano inclinado e a corrida de aro, cilindro e esfera rolando) o redutor de um guincho (relação de
     transmissão, engrenagem intermediária, torque e potência em cada eixo e a torção nos eixos), a pilha de
     corrosão (dois metais numa cuba: série galvânica, relação de áreas, meio com e sem O₂, anodo de sacrifício,
     corrente impressa e superproteção) e o motor de indução com o alternador (campo girante, escorregamento, curva
     conjugado × rotação, estrela e triângulo, partida direta e estrela-triângulo, inversor de frequência, fator de
     potência e capacitores; no alternador, f = p·n/120, a excitação e o torque da turbina), a árvore em dois mancais
     (flexão e torção com von Mises e Tresca, fadiga da árvore que gira, velocidade crítica, vida dos rolamentos e a
     bucha com óleo: Sommerfeld, curva de Stribeck e óleos SAE) e a prensa de molas com o macaco de parafuso (rigidez
     da mola, fator de Wahl, série e paralelo, mola fechada; autotravamento e rendimento da rosca).
     Nas tarefas você **aposta antes de ver** o que vai acontecer e cumpre **missões** mexendo nos controles.

   Cada jogo tem **nível** — ★ Treino, ★★ Campo, ★★★ Prova: sobe com ≥ 90% de acerto de primeira e desce abaixo
   de 50%. Mais itens e menos tempo na Esteira, mais pares nas Conexões, nenhuma dica no Procedimento e mais tarefas
   na Bancada — e mais XP.
4. **Revisar no tempo certo** — cada questão e cada jogo é um cartão FSRS. Quando a chance de lembrar cai, a planta
   **murcha** ou o equipamento pede **manutenção**. A cada revisão bem-sucedida, o intervalo cresce.
5. **Intercalar e desafiar** — treino misto e desafio com tempo, sem dicas, no nível da prova (70% para vencer).
6. **Progredir** — a maestria libera questões mais difíceis (nível 2 com 30% de maestria, nível 3 com 60%) e
   tópicos com pré-requisito. A **profundidade do poço** (0 a 7.000 m) mostra o progresso geral; o **Caderno ›
   Edital** mostra quanto de cada item do edital você domina.
7. **Simular a prova** — no **Centro de Pesquisas**: simulado rápido (20) ou completo (70 questões, 4 h), com a
   divisão da prova, sem dicas, só com tópicos estudados. O resultado mostra cada parte e a regra de aprovação
   (≥ 50% nos Básicos sem zerar Português nem Inglês, e ≥ 50% nos Específicos).

### O que te faz voltar amanhã

- **Carreira**: o nível vira cargo — de Trainee a Consultor(a) —, e cada promoção traz um presente.
- **Missões**: a missão principal leva da primeira lição ao pré-sal (blocos completos, simulados, nível Prova nos
  jogos); três **missões do dia** abrem um **baú** quando cumpridas.
- **Conquistas** (35), com moedas e XP: sequências de acertos, questões nível prova, ofensiva, bancadas, simulados,
  profundidade do poço.
- **Armazém e mochila**: ☕ cafezinho (+50% de XP por 30 min), 🛡️ folga (salva a ofensiva num dia perdido) e peças de
  visual — capacetes, coletes, óculos, uniformes —, algumas só para cargos mais altos. A cada 1.000 m do poço você
  ganha uma **amostra** (de água fria a microbialito do pré-sal).

## Arquitetura

```
src/
  content/              ← CONTEÚDO (é aqui que o jogo cresce)
    cargo.ts            o cargo e a estrutura da prova
    <materia>/materia.ts           matéria + itens do edital
    <materia>/topicos/<topico>.ts  lição, questões (inclusive geradas) e minijogos
  learning/             ← motor de estudo (sem interface; testado)
    types.ts            esquema do conteúdo
    content.ts          descobre e valida os arquivos de conteúdo automaticamente
    gen.ts              ajudantes das questões geradas (sorteio, alternativas com erros típicos)
    games.ts            nota, revisão e recompensas dos minijogos
    srs.ts              FSRS (ts-fsrs): agenda as revisões
    mastery.ts          maestria, estágios, níveis, cobertura do edital, profundidade
    session.ts          monta sessões (aprender/revisar/treinar/ordem de serviço/desafio)
    labs/               modelos físicos das bancadas (bomba, Venturi, trocador, Fe-C, pistão, ciclos a ar e a vapor, compressor, tração, viga, encruamento, Charpy, vibrações, rampa, redutor, corrosão, motor e alternador, eixo e mancais, molas e macaco) — puros e testados
  game/                 ← regras e roteiros (flows.ts, npcs.ts, missions.ts) e a progressão: career.ts (cargos),
                          items.ts (loja, visual, amostras), achievements.ts (conquistas), progress.ts (recompensas)
  world/                ← mapas em ASCII (vila, refinaria), horta, pátio de equipamentos
  scenes/               ← cena do mundo (troca de mapa) e boot
  art/                  ← pixel art gerada por código (cenário, personagens, equipamentos)
  ui/                   ← interface em HTML/CSS (diálogo, lição, questões, minijogos, caderno, loja e mochila...)
    labs/               desenho animado das bancadas (Canvas 2D) e o modo livre
  core/                 ← estado/salvamento, eventos, teclado, áudio sintetizado
tests/                  ← validação do conteúdo, dos mapas e do motor
docs/CONTEUDO.md        ← guia para adicionar matérias, tópicos, questões e jogos
docs/MATERIAL.md        ← avaliação das provas e do material de estudo (o que usar, o que está acima do nível)
docs/arquivo/           ← conteúdo de exemplo guardado (Matemática, que não cai no nível superior)
```

## Conteúdo atual

**28 tópicos, 201 cards (143 com 🔥 Sempre cai), 676 questões (18 a 27 por tópico, muitas com valores sorteados),
154 roteiros de resolução (148 de conteúdo e 6 de formato) e 99 minijogos.**

- **Português:** Crase (com um card de regência) · Concordância verbal e nominal · **Inglês:** Leitura técnica (falsos cognatos,
  conectivos e modais)
- **Bloco 1:** Gases perfeitos, 1ª e 2ª leis · Fluidos (hidrostática, Bernoulli e tubulações) · Tração, compressão e Lei de Hooke
  · Vigas (esforços, flexão e flecha) · Dinâmica (Newton, atrito e rolamento) · Mecanismos (engrenagens, D’Alembert
  e biela-manivela) · Eixos e árvores, mancais e lubrificação · Molas, parafusos e uniões
- **Bloco 2:** Bombas centrífugas · Ciclo de Rankine · Diagrama Fe-C e tratamentos térmicos · Refrigeração
  (compressão de vapor e absorção) · Compressores (alternativos, centrífugos e axiais) · Estrutura cristalina e
  endurecimento · Ensaios (dureza, impacto, fadiga e fluência) · Vibrações (1 grau de liberdade; 2 graus e
  modos)
- **Bloco 3:** Transmissão de calor e trocadores · Soldagem · Instrumentação e controle · Motores e turbina a gás
  (ciclos padrão a ar) · Corrosão eletroquímica (pilhas, série galvânica e taxa) · Formas de corrosão e proteção
  anticorrosiva · Motores elétricos (campo girante, escorregamento e placa) · Geradores elétricos, máquinas CC e
  transformador

**Bancadas:** bomba centrífuga · Venturi e Bernoulli · trocador de calor · diagrama ferro-carbono · cilindro com
pistão · ciclos Otto, Diesel e Brayton · ciclos a vapor (Rankine e refrigeração) · compressor alternativo (1 ou 2
estágios) · ensaio de tração · viga em flexão · encruamento e recozimento · ensaio de impacto Charpy · motor sobre
molas (vibrações) · rampa (atrito e rolamento) · redutor de engrenagens de um guincho · pilha de corrosão e proteção
catódica · motor de indução e alternador · árvore em dois mancais (rolamentos e bucha com óleo) · prensa de molas e
macaco de parafuso.

Todas as questões e tarefas são **autorais**, no estilo da banca. A avaliação do seu material (provas antigas,
listas e apostilas) está em [docs/MATERIAL.md](docs/MATERIAL.md).

## Próximos passos sugeridos

- Tópicos novos estão **pausados** (decisão de 16/11/2026). Se voltarem, o próximo pela incidência é qualidade e
  estatística (item do edital de noções de estatística e probabilidade; 14 questões nas provas do catálogo).
- Novas bancadas: círculo de Mohr e torção (resistência dos materiais) e curvas TTT (materiais).
- Controles de toque para jogar no celular.
- Fórmulas com KaTeX, data da prova nas configurações, interiores dos prédios.

## Créditos

- Motor: [Phaser](https://phaser.io) (MIT) · Repetição espaçada: [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) (MIT)
- Fontes: Nunito e Pixelify Sans (SIL Open Font License) via Fontsource
- Arte, sons e conteúdo: originais deste projeto. As questões são **autorais**, no estilo das bancas.
