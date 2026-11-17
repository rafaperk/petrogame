import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

const wahl = (C: number) => (4 * C - 1) / (4 * C - 4) + 0.615 / C;

/** Classes de resistência ISO 898-1: nome, σ_r e σ_e (MPa). */
const CLASSES: readonly (readonly [string, number, number])[] = [
  ['4.6', 400, 240],
  ['5.8', 500, 400],
  ['8.8', 800, 640],
  ['10.9', 1000, 900],
  ['12.9', 1200, 1080],
];
/** Rosca métrica grossa: nome, diâmetro nominal (mm) e área resistente à tração (mm²). */
const BOLTS: readonly (readonly [string, number, number])[] = [
  ['M8', 8, 36.6],
  ['M10', 10, 58],
  ['M12', 12, 84.3],
  ['M16', 16, 157],
  ['M20', 20, 245],
];

export default defineTopic({
  id: 'mec.molas-parafusos',
  name: 'Molas, parafusos e uniões',
  summary:
    'Os tipos de molas, a rigidez da mola helicoidal (k = G·d⁴/(8·D³·n)), a tensão no fio com o fator de Wahl, os materiais, a associação em série e em paralelo, a energia, a flambagem e o surto; as roscas, os parafusos de fixação e as classes de resistência; a pré-carga e o aperto em cruz; o parafuso de potência, o autotravamento e o rendimento; e os rebites, pinos e as uniões permanentes.',
  order: 8,
  weight: 2,
  equipment: 'spring',
  requires: ['mec.eixos-mancais'],
  edital: ['b1.torcao', 'b1.energia', 'b1.tracao'],
  lesson: [
    {
      title: 'Molas: para que servem e os tipos',
      body: 'Molas são elementos que se deformam muito dentro do regime **elástico** e devolvem a energia. Funções:\n- **armazenar energia** (relógios, gatilhos, retorno de válvulas);\n- **absorver choques e vibrações** (suspensões, apoios de máquinas);\n- **manter uma força** (embreagens, válvulas de segurança, contatos);\n- **medir força** (balanças, dinamômetros).\n\nTipos:\n- **helicoidal de compressão** — a mais comum. Pontas **comuns**, **esquadrejadas** (a última espira encosta na vizinha) ou **esquadrejadas e retificadas** (esmerilhadas, apoiam bem num prato);\n- **helicoidal de tração**: espiras encostadas, com **tensão inicial** e **ganchos** nas pontas;\n- **helicoidal de torção**: trabalha girando os braços (prendedor de roupa, dobradiças);\n- **prato** (Belleville): arruelas cônicas; **grande força com curso pequeno**, empilhadas em série ou em paralelo;\n- **feixe de molas** (de lâminas): suspensão de caminhões e vagões;\n- **espiral** (relógios), **barra de torção** (veículos), molas de borracha e de gás.',
      example: 'A suspensão de um caminhão usa feixe de molas; a válvula de um motor, uma mola helicoidal de compressão; o pino de cisalhamento de um acoplamento, nenhuma — é um fusível mecânico.',
      tip: 'Mola prato: em **paralelo** (mesmo sentido) soma força; em **série** (alternadas) soma curso.',
      trap: 'Achar que a mola de tração trabalha com as espiras afastadas desde o início. Ela vem enrolada com as espiras encostadas e uma tensão inicial: só começa a abrir depois de vencer essa força.',
      lab: { lab: 'spring', preset: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 8, F: 400 }, label: 'Ver a mola na prensa' },
    },
    {
      title: 'A rigidez da mola helicoidal',
      hot: 'Diâmetro médio e constante de uma mola helicoidal de compressão, dados o fio, as espiras ativas e o G do material (BR 2012). Use k = G·d⁴/(8·D³·n) com o diâmetro **médio**.',
      body: 'Na mola helicoidal de compressão, o **fio trabalha em torção**. A rigidez (constante elástica) é:\n\n**k = F/δ = G·d⁴/(8·D³·n)**\n- G = módulo de elasticidade transversal do material (aço ≈ 80 GPa; inox ≈ 69 GPa; bronze fosforoso ≈ 41 GPa);\n- d = diâmetro do **fio**; D = diâmetro **médio** da mola (de centro a centro do fio);\n- n = número de espiras **ativas** (as das pontas esquadrejadas não contam: n_{total} = n + 2).\n\nO que pesa:\n- **fio**: d⁴ — 2× mais grosso, **16×** mais rígida;\n- **diâmetro**: D³ — 2× maior, **8×** mais mole;\n- **espiras**: 1/n — **cortar espiras** deixa a mola **mais rígida** (k′ = k·n/n′);\n- o **passo** e o comprimento livre **não** entram em k.\n\n**Índice de mola** C = D/d: entre **4 e 12** na prática (abaixo de 4, difícil de enrolar; acima de 12, mola "solta", que embaraça e flamba).',
      example: 'Fio de 5 mm, C = 8 (D = 40 mm), 10 espiras ativas, aço (G = 80 GPa): k = 80.000 × 5⁴/(8 × 40³ × 10) = 50.000.000/5.120.000 ≈ **9,8 N/mm**. Cortando 2 espiras: 9,8 × 10/8 ≈ **12,2 N/mm**.',
      tip: 'Com o índice: k = G·d/(8·C³·n). Conta de cabeça bem mais curta.',
      trap: 'Usar o raio no lugar do diâmetro médio (dá 8× mais rigidez) ou o número total de espiras no lugar das ativas.',
      lab: { lab: 'spring', preset: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 10, F: 400 }, label: 'Cortar espiras na bancada' },
    },
    {
      title: 'A tensão no fio, o fator de Wahl e os materiais',
      hot: 'Aço para molas (questão do tipo EXCETO, Transpetro 2011): fadiga em primeiro lugar, nada de descarbonetação, bom acabamento, sem inclusões e **grão fino** — "grão grande" é a alternativa errada.',
      body: 'A força F age a uma distância D/2 do eixo do fio: o fio recebe um **torque T = F·D/2**, e a tensão de torção é τ = 16T/(πd³) = **8·F·D/(π·d³)**.\n\nNa espira há ainda o **cisalhamento direto** (F/A) e o efeito da **curvatura** do fio. Os dois somam do **lado de dentro** da espira (voltado para o eixo da mola), onde fica a tensão máxima. O **fator de Wahl** corrige isso:\n\n**τ_{máx} = K_{w}·8·F·D/(π·d³)**, com **K_{w} = (4C − 1)/(4C − 4) + 0,615/C**\n\n(C = 8 → K_{w} ≈ 1,18; C = 5 → 1,31). Note que τ **não depende** de G nem do número de espiras.\n\n**Materiais**: aços de alto carbono temperados e revenidos (fio musical, aço mola), aços ligados ao cromo-vanádio e cromo-silício, inox, bronze fosforoso e cobre-berílio (não magnéticos, resistentes à corrosão). Como molas trabalham com cargas cíclicas, o que manda é a **fadiga**:\n- bom **acabamento superficial** e nada de **descarbonetação** na superfície (ela amolece a camada onde a trinca começa);\n- aço **limpo** (sem inclusões) e de **grão fino**;\n- **jateamento com granalha** (*shot peening*), que deixa compressão residual na superfície.',
      example: 'F = 400 N, D = 48 mm, d = 6 mm (C = 8, K_{w} = 1,18): τ = 1,18 × 8 × 400 × 48/(π × 216) ≈ **268 MPa**. Sem o fator de Wahl seriam 226 MPa — 16 % a menos.',
      tip: 'Mola com índice **pequeno** (fio grosso para o diâmetro) tem K_{w} **maior**: a tensão se concentra mais do lado de dentro.',
      trap: 'Achar que trocar o aço por bronze (G menor) diminui a tensão no fio com a mesma força. A tensão é a mesma; a mola só deforma mais — e o bronze aguenta menos.',
      lab: { lab: 'spring', preset: { modo: 0, arr: 0, mat: 2, dw: 6, Dm: 48, na: 8, F: 400 }, label: 'Ver a tensão no fio' },
    },
    {
      title: 'Associação, energia, flambagem e surto',
      hot: 'Associação de molas cai em **vibrações**: as quatro molas de uma suspensão em paralelo (Transpetro 2018) e a mola da suspensão em série com o pneu (Transpetro 2012).',
      body: '**Associação** (vale para qualquer mola):\n- **série** (uma depois da outra): a **mesma força** passa pelas duas e as deflexões se somam: **1/k_{eq} = 1/k_{1} + 1/k_{2}** (duas iguais: k/2);\n- **paralelo** (lado a lado): a **mesma deflexão** e as forças se somam: **k_{eq} = k_{1} + k_{2}** (duas iguais: 2k, e cada fio leva metade da força).\n\n**Energia armazenada**: U = F·δ/2 = k·δ²/2 = F²/(2k). Com a mesma força, a mola **mais mole** guarda **mais** energia. No material, a energia por volume até escoar é a **resiliência**, σ_{e}²/(2E): material com σ_{e} alto e E baixo é o melhor para molas.\n\n**Cuidados**:\n- **mola fechada**: com as espiras encostadas, ela vira um bloco maciço — o curso de trabalho deve parar antes (uns 85 % do curso até fechar);\n- **flambagem**: mola de compressão longa e fina entorta de lado. Entre pratos paralelos, o limite é L_{0} ≈ 5,3·D; acima disso, use uma **haste ou um tubo de guia**;\n- **surto** (*surge*): a mola tem frequência natural própria (f = ½·√(k/m), com a massa das espiras ativas). Sob carga que oscila (molas de válvula), essa frequência deve ser **15 a 20 vezes** maior que a da excitação, senão as espiras entram em ressonância e a mola deixa de seguir o came.',
      example: 'Molas de 20 e 30 N/mm em série: 1/k = 1/20 + 1/30 → k = **12 N/mm**; com 600 N, δ = **50 mm**. Em paralelo: k = **50 N/mm** e δ = **12 mm**.',
      tip: 'Série = **mais mole** que a mais mole; paralelo = **mais rígido** que a mais rígida.',
      trap: 'Trocar as fórmulas de série e paralelo (é o contrário dos resistores elétricos — e igual aos capacitores).',
      lab: { lab: 'spring', preset: { modo: 0, arr: 1, mat: 0, dw: 6, Dm: 48, na: 8, F: 400 }, label: 'Molas em série e em paralelo' },
    },
    {
      title: 'Roscas e parafusos de fixação',
      body: 'Elementos de uma rosca: **passo** p (distância entre filetes vizinhos), **avanço** L (quanto a porca anda numa volta: L = **número de entradas × passo**), diâmetro **nominal** (externo), **menor** (raiz) e **médio** (primitivo).\n\n**Perfis**:\n- **triangular métrica** (60°): fixação. M10 = passo grosso (1,5 mm); M10 × 1 = passo fino (aperto mais fino, menos afrouxamento);\n- **Whitworth** (55°, em polegadas) e **UNC/UNF** (60°, em polegadas);\n- **trapezoidal** (Tr, 30°): transmissão de movimento (fusos de tornos, macacos, válvulas);\n- **quadrada**: movimento, maior rendimento, mas difícil de fabricar;\n- **dente de serra**: grande carga **num sentido só** (prensas, morsas);\n- **redonda**: lâmpadas, peças sujeitas a sujeira.\n\n**Tipos**: parafuso **passante** com porca; parafuso de **cabeça** rosqueado no furo; **prisioneiro** (estojo, rosca nas duas pontas: flanges e cabeçotes); parafuso **sem cabeça** (de fixação, com sextavado interno).\n\n**Travamentos**: contraporca, arruela de pressão, **porca castelo com contrapino** (cupilha), arame de travamento, porca com anel de náilon e adesivo trava-rosca (anaeróbico).\n\n**Classes de resistência** (aço, ISO 898-1): "**8.8**" → σ_{r} = 8 × 100 = **800 MPa** e σ_{e} = 0,8 × 800 = **640 MPa**. Também 4.6, 5.8, 10.9 e 12.9. A tensão de tração usa a **área resistente** da rosca (M12: 84,3 mm²), menor que a do diâmetro nominal.',
      example: 'Parafuso M12 classe 10.9: σ_{e} = 0,9 × 1.000 = 900 MPa; força de escoamento = 900 × 84,3 ≈ **75,9 kN**.',
      tip: 'Na classe "x.y", x × 100 é σ_{r} e y/10 é a fração σ_{e}/σ_{r}.',
      trap: 'Calcular a tensão no parafuso com a área do diâmetro nominal — o fundo da rosca tem bem menos material.',
      lab: { lab: 'spring', preset: { modo: 1, perfil: 1, ent: 0, pas: 6, dmed: 33, mu: 0.15, W: 10, R: 0.3 }, label: 'Ver uma rosca trapezoidal' },
    },
    {
      title: 'Pré-carga e aperto das uniões aparafusadas',
      body: 'O parafuso é apertado com uma **pré-carga** F_{i} (em geral 75 a 90 % da carga de prova): ele fica tracionado e as peças, **comprimidas**. Quando chega uma carga externa P de tração, a maior parte dela só **alivia a compressão** das peças; o parafuso recebe apenas a fração C = k_{b}/(k_{b} + k_{m}) (k_{b} = rigidez do parafuso, k_{m} = das peças):\n- parafuso: F_{b} = F_{i} + C·P;\n- peças: F_{m} = F_{i} − (1 − C)·P — se chegar a zero, a junta **abre** (vazamento, fadiga do parafuso).\n\nPor isso a pré-carga **protege o parafuso contra fadiga** e mantém a vedação.\n\n**Torque de aperto**: T ≈ **K·F_{i}·d**, com K ≈ **0,2** a seco (0,15 lubrificado). Cerca de **90 %** do torque vai embora em **atrito** (uns 50 % sob a cabeça ou a porca e 40 % nos filetes) — o torquímetro controla mal a pré-carga. Métodos melhores: ângulo de giro, medir o alongamento do parafuso, tensionadores hidráulicos.\n\n**Flanges**: aperto **em cruz** (alternando parafusos opostos), em **etapas** (por exemplo 30 %, 60 % e 100 % do torque) e uma passada final em sequência circular conferindo todos — para a junta assentar por igual.',
      example: 'M12 com pré-carga de 30 kN, aço seco: T ≈ 0,2 × 30.000 × 0,012 = **72 N·m**. Lubrificando (K = 0,15), o mesmo torque daria 40 kN de pré-carga — cuidado com a tabela certa.',
      tip: 'Pré-carga alta é boa: o parafuso "não sente" a maior parte da carga externa enquanto a junta não abrir.',
      trap: 'Apertar um flange em sequência circular, um parafuso de cada vez já com o torque final: a junta assenta torta e vaza.',
    },
    {
      title: 'Parafuso de potência: autotravamento e rendimento',
      body: 'O **parafuso de potência** transforma rotação em movimento linear com grande força: macacos, prensas, fusos de tornos, morsas, hastes de válvulas.\n\nDesenrolando uma volta da rosca, ela vira um **plano inclinado** de base π·d_{m} e altura L (o avanço): **tg λ = L/(π·d_{m})** (λ = ângulo de hélice). Com atrito μ (na rosca trapezoidal, use μ′ = μ/cos 15°):\n- torque para **subir** a carga W: **T = (W·d_{m}/2)·(L + π·μ·d_{m})/(π·d_{m} − μ·L)**;\n- torque para **descer**: T = (W·d_{m}/2)·(π·μ·d_{m} − L)/(π·d_{m} + μ·L). Se der **negativo**, a carga **desce sozinha**;\n- **rendimento**: **η = W·L/(2π·T)**.\n\n**Autotravante**: a carga não desce sozinha quando **μ > tg λ** (o ângulo de atrito é maior que o de hélice). Todo parafuso autotravante tem **η < 50 %**.\n\nMais rendimento: rosca quadrada, mais entradas (passo maior), lubrificação — e os **fusos de esferas** (η ≈ 90 %, mas não autotravantes: precisam de freio). Se a carga apoia num colar sem rolamento, soma-se o atrito do colar: T_{c} = μ_{c}·W·d_{c}/2.',
      example: 'Macaco com rosca quadrada, d_{m} = 30 mm, passo 6 mm (1 entrada), μ = 0,1 e W = 10 kN: tg λ = 6/94,2 = 0,064 < 0,1 → **autotravante**. T = 150 × (6 + 9,4)/(94,2 − 0,6) ≈ **24,7 N·m**; η = 10.000 × 0,006/(2π × 24,7) ≈ **39 %**.',
      tip: 'Mais entradas = sobe mais rápido e rende mais, mas pode perder o autotravamento.',
      trap: 'Achar que lubrificar sempre melhora um macaco: com pouco atrito e passo grande, ele deixa de ser autotravante e a carga desce sozinha.',
      lab: { lab: 'spring', preset: { modo: 1, perfil: 1, ent: 0, pas: 6, dmed: 33, mu: 0.15, W: 10, R: 0.3 }, label: 'Testar o macaco' },
    },
    {
      title: 'Rebites, pinos e uniões permanentes',
      body: 'Uniões **desmontáveis**: parafusos, pinos, chavetas, anéis elásticos. **Permanentes**: rebites, solda, brasagem, colagem, agrafagem de chapas — para separar, é preciso destruir o elemento.\n\n**Rebites**: de material **dúctil** (aço de baixo carbono, alumínio, cobre), com cabeça redonda, escareada (embutida) ou do tipo **cego** (*pop*, quando só há acesso por um lado). Juntas **sobrepostas** fazem o rebite trabalhar em **cisalhamento simples**; juntas **de topo com duas talas** (cobrejuntas), em **cisalhamento duplo** — duas seções resistem. Verificações de uma junta com n rebites de diâmetro d em chapas de espessura t e largura b:\n- **cisalhamento** do rebite: τ = F/(n·m·π·d²/4) (m = 1 ou 2 seções);\n- **esmagamento** da chapa no furo: σ = F/(n·d·t);\n- **rasgamento** da chapa na linha de furos: σ = F/((b − k·d)·t), com k furos na linha.\n\n**Pinos**: **cilíndricos** (posicionam peças com precisão), **cônicos** (desmontagem repetida), **elásticos** (tubo fendido) e **cavilhas** ranhuradas. O **contrapino** (cupilha) trava a porca castelo. **Ajuste com interferência** (prensado ou montado a quente) transmite torque por atrito, sem chaveta.',
      example: 'Junta de topo com duas talas, 4 rebites de 10 mm, F = 24 kN: τ = 24.000/(4 × 2 × 78,5) ≈ **38 MPa**. Em junta sobreposta (cisalhamento simples), seriam 76 MPa.',
      tip: 'Duas talas = duas seções cortadas em cada rebite = metade da tensão.',
      trap: 'Esquecer que o rasgamento usa a largura **líquida** da chapa (descontando os furos).',
    },
  ],
  roteiros: [
    {
      id: 'rigidez-mola',
      name: 'Rigidez da mola helicoidal',
      when: 'Mola helicoidal com fio, diâmetro médio (ou índice C) e espiras; pedem a rigidez ou o efeito de mudar uma dimensão.',
      steps: [
        'Junte os dados em N e mm: G em MPa (80 GPa = 80.000 MPa), d e D em mm (D = C·d).',
        'Escreva k = G·d⁴/(8·D³·n) e veja quem muda: d na 4ª potência, D na 3ª, n no denominador.',
        'Calcule (N/mm) ou aplique a proporção.',
      ],
      note: 'Fio 2× mais grosso: mola **16×** mais rígida. Cortar espiras endurece (k·n constante). O passo não muda a rigidez.',
    },
    {
      id: 'tensao-mola',
      name: 'Tensão no fio da mola (fator de Wahl)',
      when: 'Mola helicoidal sob uma força; pedem a tensão de cisalhamento máxima no fio ou onde ela ocorre.',
      steps: [
        'O fio é torcido pelo momento T = F·D/2.',
        'Tensão de torção no fio: τ = 16T/(πd³) = 8·F·D/(π·d³).',
        'Multiplique pelo fator de Wahl (curvatura + cisalhamento direto): o máximo fica no lado de dentro da espira.',
      ],
      note: 'O número de espiras não muda a tensão, só a deflexão.',
    },
    {
      id: 'associacao-molas',
      name: 'Molas em série e em paralelo',
      when: 'Duas ou mais molas ligadas; pedem a rigidez equivalente ou a deflexão.',
      steps: [
        'Identifique o arranjo: série (uma depois da outra, mesma força) ou paralelo (lado a lado, mesma deflexão).',
        'Série: 1/k_{eq} = 1/k₁ + 1/k₂. Paralelo: k_{eq} = k₁ + k₂.',
        'Deflexão: δ = F/k_{eq}.',
      ],
      note: 'É o contrário dos resistores. Duas molas iguais: em série, k/2; em paralelo, 2k.',
    },
    {
      id: 'parafuso-potencia',
      name: 'Parafuso de potência (macaco, fuso)',
      when: 'Macaco, fuso ou prensa de rosca; pedem o torque para subir a carga, o rendimento ou se ele é autotravante.',
      steps: [
        'Avanço: L = entradas × passo; compare com a volta, π·d_{m} (tg λ = L/(π·d_{m})).',
        'Torque para subir: T = (W·d_{m}/2)·(L + π·μ·d_{m})/(π·d_{m} − μ·L).',
        'Calcule e julgue: autotravante se μ > tg λ — e então o rendimento fica abaixo de 50 %.',
      ],
      note: 'Duas entradas dobram o avanço: sobe mais rápido, exige mais torque e pode deixar de travar.',
    },
    {
      id: 'rebites',
      name: 'Cisalhamento em rebites e pinos',
      when: 'Junta rebitada ou com pinos transmitindo uma força; pedem a tensão de cisalhamento ou o número de rebites.',
      steps: [
        'Área de uma seção cortada: π·d²/4.',
        'Conte as seções cortadas por rebite: junta sobreposta = 1 (simples); com duas talas = 2 (duplo).',
        'τ = F/(número de rebites × seções × área).',
      ],
      note: 'Cisalhamento duplo divide a tensão por 2, com os mesmos rebites.',
    },
    {
      id: 'classe-parafuso',
      name: 'Classe de resistência do parafuso',
      when: 'Parafuso com marcação de classe (8.8, 10.9...); pedem as tensões ou a força de escoamento.',
      steps: [
        'Leia a classe x.y: σ_{r} = x × 100 MPa.',
        'σ_{e} = (y/10)·σ_{r}.',
        'Força: F = σ·A_{t}, com a área resistente da rosca.',
      ],
      note: '10.9 → 1.000 MPa de ruptura e 900 MPa de escoamento.',
    },
    {
      id: 'pre-carga',
      name: 'União aparafusada com pré-carga',
      when: 'Parafuso com pré-carga e carga externa de tração; pedem quanto vai para o parafuso ou quando a junta abre.',
      steps: [
        'Fração da carga externa que vai ao parafuso: C = k_{b}/(k_{b} + k_{m}).',
        'Parafuso: F_{b} = F_{i} + C·P. Peças: F_{m} = F_{i} − (1 − C)·P.',
        'A junta abre quando F_{m} = 0: P = F_{i}/(1 − C).',
      ],
      note: 'Com boa pré-carga e peças rígidas, o parafuso quase não sente a carga externa — por isso a pré-carga protege da fadiga.',
    },
  ],
  questions: [
    {
      id: 'mec-mol-01',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Rigidez da mola helicoidal',
      roteiro: 'rigidez-mola',
      generate(rng) {
        const mat = pickOne(rng, [
          ['aço', 80],
          ['aço', 80],
          ['bronze fosforoso', 40],
        ] as const);
        const G = mat[1] * 1000;
        const d = pickOne(rng, [2, 3, 4, 5, 6, 8, 10]);
        const C = pickOne(rng, [5, 6, 8, 10]);
        const D = C * d;
        const n = pickOne(rng, [4, 5, 6, 8, 10, 12]);
        const k = (G * d ** 4) / (8 * D ** 3 * n);
        const byIndex = rng() < 0.5;
        const { options, answer } = numericOptions({
          correct: k,
          unit: 'N/mm',
          digits: 2,
          correctWhy: `k = G·d⁴/(8·D³·n) = ${fmt(G, 0)} × ${d}⁴/(8 × ${D}³ × ${n}) = ${fmt(k, 2)} N/mm.`,
          distractors: [
            { value: k * 8, why: 'Faltou o 8 do denominador — ou usou o raio no lugar do diâmetro médio (dá o mesmo erro).' },
            { value: (G * d ** 4) / (8 * D ** 2 * n), why: 'O diâmetro médio entra ao cubo.' },
            { value: (G * d ** 3) / (8 * D ** 3 * n), why: 'O diâmetro do fio entra na quarta potência.' },
            { value: (G * d ** 4) / (8 * D ** 3 * (n + 2)), why: 'Usou o total de espiras (com as duas das pontas): só as ativas contam.' },
          ],
        });
        const geo = byIndex ? `fio de ${d} mm, índice de mola C = ${C}` : `fio de ${d} mm, diâmetro médio de ${D} mm`;
        return {
          prompt: `Uma mola helicoidal de compressão de ${mat[0]} (G = ${mat[1]} GPa) tem ${geo} e ${n} espiras ativas. A constante de rigidez dessa mola é de, aproximadamente,`,
          options,
          answer,
          hint: 'k = G·d⁴/(8·D³·n), com D = diâmetro médio (D = C·d) e n = espiras ativas. Use G em MPa (N/mm²) para sair em N/mm.',
          steps: [
            `G = ${fmt(G, 0)} MPa; d = ${d} mm; ${byIndex ? `D = C·d = ${C} × ${d} = ${D} mm` : `D = ${D} mm`}; n = ${n}.`,
            `k = ${fmt(G, 0)} × ${fmt(d ** 4, 0)}/(8 × ${fmt(D ** 3, 0)} × ${n}).`,
            `k ≈ **${fmt(k, 2)} N/mm**.`,
          ],
          explanation: `${byIndex ? `D = C·d = ${C} × ${d} = ${D} mm. ` : ''}k = G·d⁴/(8·D³·n) = ${fmt(G, 0)} × ${fmt(d ** 4, 0)}/(8 × ${fmt(D ** 3, 0)} × ${n}) ≈ **${fmt(k, 2)} N/mm**. Atalho: k = G·d/(8·C³·n).`,
        };
      },
    },
    {
      id: 'mec-mol-02',
      type: 'gen',
      difficulty: 1,
      lessonRef: 1,
      title: 'Cortar espiras',
      roteiro: 'rigidez-mola',
      generate(rng) {
        const n = pickOne(rng, [6, 8, 10, 12, 15, 16, 20]);
        const cut = pickOne(rng, n >= 10 ? [2, 3, 4, 5] : [1, 2, 3]);
        const k = pickOne(rng, [12, 15, 18, 20, 24, 30, 36, 40]);
        const kNew = (k * n) / (n - cut);
        const { options, answer } = numericOptions({
          correct: kNew,
          unit: 'N/mm',
          digits: 1,
          correctWhy: `k ∝ 1/n: k′ = ${k} × ${n}/${n - cut} = ${fmt(kNew, 1)} N/mm.`,
          distractors: [
            { value: (k * (n - cut)) / n, why: 'Inverteu: com menos espiras a mola fica mais rígida, não mais mole.' },
            { value: k, why: 'A rigidez depende do número de espiras ativas: k = G·d⁴/(8·D³·n).' },
            { value: (k * n ** 4) / (n - cut) ** 4, why: 'O número de espiras entra na primeira potência (quem entra na quarta é o fio).' },
            { value: k + cut, why: 'A rigidez não cresce somando espiras: ela é inversamente proporcional a n.' },
          ],
        });
        return {
          prompt: `Uma mola helicoidal com ${n} espiras ativas tem rigidez de ${k} N/mm. Para ajustá-la, ${cut === 1 ? 'corta-se 1 espira ativa' : `cortam-se ${cut} espiras ativas`}, mantidos o fio e o diâmetro. A nova rigidez é de`,
          options,
          answer,
          hint: 'k = G·d⁴/(8·D³·n): com o resto igual, k é inversamente proporcional ao número de espiras ativas.',
          steps: [
            `k = ${k} N/mm com n = ${n} espiras; ${cut === 1 ? 'corta-se 1' : `cortam-se ${cut}`} → n′ = ${n - cut}.`,
            `Fio e diâmetro iguais: k ∝ 1/n → k·n é constante.`,
            `k′ = ${k} × ${n}/${n - cut} ≈ **${fmt(kNew, 1)} N/mm** (mais rígida).`,
          ],
          explanation: `k·n é constante: k′ = k·n/n′ = ${k} × ${n}/${n - cut} ≈ **${fmt(kNew, 1)} N/mm**. Menos espiras → mola mais curta e mais rígida.`,
        };
      },
    },
    {
      id: 'mec-mol-03',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Tensão no fio da mola',
      roteiro: 'tensao-mola',
      generate(rng) {
        const F = pickOne(rng, [200, 300, 400, 500, 600, 800]);
        const d = pickOne(rng, [4, 5, 6, 8]);
        const C = pickOne(rng, [5, 6, 8, 10]);
        const D = C * d;
        const Kw = Math.round(wahl(C) * 100) / 100;
        const base = (8 * F * D) / (Math.PI * d ** 3);
        const tau = Kw * base;
        const { options, answer } = numericOptions({
          correct: tau,
          unit: 'MPa',
          digits: 0,
          correctWhy: `τ = K_{w}·8·F·D/(π·d³) = ${fmt(Kw, 2)} × 8 × ${F} × ${D}/(π × ${d}³) ≈ ${fmt(tau, 0)} MPa.`,
          distractors: [
            { value: base, why: 'Faltou o fator de Wahl, que soma o cisalhamento direto e a curvatura.' },
            { value: 2 * tau, why: 'Usou o torque F·D em vez de F·D/2 (o braço é o raio médio).' },
            { value: 8 * tau, why: 'Usou o raio do fio onde vai o diâmetro em 16T/(πd³).' },
            { value: (Kw * 8 * F * D) / (Math.PI * d ** 2), why: 'O diâmetro do fio entra ao cubo (τ = 16T/πd³).' },
          ],
        });
        return {
          prompt: `Uma mola helicoidal de compressão, com fio de ${d} mm e diâmetro médio de ${D} mm, recebe uma força de ${F} N. Considerando o fator de Wahl K = ${fmt(Kw, 2)}, a tensão de cisalhamento máxima no fio é de, aproximadamente,`,
          options,
          answer,
          hint: 'O fio é torcido por T = F·D/2: τ = 16T/(πd³) = 8FD/(πd³). Multiplique pelo fator de Wahl.',
          steps: [
            `T = F·D/2 = ${F} × ${D}/2 = ${fmt((F * D) / 2, 0)} N·mm.`,
            `8·F·D/(π·d³) = 8 × ${F} × ${D}/(π × ${d}³) = ${fmt(base, 1)} MPa.`,
            `τ = ${fmt(Kw, 2)} × ${fmt(base, 1)} ≈ **${fmt(tau, 0)} MPa**, no lado de dentro da espira.`,
          ],
          explanation: `T = F·D/2 = ${F} × ${D}/2 = ${fmt((F * D) / 2, 0)} N·mm; τ = K·8FD/(πd³) = ${fmt(Kw, 2)} × ${fmt(base, 1)} ≈ **${fmt(tau, 0)} MPa**, no lado de dentro da espira.`,
        };
      },
    },
    {
      id: 'mec-mol-04',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Molas em série ou em paralelo',
      roteiro: 'associacao-molas',
      generate(rng) {
        const pair = pickOne(rng, [
          [20, 30],
          [10, 40],
          [30, 60],
          [12, 24],
          [15, 30],
          [40, 60],
        ] as const);
        const [k1, k2] = pair;
        const series = rng() < 0.5;
        const kS = (k1 * k2) / (k1 + k2);
        const kP = k1 + k2;
        const F = pickOne(rng, [240, 360, 480, 600, 720, 1200]);
        const keq = series ? kS : kP;
        const delta = F / keq;
        const { options, answer } = numericOptions({
          correct: delta,
          unit: 'mm',
          digits: 1,
          correctWhy: `${series ? `Série: k = k₁·k₂/(k₁ + k₂) = ${fmt(kS, 2)} N/mm` : `Paralelo: k = k₁ + k₂ = ${kP} N/mm`}; δ = F/k = ${fmt(delta, 1)} mm.`,
          distractors: [
            { value: F / (series ? kP : kS), why: series ? 'Usou a fórmula do paralelo: em série, as flexibilidades (1/k) é que se somam.' : 'Usou a fórmula da série: em paralelo, as rigidezes se somam.' },
            { value: F / ((k1 + k2) / 2), why: 'A rigidez equivalente não é a média das duas.' },
            { value: F / k1, why: `Considerou só a mola de ${k1} N/mm.` },
            { value: F / k2, why: `Considerou só a mola de ${k2} N/mm.` },
          ],
        });
        return {
          prompt: `Duas molas de rigidez ${k1} N/mm e ${k2} N/mm são montadas ${series ? 'em série (uma sobre a outra)' : 'em paralelo (lado a lado, sob o mesmo prato)'} e recebem uma força de ${fmt(F, 0)} N. A deflexão do conjunto é de`,
          options,
          answer,
          hint: 'Série: 1/k = 1/k₁ + 1/k₂ (mesma força, deflexões somam). Paralelo: k = k₁ + k₂ (mesma deflexão, forças somam).',
          steps: [
            `${series ? 'Uma sobre a outra → **série** (a mesma força nas duas).' : 'Lado a lado sob o mesmo prato → **paralelo** (a mesma deflexão).'}`,
            `${series ? `k_{eq} = ${k1} × ${k2}/(${k1} + ${k2}) = ${fmt(kS, 2)} N/mm.` : `k_{eq} = ${k1} + ${k2} = ${kP} N/mm.`}`,
            `δ = ${fmt(F, 0)}/${series ? fmt(kS, 2) : kP} = **${fmt(delta, 1)} mm**.`,
          ],
          explanation: series
            ? `Em série a mesma força passa pelas duas: δ = F/k₁ + F/k₂ = ${fmt(F / k1, 1)} + ${fmt(F / k2, 1)} = **${fmt(delta, 1)} mm** (k_{eq} = ${fmt(kS, 2)} N/mm).`
            : `Em paralelo as duas deflexionam igual e dividem a força: k_{eq} = ${k1} + ${k2} = ${kP} N/mm; δ = ${F}/${kP} = **${fmt(delta, 1)} mm**.`,
        };
      },
    },
    {
      id: 'mec-mol-05',
      type: 'gen',
      difficulty: 3,
      lessonRef: 6,
      title: 'Torque para levantar com um macaco',
      roteiro: 'parafuso-potencia',
      generate(rng) {
        const W = pickOne(rng, [5, 8, 10, 12, 15, 20]) * 1000;
        const dm = pickOne(rng, [20, 25, 30, 32, 36, 40]);
        const p = pickOne(rng, [4, 5, 6, 8]);
        const starts = pickOne(rng, [1, 1, 2]);
        const mu = pickOne(rng, [0.1, 0.12, 0.15]);
        const L = starts * p;
        const r = dm / 2000;
        const T = W * r * ((L + Math.PI * mu * dm) / (Math.PI * dm - mu * L));
        const Tdown = W * r * ((Math.PI * mu * dm - L) / (Math.PI * dm + mu * L));
        const distractors = [
          { value: (W * (L / 1000)) / (2 * Math.PI), why: 'Esse é o torque sem atrito (rendimento de 100 %).' },
          { value: W * mu * r, why: 'Considerou só o atrito, sem a subida pelo plano inclinado.' },
          { value: 2 * T, why: 'Usou o diâmetro médio no lugar do raio médio.' },
        ];
        if (Tdown > 0) distractors.push({ value: Tdown, why: 'Esse é o torque para descer a carga.' });
        if (starts === 2) distractors.push({ value: W * r * ((p + Math.PI * mu * dm) / (Math.PI * dm - mu * p)), why: 'Com 2 entradas o avanço é 2 × passo.' });
        const { options, answer } = numericOptions({
          correct: T,
          unit: 'N·m',
          digits: 1,
          correctWhy: `L = ${L} mm; T = (W·d_{m}/2)·(L + π·μ·d_{m})/(π·d_{m} − μ·L) ≈ ${fmt(T, 1)} N·m.`,
          distractors,
        });
        return {
          prompt: `Um macaco tem rosca quadrada de ${starts === 1 ? 'uma entrada' : 'duas entradas'}, passo ${p} mm e diâmetro médio ${dm} mm, com coeficiente de atrito ${fmt(mu, 2)} na rosca. Desprezando o atrito no apoio da carga, o torque para levantar ${fmt(W / 1000, 0)} kN é de, aproximadamente,`,
          options,
          answer,
          hint: 'Avanço L = entradas × passo. T = (W·d_{m}/2)·(L + π·μ·d_{m})/(π·d_{m} − μ·L).',
          steps: [
            `L = ${starts} × ${p} = ${L} mm; π·d_{m} = ${fmt(Math.PI * dm, 1)} mm.`,
            `T = ${fmt(W, 0)} × ${fmt(r, 4)} × (${L} + ${fmt(Math.PI * mu * dm, 2)})/(${fmt(Math.PI * dm, 1)} − ${fmt(mu * L, 2)}).`,
            `T ≈ **${fmt(T, 1)} N·m**; ${Tdown > 0 ? 'μ > tg λ: autotravante' : 'μ < tg λ: não é autotravante'} (η ≈ ${fmt(((W * L) / 1000 / (2 * Math.PI * T)) * 100, 0)} %).`,
          ],
          explanation: `L = ${starts} × ${p} = ${L} mm; π·d_{m} = ${fmt(Math.PI * dm, 1)} mm. T = ${fmt(W, 0)} × ${fmt(r, 4)} × (${L} + ${fmt(Math.PI * mu * dm, 2)})/(${fmt(Math.PI * dm, 1)} − ${fmt(mu * L, 2)}) ≈ **${fmt(T, 1)} N·m**. Rendimento: η = W·L/(2π·T) = ${fmt(((W * L) / 1000 / (2 * Math.PI * T)) * 100, 0)} %; ${Tdown > 0 ? 'como μ > tg λ, é autotravante.' : 'como μ < tg λ, não é autotravante.'}`,
        };
      },
    },
    {
      id: 'mec-mol-06',
      type: 'gen',
      difficulty: 2,
      lessonRef: 7,
      title: 'Cisalhamento nos rebites',
      roteiro: 'rebites',
      generate(rng) {
        const F = pickOne(rng, [12, 18, 24, 30, 36]) * 1000;
        const n = pickOne(rng, [2, 3, 4, 6]);
        const d = pickOne(rng, [8, 10, 12, 16]);
        const double = rng() < 0.5;
        const m = double ? 2 : 1;
        const A = (Math.PI * d * d) / 4;
        const tau = F / (n * m * A);
        const { options, answer } = numericOptions({
          correct: tau,
          unit: 'MPa',
          digits: 1,
          correctWhy: `τ = F/(n·m·π·d²/4) = ${fmt(F, 0)}/(${n} × ${m} × ${fmt(A, 1)}) ≈ ${fmt(tau, 1)} MPa.`,
          distractors: [
            { value: double ? 2 * tau : tau / 2, why: double ? 'Com duas talas, cada rebite é cortado em duas seções (cisalhamento duplo).' : 'Na junta sobreposta só uma seção de cada rebite é cortada (cisalhamento simples).' },
            { value: tau / 4, why: 'A área do rebite é π·d²/4, não π·d².' },
            { value: tau * n, why: 'A força se divide entre os rebites.' },
            { value: F / (n * m * d * d), why: 'Usou d² como área: a seção do rebite é circular, π·d²/4.' },
          ],
        });
        return {
          prompt: `Uma junta ${double ? 'de topo com duas talas (cobrejuntas)' : 'sobreposta de duas chapas'} transmite ${fmt(F / 1000, 0)} kN por meio de ${n} rebites de ${d} mm de diâmetro. A tensão média de cisalhamento em cada rebite é de, aproximadamente,`,
          options,
          answer,
          hint: `Divida a força pelos rebites e pelo número de seções cortadas em cada um (${double ? 'duas talas = 2' : 'sobreposta = 1'}). Área de cada seção: π·d²/4.`,
          steps: [
            `A = π × ${d}²/4 = ${fmt(A, 1)} mm².`,
            `${double ? 'Duas talas → **cisalhamento duplo** (2 seções por rebite).' : 'Junta sobreposta → **cisalhamento simples** (1 seção por rebite).'}`,
            `τ = ${fmt(F, 0)}/(${n} × ${m} × ${fmt(A, 1)}) ≈ **${fmt(tau, 1)} MPa**.`,
          ],
          explanation: `Área de uma seção: π × ${d}²/4 = ${fmt(A, 1)} mm². ${double ? 'Cisalhamento duplo' : 'Cisalhamento simples'}: τ = ${fmt(F, 0)}/(${n} × ${m} × ${fmt(A, 1)}) ≈ **${fmt(tau, 1)} MPa**.`,
        };
      },
    },
    {
      id: 'mec-mol-07',
      type: 'gen',
      difficulty: 2,
      lessonRef: 4,
      title: 'Classe de resistência do parafuso',
      roteiro: 'classe-parafuso',
      generate(rng) {
        const [cls, sr, se] = pickOne(rng, CLASSES);
        const [name, d, At] = pickOne(rng, BOLTS);
        const F = (se * At) / 1000;
        const { options, answer } = numericOptions({
          correct: F,
          unit: 'kN',
          digits: 1,
          correctWhy: `σ_{e} = ${se} MPa; F = σ_{e}·A_{t} = ${se} × ${At} ≈ ${fmt(F, 1)} kN.`,
          distractors: [
            { value: (sr * At) / 1000, why: 'Usou a resistência à tração (σ_{r}), não o limite de escoamento.' },
            { value: (se * Math.PI * d * d) / 4 / 1000, why: 'Usou a área do diâmetro nominal: a rosca resiste com a área resistente, menor.' },
            { value: (parseFloat(cls) * 100 * At) / 1000, why: `Leu "${cls}" como ${fmt(parseFloat(cls) * 100, 0)} MPa: o primeiro número dá σ_{r} e o segundo, a fração σ_{e}/σ_{r}.` },
            { value: (se * At) / 2000, why: 'Não há fator 1/2 aqui: a força de escoamento é σ_{e}·A_{t}.' },
          ],
        });
        return {
          prompt: `Um parafuso ${name} (área resistente à tração de ${fmt(At, 1)} mm²) é da classe de resistência ${cls}. A força de tração que leva esse parafuso ao escoamento é de, aproximadamente,`,
          options,
          answer,
          hint: 'Na classe "x.y": σ_{r} = x × 100 MPa e σ_{e} = (y/10)·σ_{r}. A força usa a área resistente da rosca.',
          steps: [
            `Classe ${cls}: σ_{r} = ${fmt(sr, 0)} MPa.`,
            `σ_{e} = ${fmt(se, 0)} MPa.`,
            `F = ${fmt(se, 0)} × ${fmt(At, 1)} = ${fmt(se * At, 0)} N ≈ **${fmt(F, 1)} kN**.`,
          ],
          explanation: `Classe ${cls}: σ_{r} = ${sr} MPa e σ_{e} = ${se} MPa. F = σ_{e}·A_{t} = ${se} × ${fmt(At, 1)} = **${fmt(F, 1)} kN**.`,
        };
      },
    },
    {
      id: 'mec-mol-08',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Para obter uma força muito grande com um curso pequeno, num espaço reduzido — empilhando elementos em série ou em paralelo conforme a necessidade —, usam-se molas',
      options: [
        { text: 'helicoidais de tração.', why: 'Trabalham com cursos grandes e forças moderadas.' },
        { text: 'de torção.', why: 'Trabalham girando os braços.' },
        { text: 'prato (Belleville).', why: 'Correta: arruelas cônicas, muita força em pouco curso, empilháveis.' },
        { text: 'espirais.', why: 'Típicas de relógios: pouca força.' },
        { text: 'de feixe.', why: 'Suspensões: grandes cursos.' },
      ],
      answer: 2,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: força **muito grande** com **curso pequeno**, em pouco espaço, empilhável.',
        'Molas prato (Belleville) são arruelas cônicas: empilhadas no mesmo sentido somam força; alternadas somam curso.',
        'Fica **prato (Belleville)**.',
      ],
      explanation: 'As **molas prato** (Belleville) são arruelas cônicas que dão grande força com pouca deflexão. Empilhadas no mesmo sentido (paralelo), somam força; alternadas (série), somam curso. Usadas em embreagens, válvulas e fixação de ferramentas.',
    },
    {
      id: 'mec-mol-09',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Numa mola helicoidal de compressão, qual alteração, mantidas as demais grandezas, deixa a mola **mais rígida**?',
      options: [
        { text: 'Aumentar o diâmetro médio das espiras.', why: 'k ∝ 1/D³: a mola fica mais mole.' },
        { text: 'Aumentar o número de espiras ativas.', why: 'k ∝ 1/n: mais mole.' },
        { text: 'Aumentar o diâmetro do fio.', why: 'Correta: k ∝ d⁴.' },
        { text: 'Trocar o aço por bronze fosforoso.', why: 'G menor: mais mole.' },
        { text: 'Aumentar o passo, com o mesmo número de espiras.', why: 'O passo não entra na rigidez: muda o comprimento livre e o curso.' },
      ],
      answer: 2,
      roteiro: 'rigidez-mola',
      steps: [
        'Cada alternativa muda uma grandeza só.',
        'k = G·d⁴/(8·D³·n): sobe com d (4ª potência) e com G; cai com D³ e com n. O passo nem aparece.',
        'Fica **aumentar o diâmetro do fio**. Bronze tem G menor; mais espiras e D maior também amolecem.',
      ],
      explanation: 'k = G·d⁴/(8·D³·n). Só aumentar d (ou G) e diminuir D ou n endurecem a mola. O passo muda o comprimento livre e o curso até fechar, mas não a rigidez.',
    },
    {
      id: 'mec-mol-10',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt:
        'Sobre os materiais e a fabricação de molas de aço submetidas a cargas cíclicas, considere as afirmações.\n\nI – A descarbonetação da superfície do fio reduz a resistência à fadiga da mola.\nII – O jateamento com granalha aumenta a vida em fadiga, pois deixa tensões residuais de compressão na superfície.\nIII – Grãos grosseiros e inclusões não metálicas no fio aumentam a tenacidade e a vida da mola.\n\nEstá correto o que se afirma em',
      options: [
        { text: 'I, apenas.', why: 'A II também está certa.' },
        { text: 'II, apenas.', why: 'A I também está certa.' },
        { text: 'I e II, apenas.', why: 'Correta.' },
        { text: 'II e III, apenas.', why: 'A III está errada.' },
        { text: 'I, II e III.', why: 'A III está errada.' },
      ],
      answer: 2,
      shuffle: false,
      roteiro: 'fmt.afirmativas',
      steps: [
        'I – **Correta**: a camada descarbonetada fica mole, e a trinca de fadiga começa na superfície.',
        'II – **Correta**: o jateamento com granalha deixa compressão residual, que dificulta a abertura de trincas.',
        'III – **Errada**: grão grosseiro e inclusões **pioram** a tenacidade e iniciam trincas; mola pede aço limpo e de grão fino.',
        'Certas: I e II → "I e II, apenas".',
      ],
      explanation: 'I – certa: a camada descarbonetada fica mole, e é na superfície que a trinca de fadiga começa. II – certa: a compressão residual dificulta a abertura das trincas. III – errada: grão grosseiro e inclusões **pioram** a tenacidade e são pontos de início de trinca — molas pedem aço limpo e de grão fino.',
    },
    {
      id: 'mec-mol-11',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Numa mola helicoidal sob compressão, a maior tensão de cisalhamento no fio ocorre',
      options: [
        { text: 'no lado de dentro da espira, voltado para o eixo da mola.', why: 'Correta: torção, cisalhamento direto e curvatura somam ali.' },
        { text: 'no lado de fora da espira.', why: 'Do lado de fora o cisalhamento direto se subtrai da torção.' },
        { text: 'no centro do fio.', why: 'No centro a tensão de torção é nula.' },
        { text: 'igualmente em toda a superfície do fio.', why: 'Isso valeria para uma barra reta em torção pura.' },
        { text: 'somente nas espiras das pontas.', why: 'As espiras ativas trabalham todas com o mesmo torque.' },
      ],
      answer: 0,
      roteiro: 'tensao-mola',
      steps: [
        'O fio é torcido por F·D/2: a torção dá τ máxima na superfície do fio.',
        'O cisalhamento direto (F/A) soma do lado de dentro da espira e subtrai do lado de fora.',
        'A curvatura concentra ainda mais tensão ali: o máximo fica **no lado de dentro, voltado para o eixo da mola** — é o que o fator de Wahl corrige.',
      ],
      explanation: 'A torção do fio (T = F·D/2) dá τ máxima na superfície; o cisalhamento direto (F/A) soma do lado de dentro da espira, e a curvatura do fio concentra ainda mais a tensão ali. O **fator de Wahl** junta os dois efeitos: τ = K_{w}·8FD/(πd³).',
    },
    {
      id: 'mec-mol-12',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Uma mola de compressão longa e esbelta, com comprimento livre igual a sete vezes o diâmetro médio, entorta para o lado quando é comprimida entre dois pratos. A solução mais adequada, sem trocar a mola, é',
      options: [
        { text: 'montá-la sobre uma haste ou dentro de um tubo de guia.', why: 'Correta: a guia impede a flambagem.' },
        { text: 'aumentar a força de compressão.', why: 'Mais força agrava a flambagem.' },
        { text: 'lubrificar as espiras.', why: 'Atrito não é a causa.' },
        { text: 'trocar os pratos por apoios articulados.', why: 'Pontas articuladas flambam com cargas ainda menores.' },
        { text: 'retificar as pontas da mola.', why: 'Ajuda o apoio, mas não resolve a esbeltez.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: mola **longa e esbelta** (L₀ = 7·D) que **entorta** ao ser comprimida.',
        'É flambagem: acima de uns 5,3·D (pratos paralelos) a mola de compressão fica instável. Sem trocar a mola, é preciso guiá-la.',
        'Fica **haste interna ou tubo de guia**.',
      ],
      explanation: 'Molas de compressão com L_{0} acima de uns 5,3·D (pontas em pratos paralelos) correm risco de **flambagem**. Sem trocar a mola, guia-se o corpo dela com uma haste interna ou um tubo externo — ou divide-se a mola em duas, com um prato guiado no meio.',
    },
    {
      id: 'mec-mol-13',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Para o fuso de uma prensa de parafuso, que faz grande força num só sentido, o perfil de rosca mais indicado é o',
      options: [
        { text: 'triangular métrico.', why: 'Perfil de fixação: muito atrito para transmitir força.' },
        { text: 'Whitworth.', why: 'Também de fixação.' },
        { text: 'redondo.', why: 'Para lâmpadas e peças sujeitas a sujeira.' },
        { text: 'dente de serra.', why: 'Correta: flanco quase reto no lado da carga.' },
        { text: 'de tubo cônico (NPT).', why: 'Para vedação de tubos.' },
      ],
      answer: 3,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **grande força num só sentido** (fuso de prensa).',
        'A rosca dente de serra tem um flanco quase perpendicular ao eixo (o da carga): rendimento alto e filete robusto num sentido. Força nos dois sentidos pede trapezoidal ou quadrada.',
        'Fica **dente de serra**.',
      ],
      explanation: 'A rosca **dente de serra** tem um flanco quase perpendicular ao eixo (o da carga) e outro inclinado: alto rendimento num sentido e filete robusto. Para força nos dois sentidos, usa-se a trapezoidal ou a quadrada.',
    },
    {
      id: 'mec-mol-14',
      difficulty: 1,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'A cabeça de um parafuso de aço traz a marcação "10.9". Isso significa que ele tem',
      options: [
        { text: 'σ_{r} = 1.000 MPa e σ_{e} = 900 MPa.', why: 'Correta.' },
        { text: 'σ_{r} = 109 MPa.', why: 'Não é um número só: 10 × 100 = σ_{r}; 0,9 × σ_{r} = σ_{e}.' },
        { text: 'diâmetro de 10 mm e passo de 0,9 mm.', why: 'A marcação da cabeça é a classe de resistência, não a rosca.' },
        { text: 'σ_{e} = 1.000 MPa e σ_{r} = 900 MPa.', why: 'Invertido: o escoamento é sempre menor que a resistência.' },
        { text: 'dureza de 109 HRC.', why: 'Não é dureza.' },
      ],
      answer: 0,
      roteiro: 'classe-parafuso',
      steps: [
        '10.9 → σ_{r} = 10 × 100 = **1.000 MPa**.',
        'σ_{e} = 0,9 × 1.000 = **900 MPa**.',
        'Fica σ_{r} = 1.000 MPa e σ_{e} = 900 MPa — a marcação não indica diâmetro, passo nem dureza.',
      ],
      explanation: 'Classe "x.y" (ISO 898-1): σ_{r} = x × 100 MPa e σ_{e} = (y/10)·σ_{r}. 10.9 → σ_{r} = 1.000 MPa e σ_{e} = 900 MPa. A porca deve ser da classe correspondente (10).',
    },
    {
      id: 'mec-mol-15',
      difficulty: 1,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Na montagem de um flange com junta de vedação, os parafusos devem ser apertados',
      options: [
        { text: 'um de cada vez, já com o torque final, seguindo o sentido horário.', why: 'Assim a junta assenta torta e vaza.' },
        { text: 'em cruz, alternando parafusos opostos, em etapas crescentes até o torque final.', why: 'Correta.' },
        { text: 'todos de uma vez com uma chave de impacto, sem controle de torque.', why: 'Sem controle, a pré-carga fica desigual.' },
        { text: 'primeiro os de baixo, depois os de cima, com o torque final.', why: 'Também assenta a junta de forma desigual.' },
        { text: 'no sentido anti-horário, para compensar a rosca direita.', why: 'O sentido da sequência não tem relação com a rosca.' },
      ],
      answer: 1,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: flange **com junta de vedação** — o aperto precisa ser uniforme.',
        'Aperto em cruz (estrela) e em etapas crescentes (ex.: 30 %, 60 % e 100 %) assenta a junta por igual; no fim, uma passada circular confere.',
        'Fica **em cruz, em etapas crescentes até o torque final**.',
      ],
      explanation: 'O aperto em **cruz** (estrela), em **etapas** (por exemplo 30 %, 60 % e 100 % do torque), assenta a junta por igual. No fim, uma passada em sequência circular confere todos os parafusos.',
    },
    {
      id: 'mec-mol-16',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Ao apertar um parafuso com torquímetro, a maior parte do torque aplicado',
      options: [
        { text: 'vira pré-carga no parafuso.', why: 'Só cerca de 10 % vira pré-carga.' },
        { text: 'é consumida pelo atrito sob a cabeça (ou a porca) e nos filetes.', why: 'Correta: uns 90 % vão para o atrito.' },
        { text: 'é armazenada como torção no corpo do parafuso.', why: 'Há alguma torção residual, mas pequena.' },
        { text: 'deforma plasticamente as peças apertadas.', why: 'A junta deve trabalhar no regime elástico.' },
        { text: 'é perdida como calor no torquímetro.', why: 'Não.' },
      ],
      answer: 1,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: para onde vai **a maior parte** do torque de aperto.',
        'Cerca de 50 % vence o atrito sob a cabeça (ou a porca) e uns 40 %, o atrito nos filetes: só ~10 % estica o parafuso.',
        'Fica **atrito sob a cabeça e nos filetes**. Por isso a pré-carga obtida por torque varia tanto com a lubrificação.',
      ],
      explanation: 'Cerca de 50 % do torque vence o atrito sob a cabeça ou a porca e uns 40 %, o atrito nos filetes: só ~10 % estica o parafuso. Por isso a pré-carga obtida por torque varia muito com a lubrificação (T ≈ K·F_{i}·d, com K de 0,15 a 0,2).',
    },
    {
      id: 'mec-mol-17',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Um parafuso de potência é autotravante — a carga não desce sozinha quando se solta a manivela — quando',
      options: [
        { text: 'o seu rendimento passa de 50 %.', why: 'É o contrário: autotravante tem η < 50 %.' },
        { text: 'tem várias entradas e passo grande.', why: 'Isso aumenta λ e tende a tirar o autotravamento.' },
        { text: 'a rosca é quadrada e bem lubrificada.', why: 'Pouco atrito tende a tirar o autotravamento.' },
        { text: 'o ângulo de atrito é maior que o ângulo de hélice (μ > tg λ).', why: 'Correta.' },
        { text: 'o diâmetro médio é pequeno em relação ao passo.', why: 'Isso aumenta tg λ = L/(π·d_{m}).' },
      ],
      answer: 3,
      roteiro: 'parafuso-potencia',
      steps: [
        'Desenrolada, a rosca é um plano inclinado de ângulo λ: tg λ = L/(π·d_{m}).',
        'O torque para descer é proporcional a (π·μ·d_{m} − L): só é positivo (é preciso forçar a descida) se μ > L/(π·d_{m}).',
        'Autotravante quando **μ > tg λ** — o ângulo de atrito maior que o de hélice, como uma caixa parada numa rampa pouco inclinada.',
      ],
      explanation: 'Desenrolada, a rosca é um plano inclinado de ângulo λ (tg λ = L/π·d_{m}). Se o ângulo de atrito φ (tg φ = μ) for maior que λ, a carga fica parada sozinha — como uma caixa numa rampa pouco inclinada. A consequência é η < 50 %.',
    },
    {
      id: 'mec-mol-18',
      difficulty: 1,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Numa junta de topo de duas chapas, unidas por rebites que atravessam duas talas (cobrejuntas), cada rebite trabalha em',
      options: [
        { text: 'cisalhamento simples.', why: 'Simples é o da junta sobreposta, com uma seção cortada.' },
        { text: 'cisalhamento duplo.', why: 'Correta: duas seções de cada rebite resistem.' },
        { text: 'tração pura.', why: 'A força é transversal ao rebite.' },
        { text: 'torção.', why: 'Não há torque no rebite.' },
        { text: 'flexão pura.', why: 'A flexão no rebite é secundária.' },
      ],
      answer: 1,
      roteiro: 'rebites',
      steps: [
        'Cada rebite atravessa as duas talas e a chapa.',
        'Com duas talas, cada rebite é cortado em **duas** seções.',
        '**Cisalhamento duplo**: τ = F/(n·2·π·d²/4).',
      ],
      explanation: 'Com duas talas, cada rebite atravessa três chapas e é cortado em **duas** seções: τ = F/(n·2·π·d²/4) — metade da tensão da junta sobreposta, com os mesmos rebites.',
    },
    {
      id: 'mec-mol-19',
      type: 'ce',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'No feixe de molas, as lâminas de comprimentos diferentes formam uma viga de resistência quase uniforme, solução clássica das suspensões de veículos pesados.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: lâminas de comprimentos **diferentes** formando viga de resistência **quase uniforme**.',
        'Lâminas cada vez mais curtas fazem a seção acompanhar o momento fletor, maior no centro: aproxima a viga de igual resistência.',
        '**Certo** — e o atrito entre as lâminas ainda amortece um pouco.',
      ],
      explanation: 'Certo. Empilhar lâminas cada vez mais curtas aproxima uma viga de igual resistência (a seção acompanha o momento fletor). O atrito entre as lâminas ainda amortece um pouco.',
    },
    {
      id: 'mec-mol-20',
      type: 'ce',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Dobrar o diâmetro do fio de uma mola helicoidal, mantidos o diâmetro médio e o número de espiras, dobra a rigidez da mola.',
      answer: false,
      roteiro: 'rigidez-mola',
      steps: [
        'Muda só o fio: d → 2d.',
        'k ∝ d⁴.',
        '2⁴ = 16: a mola fica **16 vezes** mais rígida, não 2: **Errado**.',
      ],
      explanation: 'Errado. k ∝ d⁴: com o fio 2 vezes mais grosso, a mola fica **16 vezes** mais rígida.',
    },
    {
      id: 'mec-mol-21',
      type: 'ce',
      difficulty: 1,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Duas molas iguais associadas em série têm rigidez equivalente igual à metade da rigidez de cada uma.',
      answer: true,
      roteiro: 'associacao-molas',
      steps: [
        'Duas molas iguais (k) em **série**: a mesma força passa pelas duas.',
        '1/k_{eq} = 1/k + 1/k = 2/k.',
        'k_{eq} = k/2: **Certo**.',
      ],
      explanation: 'Certo. Em série, a mesma força passa pelas duas e as deflexões se somam: 1/k_{eq} = 1/k + 1/k → k_{eq} = k/2.',
    },
    {
      id: 'mec-mol-22',
      type: 'ce',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Para evitar o surto numa mola de válvula, basta que a frequência natural da mola seja um pouco maior que a frequência de acionamento.',
      answer: false,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: frequência natural da mola **um pouco** maior que a de acionamento.',
        'O came excita vários harmônicos: para evitar surto, a frequência natural deve ficar **muito** acima — a regra prática é de 15 a 20 vezes.',
        'Um pouco acima não basta: **Errado**.',
      ],
      explanation: 'Errado. A excitação do came tem harmônicos: a frequência natural da mola deve ficar **muito** acima — a regra prática é de 15 a 20 vezes a frequência de acionamento.',
    },
    {
      id: 'mec-mol-23',
      type: 'ce',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Todo parafuso de potência autotravante tem rendimento inferior a 50 %.',
      answer: true,
      roteiro: 'parafuso-potencia',
      steps: [
        'Autotravante: μ > tg λ.',
        'Rendimento: η = tg λ·(1 − μ·tg λ)/(tg λ + μ).',
        'Com μ > tg λ, o denominador passa de 2·tg λ e η < 1/2: **Certo**. Fusos de esferas, de rendimento alto, precisam de freio.',
      ],
      explanation: 'Certo. A condição de autotravamento (μ > tg λ) leva a η = tg λ·(1 − μ·tg λ)/(tg λ + μ) < 1/2. Quem quer rendimento alto (fusos de esferas) precisa de freio para segurar a carga.',
    },
    {
      id: 'mec-mol-24',
      type: 'ce',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Numa união aparafusada com boa pré-carga, a carga externa de tração passa inteira para o parafuso.',
      answer: false,
      roteiro: 'pre-carga',
      steps: [
        'Com pré-carga, parafuso e peças dividem a carga externa: C = k_{b}/(k_{b} + k_{m}).',
        'Parafuso: F_{i} + C·P; as peças só descomprimem (1 − C)·P.',
        'Enquanto a junta não abre, o parafuso recebe só a fração C, em geral pequena: **Errado**.',
      ],
      explanation: 'Errado. Enquanto a junta não abre, a maior parte da carga externa só alivia a compressão das peças; o parafuso recebe a fração C = k_{b}/(k_{b} + k_{m}), em geral pequena. É por isso que a pré-carga protege o parafuso da fadiga.',
    },
    {
      id: 'mec-mol-25',
      type: 'gen',
      difficulty: 3,
      lessonRef: 5,
      title: 'Carga externa que abre a junta',
      roteiro: 'pre-carga',
      generate(rng) {
        const Fi = pickOne(rng, [20, 24, 30, 36, 40]);
        const kb = pickOne(rng, [400, 500, 600, 800]);
        const km = kb * pickOne(rng, [3, 4, 5]);
        const C = kb / (kb + km);
        const P0 = Fi / (1 - C);
        const { options, answer } = numericOptions({
          correct: P0,
          unit: 'kN',
          digits: 1,
          correctWhy: `C = ${fmt(C, 3)}; a junta abre quando F_{i} − (1 − C)·P = 0 → P = ${fmt(P0, 1)} kN.`,
          distractors: [
            { value: Fi, why: 'Achou que a junta abre com P = F_{i}: as peças só perdem a fração (1 − C)·P da compressão.' },
            { value: Fi / C, why: 'Usou C no lugar de (1 − C): quem alivia a compressão das peças é a fração (1 − C) da carga.' },
            { value: Fi * (1 - C), why: 'Multiplicou por (1 − C) em vez de dividir.' },
            { value: Fi * (1 + C), why: 'Calculou F_{i} + C·F_{i}: a carga que abre a junta sai de F_{i} − (1 − C)·P = 0.' },
          ],
        });
        return {
          prompt: `Um parafuso de rigidez ${kb} kN/mm prende duas peças cuja rigidez é ${fmt(km, 0)} kN/mm, com pré-carga de ${Fi} kN. Uma carga externa de tração P, aplicada aos poucos, tenta separar as peças. A junta começa a abrir quando P vale, aproximadamente,`,
          options,
          answer,
          hint: 'Fração da carga que vai para o parafuso: C = k_{b}/(k_{b} + k_{m}). As peças descomprimem de (1 − C)·P.',
          steps: [
            `C = ${kb}/(${kb} + ${fmt(km, 0)}) = ${fmt(C, 3)}.`,
            `Nas peças: F_{m} = ${Fi} − ${fmt(1 - C, 3)}·P.`,
            `F_{m} = 0 → P = ${Fi}/${fmt(1 - C, 3)} ≈ **${fmt(P0, 1)} kN** (aí o parafuso leva a carga externa inteira).`,
          ],
          explanation: `1. C = ${kb}/(${kb} + ${fmt(km, 0)}) = **${fmt(C, 3)}**.\n2. Força nas peças: F_{m} = F_{i} − (1 − C)·P. A junta abre quando F_{m} = 0 → **P = F_{i}/(1 − C)** = ${Fi}/${fmt(1 - C, 3)} ≈ **${fmt(P0, 1)} kN**.\n3. Nesse instante, o parafuso leva F_{i} + C·P = ${fmt(P0, 1)} kN — a carga externa inteira.`,
        };
      },
    },
    {
      id: 'mec-mol-26',
      difficulty: 3,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Uma mola helicoidal de compressão é cortada ao meio: as duas metades têm o mesmo fio e o mesmo diâmetro médio, mas metade das espiras ativas. Sob a **mesma força**, comparada à mola original, cada metade tem',
      options: [
        { text: 'a mesma tensão no fio e metade da deflexão.', why: 'Correta: τ = K_{w}·8·F·D/(π·d³) não depende de n; k dobra, então δ cai à metade.' },
        { text: 'metade da tensão no fio e metade da deflexão.', why: 'A tensão no fio não depende do número de espiras.' },
        { text: 'a mesma tensão no fio e o dobro da deflexão.', why: 'Menos espiras deixam a mola mais rígida: a deflexão diminui.' },
        { text: 'o dobro da tensão no fio e a mesma deflexão.', why: 'A tensão fica igual, e a deflexão cai à metade.' },
        { text: 'a mesma tensão e a mesma deflexão.', why: 'A rigidez é inversamente proporcional ao número de espiras ativas: k dobra.' },
      ],
      answer: 0,
      roteiro: 'rigidez-mola',
      steps: [
        'Mesmo fio e mesmo diâmetro médio; as espiras ativas caem à metade.',
        'τ = K_{w}·8FD/(πd³) não tem n: a tensão é a mesma. k = G·d⁴/(8D³n): com n/2, k dobra.',
        'δ = F/k cai à metade: **mesma tensão no fio e metade da deflexão**.',
      ],
      explanation: 'A tensão no fio vem do torque F·D/2: **τ = K_{w}·8·F·D/(π·d³)** — o número de espiras não aparece. A rigidez é **k = G·d⁴/(8·D³·n)**: com metade das espiras, **k dobra**, e a deflexão δ = F/k cai **à metade**. (Cuidado só com o comprimento livre menor: a metade fecha com menos curso.)',
    },
  ],
  games: [
    {
      id: 'mec-mol-g1',
      type: 'sort',
      title: 'Desmontável ou permanente?',
      intro: 'Cada elemento faz uma união **desmontável** (sai sem destruir nada) ou **permanente**?',
      lessonRef: 7,
      bins: ['Desmontável', 'Permanente'],
      items: [
        { text: 'Parafuso passante com porca', bin: 0, why: 'Basta desapertar.' },
        { text: 'Prisioneiro (estojo) de flange', bin: 0, why: 'Rosca nas duas pontas, sai com as porcas.' },
        { text: 'Chaveta paralela', bin: 0, why: 'Sai do rasgo.' },
        { text: 'Anel elástico', bin: 0, why: 'Sai com o alicate.' },
        { text: 'Pino cônico', bin: 0, why: 'Feito para desmontar muitas vezes.' },
        { text: 'Porca castelo com contrapino', bin: 0, why: 'Tira-se o contrapino e desaperta.' },
        { text: 'Rebite de cabeça redonda', bin: 1, why: 'Só sai cortando a cabeça.' },
        { text: 'Rebite cego (pop)', bin: 1, why: 'Também precisa ser destruído.' },
        { text: 'Cordão de solda', bin: 1, why: 'União por fusão.' },
        { text: 'Brasagem', bin: 1, why: 'Metal de adição fundido entre as peças.' },
        { text: 'Colagem estrutural', bin: 1, why: 'Adesivo curado.' },
        { text: 'Agrafagem (costura dobrada de chapas)', bin: 1, why: 'Desfazer amassa a chapa.' },
      ],
    },
    {
      id: 'mec-mol-g2',
      type: 'match',
      title: 'Molas e roscas',
      intro: 'Ligue cada termo ao que ele significa.',
      lessonRef: 1,
      leftLabel: 'Termo',
      rightLabel: 'Significado',
      perRound: 6,
      pairs: [
        { left: 'k = G·d⁴/(8·D³·n)', right: 'Rigidez da mola helicoidal', why: 'd = fio, D = diâmetro médio, n = espiras ativas.' },
        { left: 'C = D/d', right: 'Índice de mola', why: 'Na prática, entre 4 e 12.' },
        { left: 'Fator de Wahl', right: 'Corrige a tensão do lado de dentro da espira', why: 'Cisalhamento direto + curvatura.' },
        { left: 'Molas em série', right: '1/k_{eq} = 1/k_{1} + 1/k_{2}', why: 'Mesma força, deflexões somadas.' },
        { left: 'Molas em paralelo', right: 'k_{eq} = k_{1} + k_{2}', why: 'Mesma deflexão, forças somadas.' },
        { left: 'Mola prato', right: 'Grande força com curso pequeno', why: 'Arruela cônica (Belleville).' },
        { left: 'Avanço da rosca', right: 'Número de entradas × passo', why: 'Quanto a porca anda numa volta.' },
        { left: 'Classe 8.8', right: 'σ_{r} = 800 MPa e σ_{e} = 640 MPa', why: '8 × 100 e 0,8 × 800.' },
        { left: 'Prisioneiro (estojo)', right: 'Rosca nas duas pontas', why: 'Flanges e cabeçotes.' },
        { left: 'Contrapino (cupilha)', right: 'Trava a porca castelo', why: 'Passa pelo furo do parafuso e pelos rasgos da porca.' },
        { left: 'Autotravante', right: 'Ângulo de atrito maior que o de hélice', why: 'μ > tg λ.' },
        { left: 'Rosca dente de serra', right: 'Grande força num sentido só', why: 'Prensas e morsas.' },
      ],
    },
    {
      id: 'mec-mol-g3',
      type: 'order',
      title: 'Apertar um flange',
      intro: 'Ponha em ordem o aperto dos estojos de um flange com junta de vedação.',
      lessonRef: 5,
      steps: [
        { text: 'Limpar e lubrificar as roscas e as faces de apoio das porcas', why: 'O atrito decide quanto do torque vira pré-carga.' },
        { text: 'Posicionar a junta e encostar todas as porcas à mão', why: 'Tudo assentado antes de apertar.' },
        { text: 'Apertar em cruz até cerca de 30 % do torque final', why: 'Primeira etapa, alternando parafusos opostos.' },
        { text: 'Repetir em cruz até cerca de 60 % do torque', why: 'Segunda etapa.' },
        { text: 'Repetir em cruz até 100 % do torque', why: 'Torque final.' },
        { text: 'Passar em sequência circular conferindo o torque em todos', why: 'Até nenhuma porca girar mais.' },
      ],
    },
    {
      id: 'mec-mol-lab1',
      type: 'lab',
      lab: 'spring',
      title: 'Molas e macaco de parafuso',
      intro: 'Na prensa, mude o fio, o diâmetro, as espiras, o material e a montagem das molas; no macaco, mude a rosca e o atrito. Preveja a rigidez, a tensão no fio, o autotravamento e o rendimento.',
      lessonRef: 1,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 10, F: 400 },
          prompt: 'A mola tem **10 espiras ativas**. Se **2** forem cortadas (mesmo fio, mesmo diâmetro), com os mesmos 400 N…',
          change: { na: 8 },
          options: ['Fica 25 % mais rígida, com a mesma tensão no fio', 'Fica 20 % mais mole', 'Fica 25 % mais rígida e a tensão no fio sobe 25 %', 'Nada muda: a rigidez depende só do fio e do diâmetro'],
          answer: 0,
          expect: [
            { out: 'k', trend: 'up' },
            { out: 'defl', trend: 'down' },
            { out: 'tau', trend: 'same' },
          ],
          why: 'k ∝ 1/n: 10/8 = 1,25 → de 11,7 para **14,6 N/mm**, e a deflexão cai de 34 para 27 mm. A tensão, τ = K_{w}·8FD/(πd³), não tem n: continua 268 MPa.',
        },
        {
          kind: 'predict',
          setup: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 8, F: 400 },
          prompt: 'Em vez de uma mola, a prensa passa a comprimir **duas molas iguais em série** (uma sobre a outra), com os mesmos 400 N. O conjunto…',
          change: { arr: 1 },
          options: ['Encolhe o dobro, com a mesma tensão em cada fio', 'Encolhe a metade, porque são duas molas', 'Encolhe o mesmo, e cada mola leva 200 N', 'Encolhe o dobro, e a tensão em cada fio dobra'],
          answer: 0,
          expect: [
            { out: 'keq', trend: 'down' },
            { out: 'defl', trend: 'up' },
            { out: 'tau', trend: 'same' },
          ],
          why: 'Em série, cada mola leva a força **inteira** (400 N) e as deflexões se somam: 27 + 27 = **55 mm**, k_{eq} = k/2 = 7,3 N/mm. A tensão em cada fio é a mesma de antes.',
        },
        {
          kind: 'predict',
          setup: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 8, F: 400 },
          prompt: 'E se as duas molas forem montadas **em paralelo** (lado a lado, sob o mesmo prato)?',
          change: { arr: 2 },
          options: ['Rigidez dobra e a tensão em cada fio cai à metade', 'Rigidez cai à metade', 'Rigidez dobra e a tensão em cada fio dobra', 'Nada muda na tensão: a força é a mesma'],
          answer: 0,
          expect: [
            { out: 'keq', trend: 'up' },
            { out: 'defl', trend: 'down' },
            { out: 'tau', trend: 'down' },
          ],
          why: 'Em paralelo as duas encolhem igual e **dividem a força**: 200 N em cada. k_{eq} = 2k = 29,3 N/mm, deflexão de 13,7 mm e tensão de 134 MPa em cada fio.',
        },
        {
          kind: 'predict',
          setup: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 8, F: 400 },
          prompt: 'A mesma mola é refeita em **bronze fosforoso** (G = 41 GPa, contra 80 GPa do aço). Com os mesmos 400 N…',
          change: { mat: 2 },
          options: ['Encolhe quase o dobro, com a mesma tensão no fio', 'Encolhe quase o dobro, com o dobro da tensão', 'Encolhe a metade', 'Nada muda: a geometria é a mesma'],
          answer: 0,
          expect: [
            { out: 'k', trend: 'down' },
            { out: 'defl', trend: 'up' },
            { out: 'tau', trend: 'same' },
          ],
          why: 'k ∝ G: de 14,6 para **7,5 N/mm** e a deflexão vai de 27 para 53 mm. A tensão no fio só depende da força e da geometria (268 MPa) — mas o bronze admite bem menos que o aço (FS cai de 2,6 para 1,2).',
        },
        {
          kind: 'predict',
          setup: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 8, F: 400 },
          prompt: 'O diâmetro médio passa de **48 para 60 mm** (mesmo fio, mesmas espiras). A rigidez e a tensão no fio…',
          change: { Dm: 60 },
          options: ['A rigidez cai quase à metade e a tensão sobe', 'A rigidez sobe e a tensão cai', 'A rigidez cai 25 % e a tensão não muda', 'As duas sobem'],
          answer: 0,
          expect: [
            { out: 'k', trend: 'down' },
            { out: 'tau', trend: 'up' },
          ],
          why: 'k ∝ 1/D³: (48/60)³ = 0,51 → de 14,6 para **7,5 N/mm**. O torque no fio (F·D/2) cresce com D: τ sobe de 268 para 324 MPa (o fator de Wahl até cai um pouco, de 1,18 para 1,15).',
        },
        {
          kind: 'goal',
          setup: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 8, F: 400 },
          lock: ['modo', 'arr', 'mat', 'dw', 'Dm', 'F'],
          prompt: 'Uma válvula pede uma mola de **19 a 21 N/mm**, com o mesmo fio de 6 mm e o mesmo diâmetro de 48 mm. Escolha o número de **espiras ativas**.',
          goals: [{ out: 'k', min: 19, max: 21, label: 'k entre 19 e 21 N/mm' }],
          hint: 'k·n é constante: com 8 espiras, k = 14,65 N/mm. Para chegar a ~20, n = 8 × 14,65/20.',
          solution: { na: 6 },
          why: 'k·n = 14,65 × 8 ≈ 117: com **6 espiras**, k = 117/6 ≈ 19,5 N/mm. Com 5 seriam 23,4.',
        },
        {
          kind: 'goal',
          setup: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 8, F: 1000 },
          lock: ['modo', 'arr', 'mat', 'Dm', 'na', 'F'],
          prompt: 'Com 1.000 N, o fio de 6 mm trabalha no limite (FS ≈ 1,05). Escolha o **diâmetro do fio** para ter fator de segurança de pelo menos **1,5**.',
          goals: [{ out: 'FS', min: 1.5, label: 'FS ≥ 1,5' }],
          hint: 'τ ∝ 1/d³ (com o fator de Wahl mudando um pouco). Precisa de τ ≤ 700/1,5 ≈ 467 MPa.',
          solution: { dw: 7 },
          why: 'Com 7 mm: C = 6,9, K_{w} = 1,22 e τ = 434 MPa → FS = 700/434 = **1,61** (com 6,5 mm ainda dá 1,31). De quebra a mola fica bem mais rígida: k vai de 14,6 para 27 N/mm (d⁴).',
        },
        {
          kind: 'predict',
          setup: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 8, F: 1600 },
          prompt: 'Com 1.600 N a mola está quase fechada. A força sobe para **1.800 N**. O que acontece?',
          change: { F: 1800 },
          options: ['As espiras encostam: a mola vira um bloco e para de encolher', 'A mola continua encolhendo 14,6 mm a cada 100 N', 'A mola volta a ficar mais mole', 'A mola rompe imediatamente'],
          answer: 0,
          expect: [{ out: 'solid', trend: 'up' }],
          why: 'O curso até fechar é L₀ − L_{s} = 175 − 60 = 115 mm, alcançado com 1.687 N. Daí em diante as espiras encostam: o conjunto vira um bloco maciço e a força a mais passa direto pelo aço. Uma mola nunca deve trabalhar assim — a tensão de 1.131 MPa já passou da admissível.',
        },
        {
          kind: 'predict',
          setup: { modo: 1, perfil: 1, ent: 0, pas: 6, dmed: 33, mu: 0.15, W: 10, R: 0.3 },
          prompt: 'O macaco tem rosca Tr 36 × 6 de **1 entrada** e é autotravante. Trocando por um fuso de **3 entradas** (mesmo passo), o que acontece?',
          change: { ent: 2 },
          options: ['Sobe 3× mais rápido, rende mais de 50 % e a carga passa a descer sozinha', 'Sobe 3× mais rápido e continua autotravante', 'Sobe mais devagar, com mais força', 'Nada muda: o passo é o mesmo'],
          answer: 0,
          expect: [
            { out: 'lambda', trend: 'up' },
            { out: 'eta', trend: 'up' },
            { out: 'lock', trend: 'down' },
          ],
          why: 'O avanço vai a 3 × 6 = 18 mm por volta e o ângulo de hélice, de 3,3° para **9,9°** — maior que o ângulo de atrito (8,8°). O rendimento passa de 27 % para **51 %**, e solta, a carga desce sozinha.',
        },
        {
          kind: 'predict',
          setup: { modo: 1, perfil: 1, ent: 0, pas: 6, dmed: 33, mu: 0.15, W: 10, R: 0.3 },
          prompt: 'Alguém lubrifica a rosca com um lubrificante especial e o atrito cai de **0,15 para 0,05**. O macaco…',
          change: { mu: 0.05 },
          options: ['Fica mais leve de girar, mas deixa de ser autotravante', 'Fica mais leve e continua autotravante', 'Fica mais pesado de girar', 'Nada muda no autotravamento: ele depende só do passo'],
          answer: 0,
          expect: [
            { out: 'Tup', trend: 'down' },
            { out: 'eta', trend: 'up' },
            { out: 'lock', trend: 'down' },
          ],
          why: "O torque para subir cai de 35 para **18 N·m** (rendimento de 27 % para 53 %), mas μ′ = 0,052 ficou menor que tg λ = 0,058: a carga **desce sozinha**. Autotravamento é atrito — lubrificar demais pode tirá-lo.",
        },
        {
          kind: 'predict',
          setup: { modo: 1, perfil: 1, ent: 0, pas: 6, dmed: 33, mu: 0.15, W: 10, R: 0.3 },
          prompt: 'A carga **dobra** (10 → 20 kN). O torque para subir e o rendimento…',
          change: { W: 20 },
          options: ['O torque dobra e o rendimento não muda', 'Os dois dobram', 'O torque dobra e o rendimento cai à metade', 'O torque quadruplica'],
          answer: 0,
          expect: [
            { out: 'Tup', trend: 'up' },
            { out: 'eta', trend: 'same' },
          ],
          why: 'T = (W·d_{m}/2)·(…) é proporcional a W: de 35,5 para **71 N·m**. O rendimento η = tg λ·(1 − μ′·tg λ)/(tg λ + μ′) só depende da geometria e do atrito: continua 26,9 %.',
        },
        {
          kind: 'goal',
          setup: { modo: 1, perfil: 1, ent: 0, pas: 6, dmed: 33, mu: 0.15, W: 20, R: 0.3 },
          lock: ['modo', 'perfil', 'ent', 'pas', 'dmed', 'mu', 'W'],
          prompt: 'Com 20 kN, a mão precisa fazer 237 N na manivela de 0,3 m. Ajuste a **manivela** para a força na mão ficar em **no máximo 150 N**.',
          goals: [{ out: 'Fman', max: 150, label: 'força na mão ≤ 150 N' }],
          hint: 'F = T/R, com T = 71 N·m. R ≥ 71/150.',
          solution: { R: 0.5 },
          why: 'R ≥ 71/150 = 0,47 m: com **0,5 m**, a força cai para 142 N. O torque é o mesmo — a manivela mais longa só troca força por distância percorrida pela mão.',
        },
      ],
    },
  ],
});
