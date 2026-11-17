import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

export default defineTopic({
  id: 'mec.rankine',
  name: 'Ciclo de Rankine',
  summary: 'Os quatro processos do ciclo a vapor, balanço de energia, título e tabelas de vapor, rendimento, o limite de Carnot, como melhorar a eficiência, o ciclo real, a cogeração e o ciclo combinado.',
  order: 2,
  weight: 3,
  equipment: 'turbine',
  requires: ['mec.gases-1a-lei'],
  edital: ['b2.rankine-brayton', 'b1.ciclos-teoricos', 'b1.termo-2lei', 'b2.cogeracao', 'b2.turbinas'],
  lesson: [
    {
      title: 'Os quatro processos',
      body: 'O ciclo de Rankine é o ciclo das usinas a vapor (e das caldeiras de refinaria que geram energia):\n\n- **1→2 Bomba:** comprime o **líquido** (pouco trabalho).\n- **2→3 Caldeira:** fornece calor a pressão constante: aquece, **vaporiza** e, geralmente, **superaquece** a água.\n- **3→4 Turbina:** o vapor **expande** e gera trabalho no eixo.\n- **4→1 Condensador:** rejeita calor a pressão constante e o vapor volta a ser **líquido**.\n\nNo ciclo ideal, bomba e turbina são **isentrópicas**: são **dois processos isobáricos** (caldeira e condensador) e **dois isentrópicos** (bomba e turbina), com **mudança de fase** do fluido.',
      hot: 'A descrição "dois isobáricos e dois isentrópicos, com mudança de fase" (Petrobras 2012) e o estado da água em cada ponto do esquema — vapor a alta ou baixa pressão, líquido a alta ou baixa pressão (Transpetro 2018).',
      tip: 'Siga a água: líquido → **bomba** → **caldeira** (vira vapor) → **turbina** (gira) → **condensador** (vira líquido de novo).',
      lab: { lab: 'vapor', preset: { cyc: 0, mod: 0, pb: 2, t3: 450, pc: 10, etat: 100 }, label: 'Ver a usina a vapor' },
    },
    {
      title: 'Balanço de energia e rendimento',
      body: 'Por unidade de massa (h = entalpia):\n\n- Turbina: **w_{t} = h_{3} − h_{4}**\n- Bomba: **w_{b} = h_{2} − h_{1} ≈ v·(P_{2} − P_{1})** — pequeno, porque o volume específico do líquido é pequeno\n- Calor fornecido: **q_{in} = h_{3} − h_{2}**\n- Calor rejeitado: **q_{out} = h_{4} − h_{1}**\n\n**η = w_{líq}/q_{in} = (w_{t} − w_{b})/q_{in} = 1 − q_{out}/q_{in}**',
      example: 'h_{1} = 190, h_{2} = 200, h_{3} = 3.200, h_{4} = 2.200 kJ/kg:\nw_{t} = 1.000; w_{b} = 10; q_{in} = 3.000 → η = 990/3.000 = **33%**.',
      hot: 'Rendimento e calor rejeitado a partir das entalpias ou dos calores (Transpetro 2011, Petrobras 2014 e 2018, Petrobras Biocombustível 2010) e a **vazão de vapor** para uma potência dada, ṁ = Ẇ/(h₃ − h₄) (Transpetro 2008). Saiu até a razão de trabalho reverso, w_{b}/w_{t} (Petrobras Biocombustível 2010).',
      tip: 'Monte uma tabelinha: w_{t}, w_{b}, q_{in}, q_{out}. Confira sempre: **q_{in} − q_{out} = w_{t} − w_{b}**.',
      trap: 'No Rankine o trabalho da bomba é pequeno. No ciclo **Brayton** (turbina a gás) é o contrário: o compressor consome boa parte do trabalho da turbina.',
      lab: { lab: 'cycle', preset: { cyc: 2, rp: 12, t3: 1100, regen: 0 }, label: 'Ver o compressor do Brayton' },
    },
    {
      title: 'Título, tabelas de vapor e o diagrama T–s',
      body: 'Dentro da **cúpula de saturação**, líquido e vapor convivem à mesma pressão e temperatura. O **título x** é a fração de vapor na mistura (0 = líquido saturado; 1 = vapor saturado):\n\n**h = h_{l} + x·h_{lv}**   **s = s_{l} + x·s_{lv}**   (h_{lv} = h_{v} − h_{l})\n\nNa turbina ideal, **s₄ = s₃**. Se o estado 4 cai dentro da cúpula:\n\n**x₄ = (s₃ − s_{l})/s_{lv}**  e depois  **h₄ = h_{l} + x₄·h_{lv}**\n\nNo diagrama **T–s**, a área sob um processo reversível é o calor trocado: sob a caldeira, q_{in}; sob o condensador, q_{out}; dentro do ciclo, w_{líq}.',
      example: 'Saída a 10 kPa (s_{l} = 0,649 e s_{lv} = 7,500 kJ/kg·K; h_{l} = 192 e h_{lv} = 2.392 kJ/kg), com s₃ = 7,00 kJ/kg·K:\nx₄ = (7,00 − 0,649)/7,500 = **0,847** → h₄ = 192 + 0,847 × 2.392 ≈ **2.218 kJ/kg**.',
      trap: 'Título só existe **dentro** da cúpula. Se (s₃ − s_{l})/s_{lv} der maior que 1, a saída é **vapor superaquecido** (sem título) e a conta vai para a tabela de superaquecido.',
      lab: { lab: 'vapor', preset: { cyc: 0, mod: 0, pb: 4, t3: 400, pc: 10, etat: 100 }, label: 'Ver o título no T–s' },
    },
    {
      title: 'Carnot: o limite',
      body: 'Nenhum ciclo operando entre as mesmas fontes supera o **ciclo de Carnot** (2ª lei):\n\n**η_{Carnot} = 1 − T_{F}/T_{Q}** (temperaturas em **kelvin**)\n\nO Rankine real fica abaixo disso por causa das irreversibilidades e porque boa parte do calor entra a temperaturas bem menores que a máxima.',
      example: 'Fonte quente a 327 °C (600 K) e fria a 27 °C (300 K): η_{máx} = 1 − 300/600 = **50%**.',
      trap: 'Usar °C: 1 − 27/327 daria 92% — absurdo.',
      lab: { lab: 'vapor', preset: { cyc: 0, mod: 0, pb: 15, t3: 600, pc: 10, etat: 100 }, label: 'Comparar com o Carnot' },
    },
    {
      title: 'Como aumentar o rendimento',
      body: 'A ideia geral: **aumentar a temperatura média em que o calor entra** e/ou **baixar a temperatura em que o calor sai**.\n\n- **Superaquecimento:** ↑ η e ↑ título na saída da turbina (menos umidade).\n- **Maior pressão na caldeira:** ↑ η, mas ↓ título na saída da turbina (gotas erodem as pás) — por isso vem junto com superaquecimento ou reaquecimento.\n- **Reaquecimento:** o vapor expande em parte, volta à caldeira e é reaquecido: ↑ trabalho e ↑ título.\n- **Regeneração:** vapor extraído da turbina preaquece a água de alimentação → ↑ temperatura média de entrada do calor → ↑ η.\n- **Menor pressão no condensador (vácuo):** ↓ temperatura de rejeição → ↑ η (mas ↓ título na saída).',
      hot: 'Reconhecer no diagrama T–s o Rankine simples, com reaquecimento ou com regeneração (Petrobras 2018) e o efeito de cada melhoria no rendimento e no título.',
      tip: '**Sobe a temperatura média de entrada ou desce a de saída → sobe o η.** Reaquecimento = mais **título**; regeneração = mais **η**.',
      trap: 'O reaquecimento aumenta bastante o **título** e o trabalho; o ganho de rendimento é **modesto**. A banca adora trocar os efeitos do reaquecimento e da regeneração.',
      lab: { lab: 'vapor', preset: { cyc: 0, mod: 1, pb: 8, t3: 450, pc: 10, etat: 100 }, label: 'Testar reaquecimento e regeneração' },
    },
    {
      title: 'Equipamentos auxiliares e perdas',
      body: '- **Desaerador:** remove O₂ e CO₂ dissolvidos na água de alimentação (corrosão).\n- **Economizador:** preaquece a água com os gases de combustão.\n- **Superaquecedor e reaquecedor:** feixes de tubos dentro da caldeira.\n- **Pré-aquecedor de ar:** aproveita o calor dos gases na chaminé.\n- **Torre de resfriamento:** resfria a água do condensador por evaporação.\n\nPerdas reais: irreversibilidades na turbina e na bomba (eficiência isentrópica < 1), perdas de carga, perdas de calor e a perda nos gases da chaminé.',
      hot: 'Por que o ciclo real se afasta do ideal — atrito nas pás e bocais da turbina, irreversibilidades na bomba, perda de carga e calor perdido nas tubulações (Petrobras 2011).',
      lab: { lab: 'vapor', preset: { cyc: 0, mod: 0, pb: 4, t3: 400, pc: 10, etat: 85 }, label: 'Ver a turbina real' },
    },
    {
      title: 'Ciclo real, cogeração e ciclo combinado',
      body: '**Eficiências isentrópicas:**\n- Turbina: **η_{t} = (h₃ − h₄)/(h₃ − h_{4s})** — real ÷ ideal (a real produz menos).\n- Bomba: **η_{b} = (h_{2s} − h₁)/(h₂ − h₁)** — ideal ÷ real (a real consome mais).\n\nNa expansão real, a entropia **aumenta** (s₄ > s₃) e o vapor sai **menos úmido** (com mais entalpia) que no ideal.\n\n**Razão de trabalho reverso:** w_{b}/w_{t}. No Rankine é ~1–2% (bombear líquido é barato); no Brayton, 40–80%.\n\n**Trabalho da bomba:** w_{b} ≈ v·(P₂ − P₁), com v ≈ 0,001 m³/kg.\n\n**Cogeração:** produzir **trabalho (eletricidade) e calor útil** (vapor de processo) com o mesmo combustível, aproveitando o calor que seria jogado fora no condensador. Fator de utilização = (W + Q_{processo})/Q_{combustível}.\n\n**Ciclo combinado:** os gases quentes da exaustão de uma **turbina a gás** (Brayton) geram vapor numa **caldeira de recuperação** (HRSG) que move um ciclo **Rankine**.',
      example: 'Turbina com h₃ = 3.300, h_{4s} = 2.300 kJ/kg e η_{t} = 0,85: w_{t} = 0,85 × 1.000 = 850 kJ/kg → h₄ = **2.450 kJ/kg**.',
      hot: 'Cogeração — energia elétrica e térmica a partir do mesmo combustível (Transpetro 2008) — e ciclo combinado (item do edital, b2.cogeracao).',
      tip: 'Eficiência isentrópica: na **turbina**, real em cima; no **compressor ou bomba**, real embaixo. (O real é sempre o "pior": produz menos ou gasta mais.)',
      trap: 'Na turbina real, h₄ é **maior** que h_{4s} (sobra energia no vapor que saiu), não menor.',
      lab: { lab: 'vapor', preset: { cyc: 0, mod: 0, pb: 4, t3: 400, pc: 10, etat: 85 }, label: 'Ver a turbina real' },
    },
    {
      title: 'Turbinas a vapor: ação e reação',
      body: '**Turbina de ação (impulso):** toda a queda de pressão acontece nos **bocais** (expansores fixos) — o vapor sai deles em alta velocidade. Nas **pás móveis** a pressão fica **constante**: o jato muda de direção, perde velocidade e empurra a roda.\n\n**Turbina de reação:** a expansão é dividida entre as pás **fixas** e as **móveis** (as móveis também funcionam como bocais, e a aceleração do vapor nelas gera uma força de reação). **Grau de reação** = queda de entalpia nas pás móveis ÷ queda no estágio; a turbina **Parsons** tem 50%.\n\n**Escalonamento** (vários estágios no mesmo eixo):\n- **de velocidade (Curtis):** uma só expansão nos bocais e várias fileiras de pás móveis, com pás-guia fixas entre elas, aproveitando a velocidade aos poucos;\n- **de pressão (Rateau):** vários conjuntos bocal + roda em série, cada um com uma parte da queda de pressão;\n- **de pressão e velocidade:** combinação dos dois.\n\nQuanto à direção do escoamento: **axiais** (paralelo ao eixo, as mais comuns) e **radiais**.',
      example: 'Turbina de grande porte: estágio Curtis na entrada (absorve a maior queda e permite controlar a admissão) seguido de muitos estágios de reação.',
      hot: 'Onde o vapor se expande numa turbina de **ação** — nos bocais, com queda de pressão e aumento de velocidade (Petrobras 2012, Petrobras 2018); classificação dos estágios (pressão, velocidade, pressão e velocidade) (Petrobras 2011) e das turbinas pela trajetória do vapor (Transpetro 2008).',
      tip: '**Ação:** a pressão cai **só no bocal**. **Reação:** cai **nos dois** (fixas e móveis). **C**urtis = **C**inética (velocidade); **R**ateau = **R**epartir a pressão.',
      trap: 'Na turbina de ação o vapor **não** se expande nas pás móveis: lá a pressão é constante; o que cai é a velocidade.',
    },
  ],
  roteiros: [
    {
      id: 'balanco-ciclo',
      name: 'Balanço de energia do ciclo a vapor',
      when: 'Ciclo de Rankine com calores, trabalhos ou entalpias por kg; pedem o rendimento, o calor rejeitado, o trabalho líquido ou a vazão.',
      steps: [
        'Monte os termos por kg: turbina w_{t} = h₃ − h₄; bomba w_{b} = h₂ − h₁; caldeira q_{in} = h₃ − h₂; condensador q_{out} = h₄ − h₁.',
        'Feche o ciclo: w_{líq} = w_{t} − w_{b} = q_{in} − q_{out}.',
        'Rendimento: η = w_{líq}/q_{in}.',
      ],
      note: 'O condensador joga fora mais da metade do calor; a bomba consome quase nada (comprime líquido).',
    },
    {
      id: 'carnot',
      name: 'Rendimento máximo (Carnot)',
      when: 'Máquina térmica entre duas temperaturas; pedem o rendimento máximo possível.',
      steps: [
        'Passe as temperaturas para kelvin.',
        'η_{Carnot} = 1 − T_{F}/T_{Q}.',
        'Calcule: nenhum ciclo real entre essas fontes passa disso.',
      ],
      note: 'Em °C a conta sai errada.',
    },
    {
      id: 'melhorar-rankine',
      name: 'O que muda o rendimento do Rankine',
      when: 'Pedem o efeito de mexer na pressão da caldeira ou do condensador, no superaquecimento, no reaquecimento ou na regeneração.',
      steps: [
        'Pergunte o que a mudança faz com a temperatura **média** de entrada de calor e com a de rejeição.',
        'Regra de ouro: η sobe se o calor entra mais quente (superaquecimento, pressão alta na caldeira, regeneração) ou sai mais frio (vácuo no condensador).',
        'Confira o título na saída da turbina: mais vácuo ou mais pressão na caldeira deixam o vapor mais úmido; superaquecimento e reaquecimento o secam.',
      ],
      note: 'Reaquecimento aumenta principalmente o trabalho e o título; a regeneração é que mais aumenta o rendimento.',
    },
    {
      id: 'turbina-tabelas',
      name: 'Turbina a vapor pelas tabelas',
      when: 'Turbina com entropia ou entalpia de entrada e pressão de saída; pedem o título, a entalpia de saída ou o trabalho.',
      steps: [
        'Turbina ideal: s₄ = s₃.',
        'Na saída (mistura): x = (s − s_{l})/s_{lv}; depois h₄ = h_{l} + x·h_{lv}.',
        'Trabalho: w_{t} = h₃ − h₄ (real = eficiência isentrópica × ideal).',
      ],
      note: 'Título baixo na saída = gotas que erodem as últimas pás. η_{t} = real ÷ ideal, sempre menor que 1.',
    },
    {
      id: 'bomba-rankine',
      name: 'Trabalho da bomba (w = v·ΔP)',
      when: 'Bomba de um ciclo a vapor; pedem o trabalho de bombeamento ou por que ele é tão pequeno.',
      steps: [
        'Líquido quase incompressível: w_{b} = ∫v·dP ≈ v·(P₂ − P₁).',
        'Use v ≈ 0,001 m³/kg e as pressões em kPa (kPa·m³/kg = kJ/kg).',
        'Calcule e compare com a turbina: a bomba gasta 1 a 2 % do trabalho dela.',
      ],
      note: 'MPa → kPa (× 1.000). Vapor tem volume específico centenas de vezes maior: compressor de gás gasta muito; bomba de líquido, pouco.',
    },
  ],
  questions: [
    {
      id: 'mec-rk-01',
      type: 'gen',
      difficulty: 1,
      lessonRef: 1,
      title: 'Rendimento térmico do ciclo',
      roteiro: 'balanco-ciclo',
      generate(rng) {
        const qin = pickOne(rng, [2500, 2800, 3000, 3200, 3500]);
        const eta = pickOne(rng, [0.25, 0.3, 0.32, 0.35, 0.4]);
        const qout = Math.round(qin * (1 - eta));
        const correct = (1 - qout / qin) * 100;
        const { options, answer } = numericOptions({
          correct,
          unit: '%',
          digits: 1,
          correctWhy: `η = 1 − q_{out}/q_{in} = 1 − ${fmt(qout)}/${fmt(qin)} = ${fmt(correct, 1)}%.`,
          distractors: [
            { value: (qout / qin) * 100, why: 'Essa é a fração do calor **rejeitada**; o rendimento é 1 − q_{out}/q_{in}.' },
            { value: ((qin - qout) / qout) * 100, why: 'Dividiu pelo calor rejeitado; o rendimento divide pelo calor **fornecido**.' },
          ],
        });
        return {
          prompt: `Em um ciclo de Rankine, a caldeira fornece **${fmt(qin)} kJ/kg** ao fluido de trabalho e o condensador rejeita **${fmt(qout)} kJ/kg**. O rendimento térmico do ciclo é, aproximadamente,`,
          options,
          answer,
          steps: [
            `q_{in} = ${fmt(qin)} kJ/kg; q_{out} = ${fmt(qout)} kJ/kg.`,
            `w_{líq} = ${fmt(qin)} − ${fmt(qout)} = ${fmt(qin - qout)} kJ/kg.`,
            `η = ${fmt(qin - qout)}/${fmt(qin)} = **${fmt(correct, 1)}%**.`,
          ],
          explanation: `Num ciclo, w_{líq} = q_{in} − q_{out} = ${fmt(qin)} − ${fmt(qout)} = ${fmt(qin - qout)} kJ/kg.\n\nη = w_{líq}/q_{in} = ${fmt(qin - qout)}/${fmt(qin)} = **${fmt(correct, 1)}%**.`,
        };
      },
    },
    {
      id: 'mec-rk-02',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Rendimento máximo (Carnot)',
      roteiro: 'carnot',
      generate(rng) {
        const TQc = pickOne(rng, [227, 327, 427, 527, 727]);
        const TFc = pickOne(rng, [27, 77, 127]);
        const TQ = TQc + 273;
        const TF = TFc + 273;
        const correct = (1 - TF / TQ) * 100;
        const { options, answer } = numericOptions({
          correct,
          unit: '%',
          digits: 1,
          correctWhy: `η = 1 − T_{F}/T_{Q} = 1 − ${TF}/${TQ} = ${fmt(correct, 1)}% (em kelvin).`,
          distractors: [
            { value: (1 - TFc / TQc) * 100, why: 'Usou °C. A razão de temperaturas só vale em **kelvin**.' },
            { value: (TF / TQ) * 100, why: 'Essa é a fração rejeitada (T_{F}/T_{Q}), não o rendimento.' },
            { value: ((TQ - TF) / TF) * 100, why: 'Dividiu pela temperatura fria; o rendimento de Carnot divide pela **quente**.' },
          ],
        });
        return {
          prompt: `Uma máquina térmica opera entre uma fonte quente a **${TQc} °C** e uma fonte fria a **${TFc} °C**. O rendimento térmico **máximo** teoricamente possível é`,
          options,
          answer,
          hint: 'Carnot, com temperaturas absolutas.',
          steps: [
            `T_{Q} = ${TQc} + 273 = ${TQ} K; T_{F} = ${TFc} + 273 = ${TF} K.`,
            `η = 1 − ${TF}/${TQ}.`,
            `η = **${fmt(correct, 1)}%**.`,
          ],
          explanation: `T_{Q} = ${TQc} + 273 = ${TQ} K; T_{F} = ${TFc} + 273 = ${TF} K.\n\nη_{Carnot} = 1 − ${TF}/${TQ} = **${fmt(correct, 1)}%**. Nenhum ciclo real entre essas fontes chega a isso.`,
        };
      },
    },
    {
      id: 'mec-rk-03',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Rendimento a partir das entalpias',
      roteiro: 'balanco-ciclo',
      generate(rng) {
        const h1 = pickOne(rng, [150, 170, 190]);
        const wb = pickOne(rng, [5, 8, 10, 12]);
        const h2 = h1 + wb;
        const h3 = pickOne(rng, [2800, 3000, 3200, 3400]);
        const wt = pickOne(rng, [800, 900, 1000, 1100, 1200]);
        const h4 = h3 - wt;
        const qin = h3 - h2;
        const correct = ((wt - wb) / qin) * 100;
        const { options, answer } = numericOptions({
          correct,
          unit: '%',
          digits: 1,
          correctWhy: `η = (w_{t} − w_{b})/q_{in} = (${wt} − ${wb})/${fmt(qin)} = ${fmt(correct, 1)}%.`,
          distractors: [
            { value: (wt / qin) * 100, why: 'Esqueceu de descontar o trabalho consumido pela bomba.' },
            { value: ((wt + wb) / qin) * 100, why: 'Somou o trabalho da bomba; ele é **consumido**, então subtrai.' },
            { value: (wt / h3) * 100, why: 'Dividiu pela entalpia h_{3}; o denominador é o calor fornecido, h_{3} − h_{2}.' },
            { value: ((h4 - h1) / qin) * 100, why: 'Essa é a fração de calor **rejeitada** no condensador.' },
          ],
        });
        return {
          prompt: `Em um ciclo de Rankine ideal, as entalpias são: saída do condensador **h₁ = ${h1} kJ/kg**, saída da bomba **h₂ = ${h2} kJ/kg**, entrada da turbina **h₃ = ${fmt(h3)} kJ/kg** e saída da turbina **h₄ = ${fmt(h4)} kJ/kg**. O rendimento térmico do ciclo é, aproximadamente,`,
          options,
          answer,
          hint: 'w_{líq} = (h₃ − h₄) − (h₂ − h₁); q_{in} = h₃ − h₂.',
          steps: [
            `w_{t} = ${fmt(h3)} − ${fmt(h4)} = ${fmt(wt)}; w_{b} = ${h2} − ${h1} = ${wb}; q_{in} = ${fmt(h3)} − ${h2} = ${fmt(qin)} (kJ/kg).`,
            `w_{líq} = ${fmt(wt)} − ${wb} = ${fmt(wt - wb)} kJ/kg.`,
            `η = ${fmt(wt - wb)}/${fmt(qin)} = **${fmt(correct, 1)}%**.`,
          ],
          explanation: `w_{t} = h₃ − h₄ = ${fmt(wt)} kJ/kg; w_{b} = h₂ − h₁ = ${wb} kJ/kg; q_{in} = h₃ − h₂ = ${fmt(qin)} kJ/kg.\n\nη = (${fmt(wt)} − ${wb})/${fmt(qin)} = **${fmt(correct, 1)}%**.`,
        };
      },
    },
    {
      id: 'mec-rk-04',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'No ciclo de Rankine, o calor é rejeitado para o ambiente no(a)',
      options: [
        { text: 'condensador.', why: 'Correta: ali o vapor de exaustão da turbina condensa, cedendo calor à água de resfriamento.' },
        { text: 'caldeira.', why: 'Na caldeira o calor **entra** no ciclo.' },
        { text: 'turbina.', why: 'A turbina produz trabalho (idealmente adiabática).' },
        { text: 'bomba.', why: 'A bomba consome trabalho para elevar a pressão do líquido.' },
        { text: 'superaquecedor.', why: 'O superaquecedor faz parte da caldeira: fornece calor.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: onde o calor é **rejeitado**.',
        'O calor entra na caldeira (e no superaquecedor) e sai no condensador; turbina e bomba trocam trabalho.',
        'Fica **condensador**.',
      ],
      explanation: 'Calor entra na **caldeira** (com superaquecedor) e sai no **condensador**. Turbina (produz) e bomba (consome) trocam trabalho.',
    },
    {
      id: 'mec-rk-05',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'O principal efeito do **reaquecimento** no ciclo de Rankine é',
      options: [
        { text: 'aumentar o título do vapor na saída da turbina e o trabalho líquido do ciclo.', why: 'Correta: reaquecer devolve o vapor para longe da região de saturação.' },
        { text: 'reduzir o trabalho consumido pela bomba.', why: 'O reaquecimento atua na expansão do vapor, não na bomba.' },
        { text: 'eliminar a necessidade do condensador.', why: 'O condensador continua indispensável para fechar o ciclo.' },
        { text: 'aumentar a pressão do condensador.', why: 'Não tem relação com a pressão do condensador.' },
        { text: 'preaquecer a água de alimentação com vapor extraído da turbina.', why: 'Isso é **regeneração**, não reaquecimento.' },
      ],
      answer: 0,
      roteiro: 'melhorar-rankine',
      steps: [
        'Reaquecer o vapor entre a turbina de alta e a de baixa acrescenta calor a temperatura alta.',
        'O rendimento sobe pouco; o ganho principal é outro.',
        'Mais trabalho por kg e vapor mais seco na saída: **aumenta o título e o trabalho líquido**.',
      ],
      explanation: 'No reaquecimento, o vapor expande na turbina de alta, volta à caldeira para ser reaquecido e termina a expansão na turbina de baixa. Resultado: **mais trabalho** e **mais título** (menos umidade) na saída; o rendimento sobe pouco.',
    },
    {
      id: 'mec-rk-06',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Reduzir a pressão do condensador de um ciclo de Rankine, mantidas as demais condições,',
      options: [
        { text: 'aumenta o rendimento, mas reduz o título na saída da turbina.', why: 'Correta: rejeita-se calor a temperatura menor, mas a expansão avança mais na região de mistura.' },
        { text: 'reduz o rendimento, pois diminui a temperatura de rejeição.', why: 'Rejeitar calor a temperatura **menor** aumenta o rendimento.' },
        { text: 'aumenta o rendimento e o título na saída da turbina.', why: 'O título cai: a expansão vai mais fundo na região de líquido + vapor.' },
        { text: 'não altera o rendimento, só o trabalho da bomba.', why: 'Altera o rendimento — é uma das principais alavancas de melhoria.' },
        { text: 'reduz o trabalho da turbina.', why: 'O trabalho da turbina aumenta (o salto de entalpia fica maior).' },
      ],
      answer: 0,
      roteiro: 'melhorar-rankine',
      steps: [
        'Menos pressão no condensador → temperatura de saturação menor: o calor sai mais frio.',
        'Calor saindo mais frio → **η aumenta**.',
        'Mas a expansão vai mais longe e o vapor sai **mais úmido** (título menor): **aumenta o rendimento, mas reduz o título**.',
      ],
      explanation: 'Baixar a pressão do condensador baixa a temperatura de saturação em que o calor é rejeitado → **η aumenta**. Efeito colateral: o vapor sai da turbina mais úmido (título menor), o que pode erodir as últimas fileiras de pás.',
    },
    {
      id: 'mec-rk-07',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Nos aquecedores regenerativos, vapor extraído da turbina preaquece a água antes da caldeira. Isso aumenta o rendimento do ciclo porque',
      options: [
        { text: 'eleva a temperatura média com que o calor é fornecido ao ciclo.', why: 'Correta: a água chega mais quente à caldeira e o calor externo entra a temperaturas mais altas.' },
        { text: 'aumenta o trabalho específico da turbina.', why: 'O vapor extraído deixa de expandir até o fim: o trabalho por kg de vapor gerado até diminui um pouco.' },
        { text: 'reduz a pressão do condensador.', why: 'A pressão do condensador não muda com a regeneração.' },
        { text: 'elimina as irreversibilidades da bomba.', why: 'Não tem relação com a bomba.' },
        { text: 'aumenta o título na saída da turbina.', why: 'Isso é efeito de superaquecimento e reaquecimento.' },
      ],
      answer: 0,
      roteiro: 'melhorar-rankine',
      steps: [
        'Sem regeneração, a caldeira gasta calor aquecendo água ainda fria — calor que entra a temperatura baixa.',
        'Preaquecendo com vapor extraído, a **temperatura média** de fornecimento de calor sobe.',
        'Fica **eleva a temperatura média com que o calor é fornecido**: o ciclo se aproxima do Carnot.',
      ],
      explanation: 'Sem regeneração, parte do calor da caldeira é usada para aquecer água ainda fria — calor que entra a baixa temperatura. Preaquecendo com vapor extraído, a **temperatura média de fornecimento de calor sobe** e o ciclo se aproxima mais do Carnot.',
    },
    {
      id: 'mec-rk-08',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Título na saída da turbina',
      roteiro: 'turbina-tabelas',
      generate(rng) {
        const s3 = pickOne(rng, [6.6, 6.8, 7.0, 7.2, 7.4]);
        const x = (s3 - 0.649) / 7.5;
        const { options, answer } = numericOptions({
          correct: x,
          digits: 3,
          correctWhy: `x₄ = (s₃ − s_{l})/s_{lv} = (${fmt(s3, 2)} − 0,649)/7,500 = ${fmt(x, 3)}.`,
          distractors: [
            { value: s3 / 8.149, why: 'Dividiu s₃ por s_{v}. O título mede a distância a partir do líquido: (s₃ − s_{l})/s_{lv}.' },
            { value: 1 - x, why: 'Essa é a fração de **líquido** (a umidade), 1 − x.' },
            { value: s3 / 7.5, why: 'Esqueceu de descontar s_{l} no numerador.' },
          ],
        });
        return {
          prompt: `Vapor entra numa turbina ideal (isentrópica) com **s₃ = ${fmt(s3, 2)} kJ/kg·K** e sai para um condensador a **10 kPa**, onde s_{l} = 0,649 kJ/kg·K e s_{lv} = 7,500 kJ/kg·K. O título do vapor na saída da turbina é, aproximadamente,`,
          options,
          answer,
          hint: 'Turbina ideal: s₄ = s₃. Depois, x = (s − s_{l})/s_{lv}.',
          steps: [
            `s₄ = s₃ = ${fmt(s3, 2)} kJ/kg·K — entre s_{l} = 0,649 e s_{v} = 8,149: a saída é mistura.`,
            `x₄ = (${fmt(s3, 2)} − 0,649)/7,500.`,
            { do: 'Calcule e interprete o título (aqui não é preciso o trabalho).', show: `x₄ = **${fmt(x, 3)}** — cerca de ${fmt((1 - x) * 100, 0)} % da massa sai como gotas de líquido.` },
          ],
          explanation: `Turbina ideal: s₄ = s₃ = ${fmt(s3, 2)} kJ/kg·K, entre s_{l} = 0,649 e s_{v} = 8,149 — a saída é mistura.\n\nx₄ = (${fmt(s3, 2)} − 0,649)/7,500 = **${fmt(x, 3)}**: cerca de ${fmt((1 - x) * 100, 0)} % da massa sai como gotas de líquido.`,
        };
      },
    },
    {
      id: 'mec-rk-09',
      type: 'ce',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Num diagrama T–s, a área sob a curva de um processo **reversível** representa o calor trocado nesse processo; assim, num ciclo reversível, a área interna do ciclo representa o trabalho líquido.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: área no diagrama T–s de um processo **reversível**.',
        'Reversível: δq = T·ds → q = ∫T·ds, a área sob a curva. No ciclo, a área interna é ∮δq = w_{líq}.',
        '**Certo** (em processos irreversíveis, a área deixa de ser o calor).',
      ],
      explanation: 'Num processo reversível, δq = T·ds → q = ∫T·ds, a área sob a curva. No ciclo, ∮δq = w_{líq}: a área interna é o trabalho líquido. Em processos **irreversíveis** (estrangulamento, turbina real) a entropia cresce sem calor, e a área deixa de ser o calor trocado.',
    },
    {
      id: 'mec-rk-10',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'O ciclo de Rankine ideal, modelo das centrais a vapor, é composto por',
      options: [
        { text: 'dois processos isobáricos e dois isentrópicos, com mudança de fase do fluido de trabalho.', why: 'Correta: caldeira e condensador a pressão constante; bomba e turbina isentrópicas; a água vaporiza e condensa.' },
        { text: 'dois processos isocóricos e dois isentrópicos, sem mudança de fase.', why: 'Isso descreve o ciclo **Otto** (padrão a ar).' },
        { text: 'dois processos isotérmicos e dois isentrópicos, sem mudança de fase.', why: 'Isso descreve o ciclo de **Carnot** com gás.' },
        { text: 'dois processos isobáricos e dois isentrópicos, sem mudança de fase.', why: 'Isso é o **Brayton** (turbina a gás): o fluido é sempre gás.' },
        { text: 'um processo isobárico, um isocórico e dois isentrópicos.', why: 'Isso é o ciclo **Diesel** (padrão a ar).' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: os **processos** do Rankine ideal.',
        'Caldeira e condensador: pressão constante; bomba e turbina: isentrópicas — e a água muda de fase.',
        'Fica **dois isobáricos e dois isentrópicos, com mudança de fase**. Sem mudança de fase seria o Brayton.',
      ],
      explanation: 'Rankine = **2 isobáricos** (caldeira e condensador) + **2 isentrópicos** (bomba e turbina) **com mudança de fase**. O Brayton tem os mesmos tipos de processo, mas o fluido é sempre gás.',
    },
    {
      id: 'mec-rk-11',
      type: 'gen',
      difficulty: 1,
      lessonRef: 1,
      title: 'Vazão de vapor para uma potência',
      roteiro: 'balanco-ciclo',
      generate(rng) {
        const W = pickOne(rng, [5, 7.5, 10, 15, 20, 30]);
        const h3 = pickOne(rng, [3200, 3350, 3450, 3600]);
        const dh = pickOne(rng, [900, 1000, 1200, 1500]);
        const h4 = h3 - dh;
        const m = (W * 1000) / dh;
        const { options, answer } = numericOptions({
          correct: m,
          unit: 'kg/s',
          digits: 2,
          correctWhy: `ṁ = Ẇ/(h₃ − h₄) = ${fmt(W * 1000)} kW/${fmt(dh)} kJ/kg = ${fmt(m, 2)} kg/s.`,
          distractors: [
            { value: W / dh, why: 'Deixou a potência em MW: converta para kW (× 1.000).' },
            { value: (W * 1000) / h3, why: 'Usou só a entalpia de entrada; a turbina aproveita a **queda** h₃ − h₄.' },
            { value: (W * 1000) / h4, why: 'Usou a entalpia de saída no lugar da queda de entalpia.' },
            { value: (dh * W) / 1000, why: 'Multiplicou em vez de dividir.' },
          ],
        });
        return {
          prompt: `A turbina de uma central a vapor (ciclo de Rankine) gera **${fmt(W, 1)} MW**. O vapor entra com h = **${fmt(h3)} kJ/kg** e chega ao condensador com h = **${fmt(h4)} kJ/kg**. Supondo a turbina adiabática, a vazão mássica de vapor é, em kg/s,`,
          options,
          answer,
          hint: 'Ẇ = ṁ·(h₃ − h₄), com Ẇ em kW.',
          steps: [
            { do: 'Trabalho por kg na turbina: w_{t} = h₃ − h₄.', show: `${fmt(h3)} − ${fmt(h4)} = ${fmt(dh)} kJ/kg.` },
            { do: 'Potência = vazão × trabalho por kg: Ẇ = ṁ·w_{t}, com Ẇ em kW.', show: `${fmt(W * 1000)} kW = ṁ × ${fmt(dh)}.` },
            { do: 'Isole a vazão.', show: `ṁ = ${fmt(W * 1000)}/${fmt(dh)} = **${fmt(m, 2)} kg/s**.` },
          ],
          explanation: `Turbina adiabática: Ẇ = ṁ·(h₃ − h₄) → ṁ = ${fmt(W * 1000)} / (${fmt(h3)} − ${fmt(h4)}) = **${fmt(m, 2)} kg/s**.`,
        };
      },
    },
    {
      id: 'mec-rk-12',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Calor rejeitado no condensador',
      roteiro: 'balanco-ciclo',
      generate(rng) {
        const qin = pickOne(rng, [2600, 2800, 3000, 3200]);
        const wt = pickOne(rng, [800, 900, 1000, 1100]);
        const wb = pickOne(rng, [5, 10, 15]);
        const qout = qin - (wt - wb);
        const { options, answer } = numericOptions({
          correct: qout,
          unit: 'kJ/kg',
          digits: 0,
          correctWhy: `q_{out} = q_{in} − w_{líq} = ${fmt(qin)} − (${wt} − ${wb}) = ${fmt(qout)} kJ/kg.`,
          distractors: [
            { value: qin - wt, why: 'Esqueceu o trabalho da bomba: ele também entra no ciclo e sai como calor.' },
            { value: qin - wt - wb, why: 'Descontou o trabalho da bomba; ele é energia que **entra** no ciclo.' },
            { value: qin + wt - wb, why: 'Somou o trabalho da turbina; ele **sai** do ciclo como trabalho.' },
            { value: wt - wb, why: 'Esse é o trabalho líquido, não o calor rejeitado.' },
          ],
        });
        return {
          prompt: `Num ciclo de Rankine, por kg de vapor: a caldeira fornece **${fmt(qin)} kJ**, a turbina produz **${wt} kJ** e a bomba consome **${wb} kJ**. O calor rejeitado no condensador é, em kJ/kg,`,
          options,
          answer,
          hint: 'No ciclo: q_{in} − q_{out} = w_{t} − w_{b}.',
          steps: [
            `q_{in} = ${fmt(qin)}; w_{t} = ${wt}; w_{b} = ${wb} (kJ/kg).`,
            `q_{in} − q_{out} = w_{t} − w_{b} → q_{out} = ${fmt(qin)} − (${wt} − ${wb}).`,
            { do: 'Calcule o calor rejeitado e compare com o fornecido.', show: `q_{out} = **${fmt(qout)} kJ/kg** — mais da metade do calor fornecido.` },
          ],
          explanation: `Balanço do ciclo: q_{in} + w_{b} = w_{t} + q_{out} → q_{out} = ${fmt(qin)} + ${wb} − ${wt} = **${fmt(qout)} kJ/kg**. O condensador joga fora mais da metade do calor: por isso a cogeração aproveita esse calor.`,
        };
      },
    },
    {
      id: 'mec-rk-13',
      type: 'gen',
      difficulty: 2,
      lessonRef: 6,
      title: 'Razão de trabalho reverso',
      roteiro: 'balanco-ciclo',
      generate(rng) {
        const wt = pickOne(rng, [800, 900, 1000, 1200]);
        const wb = pickOne(rng, [8, 10, 12, 15]);
        const bwr = (wb / wt) * 100;
        const { options, answer } = numericOptions({
          correct: bwr,
          unit: '%',
          digits: 2,
          correctWhy: `bwr = w_{b}/w_{t} = ${wb}/${wt} = ${fmt(bwr, 2)}%.`,
          distractors: [
            { value: (wt / wb) * 100, why: 'Inverteu: a razão é o trabalho **consumido** ÷ o **produzido**.' },
            { value: (wb / (wt - wb)) * 100, why: 'Dividiu pelo trabalho líquido; a definição usa o da turbina.' },
            { value: ((wt - wb) / wt) * 100, why: 'Essa é a fração do trabalho que sobra (1 − bwr).' },
            { value: bwr * 10, why: 'Errou a vírgula.' },
          ],
        });
        return {
          prompt: `Num ciclo de Rankine, a turbina produz **${wt} kJ/kg** e a bomba consome **${wb} kJ/kg**. A razão de trabalho reverso (back work ratio) do ciclo é`,
          options,
          answer,
          hint: 'Razão de trabalho reverso = w_{consumido}/w_{produzido} = w_{b}/w_{t}.',
          steps: [
            { do: 'Separe o trabalho produzido (turbina) do consumido (bomba).', show: `w_{t} = ${wt} kJ/kg; w_{b} = ${wb} kJ/kg.` },
            { do: 'Razão de trabalho reverso = consumido ÷ produzido.', show: `bwr = w_{b}/w_{t} = ${wb}/${wt}.` },
            { do: 'Calcule e interprete.', show: `bwr = **${fmt(bwr, 2)}%** — minúscula, porque a bomba comprime líquido (na turbina a gás, o compressor come de 40 % a 80 %).` },
          ],
          explanation: `bwr = w_{b}/w_{t} = ${wb}/${wt} = **${fmt(bwr, 2)}%**. No Rankine ela é minúscula porque a bomba comprime **líquido** (volume específico pequeno). Na turbina a gás, o compressor come de 40% a 80% do trabalho da turbina.`,
        };
      },
    },
    {
      id: 'mec-rk-14',
      type: 'gen',
      difficulty: 2,
      lessonRef: 6,
      title: 'Turbina real: eficiência isentrópica',
      roteiro: 'turbina-tabelas',
      generate(rng) {
        const h3 = pickOne(rng, [3200, 3300, 3400]);
        const ds = pickOne(rng, [900, 1000, 1100]);
        const h4s = h3 - ds;
        const eta = pickOne(rng, [0.8, 0.85, 0.9]);
        const h4 = h3 - eta * ds;
        const { options, answer } = numericOptions({
          correct: h4,
          unit: 'kJ/kg',
          digits: 0,
          correctWhy: `h₄ = h₃ − η_{t}·(h₃ − h_{4s}) = ${fmt(h3)} − ${fmt(eta)} × ${fmt(ds)} = ${fmt(h4)} kJ/kg.`,
          distractors: [
            { value: h4s, why: 'Essa é a entalpia de saída **ideal**; a real é maior.' },
            { value: h3 - ds / eta, why: 'Dividiu pela eficiência: na turbina, o trabalho real é **menor** que o ideal.' },
            { value: h4s * eta, why: 'Multiplicou a entalpia de saída pela eficiência — sem sentido físico.' },
            { value: h4s - (1 - eta) * ds, why: 'Descontou a perda da saída ideal; a perda **fica** no vapor (h₄ > h_{4s}).' },
          ],
        });
        return {
          prompt: `Vapor entra numa turbina com h₃ = **${fmt(h3)} kJ/kg**. Numa expansão isentrópica até a pressão do condensador, sairia com h_{4s} = **${fmt(h4s)} kJ/kg**. Se a eficiência isentrópica da turbina é **${fmt(eta * 100)}%**, a entalpia real na saída é, em kJ/kg,`,
          options,
          answer,
          hint: 'η_{t} = (h₃ − h₄)/(h₃ − h_{4s}): real ÷ ideal.',
          steps: [
            { do: 'Trabalho ideal (isentrópico): h₃ − h_{4s}.', show: `${fmt(h3)} − ${fmt(h4s)} = ${fmt(ds)} kJ/kg.` },
            { do: 'Trabalho real = eficiência isentrópica × ideal.', show: `${fmt(eta)} × ${fmt(ds)} = ${fmt(eta * ds)} kJ/kg.` },
            { do: 'Entalpia real na saída: h₄ = h₃ − trabalho real.', show: `h₄ = ${fmt(h3)} − ${fmt(eta * ds)} = **${fmt(h4)} kJ/kg** — acima de h_{4s}: o atrito "devolve" energia ao vapor.` },
          ],
          explanation: `Trabalho ideal: ${fmt(ds)} kJ/kg. Real: ${fmt(eta)} × ${fmt(ds)} = ${fmt(eta * ds)} kJ/kg.\n\nh₄ = ${fmt(h3)} − ${fmt(eta * ds)} = **${fmt(h4)} kJ/kg** — maior que h_{4s}: o atrito devolve energia ao vapor como calor (mais entropia, vapor menos úmido).`,
        };
      },
    },
    {
      id: 'mec-rk-15',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Qual das alterações abaixo, isoladamente, **reduz** o rendimento térmico de um ciclo de Rankine?',
      options: [
        { text: 'Aumentar a pressão no condensador.', why: 'Correta: o calor passa a ser rejeitado a uma temperatura de saturação mais alta.' },
        { text: 'Aumentar a temperatura de superaquecimento.', why: 'Aumenta o η (sobe a temperatura média de entrada do calor).' },
        { text: 'Aumentar a pressão na caldeira.', why: 'Aumenta o η (vaporização a temperatura mais alta), embora reduza o título na saída.' },
        { text: 'Instalar aquecedores regenerativos de água de alimentação.', why: 'Aumenta o η.' },
        { text: 'Reduzir a pressão no condensador (mais vácuo).', why: 'Aumenta o η.' },
      ],
      answer: 0,
      roteiro: 'melhorar-rankine',
      steps: [
        'Para cada alternativa, veja se o calor passa a entrar mais quente ou a sair mais frio.',
        'Superaquecer, subir a pressão da caldeira, regenerar e baixar a pressão do condensador **aumentam** η.',
        '**Aumentar a pressão do condensador** eleva a temperatura de rejeição → η cai.',
      ],
      explanation: 'Regra de ouro: η sobe quando o calor **entra mais quente** (superaquecimento, pressão alta na caldeira, regeneração) ou **sai mais frio** (vácuo no condensador). Subir a pressão do condensador eleva a temperatura de rejeição → **η cai**.',
    },
    {
      id: 'mec-rk-16',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'No ciclo de Rankine, o trabalho consumido pela bomba é muito menor que o produzido pela turbina, embora as duas operem entre as mesmas pressões. Isso acontece porque',
      options: [
        { text: 'a bomba comprime líquido, cujo volume específico é muito menor que o do vapor (w ≈ ∫v·dP).', why: 'Correta: com v ≈ 0,001 m³/kg, elevar 10 MPa custa só uns 10 kJ/kg.' },
        { text: 'a bomba é isotérmica e a turbina é adiabática.', why: 'No ideal, as duas são isentrópicas.' },
        { text: 'a vazão mássica na bomba é menor que na turbina.', why: 'A vazão mássica é a mesma no ciclo simples.' },
        { text: 'a bomba tem rendimento maior que a turbina.', why: 'O motivo é termodinâmico (volume específico), não de rendimento.' },
        { text: 'o condensador fornece energia à bomba.', why: 'O condensador rejeita calor; não fornece trabalho.' },
      ],
      answer: 0,
      roteiro: 'bomba-rankine',
      steps: [
        'Trabalho em regime permanente: w = ∫v·dP, tanto na bomba quanto na turbina.',
        'Na bomba passa líquido (v ≈ 0,001 m³/kg); na turbina, vapor (v centenas de vezes maior).',
        'Mesmas pressões, volumes muito diferentes: **a bomba comprime líquido, de volume específico muito menor**.',
      ],
      explanation: 'Trabalho de compressão em regime permanente: **w = ∫v·dP**. O líquido tem v ≈ 0,001 m³/kg, o vapor tem v centenas de vezes maior. Por isso bombear água é barato e o Rankine tem razão de trabalho reverso de 1–2%, enquanto no Brayton o compressor (gás) consome boa parte do trabalho da turbina.',
    },
    {
      id: 'mec-rk-17',
      difficulty: 3,
      lessonRef: 5,
      source: 'Autoral',
      shuffle: false,
      prompt: 'Analise as afirmativas sobre as diferenças entre o ciclo de Rankine real e o ideal.\n\nI – A turbina real produz menos trabalho que a ideal, e a entropia do vapor aumenta durante a expansão.\nII – A bomba real consome menos trabalho que a ideal.\nIII – As perdas de carga entre a caldeira e a turbina reduzem a pressão do vapor na entrada da turbina.\n\nEstá correto o que se afirma em',
      options: [
        { text: 'I, apenas', why: 'III também está correta.' },
        { text: 'II, apenas', why: 'II é falsa: a bomba real consome **mais**.' },
        { text: 'I e III, apenas', why: 'Correta.' },
        { text: 'II e III, apenas', why: 'II é falsa.' },
        { text: 'I, II e III', why: 'II é falsa: irreversibilidades sempre pioram — a máquina real produz menos ou consome mais.' },
      ],
      answer: 2,
      roteiro: 'fmt.afirmativas',
      steps: [
        'I – **Correta**: o atrito nas pás e nos bocais gera entropia; a turbina real produz menos.',
        'II – **Errada**: a bomba real consome **mais** que a ideal.',
        'III – **Correta**: atrito e perdas de calor nas tubulações fazem o vapor chegar à turbina com pressão menor.',
        'Certas: I e III → "I e III, apenas".',
      ],
      explanation: '**I** – Correta: atrito nas pás e nos bocais gera entropia; a turbina produz menos. **II** – Errada: a bomba real consome **mais** que a ideal. **III** – Correta: atrito nas tubulações (e perdas de calor) fazem o vapor chegar à turbina com pressão e temperatura menores.',
    },
    {
      id: 'mec-rk-18',
      difficulty: 1,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Uma refinaria queima gás numa caldeira, gera vapor de alta pressão, move um turbogerador e usa o vapor de exaustão da turbina para aquecer correntes de processo. Esse arranjo é um exemplo de',
      options: [
        { text: 'cogeração.', why: 'Correta: energia elétrica e calor útil a partir do mesmo combustível.' },
        { text: 'regeneração.', why: 'Regeneração é preaquecer a água de alimentação com vapor extraído da própria turbina.' },
        { text: 'reaquecimento.', why: 'Reaquecimento é devolver o vapor parcialmente expandido à caldeira.' },
        { text: 'ciclo de refrigeração por absorção.', why: 'Não há produção de frio no enunciado.' },
        { text: 'ciclo Brayton aberto.', why: 'Brayton é o ciclo da turbina a gás.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: gera **eletricidade** e usa o vapor de exaustão como **calor de processo**.',
        'Produzir trabalho e calor útil com o mesmo combustível é cogeração; regeneração e reaquecimento são melhorias internas do ciclo.',
        'Fica **cogeração**.',
      ],
      explanation: '**Cogeração:** produzir trabalho (eletricidade) e **calor útil** com um único combustível, aproveitando o calor que um ciclo convencional jogaria fora no condensador. O aproveitamento global do combustível passa de ~35% para 70–85%.',
    },
    {
      id: 'mec-rk-19',
      type: 'gen',
      difficulty: 1,
      lessonRef: 6,
      title: 'Trabalho da bomba (v·ΔP)',
      roteiro: 'bomba-rankine',
      generate(rng) {
        const P2 = pickOne(rng, [4, 6, 8, 10, 15]);
        const P1 = 10; // kPa
        const v = 0.001;
        const wb = v * (P2 * 1000 - P1);
        const { options, answer } = numericOptions({
          correct: wb,
          unit: 'kJ/kg',
          digits: 2,
          correctWhy: `w_{b} = v·(P₂ − P₁) = 0,001 × (${fmt(P2 * 1000)} − ${P1}) = ${fmt(wb, 2)} kJ/kg.`,
          distractors: [
            { value: v * P2, why: 'Deixou P₂ em MPa: converta para kPa (× 1.000) para obter kJ/kg.' },
            { value: v * P2 * 1e6, why: 'Usou Pa: o resultado sairia em J/kg, não kJ/kg.' },
            { value: P2 * 1000 - P1, why: 'Esqueceu o volume específico do líquido.' },
            { value: v * (P2 * 1000 + P1), why: 'Somou as pressões; o trabalho depende da **diferença**.' },
          ],
        });
        return {
          prompt: `A bomba de um ciclo de Rankine eleva a pressão da água de **${P1} kPa** (condensador) para **${fmt(P2)} MPa** (caldeira). Considerando a água incompressível com v = 0,001 m³/kg e a bomba ideal, o trabalho específico de bombeamento é, em kJ/kg,`,
          options,
          answer,
          hint: 'w_{b} = v·ΔP, com P em kPa para sair em kJ/kg.',
          steps: [
            `w_{b} = v·(P₂ − P₁).`,
            `0,001 × (${fmt(P2 * 1000)} − ${P1}) kPa.`,
            `w_{b} = **${fmt(wb, 2)} kJ/kg** — quase nada perto dos ~1.000 kJ/kg da turbina.`,
          ],
          explanation: `Líquido incompressível: w_{b} = ∫v·dP = v·(P₂ − P₁) = 0,001 m³/kg × (${fmt(P2 * 1000)} − ${P1}) kPa = **${fmt(wb, 2)} kJ/kg**. Comparado aos ~1.000 kJ/kg da turbina, é quase nada.`,
        };
      },
    },
    {
      id: 'mec-rk-20',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Num diagrama T–s de um ciclo a vapor, depois do superaquecimento o vapor expande até uma pressão intermediária, volta a ser aquecido a pressão constante até a temperatura máxima e só então expande até a pressão do condensador. Esse diagrama é típico do ciclo',
      options: [
        { text: 'de Rankine com reaquecimento.', why: 'Correta: duas expansões separadas por um aquecimento isobárico — a "escada" típica do reaquecimento.' },
        { text: 'de Rankine com regeneração.', why: 'Na regeneração, o que se vê é a água de alimentação preaquecida por vapor extraído, não uma segunda passagem do vapor pela caldeira.' },
        { text: 'de Rankine simples.', why: 'O simples tem uma única expansão.' },
        { text: 'Brayton com regenerador.', why: 'No Brayton o fluido é gás e não há cúpula de saturação no diagrama.' },
        { text: 'de Carnot a vapor.', why: 'O Carnot tem duas isotermas e duas isentrópicas, sem reaquecimento.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: o vapor expande, **volta a ser aquecido** a pressão constante e expande de novo.',
        'Turbina de alta → reaquecedor → turbina de baixa: no T–s, duas expansões ligadas por um aquecimento.',
        'Fica **Rankine com reaquecimento**.',
      ],
      explanation: '**Reaquecimento:** turbina de alta → volta à caldeira (reaquecedor) → turbina de baixa. No T–s aparecem **duas** linhas verticais de expansão ligadas por um trecho de aquecimento a pressão constante. O ganho principal é de **título** na saída (menos umidade nas últimas pás).',
    },
    {
      id: 'mec-rk-21',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Na turbina de um ciclo de Rankine **ideal**, permanece constante a',
      options: [
        { text: 'entropia específica do vapor.', why: 'Correta: expansão adiabática e reversível = isentrópica.' },
        { text: 'entalpia específica.', why: 'A entalpia cai: é ela que vira trabalho (w = h₃ − h₄).' },
        { text: 'pressão.', why: 'A pressão cai da caldeira até o condensador.' },
        { text: 'temperatura.', why: 'O vapor esfria ao expandir.' },
        { text: 'título.', why: 'O título só existe dentro da cúpula; e, se existir, muda na expansão.' },
      ],
      answer: 0,
      roteiro: 'turbina-tabelas',
      steps: [
        'Turbina ideal = adiabática e reversível → s₄ = s₃.',
        'Com s₄ = s₃, o título na saída sai das tabelas: x = (s − s_{l})/s_{lv}.',
        'A entalpia cai (é o trabalho); o que fica constante é a **entropia específica**.',
      ],
      explanation: 'No ciclo ideal, bomba e turbina são **isentrópicas** (adiabáticas e reversíveis): s₄ = s₃. É isso que permite achar o estado de saída nas tabelas (título a partir da entropia).',
    },
    {
      id: 'mec-rk-22',
      type: 'gen',
      difficulty: 3,
      lessonRef: 2,
      title: 'Trabalho da turbina pelas tabelas',
      roteiro: 'turbina-tabelas',
      generate(rng) {
        const st = pickOne(rng, [
          { s3: 6.6, h3: 3100 },
          { s3: 6.8, h3: 3250 },
          { s3: 7.0, h3: 3350 },
          { s3: 7.2, h3: 3480 },
        ]);
        const x = (st.s3 - 0.649) / 7.5;
        const h4 = 192 + x * 2392;
        const wt = st.h3 - h4;
        const { options, answer } = numericOptions({
          correct: wt,
          unit: 'kJ/kg',
          digits: 0,
          correctWhy: `x₄ = (${fmt(st.s3, 1)} − 0,649)/7,5 = ${fmt(x, 3)}; h₄ = 192 + ${fmt(x, 3)} × 2.392 = ${fmt(h4, 0)}; w_{t} = ${fmt(st.h3)} − ${fmt(h4, 0)} = ${fmt(wt, 0)} kJ/kg.`,
          distractors: [
            { value: st.h3 - (192 + (st.s3 / 8.149) * 2392), why: 'Calculou o título como s₃/s_{v}; o certo é (s₃ − s_{l})/s_{lv}.' },
            { value: st.h3 - 2584, why: 'Supôs vapor saturado seco na saída (h_{v} = 2.584); a saída é mistura úmida.' },
            { value: st.h3 - x * 2392, why: 'Esqueceu de somar h_{l} ao calcular h₄.' },
            { value: st.h3 - 192, why: 'Usou a entalpia do líquido saturado como saída da turbina.' },
          ],
        });
        return {
          prompt: `Vapor entra numa turbina ideal com **h₃ = ${fmt(st.h3)} kJ/kg** e **s₃ = ${fmt(st.s3, 1)} kJ/kg·K** e sai a **10 kPa**, onde h_{l} = 192, h_{lv} = 2.392 kJ/kg, s_{l} = 0,649 e s_{lv} = 7,500 kJ/kg·K. O trabalho específico da turbina é, aproximadamente, em kJ/kg,`,
          options,
          answer,
          hint: 'Isentrópica: s₄ = s₃ → título → h₄ → w = h₃ − h₄.',
          steps: [
            `s₄ = s₃ = ${fmt(st.s3, 1)} kJ/kg·K.`,
            `x₄ = (${fmt(st.s3, 1)} − 0,649)/7,500 = ${fmt(x, 3)} → h₄ = 192 + ${fmt(x, 3)} × 2.392 = ${fmt(h4, 0)} kJ/kg.`,
            `w_{t} = ${fmt(st.h3)} − ${fmt(h4, 0)} = **${fmt(wt, 0)} kJ/kg**.`,
          ],
          explanation: `1) s₄ = s₃ = ${fmt(st.s3, 1)} → x₄ = (${fmt(st.s3, 1)} − 0,649)/7,500 = ${fmt(x, 3)}.\n2) h₄ = 192 + ${fmt(x, 3)} × 2.392 = ${fmt(h4, 0)} kJ/kg.\n3) w_{t} = h₃ − h₄ = ${fmt(st.h3)} − ${fmt(h4, 0)} = **${fmt(wt, 0)} kJ/kg**.`,
        };
      },
    },
    {
      id: 'mec-rk-23',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Numa usina de **ciclo combinado**, o que liga a turbina a gás ao ciclo a vapor é',
      options: [
        { text: 'a caldeira de recuperação, que usa os gases quentes da exaustão da turbina a gás para gerar vapor.', why: 'Correta: os gases saem da turbina a gás a 450–600 °C e alimentam o ciclo Rankine.' },
        { text: 'o condensador do ciclo a vapor, que aquece o ar do compressor.', why: 'O condensador rejeita calor a baixa temperatura: não aquece o ar do Brayton.' },
        { text: 'a bomba de alimentação, que comprime o ar da turbina a gás.', why: 'A bomba bombeia água; o ar é comprimido pelo compressor do Brayton.' },
        { text: 'o regenerador do ciclo Brayton.', why: 'O regenerador troca calor dentro do próprio Brayton.' },
        { text: 'a torre de resfriamento.', why: 'A torre só resfria a água do condensador.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: o que **liga** a turbina a gás ao ciclo a vapor no ciclo combinado.',
        'A turbina a gás solta gases muito quentes; uma caldeira de recuperação (HRSG) usa esse calor para gerar vapor.',
        'Fica **caldeira de recuperação**.',
      ],
      explanation: '**Ciclo combinado = Brayton + Rankine.** A turbina a gás rejeita gases muito quentes; uma **caldeira de recuperação** (HRSG) aproveita esse calor para gerar vapor e mover uma turbina a vapor. O rendimento global passa de 55–60%, bem acima de cada ciclo sozinho.',
    },
    {
      id: 'mec-rk-24',
      type: 'gen',
      difficulty: 2,
      lessonRef: 6,
      title: 'Fator de utilização na cogeração',
      roteiro: 'balanco-ciclo',
      generate(rng) {
        const Qin = pickOne(rng, [50, 80, 100, 120]);
        const fW = pickOne(rng, [0.2, 0.25, 0.3]);
        const fQ = pickOne(rng, [0.4, 0.45, 0.5]);
        const W = Qin * fW;
        const Qp = Qin * fQ;
        const u = ((W + Qp) / Qin) * 100;
        const { options, answer } = numericOptions({
          correct: u,
          unit: '%',
          digits: 1,
          correctWhy: `Fator de utilização = (W + Q_{proc})/Q_{in} = (${fmt(W, 1)} + ${fmt(Qp, 1)})/${Qin} = ${fmt(u, 1)}%.`,
          distractors: [
            { value: (W / Qin) * 100, why: 'Esse é só o rendimento elétrico; o calor de processo também é útil.' },
            { value: (Qp / Qin) * 100, why: 'Contou só o calor de processo.' },
            { value: (W / (Qin - Qp)) * 100, why: 'Descontou o calor de processo do combustível — sem base física.' },
            { value: ((W + Qp) / (Qin + Qp)) * 100, why: 'Somou o calor de processo ao denominador.' },
          ],
        });
        return {
          prompt: `Uma planta de cogeração consome **${Qin} MW** de combustível, gera **${fmt(W, 1)} MW** de eletricidade e entrega **${fmt(Qp, 1)} MW** de calor útil ao processo. O fator de utilização da energia do combustível é`,
          options,
          answer,
          hint: 'Útil = eletricidade + calor de processo.',
          steps: [
            { do: 'Separe o que é útil: eletricidade e calor entregue ao processo.', show: `Útil: ${fmt(W, 1)} MW elétricos + ${fmt(Qp, 1)} MW de calor.` },
            { do: 'Fator de utilização = energia útil ÷ energia do combustível.', show: `(${fmt(W, 1)} + ${fmt(Qp, 1)})/${Qin}.` },
            { do: 'Calcule e compare com a usina só elétrica.', show: `= **${fmt(u, 1)}%** (só eletricidade: ${fmt(fW * 100)}%).` },
          ],
          explanation: `Fator de utilização = (energia útil)/(energia do combustível) = (${fmt(W, 1)} + ${fmt(Qp, 1)})/${Qin} = **${fmt(u, 1)}%**. Uma usina só elétrica aproveitaria ${fmt(fW * 100)}%.`,
        };
      },
    },
    {
      id: 'mec-rk-25',
      difficulty: 2,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Numa turbina a vapor **de ação**, o vapor',
      options: [
        { text: 'expande-se nos bocais, onde a pressão cai e a velocidade aumenta; nas pás móveis a pressão permanece constante.', why: 'Correta: as pás móveis só desviam o jato e convertem a energia cinética em trabalho.' },
        { text: 'expande-se nas pás móveis, onde a pressão cai e a velocidade aumenta.', why: 'Isso acontece (em parte) nas turbinas de **reação**.' },
        { text: 'é comprimido nos bocais, onde a pressão aumenta e a velocidade diminui.', why: 'Os bocais **expandem** o vapor.' },
        { text: 'mantém a pressão constante nos bocais e só se expande no condensador.', why: 'A expansão útil ocorre nos bocais da própria turbina.' },
        { text: 'tem a mesma queda de pressão nas pás fixas e nas móveis.', why: 'Isso descreve uma turbina de reação com grau de reação de 50% (Parsons).' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: turbina de **ação**.',
        'Na ação, toda a queda de pressão acontece nos bocais (fixos), que aceleram o vapor; as pás móveis só desviam o jato.',
        'Fica **expande nos bocais; nas pás móveis a pressão é constante**.',
      ],
      explanation: '**Ação:** bocal (fixo) transforma entalpia em velocidade, com queda de pressão; pá móvel transforma velocidade em trabalho, a **pressão constante**. **Reação:** parte da expansão também acontece nas pás móveis.',
    },
    {
      id: 'mec-rk-26',
      difficulty: 2,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Numa turbina de **reação** do tipo Parsons (grau de reação de 50%),',
      options: [
        { text: 'a queda de entalpia (e de pressão) do estágio se divide igualmente entre as pás fixas e as pás móveis.', why: 'Correta: grau de reação = Δh nas móveis ÷ Δh no estágio = 0,5.' },
        { text: 'toda a queda de pressão ocorre nas pás fixas.', why: 'Isso é a turbina de **ação** (grau de reação zero).' },
        { text: 'toda a queda de pressão ocorre nas pás móveis.', why: 'Seria grau de reação 100%.' },
        { text: 'o vapor não muda de pressão em nenhum estágio.', why: 'Toda turbina reduz a pressão do vapor para produzir trabalho.' },
        { text: 'o vapor é recomprimido nas pás móveis.', why: 'As pás de turbina expandem o vapor, não o comprimem.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **reação Parsons**, grau de reação de 50 %.',
        'Grau de reação = parcela da queda de entalpia que acontece nas pás móveis; 50 % = metade nas fixas, metade nas móveis.',
        'Fica **a queda se divide igualmente entre pás fixas e móveis**.',
      ],
      explanation: '**Grau de reação** R = Δh_{pás móveis}/Δh_{estágio}. Ação: R = 0. Parsons: R = 0,5 — pás fixas e móveis com perfis iguais (espelhados), cada uma com metade da expansão. A aceleração do vapor nas pás móveis gera a força de **reação**.',
    },
    {
      id: 'mec-rk-27',
      difficulty: 3,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Turbinas de vários estágios no mesmo eixo podem ser escalonadas. No escalonamento **de velocidade (Curtis)**,',
      options: [
        { text: 'há uma única expansão nos bocais, e a alta velocidade do vapor é aproveitada em várias fileiras de pás móveis, com pás-guia fixas entre elas.', why: 'Correta: a velocidade é "repartida" entre as fileiras.' },
        { text: 'há vários conjuntos de bocal e roda em série, cada um com uma parte da queda de pressão.', why: 'Isso é o escalonamento **de pressão** (Rateau).' },
        { text: 'a expansão é dividida igualmente entre pás fixas e móveis em cada estágio.', why: 'Isso é o estágio de reação Parsons.' },
        { text: 'o vapor é reaquecido entre os estágios.', why: 'Reaquecimento é do ciclo (caldeira), não do escalonamento.' },
        { text: 'o vapor escoa radialmente, do centro para a periferia.', why: 'Isso define turbinas radiais, não o escalonamento.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: escalonamento **de velocidade (Curtis)**.',
        'Curtis: uma única expansão nos bocais e a alta velocidade aproveitada em várias fileiras móveis, com guias fixas entre elas. Rateau é o de pressão (vários pares bocal + roda).',
        'Fica **uma expansão nos bocais e várias fileiras móveis com guias fixas**.',
      ],
      explanation: '**Curtis (velocidade):** um salto de pressão nos bocais e duas ou três fileiras móveis, com guias fixas que redirecionam o jato — compacto, muito usado como 1º estágio. **Rateau (pressão):** a queda de pressão é dividida em vários pares bocal + roda, com velocidades menores e melhor rendimento.',
    },
  ],
  games: [
    {
      id: 'mec-rk-g1',
      type: 'order',
      title: 'Siga a água no ciclo de Rankine',
      intro: 'Comece pela saída do condensador e percorra o ciclo inteiro.',
      lessonRef: 0,
      steps: [
        { text: 'Líquido saturado sai do condensador', why: 'Ponto 1: líquido a baixa pressão.' },
        { text: 'A bomba eleva a pressão do líquido', why: 'Pouco trabalho: o volume específico do líquido é pequeno.' },
        { text: 'A caldeira aquece e vaporiza a água a pressão constante', why: 'Calor entra no ciclo.' },
        { text: 'O superaquecedor eleva a temperatura do vapor', why: 'Mais rendimento e menos umidade na turbina.' },
        { text: 'A turbina expande o vapor e gera trabalho no eixo', why: 'É aqui que o ciclo entrega potência.' },
        { text: 'O condensador rejeita calor e o vapor volta a ser líquido', why: 'Fecha o ciclo: o líquido volta para a bomba.' },
      ],
    },
    {
      id: 'mec-rk-g2',
      type: 'sort',
      title: 'Aumenta ou reduz a eficiência da planta a vapor?',
      intro: 'Cada mudança mexe na eficiência do ciclo (ou da planta). Para que lado?',
      lessonRef: 4,
      bins: ['Aumenta a eficiência', 'Reduz a eficiência'],
      items: [
        { text: 'Superaquecer mais o vapor', bin: 0, why: 'Calor entra a temperatura média maior.' },
        { text: 'Reduzir a pressão do condensador', bin: 0, why: 'Calor sai a temperatura menor.' },
        { text: 'Aumentar a pressão do condensador', bin: 1, why: 'Calor sai a temperatura maior.' },
        { text: 'Regeneração com vapor extraído da turbina', bin: 0, why: 'Água chega mais quente à caldeira.' },
        { text: 'Aumentar a pressão da caldeira (com superaquecimento)', bin: 0, why: 'Temperatura média de entrada do calor maior.' },
        { text: 'Turbina com menor eficiência isentrópica', bin: 1, why: 'Mais irreversibilidade, menos trabalho.' },
        { text: 'Água de resfriamento mais quente no condensador', bin: 1, why: 'Sobe a pressão e a temperatura de condensação.' },
        { text: 'Grandes perdas de carga nas linhas de vapor', bin: 1, why: 'Energia dissipada antes da turbina.' },
        { text: 'Pré-aquecer o ar de combustão com os gases da chaminé', bin: 0, why: 'Recupera calor que iria embora pela chaminé.' },
        { text: 'Reaquecer o vapor entre as turbinas de alta e de baixa', bin: 0, why: 'Ganho modesto de rendimento (e grande de título).' },
      ],
    },
    {
      id: 'mec-rk-lab1',
      type: 'lab',
      lab: 'vapor',
      title: 'A usina a vapor na bancada',
      intro: 'Caldeira, turbina, condensador e bomba funcionando, com o estado da água andando no T–s dentro da cúpula. Aposte antes de ver e cumpra as missões.',
      lessonRef: 4,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { cyc: 0, mod: 0, pb: 4, t3: 400, pc: 50, etat: 100 },
          prompt: 'Mais vácuo no condensador: a pressão cai de 50 para 10 kPa. O rendimento e o título na saída da turbina…',
          change: { pc: 10 },
          options: ['η sobe e o título cai', 'η sobe e o título também sobe', 'η cai e o título sobe', 'nada muda: o condensador só fecha o ciclo'],
          answer: 0,
          expect: [
            { out: 'eta', trend: 'up' },
            { out: 'xt', trend: 'down' },
            { out: 'Tcond', trend: 'down' },
          ],
          why: 'O calor passa a sair a uma temperatura menor (a saturação a 10 kPa é ~46 °C), e o rendimento sobe. Mas a expansão vai mais fundo na cúpula: o vapor sai mais úmido, e as gotas erodem as últimas palhetas.',
        },
        {
          kind: 'predict',
          setup: { cyc: 0, mod: 0, pb: 2, t3: 350, pc: 10, etat: 100 },
          prompt: 'Superaquecendo mais o vapor (de 350 para 550 °C), com as mesmas pressões, o rendimento e o título na saída…',
          change: { t3: 550 },
          options: ['os dois sobem', 'η sobe, mas o vapor sai mais úmido', 'η cai: o vapor quente leva mais calor ao condensador', 'só o trabalho da bomba muda'],
          answer: 0,
          expect: [
            { out: 'eta', trend: 'up' },
            { out: 'xt', trend: 'up' },
            { out: 'wt', trend: 'up' },
          ],
          why: 'O calor extra entra na temperatura mais alta do ciclo, e a temperatura média de fornecimento sobe. No T–s, o ponto 3 vai para a direita, e a expansão vertical termina mais perto da linha de vapor saturado: o título sobe.',
        },
        {
          kind: 'predict',
          setup: { cyc: 0, mod: 0, pb: 2, t3: 450, pc: 10, etat: 100 },
          prompt: 'Mesma temperatura na turbina, mas a caldeira sobe de 2 para 10 MPa. O rendimento e o título na saída…',
          change: { pb: 10 },
          options: ['η sobe, mas o título cai', 'os dois sobem', 'η cai e o título sobe', 'η não muda: só T₃ importa'],
          answer: 0,
          expect: [
            { out: 'eta', trend: 'up' },
            { out: 'xt', trend: 'down' },
            { out: 'wp', trend: 'up' },
          ],
          why: 'A água ferve mais quente (311 °C a 10 MPa contra 212 °C a 2 MPa) e a temperatura média do calor sobe. Mas, com T₃ fixa, o ponto 3 vai para a esquerda no T–s e a expansão termina mais úmida. Por isso caldeira de alta pressão vem junto com superaquecimento ou reaquecimento.',
        },
        {
          kind: 'goal',
          setup: { cyc: 0, mod: 0, pb: 2, t3: 450, pc: 10, etat: 100 },
          lock: ['cyc', 'mod', 'pc', 'etat'],
          prompt: 'Leve o rendimento desta usina simples a **pelo menos 40 %**, sem mexer no condensador.',
          goals: [{ out: 'eta', min: 40 }],
          hint: 'O calor precisa entrar mais quente: pressão da caldeira e temperatura do vapor.',
          solution: { pb: 12, t3: 600 },
          why: 'Pressão alta (a água ferve mais quente) e superaquecimento alto elevam a temperatura média de fornecimento de calor. Repare no título: com a caldeira em alta pressão, o vapor sai bem úmido da turbina.',
        },
        {
          kind: 'goal',
          setup: { cyc: 0, mod: 0, pb: 8, t3: 450, pc: 10, etat: 100 },
          lock: ['cyc', 'pb', 'pc', 'etat'],
          prompt: 'Caldeira de 8 MPa: o vapor sai da turbina com título perto de 0,79, com gotas demais para as últimas palhetas. Sem mexer nas pressões, faça o título passar de **0,88**.',
          goals: [{ out: 'xt', min: 0.88 }],
          hint: 'A 8 MPa, superaquecer mais não basta. Que tal devolver o vapor à caldeira no meio da expansão?',
          solution: { mod: 1 },
          why: 'No **reaquecimento**, o vapor expande até 1/4 da pressão, volta à caldeira e é reaquecido até T₃ antes da turbina de baixa. A expansão final começa bem à direita no T–s e termina mais seca. O rendimento sobe pouco; o grande ganho é no título e no trabalho por kg.',
        },
        {
          kind: 'goal',
          setup: { cyc: 0, mod: 0, pb: 8, t3: 450, pc: 10, etat: 100 },
          lock: ['cyc', 'pb', 't3', 'pc', 'etat'],
          prompt: 'Sem mexer em pressões nem temperaturas, leve o rendimento desta usina a **pelo menos 40 %**.',
          goals: [{ out: 'eta', min: 40 }],
          hint: 'Sobrou o arranjo. Qual melhoria aquece a água de alimentação antes da caldeira?',
          solution: { mod: 2 },
          why: 'Na **regeneração**, vapor extraído da turbina aquece a água de alimentação num aquecedor aberto. A água chega quente à caldeira, e o calor externo passa a entrar a temperaturas mais altas. O reaquecimento, aqui, quase não sai do lugar: o ganho dele é no título.',
        },
        {
          kind: 'predict',
          setup: { cyc: 0, mod: 0, pb: 4, t3: 400, pc: 10, etat: 100 },
          prompt: 'Trocando a turbina ideal por uma real (eficiência isentrópica de 85 %), o vapor sai da turbina…',
          change: { etat: 85 },
          options: ['mais seco, e o trabalho da turbina cai', 'mais úmido, e o trabalho da turbina cai', 'igual: só o trabalho muda', 'mais seco, e o trabalho da turbina sobe'],
          answer: 0,
          expect: [
            { out: 'wt', trend: 'down' },
            { out: 'xt', trend: 'up' },
            { out: 'eta', trend: 'down' },
          ],
          why: 'O atrito e as perdas na turbina viram calor no próprio vapor: a entropia cresce, a expansão termina à direita da vertical no T–s (com mais entalpia e mais título) e sobra menos trabalho no eixo. η_{t} = (h₃ − h₄)/(h₃ − h_{4s}).',
        },
      ],
    },
  ],
});
