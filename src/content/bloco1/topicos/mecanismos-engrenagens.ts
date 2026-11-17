import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

const TAU = 2 * Math.PI;

export default defineTopic({
  id: 'mec.mecanismos-engrenagens',
  name: 'Mecanismos: engrenagens, D’Alembert e biela-manivela',
  summary:
    'Relação de transmissão, torque e potência em pares e trens de engrenagens, engrenagem intermediária, correias e correntes, torque e torção nos eixos, princípio de D’Alembert, mecanismo biela-manivela e graus de liberdade de estruturas e mecanismos.',
  order: 6,
  weight: 3,
  equipment: 'winch',
  requires: ['mec.dinamica-atrito'],
  edital: ['b1.mecanismos', 'b1.dinamica', 'b1.torcao'],
  lesson: [
    {
      title: 'Relação de transmissão',
      hot: 'Rotação de saída de um conjunto de engrenagens a partir dos diâmetros ou dos dentes (Petrobras 2018, BR 2012). Rotação vezes diâmetro é igual nas duas engrenagens de um par.',
      body: 'Duas engrenagens engrenadas têm a mesma **velocidade tangencial** no ponto de contato (v = ω·r). Daí:\n\n**n_{1}·D_{1} = n_{2}·D_{2}** → **n_{2}/n_{1} = D_{1}/D_{2} = z_{1}/z_{2}**\n\n(z = número de dentes; D = m·z, onde o **módulo** m é o "tamanho" do dente — o mesmo nas duas, senão elas não engrenam).\n- A engrenagem **maior gira mais devagar**.\n- Cada engrenamento **externo inverte o sentido** de giro.\n- **Redutor**: o pinhão (pequeno) aciona a coroa (grande). **Multiplicador**: o contrário.\n\nA relação de transmissão aparece como **i = n_{saída}/n_{entrada}** (por exemplo, 1/10) ou como "redução 10:1". Leia o enunciado com atenção.',
      example: 'Pinhão de 18 dentes a 1.800 rpm acionando uma coroa de 54 dentes: n_{2} = 1.800 × 18/54 = **600 rpm**, no sentido contrário.',
      tip: 'As mesmas contas valem para **polias com correia** (n_{1}·D_{1} = n_{2}·D_{2}) e para **rodas dentadas com corrente**.',
      trap: 'Inverter a razão: a rotação é **inversamente** proporcional ao diâmetro (ou ao número de dentes).',
      lab: { lab: 'gears', preset: { two: 0, idler: 0, z1: 20, z2: 60 }, label: 'Ver um par girando' },
    },
    {
      title: 'Torque e potência',
      hot: 'Torque que o motor precisa dar, conhecidos o torque do equipamento e a relação do redutor (Petrobras 2011), e o torque na última engrenagem de um trem (Transpetro 2018). Sem perdas, **torque × rotação** é constante.',
      body: 'Sem perdas, a **potência** que entra é a que sai:\n\n**P = T·ω** → T_{1}·ω_{1} = T_{2}·ω_{2} → **T_{2} = T_{1}·z_{2}/z_{1}**\n\nO redutor troca rotação por torque: se a rotação cai 5 vezes, o torque **sobe** 5 vezes. Por isso o **eixo de saída** de um redutor é o mais solicitado — e o mais grosso.\n\nNo contato entre os dentes age a **força tangencial** F_{t} = 2·T/D, a mesma no pinhão e na coroa (ação e reação).\n\nCom perdas, cada engrenamento tem rendimento η: P_{saída} = η·P_{entrada}, e o motor precisa de **T_{motor} = T_{saída}·i/η**.\n\nUnidades: ω = 2π·n/60 (n em rpm) e P em W = N·m/s.',
      example: 'Um equipamento precisa de 1,2 kN·m num eixo que gira 8 vezes mais devagar que o motor (redução 8:1, sem perdas): T_{motor} = 1.200/8 = **150 N·m**. A 1.760 rpm, P = 150 × 2π × 1.760/60 ≈ **27,6 kW**.',
      tip: 'O **torque** acompanha o **diâmetro** (ou os dentes); a **rotação** acompanha o **inverso**. O produto — a potência — fica igual.',
      trap: 'Achar que o redutor "ganha" potência. Ele multiplica o torque à custa da rotação — e, com atrito, ainda perde um pouco.',
      lab: { lab: 'gears', preset: { two: 1, idler: 0, z1: 20, z2: 60, z3: 15, z4: 75, eta: 1 }, label: 'Torque e rotação em cada eixo' },
    },
    {
      title: 'Trens de engrenagens e a engrenagem intermediária',
      hot: 'Trens com duas engrenagens no mesmo eixo ou com uma intermediária (Transpetro 2018, Petrobras 2018, BR 2012): a relação total é o **produto** dos pares, e a intermediária só inverte o sentido.',
      body: 'Num **trem composto**, duas engrenagens dividem o **mesmo eixo** (giram juntas), e a relação total é o **produto** das relações de cada par:\n\n**i = (z_{1}/z_{2})·(z_{3}/z_{4})·…**\n\nUma **engrenagem intermediária** ("louca"), entre o pinhão e a coroa, gira solta no seu eixo:\n- **inverte o sentido** de giro da coroa;\n- **não muda a relação**: (z_{1}/z_{i})·(z_{i}/z_{2}) = z_{1}/z_{2}, qualquer que seja o número de dentes dela;\n- o eixo dela **não transmite torque** (ela recebe e repassa a mesma força nos dentes).\n\nSentido de giro: com k engrenamentos externos em sequência, a saída gira no mesmo sentido da entrada se k for par.',
      example: 'Pares 20/60 e 15/75: i = (1/3)·(1/5) = **1/15**. Motor a 1.800 rpm → saída a **120 rpm**, com 15 vezes o torque.',
      trap: 'Usar o número de dentes da intermediária na conta da relação: ele se cancela.',
      lab: { lab: 'gears', preset: { two: 0, idler: 1, zi: 30, z1: 20, z2: 60 }, label: 'Pôr uma intermediária' },
    },
    {
      title: 'Torque nos eixos e tensão de torção',
      body: 'Um trecho de eixo só transmite torque **entre o ponto onde o torque entra e o ponto onde ele sai**: do motor até o pinhão, da coroa até o pinhão seguinte, da última coroa até a carga. Além desses pontos (pontas livres, mancais), o torque é **zero**.\n\nSe um mesmo eixo aciona várias engrenagens, o trecho junto ao motor carrega a **soma** dos torques que saem depois dele — é a seção mais solicitada.\n\nTensão de cisalhamento por torção num eixo maciço:\n\n**τ = 16·T/(π·d³)**\n\nCom o mesmo diâmetro, o eixo de maior torque (o de **saída** de um redutor) tem a maior tensão. Para manter τ, o diâmetro cresce com ∛T.',
      example: 'Redutor 2:1 seguido de outro 4:1, com eixos iguais e sem perdas: se o eixo do motor tem τ_{1}, o intermediário tem **2·τ_{1}** e o de saída, **8·τ_{1}**.',
      tip: 'Dobrar o diâmetro divide a tensão de torção por **8**.',
      lab: { lab: 'gears', preset: { two: 1, idler: 0, z1: 20, z2: 60, z3: 15, z4: 75, d: 40 }, label: 'Ver os trechos com torque' },
    },
    {
      title: 'Correias, correntes e acoplamentos',
      hot: 'Motor ligado à bomba por **acionamento direto** = **acoplamento** (Transpetro 2018). Correia, corrente e redutor aparecem como distratores.',
      body: 'Formas de transmitir rotação entre eixos:\n- **Engrenagens**: transmissão **direta** (contato entre os dentes), sem escorregamento, relação exata, eixos próximos.\n- **Correias** (planas ou em V): transmissão **indireta**, por um elemento flexível; ligam eixos distantes e amortecem choques, mas podem **deslizar** — a relação não é exata. Correia aberta mantém o sentido de giro; **cruzada inverte**.\n- **Correntes**: indiretas, sem deslizamento, para cargas altas e eixos distantes.\n- **Acoplamentos** (rígidos ou elásticos): ligam eixos alinhados, na relação 1:1.\n\nAtenção ao nome: entre um motor e uma bomba (ou compressor), **acionamento direto** é o eixo do motor ligado ao da máquina por um **acoplamento**, na mesma rotação. Com correia, corrente ou redutor no meio, o acionamento é **indireto**.\n\nPolias: n_{1}·D_{1} = n_{2}·D_{2} (sem deslizamento), e a potência transmitida é P = (T_{1} − T_{2})·v, com T_{1} e T_{2} as forças nos ramos tenso e frouxo.',
      example: 'Motor a 1.750 rpm com polia de 100 mm acionando uma polia de 350 mm: n_{2} = 1.750 × 100/350 = **500 rpm**.',
      trap: 'Correia **escorrega**: a relação de uma transmissão por correia não é tão exata quanto a de engrenagens ou correntes.',
    },
    {
      title: 'Princípio de D’Alembert e esforços dinâmicos',
      hot: 'Barra de mecanismo com a aceleração do centro de massa dada: a resultante das forças nos pinos tem o **sentido de a_{G}** (Transpetro 2018, Petrobras 2018). Barra ou polia com forças desiguais: o momento dá o sentido da **aceleração** angular (Transpetro 2011 e 2012).',
      body: 'Para um corpo rígido em movimento plano:\n\n**ΣF = m·a_{G}** e **ΣM_{G} = I_{G}·α**\n\n(G = centro de massa). O **princípio de D’Alembert** transforma isso num problema de "estática": somando a **força de inércia −m·a_{G}** e o **binário de inércia −I_{G}·α**, o corpo fica em **equilíbrio dinâmico**.\n\nConsequências que a banca adora:\n- a **resultante** das forças na barra vale m·a_{G} e tem o **mesmo sentido de a_{G}**;\n- se a barra tem **α = 0**, o momento resultante em relação a G é **zero**: a resultante passa por G;\n- se as forças produzem momento em relação a G, a barra tem α ≠ 0 no sentido desse momento — mas a **velocidade angular** pode ter qualquer sentido.\n\nOs esforços de inércia crescem com ω²: dobrar a rotação de um rotor desbalanceado **quadruplica** a força nos mancais.',
      example: 'Barra de 4 kg de um mecanismo no plano horizontal (o peso não entra), com a_{G} = 3 m/s² e α = 0: as forças nos pinos somam 4 × 3 = **12 N**, no sentido de a_{G}, com linha de ação passando por G.',
      trap: 'Confundir **aceleração angular** com **velocidade angular**: o momento resultante dá o sentido de α, não o de ω.',
    },
    {
      title: 'Mecanismo biela-manivela',
      hot: 'O que se anula numa posição desenhada — velocidade do pistão, aceleração do pistão ou velocidade angular da biela (Petrobras 2010, 2014 e 2018) — e a velocidade do pistão e o torque na manivela numa posição dada (BR 2012).',
      body: 'A **manivela** OA gira; a **biela** AB liga a manivela ao **pistão** B, que vai e vem numa linha (o curso).\n- **Pontos mortos** (manivela alinhada com a biela): a velocidade do pistão é **zero**, mas a aceleração **não** — é ali que ele inverte o sentido. Em módulo, a maior aceleração do ciclo ocorre no ponto morto superior.\n- **Manivela perpendicular à linha do curso**: A e B têm a mesma velocidade, a biela **translada** naquele instante → **ω_{biela} = 0**, e o pistão anda a ≈ ω·r.\n- A velocidade máxima do pistão ocorre **perto** de quando manivela e biela ficam perpendiculares; nesse ponto de máximo, a aceleração do pistão é zero.\n- Com a manivela a ω constante, o pino A tem só aceleração **centrípeta**, ω²·r, apontando para O.\n\n**Centro instantâneo de rotação** (CIR) da biela: o encontro da reta OA (prolongada) com a perpendicular ao curso traçada por B. As velocidades de A e de B são perpendiculares às retas que os ligam ao CIR.\n\nO curso do pistão vale **2·r**.',
      example: 'Manivela de 5 cm a 3.000 rpm (ω ≈ 314 rad/s): curso de 10 cm; o pino A tem aceleração ω²·r ≈ 314² × 0,05 ≈ **4.900 m/s²**, sempre apontando para o centro O.',
      trap: 'Dizer que, nos pontos mortos, o pistão tem aceleração nula. É a **velocidade** que zera; a aceleração é máxima em módulo.',
    },
    {
      title: 'Estruturas e mecanismos: graus de liberdade',
      hot: 'Cadeira de quatro apoios = **hiperestática** (Petrobras 2011); quais estruturas de um desenho ainda têm grau de liberdade de corpo rígido, isto é, são **hipostáticas** (Petrobras 2011).',
      body: 'Um corpo rígido no plano tem **3 graus de liberdade** (2 translações e 1 rotação). Os vínculos retiram graus de liberdade:\n- apoio móvel (rolete): 1 reação;\n- apoio fixo (articulação): 2 reações;\n- engaste: 3 reações.\n\nClassificação de uma estrutura:\n- **hipostática**: vínculos **a menos** — sobra grau de liberdade e ela **se move** (vira um **mecanismo**);\n- **isostática**: o necessário — as reações saem só das equações de equilíbrio;\n- **hiperestática**: vínculos **a mais** — as equações da estática não bastam (é preciso considerar as deformações). Exemplos: viga engastada e apoiada; **uma mesa de quatro pés** apoiada no piso.\n\nRetirar um vínculo "sobrando" de uma estrutura hiperestática de grau 1 a torna isostática.\n\nMecanismos planos (critério de Gruebler): **GL = 3·(n − 1) − 2·j_{1} − j_{2}**, com n barras (incluindo a fixa), j_{1} pares de 1 grau (pinos, corrediças) e j_{2} pares de 2 graus (came, contato entre dentes). O quadrilátero articulado (4 barras e 4 pinos) tem GL = 1.',
      example: 'Biela-manivela: 4 corpos (base, manivela, biela, pistão), 3 pinos e 1 corrediça → GL = 3 × 3 − 2 × 4 = **1**: basta girar a manivela para definir tudo.',
      trap: 'Achar que "mais apoios = isostática". Apoios a mais tornam a estrutura **hiperestática**; a menos, **hipostática**.',
    },
  ],
  roteiros: [
    {
      id: 'relacao-transmissao',
      name: 'Relação de transmissão (engrenagens e polias)',
      when: 'Pinhão, coroa, intermediária ou polias com correia; pedem a rotação de saída, o sentido ou a relação.',
      steps: [
        'A velocidade no contato (ou na correia) é a mesma: n₁·z₁ = n₂·z₂ (polias: n₁·D₁ = n₂·D₂).',
        'Monte a relação par a par; num trem composto, multiplique os pares (a intermediária se cancela).',
        'Calcule a rotação de saída e confira o sentido: cada engrenamento externo inverte.',
      ],
      note: 'Roda maior gira mais devagar. A intermediária não muda a relação, só o sentido. Correia aberta: mesmo sentido; cruzada: inverte.',
    },
    {
      id: 'potencia-torque',
      name: 'Potência, torque e rotação (P = T·ω)',
      when: 'Motor, redutor ou eixo; pedem o torque ou a potência, sabendo a rotação ou a relação de redução.',
      steps: [
        'Passe a rotação para rad/s (ω = 2π·n/60) ou veja quantas vezes a saída é mais lenta.',
        'Use P = T·ω; sem perdas, a potência é a mesma em todos os eixos do redutor.',
        'Isole a incógnita: eixo mais lento → torque maior, na mesma proporção.',
      ],
      note: 'Redutor não cria potência: multiplica o torque e divide a rotação na mesma proporção.',
    },
    {
      id: 'torcao',
      name: 'Tensão de torção num eixo maciço',
      when: 'Eixo maciço com um torque (ou potência e rotação); pedem a tensão de cisalhamento ou o diâmetro.',
      steps: [
        'Passe o torque para N·mm (× 1.000) e mantenha o diâmetro em mm.',
        'Use τ = 16·T/(π·d³): eixo maciço, máximo na superfície.',
        'Calcule: N/mm² = MPa.',
      ],
      note: 'Dobrar o diâmetro divide a tensão por 8. Num redutor, o eixo de saída (mais lento) tem o maior torque.',
    },
    {
      id: 'binario-inercia',
      name: 'Dinâmica de uma barra do mecanismo',
      when: 'Barra de mecanismo (biela) com aceleração; pedem o momento resultante ou a resultante das forças nos pinos.',
      steps: [
        'Momento de inércia pelo centro de massa: barra homogênea, I_{G} = m·L²/12.',
        'Translação: ΣF = m·a_{G}. Rotação: ΣM_{G} = I_{G}·α.',
        'Calcule — ou, por D’Alembert, some −m·a_{G} e −I_{G}·α e resolva como equilíbrio.',
      ],
      note: 'Com α = 0, ΣM_{G} = 0: a resultante passa pelo centro de massa.',
    },
  ],
  questions: [
    {
      id: 'mec-mec-01',
      type: 'gen',
      difficulty: 1,
      lessonRef: 0,
      title: 'Rotação da coroa',
      roteiro: 'relacao-transmissao',
      generate(rng) {
        const z1 = pickOne(rng, [12, 15, 16, 18, 20, 24, 25, 30]);
        const k = pickOne(rng, z1 % 2 === 0 ? [2, 2.5, 3, 4, 5] : [2, 3, 4, 5]);
        const z2 = z1 * k;
        const n1 = pickOne(rng, [900, 1200, 1750, 1800, 3500, 3600]);
        const n2 = n1 / k;
        const { options, answer } = numericOptions({
          correct: n2,
          unit: 'rpm',
          digits: 1,
          correctWhy: `n₂ = n₁·z₁/z₂ = ${fmt(n1, 0)} × ${z1}/${z2} = ${fmt(n2, 1)} rpm.`,
          distractors: [
            { value: n1 * k, why: 'Inverteu a razão: a coroa, maior, gira mais devagar.' },
            { value: n1, why: 'As rotações só seriam iguais com o mesmo número de dentes.' },
            { value: n1 / (k * k), why: 'Elevou a relação ao quadrado: a rotação cai na proporção z₁/z₂.' },
            { value: (n1 * z1) / (z1 + z2), why: 'Somou os dentes: a relação é z₁/z₂.' },
          ],
        });
        return {
          prompt: `Um pinhão de ${z1} dentes, preso ao eixo de um motor que gira a ${fmt(n1, 0)} rpm, aciona uma coroa de ${z2} dentes. A rotação da coroa é`,
          options,
          answer,
          hint: 'No ponto de contato a velocidade é a mesma: n₁·z₁ = n₂·z₂.',
          steps: [
            `n₁·z₁ = n₂·z₂, com z₁ = ${z1} e z₂ = ${z2}.`,
            `Um par só: n₂ = n₁·z₁/z₂ = ${fmt(n1, 0)} × ${z1}/${z2}.`,
            `n₂ = **${fmt(n2, 1)} rpm** — ${fmt(k, 1)} vezes mais devagar, no sentido contrário.`,
          ],
          explanation: `1. Velocidade igual no contato: n₁·z₁ = n₂·z₂.\n2. n₂ = ${fmt(n1, 0)} × ${z1}/${z2} = **${fmt(n2, 1)} rpm** — ${fmt(k, 1)} vezes mais devagar, no sentido contrário.`,
        };
      },
    },
    {
      id: 'mec-mec-02',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Torque no eixo do motor',
      roteiro: 'potencia-torque',
      generate(rng) {
        const red = pickOne(rng, [4, 5, 8, 10, 12, 15, 20, 25]);
        const Tc = pickOne(rng, [0.6, 0.8, 1.2, 1.5, 2, 2.4, 3, 4.5]);
        const Tm = (Tc * 1000) / red;
        const { options, answer } = numericOptions({
          correct: Tm,
          unit: 'N·m',
          digits: 1,
          correctWhy: `Sem perdas, P = T·ω é igual nos dois eixos: T_motor = ${fmt(Tc * 1000, 0)}/${red} = ${fmt(Tm, 1)} N·m.`,
          distractors: [
            { value: Tc * 1000 * red, why: 'Multiplicou pela redução: o motor, que gira mais rápido, precisa de menos torque.' },
            { value: Tc * 1000, why: 'O torque só seria igual sem redução.' },
            { value: Tc / red, why: 'Esqueceu de converter kN·m para N·m.' },
            { value: (Tc * 1000) / (red * red), why: 'Dividiu pela redução duas vezes.' },
          ],
        });
        return {
          prompt: `Um equipamento é acionado por um motor elétrico por meio de um redutor de engrenagens com relação de transmissão 1/${red}: o eixo de saída gira ${red} vezes mais devagar que o motor. O equipamento exige ${fmt(Tc, 1)} kN·m no eixo de saída. Desprezando as perdas, o torque no eixo do motor é`,
          options,
          answer,
          hint: 'P = T·ω é a mesma na entrada e na saída: quem gira mais rápido precisa de menos torque.',
          steps: [
            `A saída é ${red} vezes mais lenta: ω_{saída} = ω_{motor}/${red}.`,
            `Sem perdas: T_{motor}·ω_{motor} = T_{saída}·ω_{saída} → T_{motor} = T_{saída}/${red}.`,
            `T_{motor} = ${fmt(Tc * 1000, 0)}/${red} = **${fmt(Tm, 1)} N·m**.`,
          ],
          explanation: `1. Sem perdas: T_motor·ω_motor = T_saída·ω_saída.\n2. ω_saída = ω_motor/${red} → T_motor = T_saída/${red}.\n3. T_motor = ${fmt(Tc * 1000, 0)}/${red} = **${fmt(Tm, 1)} N·m**.`,
        };
      },
    },
    {
      id: 'mec-mec-03',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Torque na saída de um trem composto',
      roteiro: 'potencia-torque',
      generate(rng) {
        const z1 = pickOne(rng, [12, 15, 18, 20, 24]);
        const k1 = pickOne(rng, [2, 3, 4]);
        const z3 = pickOne(rng, [12, 16, 18, 20, 24]);
        const k2 = pickOne(rng, [1.5, 2, 2.5, 3]);
        const z2 = z1 * k1;
        const z4 = z3 * k2;
        const T1 = pickOne(rng, [20, 40, 50, 60, 80, 100, 150, 200]);
        const Tout = T1 * k1 * k2;
        const { options, answer } = numericOptions({
          correct: Tout,
          unit: 'N·m',
          digits: 1,
          correctWhy: `T_saída = T₁·(z₂/z₁)·(z₄/z₃) = ${T1} × ${fmt(k1, 1)} × ${fmt(k2, 1)} = ${fmt(Tout, 1)} N·m.`,
          distractors: [
            { value: T1 * k1, why: 'Considerou só o 1º par: o torque é multiplicado de novo no 2º.' },
            { value: T1 * k2, why: 'Considerou só o 2º par.' },
            { value: T1 * (k1 + k2), why: 'Somou as reduções: num trem composto, elas se multiplicam.' },
            { value: T1 / (k1 * k2), why: 'Dividiu: numa redução, o torque sobe.' },
          ],
        });
        return {
          prompt: `Num redutor de dois pares, o pinhão do motor (${z1} dentes) engrena numa coroa de ${z2} dentes; no mesmo eixo dessa coroa, um pinhão de ${z3} dentes engrena na coroa de saída, de ${z4} dentes. Se o motor fornece ${T1} N·m, o torque no eixo de saída, desprezando as perdas, é`,
          options,
          answer,
          hint: 'Cada par multiplica o torque pela razão coroa/pinhão. Os dois pares se multiplicam.',
          steps: [
            `Cada par divide a rotação pela razão coroa/pinhão: ${z2}/${z1} = ${fmt(k1, 1)} e ${z4}/${z3} = ${fmt(k2, 1)}.`,
            `Sem perdas a potência se conserva: o torque é multiplicado pelas mesmas razões.`,
            `T_{saída} = ${T1} × ${fmt(k1, 1)} × ${fmt(k2, 1)} = **${fmt(Tout, 1)} N·m** (redução total ${fmt(k1 * k2, 2)}:1).`,
          ],
          explanation: `1. 1º par: ×${z2}/${z1} = ×${fmt(k1, 1)}.\n2. 2º par: ×${z4}/${z3} = ×${fmt(k2, 1)}.\n3. T_saída = ${T1} × ${fmt(k1, 1)} × ${fmt(k2, 1)} = **${fmt(Tout, 1)} N·m** (redução total ${fmt(k1 * k2, 2)}:1).`,
        };
      },
    },
    {
      id: 'mec-mec-04',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Potência num eixo',
      roteiro: 'potencia-torque',
      generate(rng) {
        const T = pickOne(rng, [20, 40, 50, 80, 100, 120, 150, 200, 250, 400]);
        const n = pickOne(rng, [600, 900, 1200, 1500, 1800, 3000, 3600]);
        const P = (T * TAU * n) / 60 / 1000;
        const { options, answer } = numericOptions({
          correct: P,
          unit: 'kW',
          digits: 2,
          correctWhy: `ω = 2π·${fmt(n, 0)}/60 = ${fmt((TAU * n) / 60, 1)} rad/s → P = T·ω = ${T} × ${fmt((TAU * n) / 60, 1)} ≈ ${fmt(P, 2)} kW.`,
          distractors: [
            { value: (T * n) / 1000, why: 'Usou a rotação em rpm direto: converta para rad/s (×2π/60).' },
            { value: (T * n) / 60 / 1000, why: 'Converteu para rotações por segundo, mas faltou o 2π.' },
            { value: (T * TAU * n) / 1000, why: 'Faltou dividir por 60 (minuto → segundo).' },
            { value: (T * 60) / (TAU * n), why: 'Dividiu o torque pela rotação: P = T·ω.' },
          ],
        });
        return {
          prompt: `Um eixo transmite um torque de ${T} N·m girando a ${fmt(n, 0)} rpm. A potência transmitida é aproximadamente`,
          options,
          answer,
          hint: 'P = T·ω, com ω em rad/s: ω = 2π·n/60.',
          steps: [
            `ω = 2π × ${fmt(n, 0)}/60 = ${fmt((TAU * n) / 60, 2)} rad/s.`,
            `P = T·ω = ${T} × ${fmt((TAU * n) / 60, 2)}.`,
            `P = ${fmt(P * 1000, 0)} W ≈ **${fmt(P, 2)} kW**.`,
          ],
          explanation: `1. ω = 2π × ${fmt(n, 0)}/60 = ${fmt((TAU * n) / 60, 2)} rad/s.\n2. P = T·ω = ${T} × ${fmt((TAU * n) / 60, 2)} = ${fmt(P * 1000, 0)} W ≈ **${fmt(P, 2)} kW**.`,
        };
      },
    },
    {
      id: 'mec-mec-05',
      type: 'gen',
      difficulty: 1,
      lessonRef: 4,
      title: 'Polias e correia',
      roteiro: 'relacao-transmissao',
      generate(rng) {
        const D1 = pickOne(rng, [80, 100, 120, 160, 200]);
        const k = pickOne(rng, [1.5, 2, 2.5, 3, 4]);
        const D2 = D1 * k;
        const n1 = pickOne(rng, [1150, 1450, 1750, 3500]);
        const n2 = n1 / k;
        const { options, answer } = numericOptions({
          correct: n2,
          unit: 'rpm',
          digits: 1,
          correctWhy: `n₂ = n₁·D₁/D₂ = ${fmt(n1, 0)} × ${D1}/${D2} = ${fmt(n2, 1)} rpm.`,
          distractors: [
            { value: n1 * k, why: 'Inverteu a razão: a polia maior gira mais devagar.' },
            { value: n1, why: 'A correia mantém a mesma velocidade linear, não a mesma rotação.' },
            { value: n1 / (k * k), why: 'Elevou a razão dos diâmetros ao quadrado.' },
            { value: (n1 * D1) / (D1 + D2), why: 'Somou os diâmetros: a relação é D₁/D₂.' },
          ],
        });
        return {
          prompt: `Um motor a ${fmt(n1, 0)} rpm tem uma polia de ${D1} mm que aciona, por correia, uma polia de ${D2} mm. Sem deslizamento da correia, a rotação da polia movida é`,
          options,
          answer,
          hint: 'A correia tem a mesma velocidade nas duas polias: n₁·D₁ = n₂·D₂.',
          steps: [
            `Correia sem deslizar: n₁·D₁ = n₂·D₂, com D₁ = ${D1} mm e D₂ = ${D2} mm.`,
            `n₂ = n₁·D₁/D₂ = ${fmt(n1, 0)} × ${D1}/${D2}.`,
            `n₂ = **${fmt(n2, 1)} rpm** (correia aberta: mesmo sentido).`,
          ],
          explanation: `1. Velocidade da correia igual nas duas polias: π·D₁·n₁ = π·D₂·n₂.\n2. n₂ = ${fmt(n1, 0)} × ${D1}/${D2} = **${fmt(n2, 1)} rpm**.`,
        };
      },
    },
    {
      id: 'mec-mec-06',
      type: 'gen',
      difficulty: 3,
      lessonRef: 3,
      title: 'Tensão de torção num eixo',
      roteiro: 'torcao',
      generate(rng) {
        const T = pickOne(rng, [200, 300, 400, 500, 600, 800, 1000, 1500, 2000]);
        const d = pickOne(rng, [30, 40, 50, 60, 70, 80]);
        const tau = (16 * T * 1000) / (Math.PI * d ** 3);
        const { options, answer } = numericOptions({
          correct: tau,
          unit: 'MPa',
          digits: 1,
          correctWhy: `τ = 16·T/(π·d³) = 16 × ${fmt(T * 1000, 0)}/(π × ${d}³) = ${fmt(tau, 1)} MPa.`,
          distractors: [
            { value: 2 * tau, why: 'Usou 32·T/(π·d³): 32 aparece no momento polar J = π·d⁴/32, mas τ = T·(d/2)/J = 16·T/(π·d³).' },
            { value: 8 * tau, why: 'Usou o raio no lugar do diâmetro em 16·T/(π·d³).' },
            { value: tau * Math.PI, why: 'Esqueceu o π no denominador.' },
            { value: tau / 2, why: 'Usou 8·T/(π·d³).' },
          ],
        });
        return {
          prompt: `Um eixo maciço de ${d} mm de diâmetro transmite um torque de ${fmt(T, 0)} N·m. A tensão de cisalhamento máxima por torção, na superfície do eixo, é aproximadamente`,
          options,
          answer,
          hint: 'τ = 16·T/(π·d³). Com T em N·mm e d em mm, τ sai em MPa.',
          steps: [
            `T = ${fmt(T, 0)} N·m = ${fmt(T * 1000, 0)} N·mm; d = ${d} mm.`,
            `τ = 16·T/(π·d³), com d³ = ${fmt(d ** 3, 0)} mm³.`,
            `τ = 16 × ${fmt(T * 1000, 0)}/(π × ${fmt(d ** 3, 0)}) ≈ **${fmt(tau, 1)} MPa**.`,
          ],
          explanation: `1. T = ${fmt(T, 0)} N·m = ${fmt(T * 1000, 0)} N·mm.\n2. d³ = ${d}³ = ${fmt(d ** 3, 0)} mm³.\n3. τ = 16 × ${fmt(T * 1000, 0)}/(π × ${fmt(d ** 3, 0)}) ≈ **${fmt(tau, 1)} MPa**.`,
        };
      },
    },
    {
      id: 'mec-mec-07',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Engrenagem intermediária',
      roteiro: 'relacao-transmissao',
      generate(rng) {
        const z1 = pickOne(rng, [16, 18, 20, 24, 25, 30]);
        const zi = pickOne(rng, [22, 28, 35, 40, 45]);
        const k = pickOne(rng, [2, 3, 4]);
        const z2 = z1 * k;
        const n1 = pickOne(rng, [900, 1200, 1800, 3600]);
        const n2 = n1 / k;
        const { options, answer } = numericOptions({
          correct: n2,
          unit: 'rpm',
          digits: 1,
          correctWhy: `A intermediária se cancela: n₂ = n₁·z₁/z₂ = ${fmt(n1, 0)} × ${z1}/${z2} = ${fmt(n2, 1)} rpm.`,
          distractors: [
            { value: (n1 * z1) / zi, why: 'Parou na intermediária: essa é a rotação dela.' },
            { value: (n1 * zi) / z2, why: 'Tratou a intermediária como se fosse a engrenagem motora.' },
            { value: n1 * k, why: 'Inverteu a razão.' },
            { value: (n1 * z1 * zi) / (z2 * z2), why: 'Multiplicou as razões de um jeito que não se cancela: (z₁/z_i)·(z_i/z₂) = z₁/z₂.' },
          ],
        });
        return {
          prompt: `Um pinhão de ${z1} dentes, a ${fmt(n1, 0)} rpm, aciona uma coroa de ${z2} dentes por meio de uma engrenagem intermediária de ${zi} dentes. A rotação da coroa é`,
          options,
          answer,
          hint: 'Faça par a par: pinhão → intermediária → coroa. Os dentes da intermediária aparecem em cima e embaixo.',
          steps: [
            `Pinhão → intermediária: n_{i} = ${fmt(n1, 0)} × ${z1}/${zi} = ${fmt((n1 * z1) / zi, 1)} rpm.`,
            `Intermediária → coroa: n₂ = n_{i} × ${zi}/${z2} — os ${zi} dentes se cancelam: n₂ = n₁·z₁/z₂.`,
            `n₂ = ${fmt(n1, 0)} × ${z1}/${z2} = **${fmt(n2, 1)} rpm**, no mesmo sentido do pinhão (dois engrenamentos).`,
          ],
          explanation: `1. Pinhão → intermediária: n_i = ${fmt(n1, 0)} × ${z1}/${zi} = ${fmt((n1 * z1) / zi, 1)} rpm.\n2. Intermediária → coroa: n₂ = n_i × ${zi}/${z2} = **${fmt(n2, 1)} rpm** — o mesmo que ${fmt(n1, 0)} × ${z1}/${z2}.\n3. A intermediária só **inverte o sentido**: a coroa gira no mesmo sentido do pinhão.`,
        };
      },
    },
    {
      id: 'mec-mec-08',
      type: 'gen',
      difficulty: 3,
      lessonRef: 5,
      title: 'Binário de inércia de uma biela',
      roteiro: 'binario-inercia',
      generate(rng) {
        const m = pickOne(rng, [2, 3, 4, 6, 8]);
        const L = pickOne(rng, [0.3, 0.5, 0.6, 0.9, 1.2]);
        const alpha = pickOne(rng, [10, 20, 25, 40, 50, 100]);
        const IG = (m * L * L) / 12;
        const M = IG * alpha;
        const { options, answer } = numericOptions({
          correct: M,
          unit: 'N·m',
          digits: 2,
          correctWhy: `I_G = m·L²/12 = ${fmt(IG, 4)} kg·m² → ΣM_G = I_G·α = ${fmt(IG, 4)} × ${alpha} = ${fmt(M, 2)} N·m.`,
          distractors: [
            { value: ((m * L * L) / 3) * alpha, why: 'Usou o momento de inércia em relação à ponta (m·L²/3); em relação a G, é m·L²/12.' },
            { value: m * L * L * alpha, why: 'Usou m·L², como se toda a massa estivesse na ponta.' },
            { value: m * L * alpha, why: 'Esqueceu de elevar L ao quadrado.' },
            { value: ((m * L * L) / 12) * alpha * alpha, why: 'Elevou α ao quadrado: ΣM_G = I_G·α.' },
          ],
        });
        return {
          prompt: `A biela de um mecanismo, uma barra homogênea de ${m} kg e ${fmt(L, 1)} m, tem num certo instante aceleração angular de ${alpha} rad/s². O momento resultante das forças sobre a biela, em relação ao seu centro de massa, é`,
          options,
          answer,
          hint: 'ΣM_G = I_G·α, com I_G = m·L²/12 para uma barra em relação ao centro.',
          steps: [
            `I_{G} = ${m} × ${fmt(L, 1)}²/12 = ${fmt(IG, 4)} kg·m².`,
            `ΣM_{G} = I_{G}·α = ${fmt(IG, 4)} × ${alpha}.`,
            `ΣM_{G} = **${fmt(M, 2)} N·m**.`,
          ],
          explanation: `1. Barra pelo centro: I_G = m·L²/12 = ${m} × ${fmt(L, 1)}²/12 = ${fmt(IG, 4)} kg·m².\n2. ΣM_G = I_G·α = ${fmt(IG, 4)} × ${alpha} = **${fmt(M, 2)} N·m**.\n3. Por D’Alembert, é como somar um binário de inércia −I_G·α e tratar a biela em equilíbrio.`,
        };
      },
    },
    {
      id: 'mec-mec-09',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Um pinhão aciona uma coroa com o **triplo** de dentes. Comparada ao pinhão, e desprezando as perdas, a coroa gira',
      options: [
        { text: 'com um terço da rotação, no sentido contrário, e com o triplo do torque.', why: 'Correta: rotação ∝ 1/z, torque ∝ z, e o engrenamento externo inverte o sentido.' },
        { text: 'com o triplo da rotação e um terço do torque.', why: 'Inverteu: a engrenagem maior gira mais devagar.' },
        { text: 'com um terço da rotação, no mesmo sentido, e com o mesmo torque.', why: 'Engrenamento externo inverte o sentido; e o torque triplica.' },
        { text: 'com a mesma rotação, porque a velocidade no contato é a mesma.', why: 'A velocidade **tangencial** é a mesma; a rotação, não.' },
        { text: 'com um terço da rotação e um terço do torque.', why: 'Assim a potência cairia a 1/9.' },
      ],
      answer: 0,
      roteiro: 'relacao-transmissao',
      steps: [
        'n₁·z₁ = n₂·z₂, com z₂ = 3·z₁.',
        'Um par só: n₂ = n₁/3.',
        'Um terço da rotação, no **sentido contrário** (engrenamento externo) e, como P = T·ω se conserva, com o **triplo do torque**.',
      ],
      explanation: 'n_{2} = n_{1}·z_{1}/z_{2} = n_{1}/3 e, como P = T·ω se conserva, T_{2} = 3·T_{1}. Cada engrenamento externo **inverte** o sentido de giro.',
    },
    {
      id: 'mec-mec-10',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Num par pinhão-coroa com uma engrenagem intermediária entre eles, a intermediária de 30 dentes é trocada por outra de 45 dentes, de mesmo módulo (ajustando a distância entre os eixos). A rotação da coroa',
      options: [
        { text: 'não muda: a relação continua z(pinhão)/z(coroa).', why: 'Correta: os dentes da intermediária se cancelam.' },
        { text: 'cai para 2/3 do valor anterior.', why: 'Só a rotação da própria intermediária cai para 2/3.' },
        { text: 'aumenta 50 %.', why: 'A intermediária não altera a relação entre pinhão e coroa.' },
        { text: 'inverte de sentido.', why: 'Com uma intermediária, o sentido já está invertido; trocar o tamanho dela não muda isso.' },
        { text: 'cai pela metade.', why: 'Não há motivo para isso.' },
      ],
      answer: 0,
      roteiro: 'relacao-transmissao',
      steps: [
        'Par a par: pinhão → intermediária → coroa, com a mesma velocidade em cada contato.',
        '(z_{1}/z_{i})·(z_{i}/z_{2}) = z_{1}/z_{2}: os dentes da intermediária se cancelam.',
        'A rotação da coroa **não muda**; a intermediária só inverte o sentido e vence a distância entre os eixos.',
      ],
      explanation: '(z_{1}/z_{i})·(z_{i}/z_{2}) = z_{1}/z_{2}: o número de dentes da intermediária não entra no resultado. Ela só serve para **inverter o sentido** ou para vencer a distância entre os eixos.',
    },
    {
      id: 'mec-mec-11',
      difficulty: 1,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Qual destas transmissões liga dois eixos por **contato direto** entre os elementos, sem um elemento flexível intermediário?',
      options: [
        { text: 'Par de engrenagens.', why: 'Correta: os dentes de uma tocam os da outra.' },
        { text: 'Correia em V.', why: 'A correia é um elemento flexível intermediário.' },
        { text: 'Corrente de rolos.', why: 'A corrente também é um elemento intermediário.' },
        { text: 'Correia sincronizadora (dentada).', why: 'Mesmo dentada, é uma correia: transmissão indireta.' },
        { text: 'Cabo de aço com polias.', why: 'O cabo é o elemento intermediário.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **contato direto**, sem elemento flexível.',
        'Engrenagens e rodas de atrito transmitem por contato direto; correias, correntes e cabos são indiretas, com elemento flexível.',
        'Fica **par de engrenagens**.',
      ],
      explanation: 'Engrenagens (e rodas de atrito) transmitem por **contato direto**. Correias, correntes e cabos são transmissões **indiretas**, por um elemento flexível — úteis para eixos distantes.',
    },
    {
      id: 'mec-mec-12',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Num redutor de dois pares, os três eixos (de entrada, intermediário e de saída) têm o mesmo diâmetro. Desprezando as perdas, a maior tensão de cisalhamento por torção ocorre no eixo',
      options: [
        { text: 'de saída, que transmite o maior torque.', why: 'Correta: τ = 16·T/(π·d³) depende do torque.' },
        { text: 'de entrada, que gira mais rápido.', why: 'A tensão depende do torque, não da rotação; na entrada o torque é o menor.' },
        { text: 'intermediário, que engrena com dois pares.', why: 'O torque dele é intermediário.' },
        { text: 'igual nos três, pois todos transmitem a mesma potência.', why: 'Mesma potência, mas torques diferentes (T = P/ω).' },
        { text: 'nenhum: eixo de redutor só sofre flexão.', why: 'Os eixos transmitem torque: sofrem torção (e também flexão).' },
      ],
      answer: 0,
      roteiro: 'potencia-torque',
      steps: [
        'Os três eixos giram em rotações diferentes: a entrada é a mais rápida; a saída, a mais lenta.',
        'Sem perdas, P é a mesma nos três: T = P/ω.',
        'O eixo de **saída**, o mais lento, tem o maior torque — e, com o mesmo diâmetro, a maior tensão (τ = 16T/(πd³)).',
      ],
      explanation: 'A potência é a mesma, mas T = P/ω: o eixo de **saída**, o mais lento, tem o **maior torque** e, com o mesmo diâmetro, a maior tensão. Por isso os eixos de saída são mais grossos.',
    },
    {
      id: 'mec-mec-13',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Um eixo ABCD está apoiado em mancais nas pontas A e D. Uma polia em B recebe o torque de um motor, e uma engrenagem em C o entrega a uma máquina. Desprezando o atrito nos mancais, o eixo transmite torque',
      options: [
        { text: 'apenas no trecho BC.', why: 'Correta: o torque entra em B e sai em C.' },
        { text: 'nos trechos AB e BC.', why: 'Entre A e B não há torque: A é só um mancal.' },
        { text: 'nos trechos BC e CD.', why: 'Depois de C não há mais nada para receber torque.' },
        { text: 'em todo o eixo, de A a D.', why: 'Mancais não transmitem torque (sem atrito).' },
        { text: 'apenas nos trechos AB e CD.', why: 'É justamente o contrário.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: em que **trecho** o eixo transmite torque.',
        'O torque só existe entre onde ele **entra** (polia em B) e onde **sai** (engrenagem em C); mancais sem atrito não tiram torque.',
        'Fica **apenas no trecho BC**.',
      ],
      explanation: 'O torque só existe **entre o ponto onde entra (B) e o ponto onde sai (C)**. Nos trechos AB e CD, que só chegam aos mancais, o torque é zero — e o diagrama de torque é um "degrau" entre B e C.',
    },
    {
      id: 'mec-mec-14',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Uma barra de um mecanismo no plano horizontal tem, num instante, aceleração angular **nula**, e o seu centro de massa G tem aceleração a_{G} ≠ 0. A resultante das forças que os pinos aplicam na barra',
      options: [
        { text: 'vale m·a_{G}, tem o sentido de a_{G} e passa por G.', why: 'Correta: ΣF = m·a_{G} e, com α = 0, ΣM_{G} = 0.' },
        { text: 'é nula, porque α = 0.', why: 'α = 0 zera o momento em relação a G, não a força resultante.' },
        { text: 'tem o sentido oposto ao de a_{G}.', why: 'Oposta a a_{G} é a força de inércia de D’Alembert, não a resultante real.' },
        { text: 'é perpendicular à barra.', why: 'A direção é a de a_{G}, qualquer que seja a orientação da barra.' },
        { text: 'vale m·a_{G}, mas não passa necessariamente por G.', why: 'Com α = 0, o momento em relação a G é zero: a resultante passa por G.' },
      ],
      answer: 0,
      roteiro: 'binario-inercia',
      steps: [
        'Barra homogênea: I_{G} = m·L²/12 (aqui o valor nem é necessário).',
        'ΣF = m·a_{G} → a resultante tem módulo m·a_{G} e o sentido de a_{G}. ΣM_{G} = I_{G}·α = 0, porque α = 0.',
        'Momento nulo em G → a linha de ação passa **por G**: "vale m·a_{G}, tem o sentido de a_{G} e passa por G".',
      ],
      explanation: 'ΣF = m·a_{G}: a resultante tem a direção e o sentido de a_{G}. Como α = 0, ΣM_{G} = I_{G}·α = 0, e a linha de ação da resultante passa por G. Pelo princípio de D’Alembert, ela equilibra a força de inércia −m·a_{G}.',
    },
    {
      id: 'mec-mec-15',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Num mecanismo biela-manivela, a manivela gira com velocidade angular constante. No instante em que a manivela está **perpendicular à linha do curso do pistão**, é nula a',
      options: [
        { text: 'velocidade angular da biela.', why: 'Correta: A e B têm velocidades paralelas e iguais; a biela translada naquele instante.' },
        { text: 'velocidade do pistão.', why: 'Nessa posição o pistão anda a ≈ ω·r; ele para nos pontos mortos.' },
        { text: 'aceleração do pino que liga a manivela à biela.', why: 'O pino tem aceleração centrípeta ω²·r.' },
        { text: 'velocidade do pino que liga a manivela à biela.', why: 'O pino gira com a manivela: v = ω·r.' },
        { text: 'aceleração do pistão.', why: 'Nessa posição a aceleração do pistão é pequena, mas não zero (por causa da inclinação da biela).' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: manivela **perpendicular** ao curso do pistão.',
        'A velocidade do pino da manivela (perpendicular a ela) fica paralela ao curso, como a do pistão: os dois pontos da biela têm a mesma velocidade, e a biela só translada.',
        'Fica **velocidade angular da biela** nula.',
      ],
      explanation: 'Com a manivela perpendicular ao curso, a velocidade de A (perpendicular à manivela) fica **paralela ao curso**, como a de B. Uma barra cujos dois pontos têm a mesma velocidade **translada**: ω_{biela} = 0 (o centro instantâneo vai para o infinito).',
    },
    {
      id: 'mec-mec-16',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Nos pontos mortos de um mecanismo biela-manivela (manivela alinhada com a biela), o pistão tem',
      options: [
        { text: 'velocidade nula e aceleração diferente de zero.', why: 'Correta: ele para e inverte o sentido.' },
        { text: 'velocidade máxima e aceleração nula.', why: 'É o contrário: a velocidade máxima fica perto do meio do curso.' },
        { text: 'velocidade e aceleração nulas.', why: 'Se a aceleração também fosse nula, o pistão não inverteria o movimento.' },
        { text: 'velocidade máxima e aceleração máxima.', why: 'Nos pontos mortos a velocidade é zero.' },
        { text: 'velocidade constante.', why: 'A velocidade do pistão varia o tempo todo.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **pontos mortos** (manivela alinhada com a biela).',
        'O pistão para para inverter o sentido: v = 0. Parar e voltar exige aceleração — a maior do ciclo fica no ponto morto superior.',
        'Fica **velocidade nula e aceleração diferente de zero**.',
      ],
      explanation: 'Nos pontos mortos o pistão **para** (v = 0) para voltar: a aceleração é diferente de zero — em módulo, a maior do ciclo ocorre no ponto morto superior. É por isso que as forças de inércia do pistão são máximas ali.',
    },
    {
      id: 'mec-mec-17',
      difficulty: 1,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Uma mesa com quatro pés apoiados num piso plano é, do ponto de vista dos vínculos, uma estrutura',
      options: [
        { text: 'hiperestática.', why: 'Correta: três apoios bastariam; o quarto é redundante.' },
        { text: 'isostática.', why: 'Isostática teria só os vínculos necessários (três apoios).' },
        { text: 'hipostática.', why: 'Hipostática teria vínculos a menos e se moveria.' },
        { text: 'um mecanismo de 1 grau de liberdade.', why: 'A mesa não se move: tem vínculos de sobra.' },
        { text: 'instável, por ter apoios demais.', why: 'Apoios a mais não instabilizam: tornam as reações indeterminadas pela estática.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **quatro** apoios para um corpo no piso.',
        'Três apoios não alinhados já bastam para o equilíbrio (isostático); cada apoio a mais é um vínculo sobrando.',
        'Fica **hiperestática** — por isso a mesa manca se um pé for mais curto.',
      ],
      explanation: 'Para um corpo apoiado no piso, três apoios não alinhados já dão equilíbrio; com **quatro**, há um vínculo a mais e as reações não saem só das equações da estática — a estrutura é **hiperestática** (por isso a mesa "manca" se um pé for mais curto).',
    },
    {
      id: 'mec-mec-18',
      difficulty: 2,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Qual destas vigas, carregadas no próprio plano, é **hipostática**?',
      options: [
        { text: 'Viga sobre dois apoios móveis (roletes) num piso horizontal.', why: 'Correta: nada impede o deslizamento horizontal.' },
        { text: 'Viga com um apoio fixo e um apoio móvel.', why: 'É isostática: 3 reações para 3 equações.' },
        { text: 'Viga engastada numa das pontas.', why: 'É isostática: o engaste dá 3 reações.' },
        { text: 'Viga engastada numa ponta e apoiada na outra.', why: 'É hiperestática: 4 reações.' },
        { text: 'Viga com dois apoios fixos.', why: 'É hiperestática: 4 reações.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **hipostática** — vínculos de menos (a peça vira mecanismo).',
        'No plano são necessárias 3 reações independentes. Dois roletes dão só 2 verticais: nada segura a translação horizontal.',
        'Fica **dois apoios móveis**. Fixo + móvel e engaste são isostáticos; com 4 reações, hiperestáticos.',
      ],
      explanation: 'Dois roletes dão só **2 reações verticais**: falta impedir a translação horizontal, e a viga é **hipostática** (um mecanismo). Fixo + móvel e o engaste são isostáticos; com 4 reações, hiperestáticos.',
    },
    {
      id: 'mec-mec-19',
      type: 'ce',
      difficulty: 2,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Num par de engrenagens, a força tangencial que o pinhão aplica nos dentes da coroa tem o mesmo módulo da força que a coroa aplica nos dentes do pinhão.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: **mesmo módulo** da força entre os dentes do pinhão e da coroa.',
        'É ação e reação (3ª lei de Newton): F_{t} = 2T₁/D₁ = 2T₂/D₂.',
        'As forças são iguais; os torques diferem porque os raios diferem: **Certo**.',
      ],
      explanation: 'Certo. É ação e reação: a mesma força F_{t} = 2·T_{1}/D_{1} = 2·T_{2}/D_{2}. O torque é diferente porque os raios são diferentes.',
    },
    {
      id: 'mec-mec-20',
      type: 'ce',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Um redutor de engrenagens aumenta a potência disponível no eixo de saída, já que aumenta o torque.',
      answer: false,
      roteiro: 'potencia-torque',
      steps: [
        'A rotação cai na saída do redutor.',
        'P = T·ω: o torque sobe na mesma proporção em que ω cai.',
        'A potência fica igual (ou menor, com as perdas): **Errado**.',
      ],
      explanation: 'Errado. O torque sobe na mesma proporção em que a rotação cai: P = T·ω fica igual (ou menor, com as perdas). Nenhuma transmissão cria potência.',
    },
    {
      id: 'mec-mec-21',
      type: 'ce',
      difficulty: 1,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Numa transmissão por correia, a correia cruzada faz a polia movida girar no sentido contrário ao da polia motora.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: correia **cruzada** e o **sentido** de giro.',
        'Correia aberta: as polias giram no mesmo sentido. Cruzada: o "X" inverte o sentido da movida.',
        '**Certo**.',
      ],
      explanation: 'Certo. Com a correia **aberta**, as polias giram no mesmo sentido; **cruzando** a correia, o sentido se inverte.',
    },
    {
      id: 'mec-mec-22',
      type: 'ce',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Num mecanismo biela-manivela com a manivela girando com velocidade angular constante, o pino que liga a manivela à biela tem aceleração nula.',
      answer: false,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: aceleração **nula** do pino, com ω **constante**.',
        'O pino descreve uma circunferência: mesmo com ω constante, tem aceleração centrípeta ω²·r, para o centro da manivela.',
        '**Errado**.',
      ],
      explanation: 'Errado. O pino descreve uma circunferência: mesmo com ω constante, ele tem aceleração **centrípeta** ω²·r, apontando para o centro da manivela.',
    },
    {
      id: 'mec-mec-23',
      type: 'ce',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Num rotor desbalanceado, dobrar a rotação quadruplica a força de inércia transmitida aos mancais.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: **dobrar** a rotação e **quadruplicar** a força.',
        'Força de desbalanceamento: F = m·e·ω².',
        '(2ω)² = 4ω²: **Certo**.',
      ],
      explanation: 'Certo. A força de inércia do desbalanceamento é m·e·ω²: com o dobro de ω, ela fica **quatro** vezes maior.',
    },
  ],
  games: [
    {
      id: 'mec-mec-g1',
      type: 'sort',
      title: 'O torque do motor sobe, desce ou fica?',
      intro: 'O guincho levanta sempre a mesma carga, com velocidade constante. O que cada mudança faz com o **torque que o motor precisa fazer**?',
      lessonRef: 1,
      bins: ['Aumenta', 'Diminui', 'Não muda'],
      items: [
        { text: 'Trocar a coroa por uma com mais dentes', bin: 1, why: 'Mais redução: T_motor = T_tambor·z₁/z₂ cai.' },
        { text: 'Trocar o pinhão do motor por um com mais dentes', bin: 0, why: 'Menos redução.' },
        { text: 'Pôr uma engrenagem intermediária (sem perdas)', bin: 2, why: 'Ela não muda a relação.' },
        { text: 'Aumentar a rotação do motor', bin: 2, why: 'O torque depende da carga e da relação; a potência é que sobe.' },
        { text: 'Usar um tambor de raio maior', bin: 0, why: 'T_tambor = m·g·R cresce.' },
        { text: 'Levantar uma carga mais pesada', bin: 0, why: 'T_tambor = m·g·R cresce.' },
        { text: 'Acrescentar um segundo par redutor', bin: 1, why: 'A redução total se multiplica.' },
        { text: 'Engrenagens com mais atrito (rendimento menor)', bin: 0, why: 'T_motor = T_tambor·i/η.' },
        { text: 'Trocar os eixos por outros mais grossos', bin: 2, why: 'O diâmetro muda a tensão, não o torque.' },
        { text: 'Trocar a intermediária por uma maior', bin: 2, why: 'Os dentes da intermediária se cancelam.' },
      ],
    },
    {
      id: 'mec-mec-g2',
      type: 'match',
      title: 'Termos de mecanismos',
      intro: 'Ligue cada termo ao seu significado.',
      lessonRef: 2,
      leftLabel: 'Termo',
      rightLabel: 'Significado',
      perRound: 6,
      pairs: [
        { left: 'Relação de transmissão', right: 'n saída/n entrada = z₁/z₂', why: 'A engrenagem maior gira mais devagar.' },
        { left: 'Engrenagem intermediária', right: 'Inverte o sentido sem mudar a relação', why: 'Os dentes dela se cancelam.' },
        { left: 'Módulo', right: 'Tamanho do dente: D = m·z, igual nas duas engrenagens', why: 'Sem o mesmo módulo, elas não engrenam.' },
        { left: 'Trem composto', right: 'Duas engrenagens no mesmo eixo; as relações se multiplicam', why: 'i = (z₁/z₂)·(z₃/z₄).' },
        { left: 'Força tangencial', right: 'F = 2·T/D, a mesma no pinhão e na coroa', why: 'Ação e reação.' },
        { left: 'Princípio de D’Alembert', right: 'Somar a força de inércia −m·a e tratar como equilíbrio', why: 'Equilíbrio dinâmico.' },
        { left: 'Ponto morto', right: 'Posição em que o pistão para e inverte o sentido', why: 'Manivela alinhada com a biela.' },
        { left: 'Estrutura hiperestática', right: 'Vínculos a mais: a estática não basta', why: 'Ex.: mesa de quatro pés.' },
        { left: 'Estrutura hipostática', right: 'Vínculos a menos: ela se move', why: 'É um mecanismo.' },
      ],
    },
    {
      id: 'mec-mec-g3',
      type: 'order',
      title: 'Dimensionar o eixo de saída de um redutor',
      intro: 'Ponha em ordem o roteiro para escolher o diâmetro do eixo de saída de um redutor.',
      lessonRef: 3,
      steps: [
        { text: 'Calcular a relação total (produto das relações dos pares)', why: 'i = (z₁/z₂)·(z₃/z₄).' },
        { text: 'Calcular a rotação de saída: n saída = n motor·i', why: 'O eixo de saída é o mais lento.' },
        { text: 'Calcular o torque de saída: T = P/ω (ou T motor/i, com o rendimento)', why: 'É o maior torque do redutor.' },
        { text: 'Identificar o trecho do eixo entre a coroa e a carga', why: 'É o trecho que transmite torque.' },
        { text: 'Calcular a tensão de torção: τ = 16·T/(π·d³)', why: 'Para um eixo maciço.' },
        { text: 'Comparar com a tensão admissível e ajustar o diâmetro', why: 'd mínimo = ∛(16·T/(π·τ adm)).' },
      ],
    },
    {
      id: 'mec-mec-lab1',
      type: 'lab',
      lab: 'gears',
      title: 'Redutor do guincho',
      intro: 'Um guincho com motor, engrenagens e tambor. Troque os dentes, ponha uma intermediária e veja o que acontece com a rotação, o torque e a potência de cada eixo.',
      lessonRef: 1,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { two: 0, idler: 0, z1: 20, z2: 60 },
          prompt: 'Um par: pinhão de 20 dentes no motor e coroa de 60. Se a coroa for trocada por uma de **80 dentes**, com a mesma carga…',
          change: { z2: 80 },
          options: ['O tambor gira mais devagar, e o motor precisa de menos torque', 'O tambor gira mais rápido, e o motor precisa de mais torque', 'O tambor gira mais devagar, e o motor precisa de mais torque', 'Nada muda: só o pinhão define a rotação', 'O tambor gira mais devagar, e a potência do motor aumenta'],
          answer: 0,
          expect: [
            { out: 'nt', trend: 'down' },
            { out: 'Tm', trend: 'down' },
            { out: 'v', trend: 'down' },
            { out: 'Tt', trend: 'same' },
          ],
          why: 'Mais dentes na coroa = mais redução (de 3:1 para 4:1): o tambor cai de 600 para **450 rpm**, e o motor precisa de 750/4 ≈ **188 N·m** em vez de 250 N·m. O torque no tambor (m·g·R) é o mesmo; a potência cai junto com a velocidade da carga.',
        },
        {
          kind: 'predict',
          setup: { two: 0, idler: 0, z1: 20, z2: 60 },
          prompt: 'Agora entra uma **engrenagem intermediária** de 30 dentes entre o pinhão e a coroa. A rotação do tambor…',
          change: { idler: 1 },
          options: ['Não muda; só o sentido de giro se inverte', 'Cai pela metade (30/60)', 'Sobe (20/30)', 'Não muda, nem o sentido', 'Vai a zero: três engrenagens travam'],
          answer: 0,
          expect: [
            { out: 'nt', trend: 'same' },
            { out: 'i', trend: 'same' },
            { out: 'Tm', trend: 'same' },
            { out: 'dirT', trend: 'up' },
          ],
          why: '(20/30)·(30/60) = 20/60: a intermediária se cancela. Ela só **inverte o sentido** do tambor — repare que o cabo passa a sair do outro lado.',
        },
        {
          kind: 'predict',
          setup: { two: 0, idler: 1, zi: 30, z1: 20, z2: 60 },
          prompt: 'Trocando a intermediária de 30 por uma de **60 dentes**…',
          change: { zi: 60 },
          options: ['Só a rotação da intermediária muda; tambor e motor ficam iguais', 'O tambor gira mais devagar', 'O tambor gira mais rápido', 'O torque do motor dobra', 'O tambor inverte o sentido de novo'],
          answer: 0,
          expect: [
            { out: 'nId', trend: 'down' },
            { out: 'nt', trend: 'same' },
            { out: 'Tm', trend: 'same' },
            { out: 'TId', trend: 'same' },
          ],
          why: 'A intermediária passa a girar a 1.800 × 20/60 = **600 rpm** (antes, 1.200), mas a relação pinhão → coroa continua 20/60. E o eixo dela segue **sem torque**: ela só repassa a força dos dentes.',
        },
        {
          kind: 'goal',
          setup: { two: 1, idler: 0, z1: 20, z2: 40, z3: 20, z4: 40, n1: 1800 },
          lock: ['two', 'idler', 'n1', 'mass', 'R', 'eta', 'd'],
          prompt: 'Com dois pares, faça o tambor girar a **100 rpm** com o motor a 1.800 rpm (uma redução de **18:1**).',
          goals: [{ out: 'nt', min: 99.5, max: 100.5, label: 'Tambor a 100 rpm' }],
          hint: '18 = 3 × 6 (ou 2 × 9, ou 4 × 4,5): escolha pares com essas relações.',
          solution: { z1: 20, z2: 60, z3: 15, z4: 90 },
          why: 'Por exemplo, 20 → 60 (3:1) e 15 → 90 (6:1): **3 × 6 = 18**. Num trem composto, as relações se **multiplicam** — com dois pares pequenos se chega a reduções grandes.',
        },
        {
          kind: 'predict',
          setup: { two: 1, idler: 0, z1: 20, z2: 60, z3: 15, z4: 75, d: 40 },
          prompt: 'Redutor 15:1 (pares 20/60 e 15/75), todos os eixos com 40 mm. Qual eixo tem a **maior tensão de torção**?',
          options: ['O do tambor, que tem o maior torque', 'O do motor, que gira mais rápido', 'O intermediário', 'Todos iguais: a potência é a mesma', 'Nenhum: eixo de redutor só sofre flexão'],
          answer: 0,
          why: 'τ = 16·T/(π·d³) depende do **torque**, não da rotação: o eixo do tambor tem 15 vezes o torque do motor (750 contra 50 N·m) — cerca de 59,7 MPa contra 4,0 MPa.',
        },
        {
          kind: 'goal',
          setup: { two: 1, idler: 0, z1: 20, z2: 60, z3: 15, z4: 75, d: 40 },
          lock: ['z1', 'z2', 'z3', 'z4', 'two', 'idler', 'n1', 'mass', 'R', 'eta'],
          prompt: 'O eixo do tambor está com τ ≈ 60 MPa. Escolha o **menor diâmetro** de eixo que deixa essa tensão em **no máximo 40 MPa**.',
          goals: [{ out: 'taut', min: 37.5, max: 40, label: 'τ ≤ 40 MPa com o menor diâmetro' }],
          hint: 'd = ∛(16·T/(π·τ)), com T = 750 N·m = 750.000 N·mm e τ = 40 MPa.',
          solution: { d: 46 },
          why: 'd³ ≥ 16 × 750.000/(π × 40) ≈ 95.500 mm³ → d ≥ 45,7 mm: **46 mm**. Como τ ∝ 1/d³, aumentar o diâmetro em 15 % (de 40 para 46 mm) reduz a tensão em cerca de 34 %.',
        },
        {
          kind: 'predict',
          setup: { two: 1, idler: 0, eta: 1 },
          prompt: 'Até agora as engrenagens eram ideais. Com **95 % de rendimento** em cada engrenamento (2 pares), para levantar a mesma carga na mesma velocidade…',
          change: { eta: 0.95 },
          options: ['O motor precisa de mais torque e mais potência', 'O motor precisa de menos torque', 'Nada muda no motor; só a carga sobe mais devagar', 'O tambor passa a girar mais devagar', 'A carga fica mais leve'],
          answer: 0,
          expect: [
            { out: 'Tm', trend: 'up' },
            { out: 'Pm', trend: 'up' },
            { out: 'loss', trend: 'up' },
            { out: 'nt', trend: 'same' },
          ],
          why: 'Só 0,95² ≈ 90 % da potência do motor chega à carga: o motor passa de 50 para **≈ 55,4 N·m** (e de 9,42 para 10,44 kW). A diferença vira calor nos dentes.',
        },
        {
          kind: 'predict',
          setup: { two: 1, idler: 0, n1: 1800 },
          prompt: 'Se a rotação do motor cair pela metade (1.800 → 900 rpm), com a mesma carga…',
          change: { n1: 900 },
          options: ['O torque do motor não muda; a carga sobe na metade da velocidade', 'O torque do motor dobra', 'O torque do motor cai à metade', 'A carga sobe na mesma velocidade', 'O torque no tambor cai à metade'],
          answer: 0,
          expect: [
            { out: 'Tm', trend: 'same' },
            { out: 'v', trend: 'down' },
            { out: 'Pm', trend: 'down' },
            { out: 'Tt', trend: 'same' },
          ],
          why: 'O torque depende da **carga** e da **relação** (T_{motor} = m·g·R·i), não da rotação. Com metade da rotação, a carga sobe na metade da velocidade, e a potência (T·ω) cai à metade.',
        },
        {
          kind: 'goal',
          setup: { two: 0, idler: 0, z1: 20, z2: 40, n1: 1800, mass: 400, R: 0.1 },
          lock: ['two', 'idler', 'n1', 'mass', 'R', 'eta', 'd'],
          prompt: 'Só um par. O motor (1.800 rpm) aguenta no máximo **50 N·m**, e a carga de 400 kg (tambor de 0,1 m) tem de subir a pelo menos **2,2 m/s**. Escolha os dentes do pinhão e da coroa.',
          goals: [
            { out: 'Tm', max: 50, label: 'Torque do motor ≤ 50 N·m' },
            { out: 'v', min: 2.2, label: 'Carga a pelo menos 2,2 m/s' },
          ],
          hint: 'O tambor precisa de 400 × 10 × 0,1 = 400 N·m: a redução tem de ser de pelo menos 8:1 — mas não muito mais que isso, senão a carga sobe devagar.',
          solution: { z1: 15, z2: 120 },
          why: 'Uma redução entre ~8,0:1 e ~8,6:1 (por exemplo, 15 → 120 dentes) deixa o motor com 50 N·m e a carga a ~2,36 m/s. Reduzir mais diminui o torque **e** a velocidade: a potência m·g·v ≈ 9,4 kW é o que o motor entrega.',
        },
        {
          kind: 'predict',
          setup: { two: 0, idler: 0, z1: 40, z2: 20 },
          prompt: 'Pinhão de **40 dentes** no motor e "coroa" de **20**. O que acontece?',
          options: ['O tambor gira ao dobro da rotação do motor, e o motor precisa do dobro do torque do tambor', 'O tambor gira na metade da rotação do motor', 'É um redutor 2:1', 'O torque no tambor dobra em relação ao do motor', 'Não engrena: a coroa tem de ser a maior'],
          answer: 0,
          why: 'Com a engrenagem motora maior, é um **multiplicador**: o tambor gira a 3.600 rpm, e o motor precisa de 2 × 750 = **1.500 N·m** para a mesma carga. Multiplicar rotação custa torque.',
        },
      ],
    },
  ],
});
