import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic, type ChoiceOption } from '../../../learning/types';

export default defineTopic({
  id: 'mec.hidrostatica-bernoulli',
  name: 'Fluidos: hidrostática, Bernoulli e tubulações',
  summary: 'Pressão em fluidos parados, manômetros, empuxo e comportas, continuidade, Bernoulli, viscosidade e Reynolds, análise dimensional, perda de carga em tubos, bocais e arrasto.',
  order: 2,
  weight: 3,
  equipment: 'pipe',
  edital: ['b1.fluidos-propriedades', 'b1.fluidos-dinamica', 'b1.analise-dimensional', 'b1.tubulacoes', 'b1.arrasto'],
  lesson: [
    {
      title: 'Hidrostática e manômetros',
      body: 'Em um fluido em repouso, a pressão cresce linearmente com a profundidade (**Lei de Stevin**):\n\n**p = p_{0} + ρ·g·h**   (diferença entre dois pontos: Δp = ρ·g·Δh = γ·Δh)\n\n- Só importa a **profundidade**, não o formato do recipiente (paradoxo hidrostático). No mesmo líquido em repouso, pontos na **mesma altura** têm a **mesma pressão**.\n- Num ponto, a pressão é a mesma em **todas as direções**.\n- **Pressão absoluta** = manométrica + atmosférica (p_{atm} ≈ 101 kPa ≈ 1 bar).\n- **Altura de carga:** h = Δp/γ (metros de coluna do fluido).\n- **Pascal:** uma pressão aplicada a um fluido confinado se transmite integralmente (prensa hidráulica: F_{2}/F_{1} = A_{2}/A_{1}).\n- **Manômetro:** percorra o tubo de um ponto ao outro somando ρ·g·h ao **descer** e subtraindo ao **subir**. No manômetro diferencial com mercúrio entre dois pontos de uma linha de água: Δp = (ρ_{Hg} − ρ_{água})·g·Δh.',
      example: 'A 10 m de profundidade na água (ρ = 1.000 kg/m³, g ≈ 10 m/s²): p_{man} = 1.000 × 10 × 10 = 100.000 Pa = **100 kPa** ≈ 1 bar a mais que na superfície.',
      hot: 'Diferença de pressão entre duas profundidades (Transpetro 2012), altura de carga h = Δp/γ (Petrobras 2014) e **manômetros com dois ou três fluidos** (Petrobras 2011, BR 2012). E a pegadinha do "NÃO se constata" sobre hidrostática (Petrobras 2018).',
      tip: '**10 m de coluna d’água ≈ 1 bar.** No manômetro: **desceu, soma; subiu, subtrai.**',
      trap: 'No manômetro diferencial com mercúrio, esquecer a coluna de água do outro ramo: o certo é (ρ_{Hg} − ρ_{água}), não só ρ_{Hg}.',
    },
    {
      title: 'Empuxo e forças em superfícies',
      body: 'Todo corpo imerso sofre uma força vertical, para cima, igual ao **peso do fluido deslocado**:\n\n**E = ρ_{fluido}·g·V_{submerso}**\n\n- O corpo flutua quando ρ_{corpo} < ρ_{fluido}: ele afunda até deslocar o próprio peso.\n- **Peso aparente** = peso real − empuxo. Um corpo afundando com aceleração: P − E − F_{arrasto} = m·a.\n\n**Força numa superfície plana submersa** (comporta): **F = ρ·g·h_{CG}·A** — a pressão no **centroide** vezes a área. Ela atua no **centro de pressão**, abaixo do centroide: y_{CP} = y_{CG} + I_{CG}/(y_{CG}·A). Comporta vertical retangular com a borda de cima na superfície: F = ρ·g·b·H²/2, aplicada a **2/3 da altura** (contando da superfície).',
      example: 'Bloco de 0,02 m³ totalmente submerso em água: E = 1.000 × 10 × 0,02 = **200 N**. Comporta vertical de 2 m de altura e 3 m de largura, com água até o topo: F = 1.000 × 10 × 1 × (2 × 3) = **60 kN**, aplicada a 1,33 m de profundidade.',
      hot: 'Comporta com a força resultante e o **ponto de aplicação** (Transpetro 2018) e corpo afundando com aceleração, com empuxo e resistência (Petrobras 2012).',
      tip: 'Força na comporta = **pressão no meio × área**. O ponto de aplicação fica mais **fundo** que o meio, porque embaixo a pressão é maior.',
      trap: 'O empuxo depende da massa específica do **fluido** e do volume **submerso** — não da massa específica do corpo. E na comporta, usar a pressão do **fundo** (ρ·g·H) dobra a força.',
    },
    {
      title: 'Continuidade',
      body: 'Conservação da massa em regime permanente: **ρ·A·V = constante** (vazão mássica).\n\nPara líquido (incompressível): **Q = A_{1}·V_{1} = A_{2}·V_{2}**.\n\nComo a área é proporcional a d², **metade do diâmetro → velocidade 4 vezes maior**.\n\nPara **gás**, a massa específica muda: ρ_{1}·A_{1}·V_{1} = ρ_{2}·A_{2}·V_{2} (e ρ = P/(R·T) se for gás perfeito).',
      example: 'Água a 2 m/s num tubo de 100 mm que reduz para 50 mm: V_{2} = 2 × (100/50)² = **8 m/s**.',
      hot: 'Continuidade cai quase todo ano: bocal com líquido (Transpetro 2012), expansão de seção (Petrobras 2012) e **gás** mudando de massa específica numa redução (Petrobras 2018, BR 2012).',
      tip: '**Metade do diâmetro, quatro vezes a velocidade.** Um terço do diâmetro, nove vezes.',
      trap: 'Fazer a proporção só pelo diâmetro (daria 4 m/s). Quem conta é a **área**: o quadrado da razão dos diâmetros.',
      lab: { lab: 'venturi', preset: { d2: 50, Q: 12 }, label: 'Ver a continuidade no Venturi' },
    },
    {
      title: 'Bernoulli',
      body: 'Ao longo de uma linha de corrente, em escoamento **permanente, incompressível, sem atrito** e sem máquinas:\n\n**p + ρ·V^{2}/2 + ρ·g·z = constante**\n\nEm cargas (metros de coluna): p/(ρ·g) + V^{2}/(2·g) + z = H.\n\n- **Venturi:** no estreitamento a velocidade sobe e a **pressão cai** — essa diferença mede a vazão.\n- **Tubo de Pitot:** mede a **pressão de estagnação** p_{0} = p + ρ·V²/2 (onde o fluido para); V = √(2·Δp/ρ).\n- Com atrito e máquinas: soma-se a carga da bomba (H_{B}) e subtrai-se a **perda de carga** (h_{L}).',
      hot: 'Pressão de estagnação p + ½ρV² e Pitot medindo vazão (Petrobras 2018); variação de pressão numa expansão de tubo com continuidade + Bernoulli (Petrobras 2012).',
      tip: 'As três cargas somam sempre o mesmo (sem perdas): **pressão + velocidade + altura**. Se uma sobe, outra desce.',
      trap: 'Usar Bernoulli "puro" entre a entrada e a saída de uma bomba, ou num trecho longo com atrito: faltam H_{B} e h_{L}.',
      lab: { lab: 'venturi', preset: { pitot: 1, Q: 15 }, label: 'Ver o Bernoulli no Venturi' },
    },
    {
      title: 'Viscosidade e número de Reynolds',
      body: '**Lei de Newton da viscosidade:** τ = μ·du/dy — a tensão de cisalhamento é proporcional à taxa de deformação. Fluido que obedece a isso é **newtoniano** (água, ar, óleos); **fluido ideal** é o de viscosidade **nula**. Placa puxada sobre um filme fino (perfil linear): τ = F/A = μ·V/h.\n\n**Viscosidade dinâmica** μ (Pa·s = N·s/m²) mede a resistência ao cisalhamento; a **cinemática** é ν = μ/ρ (m²/s — só comprimento e tempo).\n\n- Líquidos: a viscosidade **diminui** quando a temperatura aumenta.\n- Gases: a viscosidade **aumenta** com a temperatura.\n\n**Número de Reynolds** (forças de inércia ÷ forças viscosas):\n\n**Re = ρ·V·D/μ = V·D/ν**\n\nEm tubos: **laminar** abaixo de ~2.000 (alguns livros usam 2.300) e **turbulento** acima de ~4.000, com transição entre eles. No laminar, o fator de atrito é f = 64/Re e o perfil de velocidade é parabólico.',
      example: 'Água (ν ≈ 1 × 10^{−6} m²/s) a 0,5 m/s em tubo de 40 mm: Re = 0,5 × 0,04 / 10^{−6} = **20.000** → turbulento.',
      hot: 'Re = inércia ÷ viscosas (Transpetro 2012), os limites **2.000 e 4.000** (Petrobras 2014), fluido ideal = viscosidade nula (Transpetro 2011), unidades da viscosidade cinemática (Petrobras 2014) e a placa ou o cilindro deslizando sobre um filme de óleo (Petrobras 2012, Transpetro 2018).',
      tip: 'Água em tubulação industrial quase sempre escoa em regime **turbulento**. Óleo quente "afina", gás quente "engrossa".',
      trap: 'Re é adimensional: o diâmetro vai em **metros**. Com mm, o Re sai mil vezes maior.',
    },
    {
      title: 'Análise dimensional e semelhança',
      body: '**Teorema dos Pi (Buckingham):** um problema com **n** variáveis e **k** dimensões básicas (M, L, T...) se reduz a **n − k** grupos adimensionais.\n\nOs grupos que mais caem:\n- **Reynolds** = inércia/viscosas (escoamento em tubos, perfis).\n- **Froude** = inércia/gravidade, V/√(g·L) (superfície livre: navios, canais, vertedouros).\n- **Euler** = pressão/inércia, Δp/(ρ·V²).\n- **Mach** = inércia/compressibilidade, V/c (gases a alta velocidade).\n- **Weber** = inércia/tensão superficial (gotas, bolhas, jatos finos).\n\n**Semelhança dinâmica:** modelo e protótipo com os **mesmos** adimensionais relevantes. Igualando Re com o mesmo fluido: V_{m}·L_{m} = V_{p}·L_{p} → um modelo 10 vezes menor precisa de velocidade 10 vezes maior.',
      example: 'Óleo (ν = 10^{−5} m²/s) a 2 m/s num tubo de 200 mm tem Re = 40.000. Para reproduzir com água (ν = 10^{−6}) num tubo de 50 mm: V = Re·ν/D = 40.000 × 10^{−6}/0,05 = **0,8 m/s**.',
      hot: 'Pares "número × razão de forças" (Transpetro 2012, Petrobras 2011, Petrobras Biocombustível 2010), quantos grupos pi (Petrobras 2014) e a velocidade do ensaio em modelo pelo mesmo Re (Petrobras 2012, Transpetro 2018).',
      tip: '**R**eynolds = **R**esistência viscosa; **F**roude = **F**orça da gravidade; **M**ach = **M**ola do gás (compressibilidade); **W**eber = **W**ater-drop (gota, tensão superficial); **E**uler = **E**mpurrão da pressão.',
      trap: 'Mesmo fluido e mesmo Re: o modelo menor precisa de **mais** velocidade, não menos.',
    },
    {
      title: 'Perda de carga em tubulações',
      body: '**Darcy-Weisbach** (perda distribuída, em metros de coluna):\n\n**h_{f} = f·(L/D)·V²/(2·g)**   e   Δp = ρ·g·h_{f}\n\n- **Laminar:** f = 64/Re (não depende da rugosidade). Para a mesma vazão, h_{f} ∝ 1/D⁴ (Hagen-Poiseuille).\n- **Turbulento:** f vem do **diagrama de Moody**, em função de Re e da **rugosidade relativa** ε/D.\n- **Perdas localizadas** (válvulas, curvas, entradas): h = K·V²/(2·g).\n\n**Tubos em série:** a **vazão** é a mesma em todos e as **perdas se somam**. **Tubos em paralelo:** a **perda** é a mesma em todos os ramos e as **vazões se somam**.',
      example: 'f = 0,02, L = 100 m, D = 0,1 m e V = 2 m/s (g = 10): h_{f} = 0,02 × 1.000 × 4/20 = **4 m** de coluna d’água (≈ 40 kPa).',
      hot: 'Perda de carga com o fator de atrito dado (Transpetro 2011), tubos em **série × paralelo** (Petrobras Biocombustível 2010) e escoamento laminar entre dois tanques (Transpetro 2018).',
      tip: 'Série = **corrente** (a mesma vazão passa por todos); paralelo = **tensão** (a mesma perda em todos os ramos) — igual a resistores elétricos.',
      trap: 'Esquecer o 2g: f·(L/D)·V² sozinho não é perda de carga. E dobrar a velocidade **quadruplica** a perda.',
    },
    {
      title: 'Bocais e arrasto',
      body: '**Bocais** (escoamento isentrópico de gás):\n\n- **Subsônico (M < 1):** área diminui → velocidade **aumenta** e pressão **cai** (bocal **convergente** acelera).\n- **Supersônico (M > 1):** é o contrário — área **aumenta** → velocidade aumenta e pressão cai (bocal **divergente** acelera).\n- A garganta de um bocal convergente-divergente chega a **M = 1** (escoamento bloqueado). Mach = V/c, com c = √(k·R·T).\n\n**Arrasto e sustentação:** F_{D} = C_{D}·(ρ·V²/2)·A e F_{L} = C_{L}·(ρ·V²/2)·A. Para **Re ≪ 1** (escoamento de Stokes, esfera): **F_{D} = 3π·μ·V·D** (C_{D} = 24/Re) — proporcional à viscosidade e à velocidade, não ao quadrado dela.',
      example: 'Em M > 1, o gás acelera na parte **divergente** de um bocal de foguete: a pressão cai e a velocidade continua subindo.',
      hot: 'Bocal subsônico × supersônico, com o que acontece com V, p e ρ (Transpetro 2011 e 2018, Petrobras 2011 e 2014), e o arrasto de uma esfera com Re baixíssimo (Petrobras 2018).',
      tip: '**Abaixo do som, aperta para acelerar; acima do som, abre para acelerar.**',
      trap: 'Achar que bocal divergente sempre desacelera: isso só vale no subsônico.',
    },
  ],
  roteiros: [
    {
      id: 'stevin',
      name: 'Pressão numa profundidade (Stevin)',
      when: 'Tanque ou reservatório com líquido; pedem a pressão a uma profundidade, manométrica ou absoluta.',
      steps: [
        'Separe os dados: massa específica do líquido, profundidade e se a pressão pedida é manométrica ou absoluta.',
        'Calcule a parcela do líquido: ρ·g·h (em Pa; divida por 1.000 para kPa).',
        'Absoluta: some a pressão atmosférica. Manométrica: pare aqui.',
      ],
      note: '**10 m de água ≈ 100 kPa ≈ 1 bar.** Manométrica não inclui a atmosfera; absoluta inclui.',
    },
    {
      id: 'altura-coluna',
      name: 'Altura de coluna equivalente (h = Δp/γ)',
      when: 'Pedem quantos metros de coluna de um fluido equivalem a uma pressão (ou a pressão em metros de coluna).',
      steps: [
        'Passe a pressão para pascal (1 kPa = 1.000 Pa).',
        'Calcule o peso específico do fluido: γ = ρ·g.',
        'Divida: h = Δp/γ.',
      ],
      note: 'Fluido mais denso, coluna menor: a de mercúrio é 13,6 vezes menor que a de água para a mesma pressão.',
    },
    {
      id: 'manometro',
      name: 'Manômetro diferencial em U',
      when: 'Um tubo em U com fluido manométrico (mercúrio) liga dois pontos de uma linha; pedem a diferença de pressão.',
      steps: [
        'Percorra o manômetro de um ponto ao outro: desceu, soma ρ·g·h; subiu, subtrai.',
        'Corte as colunas iguais nos dois ramos: sobra Δp = (ρ_{manométrico} − ρ_{linha})·g·Δh.',
        'Calcule com Δh em metros e converta para a unidade pedida.',
      ],
      note: 'O fluido da linha "desconta" do manométrico: água sobre mercúrio dá 13.600 − 1.000 = 12.600 kg/m³.',
    },
    {
      id: 'comporta',
      name: 'Força numa comporta plana',
      when: 'Comporta ou parede plana submersa; pedem a força da água ou onde ela atua.',
      steps: [
        'Ache a profundidade do centroide da área molhada (h_{CG}) e a área A.',
        'A pressão cresce de zero (superfície) a ρ·g·H (fundo); a força é a pressão no centroide vezes a área: F = ρ·g·h_{CG}·A.',
        'Ponto de aplicação: o centro de pressão fica abaixo do centroide — a 2H/3 da superfície na comporta vertical que começa nela.',
      ],
      note: 'Usar a pressão do fundo (ρ·g·H) para a área toda dobra a força: é o distrator clássico.',
    },
    {
      id: 'empuxo',
      name: 'Empuxo (Arquimedes)',
      when: 'Corpo imerso ou flutuando; pedem o empuxo, o peso aparente ou se o corpo flutua.',
      steps: [
        'Identifique o fluido e o volume **submerso** do corpo.',
        'Calcule E = ρ_{fluido}·g·V_{submerso}.',
        'Compare com o peso, se pedirem: flutua (E = P), peso aparente (P − E) ou aceleração (P − E = m·a).',
      ],
      note: 'O empuxo usa a massa específica do **fluido**; a do corpo só decide se ele afunda.',
    },
    {
      id: 'continuidade',
      name: 'Continuidade numa mudança de seção',
      when: 'Tubo que muda de diâmetro; pedem a velocidade, a vazão ou, para gás, a massa específica numa das seções.',
      steps: [
        'Escreva a conservação da massa: ρ₁·A₁·V₁ = ρ₂·A₂·V₂ (líquido: ρ₁ = ρ₂, sobra A₁·V₁ = A₂·V₂).',
        'Troque a razão das áreas pela dos diâmetros ao quadrado: A₁/A₂ = (D₁/D₂)².',
        'Isole a incógnita e calcule.',
      ],
      note: '**Metade do diâmetro, 4× a velocidade** (líquido). Gás que acelera mais que isso está se expandindo: a massa específica caiu.',
    },
    {
      id: 'bernoulli',
      name: 'Bernoulli entre duas seções',
      when: 'Tubo, Venturi ou bocal entre dois pontos; pedem a pressão, a diferença de pressão ou o que acontece com p e V.',
      steps: [
        'Ache a velocidade em cada seção pela continuidade (área menor → velocidade maior).',
        'Escreva Bernoulli entre as seções (com a perda h_{L}, se houver atrito) e corte o que é igual dos dois lados.',
        'Isole a pressão pedida e confira o sentido: onde a velocidade sobe, a pressão cai.',
      ],
      note: 'Sem perdas e na mesma cota, velocidade e pressão andam em sentidos opostos. Alternativa com as duas subindo numa redução sai sem conta.',
    },
    {
      id: 'pitot',
      name: 'Velocidade pelo tubo de Pitot',
      when: 'Tubo de Pitot ou "pressão de estagnação"; pedem a velocidade ou a pressão dinâmica.',
      steps: [
        'Identifique a diferença medida: estagnação − estática = pressão dinâmica (em Pa).',
        'Escreva Δp = ½·ρ·V².',
        'Isole a velocidade: V = √(2·Δp/ρ).',
      ],
      note: 'Os distratores esquecem o 2 ou a raiz. Confira: ½·ρ·V² com o seu V tem que dar o Δp do enunciado.',
    },
    {
      id: 'reynolds',
      name: 'Número de Reynolds e regime',
      when: 'Dão velocidade, diâmetro e viscosidade; pedem Re ou se o escoamento é laminar ou turbulento.',
      steps: [
        'Passe tudo para o SI: diâmetro em metros, viscosidade em m²/s (ou Pa·s, junto com ρ).',
        'Calcule Re = V·D/ν (ou ρ·V·D/μ).',
        'Classifique: laminar abaixo de ~2.000; turbulento acima de ~4.000; entre eles, transição.',
      ],
      note: 'Re é adimensional: se sobrou unidade, faltou conversão. Diâmetro em mm deixa o Re mil vezes maior.',
    },
    {
      id: 'filme-oleo',
      name: 'Placa sobre filme de óleo (lei de Newton da viscosidade)',
      when: 'Placa, eixo ou bloco deslizando sobre uma película fina de óleo; pedem força, tensão, velocidade ou viscosidade.',
      steps: [
        'Filme fino: suponha perfil linear de velocidade, du/dy = V/h, com h em metros.',
        'Lei de Newton da viscosidade: τ = μ·V/h (e F = τ·A, se pedirem força).',
        'Isole a incógnita e calcule.',
      ],
      note: 'Espessura em mm: passe para metros. Dobrar a espessura do filme reduz a tensão à metade.',
    },
    {
      id: 'buckingham',
      name: 'Teorema dos Pi (quantos grupos adimensionais)',
      when: 'Pedem o número de grupos adimensionais independentes de um fenômeno.',
      steps: [
        'Conte as variáveis do problema (n).',
        'Conte as dimensões básicas envolvidas (k: massa, comprimento, tempo...).',
        'Grupos π = n − k.',
      ],
      note: 'Se o enunciado só lista as variáveis, escreva a dimensão de cada uma (M, L, T) para achar k.',
    },
    {
      id: 'semelhanca',
      name: 'Semelhança dinâmica (modelo × protótipo)',
      when: 'Modelo em escala ou troca de fluido; pedem a velocidade do ensaio para haver semelhança.',
      steps: [
        'Escolha o número que governa: tubo ou corpo submerso → Reynolds; superfície livre (navio, canal) → Froude.',
        'Iguale o número no modelo e no protótipo: V_{m}·L_{m}/ν_{m} = V_{p}·L_{p}/ν_{p}.',
        'Isole a velocidade do modelo.',
      ],
      note: 'Mesmo fluido e mesmo Reynolds: modelo **menor** exige velocidade **maior**. Por Froude, a velocidade cai com √(escala).',
    },
    {
      id: 'darcy',
      name: 'Perda de carga distribuída (Darcy-Weisbach)',
      when: 'Tubulação com comprimento, diâmetro e fator de atrito (ou dados para achá-lo); pedem a perda de carga ou a queda de pressão.',
      steps: [
        'Ache o fator de atrito: dado no enunciado, 64/Re (laminar) ou diagrama de Moody (turbulento).',
        'Calcule as partes: L/D e a carga cinética V²/(2g).',
        'Multiplique: h_{f} = f·(L/D)·V²/(2g); para pressão, Δp = ρ·g·h_{f}.',
      ],
      note: 'Dobrar a velocidade **quadruplica** a perda. Em série as perdas se somam; em paralelo a perda é a mesma em todos os ramos.',
    },
  ],
  questions: [
    {
      id: 'mec-flu-01',
      type: 'gen',
      difficulty: 1,
      lessonRef: 0,
      title: 'Pressão em um tanque',
      roteiro: 'stevin',
      generate(rng) {
        const fluid = pickOne(rng, [
          { name: 'água', rho: 1000 },
          { name: 'óleo', rho: 800 },
        ]);
        const h = pickOne(rng, [2, 3, 5, 8, 10, 12, 15, 20, 25]);
        const pMan = (fluid.rho * 10 * h) / 1000;
        const absolute = rng() < 0.5;
        const correct = absolute ? pMan + 100 : pMan;
        const distractors = absolute
          ? [
              { value: pMan, why: 'Essa é a pressão **manométrica**: faltou somar a atmosférica (100 kPa).' },
              { value: 100 - pMan, why: 'Subtraiu: a pressão **aumenta** com a profundidade.' },
            ]
          : [
              { value: pMan + 100, why: 'Essa é a pressão **absoluta**; a manométrica não inclui a atmosfera.' },
              { value: pMan * 1000, why: 'ρ·g·h em unidades SI dá **pascal**: faltou dividir por 1.000 para chegar a kPa.' },
            ];
        if (fluid.rho !== 1000) {
          const water = (1000 * 10 * h) / 1000;
          distractors.push({ value: absolute ? water + 100 : water, why: 'Usou a massa específica da água; o fluido é óleo (800 kg/m³).' });
        }
        const { options, answer } = numericOptions({
          correct,
          unit: 'kPa',
          digits: 1,
          correctWhy: absolute ? `p = p_{atm} + ρgh = 100 + ${fmt(pMan, 1)} = ${fmt(correct, 1)} kPa.` : `p_{man} = ρgh = ${fmt(fluid.rho)} × 10 × ${h} = ${fmt(pMan * 1000)} Pa = ${fmt(pMan, 1)} kPa.`,
          distractors,
        });
        return {
          prompt: `Um tanque aberto para a atmosfera contém ${fluid.name} (ρ = ${fmt(fluid.rho)} kg/m³). Considerando g = 10 m/s² e pressão atmosférica de 100 kPa, a pressão **${absolute ? 'absoluta' : 'manométrica'}** a **${h} m** de profundidade é, em kPa,`,
          options,
          answer,
          hint: 'Lei de Stevin: p = p_{0} + ρ·g·h. Manométrica não inclui a atmosfera.',
          steps: [
            `ρ = ${fmt(fluid.rho)} kg/m³ (${fluid.name}) e h = ${h} m; pede-se a pressão **${absolute ? 'absoluta' : 'manométrica'}**.`,
            `ρ·g·h = ${fmt(fluid.rho)} × 10 × ${h} = ${fmt(pMan * 1000)} Pa = **${fmt(pMan, 1)} kPa**.`,
            `${absolute ? `Absoluta: 100 + ${fmt(pMan, 1)} = **${fmt(correct, 1)} kPa**.` : `Manométrica: não soma a atmosfera → **${fmt(pMan, 1)} kPa**.`}`,
          ],
          explanation: `Lei de Stevin: ρ·g·h = ${fmt(fluid.rho)} × 10 × ${h} = ${fmt(pMan * 1000)} Pa = **${fmt(pMan, 1)} kPa** (manométrica).${absolute ? `\n\nA absoluta soma a atmosfera: 100 + ${fmt(pMan, 1)} = **${fmt(correct, 1)} kPa**.` : ''}`,
        };
      },
    },
    {
      id: 'mec-flu-02',
      type: 'gen',
      difficulty: 1,
      lessonRef: 2,
      title: 'Continuidade em uma redução',
      roteiro: 'continuidade',
      generate(rng) {
        const [D1, D2] = pickOne(rng, [
          [100, 50],
          [200, 100],
          [80, 40],
          [150, 50],
          [90, 30],
          [60, 120],
          [50, 100],
          [120, 60],
          [100, 25],
        ]);
        const V1 = pickOne(rng, [0.5, 1, 1.5, 2, 2.5, 3]);
        const V2 = V1 * (D1 / D2) ** 2;
        const { options, answer } = numericOptions({
          correct: V2,
          unit: 'm/s',
          digits: 2,
          correctWhy: `V₂ = V₁·(D₁/D₂)² = ${fmt(V1)} × (${D1}/${D2})² = ${fmt(V2)} m/s.`,
          distractors: [
            { value: (V1 * D1) / D2, why: 'Usou a razão dos diâmetros; a vazão depende da **área** (∝ d²).' },
            { value: V1 * (D2 / D1) ** 2, why: 'Inverteu a razão: no trecho mais estreito a velocidade **aumenta**.' },
            { value: V1, why: 'A vazão é que se mantém constante, não a velocidade.' },
          ],
        });
        return {
          prompt: `Água escoa a **${fmt(V1)} m/s** em uma tubulação de **${D1} mm** de diâmetro interno, que passa para **${D2} mm**. Considerando o escoamento incompressível e permanente, a velocidade no trecho de ${D2} mm é`,
          options,
          answer,
          hint: 'Q = A₁·V₁ = A₂·V₂, e a área é proporcional ao quadrado do diâmetro.',
          steps: [
            `Água (incompressível): A₁·V₁ = A₂·V₂ → V₂ = V₁·(A₁/A₂).`,
            `A₁/A₂ = (${D1}/${D2})² = ${fmt((D1 / D2) ** 2)}.`,
            `V₂ = ${fmt(V1)} × ${fmt((D1 / D2) ** 2)} = **${fmt(V2)} m/s**.`,
          ],
          explanation: `Continuidade: A₁·V₁ = A₂·V₂ → V₂ = V₁·(A₁/A₂) = V₁·(D₁/D₂)².\n\nV₂ = ${fmt(V1)} × (${D1}/${D2})² = ${fmt(V1)} × ${fmt((D1 / D2) ** 2)} = **${fmt(V2)} m/s**.`,
        };
      },
    },
    {
      id: 'mec-flu-03',
      type: 'gen',
      difficulty: 2,
      lessonRef: 4,
      title: 'Número de Reynolds e regime',
      roteiro: 'reynolds',
      generate(rng) {
        const fluid = pickOne(rng, [
          { name: 'água', nu: 1e-6, text: '1 × 10^{−6}' },
          { name: 'óleo lubrificante', nu: 1e-4, text: '1 × 10^{−4}' },
        ]);
        let V = 1;
        let D = 0.05;
        let Re = (V * D) / fluid.nu;
        for (let i = 0; i < 30; i++) {
          V = pickOne(rng, [0.05, 0.1, 0.2, 0.5, 1, 1.5, 2]);
          D = pickOne(rng, [0.02, 0.025, 0.04, 0.05, 0.1]);
          Re = (V * D) / fluid.nu;
          if (Re < 2000 || Re > 5000) break;
        }
        const regime = (re: number) => (re < 2300 ? 'laminar' : re > 4000 ? 'turbulento' : 'em transição');
        const wrong = regime(Re) === 'laminar' ? 'turbulento' : 'laminar';
        const raw: (ChoiceOption & { value: number; ok?: boolean })[] = [
          { value: Re, text: `Re ≈ ${fmt(Re, 0)} — ${regime(Re)}`, why: 'Correta: Re = V·D/ν com D em metros, e o regime pelo critério de tubos.', ok: true },
          { value: Re + 0.1, text: `Re ≈ ${fmt(Re, 0)} — ${wrong}`, why: 'O número está certo, mas o regime não: em tubos, laminar até ~2.000 e turbulento acima de ~4.000.' },
          { value: Re * 1000, text: `Re ≈ ${fmt(Re * 1000, 0)} — ${regime(Re * 1000)}`, why: 'Usou o diâmetro em milímetros. Re é adimensional: use D em metros.' },
          { value: Re / 100, text: `Re ≈ ${fmt(Re / 100, 0)} — ${regime(Re / 100)}`, why: 'Errou a potência de 10 da viscosidade cinemática.' },
        ];
        const sorted = raw.sort((a, b) => a.value - b.value);
        return {
          prompt: `${fluid.name[0].toUpperCase()}${fluid.name.slice(1)} (ν = ${fluid.text} m²/s) escoa a **${fmt(V)} m/s** em um tubo de **${fmt(D * 1000)} mm** de diâmetro interno. O número de Reynolds e o regime de escoamento são, respectivamente,`,
          options: sorted.map(({ text, why }) => ({ text, why })),
          answer: sorted.findIndex((o) => o.ok),
          hint: 'Re = V·D/ν, com tudo em SI (D em metros).',
          steps: [
            `D = ${fmt(D * 1000)} mm = ${fmt(D, 3)} m; ν = ${fluid.text} m²/s.`,
            `Re = ${fmt(V)} × ${fmt(D, 3)}/(${fluid.text}) = **${fmt(Re, 0)}**.`,
            `${fmt(Re, 0)} ${Re < 2300 ? 'fica abaixo do limite laminar (~2.000 a 2.300)' : Re > 4000 ? 'passa de 4.000' : 'fica entre 2.300 e 4.000'} → escoamento **${regime(Re)}**.`,
          ],
          explanation: `Re = V·D/ν = ${fmt(V)} × ${fmt(D, 3)} / ${fluid.text} = **${fmt(Re, 0)}**.\n\nCritério para tubos: laminar abaixo de ~2.000 (ou 2.300, conforme o livro); turbulento acima de ~4.000. Logo, o escoamento é **${regime(Re)}**.`,
        };
      },
    },
    {
      id: 'mec-flu-04',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Em um tubo Venturi horizontal com escoamento de água, ao passar da seção maior para a garganta (seção menor), a velocidade ________ e a pressão estática ________.',
      options: [
        { text: 'aumenta; diminui', why: 'Correta: área menor → velocidade maior (continuidade); com z constante, mais energia cinética significa menos pressão (Bernoulli).' },
        { text: 'aumenta; aumenta', why: 'Pela equação de Bernoulli, com a cota constante, se a parcela cinética sobe a de pressão tem que cair.' },
        { text: 'diminui; aumenta', why: 'Continuidade: com área menor, a velocidade **aumenta**.' },
        { text: 'diminui; diminui', why: 'Nenhuma das duas: a velocidade sobe e a pressão cai.' },
        { text: 'permanece constante; diminui', why: 'A vazão é constante, mas a velocidade muda com a área.' },
      ],
      answer: 0,
      explanation: 'Continuidade: A₁V₁ = A₂V₂ → na garganta a velocidade aumenta. Bernoulli com z constante: p + ρV²/2 = constante → a pressão estática cai. Medindo essa queda de pressão, o Venturi mede a **vazão**.',
      roteiro: 'bernoulli',
      steps: [
        'Na garganta a área é menor; pela continuidade (A₁·V₁ = A₂·V₂), a velocidade **aumenta**.',
        'Venturi horizontal, sem perdas: p + ρ·V²/2 = constante (as cotas são iguais).',
        'Se ρ·V²/2 sobe, p tem que cair: velocidade **aumenta** e pressão **diminui**. É essa queda de pressão que mede a vazão.',
      ],
    },
    {
      id: 'mec-flu-05',
      difficulty: 2,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Um bloco de aço de **0,02 m³** está totalmente submerso em água (ρ = 1.000 kg/m³; g = 10 m/s²). O empuxo sobre o bloco vale',
      shuffle: false,
      options: [
        { text: '0 N, porque o aço afunda', why: 'Corpos que afundam também sofrem empuxo — ele só é menor que o peso.' },
        { text: '20 N', why: 'Erro de potência de 10: E = 1.000 × 10 × 0,02 = 200 N.' },
        { text: '200 N', why: 'Correta: E = ρ_{água}·g·V = 1.000 × 10 × 0,02 = 200 N.' },
        { text: '1.560 N', why: 'Usou a massa específica do aço (≈ 7.800 kg/m³): isso dá o **peso** do bloco, não o empuxo.' },
        { text: '2.000 N', why: 'Erro de potência de 10.' },
      ],
      answer: 2,
      explanation: 'Empuxo = peso do fluido deslocado: E = ρ_{fluido}·g·V_{submerso} = 1.000 × 10 × 0,02 = **200 N**. A massa específica do corpo só decide se ele flutua ou afunda (peso maior ou menor que o empuxo).',
      roteiro: 'empuxo',
      steps: [
        'Fluido: água (1.000 kg/m³). O bloco está totalmente submerso: V_{sub} = 0,02 m³.',
        'E = 1.000 × 10 × 0,02 = **200 N**.',
        'O aço afunda porque o peso dele (≈ 7.800 × 10 × 0,02 = 1.560 N) supera o empuxo — mas o empuxo existe e vale 200 N.',
      ],
    },
    {
      id: 'mec-flu-06',
      difficulty: 3,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Em uma tubulação **horizontal** de **diâmetro constante**, com água escoando em regime permanente, a pressão cai ao longo do comprimento. Isso ocorre porque',
      options: [
        { text: 'a energia mecânica é dissipada pelo atrito viscoso (perda de carga).', why: 'Correta: com V e z constantes, a queda de pressão é exatamente a perda de carga h_{L}.' },
        { text: 'a velocidade aumenta ao longo do tubo.', why: 'Diâmetro constante e líquido incompressível: a velocidade é a mesma em todo o tubo (continuidade).' },
        { text: 'a cota aumenta ao longo do tubo.', why: 'O tubo é horizontal.' },
        { text: 'a vazão mássica diminui ao longo do tubo.', why: 'Em regime permanente, a vazão mássica é constante.' },
        { text: 'a água é comprimida pela própria pressão.', why: 'A água é praticamente incompressível nessas condições.' },
      ],
      answer: 0,
      explanation: 'Bernoulli com perdas entre 1 e 2: p₁/ρg + V₁²/2g + z₁ = p₂/ρg + V₂²/2g + z₂ + h_{L}. Com V₁ = V₂ e z₁ = z₂, sobra **p₁ − p₂ = ρ·g·h_{L}**: a queda de pressão mede a energia dissipada pelo atrito.',
      roteiro: 'bernoulli',
      steps: [
        'Diâmetro constante e água incompressível: V₁ = V₂ em todo o tubo.',
        'Com perdas: p₁/ρg + V₁²/2g + z₁ = p₂/ρg + V₂²/2g + z₂ + h_{L}. Tubo horizontal (z₁ = z₂) e V₁ = V₂: esses termos se cancelam.',
        'Sobra p₁ − p₂ = ρ·g·h_{L}: a pressão cai porque o **atrito viscoso dissipa** energia mecânica (perda de carga).',
      ],
    },
    {
      id: 'mec-flu-07',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Com o aumento da temperatura, a viscosidade dos **líquidos** ________ e a dos **gases** ________.',
      options: [
        { text: 'diminui; aumenta', why: 'Correta: líquidos dependem da coesão entre moléculas (enfraquece com o calor); gases, da troca de quantidade de movimento (aumenta com a agitação).' },
        { text: 'aumenta; diminui', why: 'É o contrário.' },
        { text: 'diminui; diminui', why: 'Nos gases a viscosidade aumenta com a temperatura.' },
        { text: 'aumenta; aumenta', why: 'Nos líquidos a viscosidade cai com a temperatura — por isso óleo frio é "grosso".' },
        { text: 'não se altera; aumenta', why: 'A viscosidade dos líquidos varia bastante com a temperatura.' },
      ],
      answer: 0,
      explanation: 'Nos **líquidos**, a viscosidade vem das forças de coesão entre moléculas, que enfraquecem com o aquecimento → μ cai. Nos **gases**, vem da troca de quantidade de movimento entre camadas, que aumenta com a agitação térmica → μ sobe.',
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **temperatura**, comparando **líquidos** com **gases**.',
        'No líquido, a viscosidade vem da coesão entre moléculas, que o calor enfraquece. No gás, vem da troca de quantidade de movimento entre camadas, que a agitação térmica aumenta.',
        'Líquido: **diminui**; gás: **aumenta** → "diminui; aumenta". As erradas trocam os sentidos ou igualam os dois.',
      ],
    },
    {
      id: 'mec-flu-08',
      difficulty: 1,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Na mecânica dos fluidos, um **fluido ideal** (ou perfeito) é aquele que tem, por hipótese,',
      options: [
        { text: 'viscosidade nula.', why: 'Correta: sem viscosidade não há tensões de cisalhamento nem perdas por atrito — é a hipótese da equação de Bernoulli.' },
        { text: 'massa específica nula.', why: 'Um fluido sem massa não teria pressão hidrostática nem inércia.' },
        { text: 'pressão constante em todo o escoamento.', why: 'No fluido ideal a pressão varia (é o que Bernoulli descreve).' },
        { text: 'temperatura constante.', why: 'Temperatura não faz parte da definição de fluido ideal.' },
        { text: 'velocidade constante em todo o escoamento.', why: 'A velocidade muda com a área (continuidade), mesmo no fluido ideal.' },
      ],
      answer: 0,
      explanation: 'Fluido **ideal** = **invíscido** (μ = 0). Sem viscosidade, não há atrito interno nem perda de carga, e a energia mecânica se conserva ao longo de uma linha de corrente (Bernoulli). Na prática, fora das camadas próximas às paredes, muitos escoamentos se comportam quase assim.',
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: fluido **ideal** (ou perfeito) — uma hipótese de modelo.',
        'Fluido ideal = **invíscido**: sem viscosidade, não há atrito interno nem perda de carga (é a hipótese de Bernoulli).',
        'Fica "viscosidade nula". Massa, pressão, temperatura e velocidade continuam existindo e variando no fluido ideal.',
      ],
    },
    {
      id: 'mec-flu-09',
      difficulty: 1,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'No Sistema Internacional, a **viscosidade cinemática** é medida em',
      options: [
        { text: 'm²/s', why: 'Correta: ν = μ/ρ = (Pa·s)/(kg/m³) = m²/s — só comprimento e tempo.' },
        { text: 'Pa·s', why: 'Essa é a unidade da viscosidade **dinâmica** μ.' },
        { text: 'N·s/m', why: 'Faltou dividir por uma área: N·s/m² é que equivale a Pa·s (dinâmica).' },
        { text: 'kg/m³', why: 'Unidade de massa específica.' },
        { text: 'm/s²', why: 'Unidade de aceleração.' },
      ],
      answer: 0,
      explanation: 'ν = μ/ρ. Com μ em Pa·s = kg/(m·s) e ρ em kg/m³: ν = [kg/(m·s)]/[kg/m³] = **m²/s**. Por isso se diz que a viscosidade cinemática envolve só **comprimento e tempo** (o stokes, St = cm²/s, é a unidade antiga).',
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: viscosidade **cinemática** (ν), não a dinâmica (μ).',
        'ν = μ/ρ → (Pa·s)/(kg/m³) = [kg/(m·s)]/[kg/m³] = m²/s.',
        'Fica **m²/s**: só comprimento e tempo. Pa·s é a unidade da dinâmica — a troca preferida da banca.',
      ],
    },
    {
      id: 'mec-flu-10',
      type: 'gen',
      difficulty: 1,
      lessonRef: 0,
      title: 'Altura de coluna equivalente',
      roteiro: 'altura-coluna',
      generate(rng) {
        const fluid = pickOne(rng, [
          { name: 'água', rho: 1000 },
          { name: 'óleo (ρ = 850 kg/m³)', rho: 850 },
          { name: 'salmoura (ρ = 1.200 kg/m³)', rho: 1200 },
          { name: 'mercúrio (ρ = 13.600 kg/m³)', rho: 13600 },
        ]);
        const h0 = pickOne(rng, [0.5, 1, 2, 3, 5, 8]);
        const dp = Math.round((fluid.rho * 10 * h0) / 100) / 10; // kPa, 1 casa
        const h = (dp * 1000) / (fluid.rho * 10);
        const { options, answer } = numericOptions({
          correct: h,
          unit: 'm',
          digits: 2,
          correctWhy: `h = Δp/(ρ·g) = ${fmt(dp * 1000)} / (${fmt(fluid.rho)} × 10) = ${fmt(h, 2)} m.`,
          distractors: [
            { value: h / 10, why: 'Errou a conversão: 1 kPa = 1.000 Pa (não 100 Pa).' },
            { value: (dp * 1000) / fluid.rho, why: 'Esqueceu o g: a altura é Δp/(ρ·g), não Δp/ρ.' },
            { value: (dp * 1000) / (1000 * 10), why: 'Usou a massa específica da água.' },
            { value: (dp * 1000 * 10) / fluid.rho, why: 'Multiplicou pelo g em vez de dividir.' },
          ],
        });
        return {
          prompt: `Um manômetro indica **${fmt(dp, 1)} kPa** numa linha de ${fluid.name}. Considerando g = 10 m/s², a altura de coluna desse fluido equivalente a essa pressão é, em metros,`,
          options,
          answer,
          hint: 'Stevin ao contrário: h = Δp/(ρ·g) = Δp/γ.',
          steps: [
            `Δp = ${fmt(dp, 1)} kPa = ${fmt(dp * 1000)} Pa.`,
            `γ = ρ·g = ${fmt(fluid.rho)} × 10 = ${fmt(fluid.rho * 10)} N/m³.`,
            `h = ${fmt(dp * 1000)}/${fmt(fluid.rho * 10)} = **${fmt(h, 2)} m**.`,
          ],
          explanation: `Altura de carga: h = Δp/γ, com γ = ρ·g = ${fmt(fluid.rho * 10)} N/m³.\n\nh = ${fmt(dp * 1000)} Pa / ${fmt(fluid.rho * 10)} N/m³ = **${fmt(h, 2)} m** de coluna de ${fluid.name.split(' (')[0]}.`,
        };
      },
    },
    {
      id: 'mec-flu-11',
      type: 'gen',
      difficulty: 2,
      lessonRef: 0,
      title: 'Manômetro diferencial de mercúrio',
      roteiro: 'manometro',
      generate(rng) {
        const dhCm = pickOne(rng, [5, 8, 10, 12, 15, 20, 25]);
        const dh = dhCm / 100;
        const dp = ((13600 - 1000) * 10 * dh) / 1000;
        const { options, answer } = numericOptions({
          correct: dp,
          unit: 'kPa',
          digits: 2,
          correctWhy: `Δp = (ρ_{Hg} − ρ_{água})·g·Δh = 12.600 × 10 × ${fmt(dh)} = ${fmt(dp * 1000)} Pa = ${fmt(dp, 2)} kPa.`,
          distractors: [
            { value: (13600 * 10 * dh) / 1000, why: 'Esqueceu a coluna de água no outro ramo: o certo é (ρ_{Hg} − ρ_{água}).' },
            { value: (1000 * 10 * dh) / 1000, why: 'Usou só a água; quem marca a diferença é o mercúrio.' },
            { value: ((13600 + 1000) * 10 * dh) / 1000, why: 'Somou as massas específicas: a água do ramo mais baixo "desconta" do mercúrio.' },
            { value: (13600 - 1000) * 10 * dhCm / 1000, why: 'Deixou Δh em centímetros.' },
          ],
        });
        return {
          prompt: `Um manômetro diferencial em U, com **mercúrio** (ρ = 13.600 kg/m³), liga dois pontos de uma tubulação horizontal de **água** (ρ = 1.000 kg/m³). O desnível do mercúrio é de **${dhCm} cm**. Com g = 10 m/s², a diferença de pressão entre os dois pontos, em kPa, é`,
          options,
          answer,
          hint: 'Desça somando, suba subtraindo: a coluna de água acima do mercúrio aparece nos dois ramos, menos no trecho Δh.',
          steps: [
            `Do ponto 1 ao 2: p₁ + ρ_{água}·g·(x + Δh) − ρ_{Hg}·g·Δh − ρ_{água}·g·x = p₂.`,
            `A coluna x some: p₁ − p₂ = (13.600 − 1.000)·g·Δh = 12.600·g·Δh.`,
            `Δh = ${dhCm} cm = ${fmt(dh)} m → 12.600 × 10 × ${fmt(dh)} = ${fmt(dp * 1000)} Pa = **${fmt(dp, 2)} kPa**.`,
          ],
          explanation: `Percorrendo o manômetro: p₁ + ρ_{a}·g·(x + Δh) − ρ_{Hg}·g·Δh − ρ_{a}·g·x = p₂ → **p₁ − p₂ = (ρ_{Hg} − ρ_{a})·g·Δh**.\n\n(13.600 − 1.000) × 10 × ${fmt(dh)} = **${fmt(dp, 2)} kPa**. A altura x some na conta — por isso o manômetro diferencial não depende de onde está instalado.`,
        };
      },
    },
    {
      id: 'mec-flu-12',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Força numa comporta vertical',
      roteiro: 'comporta',
      generate(rng) {
        const H = pickOne(rng, [1, 1.5, 2, 3, 4]);
        const b = pickOne(rng, [1, 1.5, 2, 3]);
        const F = (1000 * 10 * (H / 2) * (b * H)) / 1000;
        const { options, answer } = numericOptions({
          correct: F,
          unit: 'kN',
          digits: 2,
          correctWhy: `F = ρ·g·h_{CG}·A = 1.000 × 10 × ${fmt(H / 2)} × (${fmt(b)} × ${fmt(H)}) = ${fmt(F, 2)} kN.`,
          distractors: [
            { value: 2 * F, why: 'Usou a pressão do **fundo** (ρ·g·H) para a área toda; a média está no centroide (H/2).' },
            { value: F / b, why: 'Esqueceu a largura da comporta (a área é b·H).' },
            { value: (4 / 3) * F, why: 'Usou a profundidade do centro de pressão (2H/3) no lugar da do centroide.' },
            { value: F / 2, why: 'Dividiu por 2 duas vezes.' },
          ],
        });
        return {
          prompt: `Uma comporta **vertical** retangular, de **${fmt(H)} m** de altura e **${fmt(b)} m** de largura, retém água (ρ = 1.000 kg/m³) até a sua borda superior. Com g = 10 m/s², a força resultante da água sobre a comporta é, em kN,`,
          options,
          answer,
          hint: 'Pressão no centroide (meia altura) vezes a área.',
          steps: [
            `h_{CG} = H/2 = ${fmt(H / 2)} m; A = ${fmt(b)} × ${fmt(H)} = ${fmt(b * H)} m².`,
            `F = 1.000 × 10 × ${fmt(H / 2)} × ${fmt(b * H)} = ${fmt(F * 1000)} N = **${fmt(F, 2)} kN**.`,
            `Não foi pedido, mas fecha o raciocínio: F atua a 2H/3 = ${fmt((2 * H) / 3, 2)} m de profundidade.`,
          ],
          explanation: `A pressão cresce linearmente do zero (topo) até ρ·g·H (fundo); a força é a pressão **média** — a do centroide — vezes a área:\n\nF = ρ·g·(H/2)·(b·H) = 1.000 × 10 × ${fmt(H / 2)} × ${fmt(b * H)} = **${fmt(F, 2)} kN**.\n\nEla atua a **2H/3 = ${fmt((2 * H) / 3, 2)} m** de profundidade (centro de pressão), abaixo do centroide.`,
        };
      },
    },
    {
      id: 'mec-flu-13',
      difficulty: 2,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'A força resultante da água sobre uma comporta vertical retangular, cuja borda superior fica exatamente na superfície livre, atua num ponto localizado, a partir da superfície, a',
      options: [
        { text: '2/3 da altura da comporta.', why: 'Correta: y_{CP} = y_{CG} + I_{CG}/(y_{CG}·A) = H/2 + (bH³/12)/((H/2)·bH) = H/2 + H/6 = 2H/3.' },
        { text: 'metade da altura da comporta.', why: 'Esse é o centroide. A força atua abaixo dele, porque a pressão é maior embaixo.' },
        { text: '1/3 da altura da comporta.', why: 'Seria acima do centroide — o contrário do que acontece.' },
        { text: '3/4 da altura da comporta.', why: 'O valor certo para o retângulo é 2/3.' },
        { text: 'no fundo da comporta.', why: 'Só se toda a pressão estivesse concentrada no fundo.' },
      ],
      answer: 0,
      explanation: 'A distribuição de pressão é triangular (zero na superfície, máxima no fundo). A resultante de um triângulo passa pelo seu centroide, a **2/3 da altura a partir do vértice** (a superfície). Em geral: y_{CP} = y_{CG} + I_{CG}/(y_{CG}·A), sempre abaixo do centroide.',
      roteiro: 'comporta',
      steps: [
        'Comporta vertical a partir da superfície: o centroide fica a H/2.',
        'A pressão cresce linearmente de zero (superfície) ao máximo (fundo): o diagrama de pressões é um triângulo.',
        'A resultante passa pelo centroide do triângulo, a **2/3 da altura** a partir da superfície: y_{CP} = H/2 + H/6 = 2H/3.',
      ],
    },
    {
      id: 'mec-flu-14',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Bernoulli numa redução',
      roteiro: 'bernoulli',
      generate(rng) {
        const V1 = pickOne(rng, [1, 1.5, 2, 2.5, 3]);
        const reduce = rng() < 0.6;
        const D1 = pickOne(rng, [100, 150, 200]);
        const D2 = reduce ? D1 / 2 : D1 * 2;
        const V2 = V1 * (D1 / D2) ** 2;
        const dp = (0.5 * 1000 * (V2 * V2 - V1 * V1)) / 1000; // p1 − p2, kPa
        const ask = reduce ? dp : -dp;
        const { options, answer } = numericOptions({
          correct: ask,
          unit: 'kPa',
          digits: 2,
          correctWhy: `V₂ = ${fmt(V2, 3)} m/s; ${reduce ? 'p₁ − p₂' : 'p₂ − p₁'} = ½·ρ·|V₂² − V₁²| = ${fmt(ask, 2)} kPa.`,
          distractors: [
            { value: (0.5 * 1000 * (reduce ? V2 * V2 : V1 * V1)) / 1000, why: 'Usou só uma das velocidades; Bernoulli compara as **duas** energias cinéticas.' },
            { value: (1000 * Math.abs(V2 * V2 - V1 * V1)) / 1000, why: 'Esqueceu o ½ da energia cinética (ρ·V²/2).' },
            { value: (0.5 * 1000 * (V2 - V1) ** 2) / 1000, why: 'Elevou a **diferença** das velocidades ao quadrado; o certo é a diferença dos quadrados.' },
            { value: (0.5 * 1000 * Math.abs((V1 * (D1 / D2)) ** 2 - V1 * V1)) / 1000, why: 'Usou a razão dos diâmetros (não das áreas) na continuidade.' },
          ],
        });
        return {
          prompt: `Água (ρ = 1.000 kg/m³) escoa a **${fmt(V1)} m/s** num tubo **horizontal** de **${D1} mm** que ${reduce ? 'se reduz' : 'se alarga'} para **${D2} mm**. Desprezando as perdas, ${reduce ? 'a queda de pressão (p₁ − p₂)' : 'o aumento de pressão (p₂ − p₁)'}, em kPa, é`,
          options,
          answer,
          hint: 'Primeiro a continuidade (V₂ = V₁·(D₁/D₂)²); depois Bernoulli com z constante.',
          steps: [
            `V₂ = V₁·(D₁/D₂)² = ${fmt(V1)} × (${D1}/${D2})² = **${fmt(V2, 4)} m/s**.`,
            `Tubo horizontal (z₁ = z₂), sem perdas: p₁ + ½ρV₁² = p₂ + ½ρV₂² → p₁ − p₂ = ½ρ(V₂² − V₁²).`,
            `${reduce ? `p₁ − p₂ = ½ × 1.000 × (${fmt(V2 * V2, 4)} − ${fmt(V1 * V1, 2)})` : `p₂ − p₁ = ½ × 1.000 × (${fmt(V1 * V1, 2)} − ${fmt(V2 * V2, 4)})`} = ${fmt(ask * 1000, 0)} Pa → **${fmt(ask, 2)} kPa** de ${reduce ? 'queda (a velocidade subiu)' : 'aumento (a velocidade caiu)'}.`,
          ],
          explanation: `Continuidade: V₂ = ${fmt(V1)} × (${D1}/${D2})² = ${fmt(V2, 3)} m/s.\n\nBernoulli (horizontal): p₁ + ½ρV₁² = p₂ + ½ρV₂² → p₁ − p₂ = ½ρ(V₂² − V₁²) = ${fmt(dp, 3)} kPa.\n\n${reduce ? 'Na redução a velocidade sobe e a pressão **cai**' : 'No alargamento a velocidade cai e a pressão **sobe** (recuperação de pressão, como num difusor)'}: **${fmt(ask, 2)} kPa**.`,
        };
      },
    },
    {
      id: 'mec-flu-15',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Velocidade pelo tubo de Pitot',
      roteiro: 'pitot',
      generate(rng) {
        const water = rng() < 0.5;
        const rho = water ? 1000 : 1.2;
        const V = water ? pickOne(rng, [2, 3, 4, 5, 6]) : pickOne(rng, [20, 30, 40, 50]);
        const dp = (rho * V * V) / 2; // Pa
        const { options, answer } = numericOptions({
          correct: V,
          unit: 'm/s',
          digits: 2,
          correctWhy: `V = √(2·Δp/ρ) = √(2 × ${fmt(dp)}/${fmt(rho, 1)}) = ${fmt(V)} m/s.`,
          distractors: [
            { value: Math.sqrt(dp / rho), why: 'Esqueceu o 2: Δp = ½·ρ·V² → V = √(2·Δp/ρ).' },
            { value: (2 * dp) / rho, why: 'Esqueceu a raiz quadrada.' },
            { value: Math.sqrt(2 * dp), why: 'Esqueceu de dividir pela massa específica.' },
            { value: V * Math.SQRT2, why: 'Dobrou a pressão dinâmica antes de tirar a raiz.' },
          ],
        });
        return {
          prompt: `Um tubo de Pitot estático mede, num escoamento de ${water ? 'água (ρ = 1.000 kg/m³)' : 'ar (ρ = 1,2 kg/m³)'}, diferença entre a pressão de estagnação e a estática de **${fmt(water ? dp / 1000 : dp, 2)} ${water ? 'kPa' : 'Pa'}**. A velocidade do escoamento, em m/s, é`,
          options,
          answer,
          hint: 'Pressão de estagnação − estática = pressão dinâmica = ½·ρ·V².',
          steps: [
            `Δp = p₀ − p = ${water ? `${fmt(dp / 1000, 2)} kPa = ` : ''}${fmt(dp)} Pa: é a pressão dinâmica.`,
            `${fmt(dp)} = ½ × ${fmt(rho, 1)} × V².`,
            `V = √(2 × ${fmt(dp)}/${fmt(rho, 1)}) = √${fmt((2 * dp) / rho, 1)} = **${fmt(V)} m/s**.`,
          ],
          explanation: `No bico do Pitot o fluido para: p₀ = p + ½ρV². Logo Δp = ½ρV² e **V = √(2·Δp/ρ)** = √(2 × ${fmt(dp)} Pa / ${fmt(rho, 1)}) = **${fmt(V)} m/s**.`,
        };
      },
    },
    {
      id: 'mec-flu-16',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      shuffle: false,
      prompt: 'Associe cada número adimensional à razão de forças que ele representa.\n\nI – Froude\nII – Mach\nIII – Euler\nIV – Weber\n\nP – forças de pressão ÷ forças de inércia\nQ – forças de inércia ÷ forças de gravidade\nR – forças de inércia ÷ forças de compressibilidade (elásticas)\nS – forças de inércia ÷ forças de tensão superficial\n\nA associação correta é',
      options: [
        { text: 'I – Q, II – R, III – P, IV – S', why: 'Correta: Froude (gravidade), Mach (compressibilidade), Euler (pressão) e Weber (tensão superficial).' },
        { text: 'I – P, II – R, III – Q, IV – S', why: 'Froude e Euler trocados: Froude envolve a gravidade; Euler, a pressão.' },
        { text: 'I – Q, II – S, III – P, IV – R', why: 'Mach e Weber trocados: Mach é compressibilidade (V/c); Weber, tensão superficial.' },
        { text: 'I – R, II – Q, III – S, IV – P', why: 'Nenhum par está certo.' },
        { text: 'I – S, II – P, III – R, IV – Q', why: 'Nenhum par está certo.' },
      ],
      answer: 0,
      explanation: '**Froude** = inércia/gravidade (superfície livre, navios, canais). **Mach** = inércia/compressibilidade = V/c (gases rápidos). **Euler** = pressão/inércia, Δp/(ρV²). **Weber** = inércia/tensão superficial (gotas, bolhas). E o mais cobrado de todos, **Reynolds** = inércia/viscosas.',
      roteiro: 'fmt.associacao',
      steps: [
        'Mach = V/c, a velocidade do som — que vem da **compressibilidade**: II – R.',
        'Só "I – Q, II – R, III – P, IV – S" e "I – P, II – R, III – Q, IV – S" têm II – R. Froude = V/√(g·L) envolve a **gravidade**: I – Q. Sobra a primeira.',
        'Confira: Euler = Δp/(ρ·V²) → III – P (pressão); Weber → IV – S (tensão superficial).',
      ],
    },
    {
      id: 'mec-flu-17',
      type: 'gen',
      difficulty: 1,
      lessonRef: 5,
      title: 'Teorema dos Pi de Buckingham',
      roteiro: 'buckingham',
      generate(rng) {
        const n = pickOne(rng, [5, 6, 7, 8]);
        const k = pickOne(rng, [2, 3, 4].filter((x) => x < n - 1));
        const pi = n - k;
        const { options, answer } = numericOptions({
          correct: pi,
          digits: 0,
          correctWhy: `Buckingham: número de grupos pi = n − k = ${n} − ${k} = ${pi}.`,
          distractors: [
            { value: n + k, why: 'Somou: os grupos adimensionais **reduzem** o número de variáveis.' },
            { value: n, why: 'Esse é o número de variáveis, sem a redução.' },
            { value: k, why: 'Esse é o número de dimensões básicas.' },
            { value: pi + 1, why: 'Errou por um: são exatamente n − k grupos.' },
          ],
        });
        return {
          prompt: `Um fenômeno é descrito por **${n} variáveis**, que envolvem **${k} dimensões básicas** (como massa, comprimento e tempo). Pelo teorema dos Pi de Buckingham, o número de grupos adimensionais independentes é`,
          options,
          answer,
          hint: 'Grupos pi = variáveis − dimensões básicas.',
          steps: [
            `n = ${n} variáveis.`,
            `k = ${k} dimensões básicas.`,
            `π = ${n} − ${k} = **${pi}** grupos adimensionais.`,
          ],
          explanation: `Teorema dos Pi: **n − k** grupos adimensionais independentes, com n variáveis e k dimensões básicas: ${n} − ${k} = **${pi}**. Menos variáveis = menos ensaios para mapear o fenômeno.`,
        };
      },
    },
    {
      id: 'mec-flu-18',
      type: 'gen',
      difficulty: 2,
      lessonRef: 5,
      title: 'Semelhança pelo número de Reynolds',
      roteiro: 'semelhanca',
      generate(rng) {
        if (rng() < 0.5) {
          const lambda = pickOne(rng, [4, 5, 8, 10]);
          const Vp = pickOne(rng, [1, 1.5, 2, 3]);
          const Vm = lambda * Vp;
          const { options, answer } = numericOptions({
            correct: Vm,
            unit: 'm/s',
            digits: 2,
            correctWhy: `Mesmo fluido e mesmo Re: V_{m}·L_{m} = V_{p}·L_{p} → V_{m} = ${fmt(Vp)} × ${lambda} = ${fmt(Vm)} m/s.`,
            distractors: [
              { value: Vp / lambda, why: 'Inverteu a escala: o modelo **menor** precisa de velocidade **maior** para o mesmo Re.' },
              { value: Vp, why: `Mesma velocidade daria um Re ${lambda} vezes menor no modelo.` },
              { value: Vp * Math.sqrt(lambda), why: 'Isso iguala o número de Froude (V/√(gL)), não o de Reynolds.' },
              { value: Vp * lambda * lambda, why: 'Usou o quadrado da escala; Re é linear no comprimento.' },
            ],
          });
          return {
            prompt: `Um modelo na escala **1:${lambda}** de um casco submerso que se move a **${fmt(Vp)} m/s** na água é ensaiado num canal, também com água. Para haver semelhança dinâmica pelo **número de Reynolds**, a velocidade do ensaio deve ser, em m/s,`,
            options,
            answer,
            hint: 'Re = V·L/ν. Mesmo fluido → V·L constante.',
            steps: [
              `Casco **submerso**, sem superfície livre → vale **Reynolds**.`,
              `Mesmo fluido (ν igual): V_{m}·L_{m} = V_{p}·L_{p}, com L_{m} = L_{p}/${lambda}.`,
              `V_{m} = ${lambda} × ${fmt(Vp)} = **${fmt(Vm)} m/s**.`,
            ],
            explanation: `Re_{m} = Re_{p} → V_{m}·L_{m}/ν = V_{p}·L_{p}/ν. Com L_{m} = L_{p}/${lambda}: V_{m} = ${lambda}·V_{p} = **${fmt(Vm)} m/s**. (Por isso ensaios só por Reynolds com modelos pequenos exigem velocidades altas — às vezes se troca de fluido.)`,
          };
        }
        const Vp = pickOne(rng, [1, 2, 3]);
        const Dp = pickOne(rng, [0.2, 0.3, 0.4]);
        const Dm = pickOne(rng, [0.05, 0.1]);
        const Vm = Vp * (1e-6 / 1e-5) * (Dp / Dm);
        const { options, answer } = numericOptions({
          correct: Vm,
          unit: 'm/s',
          digits: 3,
          correctWhy: `V_{m} = V_{p}·(ν_{m}/ν_{p})·(D_{p}/D_{m}) = ${fmt(Vp)} × 0,1 × ${fmt(Dp / Dm, 2)} = ${fmt(Vm, 3)} m/s.`,
          distractors: [
            { value: Vp * (Dp / Dm), why: 'Esqueceu a razão das viscosidades: a água é 10 vezes menos viscosa.' },
            { value: Vp * 10 * (Dp / Dm), why: 'Inverteu a razão das viscosidades.' },
            { value: Vp * 0.1 * (Dm / Dp), why: 'Inverteu a razão dos diâmetros.' },
            { value: Vp, why: 'Mesma velocidade não garante o mesmo Re com outro fluido e outro diâmetro.' },
          ],
        });
        return {
          prompt: `Óleo (ν = 1 × 10^{−5} m²/s) escoa a **${fmt(Vp)} m/s** numa tubulação de **${fmt(Dp * 1000)} mm**. O escoamento será estudado com **água** (ν = 1 × 10^{−6} m²/s) num tubo de **${fmt(Dm * 1000)} mm**. Para o mesmo número de Reynolds, a velocidade da água deve ser, em m/s,`,
          options,
          answer,
          hint: 'Iguale V·D/ν nos dois casos.',
          steps: [
            `Escoamento em tubo → vale **Reynolds** (Re = V·D/ν).`,
            `Re_{óleo} = ${fmt(Vp)} × ${fmt(Dp)}/10^{−5} = ${fmt((Vp * Dp) / 1e-5, 0)}; a água precisa do mesmo Re.`,
            `V_{água} = Re·ν/D = ${fmt((Vp * Dp) / 1e-5, 0)} × 10^{−6}/${fmt(Dm)} = **${fmt(Vm, 3)} m/s**.`,
          ],
          explanation: `Re_{óleo} = ${fmt(Vp)} × ${fmt(Dp)}/10^{−5} = ${fmt((Vp * Dp) / 1e-5, 0)}.\n\nV_{água} = Re·ν/D = ${fmt((Vp * Dp) / 1e-5, 0)} × 10^{−6}/${fmt(Dm)} = **${fmt(Vm, 3)} m/s**.`,
        };
      },
    },
    {
      id: 'mec-flu-19',
      type: 'gen',
      difficulty: 2,
      lessonRef: 6,
      title: 'Perda de carga de Darcy-Weisbach',
      roteiro: 'darcy',
      generate(rng) {
        const f = pickOne(rng, [0.015, 0.02, 0.025, 0.03]);
        const L = pickOne(rng, [50, 100, 200, 300, 500]);
        const D = pickOne(rng, [0.1, 0.15, 0.2, 0.25]);
        const V = pickOne(rng, [1, 1.5, 2, 2.5, 3]);
        const hf = (f * (L / D) * V * V) / 20;
        const { options, answer } = numericOptions({
          correct: hf,
          unit: 'm',
          digits: 2,
          correctWhy: `h_{f} = f·(L/D)·V²/(2g) = ${fmt(f, 3)} × ${fmt(L / D, 1)} × ${fmt(V * V, 2)}/20 = ${fmt(hf, 2)} m.`,
          distractors: [
            { value: f * (L / D) * V * V, why: 'Esqueceu o 2g no denominador.' },
            { value: (f * (L / D) * V) / 20, why: 'Esqueceu de elevar a velocidade ao quadrado.' },
            { value: (f * (L / (D / 2)) * V * V) / 20, why: 'Usou o raio no lugar do diâmetro.' },
            { value: (f * L * D * V * V) / 20, why: 'Multiplicou pelo diâmetro: a perda é proporcional a L/D.' },
          ],
        });
        return {
          prompt: `Água escoa a **${fmt(V)} m/s** numa tubulação de **${fmt(D * 1000)} mm** de diâmetro e **${L} m** de comprimento, com fator de atrito **f = ${fmt(f, 3)}**. Considerando g = 10 m/s², a perda de carga distribuída, em metros de coluna de água, é`,
          options,
          answer,
          hint: 'Darcy-Weisbach: h_{f} = f·(L/D)·V²/(2g).',
          steps: [
            `f = ${fmt(f, 3)} (dado no enunciado).`,
            `L/D = ${L}/${fmt(D)} = ${fmt(L / D, 1)}; V²/(2g) = ${fmt(V)}²/20 = ${fmt((V * V) / 20, 4)} m.`,
            `h_{f} = ${fmt(f, 3)} × ${fmt(L / D, 1)} × ${fmt((V * V) / 20, 4)} = **${fmt(hf, 2)} m** (≈ ${fmt(hf * 10, 1)} kPa).`,
          ],
          explanation: `h_{f} = f·(L/D)·V²/(2g) = ${fmt(f, 3)} × (${L}/${fmt(D)}) × ${fmt(V)}²/(2 × 10) = **${fmt(hf, 2)} m**.\n\nEm pressão: Δp = ρ·g·h_{f} ≈ ${fmt(hf * 10, 1)} kPa. Repare que a perda cresce com o **quadrado** da velocidade.`,
        };
      },
    },
    {
      id: 'mec-flu-20',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Três tubos podem ser ligados entre os pontos A e B em **série** ou em **paralelo**. É correto afirmar que',
      options: [
        { text: 'em série, a vazão é a mesma nos três tubos e as perdas de carga se somam; em paralelo, a perda de carga é a mesma nos três e as vazões se somam.', why: 'Correta: é a mesma lógica dos resistores elétricos (vazão ↔ corrente, perda ↔ tensão).' },
        { text: 'em série, as vazões se somam; em paralelo, as perdas se somam.', why: 'Trocou as regras: em série é a mesma vazão; em paralelo, a mesma perda.' },
        { text: 'nos dois arranjos, a vazão é a mesma em todos os tubos.', why: 'Em paralelo a vazão total se divide entre os ramos.' },
        { text: 'em paralelo, o tubo de maior diâmetro tem a maior perda de carga.', why: 'Em paralelo todos os ramos têm a **mesma** perda entre A e B; o de maior diâmetro leva mais vazão.' },
        { text: 'em série, a perda de carga total é a do tubo mais longo.', why: 'Em série as perdas de todos os tubos se somam.' },
      ],
      answer: 0,
      explanation: '**Série:** Q₁ = Q₂ = Q₃ e h_{AB} = h₁ + h₂ + h₃. **Paralelo:** h₁ = h₂ = h₃ = h_{AB} e Q = Q₁ + Q₂ + Q₃. A analogia elétrica ajuda: vazão é corrente, perda de carga é tensão.',
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **série** × **paralelo** — o que é igual e o que se soma em cada arranjo.',
        'Analogia elétrica: vazão = corrente, perda de carga = tensão. Em série, a mesma corrente passa por todos e as tensões se somam; em paralelo, a tensão é a mesma e as correntes se somam.',
        'Série: mesma vazão e perdas somadas; paralelo: mesma perda e vazões somadas. Só uma alternativa acerta as duas metades.',
      ],
    },
    {
      id: 'mec-flu-21',
      difficulty: 3,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Num escoamento **supersônico** (M > 1), permanente e isentrópico, um gás passa por um trecho **divergente** (a área aumenta no sentido do escoamento). Nesse trecho,',
      options: [
        { text: 'a velocidade aumenta e a pressão diminui.', why: 'Correta: no supersônico a relação se inverte — abrir a seção acelera o gás, e a pressão (e a massa específica) cai.' },
        { text: 'a velocidade diminui e a pressão aumenta.', why: 'Isso acontece num divergente **subsônico** (difusor).' },
        { text: 'a velocidade e a pressão aumentam.', why: 'No isentrópico, velocidade e pressão variam em sentidos opostos.' },
        { text: 'a velocidade e a pressão diminuem.', why: 'Velocidade e pressão variam em sentidos opostos.' },
        { text: 'nada muda, pois o escoamento é isentrópico.', why: 'Isentrópico não quer dizer propriedades constantes: a área muda V, p, ρ e T.' },
      ],
      answer: 0,
      explanation: 'Relação de áreas e velocidades: dA/A = (M² − 1)·dV/V. Com **M > 1**, dA > 0 → dV > 0: o divergente **acelera**. Com M < 1, é o convergente que acelera. Em qualquer caso, quando a velocidade sobe, a pressão, a temperatura e a massa específica caem. Por isso o bocal de foguete é convergente-divergente: acelera até M = 1 na garganta e continua acelerando no divergente.',
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **supersônico** (M > 1) num trecho **divergente**.',
        'dA/A = (M² − 1)·dV/V. Com M > 1, o parêntese é positivo: a área aumenta e a velocidade **aumenta** — o contrário do subsônico.',
        'Velocidade sobe, pressão cai (isentrópico): "a velocidade aumenta e a pressão diminui".',
      ],
    },
    {
      id: 'mec-flu-22',
      difficulty: 3,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Uma esfera muito pequena cai lentamente num óleo bem viscoso, com número de Reynolds muito menor que 1 (escoamento de Stokes). Nessas condições, a força de arrasto sobre a esfera é',
      options: [
        { text: 'proporcional à viscosidade, à velocidade e ao diâmetro: F = 3π·μ·V·D.', why: 'Correta: no regime de Stokes, C_{D} = 24/Re e o arrasto é puramente viscoso, linear na velocidade.' },
        { text: 'proporcional a ρ·V²·D², com coeficiente de arrasto constante.', why: 'Isso vale para Re alto (C_{D} ≈ constante), não para o regime de Stokes.' },
        { text: 'independente da viscosidade do óleo.', why: 'Com Re ≪ 1, é justamente a viscosidade que domina o arrasto.' },
        { text: 'proporcional ao quadrado da velocidade e independente do diâmetro.', why: 'No regime de Stokes o arrasto é linear em V e cresce com D.' },
        { text: 'nula, porque o escoamento é laminar.', why: 'Escoamento laminar também tem arrasto (viscoso).' },
      ],
      answer: 0,
      explanation: 'Com Re ≪ 1, as forças de inércia são desprezíveis frente às viscosas: **F_{D} = 3π·μ·V·D**, o que equivale a C_{D} = 24/Re. Substituindo μ = ρ·V·D/Re, o arrasto também pode ser escrito em função de ρ, V e D — é o que a banca costuma pedir. É a base do viscosímetro de esfera em queda.',
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **Re ≪ 1** — escoamento de Stokes, dominado pela viscosidade.',
        'Sem inércia relevante, o arrasto é viscoso e linear na velocidade: F_{D} = 3π·μ·V·D (C_{D} = 24/Re).',
        'Fica "proporcional à viscosidade, à velocidade e ao diâmetro". As alternativas com V² e C_{D} constante descrevem Reynolds alto.',
      ],
    },
    {
      id: 'mec-flu-23',
      type: 'gen',
      difficulty: 2,
      lessonRef: 4,
      title: 'Placa sobre um filme de óleo',
      roteiro: 'filme-oleo',
      generate(rng) {
        const tau = pickOne(rng, [1.5, 2, 3, 5, 10]);
        const hmm = pickOne(rng, [1, 2, 5]);
        const mu = pickOne(rng, [0.01, 0.05, 0.1, 0.2]);
        const V = (tau * (hmm / 1000)) / mu;
        const { options, answer } = numericOptions({
          correct: V,
          unit: 'm/s',
          digits: 3,
          correctWhy: `τ = μ·V/h → V = τ·h/μ = ${fmt(tau, 1)} × ${fmt(hmm / 1000, 3)}/${fmt(mu, 2)} = ${fmt(V, 3)} m/s.`,
          distractors: [
            { value: (tau * hmm) / mu, why: 'Deixou a espessura em milímetros.' },
            { value: tau / (mu * (hmm / 1000)), why: 'Inverteu a espessura: V = τ·h/μ.' },
            { value: (mu * (hmm / 1000)) / tau, why: 'Inverteu a relação toda.' },
            { value: tau * (hmm / 1000) * mu, why: 'Multiplicou pela viscosidade em vez de dividir.' },
          ],
        });
        return {
          prompt: `Uma placa é arrastada sobre um filme de óleo de **${hmm} mm** de espessura, apoiado numa superfície fixa. A tensão de cisalhamento na placa é de **${fmt(tau, 1)} Pa** e a viscosidade dinâmica do óleo é **${fmt(mu, 2)} Pa·s**. Supondo perfil de velocidade linear, a velocidade da placa, em m/s, é`,
          options,
          answer,
          hint: 'Lei de Newton da viscosidade com perfil linear: τ = μ·V/h.',
          steps: [
            `h = ${hmm} mm = ${fmt(hmm / 1000, 3)} m.`,
            `τ = μ·V/h → ${fmt(tau, 1)} = ${fmt(mu, 2)} × V/${fmt(hmm / 1000, 3)}.`,
            `V = τ·h/μ = ${fmt(tau, 1)} × ${fmt(hmm / 1000, 3)}/${fmt(mu, 2)} = **${fmt(V, 3)} m/s**.`,
          ],
          explanation: `Filme fino → perfil linear: du/dy = V/h. Lei de Newton: τ = μ·V/h.\n\nV = τ·h/μ = ${fmt(tau, 1)} × ${fmt(hmm / 1000, 3)} / ${fmt(mu, 2)} = **${fmt(V, 3)} m/s**.`,
        };
      },
    },
    {
      id: 'mec-flu-24',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      shuffle: false,
      prompt: 'Analise as afirmativas sobre a viscosidade dos fluidos.\n\nI – Num fluido newtoniano, a tensão de cisalhamento é proporcional à taxa de deformação.\nII – A viscosidade cinemática é a razão entre a viscosidade dinâmica e a massa específica.\nIII – Nos líquidos, a viscosidade aumenta com a temperatura.\n\nEstá correto o que se afirma em',
      options: [
        { text: 'I, apenas', why: 'II também está correta: ν = μ/ρ.' },
        { text: 'III, apenas', why: 'III é falsa: nos líquidos a viscosidade **cai** com a temperatura.' },
        { text: 'I e II, apenas', why: 'Correta: I é a definição de fluido newtoniano e II, a de viscosidade cinemática.' },
        { text: 'II e III, apenas', why: 'III é falsa.' },
        { text: 'I, II e III', why: 'III é falsa: óleo quente escoa mais fácil.' },
      ],
      answer: 2,
      explanation: '**I** – Correta: τ = μ·du/dy é a lei de Newton da viscosidade. **II** – Correta: ν = μ/ρ. **III** – Errada: nos líquidos a viscosidade **diminui** com o aumento da temperatura (nos gases, aumenta).',
      roteiro: 'fmt.afirmativas',
      steps: [
        'I – **Correta**: τ = μ·du/dy é a lei de Newton da viscosidade.',
        'II – **Correta**: ν = μ/ρ.',
        'III – **Errada**: nos líquidos a viscosidade **diminui** com a temperatura (nos gases, aumenta).',
        'Certas: I e II → "I e II, apenas".',
      ],
    },
    {
      id: 'mec-flu-25',
      difficulty: 3,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Sobre um líquido em repouso num recipiente aberto, **NÃO** é correto afirmar que',
      options: [
        { text: 'a pressão no fundo de recipientes com a mesma altura de líquido depende do formato do recipiente.', why: 'Correta (é a afirmação falsa): só importa a profundidade — é o paradoxo hidrostático.' },
        { text: 'a diferença de pressão entre dois pontos é proporcional à diferença de profundidade entre eles.', why: 'Verdadeira: Δp = ρ·g·Δh.' },
        { text: 'pontos na mesma profundidade, no mesmo líquido contínuo, têm a mesma pressão.', why: 'Verdadeira: é o que faz os vasos comunicantes nivelarem.' },
        { text: 'num ponto qualquer, a pressão tem o mesmo valor em todas as direções.', why: 'Verdadeira: em repouso, a pressão é isotrópica (lei de Pascal).' },
        { text: 'um aumento de pressão na superfície se transmite a todos os pontos do líquido.', why: 'Verdadeira: princípio de Pascal.' },
      ],
      answer: 0,
      explanation: 'Na hidrostática, a pressão depende só da profundidade (p = p₀ + ρ·g·h), não do formato ou da largura do recipiente — o **paradoxo hidrostático**. As demais afirmações são verdadeiras: Stevin, vasos comunicantes, isotropia da pressão num ponto e Pascal. Atenção ao comando: a banca pediu a **incorreta**.',
      roteiro: 'fmt.exceto',
      steps: [
        'A banca pede o que **NÃO** é correto: procure a única afirmação falsa sobre líquido em repouso.',
        'Verdadeiras: Δp proporcional a Δh (Stevin), mesma profundidade = mesma pressão (vasos comunicantes), pressão igual em todas as direções num ponto e Pascal.',
        'Sobra a do formato do recipiente: a pressão no fundo depende só da altura de líquido (p = p₀ + ρ·g·h) — é o paradoxo hidrostático.',
      ],
    },
    {
      id: 'mec-flu-26',
      type: 'gen',
      difficulty: 3,
      lessonRef: 2,
      title: 'Continuidade com gás numa redução',
      roteiro: 'continuidade',
      generate(rng) {
        const rho1 = pickOne(rng, [2, 4, 5]);
        const V1 = pickOne(rng, [10, 15, 20, 25]);
        const factor = pickOne(rng, [5, 6.4, 8]);
        const V2 = V1 * factor;
        const rho2 = (rho1 * V1 * 4) / V2;
        const { options, answer } = numericOptions({
          correct: rho2,
          unit: 'kg/m³',
          digits: 3,
          correctWhy: `ρ₂ = ρ₁·V₁·(A₁/A₂)/V₂ = ${fmt(rho1)} × ${V1} × 4/${fmt(V2)} = ${fmt(rho2, 3)} kg/m³.`,
          distractors: [
            { value: rho1, why: 'Tratou o gás como incompressível; a vazão **mássica** é que se conserva.' },
            { value: (rho1 * V1 * 2) / V2, why: 'Usou a razão dos diâmetros (2) em vez da razão das áreas (4).' },
            { value: (rho1 * V2) / (V1 * 4), why: 'Inverteu as razões.' },
            { value: (rho1 * V1) / V2, why: 'Esqueceu que a área também mudou.' },
          ],
        });
        return {
          prompt: `Um gás escoa em regime permanente por uma tubulação de diâmetro D que se reduz para **D/2**. Antes da redução, a massa específica é **${fmt(rho1)} kg/m³** e a velocidade, **${V1} m/s**; depois, a velocidade é **${fmt(V2)} m/s**. A massa específica do gás após a redução é, em kg/m³,`,
          options,
          answer,
          hint: 'Conserva-se a vazão mássica: ρ₁·A₁·V₁ = ρ₂·A₂·V₂, com A₁/A₂ = 4.',
          steps: [
            `Gás: a massa específica muda, então fica na conta: ρ₁·A₁·V₁ = ρ₂·A₂·V₂.`,
            `D → D/2: A₁/A₂ = 2² = 4.`,
            `ρ₂ = ρ₁·(A₁/A₂)·(V₁/V₂) = ${fmt(rho1)} × 4 × ${V1}/${fmt(V2)} = **${fmt(rho2, 3)} kg/m³** (o gás se expandiu).`,
          ],
          explanation: `Continuidade para gás: ρ₁·A₁·V₁ = ρ₂·A₂·V₂. Metade do diâmetro → A₁/A₂ = 4.\n\nρ₂ = ρ₁·(A₁/A₂)·(V₁/V₂) = ${fmt(rho1)} × 4 × ${V1}/${fmt(V2)} = **${fmt(rho2, 3)} kg/m³**. O gás acelerou mais do que a área exigiria para um líquido, porque se expandiu (ρ caiu).`,
        };
      },
    },
  ],
  games: [
    {
      id: 'mec-flu-g1',
      type: 'match',
      title: 'Princípios e instrumentos',
      intro: 'Ligue cada princípio ou instrumento ao que ele diz ou mede.',
      lessonRef: 3,
      leftLabel: 'Princípio / instrumento',
      rightLabel: 'O que diz ou mede',
      perRound: 6,
      pairs: [
        { left: 'Lei de Stevin', right: 'A pressão cresce linearmente com a profundidade', why: 'p = p₀ + ρ·g·h.' },
        { left: 'Princípio de Pascal', right: 'Pressão aplicada a um fluido confinado se transmite integralmente', why: 'Base da prensa e dos macacos hidráulicos.' },
        { left: 'Princípio de Arquimedes', right: 'Empuxo igual ao peso do fluido deslocado', why: 'E = ρ_{fluido}·g·V_{submerso}.' },
        { left: 'Tubo de Pitot', right: 'Mede a velocidade pela pressão de estagnação', why: 'V = √(2·Δp/ρ).' },
        { left: 'Tubo Venturi', right: 'Mede a vazão pela queda de pressão no estreitamento', why: 'Continuidade + Bernoulli.' },
        { left: 'Manômetro em U', right: 'Mede diferença de pressão por uma coluna de líquido', why: 'Δp = ρ·g·Δh.' },
        { left: 'Número de Reynolds', right: 'Razão entre forças de inércia e forças viscosas', why: 'Define o regime: laminar ou turbulento.' },
        { left: 'Equação da continuidade', right: 'Conservação da massa: A·V constante para líquidos', why: 'Metade do diâmetro → 4× a velocidade.' },
      ],
    },
    {
      id: 'mec-flu-g2',
      type: 'sort',
      title: 'Laminar ou turbulento?',
      intro: 'Cada item descreve um escoamento em tubo. Ele é **laminar** ou **turbulento**?',
      lessonRef: 4,
      bins: ['Laminar', 'Turbulento'],
      items: [
        { text: 'Re = 1.200 em um tubo', bin: 0, why: 'Abaixo de ~2.000: laminar.' },
        { text: 'Re = 50.000 em um tubo', bin: 1, why: 'Bem acima de ~4.000: turbulento.' },
        { text: 'Perfil de velocidade parabólico', bin: 0, why: 'Perfil típico do escoamento laminar (Hagen–Poiseuille).' },
        { text: 'Mistura intensa e flutuações aleatórias de velocidade', bin: 1, why: 'Marca registrada da turbulência.' },
        { text: 'Fator de atrito f = 64/Re', bin: 0, why: 'Vale só no regime laminar.' },
        { text: 'Fator de atrito depende da rugosidade relativa (diagrama de Moody)', bin: 1, why: 'No turbulento a rugosidade da parede pesa no atrito.' },
        { text: 'Óleo muito viscoso, devagar, em tubo fino', bin: 0, why: 'ν alto e V·D pequeno → Re baixo.' },
        { text: 'Água a 2 m/s em tubo de 100 mm', bin: 1, why: 'Re = 2 × 0,1 / 10⁻⁶ = 200.000.' },
        { text: 'Perfil de velocidade "achatado" no centro', bin: 1, why: 'A mistura turbulenta uniformiza a velocidade no núcleo.' },
        { text: 'Camadas de fluido deslizando umas sobre as outras, sem se misturar', bin: 0, why: 'É a definição de escoamento laminar.' },
      ],
    },
    {
      id: 'mec-flu-g3',
      type: 'match',
      title: 'Números adimensionais e tubulações',
      intro: 'Ligue cada número ou regra ao que ele representa. A banca adora as **razões de forças**.',
      lessonRef: 5,
      leftLabel: 'Número / regra',
      rightLabel: 'O que representa',
      pairs: [
        { left: 'Reynolds', right: 'Inércia ÷ forças viscosas', why: 'Re = ρ·V·D/μ: decide se o escoamento é laminar ou turbulento.' },
        { left: 'Froude', right: 'Inércia ÷ gravidade', why: 'Fr = V/√(g·L): escoamentos com superfície livre (canais, navios).' },
        { left: 'Mach', right: 'Velocidade ÷ velocidade do som', why: 'Inércia ÷ compressibilidade: acima de ~0,3 o gás já não é incompressível.' },
        { left: 'Euler', right: 'Pressão ÷ inércia', why: 'Eu = Δp/(ρ·V²).' },
        { left: 'Weber', right: 'Inércia ÷ tensão superficial', why: 'Gotas, bolhas e jatos finos.' },
        { left: 'Buckingham', right: 'n variáveis e k dimensões → n − k grupos adimensionais', why: 'Teorema dos Pi.' },
        { left: 'Tubos em série', right: 'Mesma vazão; as perdas se somam', why: 'Como resistores em série: mesma corrente.' },
        { left: 'Tubos em paralelo', right: 'Mesma perda de carga; as vazões se somam', why: 'Como resistores em paralelo: mesma tensão.' },
      ],
    },
    {
      id: 'mec-flu-lab1',
      type: 'lab',
      lab: 'venturi',
      title: 'Venturi e Bernoulli',
      intro: 'Um Venturi com piezômetros, Pitot e manômetro de mercúrio. Veja a continuidade acelerar o fluido e o Bernoulli cobrar na pressão.',
      lessonRef: 3,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { d2: 100, Q: 12 },
          prompt: 'O tubo ainda não tem estrangulamento (garganta de 100 mm). Vamos **reduzir a garganta para 50 mm**. Na garganta, a velocidade e a pressão vão…',
          change: { d2: 50 },
          options: ['velocidade ×4 e pressão cai', 'velocidade ×2 e pressão cai', 'velocidade ×4 e pressão sobe', 'velocidade ×2 e pressão sobe', 'nada muda: a vazão é a mesma'],
          answer: 0,
          expect: [
            { out: 'v2', trend: 'up' },
            { out: 'p2', trend: 'down' },
          ],
          why: 'Continuidade: A₁v₁ = A₂v₂. Metade do diâmetro = **¼ da área** → velocidade **×4**. Bernoulli: se a carga cinética v²/2g aumenta, a carga de pressão p/ρg tem que diminuir (a soma é constante).',
        },
        {
          kind: 'predict',
          setup: { Q: 10 },
          prompt: 'O manômetro de mercúrio marca certo Δh com **10 L/s**. Se a vazão **dobrar para 20 L/s**, o novo Δh será…',
          change: { Q: 20 },
          options: ['o dobro', 'o quádruplo', '√2 vezes maior', '8 vezes maior', 'o mesmo'],
          answer: 1,
          expect: [{ out: 'dh', trend: 'up' }],
          why: 'Δp = ½ρ(v₂² − v₁²) e as velocidades são proporcionais à vazão → **Δp ∝ Q²**. Por isso Venturi e placa de orifício medem a vazão pela **raiz quadrada** da diferença de pressão: Q = C·√Δh.',
        },
        {
          kind: 'goal',
          setup: { Q: 5, d2: 50 },
          lock: ['d2', 'dz', 'real'],
          prompt: 'Ajuste a vazão para que o manômetro de mercúrio marque **entre 19 e 21 cm**.',
          goals: [{ out: 'dh', min: 19, max: 21 }],
          hint: 'Δh cresce com o **quadrado** da vazão. Com 12 L/s ele marca ~14 cm: um pouco mais de vazão resolve.',
          solution: { Q: 14.5 },
          why: 'Δh = Δp/((ρ_{Hg} − ρ)·g). Com d = D/2, v₂ = 4v₁ e Δp = ½ρ(16 − 1)v₁² = 7,5ρv₁². Para Δh = 20 cm: Δp ≈ 24,7 kPa → v₁ ≈ 1,8 m/s → Q ≈ 14 L/s.',
        },
        {
          kind: 'predict',
          setup: { Q: 12, dz: 0 },
          prompt: 'Mesma vazão, mas agora o Venturi vai ser **inclinado**: a garganta fica **2 m acima** da entrada. A leitura do manômetro diferencial de mercúrio…',
          change: { dz: 2 },
          options: ['não muda', 'aumenta, porque a pressão na garganta cai mais', 'diminui, porque a gravidade ajuda o escoamento', 'aumenta o equivalente a 2 m de coluna d’água'],
          answer: 0,
          expect: [
            { out: 'dh', trend: 'same' },
            { out: 'p2', trend: 'down' },
          ],
          why: 'A pressão na garganta cai mais (gastou carga de posição), mas o manômetro diferencial mede (p₁ + ρgz₁) − (p₂ + ρgz₂): o desnível **se cancela** com a coluna de água dentro das próprias mangueiras. A leitura depende **só da vazão** — pegadinha clássica.',
        },
        {
          kind: 'goal',
          setup: { Q: 10, p1: 60 },
          lock: ['dz', 'real'],
          prompt: 'Faça a água **cavitar na garganta** (a pressão absoluta tem que chegar à pressão de vapor).',
          goals: [{ out: 'cav', min: 1, label: 'Cavitação na garganta' }],
          hint: 'Pressão baixa na garganta = velocidade alta. Aumente a vazão, estreite a garganta e/ou baixe a pressão de entrada.',
          solution: { Q: 26, d2: 40, p1: 40 },
          why: 'Na garganta a pressão é mínima. Se chega à **pressão de vapor**, a água ferve a frio; as bolhas **implodem** quando a pressão volta a subir no difusor — erosão, ruído e medição errada. É o mesmo fenômeno da entrada do rotor de uma bomba.',
        },
        {
          kind: 'predict',
          setup: { Q: 20, real: 0 },
          prompt: 'Agora o fluido passa a ser **real** (com perdas). A pressão na **saída** (seção 3, mesmo diâmetro da entrada) fica…',
          change: { real: 1 },
          options: ['um pouco abaixo da pressão da entrada', 'igual à da entrada, como no fluido ideal', 'acima da pressão da entrada', 'igual à da garganta'],
          answer: 0,
          expect: [{ out: 'p3', trend: 'down' }],
          why: 'Com perdas, a **linha de energia desce** ao longo do tubo: parte da energia vira calor (atrito e turbulência no difusor). A saída recupera *quase* toda a pressão — a perda permanente do Venturi é pequena, bem menor que a da placa de orifício.',
        },
        {
          kind: 'predict',
          setup: { pitot: 1, Q: 15 },
          prompt: 'O **tubo de Pitot** na garganta aponta contra o escoamento. Até onde sobe a coluna dele?',
          options: ['Até a linha de energia: mede p + ½ρv² (pressão de estagnação)', 'Até a linha piezométrica, como os outros piezômetros', 'Fica abaixo do eixo do tubo', 'Até a metade do caminho entre a linha piezométrica e a de energia'],
          answer: 0,
          why: 'No bico do Pitot o fluido **para** (ponto de estagnação): a energia cinética vira pressão e a coluna alcança a **linha de energia** (z + p/ρg + v²/2g). Pitot − piezômetro = v²/2g → **v = √(2g·Δh)**.',
        },
      ],
    },
  ],
});
