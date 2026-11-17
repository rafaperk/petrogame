import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

export default defineTopic({
  id: 'mec.instrumentacao',
  name: 'Instrumentação e controle',
  summary: 'Medição de pressão, temperatura, nível e vazão; simbologia ISA; malhas de controle e as ações P, I e D.',
  order: 3,
  weight: 2,
  equipment: 'panel',
  edital: ['b3.instrumentacao', 'b3.controle'],
  lesson: [
    {
      title: 'Pressão',
      body: '- **Absoluta** (referência: vácuo), **manométrica** (referência: atmosfera) e **diferencial** (entre dois pontos).\n- **Tubo de Bourdon:** tubo curvado de seção oval que tende a se endireitar com a pressão e move o ponteiro — o manômetro mais comum.\n- **Diafragma** e **fole:** elementos elásticos (pressões baixas; com selo, para fluidos sujos ou corrosivos).\n- **Coluna de líquido** (tubo em U): Δp = ρ·g·Δh.\n- **Transmissores** eletrônicos (piezorresistivos ou capacitivos), com sinal de 4–20 mA.\n\n1 bar = 100 kPa ≈ 10,2 m de coluna d’água; 1 atm = 101,3 kPa.\n\n**Sinal 4–20 mA:** 4 mA = início da faixa (0%), 20 mA = fim (100%). Valor = início + (I − 4)/16 × faixa. O "zero vivo" (4 mA, e não 0) permite perceber **fio rompido** (0 mA não é uma leitura válida).',
      tip: 'Manométrica + atmosférica = **absoluta**. No 4–20 mA, 12 mA é sempre o **meio** da faixa.',
    },
    {
      title: 'Temperatura',
      body: '- **Termopar:** dois metais diferentes unidos; a diferença de temperatura entre a junta quente e a de referência gera uma tensão (**efeito Seebeck**). Faixa ampla e robusto (tipos K, J...); precisa de **compensação de junta fria**.\n- **Termorresistência (RTD, Pt100):** a resistência de um fio de platina **aumenta** com a temperatura (100 Ω a 0 °C). Mais exata e estável, faixa menor.\n- **Termistor:** semicondutor (NTC: a resistência cai quando T sobe).\n- **Bimetálico:** duas lâminas com dilatações diferentes se curvam.\n- **Pirômetro de radiação:** mede **sem contato**.\n\nO sensor fica dentro de um **poço termométrico** (thermowell), para poder ser trocado com o processo em operação.',
      tip: '**Termopar = tensão** (Seebeck, dois metais). **Pt100 = resistência** (platina, 100 Ω a 0 °C, sobe com T). **NTC = resistência que cai.**',
    },
    {
      title: 'Nível e vazão',
      body: '**Nível:** visor de vidro, boia, **pressão diferencial** (Δp = ρ·g·h → h), radar, ultrassom, capacitivo.\n\n**Vazão:**\n- **Deprimogênios** (placa de orifício, Venturi, bocal): criam uma queda de pressão, e **Q ∝ √Δp**.\n- **Rotâmetro:** área variável (flutuador num tubo cônico).\n- **Turbina**, **vórtex**, **ultrassônico**.\n- **Eletromagnético:** só para fluidos **eletricamente condutivos** (lei de Faraday).\n- **Coriolis:** mede a **vazão mássica** diretamente (e a massa específica).',
      hot: 'Qual instrumento mede **vazão** de líquido numa tubulação? O **rotâmetro** (Petrobras 2018) — as alternativas erradas eram instrumentos de outras grandezas (pressão, umidade, temperatura, tempo).',
      trap: 'Se o Δp na placa de orifício **quadruplica**, a vazão só **dobra** (raiz quadrada).',
    },
    {
      title: 'Simbologia ISA',
      body: 'Identificação do instrumento: a **1ª letra é a variável medida**; as seguintes são a **função**.\n\n- Variáveis: **P** pressão, **T** temperatura, **L** nível, **F** vazão.\n- Funções: **I** indicador, **T** transmissor, **C** controlador, **R** registrador, **E** elemento primário (sensor), **V** válvula, **A** alarme (**H** alto, **L** baixo), **S** chave ou segurança.\n\nExemplos: **PT** transmissor de pressão; **TE** elemento de temperatura; **LIC** controlador indicador de nível; **FCV** válvula de controle de vazão; **PSV** válvula de segurança de pressão; **LAH** alarme de nível alto.',
      tip: 'Leia da esquerda para a direita: **o que** se mede + **o que** o instrumento faz. FIC = Flow + Indicating + Controller.',
    },
    {
      title: 'Controle de processos',
      body: 'Malha fechada: o **sensor/transmissor** mede a variável de processo (PV) → o **controlador** compara com o **setpoint** (SP) e calcula o erro → o **elemento final** (normalmente uma válvula de controle) atua no processo.\n\n- **On-off:** liga/desliga (oscila em torno do SP).\n- **Proporcional (P):** ação proporcional ao erro; deixa um **erro residual (offset)**.\n- **Integral (I):** acumula o erro no tempo e **elimina o offset**.\n- **Derivativa (D):** reage à **velocidade** de variação do erro (antecipa), mas amplifica ruído.\n\nPID = as três juntas. Em **malha aberta** não há realimentação da medição.\n\n**Válvula de controle e falha segura:** se faltar ar ou sinal, ela vai para a posição **mais segura** — **falha-fecha** (FC) no combustível de um forno; **falha-abre** (FO) na água de resfriamento de um reator.',
      tip: '**P** = Presente (o erro de agora); **I** = passado (o erro acumulado — zera o offset); **D** = futuro (a tendência — antecipa).',
      trap: 'Aumentar só o ganho proporcional **reduz** o offset, mas não o elimina — e pode deixar a malha oscilando.',
    },
    {
      title: 'Diagramas de blocos e circuitos',
      body: '**Diagrama de blocos:** blocos em **série** multiplicam (G₁·G₂); em **paralelo** somam (G₁ + G₂). Malha fechada com **realimentação negativa**, G no ramo direto e H na realimentação:\n\n**S(s)/E(s) = G/(1 + G·H)**   → com realimentação **unitária** (H = 1): **G/(1 + G)**.\n\n**Sistema de 1ª ordem** (termômetro, tanque, circuito RC): depois de um degrau, a resposta chega a **63,2%** da variação total em **um τ** (constante de tempo), 86,5% em 2τ, 95% em 3τ e ~99% em 5τ.\n\n**Elementos de circuito:** o **resistor dissipa** energia (efeito Joule); o **capacitor armazena** energia no campo elétrico; o **indutor armazena** no campo magnético. Num **filtro RC passa-baixa** (saída no capacitor), τ = R·C: sinais lentos passam, ruídos rápidos são atenuados.',
      example: 'Termômetro com τ = 10 s mergulhado de 20 °C em água a 80 °C: depois de 10 s marca 20 + 0,632 × 60 ≈ **57,9 °C**; depois de 30 s, ≈ 77 °C.',
      hot: 'Função de transferência de malha fechada com realimentação **unitária** e o papel do **resistor** (dissipa) e do **capacitor** (armazena) num filtro RC passa-baixa (Petrobras Biocombustível 2010).',
      tip: 'Malha fechada: **"o caminho de ida sobre 1 mais a volta inteira"** — G/(1 + GH).',
      trap: 'Com realimentação **positiva** o sinal do denominador vira menos: G/(1 − GH). A banca põe as duas nas alternativas.',
    },
  ],
  roteiros: [
    {
      id: 'sinal-4-20',
      name: 'Sinal de 4 a 20 mA',
      when: 'Transmissor com faixa calibrada; pedem o valor medido a partir da corrente (ou a corrente para um valor).',
      steps: [
        '4 mA = início da faixa; 20 mA = fim: são 16 mA úteis.',
        'Fração da faixa = (I − 4)/16.',
        'Valor = início + fração × amplitude da faixa.',
      ],
      note: '12 mA = meio da faixa. 0 mA indica falha (fio rompido), não o início: é o "zero vivo".',
    },
    {
      id: 'deprimogenio',
      name: 'Vazão por placa de orifício (Q ∝ √Δp)',
      when: 'Medidor deprimogênio (placa de orifício, Venturi, bocal); pedem a vazão para outro diferencial, ou o contrário.',
      steps: [
        'Bernoulli: Δp ∝ Q², então Q ∝ √Δp.',
        'Calcule a razão dos diferenciais: Δp₂/Δp₁.',
        'Q₂ = Q₁ × √(Δp₂/Δp₁).',
      ],
      note: 'Dobrar a vazão quadruplica o diferencial; vazão pela metade, Δp a um quarto.',
    },
    {
      id: 'pressao-nivel',
      name: 'Pressão hidrostática, nível e pressão absoluta',
      when: 'Transmissor de pressão ou manômetro; pedem o nível do tanque ou a pressão absoluta.',
      steps: [
        'Identifique o que o instrumento mede: manométrica (relativa à atmosfera) ou a coluna de líquido.',
        'Coluna: Δp = ρ·g·h → h = Δp/(ρ·g). Absoluta = manométrica + atmosférica.',
        'Calcule com unidades coerentes (kPa → Pa).',
      ],
      note: 'O transmissor de nível precisa da massa específica do produto. Bourdon comum mede pressão manométrica.',
    },
    {
      id: 'primeira-ordem',
      name: 'Resposta de 1ª ordem (constante de tempo)',
      when: 'Sensor ou processo de 1ª ordem que recebe um degrau; pedem a leitura depois de um tempo.',
      steps: [
        'Conte as constantes de tempo que passaram: n = t/τ.',
        'Depois de n·τ, ainda falta a fração e^{−n} da variação total (1τ: 36,8 %; 2τ: 13,5 %; 3τ: 5 %).',
        'Valor = final − variação total × e^{−n}.',
      ],
      note: 'Em 1τ o sensor anda 63,2 % do caminho; em 5τ, praticamente tudo.',
    },
    {
      id: 'acoes-controle',
      name: 'Ações P, I e D',
      when: 'Malha de controle; pedem o efeito de cada ação, o offset ou a resposta a um distúrbio.',
      steps: [
        'Lembre o que cada ação vê: P → o erro atual; I → o erro acumulado no tempo; D → a velocidade do erro.',
        'Consequências: P sozinho deixa offset; I zera o offset (mas pode oscilar); D antecipa, mas amplifica ruído.',
        'Aplique à situação descrita.',
      ],
      note: '**P** = presente; **I** = passado (acumula); **D** = futuro (tendência).',
    },
    {
      id: 'sensor-temperatura',
      name: 'Sensores de temperatura',
      when: 'Pedem o princípio, o comportamento ou a escolha de um sensor de temperatura.',
      steps: [
        'Ache o princípio: termopar = tensão de dois metais (Seebeck); Pt100 = resistência que sobe com T; termistor NTC = resistência que cai; bimetálico = dilatação; pirômetro = radiação.',
        'Lembre o detalhe que cai: Pt100 vale 100 Ω a 0 °C (+0,385 Ω/°C); termopar exige compensação da junta fria.',
        'Associe com a alternativa.',
      ],
      note: 'Pt100: mais exato e estável; termopar: faixa maior e mais barato.',
    },
    {
      id: 'medidores-vazao',
      name: 'Princípios dos medidores de vazão',
      when: 'Pedem o princípio, a exigência ou a vantagem de um medidor de vazão.',
      steps: [
        'Ache o princípio: deprimogênio (Δp ∝ Q²), rotâmetro (área variável), eletromagnético (Faraday), Coriolis (força de Coriolis), turbina (rotação).',
        'Lembre a exigência ou a vantagem: eletromagnético pede fluido condutor; Coriolis mede massa (e densidade); rotâmetro fica na vertical.',
        'Associe com a alternativa.',
      ],
      note: 'Coriolis = **massa**. Eletromagnético = fluido **condutor** (não serve para hidrocarboneto).',
    },
    {
      id: 'isa',
      name: 'Identificação de instrumentos (ISA)',
      when: 'Tag de instrumento (FIC, LT, PSV...); pedem o significado.',
      steps: [
        'Primeira letra = variável medida (F vazão, L nível, P pressão, T temperatura).',
        'Letras seguintes = funções (I indicador, C controlador, T transmissor, V válvula, S chave).',
        'Leia na ordem: variável + funções.',
      ],
      note: 'FIC = controlador indicador de vazão; LT = transmissor de nível; PSV = válvula de segurança de pressão.',
    },
  ],
  questions: [
    {
      id: 'mec-ins-01',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'O sensor de temperatura baseado no **efeito Seebeck** é o',
      options: [
        { text: 'termopar.', why: 'Correta: a junção de dois metais diferentes gera uma tensão que depende da diferença de temperatura.' },
        { text: 'Pt100 (termorresistência).', why: 'O Pt100 se baseia na variação da resistência elétrica da platina.' },
        { text: 'termômetro bimetálico.', why: 'Funciona pela dilatação diferente de duas lâminas.' },
        { text: 'pirômetro de radiação.', why: 'Mede a radiação emitida pela superfície, sem contato.' },
        { text: 'termistor NTC.', why: 'É um semicondutor cuja resistência cai com a temperatura.' },
      ],
      answer: 0,
      roteiro: 'sensor-temperatura',
      steps: [
        'Princípio pedido: **efeito Seebeck** — dois metais diferentes, com juntas em temperaturas diferentes, geram tensão.',
        'Esse é o termopar, que exige compensação da junta fria.',
        'Fica **termopar**.',
      ],
      explanation: '**Efeito Seebeck:** dois metais diferentes unidos, com as juntas em temperaturas diferentes, geram uma força eletromotriz. É o princípio do **termopar**, que exige compensação da junta de referência (junta fria).',
    },
    {
      id: 'mec-ins-02',
      difficulty: 1,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Na simbologia ISA, a identificação **FIC** corresponde a um',
      options: [
        { text: 'controlador indicador de vazão.', why: 'Correta: F (vazão) + I (indicador) + C (controlador).' },
        { text: 'controlador indicador de nível.', why: 'Nível seria L: LIC.' },
        { text: 'transmissor indicador de vazão.', why: 'Transmissor seria T: FIT.' },
        { text: 'controlador indicador de temperatura.', why: 'Temperatura seria T na primeira posição: TIC.' },
        { text: 'chave de vazão com indicação.', why: 'Chave seria S: FIS.' },
      ],
      answer: 0,
      roteiro: 'isa',
      steps: [
        'F = vazão (flow).',
        'I = indicador; C = controlador.',
        'Fica **controlador indicador de vazão**.',
      ],
      explanation: 'Primeira letra = variável (F = vazão, de *flow*). Letras seguintes = funções (I = indicador, C = controlador). **FIC = controlador indicador de vazão.**',
    },
    {
      id: 'mec-ins-03',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Placa de orifício: vazão × Δp',
      roteiro: 'deprimogenio',
      generate(rng) {
        const Q1 = pickOne(rng, [40, 60, 80, 100, 120, 150]);
        const dp1 = pickOne(rng, [20, 40, 50, 80, 100]);
        const k = pickOne(rng, [4, 9, 0.25, 2.25, 16]);
        const dp2 = dp1 * k;
        const Q2 = Q1 * Math.sqrt(k);
        const { options, answer } = numericOptions({
          correct: Q2,
          unit: 'm³/h',
          digits: 1,
          correctWhy: `Q ∝ √Δp: Q₂ = ${Q1} × √(${fmt(dp2)}/${dp1}) = ${Q1} × ${fmt(Math.sqrt(k))} = ${fmt(Q2, 1)} m³/h.`,
          distractors: [
            { value: Q1 * k, why: 'Relação linear: a vazão varia com a **raiz quadrada** do Δp.' },
            { value: Q1 / Math.sqrt(k), why: 'Inverteu: Δp maior significa vazão **maior**.' },
            { value: Q1 * k * k, why: 'Elevou ao quadrado; o correto é a raiz.' },
          ],
        });
        return {
          prompt: `Uma placa de orifício indica **${Q1} m³/h** com diferencial de pressão de **${dp1} kPa**. Se o diferencial passar para **${fmt(dp2)} kPa** (mesmo fluido e mesma placa), a vazão será`,
          options,
          answer,
          hint: 'Deprimogênios: Q ∝ √Δp.',
          steps: [
            `Q ∝ √Δp.`,
            `Δp₂/Δp₁ = ${fmt(dp2)}/${dp1} = ${fmt(k)}.`,
            `Q₂ = ${Q1} × √${fmt(k)} = ${Q1} × ${fmt(Math.sqrt(k))} = **${fmt(Q2, 1)} m³/h**.`,
          ],
          explanation: `Nos medidores deprimogênios, Δp ∝ Q² (Bernoulli), ou seja, **Q ∝ √Δp**.\n\nRazão dos diferenciais: ${fmt(dp2)}/${dp1} = ${fmt(k)} → razão das vazões: √${fmt(k)} = ${fmt(Math.sqrt(k))}.\n\nQ₂ = ${Q1} × ${fmt(Math.sqrt(k))} = **${fmt(Q2, 1)} m³/h**.`,
        };
      },
    },
    {
      id: 'mec-ins-04',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Nível por pressão diferencial',
      roteiro: 'pressao-nivel',
      generate(rng) {
        const fluid = pickOne(rng, [
          { name: 'óleo', rho: 800 },
          { name: 'água', rho: 1000 },
          { name: 'salmoura', rho: 1200 },
        ]);
        const dp = pickOne(rng, [12, 16, 24, 30, 36, 48, 60]);
        const h = (dp * 1000) / (fluid.rho * 10);
        const distractors = [
          { value: (dp * 1000) / fluid.rho, why: 'Esqueceu a gravidade: h = Δp/(ρ·**g**).' },
          { value: dp / (fluid.rho * 10), why: 'Deixou Δp em kPa: converta para Pa (× 1.000).' },
        ];
        if (fluid.rho !== 1000) distractors.push({ value: (dp * 1000) / 10000, why: `Usou a massa específica da água; o fluido é ${fluid.name} (${fmt(fluid.rho)} kg/m³).` });
        const { options, answer } = numericOptions({
          correct: h,
          unit: 'm',
          digits: 3,
          correctWhy: `h = Δp/(ρ·g) = ${fmt(dp * 1000)}/(${fmt(fluid.rho)} × 10) = ${fmt(h, 3)} m.`,
          distractors,
        });
        return {
          prompt: `Um transmissor de pressão diferencial instalado no fundo de um tanque aberto de **${fluid.name}** (ρ = ${fmt(fluid.rho)} kg/m³) indica **${dp} kPa**. Com g = 10 m/s², o nível de líquido no tanque é`,
          options,
          answer,
          hint: 'Δp = ρ·g·h.',
          steps: [
            `Transmissor no fundo de tanque aberto: mede a coluna de ${fluid.name}.`,
            `h = Δp/(ρ·g) = ${fmt(dp * 1000)}/(${fmt(fluid.rho)} × 10).`,
            `h = **${fmt(h, 3)} m**.`,
          ],
          explanation: `Nível por pressão hidrostática: Δp = ρ·g·h → h = Δp/(ρ·g) = ${fmt(dp * 1000)} Pa / (${fmt(fluid.rho)} × 10) = **${fmt(h, 3)} m**.\n\nPor isso o transmissor precisa ser calibrado para a **massa específica** do produto.`,
        };
      },
    },
    {
      id: 'mec-ins-05',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'O medidor que mede **diretamente a vazão mássica** é o',
      options: [
        { text: 'Coriolis.', why: 'Correta: a vazão mássica deforma (torce) os tubos vibrantes proporcionalmente.' },
        { text: 'placa de orifício.', why: 'Mede vazão volumétrica a partir de Δp (depende da massa específica).' },
        { text: 'rotâmetro.', why: 'Área variável: vazão volumétrica.' },
        { text: 'eletromagnético.', why: 'Mede a velocidade de um fluido condutivo: vazão volumétrica.' },
        { text: 'tubo de Pitot.', why: 'Mede a velocidade num ponto.' },
      ],
      answer: 0,
      roteiro: 'medidores-vazao',
      steps: [
        'Pedido: medir **diretamente a vazão mássica**.',
        'Coriolis: tubos vibrando sofrem uma defasagem proporcional à vazão mássica (e a frequência dá a densidade).',
        'Fica **Coriolis**.',
      ],
      explanation: 'No medidor **Coriolis**, o fluido passa por tubos vibrando; a força de Coriolis provoca uma defasagem proporcional à **vazão mássica**. Bônus: a frequência de vibração dá a massa específica.',
    },
    {
      id: 'mec-ins-06',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'O medidor de vazão **eletromagnético** exige que o fluido seja',
      options: [
        { text: 'eletricamente condutivo.', why: 'Correta: a lei de Faraday exige um condutor se movendo no campo magnético.' },
        { text: 'isento de sólidos em suspensão.', why: 'Ele tolera lamas e polpas — é uma das suas vantagens.' },
        { text: 'um gás seco.', why: 'Gases não são condutivos: o eletromagnético não serve para eles.' },
        { text: 'pouco viscoso.', why: 'A viscosidade não é o requisito principal.' },
        { text: 'transparente.', why: 'Isso não importa para o princípio de medição.' },
      ],
      answer: 0,
      roteiro: 'medidores-vazao',
      steps: [
        'Princípio do eletromagnético: lei de Faraday, com o próprio fluido como condutor.',
        'Sem condutividade mínima, não há tensão induzida.',
        'Fica **eletricamente condutivo**.',
      ],
      explanation: 'Pela **lei de Faraday**, um condutor (o próprio fluido) movendo-se num campo magnético induz uma tensão proporcional à velocidade. Sem condutividade mínima (hidrocarbonetos, gases), não há sinal.',
    },
    {
      id: 'mec-ins-07',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Em uma malha de controle, a ação que **elimina o erro em regime permanente** (offset) deixado pelo controle proporcional é a ação',
      options: [
        { text: 'integral.', why: 'Correta: enquanto houver erro, a integral continua mudando a saída até zerá-lo.' },
        { text: 'derivativa.', why: 'A derivativa reage à velocidade de variação do erro; não elimina o offset.' },
        { text: 'proporcional com ganho maior.', why: 'Ganho maior reduz o offset, mas não o elimina — e pode instabilizar a malha.' },
        { text: 'on-off.', why: 'O on-off oscila em torno do setpoint.' },
        { text: 'de malha aberta.', why: 'Sem realimentação não há correção do erro.' },
      ],
      answer: 0,
      roteiro: 'acoes-controle',
      steps: [
        'P vê o erro atual; I, o erro acumulado; D, a velocidade do erro.',
        'O P precisa de erro para agir, então sobra offset; a I acumula até o erro zerar.',
        'Fica **integral**.',
      ],
      explanation: 'O controle **P** sozinho precisa de um erro para gerar ação — sobra um offset. A ação **I** acumula o erro no tempo e só para de mexer na saída quando o erro chega a zero.',
    },
    {
      id: 'mec-ins-08',
      difficulty: 3,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Em uma termorresistência **Pt100**, quando a temperatura aumenta, a resistência elétrica do sensor',
      options: [
        { text: 'aumenta (coeficiente positivo), valendo 100 Ω a 0 °C.', why: 'Correta.' },
        { text: 'diminui, como num termistor NTC.', why: 'Metais como a platina têm coeficiente **positivo**.' },
        { text: 'permanece constante; só a tensão gerada varia.', why: 'Isso descreve (mal) um termopar.' },
        { text: 'aumenta, valendo 100 Ω a 100 °C.', why: 'Os 100 Ω do nome são a 0 °C.' },
        { text: 'diminui, valendo 100 Ω a 0 °C.', why: 'O valor de referência está certo, mas a resistência aumenta com a temperatura.' },
      ],
      answer: 0,
      roteiro: 'sensor-temperatura',
      steps: [
        'Pt100 é uma termorresistência (RTD) de platina.',
        'Metal: a resistência **sobe** com a temperatura; vale 100 Ω a 0 °C.',
        'Fica **aumenta (coeficiente positivo), com 100 Ω a 0 °C**.',
      ],
      explanation: 'Pt100 = platina com **100 Ω a 0 °C**; a resistência **aumenta** cerca de 0,385 Ω por °C. É mais exata e estável que o termopar, porém com faixa de temperatura menor.',
    },
    {
      id: 'mec-ins-09',
      difficulty: 1,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Num tubo cônico vertical e transparente, um flutuador sobe até que o peso dele se equilibre com a força do líquido que escoa de baixo para cima; a altura do flutuador indica a vazão numa escala. Esse medidor é o',
      options: [
        { text: 'rotâmetro.', why: 'Correta: medidor de área variável — quanto maior a vazão, mais alto o flutuador e maior a área anular livre.' },
        { text: 'higrômetro.', why: 'O higrômetro mede a umidade do ar.' },
        { text: 'manômetro.', why: 'O manômetro mede pressão.' },
        { text: 'pirômetro.', why: 'O pirômetro mede temperatura (sem contato).' },
        { text: 'tubo de Bourdon.', why: 'Elemento de medição de pressão.' },
      ],
      answer: 0,
      roteiro: 'medidores-vazao',
      steps: [
        'Princípio descrito: flutuador num tubo cônico vertical — área variável.',
        'O flutuador sobe até equilibrar o peso com a força do escoamento; a altura indica a vazão.',
        'Fica **rotâmetro** (na vertical, fluxo de baixo para cima).',
      ],
      explanation: 'O **rotâmetro** (área variável) é simples, barato e dá leitura local direta da vazão. Precisa ser instalado na **vertical**, com o escoamento de baixo para cima, e a escala vale para um fluido de massa específica definida.',
    },
    {
      id: 'mec-ins-10',
      type: 'gen',
      difficulty: 2,
      lessonRef: 0,
      title: 'Sinal de 4 a 20 mA',
      roteiro: 'sinal-4-20',
      generate(rng) {
        const range = pickOne(rng, [
          { lo: 0, hi: 10, unit: 'bar', what: 'pressão', the: 'a pressão medida' },
          { lo: 0, hi: 600, unit: 'kPa', what: 'pressão', the: 'a pressão medida' },
          { lo: 50, hi: 250, unit: '°C', what: 'temperatura', the: 'a temperatura medida' },
          { lo: 0, hi: 5, unit: 'm', what: 'nível', the: 'o nível medido' },
        ]);
        const I = pickOne(rng, [6, 8, 10, 12, 16, 18]);
        const span = range.hi - range.lo;
        const value = range.lo + ((I - 4) / 16) * span;
        const { options, answer } = numericOptions({
          correct: value,
          unit: range.unit,
          digits: 2,
          correctWhy: `Valor = ${fmt(range.lo)} + (${I} − 4)/16 × ${fmt(span)} = ${fmt(value, 2)} ${range.unit}.`,
          distractors: [
            { value: range.lo + (I / 20) * span, why: 'Tratou a faixa como 0–20 mA: o zero do sinal é **4 mA**.' },
            { value: range.lo + ((I - 4) / 20) * span, why: 'Descontou os 4 mA, mas dividiu por 20; a faixa útil tem **16 mA**.' },
            { value: ((I - 4) / 16) * span, why: 'Esqueceu de somar o início da faixa.' },
            { value: range.lo + (I / 16) * span, why: 'Não descontou os 4 mA do zero vivo.' },
          ],
        });
        return {
          prompt: `Um transmissor de ${range.what} calibrado de **${fmt(range.lo)} a ${fmt(range.hi)} ${range.unit}** envia sinal de **4 a 20 mA**. Se o sinal lido é **${I} mA**, ${range.the} é, em ${range.unit},`,
          options,
          answer,
          hint: '4 mA = início da faixa; 20 mA = fim. São 16 mA de faixa útil.',
          steps: [
            `Faixa de ${fmt(range.lo)} a ${fmt(range.hi)} ${range.unit} (amplitude ${fmt(span)}).`,
            `Fração = (${I} − 4)/16 = ${fmt((I - 4) / 16, 4)}.`,
            `Valor = ${fmt(range.lo)} + ${fmt((I - 4) / 16, 4)} × ${fmt(span)} = **${fmt(value, 2)} ${range.unit}**.`,
          ],
          explanation: `Fração da faixa: (${I} − 4)/16 = ${fmt((I - 4) / 16, 4)}.\n\nValor = ${fmt(range.lo)} + ${fmt((I - 4) / 16, 4)} × ${fmt(span)} = **${fmt(value, 2)} ${range.unit}**.`,
        };
      },
    },
    {
      id: 'mec-ins-11',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Num sistema de controle com **realimentação negativa unitária**, em que G(s) é a função de transferência do ramo direto, a função de transferência de malha fechada S(s)/E(s) é',
      shuffle: false,
      options: [
        { text: 'G(s)', why: 'Essa é a de malha **aberta** (sem realimentação).' },
        { text: 'G(s)/(1 − G(s))', why: 'Denominador com sinal de menos: realimentação **positiva**.' },
        { text: 'G(s)/(1 + G(s))', why: 'Correta: G/(1 + G·H) com H = 1.' },
        { text: '1/(1 + G(s))', why: 'Essa é a relação entre o **erro** e a entrada, E_{rro}/E.' },
        { text: '1 + G(s)', why: 'Não corresponde a nenhuma relação de malha fechada.' },
      ],
      answer: 2,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: malha fechada com realimentação **negativa unitária**.',
        'S = G·(E − H·S) → S/E = G/(1 + G·H); unitária: H = 1.',
        'Fica **G(s)/(1 + G(s))**.',
      ],
      explanation: 'Na malha fechada: erro = E − H·S e S = G·erro → S = G·(E − H·S) → **S/E = G/(1 + G·H)**. Com realimentação unitária, H = 1: **G/(1 + G)**.',
    },
    {
      id: 'mec-ins-12',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Num circuito RC série ligado a uma fonte de tensão, o resistor e o capacitor se comportam, quanto à energia, respectivamente, como',
      options: [
        { text: 'dissipador e armazenador.', why: 'Correta: o resistor transforma energia elétrica em calor (Joule); o capacitor guarda energia no campo elétrico.' },
        { text: 'armazenador e dissipador.', why: 'Invertido.' },
        { text: 'gerador e dissipador.', why: 'Elementos passivos não geram energia.' },
        { text: 'dissipador e gerador.', why: 'O capacitor não gera energia: só devolve a que armazenou.' },
        { text: 'armazenador e transformador.', why: 'Transformador é outro componente (indução entre bobinas).' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: o papel do **resistor** e do **capacitor** quanto à energia.',
        'Resistor dissipa (P = R·I²); capacitor armazena no campo elétrico (C·V²/2); indutor, no campo magnético (L·I²/2).',
        'Fica **dissipador e armazenador**.',
      ],
      explanation: '**Resistor:** dissipa (P = R·I², vira calor). **Capacitor:** armazena no campo elétrico (E = C·V²/2). **Indutor:** armazena no campo magnético (E = L·I²/2). Num filtro RC passa-baixa, a constante de tempo τ = R·C define quais frequências passam.',
    },
    {
      id: 'mec-ins-13',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'A ação de controle que reage à **velocidade de variação do erro**, antecipando a correção, mas que tende a amplificar ruídos de medição, é a ação',
      options: [
        { text: 'derivativa.', why: 'Correta: olha a tendência (dE/dt).' },
        { text: 'proporcional.', why: 'Reage ao tamanho do erro atual.' },
        { text: 'integral.', why: 'Reage ao erro acumulado no tempo.' },
        { text: 'on-off.', why: 'Só liga ou desliga.' },
        { text: 'de malha aberta.', why: 'Sem medição não há erro para derivar.' },
      ],
      answer: 0,
      roteiro: 'acoes-controle',
      steps: [
        'Pedido: a ação que reage à **velocidade** do erro.',
        'D usa a derivada do erro: antecipa a correção — e amplifica ruído, que é variação rápida.',
        'Fica **derivativa**.',
      ],
      explanation: '**D** responde à derivada do erro: se a variável está subindo rápido, ela já age antes de o erro ficar grande. Como ruído é variação rápida, a ação D o amplifica — por isso é pouco usada em malhas de vazão (sinal ruidoso) e muito em temperatura (processo lento).',
    },
    {
      id: 'mec-ins-14',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'A válvula de controle do **gás combustível** dos queimadores de um forno é pneumática. Para a segurança da unidade, em caso de falta de ar de instrumento ela deve ser',
      options: [
        { text: 'falha-fecha (FC): sem ar, fecha e corta o combustível.', why: 'Correta: sem controle, o mais seguro é apagar os queimadores.' },
        { text: 'falha-abre (FO): sem ar, abre totalmente.', why: 'Abriria todo o gás num forno sem controle: superaquecimento ou explosão.' },
        { text: 'falha-mantém: sem ar, fica onde estava.', why: 'Manter a posição deixa o forno sem controle nenhum.' },
        { text: 'qualquer uma, pois o controlador compensa.', why: 'Sem ar de instrumento, o controlador não consegue atuar na válvula.' },
        { text: 'falha-abre, para não deixar a chama apagar.', why: 'Apagar a chama com segurança é melhor que alimentá-la sem controle.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: posição de **falha** da válvula de **gás combustível** do forno.',
        'A posição de falha é a menos perigosa se o controle sumir: combustível → cortar.',
        'Fica **falha-fecha (FC)**.',
      ],
      explanation: 'A posição de falha é escolhida pela **segurança do processo**: combustível de forno → **fecha**; água de resfriamento de reator → **abre**; alívio de pressão → **abre**. Pense: "se eu perder o controle agora, o que é menos perigoso?".',
    },
    {
      id: 'mec-ins-15',
      type: 'gen',
      difficulty: 3,
      lessonRef: 5,
      title: 'Resposta de 1ª ordem (constante de tempo)',
      roteiro: 'primeira-ordem',
      generate(rng) {
        const T0 = pickOne(rng, [20, 25]);
        const Tf = pickOne(rng, [80, 100]);
        const tau = pickOne(rng, [5, 10, 20]);
        const n = pickOne(rng, [1, 2, 3]);
        const e = [0, 0.368, 0.135, 0.05][n];
        const T = Tf - (Tf - T0) * e;
        const { options, answer } = numericOptions({
          correct: T,
          unit: '°C',
          digits: 1,
          correctWhy: `T = T_{f} − (T_{f} − T₀)·e^{−t/τ} = ${Tf} − ${Tf - T0} × ${fmt(e, 3)} = ${fmt(T, 1)} °C.`,
          distractors: [
            { value: T0 + (Tf - T0) * e, why: 'Trocou: e^{−t/τ} é a fração que **falta**, não a já percorrida.' },
            { value: Tf, why: 'O sensor não responde instantaneamente: precisa de alguns τ.' },
            { value: T0 + (Tf - T0) * Math.min(1, n * 0.5), why: 'Supôs resposta linear no tempo; a de 1ª ordem é exponencial.' },
            { value: T0 + (Tf - T0) * 0.632, why: 'Usou 63,2% qualquer que seja o tempo; isso só vale para t = τ.' },
          ],
        });
        return {
          prompt: `Um termômetro (sistema de 1ª ordem, τ = **${tau} s**) a **${T0} °C** é mergulhado de repente num banho a **${Tf} °C**. Usando e^{−1} = 0,368, e^{−2} = 0,135 e e^{−3} = 0,050, a leitura depois de **${n * tau} s** é, aproximadamente, em °C,`,
          options,
          answer,
          hint: 'Depois de t = n·τ, ainda falta a fração e^{−n} da variação total.',
          steps: [
            `t = ${n * tau} s = ${n}τ.`,
            `Falta e^{−${n}} = ${fmt(e, 3)} da variação de ${Tf - T0} °C.`,
            `T = ${Tf} − ${Tf - T0} × ${fmt(e, 3)} = **${fmt(T, 1)} °C** (${fmt((1 - e) * 100, 1)}% do caminho).`,
          ],
          explanation: `t = ${n * tau} s = ${n}τ → falta a fração e^{−${n}} = ${fmt(e, 3)} da variação de ${Tf - T0} °C.\n\nT = ${Tf} − ${Tf - T0} × ${fmt(e, 3)} = **${fmt(T, 1)} °C** (${fmt((1 - e) * 100, 1)}% do caminho).`,
        };
      },
    },
    {
      id: 'mec-ins-16',
      type: 'gen',
      difficulty: 1,
      lessonRef: 0,
      title: 'Pressão absoluta e manométrica',
      roteiro: 'pressao-nivel',
      generate(rng) {
        const patm = pickOne(rng, [100, 101.3, 90]);
        const pman = pickOne(rng, [150, 250, 300, 450, 800]);
        const pabs = pman + patm;
        const { options, answer } = numericOptions({
          correct: pabs,
          unit: 'kPa',
          digits: 1,
          correctWhy: `p_{abs} = p_{man} + p_{atm} = ${pman} + ${fmt(patm, 1)} = ${fmt(pabs, 1)} kPa.`,
          distractors: [
            { value: pman, why: 'Essa é a manométrica, que o instrumento já mostra.' },
            { value: pman - patm, why: 'Subtraiu a atmosférica; para a absoluta, **soma**.' },
            { value: patm, why: 'Essa é só a atmosférica.' },
            { value: pman * patm / 100, why: 'Multiplicou as pressões — sem sentido físico.' },
          ],
        });
        return {
          prompt: `Um manômetro de Bourdon instalado num vaso marca **${pman} kPa**. No local, a pressão atmosférica é de **${fmt(patm, 1)} kPa**. A pressão absoluta no vaso é, em kPa,`,
          options,
          answer,
          hint: 'Manômetros comuns medem em relação à atmosfera.',
          steps: [
            `Bourdon comum mede a pressão **manométrica**: ${pman} kPa.`,
            `Absoluta = manométrica + atmosférica = ${pman} + ${fmt(patm, 1)}.`,
            `p_{abs} = **${fmt(pabs, 1)} kPa**.`,
          ],
          explanation: `O Bourdon comum mede a pressão **manométrica** (relativa à atmosfera). Absoluta = manométrica + atmosférica = ${pman} + ${fmt(patm, 1)} = **${fmt(pabs, 1)} kPa**.`,
        };
      },
    },
    {
      id: 'mec-ins-17',
      difficulty: 3,
      lessonRef: 1,
      source: 'Autoral',
      shuffle: false,
      prompt: 'Analise as afirmativas.\n\nI – O termopar gera uma tensão que depende da diferença de temperatura entre a junta de medição e a junta de referência.\nII – A resistência elétrica de um Pt100 diminui quando a temperatura aumenta.\nIII – No sinal de 4 a 20 mA, uma leitura de 0 mA indica falha (por exemplo, fio rompido), e não o início da faixa.\n\nEstá correto o que se afirma em',
      options: [
        { text: 'I, apenas', why: 'III também está correta.' },
        { text: 'II, apenas', why: 'II é falsa: a resistência da platina **aumenta** com a temperatura.' },
        { text: 'I e III, apenas', why: 'Correta.' },
        { text: 'II e III, apenas', why: 'II é falsa.' },
        { text: 'I, II e III', why: 'II é falsa.' },
      ],
      answer: 2,
      roteiro: 'fmt.afirmativas',
      steps: [
        'I – **Correta**: efeito Seebeck — a tensão depende da diferença entre as juntas (daí a compensação da junta fria).',
        'II – **Errada**: a resistência do Pt100 **aumenta** com a temperatura; quem diminui é o NTC.',
        'III – **Correta**: o "zero vivo" de 4 mA permite diagnosticar falha (0 mA).',
        'Certas: I e III → "I e III, apenas".',
      ],
      explanation: '**I** – Correta: efeito Seebeck — por isso se faz a compensação de junta fria. **II** – Errada: metais têm coeficiente positivo; quem diminui é o termistor **NTC**. **III** – Correta: o "zero vivo" de 4 mA permite diagnosticar falhas.',
    },
    {
      id: 'mec-ins-18',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'O nível de um tanque é controlado só com ação **proporcional**. Depois de um aumento permanente da vazão de saída, o nível',
      options: [
        { text: 'estabiliza num valor diferente do setpoint (erro residual, ou offset).', why: 'Correta: para manter a válvula de entrada mais aberta, o controlador P precisa de um erro permanente.' },
        { text: 'volta exatamente ao setpoint depois de algum tempo.', why: 'Isso exigiria a ação **integral**.' },
        { text: 'oscila indefinidamente, como num controle on-off.', why: 'Com ganho adequado, o controle P estabiliza — só que fora do setpoint.' },
        { text: 'cai até esvaziar o tanque, porque o controlador não age.', why: 'O controlador P age, proporcionalmente ao erro.' },
        { text: 'sobe acima do setpoint.', why: 'Com mais saída, o nível tende a cair; o P limita a queda, mas não a zera.' },
      ],
      answer: 0,
      roteiro: 'acoes-controle',
      steps: [
        'Só ação P: saída = bias + K·erro.',
        'Para abrir mais a entrada e compensar a saída maior, é preciso um erro diferente de zero.',
        'Fica **estabiliza fora do setpoint (offset)**; a ação I o removeria.',
      ],
      explanation: 'No controle **P**, saída = bias + K·erro. Para abrir mais a válvula de entrada (compensar a saída maior), é preciso um **erro diferente de zero**: o nível fica um pouco abaixo do setpoint — o **offset**. A ação **I** remove esse offset.',
    },
  ],
  games: [
    {
      id: 'mec-ins-g1',
      type: 'sort',
      title: 'O que este instrumento mede?',
      intro: 'Mande cada instrumento para a variável que ele mede.',
      lessonRef: 2,
      bins: ['Pressão', 'Temperatura', 'Nível', 'Vazão'],
      perRound: 12,
      items: [
        { text: 'Tubo de Bourdon', bin: 0, why: 'O manômetro mais comum.' },
        { text: 'Termopar', bin: 1, why: 'Efeito Seebeck.' },
        { text: 'Placa de orifício', bin: 3, why: 'Deprimogênio: Q ∝ √Δp.' },
        { text: 'Boia', bin: 2, why: 'Acompanha a superfície do líquido.' },
        { text: 'Pt100', bin: 1, why: 'Termorresistência de platina.' },
        { text: 'Rotâmetro', bin: 3, why: 'Área variável.' },
        { text: 'Manômetro de tubo em U', bin: 0, why: 'Δp = ρ·g·Δh.' },
        { text: 'Radar de onda guiada', bin: 2, why: 'Mede o tempo de ida e volta do pulso até a superfície.' },
        { text: 'Pirômetro óptico', bin: 1, why: 'Mede sem contato, pela radiação.' },
        { text: 'Medidor Coriolis', bin: 3, why: 'Vazão mássica direta.' },
        { text: 'Visor de vidro', bin: 2, why: 'Indicação local de nível.' },
        { text: 'Diafragma', bin: 0, why: 'Elemento elástico que deflete com a pressão.' },
        { text: 'Termômetro bimetálico', bin: 1, why: 'Lâminas com dilatações diferentes.' },
        { text: 'Medidor eletromagnético', bin: 3, why: 'Lei de Faraday (fluido condutivo).' },
        { text: 'Transmissor de pressão diferencial no fundo de um tanque aberto', bin: 2, why: 'Mede a coluna de líquido: Δp = ρ·g·h → nível.' },
      ],
    },
    {
      id: 'mec-ins-g2',
      type: 'match',
      title: 'Siglas ISA',
      intro: 'Ligue cada sigla ao instrumento.',
      lessonRef: 3,
      leftLabel: 'Sigla',
      rightLabel: 'Instrumento',
      perRound: 6,
      pairs: [
        { left: 'PT', right: 'Transmissor de pressão', why: 'P + T (transmissor).' },
        { left: 'TE', right: 'Elemento primário de temperatura (sensor)', why: 'T + E (elemento).' },
        { left: 'LIC', right: 'Controlador indicador de nível', why: 'L + I + C.' },
        { left: 'FT', right: 'Transmissor de vazão', why: 'F (flow) + T.' },
        { left: 'PSV', right: 'Válvula de segurança de pressão', why: 'P + S (segurança) + V (válvula).' },
        { left: 'TI', right: 'Indicador de temperatura', why: 'T + I.' },
        { left: 'FCV', right: 'Válvula de controle de vazão', why: 'F + C + V.' },
        { left: 'LAH', right: 'Alarme de nível alto', why: 'L + A (alarme) + H (alto).' },
      ],
    },
  ],
});
