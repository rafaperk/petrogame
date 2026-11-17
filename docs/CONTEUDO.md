# Como adicionar conteúdo

Todo o conteúdo fica em `src/content/`. O jogo descobre os arquivos sozinho — não é preciso registrar nada.

```
src/content/
  cargo.ts                       ← o cargo e a estrutura da prova (edital de referência)
  portugues/                     ← Conhecimentos Básicos (plantas na Horta do Saber)
    materia.ts                   ← a matéria + os itens do edital dela
    topicos/
      crase.ts                   ← um arquivo por tópico
  ingles/
  bloco1/ bloco2/ bloco3/        ← Conhecimentos Específicos (equipamentos na Refinaria)
```

Depois de editar, rode **`npm test`**: ele aponta ids repetidos, resposta fora do intervalo, item de edital inexistente,
pré-requisito inexistente, falta de espaço no pátio da Refinaria e **sorteia 300 vezes cada questão gerada**.

## 1. Matéria

Crie `src/content/<id>/materia.ts` (o `id` precisa ser igual ao nome da pasta):

```ts
import { defineSubject } from '../../learning/types';

export default defineSubject({
  id: 'bloco1',
  name: 'Específicos · Bloco 1',
  short: 'Bloco 1',
  color: '#2a9d8f',            // cor da matéria (plantas, interface)
  icon: '🌡️',
  mentorId: 'otavio',           // NPC em src/game/npcs.ts (role 'mentor' e subjectId: 'bloco1')
  place: 'Laboratório de Fundamentos',
  description: 'Termodinâmica, Mecânica dos Fluidos...',
  order: 3,                     // ordem no caderno e nos menus
  field: 'refinaria',           // 'horta' (plantas na vila) ou 'refinaria' (equipamentos)
  equipment: 'panel',           // equipamento padrão dos tópicos (veja a lista abaixo)
  exam: {                       // como a matéria aparece no edital
    part: 'especificos',        // id da parte em src/content/cargo.ts
    questions: 20,
    items: [
      { id: 'b1.gases', text: 'Gases perfeitos' },
      // ... um item por assunto do conteúdo programático
    ],
  },
});
```

- **Horta:** 4 fileiras com 11 canteiros (`garden` em `src/world/maps/vila.ts`).
- **Refinaria:** cada matéria tem um pátio (`yards` em `src/world/maps/refinaria.ts`): Bloco 1 com 20 bases, Blocos 2 e 3 com 15.
  O teste avisa se faltar base.

## 2. Tópico

Crie `src/content/<materia>/topicos/<nome>.ts`:

```ts
import { defineTopic } from '../../../learning/types';

export default defineTopic({
  id: 'mec.bombas-centrifugas',     // NUNCA mude depois de publicado (o progresso fica preso ao id)
  name: 'Bombas centrífugas',
  summary: 'Uma frase dizendo o que se aprende.',
  order: 1,                          // posição no pátio/horta e nos menus
  weight: 3,                         // relevância na prova (1 a 3) — pesa na profundidade
  requires: ['mec.hidrostatica-bernoulli'], // opcional: tópicos que precisam vir antes
  edital: ['b2.bombas'],             // itens do edital que este tópico cobre (de qualquer matéria)
  equipment: 'pump',                 // opcional (Refinaria): sprite do equipamento
  lesson: [ /* cards */ ],
  questions: [ /* questões */ ],
  games: [ /* minijogos (opcional) */ ],
});
```

Equipamentos disponíveis: `pump`, `compressor`, `turbine`, `boiler`, `exchanger`, `vessel`, `tester`, `furnace`,
`welder`, `panel`, `pipe`, `engine`, `motor`, `gearbox`, `chiller`, `crane`, `mill`, `pendulum`, `isolator`, `absorber`,
`ramp`, `winch`, `cell`, `rectifier`, `generator`, `bearing`, `spring`.

### Cards da lição

```ts
{
  title: 'Título do card',
  body: 'Texto com **negrito**, *itálico*, ==destaque==, h_{1} (subscrito), T^{4} (sobrescrito) e listas:\n- item 1\n- item 2',
  example: 'Exemplo resolvido.',      // opcional
  hot: 'O que a banca repete, com as provas em que caiu (Transpetro 2018, Petrobras 2014).', // opcional
  tip: 'Macete para lembrar.',        // opcional
  trap: 'Pegadinha comum da banca.',  // opcional
}
```

Dicas: **cards curtos** (uma ideia por card), sempre com exemplo, e a pegadinha que a banca mais cobra.
Evite `*` em fórmulas (vira itálico): use `×` ou `·`.

O `hot` vira o quadro **🔥 Sempre cai** do card (entre o exemplo e o macete). Escreva só o que de fato caiu, com a
prova e o ano — confira no catálogo das provas antes (ver `docs/MATERIAL.md`) e não copie o enunciado. Os três
campos `hot`, `tip` e `trap` também alimentam a aba **Revisão rápida** do Caderno, que filtra por tipo.

Cards novos entram **no fim** do array `lesson`: o `lessonRef` das questões e jogos aponta para a posição do card.

Um card pode abrir uma **bancada** já ajustada (botão "🔬 Ver na bancada", tecla **B**):

```ts
{
  title: 'NPSH e cavitação',
  body: '...',
  lab: { lab: 'pump', preset: { temp: 90, zs: -1, valve: 100 }, label: 'Ver a cavitação acontecer' },
}
```

## 3. Questões

### Múltipla escolha (Cesgranrio, A–E)

```ts
{
  id: 'mec-bom-03',           // único no jogo inteiro (questões e jogos); nunca reaproveite
  difficulty: 1,              // 1 básico · 2 intermediário · 3 nível prova
  lessonRef: 0,               // card da lição relacionado (botão "Rever lição")
  source: 'Autoral',          // ou 'Cesgranrio 2018 – Petrobras', etc.
  prompt: 'Enunciado com **marcação**.',
  hint: 'Dica opcional (sem dica, o botão elimina 2 alternativas).',
  options: [
    { text: 'Alternativa A', why: 'Por que está errada.' },
    { text: 'Alternativa B', why: 'Por que está certa.' },
    // ... até 5
  ],
  answer: 1,                  // índice da correta em `options`
  shuffle: false,             // opcional: não embaralhar ("I e II", valores em ordem crescente...)
  explanation: 'Explicação geral, mostrada depois de responder.',
}
```

### Certo ou Errado (Cebraspe)

```ts
{ id: 'pt-crase-08', type: 'ce', difficulty: 2, prompt: 'Julgue o item...', answer: false, explanation: '...' }
```

### Questão gerada — "Ordem de serviço" (valores sorteados)

Os números mudam **a cada vez** que a questão aparece: você treina o **método**, não decora a resposta.
Os distratores devem ser **erros típicos**, cada um com o seu porquê:

```ts
import { fmt, numericOptions, pickOne } from '../../../learning/gen';

{
  id: 'mec-bom-01',
  type: 'gen',
  difficulty: 1,
  lessonRef: 2,
  title: 'Potência no eixo de uma bomba',
  generate(rng) {
    const Qh = pickOne(rng, [36, 72, 108]);          // sorteia valores "de prova" (conta de mão)
    const H = pickOne(rng, [20, 40, 50]);
    const eta = pickOne(rng, [0.5, 0.8]);
    const Ph = (1000 * 10 * (Qh / 3600) * H) / 1000;  // kW
    const Pe = Ph / eta;
    const { options, answer } = numericOptions({
      correct: Pe,
      unit: 'kW',
      digits: 2,                                      // casas decimais exibidas
      correctWhy: `P = ρgQH/η = ${fmt(Pe)} kW.`,
      distractors: [
        { value: Ph, why: 'Faltou dividir pelo rendimento.' },
        { value: Pe * 3600, why: 'Esqueceu de converter m³/h para m³/s.' },
      ],
    });
    return {
      prompt: `Uma bomba recalca **${Qh} m³/h** ...`,
      options,                // em ordem crescente, como na prova
      answer,
      hint: 'Converta a vazão para m³/s.',
      explanation: `Passo a passo com os números sorteados: ...`,
    };
  },
}
```

`numericOptions` descarta valores repetidos e completa até 5 alternativas. O `npm test` sorteia cada gerador
300 vezes e confere: 4–5 alternativas, sem repetição, sem `NaN`.

### Roteiro e passo a passo (obrigatório em toda questão)

A prova repete **tipos** de questão; mudam os números e o contexto. Por isso cada questão aponta para um
**roteiro** — o passo a passo daquele tipo — e traz os passos resolvidos com os dados dela. No jogo, os passos
aparecem **um de cada vez** (tecla P), e a conta de cada passo fica oculta até o jogador pedir (tecla V): quem
travou num passo destrava só ele e tenta o resto sozinho. No feedback, quem errou recebe o roteiro aberto no
1º passo (e a alternativa certa só acende no fim dele); quem acertou vê tudo, com "Como reconhecer" e "Para as próximas". A aba **Roteiros** do Caderno lista
todos, com treino só daquele tipo.

Roteiro de conteúdo, no tópico (antes de `questions`):

```ts
roteiros: [
  {
    id: 'bernoulli',                     // único no tópico (os de formato usam "fmt.*")
    name: 'Bernoulli entre duas seções',
    when: 'Tubo, Venturi ou bocal entre dois pontos; pedem a pressão...',   // como reconhecer na prova
    steps: [                            // o QUE fazer, sem números
      'Ache a velocidade em cada seção pela continuidade.',
      'Escreva Bernoulli entre as seções e corte o que é igual.',
      'Isole a pressão pedida e confira o sentido.',
    ],
    note: 'Velocidade e pressão andam em sentidos opostos...',  // "Para as próximas": atalho ou pegadinha
  },
],
```

Na questão, `roteiro` + `steps` (um texto por passo do roteiro, na mesma ordem — é o que aparece ao "conferir"):

```ts
{
  id: 'mec-flu-04',
  // ...
  roteiro: 'bernoulli',
  steps: [
    'Na garganta a área é menor; pela continuidade, a velocidade **aumenta**.',
    'Venturi horizontal, sem perdas: p + ρ·V²/2 = constante.',
    'Se ρ·V²/2 sobe, p tem que cair: velocidade **aumenta** e pressão **diminui**.',
  ],
  explanation: '...',   // continua obrigatória: vira o "texto corrido" opcional no fim
}
```

Na gerada, `roteiro` vai na questão e `steps` sai do `generate`, com os números sorteados
(`steps: [\`V₂ = ${fmt(V2)} m/s.\`, ...]`). Um passo pode trazer o próprio "o que fazer" quando o do roteiro não
servir: `{ do: 'Converta para ampères.', show: \`${fmt(I)} A\` }`.

**Roteiros de formato** (globais, em `src/content/roteiros.ts`): `fmt.conceito` (completar a frase),
`fmt.afirmativas` (I, II e III), `fmt.exceto` (EXCETO/INCORRETA/NÃO), `fmt.associacao`, `fmt.porque` e `fmt.ce`
(Certo/Errado). Use-os quando a questão não tem um método de conteúdo próprio. Na `fmt.conceito`, os três passos
são: a palavra que decide → a regra → a alternativa (e qual troca a banca fez).

Regras de ouro:
- Um passo não entrega o seguinte: o `show` do passo 1 não traz o resultado final; o último passo conclui.
- Escreva o `do` do roteiro sem números e o `show` com os números da questão.
- Não cite letra de alternativa em questão embaralhada; cite o texto dela.
- O `npm test` exige roteiro e pelo menos 2 passos em toda questão, e confere que o roteiro existe e é usado.

## 4. Minijogos

Cada jogo vira **um cartão de revisão**: quando ele vence, o tópico pede revisão e você joga de novo.
A nota vem do aproveitamento de primeira (≥ 90% = Bom, ≥ 70% = Difícil, abaixo = Errou). Os jogos aparecem no
equipamento/canteiro, com o mentor e no **Salão de Jogos** da vila.

**Níveis.** Cada jogo tem nível próprio — ★ Treino, ★★ Campo, ★★★ Prova (`gstats[id].level` no save). Sobe com
≥ 90% de acerto de primeira e desce abaixo de 50%. O nível decide a dificuldade (tabela `GAMES` em `src/config.ts`):

| | Treino | Campo | Prova |
| --- | --- | --- | --- |
| 📦 Esteira: itens e tempo de cada item | 6 · ×1,25 | 9 · ×1 | 12 · ×0,8 |
| 🔗 Conexões: pares | 4 | 6 | 8 |
| 📋 Procedimento: destaque do próximo passo | após 1 erro | após 2 erros | nunca |
| 🔬 Bancada (com `perRound`): tarefas sorteadas | 3 | 4 | 5 |
| XP | ×1 | ×1,25 | ×1,5 |

Por isso, escreva itens e pares de sobra: com menos de **12 itens** na Esteira ou de **8 pares** nas Conexões, o
nível Prova joga a rodada com o que houver e fica igual ao nível anterior.

### 📦 Esteira (classificar)

Bom para **discriminar conceitos parecidos** (o que a banca explora nas pegadinhas).

```ts
{
  id: 'mec-cal-g1',
  type: 'sort',
  title: 'Condução, convecção ou radiação?',
  intro: 'Qual mecanismo domina em cada situação?',
  lessonRef: 0,
  bins: ['Condução', 'Convecção', 'Radiação'],   // 2 a 4 categorias
  perRound: 10,                                  // ignorado: o nível do jogo decide (6/9/12 itens)
  items: [
    { text: 'Calor do Sol chegando à Terra', bin: 2, why: 'Atravessa o vácuo: só a radiação faz isso.' },
    // ...
  ],
}
```

### 🔗 Conexões (ligar pares)

Bom para **termo ↔ definição**, **sigla ↔ significado**, **processo ↔ característica**.

```ts
{
  id: 'mec-ins-g2',
  type: 'match',
  title: 'Siglas ISA',
  leftLabel: 'Sigla',
  rightLabel: 'Instrumento',
  perRound: 6,                                   // ignorado: o nível do jogo decide (4/6/8 pares)
  pairs: [
    { left: 'PT', right: 'Transmissor de pressão', why: 'P + T (transmissor).' },
    // ...
  ],
}
```

### 📋 Procedimento (ordenar)

Bom para **sequências**: partida de equipamentos, ciclos, etapas de processo. Escreva os passos **na ordem certa**
(o jogo embaralha) e evite passos que poderiam trocar de lugar.

```ts
{
  id: 'mec-bom-g1',
  type: 'order',
  title: 'Partida de uma bomba centrífuga',
  steps: [
    { text: 'Abrir totalmente a válvula de sucção', why: 'Sucção estrangulada derruba o NPSH disponível.' },
    // ...
  ],
}
```

## 5. Bancadas (simulações interativas)

Uma bancada é uma simulação de verdade: o modelo físico fica em `src/learning/labs/` (puro, testado) e o desenho
animado em `src/ui/labs/`. Hoje existem dezenove:

| `lab` | Bancada | Controles (`setup`, `change`, `solution`) | Leituras (`expect`, `goals`) |
| --- | --- | --- | --- |
| `pump` | Bomba centrífuga | `rpm`, `valve` (%), `zs` (m), `temp` (°C), `primed` (0/1) | `Q`, `H`, `P`, `eta`, `npshd`, `npshr`, `margin`, `cav`, `Hshut` |
| `venturi` | Venturi e Bernoulli | `Q` (L/s), `d2` (mm), `p1` (kPa), `dz` (m), `real` (0/1), `pitot` (0/1) | `v1`, `v2`, `p2`, `p3`, `dp`, `dh` (cm Hg), `loss`, `cav` |
| `exchanger` | Trocador bitubular | `arr` (0 paralelo / 1 contracorrente), `thi`, `tci` (°C), `mh`, `mc` (kg/s), `area` (m²), `foul` (0/1) | `q`, `tho`, `tco`, `dt1`, `dt2`, `lmtd`, `eff`, `ntu`, `cross` |
| `fec` | Diagrama ferro-carbono | `c` (%C), `t` (°C), `view`, `cool` (0 lento / 1 têmpera) | `fAlpha`, `fGamma`, `fFe3C`, `fL`, `fPerlita`, `fFerritaPro`, `fCementitaPro`, `fMart`, `cNow`, `tNow` |
| `piston` | Cilindro com pistão (ar, sempre de 100 kPa, 27 °C e 1 m³) | `proc` (0 isobárico, 1 isocórico, 2 isotérmico, 3 adiabático, 4 politrópico), `n`, `v2` (m³), `t2` (°C) | `P2`, `V2`, `T2` (°C), `T2K`, `W`, `Q`, `absQ`, `dU`, `dS`, `wq` (W/Q em %) |
| `cycle` | Ciclos padrão a ar | `cyc` (0 Otto, 1 Diesel, 2 Brayton), `r`, `rp`, `t3` (°C), `regen` (0/1) | `eta`, `etaC`, `qin`, `qout`, `wnet` (kJ/kg), `T2`, `T4` (°C), `Pmax`, `rc`, `bwr`, `mep`, `invalid`, `regenUseful` |
| `vapor` | Ciclos a vapor (água e R-134a, tabelas simplificadas) | `cyc` (0 Rankine, 1 refrigeração); Rankine: `mod` (0 simples, 1 reaquecimento, 2 regenerativo), `pb` (MPa), `t3` (°C), `pc` (kPa), `etat` (%); refrigeração: `te`, `tc` (°C), `cap` (TR) | Rankine: `eta`, `etaC`, `wnet`, `qin`, `qout`, `wt`, `wp` (kJ/kg), `xt`, `Tcond`, `bwr`, `prh` (MPa), `y` (%), `pext` (kPa), `invalid`; refrigeração: `cop`, `copC`, `copHP`, `qL`, `wc`, `qH` (kJ/kg), `xv`, `T2` (°C), `Pe`, `Pk` (kPa), `mdot` (kg/s), `Wc` (kW) |
| `compressor` | Compressor alternativo de simples efeito (ar aspirado a 100 kPa e 27 °C, Vd = 10 L, 600 rpm) | `p2` (kPa, absoluta), `c` (% de espaço morto), `n` (1 a 1,4), `stages` (0 um estágio, 1 dois estágios + resfriador) | `etav` (%), `fad` (m³/min), `T2` (°C), `w` (kJ/kg), `Pw` (kW), `etaiso` (%), `pi` (kPa), `save` (%), `rmax`; escondidas: `r`, `vind` (L), `mdot` (kg/s), `Wc` (kJ) |
| `tensile` | Ensaio de tração (corpo de prova com A₀ = 100 mm² e L₀ = 50 mm) | `mat` (0 aço 1020, 1 aço 4140 temperado e revenido, 2 alumínio 6061-T6, 3 ferro fundido cinzento), `eps` (% de deformação imposta, 0 a 36), `unload` (0 carga aplicada, 1 retirada) | `sig`, `sv` (MPa), `F` (kN), `dL` (mm), `ep` (%), `E` (GPa), `se`, `sr` (MPa), `Ur`, `U` (MJ/m³), `along`, `ra` (%); escondidas: `def` (%), `broken`, `neck` (0/1), `d` (mm), `Fmax` (kN) |
| `beam` | Viga biapoiada ou em balanço (peso próprio desprezado) | `sup` (0 biapoiada, 1 balanço), `load` (0 concentrada, 1 distribuída), `P` (kN), `a` (% do vão, a partir de A), `w` (kN/m), `L` (m), `sec` (0 retângulo 60 × 120 em pé, 1 o mesmo deitado, 2 perfil I 150 × 100, 3 redonda Ø 100), `mat` (0 aço, 1 alumínio) | `RA`, `RB`, `Vmax` (kN), `MA`, `Mmax` (kN·m), `I` (cm⁴), `W` (cm³), `sig`, `tau` (MPa), `y` (mm), `FS`, `kg` (kg/m); escondidas: `xM` (m), `A` (cm²), `Lr` (vão/flecha) |
| `coldwork` | Encruamento e recozimento (tira de 10 mm laminada e depois 1 h no forno) | `mat` (0 cobre, 1 latão 70/30, 2 aço 1010), `cw` (% de redução, 0 a 70), `proc` (0 a frio, 1 a quente), `ta` (°C do recozimento; 25 = sem recozer) | `se`, `sr` (MPa), `el` (%), `hv` (HV), `d` (μm), `X` (% recristalizado), `trx` (°C, recristalização completa em 1 h), `res` (tensões residuais, laminado = 100), `F` (kN), `h` (mm); escondidas: `rho` (log₁₀ da densidade de discordâncias), `aspect`, `hot` (0/1) |
| `charpy` | Ensaio de impacto Charpy (pêndulo de 20 kg, braço de 0,85 m, h₀ = 1,5 m) | `mat` (0 aço 0,2 %C, 1 aço 0,6 %C, 2 inox 304, 3 alumínio 6061), `grain` (0 grosso, 1 fino; só nos aços), `T` (°C, −120 a 120) | `E` (J), `hf` (m), `shear` (% fibrosa), `tt`, `t27` (°C; só nos aços); escondidas: `beta` (°), `brittle` (0/1) |
| `vibration` | Motor sobre base elástica (desbalanceamento m·e = 0,01 kg·m; absorvedor com 20 % da massa do motor) | `m` (kg), `arr` (0 uma mola, 1 duas em paralelo, 2 quatro em paralelo, 3 duas em série), `k` (kN/m, cada mola), `zeta`, `mode` (0 livre, 1 forçada), `rpm`, `abs` (0/1), `na` (rpm, sintonia do absorvedor) | `keq` (kN/m), `wn` (rad/s), `fn` (Hz), `ncrit` (rpm), `dst` (mm), `cc`, `c` (N·s/m), `wd` (rad/s), `Td` (s), `dec`, `f` (Hz), `r`, `F0`, `FT` (N), `X`, `Xa` (mm), `phase` (°), `TR`, `n1`, `n2` (rpm); escondidas: `regime` (0 sem amortecimento, 1 sub, 2 crítico, 3 super), `osc` (0/1), `zetaOut` |
| `ramp` | Rampa com atrito e rolamento (g = 10 m/s²; corrida de 4 m) | `body` (0 caixa, 1 aro, 2 cilindro maciço, 3 esfera maciça), `theta` (°, 0 a 60), `m` (kg), `mus`, `muk`, `F` (N, só na caixa, paralela à rampa, rampa acima), `r` (m, só nos que rolam) | `P`, `N`, `Pt`, `fmax`, `fneed`, `f` (N), `a` (m/s²), `thRep`, `thLim` (°), `Fhold`, `Fpush` (N), `I` (kg·m²), `alpha` (rad/s²), `erot` (%), `v` (m/s), `t` (s); escondidas: `regime` (0 parado, 1 desliza, 2 rola sem deslizar, 3 rola e escorrega), `dir` (+1 rampa abaixo, −1 rampa acima, 0 parado), `slips` (0/1) |
| `gears` | Redutor de um guincho (módulo 4 mm; g = 10 m/s²; carga subindo com velocidade constante) | `z1`, `z2` (dentes do 1º par), `idler` (0/1), `zi` (dentes da intermediária), `two` (0 um par, 1 dois pares), `z3`, `z4` (dentes do 2º par), `n1` (rpm do motor), `mass` (kg), `R` (m, raio do tambor), `eta` (rendimento de cada engrenamento), `d` (mm, diâmetro dos eixos) | `i`, `red`, `nId`, `ni`, `nt` (rpm), `v` (m/s), `Tt`, `Ti`, `Tm` (N·m), `Pm`, `Pout`, `loss` (kW), `Ft1`, `Ft2` (N), `taum`, `taui`, `taut` (MPa); escondidas: `dirT` (+1 = mesmo sentido do motor), `TId` (torque no eixo da intermediária, sempre 0), `etaTot` |
| `corrosion` | Pilha de corrosão numa cuba (duas placas; potenciais da série galvânica em água do mar, V × Ag/AgCl) | `metA`, `metB` (0 Mg, 1 Zn, 2 Al, 3 aço carbono, 4 Sn, 5 Cu, 6 inox 304 passivo, 7 grafite), `env` (0 água do mar, 1 água doce, 2 água do mar sem O₂, 3 ácido pH 2 sem O₂), `link` (0 aberta, 1 fio, 2 fonte com + em A e − em B), `V` (V, só com a fonte), `aA`, `aB` (cm², área molhada de cada placa) | `dE` (V), `I` (mA), `rA`, `rB` (mm/ano), `kAn` (taxa do anodo ÷ a dele sozinho), `prot` (% do catodo), `EA`, `EB` (V × Ag/AgCl), `H2` (mA no catodo), `lossAn` (g/ano); escondidas: `anode` (0 = A, 1 = B, −1 = nenhum), `rA0`, `rB0` (sozinhas), `protA`, `protB` (%), `lossA`, `lossB` (g/ano) |
| `motor` | Motor de indução trifásico de 7,5 kW, 220/380 V (circuito equivalente por fase) e alternador de 10 kVA, 220 V, com o mesmo estator | `maq` (0 motor de indução, 1 alternador), `poles` (0 a 3 = 2, 4, 6, 8 polos); motor: `rede` (0 220 V, 1 380 V), `lig` (0 triângulo, 1 estrela), `f` (Hz, inversor com V/f constante até 60 Hz), `load` (% do conjugado nominal, conjugado constante), `cap` (kvar, capacitores na rede; só com 60 Hz), `seq` (0 L1-L2-L3, 1 duas fases trocadas); alternador: `rpm`, `exc` (% da corrente de campo), `kw` (lâmpadas, kW a 220 V) | motor: `ns`, `n` (rpm), `s` (%), `T` (N·m), `Pout` (kW), `I`, `Ip` (A, de linha; partida direta), `fp`, `eta` (%), `P` (kW), `Q` (kvar, da rede), `S` (kVA, da rede), `fpRede`, `Irede` (A, só com capacitores), `Vbob` (V em cada bobina); alternador: `fg` (Hz), `E` (V a vazio), `V` (V nos terminais), `Ig` (A), `Pg`, `Pt` (kW), `Tt` (N·m na turbina); escondidas: `Tp`, `Tmax`, `TN` (N·m), `fr` (Hz, s·f), `stall`, `over`, `parte` (0/1), `dir` (1 ou −1), `Qm` (kvar), `Sm` (kVA) do motor |
| `shaft` | Árvore de aço SAE 1045 em dois mancais a 800 mm, girada pelo motor por um acoplamento, com uma engrenagem de 250 mm (20°, 15 kg) entre eles; eixo de massa desprezível | `brg` (0 rolamentos de esferas, 1 de rolos, 2 buchas com óleo), `P` (kW), `n` (rpm), `a` (mm, posição da engrenagem a partir do mancal A), `d` (mm); buchas: `oil` (0 SAE 10, 1 SAE 30, 2 SAE 10W-30), `temp` (°C), `cr` (‰, folga radial relativa) | `T` (N·m), `Ft`, `F`, `RA`, `RB` (N), `M` (N·m), `sig`, `tau`, `svm`, `tmax` (MPa), `FS`, `FStr`, `FSf` (Goodman), `defl` (mm), `nc` (rpm), `amp` (µm); rolamentos: `LA`, `LB` (h, L10); buchas: `visc` (cSt), `S`, `h0` (µm), `f`, `loss` (W); escondidas: `r` (n/n_c), `Lmin` (h), `regime` (0 limítrofe, 1 misto, 2 filme completo), `eps`, `pm` (MPa), `hersey` |
| `spring` | Prensa de ensaio de molas helicoidais (pontas esquadrejadas e retificadas, folga entre espiras de 0,3·D) e macaco de parafuso com mancal axial de rolamento (sem atrito de colar) | `modo` (0 mola, 1 macaco); mola: `arr` (0 uma, 1 duas em série, 2 duas em paralelo), `mat` (0 aço mola, 1 inox, 2 bronze fosforoso), `dw` (mm, fio), `Dm` (mm, diâmetro médio), `na` (espiras ativas), `F` (N); macaco: `perfil` (0 quadrada, 1 trapezoidal 30°), `ent` (0 a 2 = 1 a 3 entradas), `pas` (mm), `dmed` (mm), `mu`, `W` (kN), `R` (m, manivela) | mola: `C`, `Kw`, `k`, `keq` (N/mm), `defl`, `L0`, `Ls` (mm), `tau`, `tauAdm` (MPa), `FS`, `U` (J), `fn` (Hz); macaco: `L` (mm), `lambda`, `phi` (°), `Tup`, `Tdown` (N·m; negativo = desce sozinha), `eta` (%), `Fman` (N); escondidas: `solid`, `flamb`, `lock` (0/1), `Fs` (N, força que fecha uma mola) |

Controles e leituras podem ter `show: (v) => boolean`: só aparecem quando fazem sentido (o `n` só no processo
politrópico, o `rp` só no Brayton). Leituras com `hidden: true` ficam fora da tabela, mas valem em `expect` e
`goals`. Atenção ao montar tarefas no pistão e nos ciclos: ali o controle escondido também não age no modelo. No
pistão, o isobárico e o isocórico são comandados por `t2` e os outros processos por `v2`; nos ciclos, Otto e Diesel
usam `r` e o Brayton usa `rp` e `regen`. Na bancada `vapor`, os controles do Rankine não agem na refrigeração (e
vice-versa), e as leituras do ciclo que não está na tela valem 0. No `compressor`, o espaço morto muda a vazão
(`etav`, `fad`, `Pw`), mas não `w` nem `T2` (modelo ideal); em dois estágios, `pi` = √(P₁·P₂), `T2` é a descarga de
cada estágio, `pi` e `save` valem 0 com um estágio só e `rmax` vale 0 quando c = 0 (sem limite). Na `tensile`, com o
corpo de prova rompido (`eps` além da ruptura do material) `sig` e `F` valem 0 e `ep` passa a ser o alongamento após a
ruptura; descarregado, `sig` = 0 e `ep` fica igual. As leituras `se`, `Ur`, `sr`, `along` e `ra` só entram na tabela
quando o ensaio passa do ponto em que são medidas, mas valem sempre em `expect` e `goals`. Na `beam`, `P` e `a` só
agem com carga concentrada e `w` só com a distribuída; `RB` vale 0 no balanço e `MA` vale 0 na biapoiada. No
`coldwork`, abaixo de 5 % de redução (o %TF crítico) não há recristalização e `trx` vale 0; laminado a quente,
`X` = 100 e `res` = 0; com `ta` = 25 nada acontece no forno (X = 0 e `res` = 100 se houve redução a frio). O `d` é o
grão da maior parte (o antigo até X = 50 %, depois o novo). No `charpy`, `grain` só age nos aços; nos metais CFC
`shear` vale sempre 100 e `tt` e `t27` valem 0 (não há transição). Na `vibration`, `rpm` só age na vibração forçada e
`na` só com o absorvedor; `wd`, `Td` e `dec` valem 0 quando não há oscilação (ζ ≥ 1), `n1` e `n2` valem 0 sem
absorvedor, e `r` e `phase` são do sistema de 1 grau. A vibração livre (soltar, 1º e 2º modos) existe só no desenho:
as leituras do modelo são as do regime permanente e as propriedades do sistema. Na `ramp`, `F` só age na caixa e `r`
só nos corpos que rolam; parado, `a`, `v` e `t` valem 0; μc maior que μe não é físico, e a conta usa μc = μe. A
corrida do desenho solta os quatro corpos juntos, sem `F`. No `gears`, `z3` e `z4` só agem com dois pares e `zi` só
com a intermediária; com um par, `Ti` é o próprio torque do tambor e `Ft2` e `taui` valem 0. O torque do motor
sai da carga (T no tambor = m·g·R), e não da rotação. Na `corrosion`, `V` só age com a fonte; com o fio, o anodo é o
metal mais ativo e, com a fonte, é sempre a placa A. Sem pilha (circuito aberto, metais iguais ou fonte que não vence o
par), `I`, `prot`, `H2` e `lossAn` valem 0 e `kAn` vale 1. No limite do O₂ (aço em água neutra), `kAn` = 1 + (área do catodo)/(área do anodo).
A proteção do catodo chega a 100 % quando ele é polarizado 0,15 V abaixo do próprio potencial (no aço, −0,80 V) e o H₂
aparece abaixo de −1,05 V (superproteção); no ácido, toda a corrente catódica vira H₂.
No `motor`, as leituras do motor e as do alternador saem sempre (cada grupo só aparece na sua máquina). O ponto de
operação é onde o conjugado do motor iguala a carga mais o atrito; acima do conjugado máximo o motor tomba (`stall`
= 1, rotação zero e a corrente de partida). Cada bobina é de 220 V: estrela na rede de 220 V dá 127 V por bobina
(corrente e conjugado de partida ÷ 3) e triângulo na rede de 380 V satura o ferro (`over` = 1). A partida animada
(direta ou estrela-triângulo) e o gráfico de corrente × tempo existem só no desenho.
No `shaft`, a força nos dentes vem da potência e da rotação (T = P/ω, F = 2T/D/cos 20°); o peso da engrenagem entra só
na velocidade crítica (n_c = √(k/m), com k = 3EIL/(a²b²) sob a engrenagem). As leituras dos rolamentos e as da bucha
saem sempre (cada grupo só aparece com o seu mancal); `LA` e `LB` param em 10 milhões de horas, e a bucha é a do
mancal mais carregado (L/D = 1, tabela de Raimondi e Boyd). O 10W-30 é igual ao SAE 10 a 0 °C e ao SAE 30 a 100 °C.
Na `spring`, as leituras da mola e as do macaco também saem sempre. Fechada (`solid` = 1), a deflexão para no curso
até encostar as espiras e `tau` não cresce mais; com F = 0, `FS` vale 99. A subida e a descida animadas do macaco
(botões ▶) existem só no desenho; `lock` = 1 quando μ′ > tg λ.

Um tópico ganha uma bancada com tarefas como um jogo do tipo `lab` (vira cartão de revisão):

```ts
{
  id: 'mec-bom-lab1',
  type: 'lab',
  lab: 'pump',
  title: 'Bomba centrífuga por dentro',
  perRound: 5,                       // opcional: sorteia até 5 tarefas (o nível limita a 3/4/5)
  tasks: [
    {
      kind: 'predict',               // 🔮 preveja e observe
      setup: { valve: 100 },         // estado inicial (o resto fica no padrão)
      prompt: 'Você vai fechar a válvula até 30%. O que acontece com Q e H?',
      change: { valve: 30 },         // aplicado (animado) depois da resposta
      options: ['Q diminui e H aumenta', 'Q diminui e H diminui', '...'],
      answer: 0,                     // o jogo embaralha as alternativas na tela
      expect: [{ out: 'Q', trend: 'down' }, { out: 'H', trend: 'up' }],  // conferido pelo npm test
      why: 'Fechar a válvula aumenta a perda de carga...',
    },
    {
      kind: 'goal',                  // 🎯 missão
      setup: { temp: 90, zs: -1, valve: 100 },
      lock: ['temp', 'rpm'],         // controles travados
      prompt: 'Acabe com a cavitação mantendo pelo menos 90 m³/h.',
      goals: [{ out: 'margin', min: 0.5 }, { out: 'Q', min: 90 }],  // `label` esconde a faixa
      hint: 'Afogue a bomba: suba o nível do tanque.',
      solution: { zs: 6 },           // conferida pelo npm test e mostrada se o jogador desistir
      why: 'NPSHd = (Patm − Pv)/ρg + zs − perdas...',
    },
  ],
}
```

O `npm test` garante que **cada previsão acontece de verdade** no modelo (`expect`), que **nenhuma missão começa
cumprida** e que a **`solution` cumpre todas as metas**. Nas previsões, os controles ficam travados até a resposta.

**Nova bancada:** crie o modelo em `src/learning/labs/<nome>.ts` (parâmetros, leituras, `compute`, experimentos),
registre em `src/learning/labs/index.ts`, crie o desenho em `src/ui/labs/<nome>View.ts` (função `draw` num quadro de
960 × 560) e registre em `src/ui/labs/views.ts`. Acrescente o id em `LabId` (`src/learning/types.ts`). A view pode
ter ainda `status` (frase de situação sob o desenho), `pointer`/`cursor` (arrastar peças no desenho), `tick`
(animações que mudam controles) e `actions` (botões extras, como "▶ Repetir o processo").

## Boas práticas (o que faz o jogo ensinar de verdade)

- **Escreva o `why` de cada alternativa e de cada item de jogo.** O feedback comentado é onde o aprendizado acontece.
- **Explique o raciocínio, não só a resposta**: o "como pensar" é o que transfere para questões novas. É o papel do
  **roteiro**: questões parecidas devem apontar para o mesmo roteiro, para o jogador reconhecer o tipo na prova.
- Tenha pelo menos **1 questão de nível 1** por tópico (o teste exige) e uma escada até o nível 3: as de nível 2
  só aparecem com 30% de maestria no tópico, e as de nível 3 com 60%. Meta atual: **20 a 26 questões por tópico**,
  umas 25% de nível 1, 55% de nível 2 e 20% de nível 3 (nenhum tópico sem nível 3).
- **Siga o histórico das provas**: os temas e os formatos que a Cesgranrio repete (cerca de 2/3 conceituais, 1/4 de
  cálculo, algumas I/II/III, associação de colunas, EXCETO/NÃO e "I PORQUE II"). O catálogo está em `docs/MATERIAL.md`.
- A maestria considera até 8 itens vistos (questões + jogos).
- Marque em `edital` quais itens do conteúdo programático o tópico cobre — o **Caderno › Edital** mostra a cobertura.
- Use **pré-requisitos** para montar trilhas (ex.: Hidrostática → Bombas).
- Questões de provas anteriores: indique a origem em `source`.
