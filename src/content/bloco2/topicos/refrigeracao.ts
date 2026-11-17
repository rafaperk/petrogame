import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

const REFRIG = { cyc: 1, te: -10, tc: 40, cap: 5 };

export default defineTopic({
  id: 'mec.refrigeracao',
  name: 'Refrigeração: compressão de vapor e absorção',
  summary: 'Refrigerador e bomba de calor, o ciclo de compressão de vapor no diagrama P–h, COP pelas entalpias, o limite de Carnot, o efeito das temperaturas e a refrigeração por absorção de amônia.',
  order: 4,
  weight: 3,
  equipment: 'chiller',
  requires: ['mec.rankine'],
  edital: ['b2.refrigeracao', 'b1.ciclos-teoricos', 'b1.termo-2lei'],
  lesson: [
    {
      title: 'Refrigerador, bomba de calor e COP',
      body: 'Calor não passa sozinho do frio para o quente (enunciado de **Clausius** da 2ª lei): é preciso gastar trabalho.\n\n- **Refrigerador:** retira **Q_{L}** do espaço frio, recebe **W** e rejeita **Q_{H} = Q_{L} + W** no ambiente quente.\n- **Bomba de calor:** a mesma máquina, mas o efeito útil é o calor entregue, Q_{H}.\n\nO desempenho é medido pelo **coeficiente de eficácia** (COP, também chamado coeficiente de desempenho):\n\n**COP_{R} = Q_{L}/W**   **COP_{BC} = Q_{H}/W = COP_{R} + 1**\n\nCOP **maior que 1** é normal: a máquina não cria calor, ela o **bombeia** do frio para o quente.\n\nCapacidade em **TR** (tonelada de refrigeração): 1 TR = 12.000 BTU/h ≈ **3,517 kW**.',
      example: 'Uma câmara recebe 7 kW do ambiente e o compressor consome 2 kW: COP_{R} = 7/2 = **3,5**. O condensador rejeita 7 + 2 = 9 kW; como bomba de calor, o COP seria 9/2 = **4,5**.',
      hot: 'Potência mínima de uma **bomba de calor** que mantém um ambiente quente (Petrobras 2011) e o julgamento de uma "invenção" com COP acima do de Carnot (Petrobras 2011).',
      tip: '**Refrigerador** olha para o frio (COP = Q_{L}/W); **bomba de calor** olha para o quente (COP = Q_{H}/W). E Q_{H} = Q_{L} + W, sempre.',
      trap: 'COP não é rendimento: não precisa ficar abaixo de 1. E o COP da bomba de calor é o do refrigerador **mais 1** (entre os mesmos estados).',
      lab: { lab: 'vapor', preset: REFRIG, label: 'Ver o refrigerador' },
    },
    {
      title: 'O ciclo ideal de compressão de vapor',
      body: 'Quatro processos, com o refrigerante mudando de fase dentro da cúpula de saturação:\n\n- **1→2 Compressor:** o vapor saturado é comprimido de forma **isentrópica** e sai **superaquecido**, quente e a alta pressão.\n- **2→3 Condensador:** a pressão constante, o vapor esfria, **condensa** e sai **líquido saturado**, rejeitando q_{H}.\n- **3→4 Válvula de expansão:** **estrangulamento** com h₄ = h₃ (**isentálpico**). A pressão cai, parte do líquido vira vapor (*flash*) e a temperatura despenca.\n- **4→1 Evaporador:** a mistura fria **ferve** a pressão e temperatura constantes, retirando q_{L} do espaço refrigerado.\n\nNo diagrama **P–h**, condensador e evaporador são linhas horizontais e a válvula é uma linha **vertical** (h constante).',
      hot: 'O processo em que o calor é rejeitado a pressão constante — o **condensador** — no T–s do ciclo de compressão comparado ao de Carnot (Transpetro 2011).',
      tip: 'No P–h, as trocas viram **distâncias horizontais**: q_{L} = h₁ − h₄, w = h₂ − h₁ e q_{H} = h₂ − h₃.',
      trap: 'A válvula é **isentálpica**, não isentrópica: o estrangulamento é irreversível e a entropia **aumenta**. Isentrópico, no ciclo ideal, é o **compressor**.',
      lab: { lab: 'vapor', preset: REFRIG, label: 'Ver o P–h e o T–s' },
    },
    {
      title: 'COP pelas entalpias',
      body: 'Por kg de refrigerante (h em kJ/kg):\n\n- Efeito refrigerante: **q_{L} = h₁ − h₄**\n- Compressor: **w = h₂ − h₁**\n- Condensador: **q_{H} = h₂ − h₃ = q_{L} + w**\n- Válvula: **h₄ = h₃**\n\n**COP_{R} = (h₁ − h₄)/(h₂ − h₁)**\n\nCom a carga térmica Q̇_{L} (kW): vazão **ṁ = Q̇_{L}/q_{L}** e potência do compressor **Ẇ = ṁ·w = Q̇_{L}/COP**.\n\nO **título após a válvula** sai da regra da mistura no evaporador: **x₄ = (h₄ − h_{l})/h_{lv}**.',
      example: 'h₁ = 244, h₂ = 278 e h₃ = h₄ = 108 kJ/kg: q_{L} = 136 e w = 34 → **COP = 4,0**; q_{H} = 170 kJ/kg.\nPara 5 TR (17,6 kW): ṁ = 17,6/136 = 0,129 kg/s e Ẇ = 0,129 × 34 ≈ **4,4 kW**.',
      hot: 'COP em função das entalpias (Petrobras 2014), quais pontos do ciclo entram na conta (Transpetro 2018), COP com calor **perdido no compressor** — a perda não entra: COP = q_{L}/w (Petrobras 2018) — e balanços de energia do **condensador** e do **compressor** resfriado a água (BR 2012).',
      tip: 'COP = **o que eu quero** (frio retirado) ÷ **o que eu pago** (trabalho do compressor). Calor perdido no caminho não entra.',
      trap: 'No refrigerador, o numerador é **q_{L}** (o que se retira do frio). Usar q_{H} dá o COP da bomba de calor, uma unidade maior.',
      lab: { lab: 'vapor', preset: REFRIG, label: 'Conferir as contas na bancada' },
    },
    {
      title: 'Carnot reverso e as temperaturas de trabalho',
      body: 'Entre um espaço frio a T_{L} e um ambiente a T_{H} (em **kelvin**), nenhum refrigerador supera o de Carnot:\n\n**COP_{R,máx} = T_{L}/(T_{H} − T_{L})**   **COP_{BC,máx} = T_{H}/(T_{H} − T_{L})**\n\nO COP cai quando as temperaturas se afastam:\n\n- **Evaporar mais frio** (congelador em vez de geladeira): ↓ COP e ↑ trabalho por kg; o vapor na sucção fica menos denso e o compressor desloca menos massa.\n- **Condensar mais quente** (dia quente, condensador sujo, pouca água de resfriamento): ↓ COP, mais *flash* na válvula e descarga mais quente.\n\nO ciclo ideal fica abaixo do Carnot por causa do estrangulamento e do superaquecimento na descarga do compressor.',
      example: 'Câmara a −23 °C (250 K) e ambiente a 27 °C (300 K): COP_{máx} = 250/(300 − 250) = **5**. Como bomba de calor, entre as mesmas temperaturas: 300/50 = **6**.',
      hot: 'Refrigerador de Carnot: a temperatura da fonte fria a partir dos calores trocados, Q_{L}/Q_{H} = T_{L}/T_{H} (Petrobras 2012).',
      tip: 'COP de Carnot do refrigerador: **frio sobre a diferença**, T_{L}/(T_{H} − T_{L}). Da bomba de calor: **quente sobre a diferença**.',
      trap: 'Em °C a conta não faz sentido (−23/50 daria COP negativo). E não confunda com o rendimento do motor de Carnot, η = 1 − T_{L}/T_{H}.',
      lab: { lab: 'vapor', preset: { cyc: 1, te: -25, tc: 45, cap: 5 }, label: 'Ver o congelador' },
    },
    {
      title: 'Ciclo real, componentes e refrigerantes',
      body: 'No ciclo real:\n\n- **Superaquecimento na sucção:** o vapor sai do evaporador uns graus acima da saturação, garantindo que só vapor entre no compressor (líquido no cilindro causa **golpe de líquido**). A **válvula de expansão termostática** regula a vazão por esse superaquecimento.\n- **Sub-resfriamento** do líquido antes da válvula: h₃ menor → menos *flash* → **mais q_{L}** com o mesmo trabalho.\n- Compressão não isentrópica (descarga mais quente, w maior) e perdas de carga.\n\nComponentes: compressor (alternativo, parafuso, *scroll* ou centrífugo), condensador (a ar, a água ou evaporativo), dispositivo de expansão (válvula termostática, tubo capilar, válvula de boia) e evaporador; acessórios como tanque de líquido, filtro secador, visor de líquido e separador de líquido na sucção.\n\nRefrigerantes: a **amônia (R-717)** domina a refrigeração industrial: ótimo calor latente, barata e sem efeito na camada de ozônio nem no aquecimento global, mas **tóxica** e incompatível com **cobre** (as linhas são de aço). HFCs como o R-134a ficam em geladeiras e ar-condicionado; os CFCs foram banidos por destruírem a camada de ozônio.',
      trap: 'Sub-resfriar o líquido **aumenta** o efeito refrigerante; superaquecer na sucção **protege** o compressor. Não troque os dois.',
    },
    {
      title: 'Refrigeração por absorção de amônia',
      body: 'O compressor dá lugar a um **"compressor térmico"**, movido a calor:\n\n- **Absorvedor:** o vapor de amônia que sai do evaporador é **absorvido pela água**. A absorção libera calor, retirado por água de resfriamento.\n- **Bomba:** eleva a pressão da solução **líquida** (trabalho pequeno, pois o volume específico do líquido é pequeno).\n- **Gerador:** recebe **calor a alta temperatura** (vapor, gases quentes, calor residual), e a amônia evapora da solução.\n- **Retificador:** retira o vapor de água que sai junto com a amônia.\n- A solução pobre volta ao absorvedor por uma válvula, passando por um **trocador regenerativo** que pré-aquece a solução rica a caminho do gerador.\n\nCondensador, válvula de expansão e evaporador são iguais aos do ciclo de compressão. No par amônia–água, a **amônia é o refrigerante** e a água é o absorvente.\n\n**COP_{abs} = Q_{L}/(Q_{ger} + W_{bomba}) ≈ Q_{L}/Q_{ger}**, tipicamente **0,5 a 0,7**: bem abaixo do da compressão, mas com calor barato e quase nenhuma eletricidade. Vale a pena com calor residual ou **cogeração**.',
      example: 'Limite reversível: o gerador recebe calor a T_{s} = 400 K, o ambiente está a T_{0} = 300 K e a câmara a T_{L} = 250 K.\nCOP_{máx} = (1 − T_{0}/T_{s})·T_{L}/(T_{0} − T_{L}) = 0,25 × 5 = **1,25**: um motor de Carnot acionando um refrigerador de Carnot.',
      trap: 'No par **brometo de lítio–água** é o contrário: a **água** é o refrigerante (por isso só serve acima de 0 °C, em ar-condicionado e *chillers*). Abaixo de zero, amônia–água.',
    },
  ],
  roteiros: [
    {
      id: 'cop-ciclo',
      name: 'COP do ciclo de compressão de vapor',
      when: 'Ciclo de refrigeração com entalpias, calores ou capacidade; pedem o COP, o efeito refrigerante, o título, a potência ou o efeito de mudar uma temperatura.',
      steps: [
        'Válvula isentálpica: h₄ = h₃.',
        'Efeito refrigerante q_{L} = h₁ − h₄; trabalho w = h₂ − h₁ (condensador: q_{H} = h₂ − h₃).',
        'COP = q_{L}/w — o que se quer dividido pelo que se paga.',
      ],
      note: 'Sub-resfriar o líquido aumenta q_{L}. Condensar mais quente ou evaporar mais frio derruba o COP. 1 TR ≈ 3,5 kW.',
    },
    {
      id: 'carnot-refrigeracao',
      name: 'COP máximo (Carnot) e bomba de calor',
      when: 'Refrigerador ou bomba de calor entre duas temperaturas (ou com os calores trocados); pedem o COP máximo, uma temperatura ou a potência mínima.',
      steps: [
        'Passe as temperaturas para kelvin.',
        'Refrigerador: COP = T_{L}/(T_{H} − T_{L}). Bomba de calor: COP = T_{H}/(T_{H} − T_{L}) = COP_{R} + 1. No ciclo de Carnot, Q_{L}/Q_{H} = T_{L}/T_{H}.',
        'Calcule — a potência mínima é o calor desejado dividido pelo COP máximo.',
      ],
      note: 'COP maior que 1 não viola nada: o trabalho só transporta o calor.',
    },
    {
      id: 'balanco-componente',
      name: 'Balanço de energia num componente',
      when: 'Compressor, condensador ou evaporador em regime permanente, com vazão e entalpias; pedem o calor, a potência ou a vazão.',
      steps: [
        'Escreva Q̇ − Ẇ = ṁ·(h₂ − h₁) para o componente.',
        'Dê sinal: calor saindo → Q̇ < 0; potência consumida → Ẇ < 0; trocador sem eixo → Ẇ = 0.',
        'Isole a incógnita e responda em módulo, se pedirem.',
      ],
      note: 'No compressor resfriado, parte do trabalho vai para a água e o resto aumenta a entalpia do refrigerante.',
    },
  ],
  questions: [
    {
      id: 'mec-ref-01',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'COP pelas entalpias',
      roteiro: 'cop-ciclo',
      generate(rng) {
        const h1 = pickOne(rng, [240, 244, 248, 252]);
        const h4 = pickOne(rng, [92, 96, 100, 104, 108]);
        const w = pickOne(rng, [28, 30, 32, 35, 36, 40]);
        const h2 = h1 + w;
        const qL = h1 - h4;
        const cop = qL / w;
        const { options, answer } = numericOptions({
          correct: cop,
          digits: 2,
          correctWhy: `COP = (h₁ − h₄)/(h₂ − h₁) = ${qL}/${w} = ${fmt(cop, 2)}.`,
          distractors: [
            { value: (h2 - h4) / w, why: 'Usou q_{H} = h₂ − h₃ no numerador: esse é o COP da **bomba de calor**, uma unidade maior.' },
            { value: h1 / w, why: 'Usou h₁ no numerador; o efeito refrigerante é h₁ − h₄.' },
            { value: qL / (h2 - h4), why: 'Dividiu pelo calor rejeitado; o COP divide pelo **trabalho** do compressor.' },
            { value: qL / h2, why: 'Dividiu por h₂; o trabalho do compressor é h₂ − h₁.' },
          ],
        });
        return {
          prompt: `Num ciclo ideal de refrigeração por compressão de vapor, as entalpias do refrigerante são: saída do evaporador **h₁ = ${h1} kJ/kg**, descarga do compressor **h₂ = ${h2} kJ/kg** e saída do condensador **h₃ = ${h4} kJ/kg**. O coeficiente de eficácia (COP) do refrigerador é, aproximadamente,`,
          options,
          answer,
          hint: 'Na válvula, h₄ = h₃. COP = q_{L}/w.',
          steps: [
            `h₄ = h₃ = ${h4} kJ/kg.`,
            `q_{L} = ${h1} − ${h4} = ${qL} kJ/kg; w = ${h2} − ${h1} = ${w} kJ/kg.`,
            `COP = ${qL}/${w} = **${fmt(cop, 2)}**.`,
          ],
          explanation: `Válvula isentálpica: h₄ = h₃ = ${h4} kJ/kg.\n\nq_{L} = h₁ − h₄ = ${h1} − ${h4} = ${qL} kJ/kg; w = h₂ − h₁ = ${h2} − ${h1} = ${w} kJ/kg.\n\nCOP = ${qL}/${w} = **${fmt(cop, 2)}**.`,
        };
      },
    },
    {
      id: 'mec-ref-02',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Potência do compressor (TR e COP)',
      roteiro: 'cop-ciclo',
      generate(rng) {
        const tr = pickOne(rng, [10, 20, 30, 40, 50, 100]);
        const cop = pickOne(rng, [2.5, 3.5, 5, 7]);
        const QL = tr * 3.5;
        const W = QL / cop;
        const { options, answer } = numericOptions({
          correct: W,
          unit: 'kW',
          digits: 1,
          correctWhy: `Q̇_{L} = ${tr} × 3,5 = ${fmt(QL, 1)} kW; Ẇ = Q̇_{L}/COP = ${fmt(QL, 1)}/${fmt(cop, 1)} = ${fmt(W, 1)} kW.`,
          distractors: [
            { value: tr / cop, why: 'Esqueceu de converter TR para kW (1 TR ≈ 3,5 kW).' },
            { value: QL * cop, why: 'Multiplicou pelo COP; a potência é Q̇_{L} **dividido** pelo COP.' },
            { value: QL + W, why: 'Esse é o calor rejeitado no condensador, Q̇_{H} = Q̇_{L} + Ẇ.' },
            { value: QL / (cop + 1), why: 'Usou COP + 1, que é o da bomba de calor.' },
          ],
        });
        return {
          prompt: `Uma câmara frigorífica exige **${tr} TR** de capacidade de refrigeração, e o sistema opera com **COP = ${fmt(cop, 1)}**. Considerando 1 TR ≈ 3,5 kW, a potência consumida pelo compressor é, aproximadamente,`,
          options,
          answer,
          hint: 'Converta TR para kW e divida pelo COP.',
          steps: [
            { do: 'Converta a capacidade: 1 TR ≈ 3,5 kW.', show: `Q̇_{L} = ${tr} × 3,5 = ${fmt(QL, 1)} kW.` },
            { do: 'COP = Q̇_{L}/Ẇ → Ẇ = Q̇_{L}/COP.', show: `Ẇ = ${fmt(QL, 1)}/${fmt(cop, 1)}.` },
            { do: 'Calcule (o condensador rejeita Q̇_{L} + Ẇ).', show: `Ẇ = **${fmt(W, 1)} kW** (condensador: ${fmt(QL + W, 1)} kW).` },
          ],
          explanation: `Q̇_{L} = ${tr} TR × 3,5 kW/TR = ${fmt(QL, 1)} kW.\n\nẆ = Q̇_{L}/COP = ${fmt(QL, 1)}/${fmt(cop, 1)} = **${fmt(W, 1)} kW**. O condensador rejeita Q̇_{L} + Ẇ = ${fmt(QL + W, 1)} kW.`,
        };
      },
    },
    {
      id: 'mec-ref-03',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'COP de Carnot do refrigerador',
      roteiro: 'carnot-refrigeracao',
      generate(rng) {
        const TLc = pickOne(rng, [-33, -23, -13, -3, 7]);
        const THc = pickOne(rng, [27, 37, 47]);
        const TL = TLc + 273;
        const TH = THc + 273;
        const cop = TL / (TH - TL);
        const distractors = [
          { value: TH / (TH - TL), why: 'Esse é o COP máximo da **bomba de calor**, T_{H}/(T_{H} − T_{L}).' },
          { value: (TH - TL) / TL, why: 'Inverteu a razão: o COP é T_{L}/(T_{H} − T_{L}).' },
          { value: 1 - TL / TH, why: 'Esse é o rendimento do **motor** de Carnot, não o COP do refrigerador.' },
        ];
        if (TLc > 0) distractors.push({ value: TLc / (THc - TLc), why: 'Usou °C; a razão de temperaturas só vale em **kelvin**.' });
        const { options, answer } = numericOptions({
          correct: cop,
          digits: 2,
          correctWhy: `COP = T_{L}/(T_{H} − T_{L}) = ${TL}/${TH - TL} = ${fmt(cop, 2)} (em kelvin).`,
          distractors,
        });
        return {
          prompt: `Um refrigerador mantém um espaço a **${TLc} °C** e rejeita calor para o ambiente a **${THc} °C**. O maior coeficiente de eficácia (COP) teoricamente possível é`,
          options,
          answer,
          hint: 'Carnot reverso, com temperaturas absolutas.',
          steps: [
            `T_{L} = ${TLc} + 273 = ${TL} K; T_{H} = ${THc} + 273 = ${TH} K.`,
            `COP = ${TL}/(${TH} − ${TL}) = ${TL}/${TH - TL}.`,
            `COP_{máx} = **${fmt(cop, 2)}**.`,
          ],
          explanation: `T_{L} = ${TLc} + 273 = ${TL} K; T_{H} = ${THc} + 273 = ${TH} K.\n\nCOP_{máx} = T_{L}/(T_{H} − T_{L}) = ${TL}/${TH - TL} = **${fmt(cop, 2)}**.`,
        };
      },
    },
    {
      id: 'mec-ref-04',
      type: 'gen',
      difficulty: 1,
      lessonRef: 0,
      title: 'COP de aquecimento da bomba de calor',
      roteiro: 'carnot-refrigeracao',
      generate(rng) {
        const W = pickOne(rng, [2, 2.5, 4, 5]);
        const QL = pickOne(rng, [6, 7.5, 8, 10, 12]);
        const QH = QL + W;
        const cop = QH / W;
        const { options, answer } = numericOptions({
          correct: cop,
          digits: 2,
          correctWhy: `COP_{BC} = Q_{H}/W = (${fmt(QL, 1)} + ${fmt(W, 1)})/${fmt(W, 1)} = ${fmt(cop, 2)}.`,
          distractors: [
            { value: QL / W, why: 'Esse é o COP de **refrigeração**, Q_{L}/W. Na bomba de calor, o útil é o calor entregue, Q_{H} = Q_{L} + W.' },
            { value: W / QH, why: 'Inverteu a razão.' },
            { value: QL / QH, why: 'Dividiu pelo calor entregue; o COP divide pelo **trabalho**.' },
          ],
        });
        return {
          prompt: `Uma bomba de calor aquece um ambiente retirando **${fmt(QL, 1)} kW** do ar externo e consumindo **${fmt(W, 1)} kW** de potência elétrica no compressor. O COP de aquecimento é`,
          options,
          answer,
          hint: 'Primeiro ache o calor entregue ao ambiente.',
          steps: [
            { do: 'Ache o calor entregue ao ambiente: Q_{H} = Q_{L} + W.', show: `Q_{H} = ${fmt(QL, 1)} + ${fmt(W, 1)} = ${fmt(QH, 1)} kW.` },
            { do: 'COP de aquecimento = calor entregue ÷ trabalho.', show: `COP_{BC} = ${fmt(QH, 1)}/${fmt(W, 1)}.` },
            { do: 'Calcule e confira: COP_{BC} = COP_{R} + 1.', show: `COP_{BC} = **${fmt(cop, 2)}** = ${fmt(QL / W, 2)} + 1.` },
          ],
          explanation: `O ambiente recebe Q_{H} = Q_{L} + W = ${fmt(QL, 1)} + ${fmt(W, 1)} = ${fmt(QH, 1)} kW.\n\nCOP_{BC} = Q_{H}/W = ${fmt(QH, 1)}/${fmt(W, 1)} = **${fmt(cop, 2)}**, que é o COP de refrigeração (${fmt(QL / W, 2)}) mais 1.`,
        };
      },
    },
    {
      id: 'mec-ref-05',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Título após a válvula de expansão',
      roteiro: 'cop-ciclo',
      generate(rng) {
        const hl = pickOne(rng, [30, 40, 50]);
        const hlv = pickOne(rng, [190, 200, 210]);
        const h3 = pickOne(rng, [90, 100, 110, 120]);
        const hv = hl + hlv;
        const x = (h3 - hl) / hlv;
        const { options, answer } = numericOptions({
          correct: x,
          digits: 2,
          correctWhy: `x₄ = (h₄ − h_{l})/h_{lv} = (${h3} − ${hl})/${hlv} = ${fmt(x, 2)}.`,
          distractors: [
            { value: 1 - x, why: 'Essa é a fração que continua **líquida**, 1 − x.' },
            { value: h3 / hv, why: 'Dividiu h₃ por h_{v}; o título é (h₄ − h_{l})/h_{lv}.' },
            { value: h3 / hlv, why: 'Esqueceu de descontar h_{l} no numerador.' },
          ],
        });
        return {
          prompt: `No ciclo ideal de refrigeração, o líquido sai do condensador com **h₃ = ${h3} kJ/kg** e passa pela válvula de expansão até o evaporador, onde h_{l} = ${hl} kJ/kg e h_{v} = ${hv} kJ/kg. O título da mistura na entrada do evaporador é, aproximadamente,`,
          options,
          answer,
          hint: 'A válvula é isentálpica: h₄ = h₃. Depois, regra da mistura.',
          steps: [
            `h₄ = h₃ = ${h3} kJ/kg.`,
            { do: 'Na entrada do evaporador há mistura: x = (h₄ − h_{l})/h_{lv}, com h_{lv} = h_{v} − h_{l}.', show: `h_{lv} = ${hv} − ${hl} = ${hlv} kJ/kg → x₄ = (${h3} − ${hl})/${hlv}.` },
            { do: 'Calcule e interprete.', show: `x₄ = **${fmt(x, 2)}**: ${fmt(x * 100, 0)} % já entra como vapor (flash) e não refrigera.` },
          ],
          explanation: `Válvula isentálpica: h₄ = h₃ = ${h3} kJ/kg. No evaporador, h_{lv} = h_{v} − h_{l} = ${hlv} kJ/kg.\n\nx₄ = (${h3} − ${hl})/${hlv} = **${fmt(x, 2)}**: ${fmt(x * 100, 0)} % do refrigerante já entra no evaporador como vapor (*flash*) e não refrigera nada.`,
        };
      },
    },
    {
      id: 'mec-ref-06',
      type: 'gen',
      difficulty: 3,
      lessonRef: 5,
      title: 'COP máximo da refrigeração por absorção',
      roteiro: 'carnot-refrigeracao',
      generate(rng) {
        const TsC = pickOne(rng, [127, 177, 227, 327]);
        const TLc = pickOne(rng, [-23, -13, -3]);
        const Ts = TsC + 273;
        const T0 = 300;
        const TL = TLc + 273;
        const eta = 1 - T0 / Ts;
        const copR = TL / (T0 - TL);
        const cop = eta * copR;
        const { options, answer } = numericOptions({
          correct: cop,
          digits: 2,
          correctWhy: `COP_{máx} = (1 − T_{0}/T_{s})·T_{L}/(T_{0} − T_{L}) = ${fmt(eta, 3)} × ${fmt(copR, 2)} = ${fmt(cop, 2)}.`,
          distractors: [
            { value: copR, why: 'Esse é só o COP do refrigerador de Carnot; falta multiplicar pelo rendimento do "motor" entre T_{s} e T_{0}.' },
            { value: eta, why: 'Esse é só o rendimento de Carnot entre o gerador e o ambiente.' },
            { value: TL / (Ts - TL), why: 'Usou um refrigerador de Carnot entre T_{L} e T_{s}; o calor é rejeitado no ambiente, a T_{0}.' },
            { value: eta + copR, why: 'Somou; os dois fatores se **multiplicam** (o motor aciona o refrigerador).' },
          ],
        });
        return {
          prompt: `Um sistema de refrigeração por absorção recebe calor de uma fonte a **${TsC} °C**, rejeita calor para o ambiente a **27 °C** e mantém a câmara a **${TLc} °C**. O COP máximo (reversível) desse sistema é, aproximadamente,`,
          options,
          answer,
          hint: 'Imagine um motor de Carnot entre T_{s} e T_{0} acionando um refrigerador de Carnot entre T_{L} e T_{0}.',
          steps: [
            `T_{s} = ${Ts} K; T_{0} = 300 K; T_{L} = ${TL} K.`,
            `Motor de Carnot: η = 1 − 300/${Ts} = ${fmt(eta, 3)}; refrigerador de Carnot: COP = ${TL}/(300 − ${TL}) = ${fmt(copR, 2)}.`,
            `COP_{máx} = ${fmt(eta, 3)} × ${fmt(copR, 2)} = **${fmt(cop, 2)}** (reais ficam entre 0,5 e 0,7).`,
          ],
          explanation: `Em kelvin: T_{s} = ${Ts} K, T_{0} = 300 K e T_{L} = ${TL} K.\n\nMotor de Carnot: η = 1 − 300/${Ts} = ${fmt(eta, 3)}. Refrigerador de Carnot: COP = ${TL}/(300 − ${TL}) = ${fmt(copR, 2)}.\n\nCOP_{máx} = ${fmt(eta, 3)} × ${fmt(copR, 2)} = **${fmt(cop, 2)}**. Sistemas reais de absorção ficam bem abaixo disso (0,5 a 0,7).`,
        };
      },
    },
    {
      id: 'mec-ref-07',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'No ciclo ideal de refrigeração por compressão de vapor, o processo que ocorre na válvula de expansão é',
      options: [
        { text: 'isentálpico: a entalpia na saída é igual à da entrada.', why: 'Correta: estrangulamento sem calor e sem trabalho → h₄ = h₃.' },
        { text: 'isentrópico, como no compressor ideal.', why: 'O estrangulamento é irreversível: a entropia aumenta.' },
        { text: 'isobárico, como no condensador.', why: 'Na válvula, a pressão **cai** da de condensação para a de evaporação.' },
        { text: 'isotérmico, pois o refrigerante muda de fase.', why: 'A temperatura despenca na válvula: é ela que produz o frio.' },
        { text: 'uma expansão que produz trabalho no eixo.', why: 'Válvula não tem eixo: W = 0. Quem expande produzindo trabalho é uma turbina.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: o processo na **válvula de expansão**.',
        'Sem calor e sem trabalho no estrangulamento: h₄ = h₃; a pressão cai e parte do líquido evapora (flash).',
        'Fica **isentálpico**. Isentrópico é o compressor ideal; a válvula é irreversível (s₄ > s₃).',
      ],
      explanation: 'Na válvula, Q ≈ 0 e W = 0, com variação de energia cinética desprezível: **h₄ = h₃**. A pressão cai, parte do líquido evapora (*flash*) e a temperatura cai até a de evaporação. É um processo irreversível: s₄ > s₃.',
    },
    {
      id: 'mec-ref-08',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Num sistema de refrigeração, mantida a temperatura de evaporação, o aumento da temperatura de condensação (num dia quente ou com o condensador sujo, por exemplo)',
      options: [
        { text: 'reduz o COP e aumenta o trabalho do compressor por kg de refrigerante.', why: 'Correta: o compressor vence uma diferença de pressão maior, e o efeito refrigerante cai.' },
        { text: 'aumenta o COP, pois o refrigerante rejeita mais calor.', why: 'Rejeitar calor a temperatura mais alta piora o ciclo.' },
        { text: 'não altera o COP, que depende só da temperatura de evaporação.', why: 'O COP depende das duas temperaturas (veja o Carnot: T_{L}/(T_{H} − T_{L})).' },
        { text: 'aumenta o efeito refrigerante, pois o líquido chega mais quente à válvula.', why: 'Líquido mais quente → mais *flash* na válvula → **menos** q_{L}.' },
        { text: 'reduz a temperatura de descarga do compressor.', why: 'A descarga fica **mais** quente.' },
      ],
      answer: 0,
      roteiro: 'cop-ciclo',
      steps: [
        'Condensar mais quente: o líquido chega mais quente à válvula, então h₃ = h₄ sobe.',
        'q_{L} = h₁ − h₄ **cai**; e a pressão de descarga maior faz w = h₂ − h₁ **subir**.',
        'COP = q_{L}/w **cai**: fica **reduz o COP e aumenta o trabalho por kg**.',
      ],
      explanation: 'Condensar mais quente exige pressão de descarga maior: w = h₂ − h₁ cresce. Ao mesmo tempo, o líquido chega mais quente à válvula, h₄ = h₃ sobe e q_{L} = h₁ − h₄ cai. Resultado: **COP menor**. Por isso, condensador limpo e água de resfriamento fria economizam energia.',
    },
    {
      id: 'mec-ref-09',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Num sistema de refrigeração por absorção de amônia, o compressor do ciclo de compressão de vapor é substituído pelo conjunto',
      options: [
        { text: 'absorvedor, bomba de solução e gerador, acionado principalmente por calor.', why: 'Correta: é o "compressor térmico".' },
        { text: 'turbina e condensador auxiliar.', why: 'Não há turbina no ciclo de absorção.' },
        { text: 'evaporador e válvula de expansão adicionais.', why: 'Evaporador e válvula existem nos dois ciclos; não substituem o compressor.' },
        { text: 'ejetor de vapor e condensador barométrico.', why: 'Isso é a refrigeração por **jato de vapor** (ejetor), outro tipo de sistema.' },
        { text: 'compressor centrífugo de dois estágios.', why: 'A ideia da absorção é justamente dispensar o compressor de vapor.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: o que **substitui o compressor** na absorção.',
        'O vapor de amônia é absorvido pela água (absorvedor), a solução é bombeada (trabalho pequeno) e o calor separa a amônia de novo (gerador).',
        'Fica **absorvedor, bomba de solução e gerador, acionados por calor**.',
      ],
      explanation: 'O vapor de amônia de baixa pressão é **absorvido** pela água no absorvedor; a solução líquida é **bombeada** (trabalho pequeno) até a alta pressão; no **gerador**, calor externo separa de novo a amônia, que segue para o condensador. Condensador, válvula e evaporador são os mesmos do ciclo de compressão.',
    },
    {
      id: 'mec-ref-10',
      difficulty: 1,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'No ciclo de refrigeração por absorção amônia–água,',
      options: [
        { text: 'a amônia é o refrigerante e a água é o absorvente.', why: 'Correta.' },
        { text: 'a água é o refrigerante e a amônia é o absorvente.', why: 'Invertido. Água como refrigerante é o caso do par brometo de lítio–água.' },
        { text: 'o brometo de lítio é o refrigerante.', why: 'No par brometo de lítio–água, o refrigerante é a água; o LiBr é o absorvente. E esse par não usa amônia.' },
        { text: 'a amônia e a água evaporam juntas no evaporador.', why: 'O retificador retira a água do vapor antes do condensador: no evaporador ferve a amônia.' },
        { text: 'não há condensador, pois a amônia condensa no absorvedor.', why: 'Há condensador. No absorvedor, a amônia é **absorvida** pela água.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: quem é refrigerante e quem é absorvente no par **amônia–água**.',
        'A amônia condensa e ferve (refrigerante); a água a absorve e a libera (absorvente). No par água–brometo de lítio, quem refrigera é a água.',
        'Fica **amônia como refrigerante e água como absorvente**.',
      ],
      explanation: 'A amônia (R-717) é o refrigerante: condensa no condensador e ferve no evaporador. A água a absorve no absorvedor e a libera no gerador. Como a amônia ferve bem abaixo de 0 °C, o par serve para a refrigeração industrial, inclusive congelamento.',
    },
    {
      id: 'mec-ref-11',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'O sub-resfriamento do líquido na saída do condensador, antes da válvula de expansão,',
      options: [
        { text: 'aumenta o efeito refrigerante, porque reduz h₃ = h₄ e o *flash* na válvula.', why: 'Correta.' },
        { text: 'protege o compressor contra a entrada de líquido.', why: 'Esse é o papel do **superaquecimento** na sucção.' },
        { text: 'aumenta o trabalho do compressor por kg de refrigerante.', why: 'O sub-resfriamento acontece depois do compressor; w não muda.' },
        { text: 'reduz o COP, pois o líquido perde energia.', why: 'Mais q_{L} com o mesmo w → COP **maior**.' },
        { text: 'é o mesmo que o estrangulamento.', why: 'Estrangulamento é a queda de pressão na válvula; sub-resfriar é esfriar o líquido abaixo da saturação.' },
      ],
      answer: 0,
      roteiro: 'cop-ciclo',
      steps: [
        'Sub-resfriar: líquido abaixo da saturação → h₃ menor, e h₄ = h₃ também.',
        'q_{L} = h₁ − h₄ **aumenta** (menos flash); o trabalho w não muda.',
        'Fica **aumenta o efeito refrigerante**.',
      ],
      explanation: 'Com o líquido mais frio que a saturação, h₃ diminui; como h₄ = h₃, a mistura entra no evaporador com menos vapor de *flash*, e q_{L} = h₁ − h₄ aumenta com o mesmo trabalho de compressão.',
    },
    {
      id: 'mec-ref-12',
      type: 'ce',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Um refrigerador com COP igual a 3 viola a 2ª lei da termodinâmica, pois retira do espaço refrigerado mais energia do que consome.',
      answer: false,
      roteiro: 'carnot-refrigeracao',
      steps: [
        'COP = 3: retira três vezes a energia que consome.',
        'O refrigerador **transporta** calor; o limite é o de Carnot, T_{L}/(T_{H} − T_{L}), quase sempre bem maior que 1.',
        'COP maior que 1 não viola a 2ª lei: **Errado**.',
      ],
      explanation: 'COP não é rendimento. O refrigerador **transporta** calor do frio para o quente; o trabalho só paga o transporte. COP de 2 a 5 é comum. O limite é o Carnot, T_{L}/(T_{H} − T_{L}), quase sempre bem maior que 1.',
    },
    {
      id: 'mec-ref-13',
      type: 'ce',
      difficulty: 2,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Na válvula de expansão do ciclo ideal de compressão de vapor, a entalpia do refrigerante permanece constante, mas a entropia aumenta.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: na válvula, entalpia **constante** e entropia **aumentando**.',
        'Estrangulamento: h₄ = h₃ (sem calor nem trabalho); é adiabático e irreversível, então s₄ > s₃.',
        '**Certo**.',
      ],
      explanation: 'Estrangulamento: h₄ = h₃ (sem calor nem trabalho). É um processo adiabático e irreversível: a entropia gerada fica no fluido, s₄ > s₃. Por isso, no T–s, a área do ciclo é só aproximadamente o trabalho.',
    },
    {
      id: 'mec-ref-14',
      type: 'ce',
      difficulty: 2,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Operando entre os mesmos estados, o COP de uma bomba de calor é igual ao COP do refrigerador correspondente mais uma unidade.',
      answer: true,
      roteiro: 'carnot-refrigeracao',
      steps: [
        'Mesmos estados: Q_{H} = Q_{L} + W.',
        'Divida tudo por W: Q_{H}/W = Q_{L}/W + 1.',
        'COP_{BC} = COP_{R} + 1: **Certo**.',
      ],
      explanation: 'Q_{H} = Q_{L} + W → Q_{H}/W = Q_{L}/W + 1. Vale para o ciclo real (mesmos estados) e para os de Carnot entre as mesmas temperaturas.',
    },
    {
      id: 'mec-ref-15',
      type: 'ce',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Reduzir a temperatura de evaporação de um sistema de refrigeração, mantida a de condensação, aumenta o COP, pois o refrigerante passa a absorver calor a uma temperatura menor.',
      answer: false,
      roteiro: 'cop-ciclo',
      steps: [
        'Evaporar mais frio: pressão de sucção menor.',
        'O compressor vence uma diferença de pressão maior: w sobe (e q_{L} muda pouco).',
        'O COP **cai** — um congelador gasta mais que uma geladeira: **Errado**.',
      ],
      explanation: 'Evaporar mais frio aumenta a diferença de temperatura (e de pressão) que o compressor precisa vencer: o trabalho por kg sobe e o COP **cai**. É por isso que um congelador gasta mais que uma geladeira para a mesma carga térmica.',
    },
    {
      id: 'mec-ref-16',
      type: 'ce',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'O COP de um sistema de refrigeração por absorção, calculado com o calor fornecido ao gerador, costuma ser menor que 1; ainda assim, o sistema é vantajoso quando há calor residual disponível.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: COP de absorção **menor que 1** e, ainda assim, vantajoso.',
        'COP_{abs} ≈ 0,5 a 0,7 (simples efeito), mas o insumo é calor barato ou residual; a eletricidade gasta é só a da bomba de solução.',
        '**Certo**.',
      ],
      explanation: 'COP_{abs} ≈ Q_{L}/Q_{ger} fica tipicamente entre 0,5 e 0,7 (simples efeito). Mas o insumo é calor de baixo custo (vapor de escape, gases quentes, cogeração), e o consumo elétrico se resume à bomba de solução.',
    },
    {
      id: 'mec-ref-17',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'COP com perda de calor no compressor',
      roteiro: 'cop-ciclo',
      generate(rng) {
        const qL = pickOne(rng, [100, 120, 140, 150, 160]);
        const w = pickOne(rng, [30, 35, 40, 50, 60]);
        const loss = pickOne(rng, [4, 5, 8, 10]);
        const cop = qL / w;
        const { options, answer } = numericOptions({
          correct: cop,
          digits: 2,
          correctWhy: `COP = q_{L}/w = ${qL}/${w} = ${fmt(cop, 2)} (o calor perdido no compressor não entra).`,
          distractors: [
            { value: qL / (w - loss), why: 'Descontou a perda do trabalho: o que se paga é todo o trabalho de acionamento.' },
            { value: qL / (w + loss), why: 'Somou a perda ao trabalho; ela é consequência do trabalho, não um gasto extra.' },
            { value: (qL + w) / w, why: 'Esse é o COP da **bomba de calor** (q_{H}/w).' },
            { value: w / qL, why: 'Inverteu a razão.' },
          ],
        });
        return {
          prompt: `Num ciclo de refrigeração por compressão de vapor, o refrigerante absorve **${qL} kJ/kg** no evaporador e o compressor consome **${w} kJ/kg** de trabalho; durante a compressão, o refrigerante perde **${loss} kJ/kg** de calor para o ambiente. O coeficiente de eficácia (COP) do refrigerador é, aproximadamente,`,
          options,
          answer,
          hint: 'COP = efeito desejado ÷ energia paga.',
          steps: [
            { do: 'Separe o que se quer (calor retirado no evaporador) do que se paga (trabalho do compressor).', show: `q_{L} = ${qL} kJ/kg; w = ${w} kJ/kg.` },
            { do: 'A perda de calor no compressor entra no COP?', show: `Não: ela só muda h₂ e o calor do condensador; o trabalho pago continua ${w} kJ/kg.` },
            { do: 'COP = q_{L}/w.', show: `COP = ${qL}/${w} = **${fmt(cop, 2)}**.` },
          ],
          explanation: `COP = q_{L}/w = ${qL}/${w} = **${fmt(cop, 2)}**. A perda de calor no compressor só muda a entalpia de saída (e o calor no condensador); o trabalho pago continua sendo ${w} kJ/kg.`,
        };
      },
    },
    {
      id: 'mec-ref-18',
      type: 'gen',
      difficulty: 1,
      lessonRef: 2,
      title: 'Calor rejeitado no condensador',
      roteiro: 'balanco-componente',
      generate(rng) {
        const m = pickOne(rng, [0.5, 1, 1.5, 2]);
        const h1 = pickOne(rng, [280, 300, 320]);
        const h2 = pickOne(rng, [60, 80, 100]);
        const Q = m * (h1 - h2);
        const { options, answer } = numericOptions({
          correct: Q,
          unit: 'kW',
          digits: 1,
          correctWhy: `Q̇ = ṁ·(h_{ent} − h_{saí}) = ${fmt(m)} × (${h1} − ${h2}) = ${fmt(Q, 1)} kW.`,
          distractors: [
            { value: h1 - h2, why: 'Esqueceu a vazão: (h_{ent} − h_{saí}) é por kg.' },
            { value: m * h1, why: 'Usou só a entalpia de entrada.' },
            { value: m * (h1 + h2), why: 'Somou as entalpias; o calor é a **diferença**.' },
            { value: (h1 - h2) / m, why: 'Dividiu pela vazão em vez de multiplicar.' },
          ],
        });
        return {
          prompt: `Um condensador opera em regime permanente com **${fmt(m)} kg/s** de refrigerante, que entra com h = **${h1} kJ/kg** e sai como líquido com h = **${h2} kJ/kg**. Desprezando variações de energia cinética e potencial, a taxa de calor rejeitado pelo refrigerante, em módulo, é, em kW,`,
          options,
          answer,
          hint: 'Trocador sem trabalho: Q̇ = ṁ·Δh.',
          steps: [
            `Condensador: Q̇ − Ẇ = ṁ·(h₂ − h₁).`,
            `Sem eixo: Ẇ = 0 → Q̇ = ${fmt(m)} × (${h2} − ${h1}).`,
            `Q̇ = −${fmt(Q, 1)} kW → **${fmt(Q, 1)} kW** rejeitados, em módulo.`,
          ],
          explanation: `Sem trabalho e sem ΔEc/ΔEp: Q̇ = ṁ·(h_{saí} − h_{ent}) = ${fmt(m)} × (${h2} − ${h1}) = −${fmt(Q, 1)} kW. Em módulo, **${fmt(Q, 1)} kW** saem do refrigerante para o ar ou a água.`,
        };
      },
    },
    {
      id: 'mec-ref-19',
      type: 'gen',
      difficulty: 3,
      lessonRef: 2,
      title: 'Vazão num compressor resfriado',
      roteiro: 'balanco-componente',
      generate(rng) {
        const h1 = pickOne(rng, [380, 400, 410]);
        const dh = pickOne(rng, [40, 50, 60]);
        const W = pickOne(rng, [100, 150, 200, 240]);
        const Ql = pickOne(rng, [20, 30, 40]);
        const m = (W - Ql) / dh;
        const { options, answer } = numericOptions({
          correct: m,
          unit: 'kg/s',
          digits: 2,
          correctWhy: `ṁ = (Ẇ − Q̇_{perdido})/(h₂ − h₁) = (${W} − ${Ql})/${dh} = ${fmt(m, 2)} kg/s.`,
          distractors: [
            { value: W / dh, why: 'Esqueceu o calor levado pela água: nem todo o trabalho fica no refrigerante.' },
            { value: (W + Ql) / dh, why: 'Somou o calor perdido; ele **sai** do refrigerante.' },
            { value: (W - Ql) / (h1 + dh), why: 'Dividiu pela entalpia de saída, não pela variação.' },
            { value: Ql / dh, why: 'Usou só o calor perdido.' },
          ],
        });
        return {
          prompt: `Um compressor em regime permanente admite R-134a com h₁ = **${h1} kJ/kg** e o descarrega com h₂ = **${h1 + dh} kJ/kg**. A potência de acionamento é de **${W} kW** e a camisa de água retira **${Ql} kW** de calor. A vazão mássica de refrigerante é, em kg/s,`,
          options,
          answer,
          hint: 'Q̇ − Ẇ = ṁ·(h₂ − h₁), com Q̇ = −perda e Ẇ = −potência de acionamento.',
          steps: [
            `Compressor: Q̇ − Ẇ = ṁ·(h₂ − h₁), com h₂ − h₁ = ${dh} kJ/kg.`,
            `Q̇ = −${Ql} kW (camisa); Ẇ = −${W} kW (consumida) → (−${Ql}) − (−${W}) = ṁ × ${dh}.`,
            `ṁ = (${W} − ${Ql})/${dh} = **${fmt(m, 2)} kg/s**.`,
          ],
          explanation: `1ª lei: Q̇ − Ẇ = ṁ·(h₂ − h₁) → (−${Ql}) − (−${W}) = ṁ × ${dh}.\n\nṁ = (${W} − ${Ql})/${dh} = **${fmt(m, 2)} kg/s**: dos ${W} kW de trabalho, ${Ql} kW vão para a água e o resto aumenta a entalpia do refrigerante.`,
        };
      },
    },
    {
      id: 'mec-ref-20',
      difficulty: 1,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'No ciclo ideal de compressão de vapor, com os estados 1 (saída do evaporador), 2 (saída do compressor), 3 (saída do condensador) e 4 (saída da válvula de expansão), o coeficiente de eficácia do refrigerador é',
      shuffle: false,
      options: [
        { text: '(h₁ − h₄)/(h₂ − h₁)', why: 'Correta: efeito refrigerante ÷ trabalho do compressor.' },
        { text: '(h₂ − h₃)/(h₂ − h₁)', why: 'Esse é o COP da **bomba de calor** (calor no condensador).' },
        { text: '(h₂ − h₁)/(h₁ − h₄)', why: 'Invertido.' },
        { text: '(h₁ − h₄)/(h₂ − h₃)', why: 'O denominador deve ser o trabalho, não o calor rejeitado.' },
        { text: '(h₃ − h₄)/(h₂ − h₁)', why: 'Na válvula, h₃ = h₄: o numerador seria zero.' },
      ],
      answer: 0,
      roteiro: 'cop-ciclo',
      steps: [
        'Válvula isentálpica: h₄ = h₃.',
        'Evaporador: q_{L} = h₁ − h₄; compressor: w = h₂ − h₁.',
        'COP = **(h₁ − h₄)/(h₂ − h₁)**.',
      ],
      explanation: 'Evaporador: q_{L} = h₁ − h₄. Compressor: w = h₂ − h₁. **COP_{R} = (h₁ − h₄)/(h₂ − h₁)**. Lembre que h₄ = h₃ (válvula isentálpica) — por isso também se escreve (h₁ − h₃)/(h₂ − h₁).',
    },
    {
      id: 'mec-ref-21',
      type: 'gen',
      difficulty: 3,
      lessonRef: 3,
      title: 'Potência mínima de uma bomba de calor',
      roteiro: 'carnot-refrigeracao',
      generate(rng) {
        const TiC = pickOne(rng, [20, 22, 27]);
        const ToC = pickOne(rng, [-13, -3, 2, 7]);
        const Q = pickOne(rng, [20, 30, 40, 60]);
        const TH = TiC + 273;
        const TL = ToC + 273;
        const W = Q * (1 - TL / TH);
        const { options, answer } = numericOptions({
          correct: W,
          unit: 'kW',
          digits: 2,
          correctWhy: `W_{mín} = Q̇_{H}/COP_{máx} = Q̇_{H}·(1 − T_{L}/T_{H}) = ${Q} × (1 − ${TL}/${TH}) = ${fmt(W, 2)} kW.`,
          distractors: [
            { value: Q * (TL / TH), why: 'Usou T_{L}/T_{H} no lugar de 1 − T_{L}/T_{H}.' },
            { value: Q * ((TiC - ToC) / TiC), why: 'Usou °C na razão de temperaturas: a 2ª lei exige kelvin.' },
            { value: Q, why: 'Supôs COP = 1 (aquecimento elétrico direto).' },
            { value: Q / ((TL) / (TH - TL)), why: 'Usou o COP do **refrigerador** (T_{L}/ΔT) em vez do da bomba de calor (T_{H}/ΔT).' },
          ],
        });
        return {
          prompt: `Um laboratório deve ser mantido a **${TiC} °C** com uma bomba de calor quando a temperatura externa cai para **${ToC} °C**. Nessa condição, o laboratório perde **${Q} kW** de calor para o exterior. A potência elétrica **mínima** teórica para acionar a bomba de calor é, em kW,`,
          options,
          answer,
          hint: 'Em regime, a bomba de calor deve repor Q̇_{H} = perda. COP_{BC,máx} = T_{H}/(T_{H} − T_{L}), em kelvin.',
          steps: [
            `T_{H} = ${TH} K; T_{L} = ${TL} K.`,
            `COP_{BC,máx} = ${TH}/(${TH} − ${TL}) = ${fmt(TH / (TH - TL), 2)}.`,
            `Ẇ_{mín} = ${Q}/${fmt(TH / (TH - TL), 2)} = **${fmt(W, 2)} kW** — bem menos que os ${Q} kW de um aquecedor elétrico.`,
          ],
          explanation: `T_{H} = ${TH} K e T_{L} = ${TL} K → COP_{BC,máx} = ${TH}/${TH - TL} = ${fmt(TH / (TH - TL), 2)}.\n\nẆ_{mín} = Q̇_{H}/COP = ${Q}/${fmt(TH / (TH - TL), 2)} = **${fmt(W, 2)} kW** — bem menos que os ${Q} kW de um aquecedor elétrico.`,
        };
      },
    },
    {
      id: 'mec-ref-22',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Refrigerador de Carnot: a fonte fria',
      roteiro: 'carnot-refrigeracao',
      generate(rng) {
        const TH = pickOne(rng, [300, 310, 320]);
        const QL = pickOne(rng, [800, 1000, 1200, 1500]);
        const ratio = pickOne(rng, [1.2, 1.25, 1.5]);
        const QH = QL * ratio;
        const TL = TH / ratio;
        const { options, answer } = numericOptions({
          correct: TL,
          unit: 'K',
          digits: 1,
          correctWhy: `Carnot: Q_{L}/Q_{H} = T_{L}/T_{H} → T_{L} = ${TH} × ${fmt(QL)}/${fmt(QH)} = ${fmt(TL, 1)} K.`,
          distractors: [
            { value: TH * ratio, why: 'Inverteu a razão: a fonte fria tem temperatura **menor**.' },
            { value: TH - (QH - QL) / 10, why: 'Subtraiu o trabalho da temperatura — sem sentido físico.' },
            { value: TL - 273, why: 'Converteu para °C; a pergunta pede kelvin.' },
            { value: (TH * QL) / (QH + QL), why: 'Somou os calores no denominador.' },
          ],
        });
        return {
          prompt: `Um refrigerador de **Carnot** retira **${fmt(QL)} kJ** da fonte fria e rejeita **${fmt(QH)} kJ** numa fonte quente a **${TH} K**, a cada ciclo. A temperatura da fonte fria é, em K,`,
          options,
          answer,
          hint: 'No ciclo reversível, os calores são proporcionais às temperaturas absolutas.',
          steps: [
            `Já em kelvin: T_{H} = ${TH} K.`,
            `Carnot: Q_{L}/Q_{H} = T_{L}/T_{H}.`,
            `T_{L} = ${TH} × ${fmt(QL)}/${fmt(QH)} = **${fmt(TL, 1)} K**.`,
          ],
          explanation: `No ciclo de Carnot, **Q_{L}/Q_{H} = T_{L}/T_{H}**. Logo T_{L} = ${TH} × ${fmt(QL)}/${fmt(QH)} = **${fmt(TL, 1)} K**. Conferindo: COP = Q_{L}/(Q_{H} − Q_{L}) = ${fmt(QL / (QH - QL), 2)} = T_{L}/(T_{H} − T_{L}).`,
        };
      },
    },
  ],
  games: [
    {
      id: 'mec-ref-g1',
      type: 'order',
      title: 'Siga o refrigerante',
      intro: 'Comece na saída do evaporador e percorra o ciclo de compressão de vapor.',
      lessonRef: 1,
      steps: [
        { text: 'Vapor saturado frio sai do evaporador e é aspirado pelo compressor', why: 'Estado 1: baixa pressão, só vapor (nada de líquido no compressor).' },
        { text: 'O compressor eleva a pressão e o vapor sai superaquecido e quente', why: '1→2: isentrópico no ciclo ideal. Aqui entra o trabalho w.' },
        { text: 'No condensador, o vapor esfria, condensa e rejeita q_{H} ao ambiente', why: '2→3, a pressão constante.' },
        { text: 'O líquido saturado, a alta pressão, segue para a válvula de expansão', why: 'Estado 3.' },
        { text: 'Na válvula, a pressão cai a entalpia constante e parte do líquido vira vapor', why: '3→4: estrangulamento. A temperatura despenca.' },
        { text: 'No evaporador, a mistura fria ferve retirando q_{L} do espaço refrigerado', why: '4→1: o efeito refrigerante. E o ciclo recomeça.' },
      ],
    },
    {
      id: 'mec-ref-g2',
      type: 'sort',
      title: 'Compressão de vapor, absorção ou os dois?',
      intro: 'Cada item pertence ao ciclo de compressão de vapor, ao de absorção de amônia ou aos dois?',
      lessonRef: 5,
      bins: ['Compressão de vapor', 'Absorção de amônia', 'Os dois'],
      perRound: 10,
      items: [
        { text: 'Compressor mecânico de vapor', bin: 0, why: 'O coração do ciclo de compressão.' },
        { text: 'Gerador aquecido por vapor ou calor residual', bin: 1, why: 'Separa a amônia da solução usando calor.' },
        { text: 'Absorvedor resfriado a água', bin: 1, why: 'A água absorve o vapor de amônia, e a absorção libera calor.' },
        { text: 'Bomba de solução líquida', bin: 1, why: 'Eleva a pressão da solução com trabalho pequeno.' },
        { text: 'Retificador', bin: 1, why: 'Retira o vapor de água que sai do gerador junto com a amônia.' },
        { text: 'Condensador', bin: 2, why: 'Nos dois, o refrigerante condensa rejeitando calor.' },
        { text: 'Válvula de expansão', bin: 2, why: 'Nos dois, o refrigerante é estrangulado até a pressão do evaporador.' },
        { text: 'Evaporador', bin: 2, why: 'Nos dois, é ali que se produz o frio.' },
        { text: 'COP típico entre 2 e 5', bin: 0, why: 'Com trabalho de eixo como insumo.' },
        { text: 'COP típico abaixo de 1', bin: 1, why: 'Com o calor do gerador como insumo.' },
        { text: 'Insumo principal: energia elétrica no motor', bin: 0, why: 'O compressor consome trabalho de eixo.' },
        { text: 'Insumo principal: calor de alta temperatura', bin: 1, why: 'Por isso combina com cogeração e calor residual.' },
      ],
    },
    {
      id: 'mec-ref-g3',
      type: 'match',
      title: 'Cada componente e sua função',
      intro: 'Ligue cada componente do sistema de refrigeração à sua função.',
      lessonRef: 4,
      leftLabel: 'Componente',
      rightLabel: 'Função',
      perRound: 6,
      pairs: [
        { left: 'Compressor', right: 'Eleva a pressão do vapor e recebe o trabalho', why: 'w = h₂ − h₁.' },
        { left: 'Condensador', right: 'Rejeita q_{H} e liquefaz o refrigerante', why: 'q_{H} = h₂ − h₃.' },
        { left: 'Válvula de expansão', right: 'Derruba a pressão a entalpia constante', why: 'h₄ = h₃.' },
        { left: 'Evaporador', right: 'Retira q_{L} do espaço refrigerado', why: 'q_{L} = h₁ − h₄: o efeito refrigerante.' },
        { left: 'Separador de líquido', right: 'Impede que gotas cheguem à sucção do compressor', why: 'Líquido no compressor causa golpe de líquido.' },
        { left: 'Filtro secador', right: 'Retém umidade e sujeira antes da válvula', why: 'Umidade pode congelar e entupir a válvula.' },
        { left: 'Gerador (absorção)', right: 'Recebe calor e separa a amônia da solução', why: 'É a parte "quente" do compressor térmico.' },
        { left: 'Absorvedor (absorção)', right: 'A água absorve o vapor de amônia', why: 'A solução fica rica e segue para a bomba.' },
      ],
    },
    {
      id: 'mec-ref-lab1',
      type: 'lab',
      lab: 'vapor',
      title: 'O refrigerador na bancada',
      intro: 'Compressor, condensador, válvula e evaporador funcionando, com o estado do R-134a andando nos diagramas P–h e T–s. Aposte antes de ver e cumpra as missões.',
      lessonRef: 3,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { cyc: 1, te: -10, tc: 40, cap: 5 },
          prompt: 'Trocando a geladeira por um congelador: a evaporação cai de −10 para −20 °C. O COP…',
          change: { te: -20 },
          options: ['cai: o compressor precisa vencer uma diferença maior de pressão', 'sobe: o refrigerante mais frio absorve mais calor', 'não muda: o COP depende só do refrigerante', 'sobe, e a potência do compressor cai'],
          answer: 0,
          expect: [
            { out: 'cop', trend: 'down' },
            { out: 'wc', trend: 'up' },
            { out: 'Pe', trend: 'down' },
            { out: 'Wc', trend: 'up' },
          ],
          why: 'Evaporar mais frio derruba a pressão de sucção: o compressor eleva a pressão por um salto maior (w sobe) e o COP cai. Para a mesma carga em TR, o motor do compressor precisa de mais potência.',
        },
        {
          kind: 'predict',
          setup: { cyc: 1, te: -10, tc: 30, cap: 5 },
          prompt: 'Dia quente: a condensação sobe de 30 para 50 °C. A fração do refrigerante que vira vapor na válvula (o título após a válvula)…',
          change: { tc: 50 },
          options: ['aumenta: o líquido chega mais quente e mais dele evapora no estrangulamento', 'diminui', 'não muda: a válvula é isentálpica', 'vai a zero'],
          answer: 0,
          expect: [
            { out: 'xv', trend: 'up' },
            { out: 'qL', trend: 'down' },
            { out: 'cop', trend: 'down' },
          ],
          why: 'Com h₄ = h₃, um líquido mais quente chega ao evaporador já com mais vapor (*flash*), que não refrigera nada: q_{L} = h₁ − h₄ cai. Somado ao trabalho maior, o COP despenca.',
        },
        {
          kind: 'goal',
          setup: { cyc: 1, te: -10, tc: 40, cap: 5 },
          lock: ['cyc', 'cap'],
          prompt: 'Leve o COP do refrigerador a **pelo menos 5**.',
          goals: [{ out: 'cop', min: 5 }],
          hint: 'Aproxime as temperaturas: evaporar menos frio e/ou condensar menos quente.',
          solution: { te: 0 },
          why: 'O COP cresce quando T_{L} e T_{H} se aproximam (Carnot: T_{L}/(T_{H} − T_{L})). Na prática: não regular a câmara mais fria que o necessário e manter o condensador limpo e bem ventilado.',
        },
        {
          kind: 'predict',
          setup: { cyc: 1, te: -10, tc: 40, cap: 5 },
          prompt: 'Se esta mesma máquina, com os mesmos estados, fosse usada como **bomba de calor** (o útil passa a ser o calor do condensador), o COP de aquecimento seria…',
          options: ['o COP de refrigeração mais 1', 'igual ao COP de refrigeração', 'o COP de refrigeração menos 1', 'o inverso do COP de refrigeração'],
          answer: 0,
          why: 'q_{H} = q_{L} + w, então q_{H}/w = q_{L}/w + 1. Veja nas leituras: o COP como bomba de calor é exatamente uma unidade maior.',
        },
        {
          kind: 'goal',
          setup: { cyc: 1, te: -15, tc: 45, cap: 5 },
          lock: ['cyc', 'cap'],
          prompt: 'A câmara precisa de **5 TR**, mas o motor do compressor só tem **4 kW**. Ajuste as temperaturas para caber.',
          goals: [{ out: 'Wc', max: 4 }],
          hint: 'Ẇ = Q̇_{L}/COP: com a carga fixa, só um COP maior reduz a potência.',
          solution: { te: -5, tc: 35 },
          why: 'Com 5 TR (17,6 kW) fixos, a potência é Q̇_{L}/COP. Evaporando menos frio e condensando menos quente, o COP sobe e a potência cai, como se o motor tivesse "crescido".',
        },
        {
          kind: 'predict',
          setup: { cyc: 1, te: -10, tc: 40, cap: 5 },
          prompt: 'Dobrando a capacidade (de 5 para 10 TR), com as mesmas temperaturas, o COP e a potência do compressor…',
          change: { cap: 10 },
          options: ['COP igual; potência dobra', 'COP dobra; potência igual', 'os dois dobram', 'COP cai à metade; potência igual'],
          answer: 0,
          expect: [
            { out: 'cop', trend: 'same' },
            { out: 'Wc', trend: 'up' },
            { out: 'mdot', trend: 'up' },
          ],
          why: 'O COP depende só dos estados do ciclo (das temperaturas). Mais carga exige mais vazão de refrigerante, ṁ = Q̇_{L}/q_{L}, e a potência cresce na mesma proporção.',
        },
        {
          kind: 'goal',
          setup: { cyc: 1, te: -25, tc: 50, cap: 5 },
          lock: ['cyc', 'te', 'cap'],
          prompt: 'Congelador a −25 °C. Sem mexer no evaporador, consiga **COP ≥ 3**.',
          goals: [{ out: 'cop', min: 3 }],
          hint: 'Sobrou o lado quente: condensar a uma temperatura menor (condensador limpo, água de resfriamento, ar mais frio).',
          solution: { tc: 30 },
          why: 'Baixar a condensação reduz a pressão de descarga e o *flash* na válvula: o trabalho cai e o efeito refrigerante sobe. Em instalações industriais, condensadores evaporativos e torres de resfriamento servem exatamente para isso.',
        },
      ],
    },
  ],
});
