import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

const TAU = 2 * Math.PI;

export default defineTopic({
  id: 'mec.vibracoes-1gl',
  name: 'Vibrações: 1 grau de liberdade',
  summary:
    'Massa, mola e amortecedor: frequência natural, molas em série e em paralelo, vibração livre (sub, super e criticamente amortecida), decremento logarítmico, vibração forçada, ressonância, desbalanceamento, transmissibilidade e isolamento.',
  order: 8,
  weight: 3,
  equipment: 'isolator',
  edital: ['b2.vibracoes', 'b1.dinamica'],
  lesson: [
    {
      title: 'Massa, mola e frequência natural',
      hot: 'Frequência natural de um motor sobre base elástica em **Hz** (Transpetro 2018) e a pegadinha da unidade: √(k/m) sai em **rad/s** (Transpetro 2011). Use k em N/m (kN/m × 1.000) e divida por 2π para chegar a hertz.',
      body: 'Um sistema de **1 grau de liberdade** precisa de uma só coordenada (x) para descrever o movimento. O modelo clássico tem três elementos:\n- **massa** m: guarda energia **cinética** (inércia);\n- **mola** k: guarda energia **potencial** elástica;\n- **amortecedor** c: **dissipa** energia (vira calor).\n\nEquação do movimento: **m·ẍ + c·ẋ + k·x = F(t)**.\n\nSem amortecimento e sem força, o sistema oscila na **frequência natural**:\n- **ω_{n} = √(k/m)**, em rad/s;\n- **f_{n} = ω_{n}/2π**, em Hz, e o período **T = 1/f_{n}**;\n- em rotação: **n = 60·f_{n}**, em rpm.\n\nA frequência natural depende **só** da massa e da rigidez — não da amplitude nem de como o movimento começou.',
      example: 'Motor de 100 kg sobre uma base de 400 kN/m: ω_{n} = √(400 000/100) = 63,2 rad/s → f_{n} = 63,2/2π ≈ **10,1 Hz** ≈ 604 rpm.',
      tip: 'Pela deflexão estática δ_{st} = m·g/k: **ω_{n} = √(g/δ_{st})**. Com δ_{st} em mm, f_{n} ≈ 15,8/√δ_{st} Hz — molas que cedem mais dão frequência mais baixa.',
      trap: '**rad/s não é Hz.** Divida ω por 2π para ter hertz e multiplique por 60 para ter rpm.',
      lab: { lab: 'vibration', preset: { mode: 0, zeta: 0, abs: 0, m: 50, arr: 2, k: 50 }, label: 'Soltar o motor na bancada' },
    },
    {
      title: 'Molas em paralelo e em série',
      hot: 'As quatro molas da suspensão de um carro num modelo de 1 GL ficam em **paralelo** (Transpetro 2018); a mola da suspensão apoiada no pneu fica em **série** (Transpetro 2012).',
      body: 'Para trocar várias molas por uma só (**rigidez equivalente**):\n- **Paralelo** (mesmo deslocamento; as forças se somam): **k_{eq} = k_{1} + k_{2} + …** — ex.: os quatro coxins de um motor, as molas das quatro rodas de um carro.\n- **Série** (mesma força; os deslocamentos se somam): **1/k_{eq} = 1/k_{1} + 1/k_{2} + …** → para duas molas, k_{eq} = k_{1}·k_{2}/(k_{1} + k_{2}). Ex.: a mola da suspensão apoiada no pneu.\n\nEm série, a rigidez equivalente é **menor que a menor** das molas; duas molas iguais em série valem **k/2**.\n\nOutros elementos elásticos também são molas:\n- viga em balanço com a massa na ponta: k = 3·E·I/L³;\n- viga biapoiada com a massa no meio: k = 48·E·I/L³;\n- eixo em torção: k_{t} = G·J/L.',
      example: 'Suspensão k_{s} apoiada num pneu k_{p} = 4·k_{s} (em série): k_{eq} = k_{s}·4k_{s}/(5k_{s}) = **0,8·k_{s}**.',
      trap: 'Molas em **série** combinam-se como resistores em **paralelo** (soma dos inversos) — e vice-versa.',
      lab: { lab: 'vibration', preset: { mode: 1, arr: 3, k: 50, m: 50, zeta: 0.05, rpm: 300, abs: 0 }, label: 'Molas em série na bancada' },
    },
    {
      title: 'Vibração livre e amortecimento',
      hot: 'Resposta oscilatória e decrescente = **subamortecido** (Transpetro 2018); resposta sem oscilar = ζ ≥ 1 (Transpetro 2011); amplitude constante ou decrescente conforme ζ (Petrobras 2012); quem **dissipa** energia é o amortecedor (Petrobras 2018); a fração de amortecimento depende de inércia, rigidez e dissipação (Petrobras 2011).',
      body: 'Deslocado e solto, o sistema vibra "sozinho". Quem decide o tipo de movimento é a **fração de amortecimento**:\n\n**ζ = c/c_{c}**, com **c_{c} = 2·√(k·m) = 2·m·ω_{n}** (amortecimento crítico).\n- **ζ = 0** (sem amortecimento): oscila para sempre, com amplitude constante.\n- **0 < ζ < 1** (**subamortecido**): oscila com amplitude **decrescente**, na frequência amortecida **ω_{d} = ω_{n}·√(1 − ζ²)**, um pouco menor que ω_{n}.\n- **ζ = 1** (**criticamente amortecido**): volta ao equilíbrio **no menor tempo**, sem oscilar.\n- **ζ > 1** (**superamortecido**): volta **sem oscilar**, porém mais devagar.\n\nζ reúne as três propriedades do sistema: **inércia** (m), **rigidez** (k) e **dissipação** (c).',
      tip: 'Oscilou e foi morrendo? **Subamortecido.** Resposta "não oscilatória" = ζ ≥ 1.',
      trap: 'Só o **amortecedor** dissipa energia. Massa e mola apenas trocam energia entre si (cinética ↔ potencial).',
      lab: { lab: 'vibration', preset: { mode: 0, zeta: 0.05, abs: 0, m: 50, arr: 2, k: 50 }, label: 'Comparar os regimes na bancada' },
    },
    {
      title: 'Decremento logarítmico',
      body: 'Na vibração subamortecida, a razão entre dois picos sucessivos é **sempre a mesma**. O **decremento logarítmico** é\n\n**δ = ln(x_{1}/x_{2}) = 2πζ/√(1 − ζ²) ≈ 2πζ** (para ζ pequeno).\n\nÉ assim que se **mede** o amortecimento de uma estrutura: uma pancada, o registro do sinal e a comparação dos picos. Para picos separados por N ciclos: δ = (1/N)·ln(x_{0}/x_{N}).\n\nO tempo entre dois picos é o **período amortecido** T_{d} = 2π/ω_{d}.',
      example: 'Picos sucessivos de 5,0 mm e 3,0 mm: δ = ln(5/3) = 0,51 → ζ ≈ 0,51/2π ≈ **0,081**.',
      lab: { lab: 'vibration', preset: { mode: 0, zeta: 0.1, abs: 0, m: 50, arr: 2, k: 50 }, label: 'Medir δ na bancada' },
    },
    {
      title: 'Vibração forçada e ressonância',
      hot: '**Rotação de ressonância** de um motor sobre base elástica, ou a rigidez da base para uma ressonância dada (Transpetro 2012, Petrobras 2014 e 2018). Motor desbalanceado: a amplitude é **máxima** quando a rotação coincide com a frequência natural (Petrobras 2011).',
      body: 'Sob uma força harmônica F_{0}·sen(ωt), passado o transitório, o sistema vibra **na frequência da força** (ω), não na natural. A amplitude depende da **razão de frequências r = ω/ω_{n}**:\n\n**X = (F_{0}/k)/√((1 − r²)² + (2ζr)²)**\n- r ≪ 1: X ≈ F_{0}/k (como se a força fosse estática);\n- **r = 1: ressonância** — só o amortecimento limita a amplitude: X = (F_{0}/k)/(2ζ); sem amortecimento, ela cresce sem limite. A resposta fica **90° atrasada** da força;\n- r ≫ 1: a massa "não acompanha" — a amplitude cai, em oposição de fase (180°).\n\n**Desbalanceamento rotativo** (massa m_{d} a uma distância e do eixo): a força F_{0} = m_{d}·e·ω² cresce com a rotação. A amplitude passa por um máximo na ressonância e, em alta rotação, tende a **m_{d}·e/m**.\n\nA **rotação crítica** do motor é a que coincide com a frequência natural: n = 60·f_{n}.',
      example: 'Motor de 25 kg que entra em ressonância a 1.800 rpm: ω = 2π·1800/60 = 188,5 rad/s → k = m·ω² = 25 × 35.531 ≈ **888 kN/m**.',
      trap: 'Ressonância = **frequência da força igual à natural**. Não é a amplitude igual à deflexão estática, nem a força igual ao peso.',
      lab: { lab: 'vibration', preset: { mode: 1, zeta: 0.05, abs: 0, m: 50, arr: 2, k: 50, rpm: 590 }, label: 'Passar pela ressonância na bancada' },
    },
    {
      title: 'Transmissibilidade e isolamento',
      body: 'A força que chega ao piso passa pelas molas e pelo amortecedor. A **transmissibilidade** é T_{R} = F_{T}/F_{0}:\n\n**T_{R} = √(1 + (2ζr)²)/√((1 − r²)² + (2ζr)²)**\n- **r < √2**: T_{R} > 1 — a base **amplifica** a força (o pior é na ressonância);\n- **r = √2**: T_{R} = 1, qualquer que seja ζ;\n- **r > √2**: T_{R} < 1 — **isolamento**; quanto maior r, melhor.\n\nPara isolar uma máquina: **molas macias** (ω_{n} baixa, grande deflexão estática), de modo que a rotação de operação fique bem acima de √2 vezes a de ressonância. Na partida, a máquina atravessa a ressonância depressa.\n\nAcima de √2, **mais amortecimento piora o isolamento** — o amortecedor "liga" a máquina ao piso. Ele só é bom para atravessar a ressonância.',
      example: 'Sem amortecimento, T_{R} = 1/(r² − 1). Para T_{R} = 0,2 → r² = 6 → r ≈ 2,45: um ventilador a 1.800 rpm precisa de ressonância abaixo de 1800/2,45 ≈ **735 rpm**.',
      tip: '**Isolar** = frequência natural **bem abaixo** da de operação. **Fugir da ressonância** = frequência natural **longe** da de operação (acima ou abaixo).',
      lab: { lab: 'vibration', preset: { mode: 1, zeta: 0.05, abs: 0, m: 50, arr: 2, k: 50, rpm: 1500 }, label: 'Ver o isolamento na bancada' },
    },
    {
      title: 'Projeto: mudar a frequência e ler o sinal',
      hot: 'rpm → Hz no sinal de vibração (Petrobras 2018) e o período correspondente (Transpetro 2018). Subir a frequência natural 20% exige rigidez **+44%** (1,2² = 1,44) — caiu igualzinho na Transpetro 2018 e na BR 2012.',
      body: 'Como f_{n} ∝ √(k/m):\n- multiplicar a **rigidez** por a multiplica a frequência por **√a** — para subir a frequência 30 %, a rigidez sobe 1,3² − 1 = **69 %**;\n- multiplicar a **massa** por a divide a frequência por √a;\n- molas **mais rígidas** → frequência maior; base **mais pesada** → frequência menor.\n\n**Sinal de vibração**: uma máquina a n rpm tem, no espectro, uma componente na frequência de rotação **f = n/60** (Hz), de período **T = 60/n** (s). O desbalanceamento aparece justamente nela ("1× a rotação").',
      example: '2.400 rpm → f = 40 Hz → T = 0,025 s. Para levar uma ressonância de 40 Hz para 50 Hz: k_{novo}/k = (50/40)² ≈ 1,56 (+56 %).',
      lab: { lab: 'vibration', preset: { mode: 1, zeta: 0.05, abs: 0, m: 50, arr: 2, k: 50, rpm: 1200 }, label: 'Ler o sinal na bancada' },
    },
  ],
  roteiros: [
    {
      id: 'frequencia-natural',
      name: 'Frequência natural (ω_{n} = √(k/m))',
      when: 'Massa sobre molas (ou com deflexão estática); pedem a frequência natural em rad/s, Hz ou rpm, a rotação de ressonância ou a rigidez necessária.',
      steps: [
        'Junte em SI: k em N/m (kN/m × 1.000) e m em kg — ou use a deflexão estática: k/m = g/δ.',
        'ω_{n} = √(k/m), em rad/s (ou, ao contrário, k = m·ω²).',
        'Converta: f = ω/2π (Hz); n = 60·f (rpm).',
      ],
      note: 'Rigidez × 2 → frequência × √2. Para dobrar a frequência, rigidez × 4. Ressonância: rotação igual à frequência natural.',
    },
    {
      id: 'associacao-vib',
      name: 'Associação de molas (série × paralelo)',
      when: 'Molas, coxins ou isoladores combinados; pedem a rigidez equivalente.',
      steps: [
        'Veja como estão ligadas: lado a lado (mesmo deslocamento) = paralelo; uma sobre a outra (mesma força) = série.',
        'Paralelo: k_{eq} = k₁ + k₂ + ...; série: 1/k_{eq} = 1/k₁ + 1/k₂ + ...',
        'Calcule e confira: série fica abaixo da mola mais macia; paralelo, acima da mais dura.',
      ],
      note: 'Duas iguais: em série, k/2; em paralelo, 2k. Coxins nos cantos de uma máquina estão em paralelo.',
    },
    {
      id: 'amortecimento',
      name: 'Amortecimento: fração ζ e regimes',
      when: 'Sistema massa-mola-amortecedor deslocado e solto; pedem ζ, o regime ou o decremento logarítmico.',
      steps: [
        'Calcule ζ = c/c_{c}, com c_{c} = 2·√(k·m) — ou, de dois picos, δ = ln(x₁/x₂) e ζ = δ/√(4π² + δ²) ≈ δ/2π.',
        'Classifique: ζ = 0 sem amortecimento; 0 < ζ < 1 subamortecido; ζ = 1 crítico; ζ > 1 superamortecido.',
        'Conclua: só ζ < 1 oscila; o crítico volta mais rápido sem oscilar.',
      ],
      note: 'ζ depende de c, k e m — não da amplitude nem da força. Massa e mola trocam energia; só o amortecedor a dissipa.',
    },
    {
      id: 'ressonancia',
      name: 'Vibração forçada e ressonância',
      when: 'Força harmônica ou desbalanceamento; pedem quando há ressonância, a amplitude, a fase ou o efeito do amortecimento.',
      steps: [
        'Calcule a razão de frequências r = ω/ω_{n}.',
        'Localize: r ≈ 1 → ressonância (amplitude limitada só pelo amortecimento, X = (F₀/k)/(2ζ), fase de 90°); r ≪ 1 → em fase; r ≫ 1 → em oposição.',
        'Conclua — em regime permanente, o sistema vibra na frequência da **força**.',
      ],
      note: 'Na ressonância, amplitude ∝ 1/ζ. A força de desbalanceamento, m·e·ω², cresce com o quadrado da rotação.',
    },
    {
      id: 'isolamento',
      name: 'Isolamento de vibrações (transmissibilidade)',
      when: 'Máquina sobre isoladores; pedem quando a força transmitida cai, ou o efeito da rigidez e do amortecimento.',
      steps: [
        'Calcule r = ω/ω_{n} (frequência de operação ÷ natural).',
        'Só isola se r > √2 (T_{R} < 1); em r = √2, T_{R} = 1 para qualquer ζ; abaixo disso, amplifica.',
        'Na região de isolamento, molas mais macias (ω_{n} menor) e **menos** amortecimento isolam melhor.',
      ],
      note: 'O amortecimento ajuda a atravessar a ressonância na partida, mas piora o isolamento acima de √2.',
    },
  ],
  questions: [
    {
      id: 'mec-vib-01',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'No modelo massa-mola-amortecedor de uma máquina, qual elemento **retira** energia do movimento, transformando-a em calor?',
      options: [
        { text: 'O amortecedor, apenas.', why: 'Correta: a força c·ẋ se opõe à velocidade e dissipa energia.' },
        { text: 'A massa, apenas.', why: 'A massa guarda energia cinética; não dissipa.' },
        { text: 'A mola, apenas.', why: 'A mola guarda energia potencial e a devolve.' },
        { text: 'A massa e a mola.', why: 'As duas só trocam energia entre si.' },
        { text: 'A mola e o amortecedor.', why: 'A mola é conservativa.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **retira** energia, transformando-a em calor.',
        'Massa (energia cinética) e mola (energia potencial) trocam energia a cada ciclo; só o amortecedor a dissipa.',
        'Fica **o amortecedor, apenas**.',
      ],
      explanation: 'Massa (energia cinética) e mola (energia potencial) **trocam** energia a cada ciclo. Só o **amortecedor** a dissipa: sem ele, a vibração livre nunca acabaria.',
    },
    {
      id: 'mec-vib-02',
      difficulty: 1,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Um sistema de 1 grau de liberdade é deslocado e solto. O registro mostra oscilações cuja amplitude **diminui a cada ciclo** até sumir. O sistema é',
      options: [
        { text: 'subamortecido (0 < ζ < 1).', why: 'Correta: oscila, e a amplitude decai exponencialmente.' },
        { text: 'superamortecido (ζ > 1).', why: 'Superamortecido volta sem oscilar.' },
        { text: 'criticamente amortecido (ζ = 1).', why: 'No crítico também não há oscilação.' },
        { text: 'sem amortecimento (ζ = 0).', why: 'Sem amortecimento a amplitude seria constante.' },
        { text: 'instável (ζ < 0).', why: 'Instável faria a amplitude crescer.' },
      ],
      answer: 0,
      roteiro: 'amortecimento',
      steps: [
        'Pelo registro: a amplitude cai a cada ciclo — há dissipação, mas o sistema ainda oscila.',
        'Oscila e decai → 0 < ζ < 1.',
        'Fica **subamortecido**. Com ζ ≥ 1 não oscilaria; com ζ = 0 a amplitude não cairia.',
      ],
      explanation: 'Oscilar e ir morrendo é a assinatura do regime **subamortecido**: x(t) = X·e^{−ζω_{n}t}·cos(ω_{d}t − φ). Com ζ ≥ 1 não há oscilação; com ζ = 0 a amplitude não cai.',
    },
    {
      id: 'mec-vib-03',
      type: 'gen',
      difficulty: 2,
      lessonRef: 0,
      title: 'Frequência natural em hertz',
      roteiro: 'frequencia-natural',
      generate(rng) {
        const wn = pickOne(rng, [20, 25, 30, 40, 50, 60, 80, 100]);
        const m = pickOne(rng, [10, 20, 25, 40, 50, 80, 100, 200]);
        const k = m * wn * wn;
        const f = wn / TAU;
        const { options, answer } = numericOptions({
          correct: f,
          unit: 'Hz',
          digits: 2,
          correctWhy: `ω_{n} = √(${fmt(k, 0)}/${m}) = ${wn} rad/s → f_{n} = ${wn}/2π ≈ ${fmt(f, 2)} Hz.`,
          distractors: [
            { value: wn, why: 'Esse é ω_{n}, em rad/s. Para hertz, divida por 2π.' },
            { value: Math.sqrt(k / 1000 / m) / TAU, why: 'Usou k em kN/m sem converter para N/m.' },
            { value: wn * TAU, why: 'Multiplicou por 2π em vez de dividir.' },
            { value: Math.sqrt(m / k) / TAU, why: 'Inverteu a fração: é √(k/m).' },
            { value: f * 60, why: 'Isso é a frequência em rpm (ciclos por minuto), não em hertz.' },
          ],
        });
        return {
          prompt: `Um motor de ${m} kg está apoiado sobre uma base elástica de rigidez equivalente ${fmt(k / 1000, 1)} kN/m. Desprezando o amortecimento, a frequência natural do sistema, em hertz, é aproximadamente`,
          options,
          answer,
          hint: 'ω_{n} = √(k/m) com k em N/m; depois f_{n} = ω_{n}/2π.',
          steps: [
            `k = ${fmt(k / 1000, 1)} kN/m = ${fmt(k, 0)} N/m; m = ${m} kg.`,
            `ω_{n} = √(${fmt(k, 0)}/${m}) = ${wn} rad/s.`,
            `f_{n} = ${wn}/6,283 ≈ **${fmt(f, 2)} Hz** (≈ ${fmt(f * 60, 0)} rpm).`,
          ],
          explanation: `1. k = ${fmt(k / 1000, 1)} kN/m = ${fmt(k, 0)} N/m.\n2. ω_{n} = √(k/m) = √(${fmt(k, 0)}/${m}) = **${wn} rad/s**.\n3. f_{n} = ω_{n}/2π = ${wn}/6,283 ≈ **${fmt(f, 2)} Hz** (≈ ${fmt(f * 60, 0)} rpm).`,
        };
      },
    },
    {
      id: 'mec-vib-04',
      type: 'gen',
      difficulty: 2,
      lessonRef: 4,
      title: 'Rotação de ressonância',
      roteiro: 'frequencia-natural',
      generate(rng) {
        const m = pickOne(rng, [10, 15, 20, 30, 40, 60]);
        const kk = pickOne(rng, [60, 90, 120, 150, 250, 400]);
        const k = kk * 1000;
        const wn = Math.sqrt(k / m);
        const n = (wn * 60) / TAU;
        const { options, answer } = numericOptions({
          correct: n,
          unit: 'rpm',
          digits: 0,
          correctWhy: `ω_{n} = √(${fmt(k, 0)}/${m}) ≈ ${fmt(wn, 1)} rad/s → n = 60·ω_{n}/2π ≈ ${fmt(n, 0)} rpm.`,
          distractors: [
            { value: wn, why: 'Esse número é ω_{n} em rad/s, não a rotação em rpm.' },
            { value: wn * 60, why: 'Multiplicou ω_{n} por 60 sem dividir por 2π: rad/s × 60 não é rpm.' },
            { value: n / 60, why: 'Essa é a frequência em hertz (rotações por segundo).' },
            { value: (Math.sqrt(kk / m) * 60) / TAU, why: 'Usou k em kN/m sem converter para N/m.' },
          ],
        });
        return {
          prompt: `Um motor de rotação variável, com ${m} kg, está montado sobre molas de rigidez equivalente ${kk} kN/m. Desprezando o amortecimento, ele entrará em ressonância quando girar a, aproximadamente,`,
          options,
          answer,
          hint: 'Ressonância: rotação (em rad/s) igual a ω_{n} = √(k/m). Depois converta: n = 60·ω/2π.',
          steps: [
            `k = ${kk} kN/m = ${fmt(k, 0)} N/m; m = ${m} kg.`,
            `ω_{n} = √(${fmt(k, 0)}/${m}) ≈ ${fmt(wn, 1)} rad/s.`,
            `Ressonância quando a rotação iguala ω_{n}: f ≈ ${fmt(wn / TAU, 2)} Hz → n ≈ **${fmt(n, 0)} rpm**.`,
          ],
          explanation: `1. ω_{n} = √(k/m) = √(${fmt(k, 0)}/${m}) ≈ **${fmt(wn, 1)} rad/s**.\n2. f_{n} = ω_{n}/2π ≈ ${fmt(wn / TAU, 2)} Hz.\n3. n = 60·f_{n} ≈ **${fmt(n, 0)} rpm**.`,
        };
      },
    },
    {
      id: 'mec-vib-05',
      type: 'gen',
      difficulty: 3,
      lessonRef: 4,
      title: 'Rigidez de cada mola para uma ressonância',
      roteiro: 'frequencia-natural',
      generate(rng) {
        const m = pickOne(rng, [12, 15, 18, 24, 30, 40]);
        const N = pickOne(rng, [2, 3, 4]);
        const n = pickOne(rng, [900, 1000, 1500, 1800, 2400]);
        const w = (TAU * n) / 60;
        const ktot = m * w * w;
        const each = ktot / N / 1000;
        const { options, answer } = numericOptions({
          correct: each,
          unit: 'kN/m',
          digits: 1,
          correctWhy: `k_{eq} = m·ω² ≈ ${fmt(ktot / 1000, 1)} kN/m, repartida entre ${N} molas: ≈ ${fmt(each, 1)} kN/m cada.`,
          distractors: [
            { value: ktot / 1000, why: `Essa é a rigidez das ${N} molas juntas; em paralelo elas se somam, então cada uma tem 1/${N} disso.` },
            { value: (ktot * N) / 1000, why: 'Multiplicou por N em vez de dividir.' },
            { value: (m * (n / 60) ** 2) / N / 1000, why: 'Usou a frequência em hertz no lugar de ω: faltou o 2π.' },
            { value: (m * w) / N / 1000, why: 'Faltou elevar ω ao quadrado: k = m·ω².' },
          ],
        });
        return {
          prompt: `Um motor de ${m} kg será apoiado sobre ${N} molas iguais, em paralelo, e entraria em ressonância a ${fmt(n, 0)} rpm. Desprezando o amortecimento, a rigidez de **cada** mola é, aproximadamente,`,
          options,
          answer,
          hint: 'ω = 2π·n/60; a rigidez equivalente é m·ω²; em paralelo, k_{eq} = N·k.',
          steps: [
            `Rotação de ressonância: ω = 2π × ${fmt(n, 0)}/60 ≈ ${fmt(w, 1)} rad/s.`,
            `k_{eq} = m·ω² = ${m} × ${fmt(w * w, 0)} ≈ ${fmt(ktot / 1000, 1)} kN/m.`,
            { do: 'Divida entre as molas em paralelo: k_{eq} = N·k.', show: `k = ${fmt(ktot / 1000, 1)}/${N} ≈ **${fmt(each, 1)} kN/m** cada.` },
          ],
          explanation: `1. ω = 2π·${fmt(n, 0)}/60 ≈ ${fmt(w, 1)} rad/s.\n2. Ressonância: ω_{n} = ω → k_{eq} = m·ω² = ${m} × ${fmt(w * w, 0)} ≈ **${fmt(ktot / 1000, 1)} kN/m**.\n3. ${N} molas em paralelo: k = k_{eq}/${N} ≈ **${fmt(each, 1)} kN/m**.`,
        };
      },
    },
    {
      id: 'mec-vib-06',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Duas molas em série',
      roteiro: 'associacao-vib',
      generate(rng) {
        const [k1, k2] = pickOne(rng, [
          [20, 30],
          [30, 60],
          [40, 60],
          [60, 90],
          [50, 200],
          [60, 120],
          [80, 120],
        ]);
        const keq = (k1 * k2) / (k1 + k2);
        const { options, answer } = numericOptions({
          correct: keq,
          unit: 'kN/m',
          digits: 1,
          correctWhy: `k_{eq} = k_{1}·k_{2}/(k_{1} + k_{2}) = ${k1}·${k2}/${k1 + k2} = ${fmt(keq, 1)} kN/m.`,
          distractors: [
            { value: k1 + k2, why: 'Somou as rigidezes: essa é a regra das molas em **paralelo**.' },
            { value: (k1 + k2) / 2, why: 'A média não é a regra de nenhuma associação.' },
            { value: Math.min(k1, k2), why: 'Em série, a rigidez equivalente é **menor** que a menor das duas.' },
            { value: Math.abs(k2 - k1), why: 'Diferença entre as rigidezes não tem significado físico aqui.' },
          ],
        });
        return {
          prompt: `Uma máquina repousa sobre um coxim de borracha de ${k1} kN/m, que por sua vez está apoiado numa mola de aço de ${k2} kN/m (os dois elementos estão em série). A rigidez equivalente do apoio é`,
          options,
          answer,
          hint: 'Em série, a força é a mesma nos dois elementos e os deslocamentos se somam: some os inversos.',
          steps: [
            `Coxim de ${k1} kN/m apoiado na mola de ${k2} kN/m: um sobre o outro = **série**.`,
            `1/k_{eq} = 1/${k1} + 1/${k2}.`,
            `k_{eq} = ${k1} × ${k2}/(${k1} + ${k2}) ≈ **${fmt(keq, 1)} kN/m** — menor que a mais macia.`,
          ],
          explanation: `Em série: 1/k_{eq} = 1/${k1} + 1/${k2} → k_{eq} = ${k1}·${k2}/(${k1} + ${k2}) = ${k1 * k2}/${k1 + k2} ≈ **${fmt(keq, 1)} kN/m** — menor que a mais macia das duas.`,
        };
      },
    },
    {
      id: 'mec-vib-07',
      type: 'gen',
      difficulty: 2,
      lessonRef: 6,
      title: 'Rigidez para mudar a frequência natural',
      roteiro: 'frequencia-natural',
      generate(rng) {
        const up = rng() < 0.6;
        const p = up ? pickOne(rng, [10, 25, 30, 40, 50]) : pickOne(rng, [10, 20, 30, 40]);
        const q = p / 100;
        const ratio = up ? (1 + q) ** 2 : (1 - q) ** 2;
        const correct = Math.abs(ratio - 1) * 100;
        const { options, answer } = numericOptions({
          correct,
          unit: '%',
          digits: 0,
          correctWhy: `k ∝ f²: (${fmt(up ? 1 + q : 1 - q, 2)})² = ${fmt(ratio, 4)} → ${up ? 'aumento' : 'redução'} de ${fmt(correct, 0)} %.`,
          distractors: [
            { value: p, why: 'A frequência não é proporcional a k, e sim a √k.' },
            { value: 2 * p, why: `Dobrou a porcentagem: (1 ${up ? '+' : '−'} p)² = 1 ${up ? '+' : '−'} 2p + p² — faltou o p².` },
            { value: Math.abs(Math.sqrt(up ? 1 + q : 1 - q) - 1) * 100, why: 'Tirou a raiz em vez de elevar ao quadrado.' },
            { value: Math.abs((up ? 1 + q : 1 - q) ** 3 - 1) * 100, why: 'k varia com o quadrado da frequência, não com o cubo.' },
          ],
        });
        return {
          prompt: up
            ? `Um motor sobre molas opera perto da ressonância. Para **aumentar** a frequência natural em ${p} %, sem mudar a massa, a rigidez das molas deve aumentar, aproximadamente,`
            : `Para **reduzir** em ${p} % a frequência natural de um equipamento apoiado em molas, sem mudar a massa, a rigidez das molas deve ser reduzida em, aproximadamente,`,
          options,
          answer,
          hint: 'f_{n} = (1/2π)·√(k/m) → com a massa fixa, k é proporcional a f².',
          steps: [
            { do: 'Com a massa fixa, f ∝ √k → k ∝ f².', show: `k_{novo}/k = (f_{novo}/f)².` },
            { do: 'Aplique a mudança de frequência.', show: `(${fmt(up ? 1 + q : 1 - q, 2)})² = ${fmt(ratio, 4)}.` },
            { do: 'Converta em porcentagem.', show: `A rigidez ${up ? 'aumenta' : 'diminui'} **${fmt(correct, 0)} %**.` },
          ],
          explanation: `Com m constante, k_{novo}/k = (f_{novo}/f)² = (${fmt(up ? 1 + q : 1 - q, 2)})² = ${fmt(ratio, 4)}.\n\nOu seja, a rigidez ${up ? 'aumenta' : 'diminui'} **${fmt(correct, 0)} %**.`,
        };
      },
    },
    {
      id: 'mec-vib-08',
      type: 'gen',
      difficulty: 1,
      lessonRef: 6,
      title: 'Frequência e período do sinal de uma máquina',
      roteiro: 'frequencia-natural',
      generate(rng) {
        const n = pickOne(rng, [600, 900, 1200, 1800, 2400, 3000, 3600]);
        const askT = rng() < 0.5;
        if (!askT) {
          const f = n / 60;
          const { options, answer } = numericOptions({
            correct: f,
            unit: 'Hz',
            digits: 1,
            correctWhy: `f = n/60 = ${n}/60 = ${fmt(f, 1)} Hz.`,
            distractors: [
              { value: (n * TAU) / 60, why: 'Esse é ω em rad/s; em hertz basta dividir n por 60.' },
              { value: 60 / n, why: 'Esse é o período (em s), o inverso da frequência.' },
              { value: f / TAU, why: 'Dividiu por 2π à toa: n/60 já é a frequência em Hz.' },
              { value: n, why: 'n está em rotações por **minuto**; hertz é por **segundo**.' },
            ],
          });
          return {
            prompt: `O espectro de vibração de um ventilador mostra uma componente que corresponde à própria rotação do motor, ${fmt(n, 0)} rpm. A frequência dessa componente é`,
            options,
            answer,
            hint: 'Uma volta por rotação: converta rotações por minuto em rotações por segundo.',
            steps: [
              { do: 'Uma oscilação por volta: a frequência é a rotação em voltas por segundo.', show: `f = ${fmt(n, 0)} rpm ÷ 60.` },
              { do: 'Calcule a frequência em Hz.', show: `f = **${fmt(f, 1)} Hz**.` },
              { do: 'Se pedissem em rad/s: ω = 2π·f.', show: `ω ≈ ${fmt((n * TAU) / 60, 1)} rad/s.` },
            ],
            explanation: `${fmt(n, 0)} rpm = ${fmt(n, 0)}/60 rotações por segundo = **${fmt(f, 1)} Hz**. (Em rad/s seria ${fmt((n * TAU) / 60, 1)}.)`,
          };
        }
        const T = 60 / n;
        const { options, answer } = numericOptions({
          correct: T,
          unit: 's',
          digits: 4,
          correctWhy: `T = 1/f = 60/n = 60/${n} ≈ ${fmt(T, 4)} s.`,
          distractors: [
            { value: n / 60, why: 'Essa é a frequência (Hz), não o período.' },
            { value: (TAU * 60) / n, why: 'Usou 2π/f: essa conta só vale com ω em rad/s.' },
            { value: 1 / n, why: 'Tratou rpm como rotações por segundo.' },
            { value: 60 / n / TAU, why: 'Período é 1/f = 60/n, sem 2π.' },
          ],
        });
        return {
          prompt: `No sinal de vibração de uma bomba que gira a ${fmt(n, 0)} rpm, aparece uma oscilação na frequência de rotação. O período dessa oscilação é`,
          options,
          answer,
          hint: 'Período = tempo de uma volta.',
          steps: [
            { do: 'Ache a frequência da rotação: f = n/60.', show: `f = ${fmt(n, 0)}/60 = ${fmt(n / 60, 1)} Hz.` },
            { do: 'Período = tempo de uma volta: T = 1/f.', show: `T = 60/${fmt(n, 0)}.` },
            { do: 'Calcule.', show: `T ≈ **${fmt(T, 4)} s**.` },
          ],
          explanation: `f = ${fmt(n, 0)}/60 = ${fmt(n / 60, 1)} Hz → T = 1/f = 60/${fmt(n, 0)} ≈ **${fmt(T, 4)} s**.`,
        };
      },
    },
    {
      id: 'mec-vib-09',
      type: 'gen',
      difficulty: 2,
      lessonRef: 0,
      title: 'Frequência natural pela deflexão estática',
      roteiro: 'frequencia-natural',
      generate(rng) {
        const d = pickOne(rng, [1, 2, 2.5, 4, 5, 10, 25]);
        const g = 10;
        const wn = Math.sqrt(g / (d / 1000));
        const f = wn / TAU;
        const { options, answer } = numericOptions({
          correct: f,
          unit: 'Hz',
          digits: 2,
          correctWhy: `ω_{n} = √(g/δ) = √(10/${fmt(d / 1000, 4)}) ≈ ${fmt(wn, 1)} rad/s → f_{n} ≈ ${fmt(f, 2)} Hz.`,
          distractors: [
            { value: wn, why: 'Esse é ω_{n} em rad/s.' },
            { value: Math.sqrt(g / d) / TAU, why: 'Usou δ em mm sem converter para metros.' },
            { value: Math.sqrt(d / 1000 / g) / TAU, why: 'Inverteu a fração: é √(g/δ).' },
            { value: f * 60, why: 'Isso é a frequência em rpm.' },
          ],
        });
        return {
          prompt: `Ao ser colocado sobre seus isoladores, um compressor faz as molas cederem ${fmt(d, 1)} mm. Com g = 10 m/s², a frequência natural vertical do conjunto é, aproximadamente,`,
          options,
          answer,
          hint: 'k·δ = m·g → k/m = g/δ. Então ω_{n} = √(g/δ).',
          steps: [
            `δ = ${fmt(d, 1)} mm → k/m = g/δ = 10/${fmt(d / 1000, 4)}.`,
            `ω_{n} = √(10/${fmt(d / 1000, 4)}) ≈ ${fmt(wn, 1)} rad/s.`,
            `f_{n} = ω_{n}/2π ≈ **${fmt(f, 2)} Hz** — sem precisar da massa nem da rigidez.`,
          ],
          explanation: `1. No equilíbrio, k·δ = m·g → k/m = g/δ.\n2. ω_{n} = √(g/δ) = √(10/${fmt(d / 1000, 4)}) ≈ **${fmt(wn, 1)} rad/s**.\n3. f_{n} = ω_{n}/2π ≈ **${fmt(f, 2)} Hz**.\n\nNão é preciso saber a massa nem a rigidez: só quanto a mola cedeu.`,
        };
      },
    },
    {
      id: 'mec-vib-10',
      type: 'gen',
      difficulty: 3,
      lessonRef: 3,
      title: 'Amortecimento pelo decremento logarítmico',
      roteiro: 'amortecimento',
      generate(rng) {
        const [a, b] = pickOne(rng, [
          [10, 8],
          [6, 4],
          [5, 3],
          [9, 6],
          [8, 5],
          [4, 3],
          [10, 6],
        ]);
        const dl = Math.log(a / b);
        const z = dl / Math.sqrt(TAU * TAU + dl * dl);
        const { options, answer } = numericOptions({
          correct: z,
          digits: 3,
          correctWhy: `δ = ln(${a}/${b}) ≈ ${fmt(dl, 3)} → ζ = δ/√(4π² + δ²) ≈ ${fmt(z, 3)}.`,
          distractors: [
            { value: dl, why: 'Esse é o decremento δ; ζ ≈ δ/2π.' },
            { value: dl / Math.PI, why: 'Dividiu por π em vez de 2π.' },
            { value: b / a, why: 'A razão entre os picos não é ζ: tire o logaritmo e divida por 2π.' },
            { value: (a - b) / a, why: 'A queda relativa entre picos não é ζ.' },
          ],
        });
        return {
          prompt: `Uma estrutura leva uma pancada e vibra livremente. Dois picos sucessivos do deslocamento medem ${a} mm e ${b} mm. A fração de amortecimento ζ é, aproximadamente,`,
          options,
          answer,
          hint: 'δ = ln(x₁/x₂) e δ ≈ 2πζ quando o amortecimento é pequeno.',
          steps: [
            { do: 'Decremento logarítmico de dois picos sucessivos: δ = ln(x₁/x₂).', show: `δ = ln(${a}/${b}) ≈ ${fmt(dl, 3)}.` },
            { do: 'Converta em fração de amortecimento: ζ = δ/√(4π² + δ²) (≈ δ/2π, se for pequeno).', show: `ζ ≈ ${fmt(dl, 3)}/${fmt(Math.sqrt(TAU * TAU + dl * dl), 3)}.` },
            { do: 'Calcule e classifique.', show: `ζ ≈ **${fmt(z, 3)}** (δ/2π daria ${fmt(dl / TAU, 3)}): subamortecido.` },
          ],
          explanation: `1. δ = ln(x_{1}/x_{2}) = ln(${a}/${b}) ≈ **${fmt(dl, 3)}**.\n2. ζ = δ/√(4π² + δ²) ≈ ${fmt(dl, 3)}/${fmt(Math.sqrt(TAU * TAU + dl * dl), 3)} ≈ **${fmt(z, 3)}** (a aproximação δ/2π dá ${fmt(dl / TAU, 3)}).`,
        };
      },
    },
    {
      id: 'mec-vib-11',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'A fração de amortecimento ζ de um sistema massa-mola-amortecedor depende',
      options: [
        { text: 'da constante de amortecimento, da rigidez e da massa.', why: 'Correta: ζ = c/(2√(k·m)).' },
        { text: 'apenas da constante de amortecimento.', why: 'O mesmo c dá ζ diferente em sistemas diferentes.' },
        { text: 'apenas da massa e da rigidez.', why: 'Sem c não há amortecimento algum.' },
        { text: 'da amplitude inicial do movimento.', why: 'No modelo linear, ζ não depende da amplitude.' },
        { text: 'da frequência da força aplicada.', why: 'ζ é propriedade do sistema, não da excitação.' },
      ],
      answer: 0,
      roteiro: 'amortecimento',
      steps: [
        'ζ = c/c_{c}, com c_{c} = 2·√(k·m).',
        'Entram c (dissipação), k (rigidez) e m (massa).',
        'Fica **da constante de amortecimento, da rigidez e da massa** — não da amplitude nem da força.',
      ],
      explanation: '**ζ = c/c_{c} = c/(2·√(k·m))**: envolve a dissipação (c), a flexibilidade (k) e a inércia (m). É uma propriedade do sistema — não depende da força nem das condições iniciais.',
    },
    {
      id: 'mec-vib-12',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Um motor com desbalanceamento está apoiado em molas, com amortecimento desprezível. Aumentando lentamente a rotação, de zero até bem acima da frequência natural, a amplitude de vibração do motor',
      options: [
        { text: 'cresce até um máximo quando a rotação coincide com a frequência natural e depois diminui, tendendo a um valor constante.', why: 'Correta: X → m_{d}·e/m em alta rotação.' },
        { text: 'cresce continuamente com a rotação.', why: 'Depois da ressonância ela cai.' },
        { text: 'diminui continuamente com a rotação.', why: 'Em rotação baixa a força é pequena e a amplitude também.' },
        { text: 'não depende da rotação.', why: 'A força de desbalanceamento cresce com ω² e a resposta depende de r.' },
        { text: 'é máxima com o motor parado.', why: 'Parado, não há força de desbalanceamento.' },
      ],
      answer: 0,
      roteiro: 'ressonancia',
      steps: [
        'Rotação subindo de zero até bem acima de ω_{n}: r varre de 0 a muito mais que 1.',
        'Em r = 1 há ressonância (sem amortecimento, a amplitude dispara); muito acima, X tende a m_{d}·e/m.',
        'Fica **cresce até um máximo na frequência natural e depois cai, tendendo a um valor constante**.',
      ],
      explanation: 'A força de desbalanceamento é m_{d}·e·ω². A amplitude é X = (m_{d}·e/m)·r²/|1 − r²| (sem amortecimento): cresce, explode em **r = 1** (ressonância) e depois cai, tendendo a **m_{d}·e/m** em alta rotação — o motor gira "em torno do centro de massa do conjunto".',
    },
    {
      id: 'mec-vib-13',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Para que os isoladores de um ventilador **reduzam** a força transmitida ao piso, a razão entre a frequência de operação e a frequência natural do conjunto deve ser',
      options: [
        { text: 'maior que √2.', why: 'Correta: só então T_{R} < 1.' },
        { text: 'igual a 1.', why: 'Isso é a ressonância: a pior situação.' },
        { text: 'menor que 1.', why: 'Abaixo da ressonância T_{R} > 1.' },
        { text: 'entre 1 e √2.', why: 'Nessa faixa T_{R} ainda é maior que 1.' },
        { text: 'igual a √2.', why: 'Em r = √2, T_{R} = 1: nem amplifica nem isola.' },
      ],
      answer: 0,
      roteiro: 'isolamento',
      steps: [
        'Isoladores: o que importa é r = ω/ω_{n}.',
        'T_{R} < 1 só para r > √2.',
        'Fica **maior que √2** — por isso isoladores são molas macias.',
      ],
      explanation: 'T_{R} = √(1 + (2ζr)²)/√((1 − r²)² + (2ζr)²) só fica abaixo de 1 para **r > √2**. Por isso isoladores são molas **macias**: baixam ω_{n} e aumentam r.',
    },
    {
      id: 'mec-vib-14',
      difficulty: 3,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Uma bomba opera com razão de frequências r = 3 sobre isoladores. Trocá-los por outros de **mesma rigidez**, mas com **amortecimento maior**, faz a força transmitida ao piso',
      options: [
        { text: 'aumentar, porque acima de r = √2 o amortecimento piora o isolamento.', why: 'Correta: o termo 2ζr cresce no numerador de T_{R}.' },
        { text: 'diminuir, porque amortecimento sempre reduz vibração.', why: 'Só reduz perto da ressonância.' },
        { text: 'continuar igual, porque a rigidez não mudou.', why: 'T_{R} depende de ζ também.' },
        { text: 'cair a zero.', why: 'Nenhum isolador passivo zera a força.' },
        { text: 'mudar, porque a frequência natural ficou maior.', why: 'O amortecimento não muda ω_{n}.' },
      ],
      answer: 0,
      roteiro: 'isolamento',
      steps: [
        'r = 3: já na região de isolamento.',
        'Acima de √2, a força que passa pelo amortecedor (c·ω·X) pesa: mais ζ, maior T_{R}.',
        'Fica **aumentar** (ζ = 0,05 → T_{R} ≈ 0,13; ζ = 0,5 → ≈ 0,37).',
      ],
      explanation: 'Na região de isolamento, a força que passa pelo amortecedor (c·ω·X) pesa mais que a das molas: com r = 3, T_{R} ≈ 0,13 para ζ = 0,05, mas ≈ 0,37 para ζ = 0,5. O amortecimento é útil para **atravessar** a ressonância na partida e na parada.',
    },
    {
      id: 'mec-vib-15',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Em qual situação um sistema massa-mola **pouco amortecido** está em ressonância?',
      options: [
        { text: 'Quando a frequência da força de excitação é igual à sua frequência natural.', why: 'Correta: r = 1.' },
        { text: 'Quando a amplitude de vibração é igual à deflexão estática.', why: 'Isso acontece em r ≈ 0, não na ressonância.' },
        { text: 'Quando a amplitude da força é igual ao peso do sistema.', why: 'A ressonância não depende do valor da força.' },
        { text: 'Quando a frequência natural é maior que a de excitação.', why: 'Isso é operar abaixo da ressonância.' },
        { text: 'Quando a frequência de excitação é o dobro da natural.', why: 'Em r = 2 já se está na região de isolamento.' },
      ],
      answer: 0,
      roteiro: 'ressonancia',
      steps: [
        'Ressonância é questão de **frequência**: r = ω/ω_{n}.',
        'Em r = 1 a força empurra no ritmo do sistema, e a amplitude só é limitada pelo amortecimento.',
        'Fica **frequência da excitação igual à frequência natural**.',
      ],
      explanation: '**Ressonância**: a força "empurra no ritmo" do sistema (ω = ω_{n}). A cada ciclo entra mais energia do que o pouco amortecimento dissipa, e a amplitude fica limitada só por ele: X = (F_{0}/k)/(2ζ).',
    },
    {
      id: 'mec-vib-16',
      difficulty: 2,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'A rigidez das molas de um equipamento é **duplicada**, com a massa mantida. A frequência natural',
      options: [
        { text: 'é multiplicada por √2 (sobe cerca de 41 %).', why: 'Correta: f ∝ √k.' },
        { text: 'dobra.', why: 'Seria se f fosse proporcional a k.' },
        { text: 'cai à metade.', why: 'Mola mais rígida dá frequência maior, não menor.' },
        { text: 'é dividida por √2.', why: 'Isso aconteceria dobrando a massa.' },
        { text: 'não muda.', why: 'ω_{n} = √(k/m) depende de k.' },
      ],
      answer: 0,
      roteiro: 'frequencia-natural',
      steps: [
        'Massa igual; rigidez k → 2k.',
        'ω_{n} = √(k/m) → √(2k/m) = √2·ω_{n}.',
        'Multiplica por **√2** (≈ +41 %); para dobrar, a rigidez teria de ser multiplicada por 4.',
      ],
      explanation: 'ω_{n} = √(k/m): com 2k, ω_{n} fica √2 ≈ 1,41 vez maior. Para **dobrar** a frequência, a rigidez teria de ser multiplicada por **4**.',
    },
    {
      id: 'mec-vib-17',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Para um motor de 50 kg sobre molas de rigidez equivalente 500 kN/m, calcula-se √(k/m) = 100. Esse valor é a frequência natural expressa em',
      options: [
        { text: 'rad/s.', why: 'Correta: √(N/m ÷ kg) = √(1/s²) = 1/s, ou rad/s.' },
        { text: 'Hz.', why: 'Em Hz seria 100/2π ≈ 15,9.' },
        { text: 'rpm.', why: 'Em rpm seria 60·15,9 ≈ 955.' },
        { text: 'ciclos por minuto.', why: 'Ciclos por minuto é o mesmo que rpm.' },
        { text: 'Hz/s.', why: 'Não é unidade de frequência.' },
      ],
      answer: 0,
      roteiro: 'frequencia-natural',
      steps: [
        'k em N/m (500.000) e m em kg (50): unidades do SI.',
        '√(k/m) = √(500.000/50) = 100 → em **rad/s** (frequência angular).',
        'Em Hz seria 100/2π ≈ 15,9; em rpm, ≈ 955. Fica **rad/s**.',
      ],
      explanation: '√(k/m) com k em N/m e m em kg dá **rad/s** (frequência **angular** ω_{n}). Para a frequência em hertz, divida por 2π (≈ 15,9 Hz); em rpm, multiplique isso por 60 (≈ 955 rpm).',
    },
    {
      id: 'mec-vib-18',
      type: 'ce',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Com amortecimento crítico, o sistema deslocado e solto volta à posição de equilíbrio sem oscilar e mais depressa do que em qualquer caso superamortecido.',
      answer: true,
      roteiro: 'amortecimento',
      steps: [
        'ζ = 1: amortecimento crítico.',
        'ζ = 1 é a fronteira: não oscila; com ζ > 1 também não oscila, mas volta mais devagar.',
        'Retorno mais rápido sem oscilar: **Certo**.',
      ],
      explanation: 'Certo. ζ = 1 é a fronteira: é o retorno **mais rápido sem oscilação**. Com ζ > 1 também não oscila, mas a volta é mais lenta. Por isso, ponteiros de instrumentos e fechadores de porta são projetados perto do crítico.',
    },
    {
      id: 'mec-vib-19',
      type: 'ce',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Em regime permanente, um sistema de 1 grau de liberdade sob força harmônica vibra na sua frequência natural, qualquer que seja a frequência da força.',
      answer: false,
      roteiro: 'ressonancia',
      steps: [
        'Força harmônica de frequência ω, qualquer.',
        'A frequência natural aparece no transitório (que o amortecimento apaga) e marca onde fica a ressonância.',
        'Em regime permanente, o sistema vibra na frequência da **força**: **Errado**.',
      ],
      explanation: 'Errado. Em regime permanente, a resposta tem a **frequência da força**. A frequência natural aparece no **transitório** (que o amortecimento apaga) e define **onde** fica a ressonância.',
    },
    {
      id: 'mec-vib-20',
      type: 'ce',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Duas molas iguais, de rigidez k, associadas em série equivalem a uma única mola de rigidez 2k.',
      answer: false,
      roteiro: 'associacao-vib',
      steps: [
        'Duas molas iguais em **série** (uma depois da outra, mesma força).',
        '1/k_{eq} = 1/k + 1/k = 2/k.',
        'k_{eq} = k/2 — 2k seria em paralelo: **Errado**.',
      ],
      explanation: 'Errado. Em série, 1/k_{eq} = 1/k + 1/k = 2/k → **k_{eq} = k/2**. A rigidez 2k é a de duas molas iguais em **paralelo**.',
    },
    {
      id: 'mec-vib-21',
      type: 'ce',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Se a frequência de operação for exatamente √2 vezes a frequência natural, a força transmitida ao piso é igual à força de excitação, qualquer que seja o amortecimento.',
      answer: true,
      roteiro: 'isolamento',
      steps: [
        'r = √2.',
        '(1 − r²)² = 1 → T_{R} = √(1 + (2ζr)²)/√(1 + (2ζr)²) = 1.',
        'Vale para qualquer ζ: **Certo**.',
      ],
      explanation: 'Certo. Com r = √2, (1 − r²)² = 1 e T_{R} = √(1 + (2ζr)²)/√(1 + (2ζr)²) = **1** para qualquer ζ: todas as curvas de transmissibilidade passam por esse ponto.',
    },
    {
      id: 'mec-vib-22',
      type: 'ce',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Na ressonância, o deslocamento de um sistema de 1 grau de liberdade fica atrasado 90° em relação à força de excitação.',
      answer: true,
      roteiro: 'ressonancia',
      steps: [
        'Na ressonância, r = 1.',
        'tg φ = 2ζr/(1 − r²): com r = 1, o denominador zera → φ = 90°, para qualquer ζ.',
        '**Certo**.',
      ],
      explanation: 'Certo. A fase é tan φ = 2ζr/(1 − r²): em r = 1, φ = **90°** para qualquer ζ. Abaixo da ressonância a resposta está quase em fase com a força; muito acima, quase em oposição (180°).',
    },
    {
      id: 'mec-vib-23',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Em ressonância e com ζ = 0,05, a amplitude de um equipamento é 10 vezes a deflexão "estática" F₀/k. Se o amortecimento cair para ζ = 0,02, a amplitude na ressonância passa a ser',
      options: [
        { text: '25 vezes F₀/k.', why: 'Correta: 1/(2 × 0,02) = 25.' },
        { text: '4 vezes F₀/k.', why: 'Menos amortecimento aumenta a amplitude na ressonância.' },
        { text: '10 vezes F₀/k (não muda).', why: 'Na ressonância, só o amortecimento limita a amplitude.' },
        { text: '50 vezes F₀/k.', why: 'Esqueceu o fator 2: X = (F₀/k)/(2ζ).' },
        { text: '2,5 vezes F₀/k.', why: 'Inverteu a proporção.' },
      ],
      answer: 0,
      roteiro: 'ressonancia',
      steps: [
        'Na ressonância, r = 1.',
        'X = (F₀/k)/(2ζ): com ζ = 0,05, dá 10·F₀/k (confere com o enunciado).',
        'Com ζ = 0,02: 1/(2 × 0,02) = **25·F₀/k**.',
      ],
      explanation: 'Na ressonância, X = (F_{0}/k)/(2ζ): com ζ = 0,05 → 10·F_{0}/k; com ζ = 0,02 → **25·F_{0}/k**. A amplitude é inversamente proporcional ao amortecimento.',
    },
    {
      id: 'mec-vib-24',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Um compressor está apoiado sobre **quatro coxins elásticos** iguais, de rigidez k, um em cada canto, e é estudado com um modelo de 1 grau de liberdade (só sobe e desce). A mola única desse modelo equivale aos quatro coxins combinados',
      options: [
        { text: 'em paralelo: k_{eq} = 4·k.', why: 'Correta: os quatro sofrem o mesmo deslocamento, e as forças se somam.' },
        { text: 'em série: k_{eq} = k/4.', why: 'Em série, a mesma força passaria por todos, um apoiado sobre o outro — não é o caso de apoios lado a lado.' },
        { text: 'dois a dois em série, com os pares em paralelo: k_{eq} = k.', why: 'Nenhum coxim está apoiado sobre outro: todos ligam a máquina direto à base.' },
        { text: 'os da frente em paralelo e os de trás em série.', why: 'Todos os apoios trabalham do mesmo jeito: com o mesmo deslocamento.' },
        { text: 'pela média das rigidezes: k_{eq} = k.', why: 'A rigidez equivalente não é a média: as forças dos quatro apoios se somam.' },
      ],
      answer: 0,
      roteiro: 'associacao-vib',
      steps: [
        'Os quatro coxins ficam lado a lado entre a máquina e a base: todos deformam o mesmo x → **paralelo**.',
        'k_{eq} = k + k + k + k.',
        '**k_{eq} = 4·k**.',
      ],
      explanation: 'Os coxins estão **lado a lado** entre a máquina e a base: se o compressor desce x, **todos** deformam x, e as forças se somam → k_{eq} = k_{1} + k_{2} + k_{3} + k_{4} = **4·k**. Série seria uma mola apoiada **sobre** a outra, com a mesma força nas duas — como a mola da suspensão apoiada no pneu.',
    },
    {
      id: 'mec-vib-25',
      difficulty: 1,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Um sistema massa-mola-amortecedor é deslocado da posição de equilíbrio e solto. Ele volta ao equilíbrio **sem oscilar** quando',
      options: [
        { text: 'a fração de amortecimento ζ é maior ou igual a 1.', why: 'Correta: com ζ ≥ 1 (crítico ou superamortecido) não há oscilação.' },
        { text: 'a fração de amortecimento ζ está entre 0 e 1.', why: 'Esse é o regime subamortecido: oscila com amplitude decrescente.' },
        { text: 'o deslocamento inicial é menor que a deflexão estática.', why: 'Num sistema linear, o tipo de resposta não depende do tamanho do deslocamento inicial.' },
        { text: 'a rigidez da mola é muito alta.', why: 'Mais rigidez aumenta c_{c} = 2·√(k·m) e, com o mesmo amortecedor, diminui ζ: oscila mais.' },
        { text: 'não há amortecimento.', why: 'Sem amortecimento, oscila para sempre com amplitude constante.' },
      ],
      answer: 0,
      roteiro: 'amortecimento',
      steps: [
        'Quem decide o tipo de resposta é ζ = c/(2·√(k·m)).',
        'ζ = 0 e 0 < ζ < 1 oscilam; ζ = 1 e ζ > 1 não.',
        'Fica **ζ maior ou igual a 1**. O deslocamento inicial só muda a escala.',
      ],
      explanation: 'Quem decide é **ζ = c/c_{c}**, com c_{c} = 2·√(k·m):\n- ζ = 0 → oscila com amplitude constante;\n- 0 < ζ < 1 → oscila, e a amplitude cai (**subamortecido**);\n- ζ = 1 → volta sem oscilar, no menor tempo (**crítico**);\n- ζ > 1 → volta sem oscilar, mais devagar (**superamortecido**).\n\nO deslocamento inicial só muda a escala da resposta, não o seu tipo.',
    },
    {
      id: 'mec-vib-26',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      shuffle: false,
      prompt: 'Um sistema massa-mola-amortecedor recebe um deslocamento inicial e é solto.\n\nI – Com fração de amortecimento nula, a amplitude da oscilação permanece constante.\nII – Com fração de amortecimento entre 0 e 1, o sistema oscila com amplitude decrescente.\nIII – Com fração de amortecimento maior que 1, o sistema também oscila com amplitude decrescente, mas a amplitude cai mais depressa que no caso II.\n\nEstá correto o que se afirma em',
      options: [
        { text: 'I, apenas', why: 'II também está correta: é o regime subamortecido.' },
        { text: 'III, apenas', why: 'III é falsa: com ζ > 1 não há oscilação.' },
        { text: 'I e II, apenas', why: 'Correta: I (ζ = 0) e II (subamortecido) descrevem bem a resposta livre.' },
        { text: 'II e III, apenas', why: 'III é falsa: o sistema superamortecido não oscila.' },
        { text: 'I, II e III', why: 'III é falsa: com ζ > 1 o sistema volta ao equilíbrio sem oscilar.' },
      ],
      answer: 2,
      roteiro: 'fmt.afirmativas',
      steps: [
        'I – **Correta**: sem dissipação, a energia só troca de forma e a amplitude não cai.',
        'II – **Correta**: o subamortecido oscila em ω_{d}, com amplitude caindo como e^{−ζω_{n}t}.',
        'III – **Errada**: com ζ > 1 (superamortecido) **não há oscilação**; o sistema volta devagar.',
        'Certas: I e II → "I e II, apenas".',
      ],
      explanation: '**I** – Correta: sem dissipação, a energia só troca de forma (cinética ↔ potencial), e a amplitude não cai. **II** – Correta: no regime subamortecido o sistema oscila na frequência ω_{d}, e a amplitude decai como e^{−ζ·ω_{n}·t}. **III** – Errada: com ζ > 1 (superamortecido) **não há oscilação**; o sistema volta devagar ao equilíbrio.',
    },
  ],
  games: [
    {
      id: 'mec-vib-g1',
      type: 'sort',
      title: 'A frequência natural sobe, desce ou fica?',
      intro: 'O que cada mudança faz com a **frequência natural** de uma máquina apoiada em molas?',
      lessonRef: 6,
      bins: ['Aumenta', 'Diminui', 'Não muda'],
      items: [
        { text: 'Trocar as molas por outras mais rígidas', bin: 0, why: 'ω_{n} = √(k/m): k maior, ω_{n} maior.' },
        { text: 'Colocar a máquina sobre um bloco de concreto pesado (que também fica nas molas)', bin: 1, why: 'Mais massa, ω_{n} menor.' },
        { text: 'Trocar 2 molas em série pelas mesmas 2 em paralelo', bin: 0, why: 'k_{eq} vai de k/2 para 2k: 4 vezes mais rígido.' },
        { text: 'Tirar 2 das 4 molas em paralelo', bin: 1, why: 'k_{eq} cai à metade.' },
        { text: 'Aumentar a rotação do motor', bin: 2, why: 'A rotação é a excitação; a frequência natural é do sistema.' },
        { text: 'Aumentar o amortecimento (ζ menor que 1)', bin: 2, why: 'ω_{n} = √(k/m) não tem c (o que muda um pouco é ω_{d}).' },
        { text: 'Puxar mais forte antes de soltar', bin: 2, why: 'No sistema linear, a frequência não depende da amplitude.' },
        { text: 'Encurtar a viga em balanço que sustenta a massa', bin: 0, why: 'k = 3EI/L³: viga mais curta, muito mais rígida.' },
        { text: 'Usar um eixo mais longo entre dois volantes (torção)', bin: 1, why: 'k_{t} = G·J/L: eixo mais longo, mais flexível.' },
        { text: 'Pendurar uma ferramenta pesada na máquina', bin: 1, why: 'Mais massa vibrando.' },
      ],
    },
    {
      id: 'mec-vib-g2',
      type: 'match',
      title: 'Termos de vibrações',
      intro: 'Ligue cada termo ao seu significado.',
      lessonRef: 2,
      leftLabel: 'Termo',
      rightLabel: 'Significado',
      perRound: 6,
      pairs: [
        { left: 'Frequência natural', right: 'Frequência em que o sistema oscila sozinho, sem força nem amortecimento', why: 'ω_{n} = √(k/m).' },
        { left: 'Ressonância', right: 'Frequência da força igual à natural: amplitude máxima', why: 'r = 1.' },
        { left: 'Subamortecido', right: 'Oscila com amplitude decrescente', why: '0 < ζ < 1.' },
        { left: 'Amortecimento crítico', right: 'Volta ao equilíbrio no menor tempo, sem oscilar', why: 'ζ = 1, c = 2√(km).' },
        { left: 'Superamortecido', right: 'Volta sem oscilar, devagar', why: 'ζ > 1.' },
        { left: 'Decremento logarítmico', right: 'Logaritmo da razão entre dois picos sucessivos', why: 'δ = ln(x₁/x₂) ≈ 2πζ.' },
        { left: 'Transmissibilidade', right: 'Força que chega ao piso dividida pela força de excitação', why: 'T_{R} < 1 só para r > √2.' },
        { left: 'Deflexão estática', right: 'Quanto as molas cedem sob o peso: m·g/k', why: 'ω_{n} = √(g/δ_{st}).' },
        { left: 'Rotação crítica', right: 'Rotação que coincide com a frequência natural', why: 'n = 60·f_{n}.' },
      ],
    },
    {
      id: 'mec-vib-g3',
      type: 'order',
      title: 'A rotação de ressonância de um motor sobre molas',
      intro: 'Ponha em ordem o roteiro para descobrir se um motor vai trabalhar perto da ressonância.',
      lessonRef: 4,
      steps: [
        { text: 'Combinar as molas numa rigidez equivalente (paralelo: soma; série: soma dos inversos)', why: 'O modelo de 1 grau de liberdade usa uma mola só.' },
        { text: 'Converter a rigidez para N/m e a massa para kg', why: 'Assim √(k/m) sai em rad/s.' },
        { text: 'Calcular ω_{n} = √(k_{eq}/m)', why: 'Frequência natural angular.' },
        { text: 'Converter para hertz: f_{n} = ω_{n}/2π', why: 'Ciclos por segundo.' },
        { text: 'Converter para rpm: n = 60·f_{n}', why: 'Agora dá para comparar com a rotação do motor.' },
        { text: 'Comparar com a rotação de operação: r perto de 1 = ressonância; r > √2 = isolamento', why: 'Se estiver perto de 1, mude k ou m (ou instale um absorvedor).' },
      ],
    },
    {
      id: 'mec-vib-lab1',
      type: 'lab',
      lab: 'vibration',
      title: 'Motor sobre molas',
      intro: 'Um motor sobre molas e um amortecedor. Solte-o para ver a vibração livre, ligue-o para ver a vibração forçada, ache a ressonância e isole o piso.',
      lessonRef: 4,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { mode: 1, rpm: 300 },
          prompt: 'O motor gira a **300 rpm**; a ressonância deste conjunto fica perto de 600 rpm. Se a rotação subir para **600 rpm**, a amplitude de vibração do motor…',
          change: { rpm: 600 },
          options: ['Aumenta muito: a rotação chega à frequência natural', 'Diminui, porque o motor gira mais rápido', 'Não muda: a amplitude depende só das molas', 'Dobra, junto com a rotação', 'Cai a zero'],
          answer: 0,
          expect: [
            { out: 'X', trend: 'up' },
            { out: 'r', trend: 'up' },
            { out: 'TR', trend: 'up' },
          ],
          why: 'Em 600 rpm, r ≈ 1: **ressonância**. Só o amortecimento limita a amplitude, X = (F_{0}/k)/(2ζ) — com ζ = 0,05, dez vezes a deflexão "estática". A força no piso também dispara.',
        },
        {
          kind: 'predict',
          setup: { mode: 1, rpm: 300, arr: 2 },
          prompt: 'As **4 molas em paralelo** (50 kN/m cada) serão trocadas por **2 das mesmas molas em série**. A rotação de ressonância…',
          change: { arr: 3 },
          options: ['Cai para cerca de 1/3 (fica √8 ≈ 2,8 vezes menor)', 'Cai para 1/8', 'Cai pela metade', 'Sobe, porque há mais molas trabalhando', 'Não muda: as molas são as mesmas'],
          answer: 0,
          expect: [
            { out: 'keq', trend: 'down' },
            { out: 'ncrit', trend: 'down' },
            { out: 'dst', trend: 'up' },
          ],
          why: 'Em paralelo: k_{eq} = 4 × 50 = 200 kN/m. Em série: k_{eq} = 50/2 = 25 kN/m — **oito vezes** menos. Como a frequência vai com √k, ela cai √8 ≈ 2,8 vezes: de ~604 para ~214 rpm.',
        },
        {
          kind: 'predict',
          setup: { mode: 1, rpm: 300 },
          prompt: 'E se a **massa** sobre as molas dobrar, de 50 para 100 kg?',
          change: { m: 100 },
          options: ['A frequência natural cai cerca de 29 % (fica √2 vezes menor)', 'A frequência natural cai pela metade', 'A frequência natural dobra', 'Nada muda: a frequência depende só das molas', 'A frequência natural sobe cerca de 41 %'],
          answer: 0,
          expect: [
            { out: 'fn', trend: 'down' },
            { out: 'wn', trend: 'down' },
            { out: 'dst', trend: 'up' },
          ],
          why: 'ω_{n} = √(k/m): com o dobro da massa, ω_{n} fica dividida por √2 ≈ 1,41 (cai ~29 %). A deflexão estática m·g/k dobra.',
        },
        {
          kind: 'predict',
          setup: { mode: 0, zeta: 0.05 },
          prompt: 'Na vibração livre com ζ = 0,05, o motor oscila várias vezes antes de parar. Com o amortecimento em **ζ = 1,2**, depois de solto ele…',
          change: { zeta: 1.2 },
          options: ['Volta ao equilíbrio sem oscilar (superamortecido)', 'Oscila com amplitude constante', 'Oscila mais rápido e por mais tempo', 'Oscila com 1,2 vez a frequência natural', 'Fica parado na posição em que foi solto'],
          answer: 0,
          expect: [
            { out: 'osc', trend: 'down' },
            { out: 'regime', trend: 'up' },
            { out: 'c', trend: 'up' },
          ],
          why: 'Com ζ > 1 a resposta é a soma de duas exponenciais decrescentes: **não oscila**. E volta mais devagar do que com ζ = 1 (crítico), o retorno mais rápido sem oscilação.',
        },
        {
          kind: 'predict',
          setup: { mode: 0, zeta: 0.05 },
          prompt: 'Com ζ = 0,05, cada pico da vibração livre é ~27 % menor que o anterior. Se o amortecimento subir para **ζ = 0,2**, o decremento logarítmico δ = ln(x₁/x₂)…',
          change: { zeta: 0.2 },
          options: ['Aumenta: os picos caem bem mais depressa', 'Diminui', 'Não muda: δ depende só da massa', 'Vira zero', 'Fica negativo'],
          answer: 0,
          expect: [
            { out: 'dec', trend: 'up' },
            { out: 'wd', trend: 'down' },
          ],
          why: 'δ = 2πζ/√(1 − ζ²): com ζ = 0,2, δ ≈ 1,28 e cada pico fica com ~28 % do anterior. A frequência amortecida cai um pouco: ω_{d} = ω_{n}·√(1 − ζ²).',
        },
        {
          kind: 'goal',
          setup: { mode: 1, m: 25, arr: 2, k: 50, rpm: 1500, zeta: 0.05 },
          lock: ['m', 'arr', 'mode', 'rpm', 'zeta', 'abs'],
          prompt: 'Um motor de **25 kg** vai sobre **4 molas iguais** e gira a **1.500 rpm**. Descubra a rigidez de cada mola que deixaria o sistema **em ressonância** nessa rotação — é a rigidez que o projeto precisa evitar.',
          goals: [{ out: 'ncrit', min: 1470, max: 1530, label: 'Ressonância em 1.500 rpm (± 2 %)' }],
          hint: 'ω = 2π·1500/60 ≈ 157 rad/s → k_{eq} = m·ω² ≈ 617 kN/m, dividida pelas 4 molas.',
          solution: { k: 155 },
          why: 'k_{eq} = m·ω² = 25 × 157,1² ≈ 617 kN/m → **≈ 154 kN/m por mola**. Na bancada, a amplitude dispara: é exatamente o que um projeto de base elástica deve evitar.',
        },
        {
          kind: 'goal',
          setup: { mode: 1, m: 50, arr: 2, k: 200, rpm: 1800, zeta: 0.05 },
          lock: ['m', 'mode', 'rpm', 'zeta', 'abs'],
          prompt: 'O motor gira a **1.800 rpm** sobre 4 molas de 200 kN/m e sacode o piso. Troque as molas (rigidez e/ou arranjo) para que a força no piso seja **no máximo 20 %** da força de desbalanceamento.',
          goals: [{ out: 'TR', max: 0.2, label: 'Transmissibilidade ≤ 0,20' }],
          hint: 'Isolamento pede r = ω/ω_{n} bem acima de √2 — aqui, r ≥ 2,5. Molas mais macias baixam a frequência natural.',
          solution: { k: 70 },
          why: 'Com 4 molas de 70 kN/m, a ressonância cai para ~715 rpm e r ≈ 2,5: T_{R} ≈ 0,19. **Molas macias isolam**; as rígidas deixavam a ressonância em ~1.200 rpm, perto demais de 1.800.',
        },
        {
          kind: 'predict',
          setup: { mode: 1, rpm: 1500, zeta: 0.05 },
          prompt: 'A 1.500 rpm o motor já está na região de isolamento (r ≈ 2,5). Alguém propõe um amortecedor mais forte (ζ de 0,05 para **0,5**). A força transmitida ao piso…',
          change: { zeta: 0.5 },
          options: ['Aumenta', 'Diminui', 'Não muda', 'Cai a zero', 'Vira negativa'],
          answer: 0,
          expect: [
            { out: 'TR', trend: 'up' },
            { out: 'FT', trend: 'up' },
          ],
          why: 'Acima de r = √2, o amortecedor transmite ao piso uma força proporcional à velocidade (c·ω·X), que cresce com c. O amortecimento serve para **atravessar** a ressonância na partida; em operação, piora o isolamento.',
        },
        {
          kind: 'predict',
          setup: { mode: 1, rpm: 1200 },
          prompt: 'O motor gira a **1.200 rpm**. Que frequência aparece no sinal de vibração, se o desbalanceamento empurra uma vez por volta?',
          options: ['20 Hz', '1.200 Hz', '125,7 Hz', '2 Hz', '72.000 Hz'],
          answer: 0,
          why: 'f = n/60 = 1200/60 = **20 Hz** (período de 0,05 s). 125,7 é ω em rad/s. O analisador mostra a componente "1× rotação".',
        },
        {
          kind: 'predict',
          setup: { mode: 1, rpm: 600, zeta: 0.05 },
          prompt: 'Em ressonância (600 rpm, ζ = 0,05) o motor vibra com ~2 mm. Se o amortecimento cair para **ζ = 0,02**…',
          change: { zeta: 0.02 },
          options: ['A amplitude aumenta cerca de 2,5 vezes', 'A amplitude diminui', 'Nada muda: na ressonância só a massa importa', 'A frequência da vibração dobra', 'A ressonância desaparece'],
          answer: 0,
          expect: [{ out: 'X', trend: 'up' }],
          why: 'Na ressonância X = (F_{0}/k)/(2ζ): com ζ de 0,05 para 0,02, a amplitude fica 2,5 vezes maior (~4,7 mm). Perto da ressonância, **só o amortecimento** segura a vibração.',
        },
        {
          kind: 'goal',
          setup: { mode: 0, zeta: 0.2 },
          lock: ['m', 'arr', 'k', 'mode', 'abs'],
          prompt: 'Ajuste o amortecedor para que o motor, depois de solto, volte ao equilíbrio **o mais depressa possível sem oscilar**.',
          goals: [{ out: 'regime', min: 2, max: 2, label: 'Amortecimento crítico' }],
          hint: 'Abaixo de ζ = 1 o motor ainda oscila; acima, volta devagar.',
          solution: { zeta: 1 },
          why: '**ζ = 1** (c = c_{c} = 2√(k·m)): o retorno mais rápido sem oscilar. Compare na régua: com 0,9 ainda passa um pouco do equilíbrio; com 1,3 volta mais devagar.',
        },
      ],
    },
  ],
});
