import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

export default defineTopic({
  id: 'mec.transferencia-calor',
  name: 'Transmissão de calor e trocadores',
  summary: 'Condução, convecção e radiação, resistências térmicas, raio crítico, equação do calor, trocadores de calor (média logarítmica e efetividade).',
  order: 1,
  weight: 3,
  equipment: 'exchanger',
  edital: ['b3.calor', 'b3.trocadores'],
  lesson: [
    {
      title: 'Os três mecanismos',
      body: '- **Condução:** transferência por contato, em sólidos ou fluidos parados (agitação molecular). Lei de **Fourier**.\n- **Convecção:** entre uma superfície e um fluido **em movimento** — natural (empuxo) ou forçada (bomba, ventilador). Lei de **Newton do resfriamento**.\n- **Radiação:** por ondas eletromagnéticas; **não precisa de meio** (atravessa o vácuo). Lei de **Stefan-Boltzmann**.',
      hot: 'Pelo **vácuo**, só radiação (Petrobras 2014). Lembre também de **Q = m·c·ΔT** (calor sensível): a Petrobras 2012 pediu o calor específico de um sólido a partir de um gráfico energia × temperatura.',
      tip: 'Garrafa térmica: o **vácuo** corta condução e convecção; o **espelhamento** corta a radiação.',
    },
    {
      title: 'Condução e resistência térmica',
      body: 'Parede plana: **q = k·A·ΔT / L** (fluxo q″ = q/A = k·ΔT/L; gradiente de temperatura = ΔT/L).\n\nAnalogia elétrica: **q = ΔT / R**, com **R_{cond} = L/(k·A)**. Camadas em **série** somam resistências: R_{total} = R_{1} + R_{2} + ...\n\nCondutividade k (W/m·K): cobre ≈ 400; aço carbono ≈ 50; aço inox ≈ 15; tijolo refratário ≈ 1; lã de rocha ≈ 0,04.\n\nCilindro (tubo): R = ln(r_{2}/r_{1}) / (2π·k·L).',
      example: 'Parede de 0,2 m, k = 1 W/m·K, área de 10 m², ΔT = 40 K: q = 1 × 10 × 40 / 0,2 = **2.000 W**; o gradiente é 40/0,2 = **200 K/m**.',
      hot: 'Fourier em parede plana é a conta mais repetida de transcal: a taxa, o **gradiente** ΔT/L, o ΔT a partir do fluxo ou o **k** a partir do fluxo (Transpetro 2012 e 2018, Petrobras 2014 e 2018). E a parede de forno com refratário + isolante dimensionada para limitar a perda (Transpetro 2008).',
      tip: 'Uma diferença de temperatura de 1 °C é igual a 1 K: em ΔT, tanto faz a escala.',
      trap: 'Dar a **taxa** (W) quando a pergunta pede o **fluxo** (W/m²), ou vice-versa.',
    },
    {
      title: 'Convecção e raio crítico',
      body: '**q = h·A·(T_{s} − T_{∞})**, com resistência **R_{conv} = 1/(h·A)**.\n\nOrdens de grandeza de h (W/m²·K): convecção natural em gases 2–25; forçada em gases 25–250; forçada em líquidos 50–20.000; **ebulição e condensação** 2.500–100.000.\n\nNúmeros adimensionais: **Nusselt** (Nu = h·L/k — o gradiente adimensional de temperatura na superfície), **Reynolds** (convecção forçada), **Prandtl** (ν/α, propriedades do fluido), **Grashof** (empuxo/viscosas, convecção natural) e **Rayleigh** (Gr·Pr).\n\nParede com uma face a T₁ e a outra trocando calor com um fluido: q″ = (T₁ − T_{∞})/(L/k + 1/h).\n\n**Raio crítico:** isolar um tubo ou fio **fino** pode **aumentar** a perda de calor, porque o isolante aumenta a área externa (R_{conv} cai). Enquanto o raio externo for menor que **r_{c} = k/h** (cilindro; na esfera, 2k/h), mais isolante = mais perda. Espessura crítica = r_{c} − r_{tubo}.',
      hot: 'h **não é propriedade** termodinâmica: depende do escoamento, da geometria e do fluido (Transpetro 2012). Resistência de convecção 1/(h·A) (Petrobras 2014), **Nusselt** (BR 2012), espessura crítica de isolamento de um tubo (Petrobras 2018), placa ao sol dissipando por convecção (Petrobras 2011) e parede com convecção de um lado (BR 2012).',
      tip: '**N**usselt = **N**ewton do resfriamento adimensional (h·L/k). Raio crítico: **k sobre h** — "isolante fraco, ar parado".',
      trap: 'h não é propriedade do fluido: depende da velocidade, da geometria e do regime de escoamento.',
    },
    {
      title: 'Radiação',
      body: '**q = ε·σ·A·(T_{s}^{4} − T_{viz}^{4})** — temperaturas em **kelvin**; σ = 5,67 × 10^{−8} W/m²·K^{4}.\n\n- **Emissividade:** 0 ≤ ε ≤ 1. **Corpo negro:** ε = 1 (emissor e absorvedor ideal: absorve **toda** a radiação incidente).\n- Superfícies **polidas** (folha de alumínio) têm ε **baixa** (~0,05); madeira, tinta, pele e **água** têm ε alta (0,8 a 0,95).\n- **Lei de Kirchhoff:** para superfície cinzenta em equilíbrio, **α = ε** (bom absorvedor = bom emissor).\n- Para uma superfície opaca, α + ρ = 1 (absorve ou reflete). Reflexão **especular** (espelho: ângulo de incidência = de reflexão) × **difusa** (reflete igualmente em todas as direções).\n- Como depende de T^{4}, **dobrar a temperatura absoluta multiplica a emissão por 16**.',
      hot: 'Faixa da emissividade, **0 a 1** (Transpetro 2012); corpo negro e emissividades em ordem crescente — alumínio, madeira, água (Petrobras 2011); reflexão difusa (Petrobras Biocombustível 2010).',
      tip: 'Brilhante emite pouco (alumínio polido no isolamento); fosco e escuro emite muito.',
      trap: 'Usar °C na lei de Stefan-Boltzmann.',
    },
    {
      title: 'Trocadores de calor',
      body: 'Tipos: **casco e tubos** (o mais comum em refinarias), **placas**, **duplo tubo**, resfriadores a ar.\n\n**q = U·A·ΔT_{ml}**, com a média logarítmica:\n\n**ΔT_{ml} = (ΔT_{1} − ΔT_{2}) / ln(ΔT_{1}/ΔT_{2})**\n\n- **Contracorrente:** maior ΔT_{ml} para as mesmas temperaturas → **menor área**; permite que a saída do fluido frio fique **mais quente** que a saída do fluido quente.\n- **Correntes paralelas:** a saída do fluido frio nunca passa da saída do quente.\n- **Incrustação (fouling)** cria resistência extra e reduz U.\n- Balanço: q = (m·c_{p}·ΔT)_{quente} = (m·c_{p}·ΔT)_{frio}, com m em kg/s.',
      hot: 'Perfis de temperatura ao longo do trocador, em contracorrente × paralelo (Transpetro 2011, Petrobras 2012).',
      tip: 'Nos perfis T × posição: em **paralelo** as curvas se aproximam e nunca se cruzam; em **contracorrente** elas andam "lado a lado".',
      trap: 'A média **aritmética** das diferenças de temperatura superestima ΔT_{ml}.',
      lab: { lab: 'exchanger', preset: { arr: 1 }, label: 'Ver o trocador funcionando' },
    },
    {
      title: 'Equação do calor e perfis de temperatura',
      body: 'Em regime permanente, sem geração de calor e em 1 dimensão, a equação do calor fica:\n\n- **Parede plana:** d²T/dx² = 0 → perfil **linear**.\n- **Cilindro:** (1/r)·d/dr(r·dT/dr) = 0 → perfil **logarítmico**.\n- **Esfera:** (1/r²)·d/dr(r²·dT/dr) = 0 → perfil em **1/r**.\n\nCom um perfil T(x) conhecido, o calor em cada face vem de Fourier: **q = −k·A·dT/dx** (o sinal indica o sentido: calor flui de onde é quente para onde é frio). Se o perfil é curvo (T = a + b·x + c·x²), o calor que entra é diferente do que sai: a diferença fica armazenada (regime transiente) ou é gerada dentro do material.\n\n**Calor sensível:** Q = m·c·ΔT.',
      example: 'T(x) = 500 − 200·x + 50·x² (x em m), k = 20 W/m·K, A = 2 m². Em x = 0: dT/dx = −200 K/m → q = −20 × 2 × (−200) = **8.000 W** entrando na parede.',
      hot: 'Forma da equação do calor numa **esfera** oca (BR 2012) e o calor numa face a partir de um perfil T(x) = a + bx + cx² (Petrobras Biocombustível 2010).',
      tip: 'Derive o perfil, ponha o x da face e multiplique por −k·A.',
      trap: 'Esquecer o sinal de menos de Fourier: com dT/dx negativo, o calor flui no sentido **+x**.',
    },
    {
      title: 'Efetividade e casos especiais',
      body: '**Efetividade:** ε = q/q_{máx}, com **q_{máx} = C_{mín}·(T_{q,ent} − T_{f,ent})** e C = ṁ·c_{p} (a capacidade térmica de cada corrente). **NUT = U·A/C_{mín}**.\n\n- **Condensador ou evaporador** (um fluido mudando de fase): a temperatura dele fica **constante** (é como C → ∞, C_{r} = 0). Aí ε = 1 − e^{−NUT}, **qualquer que seja o arranjo**.\n- Se um fluido tem C muito maior que o outro, a temperatura dele **quase não muda** ao longo do trocador.\n- Contracorrente com C_{q} = C_{f}: perfis paralelos, ΔT constante.\n\nBalanço no condensador: ṁ_{vapor}·h_{lv} = ṁ_{água}·c_{p}·ΔT_{água}.',
      example: 'Vapor condensando a 100 °C, água entrando a 20 °C, NUT = 1: ε = 1 − e^{−1} = 0,632 → a água sai a 20 + 0,632 × 80 ≈ **70,6 °C**.',
      hot: 'O caso C_{q} ≫ C_{f}: o fluido quente fica com temperatura praticamente constante (Transpetro 2018), e o balanço de energia de um condensador resfriado por água de lago (Transpetro 2008).',
      tip: 'Quem muda de fase segura a temperatura: **condensador = linha reta** no gráfico T × posição.',
      trap: 'A efetividade nunca passa de 1 (100%): se a conta der mais, algum C está trocado.',
    },
  ],
  roteiros: [
    {
      id: 'conducao-parede',
      name: 'Condução em parede (Fourier e resistências)',
      when: 'Parede plana com uma ou mais camadas, com ou sem convecção; pedem o fluxo, a taxa de calor, a espessura ou a condutividade.',
      steps: [
        'Monte as resistências por m², em série: condução L/k em cada camada e convecção 1/h.',
        'Fluxo: q″ = ΔT_{total}/ΣR (numa camada só, q = k·A·ΔT/L).',
        'Isole o que se pede: espessura, condutividade, temperatura numa interface ou taxa (× área).',
      ],
      note: 'É a lei de Ohm do calor: ΔT faz o papel da tensão; q, da corrente; L/k e 1/h, das resistências. O isolante, mesmo fino, domina.',
    },
    {
      id: 'conveccao',
      name: 'Convecção e balanço numa superfície',
      when: 'Superfície trocando calor com um fluido (e às vezes recebendo sol ou radiação); pedem a temperatura da superfície, h ou o calor.',
      steps: [
        'Escreva o balanço da superfície em regime permanente: o que entra = o que sai.',
        'Convecção: q″ = h·(T_{s} − T_{∞}); radiação líquida: ε·σ·(T_{s}⁴ − T_{viz}⁴), em kelvin.',
        'Isole a incógnita (T_{s}, h ou q).',
      ],
      note: 'h não é propriedade do fluido: depende da camada-limite (velocidade, geometria, regime) e sai de correlações com o número de Nusselt.',
    },
    {
      id: 'radiacao',
      name: 'Radiação térmica (Stefan-Boltzmann)',
      when: 'Superfície emitindo ou trocando calor por radiação; pedem a potência, o efeito da temperatura ou propriedades como ε e α.',
      steps: [
        'Passe as temperaturas para **kelvin**.',
        'Emissão: ε·σ·A·T⁴; troca líquida com um ambiente grande: ε·σ·A·(T_{s}⁴ − T_{viz}⁴).',
        'Calcule ou compare (T absoluta em dobro → emissão × 16); lembre 0 ≤ ε ≤ 1 e α = ε para superfície cinzenta.',
      ],
      note: 'Radiação dispensa meio material. Metal polido tem ε baixo; o corpo negro (ε = 1) absorve tudo.',
    },
    {
      id: 'trocador',
      name: 'Trocadores de calor (ΔT_{ml} e ε-NUT)',
      when: 'Trocador com temperaturas, vazões ou NUT; pedem ΔT_{ml}, a área, a vazão, a temperatura de saída ou o efeito do arranjo.',
      steps: [
        'Balanço de energia: calor do quente = calor do frio (ṁ·c_{p}·ΔT, ou ṁ·h_{lv} na mudança de fase).',
        'Escolha o método: q = U·A·ΔT_{ml}, com ΔT_{ml} = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂); ou ε-NUT (mudança de fase: ε = 1 − e^{−NUT}).',
        'Isole a incógnita e confira o sentido: contracorrente dá ΔT_{ml} maior e exige menos área.',
      ],
      note: 'ΔT_{ml} é um pouco menor que a média aritmética. Incrustação reduz U. Com mudança de fase, o arranjo não importa.',
    },
    {
      id: 'raio-critico',
      name: 'Raio crítico de isolamento',
      when: 'Tubo ou fio que vai receber isolante; pedem o raio crítico ou por que a perda aumentou.',
      steps: [
        'Raio crítico do cilindro: r_{c} = k/h (esfera: 2k/h).',
        'Compare com o raio externo atual.',
        'Abaixo de r_{c}, mais isolante **aumenta** a perda (ganha área de convecção); acima, reduz.',
      ],
      note: 'Em fio elétrico fino, isolar pode até ajudar a dissipar calor.',
    },
    {
      id: 'equacao-calor',
      name: 'Equação do calor e lei de Fourier',
      when: 'Pedem a forma da equação do calor numa geometria, ou a taxa numa face a partir do perfil T(x).',
      steps: [
        'Identifique a geometria: plana d²T/dx²; cilindro (1/r)·d/dr(r·dT/dr); esfera (1/r²)·d/dr(r²·dT/dr).',
        'Ajuste o lado direito: regime permanente sem geração = 0; com geração, −q_{ger}/k; transiente, (1/α)·∂T/∂t.',
        'Para a taxa numa face: q = −k·A·dT/dx, com a derivada calculada na face.',
      ],
      note: 'Perfil linear só na parede plana sem geração; no cilindro, logarítmico; na esfera, em 1/r.',
    },
    {
      id: 'calor-sensivel',
      name: 'Calor sensível (Q = m·c·ΔT)',
      when: 'Corpo aquecido ou resfriado sem mudar de fase; pedem o calor, a variação de temperatura ou o calor específico.',
      steps: [
        'Calor sensível, sem mudança de fase: Q = m·c·ΔT.',
        'Isole a incógnita (c = Q/(m·ΔT), por exemplo).',
        'Calcule e confira a ordem de grandeza (água 4,18; alumínio 0,9; aço 0,46 kJ/kg·K).',
      ],
      note: 'Na mudança de fase a temperatura fica constante: o calor é latente, Q = m·h_{lv}.',
    },
  ],
  questions: [
    {
      id: 'mec-cal-01',
      type: 'gen',
      difficulty: 1,
      lessonRef: 1,
      title: 'Condução em parede plana',
      roteiro: 'conducao-parede',
      generate(rng) {
        const k = pickOne(rng, [0.5, 0.8, 1, 1.2, 2]);
        const L = pickOne(rng, [0.1, 0.2, 0.25, 0.4, 0.5]);
        const A = pickOne(rng, [2, 4, 5, 10, 20]);
        const dT = pickOne(rng, [20, 30, 40, 50, 80, 100]);
        const q = (k * A * dT) / L;
        const { options, answer } = numericOptions({
          correct: q,
          unit: 'W',
          digits: 1,
          correctWhy: `q = k·A·ΔT/L = ${fmt(k)} × ${A} × ${dT} / ${fmt(L)} = ${fmt(q, 1)} W.`,
          distractors: [
            { value: k * A * dT * L, why: 'Multiplicou pela espessura: q = k·A·ΔT/**L**.' },
            { value: (k * dT) / L, why: 'Esqueceu a área: isso é o **fluxo** de calor (W/m²), não a taxa.' },
            { value: (A * dT) / (k * L), why: 'Dividiu pela condutividade: quanto **maior** k, **mais** calor passa.' },
          ],
        });
        return {
          prompt: `Uma parede plana de **${fmt(L)} m** de espessura e **${A} m²** de área tem condutividade térmica **k = ${fmt(k)} W/(m·K)**. Se as faces estão a uma diferença de **${dT} K**, a taxa de calor conduzido, em regime permanente, é`,
          options,
          answer,
          hint: 'Lei de Fourier para parede plana.',
          steps: [
            `Uma camada só: R = L/(k·A).`,
            `q = k·A·ΔT/L = ${fmt(k)} × ${A} × ${dT}/${fmt(L)}.`,
            `q = **${fmt(q, 1)} W**.`,
          ],
          explanation: `Lei de Fourier: q = k·A·ΔT/L = ${fmt(k)} × ${A} × ${dT} / ${fmt(L)} = **${fmt(q, 1)} W**.`,
        };
      },
    },
    {
      id: 'mec-cal-02',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Resistências térmicas em série',
      roteiro: 'conducao-parede',
      generate(rng) {
        const [L1, k1] = pickOne(rng, [
          [0.2, 1],
          [0.1, 1],
          [0.25, 1],
          [0.1, 0.5],
          [0.2, 0.8],
        ]);
        const [L2, k2] = pickOne(rng, [
          [0.05, 0.05],
          [0.04, 0.04],
          [0.06, 0.04],
          [0.1, 0.05],
          [0.03, 0.06],
        ]);
        const dT = pickOne(rng, [300, 400, 500, 600]);
        const R1 = L1 / k1;
        const R2 = L2 / k2;
        const q = dT / (R1 + R2);
        const { options, answer } = numericOptions({
          correct: q,
          unit: 'W/m²',
          digits: 1,
          correctWhy: `q = ΔT/(R₁ + R₂) = ${dT}/(${fmt(R1, 3)} + ${fmt(R2, 3)}) = ${fmt(q, 1)} W/m².`,
          distractors: [
            { value: dT / R1, why: 'Considerou só a camada de refratário.' },
            { value: dT / R2, why: 'Considerou só a camada de isolante.' },
            { value: dT * (1 / R1 + 1 / R2), why: 'Somou condutâncias, como em **paralelo**; em série somam-se as **resistências**.' },
          ],
        });
        return {
          prompt: `A parede de um forno tem duas camadas em série: **${fmt(L1)} m** de refratário (k = ${fmt(k1)} W/m·K) e **${fmt(L2)} m** de isolante (k = ${fmt(k2)} W/m·K). Com diferença de **${dT} K** entre as faces externas e desprezando a convecção, o fluxo de calor é`,
          options,
          answer,
          hint: 'Por m² de parede: R = L/k para cada camada; em série, as resistências se somam.',
          steps: [
            `R₁ = ${fmt(L1)}/${fmt(k1)} = ${fmt(R1, 3)}; R₂ = ${fmt(L2)}/${fmt(k2)} = ${fmt(R2, 3)} (m²·K/W).`,
            `q″ = ${dT}/(${fmt(R1, 3)} + ${fmt(R2, 3)}) = ${dT}/${fmt(R1 + R2, 3)}.`,
            `q″ = **${fmt(q, 1)} W/m²** — o isolante domina a resistência.`,
          ],
          explanation: `Por unidade de área: R₁ = L₁/k₁ = ${fmt(L1)}/${fmt(k1)} = ${fmt(R1, 3)} m²K/W; R₂ = ${fmt(L2)}/${fmt(k2)} = ${fmt(R2, 3)} m²K/W.\n\nq = ΔT/(R₁ + R₂) = ${dT}/${fmt(R1 + R2, 3)} = **${fmt(q, 1)} W/m²**. Repare como o isolante, mesmo fino, domina a resistência total.`,
        };
      },
    },
    {
      id: 'mec-cal-03',
      type: 'gen',
      difficulty: 2,
      lessonRef: 4,
      title: 'Média logarítmica de temperatura',
      roteiro: 'trocador',
      generate(rng) {
        const [d1, d2] = pickOne(rng, [
          [60, 30],
          [80, 40],
          [40, 20],
          [90, 30],
          [60, 20],
          [120, 40],
          [100, 50],
        ]);
        const ln = d1 / d2 === 2 ? 0.693 : 1.099;
        const lmtd = (d1 - d2) / ln;
        const { options, answer } = numericOptions({
          correct: lmtd,
          unit: '°C',
          digits: 1,
          correctWhy: `ΔT_{ml} = (${d1} − ${d2})/ln(${d1}/${d2}) = ${d1 - d2}/${fmt(ln, 3)} ≈ ${fmt(lmtd, 1)} °C.`,
          distractors: [
            { value: (d1 + d2) / 2, why: 'Média **aritmética**: superestima a diferença média em trocadores.' },
            { value: d1 - d2, why: 'Faltou dividir pelo logaritmo.' },
            { value: (d1 - d2) / Math.log10(d1 / d2), why: 'Usou logaritmo na base 10; a fórmula usa o **natural** (ln).' },
          ],
        });
        return {
          prompt: `Em um trocador de calor em contracorrente, a diferença de temperatura entre os fluidos é de **${d1} °C** em uma extremidade e **${d2} °C** na outra. Usando ln 2 = 0,693 e ln 3 = 1,099, a diferença média logarítmica de temperatura é, aproximadamente,`,
          options,
          answer,
          hint: 'ΔT_{ml} = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂).',
          steps: [
            `Contracorrente: ΔT₁ = ${d1} °C e ΔT₂ = ${d2} °C nas pontas.`,
            `ΔT_{ml} = (${d1} − ${d2})/ln(${d1}/${d2}) = ${d1 - d2}/${fmt(ln, 3)}.`,
            `ΔT_{ml} = **${fmt(lmtd, 1)} °C** (menor que a média aritmética, ${fmt((d1 + d2) / 2, 1)} °C).`,
          ],
          explanation: `ΔT_{ml} = (${d1} − ${d2})/ln(${d1}/${d2}) = ${d1 - d2}/${fmt(ln, 3)} = **${fmt(lmtd, 1)} °C**.\n\nRepare que é um pouco **menor** que a média aritmética (${fmt((d1 + d2) / 2, 1)} °C).`,
        };
      },
    },
    {
      id: 'mec-cal-04',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'O calor do Sol chega à Terra atravessando o vácuo do espaço por',
      options: [
        { text: 'radiação.', why: 'Correta: ondas eletromagnéticas não precisam de meio material.' },
        { text: 'condução.', why: 'Condução exige contato entre matéria — no vácuo não há.' },
        { text: 'convecção natural.', why: 'Convecção exige um fluido em movimento.' },
        { text: 'convecção forçada.', why: 'Convecção exige um fluido.' },
        { text: 'condução e convecção combinadas.', why: 'Nenhuma das duas acontece no vácuo.' },
      ],
      answer: 0,
      roteiro: 'radiacao',
      steps: [
        'Entre o Sol e a Terra há vácuo.',
        'Condução e convecção precisam de matéria; a radiação é onda eletromagnética.',
        'Fica **radiação**.',
      ],
      explanation: 'A **radiação** é o único mecanismo que dispensa meio material: a energia viaja como onda eletromagnética. Condução e convecção precisam de matéria.',
    },
    {
      id: 'mec-cal-05',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Comparado ao arranjo de correntes paralelas, o trocador de calor em **contracorrente**, para as mesmas temperaturas de entrada e saída,',
      options: [
        { text: 'tem maior diferença média de temperatura e, portanto, exige menor área.', why: 'Correta: q = U·A·ΔT_{ml} — ΔT_{ml} maior, A menor.' },
        { text: 'exige maior área, por ter menor diferença média de temperatura.', why: 'É o contrário.' },
        { text: 'não permite que a saída do fluido frio supere a saída do fluido quente.', why: 'Essa limitação é das **correntes paralelas**.' },
        { text: 'tem o mesmo desempenho, pois o calor trocado é o mesmo.', why: 'O calor pode ser o mesmo, mas a área necessária muda com o ΔT médio.' },
        { text: 'só funciona com mudança de fase de um dos fluidos.', why: 'Funciona com ou sem mudança de fase.' },
      ],
      answer: 0,
      roteiro: 'trocador',
      steps: [
        'Mesmo calor e mesmas temperaturas de entrada e saída nos dois arranjos.',
        'q = U·A·ΔT_{ml}: na contracorrente, a diferença entre os fluidos é mais uniforme e o ΔT_{ml} é maior.',
        'Fica **maior diferença média de temperatura, logo menor área**.',
      ],
      explanation: 'Na contracorrente, a diferença de temperatura entre os fluidos fica mais uniforme ao longo do trocador, e o ΔT_{ml} é maior. Por isso ela exige menos área e permite que o fluido frio saia mais quente que a saída do quente.',
    },
    {
      id: 'mec-cal-06',
      difficulty: 3,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Uma superfície a **300 K** passa para **600 K**. Mantidas a emissividade e a área, a potência que ela **emite** por radiação fica multiplicada por',
      shuffle: false,
      options: [
        { text: '2', why: 'A emissão é proporcional a T^{4}, não a T.' },
        { text: '4', why: 'Seria T^{2}.' },
        { text: '8', why: 'Seria T^{3}.' },
        { text: '16', why: 'Correta: (600/300)^{4} = 2^{4} = 16.' },
        { text: '32', why: 'Seria T^{5}.' },
      ],
      answer: 3,
      roteiro: 'radiacao',
      steps: [
        '300 K → 600 K: a temperatura **absoluta** dobra.',
        'Emissão = ε·σ·A·T⁴, com ε e A iguais.',
        '2⁴ = **16**.',
      ],
      explanation: 'Emissão = ε·σ·A·T^{4}. Dobrar a temperatura **absoluta** multiplica a emissão por 2^{4} = **16**. Por isso a radiação domina em fornos e em altas temperaturas.',
    },
    {
      id: 'mec-cal-07',
      difficulty: 3,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Ao isolar termicamente um fio elétrico de pequeno diâmetro, observou-se que a perda de calor **aumentou**. Isso pode ocorrer porque',
      options: [
        { text: 'o raio externo do isolamento ainda é menor que o raio crítico (r_{c} = k/h).', why: 'Correta: abaixo do raio crítico, o ganho de área de troca supera a resistência adicional do isolante.' },
        { text: 'todo isolante aumenta a perda de calor, em qualquer espessura.', why: 'Acima do raio crítico, mais isolante reduz a perda.' },
        { text: 'a radiação deixou de existir com o isolamento.', why: 'A superfície externa continua irradiando.' },
        { text: 'a corrente elétrica no fio aumentou por causa do isolamento.', why: 'O isolamento térmico não altera a corrente.' },
        { text: 'o coeficiente de convecção externo passou a ser zero.', why: 'O ar em volta continua trocando calor por convecção.' },
      ],
      answer: 0,
      roteiro: 'raio-critico',
      steps: [
        'Cilindro: r_{c} = k/h.',
        'Fio de diâmetro pequeno: o raio externo do isolante ainda é menor que r_{c}.',
        'Mais isolante dá mais área de convecção, que vence a resistência de condução: a perda **aumenta**.',
      ],
      explanation: 'Em geometrias cilíndricas, o isolante tem dois efeitos: aumenta a resistência de condução e **aumenta a área externa** (reduz R_{conv}). Enquanto r < r_{c} = k/h, o segundo efeito vence e a perda **aumenta**. Em fios elétricos isso é até desejável (ajuda a dissipar calor).',
    },
    {
      id: 'mec-cal-08',
      difficulty: 1,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'A emissividade (ε) de uma superfície real, que indica o quanto ela emite em relação a um corpo negro na mesma temperatura, está sempre no intervalo',
      shuffle: false,
      options: [
        { text: '−1 ≤ ε ≤ 1', why: 'Emissividade negativa não tem sentido físico: seria "absorver" ao emitir.' },
        { text: '0 ≤ ε ≤ 0,5', why: 'Muitas superfícies passam de 0,5 (água, tinta, pele: acima de 0,8).' },
        { text: '0 ≤ ε ≤ 1', why: 'Correta: 0 para um refletor perfeito e 1 para o corpo negro.' },
        { text: '1 ≤ ε ≤ 2', why: 'Nenhuma superfície emite mais que o corpo negro.' },
        { text: '0 ≤ ε ≤ 100', why: 'ε é uma fração (0 a 1), não um número em escala de 0 a 100.' },
      ],
      answer: 2,
      roteiro: 'radiacao',
      steps: [
        'A emissividade compara a superfície com o corpo negro, na mesma temperatura.',
        'ε = emissão real ÷ emissão do corpo negro; o corpo negro é o máximo (ε = 1).',
        'Fica **0 ≤ ε ≤ 1**.',
      ],
      explanation: 'ε = emissão real ÷ emissão do corpo negro na mesma temperatura. O corpo negro (ε = 1) é o emissor ideal; superfícies polidas ficam perto de 0 (alumínio ≈ 0,05). Logo, **0 ≤ ε ≤ 1**.',
    },
    {
      id: 'mec-cal-09',
      type: 'gen',
      difficulty: 1,
      lessonRef: 1,
      title: 'Gradiente de temperatura numa parede',
      roteiro: 'conducao-parede',
      generate(rng) {
        const L = pickOne(rng, [0.2, 0.25, 0.4, 0.5]);
        const T1 = pickOne(rng, [100, 120, 150, 180]);
        const T2 = pickOne(rng, [20, 40, 60]);
        const g = (T1 - T2) / L;
        const { options, answer } = numericOptions({
          correct: g,
          unit: '°C/m',
          digits: 1,
          correctWhy: `Perfil linear: |dT/dx| = ΔT/L = (${T1} − ${T2})/${fmt(L)} = ${fmt(g, 1)} °C/m.`,
          distractors: [
            { value: (T1 - T2) * L, why: 'Multiplicou pela espessura: o gradiente é ΔT **dividido** por L.' },
            { value: T1 - T2, why: 'Essa é a diferença de temperatura, não o gradiente (falta dividir pela espessura).' },
            { value: (T1 - T2) / (L * 100), why: 'Passou a espessura para centímetros: o resultado ficaria em °C/cm.' },
            { value: T1 / L, why: 'Usou só a temperatura da face quente.' },
          ],
        });
        return {
          prompt: `Uma parede plana de **${fmt(L)} m** de espessura, em regime permanente e sem geração de calor, tem as faces a **${T1} °C** e **${T2} °C**. O módulo do gradiente de temperatura na direção do fluxo de calor é, em °C/m,`,
          options,
          answer,
          hint: 'Sem geração e com k constante, o perfil é uma reta: o gradiente é constante.',
          steps: [
            { do: 'Sem geração e com k constante, o perfil na parede plana é uma reta.', show: `O gradiente é o mesmo em toda a espessura.` },
            { do: 'Gradiente = variação de temperatura ÷ espessura.', show: `(${T1} − ${T2})/${fmt(L)}.` },
            { do: 'Calcule o módulo (a temperatura cai no sentido do fluxo).', show: `**${fmt(g, 1)} °C/m**.` },
          ],
          explanation: `Em regime permanente, sem geração, o perfil na parede plana é **linear**: dT/dx = −ΔT/L = −(${T1} − ${T2})/${fmt(L)} = −${fmt(g, 1)} °C/m. O módulo é **${fmt(g, 1)} °C/m** (a temperatura cai no sentido do fluxo de calor).`,
        };
      },
    },
    {
      id: 'mec-cal-10',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Condutividade a partir do fluxo',
      roteiro: 'conducao-parede',
      generate(rng) {
        const L = pickOne(rng, [0.02, 0.03, 0.05, 0.1]);
        const dT = pickOne(rng, [10, 20, 30, 40]);
        const k = pickOne(rng, [0.04, 0.05, 0.08, 0.12, 0.2, 0.5]);
        const q = (k * dT) / L;
        const { options, answer } = numericOptions({
          correct: k,
          unit: 'W/(m·°C)',
          digits: 3,
          correctWhy: `k = q″·L/ΔT = ${fmt(q, 1)} × ${fmt(L)}/${dT} = ${fmt(k, 3)} W/(m·°C).`,
          distractors: [
            { value: q / (dT * L), why: 'Dividiu pela espessura: k = q″·L/ΔT.' },
            { value: (q * dT) / L, why: 'Inverteu a fórmula toda.' },
            { value: (q * L * 100) / dT, why: 'Usou a espessura em centímetros.' },
            { value: q / dT, why: 'Esqueceu a espessura.' },
          ],
        });
        return {
          prompt: `Um fluxo de calor de **${fmt(q, 1)} W/m²** atravessa, em regime permanente, uma placa de **${fmt(L * 100)} cm** de espessura cujas faces diferem de **${dT} °C**. A condutividade térmica do material é, em W/(m·°C),`,
          options,
          answer,
          hint: 'q″ = k·ΔT/L → k = q″·L/ΔT, com L em metros.',
          steps: [
            `Uma camada: q″ = k·ΔT/L.`,
            `k = q″·L/ΔT, com L = ${fmt(L * 100)} cm = ${fmt(L)} m.`,
            `k = ${fmt(q, 1)} × ${fmt(L)}/${dT} = **${fmt(k, 3)} W/(m·°C)**.`,
          ],
          explanation: `Fourier: q″ = k·ΔT/L → k = q″·L/ΔT = ${fmt(q, 1)} × ${fmt(L)}/${dT} = **${fmt(k, 3)} W/(m·°C)**.`,
        };
      },
    },
    {
      id: 'mec-cal-11',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Placa ao sol dissipando por convecção',
      roteiro: 'conveccao',
      generate(rng) {
        const h = pickOne(rng, [10, 13, 20, 25]);
        const rise = pickOne(rng, [20, 30, 40, 50]);
        const qs = h * rise;
        const Tinf = pickOne(rng, [20, 25, 30]);
        const Ts = Tinf + rise;
        const { options, answer } = numericOptions({
          correct: Ts,
          unit: '°C',
          digits: 1,
          correctWhy: `q″ = h·(T_{s} − T_{∞}) → T_{s} = ${Tinf} + ${qs}/${h} = ${fmt(Ts, 1)} °C.`,
          distractors: [
            { value: rise, why: 'Esse é só o aumento de temperatura (T_{s} − T_{∞}); falta somar a temperatura do ar.' },
            { value: Tinf + rise / 2, why: 'Dividiu o calor pelas duas faces, mas uma delas é isolada.' },
            { value: Tinf - rise, why: 'Subtraiu: a placa recebe calor do sol, então fica **mais quente** que o ar.' },
            { value: Tinf + qs / (h * 10), why: 'Errou a ordem de grandeza na divisão q″/h.' },
          ],
        });
        return {
          prompt: `Uma placa fina absorve **${qs} W/m²** de radiação solar numa face e dissipa esse calor só por convecção para o ar a **${Tinf} °C**; a outra face é isolada. Com **h = ${h} W/(m²·°C)** e em regime permanente, a temperatura da placa é, em °C,`,
          options,
          answer,
          hint: 'Tudo o que entra (sol) sai por convecção: q″ = h·(T_{s} − T_{∞}).',
          steps: [
            `Entram ${qs} W/m² de sol; saem por convecção para o ar a ${Tinf} °C.`,
            `${qs} = ${h}·(T_{s} − ${Tinf}).`,
            `T_{s} − ${Tinf} = ${fmt(rise)} °C → **T_{s} = ${fmt(Ts, 1)} °C**.`,
          ],
          explanation: `Balanço na placa (regime permanente): calor absorvido = calor convectado.\n\n${qs} = ${h}·(T_{s} − ${Tinf}) → T_{s} − ${Tinf} = ${fmt(rise)} °C → **T_{s} = ${fmt(Ts, 1)} °C**.`,
        };
      },
    },
    {
      id: 'mec-cal-12',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Parede com convecção num dos lados',
      roteiro: 'conducao-parede',
      generate(rng) {
        const T1 = pickOne(rng, [100, 120, 150]);
        const Tinf = pickOne(rng, [20, 25, 30]);
        const L = pickOne(rng, [0.1, 0.2]);
        const k = pickOne(rng, [0.8, 1.6, 2]);
        const h = pickOne(rng, [10, 20, 25]);
        const R = L / k + 1 / h;
        const q = (T1 - Tinf) / R;
        const { options, answer } = numericOptions({
          correct: q,
          unit: 'W/m²',
          digits: 1,
          correctWhy: `q″ = (T₁ − T_{∞})/(L/k + 1/h) = ${T1 - Tinf}/(${fmt(L / k, 4)} + ${fmt(1 / h, 4)}) = ${fmt(q, 1)} W/m².`,
          distractors: [
            { value: (k * (T1 - Tinf)) / L, why: 'Considerou só a condução: a convecção também resiste (1/h).' },
            { value: h * (T1 - Tinf), why: 'Considerou só a convecção: a parede também resiste (L/k).' },
            { value: (T1 - Tinf) * (k / L + h), why: 'Somou condutâncias, como em paralelo; parede e convecção estão em **série**.' },
            { value: (T1 - Tinf) / (L * k + 1 / h), why: 'Escreveu a resistência da parede como L·k; o certo é L/k.' },
          ],
        });
        return {
          prompt: `Uma face de uma parede plana (L = **${fmt(L)} m**, k = **${fmt(k, 1)} W/(m·°C)**) é mantida a **${T1} °C**; a outra troca calor por convecção com o ar a **${Tinf} °C**, com **h = ${h} W/(m²·°C)**. O fluxo de calor unidimensional, em W/m², é`,
          options,
          answer,
          hint: 'Duas resistências em série por m²: L/k (parede) e 1/h (convecção).',
          steps: [
            `R = L/k + 1/h = ${fmt(L / k, 4)} + ${fmt(1 / h, 4)} = ${fmt(R, 4)} m²·°C/W.`,
            `q″ = (${T1} − ${Tinf})/${fmt(R, 4)}.`,
            `q″ = **${fmt(q, 1)} W/m²**.`,
          ],
          explanation: `Por unidade de área: R = L/k + 1/h = ${fmt(L / k, 4)} + ${fmt(1 / h, 4)} = ${fmt(R, 4)} m²·°C/W.\n\nq″ = ΔT/R = (${T1} − ${Tinf})/${fmt(R, 4)} = **${fmt(q, 1)} W/m²**.`,
        };
      },
    },
    {
      id: 'mec-cal-13',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Raio crítico de isolamento',
      roteiro: 'raio-critico',
      generate(rng) {
        const k = pickOne(rng, [0.04, 0.05, 0.1, 0.2]);
        const h = pickOne(rng, [2, 4, 5, 8, 10]);
        const rc = (k / h) * 1000; // mm
        const D = pickOne(rng, [10, 12.7, 20]);
        const t = rc - D / 2;
        const { options, answer } = numericOptions({
          correct: rc,
          unit: 'mm',
          digits: 1,
          correctWhy: `r_{c} = k/h = ${fmt(k, 2)}/${h} = ${fmt(k / h, 4)} m = ${fmt(rc, 1)} mm.`,
          distractors: [
            { value: (2 * k * 1000) / h, why: 'Esse é o raio crítico da **esfera** (2k/h); para o cilindro é k/h.' },
            { value: h / k, why: 'Inverteu a razão: r_{c} = k/h (e h/k nem tem unidade de comprimento).' },
            { value: rc / 2, why: 'Dividiu por 2 sem motivo.' },
            { value: Math.abs(t), why: 'Essa é a **espessura** crítica (r_{c} − raio do tubo), não o raio.' },
          ],
        });
        return {
          prompt: `Um tubo de **${fmt(D, 1)} mm** de diâmetro externo vai receber um isolante de condutividade **k = ${fmt(k, 2)} W/(m·K)**. A superfície externa perde calor por convecção natural com **h = ${h} W/(m²·K)**. O **raio crítico** de isolamento é, em mm,`,
          options,
          answer,
          hint: 'Cilindro: r_{c} = k/h.',
          steps: [
            `r_{c} = k/h = ${fmt(k, 2)}/${h} = ${fmt(k / h, 4)} m = **${fmt(rc, 1)} mm**.`,
            `Raio do tubo: ${fmt(D / 2, 2)} mm.`,
            `${t > 0 ? `Isolantes de até ${fmt(t, 1)} mm de espessura **aumentam** a perda; acima disso, reduzem.` : 'O tubo já passa de r_{c}: qualquer isolante reduz a perda.'}`,
          ],
          explanation: `Raio crítico do cilindro: r_{c} = k/h = ${fmt(k, 2)}/${h} = ${fmt(k / h, 4)} m = **${fmt(rc, 1)} mm**.\n\n${t > 0 ? `Como o tubo tem raio ${fmt(D / 2, 2)} mm, isolantes com espessura até ${fmt(t, 1)} mm **aumentam** a perda de calor; acima disso, passam a reduzir.` : `Como o raio do tubo (${fmt(D / 2, 2)} mm) já é maior que r_{c}, qualquer isolante reduz a perda.`}`,
        };
      },
    },
    {
      id: 'mec-cal-14',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'O coeficiente de transferência de calor por convecção h, da lei de resfriamento de Newton, **não** é uma propriedade termodinâmica do fluido. Ele é um parâmetro que',
      options: [
        { text: 'depende das condições da camada-limite: geometria da superfície, natureza do escoamento e propriedades do fluido.', why: 'Correta: o mesmo ar dá h = 5 parado e h = 100 soprado por um ventilador.' },
        { text: 'depende só da temperatura do fluido, como a viscosidade.', why: 'Velocidade e geometria pesam muito mais.' },
        { text: 'é constante para cada fluido e tabelado como a massa específica.', why: 'Não existe "h do ar" tabelado: ele muda com o escoamento.' },
        { text: 'inclui a emissividade da superfície e a troca por radiação.', why: 'Radiação é tratada à parte (Stefan-Boltzmann); quando combinada, usa-se um h de radiação separado.' },
        { text: 'só existe na convecção natural.', why: 'Existe na natural e na forçada.' },
      ],
      answer: 0,
      roteiro: 'conveccao',
      steps: [
        'Lei de Newton: q = h·A·(T_{s} − T_{∞}).',
        'h resume a camada-limite — velocidade, regime, geometria e propriedades do fluido — e vem de correlações com Nusselt.',
        'Fica **depende das condições da camada-limite**.',
      ],
      explanation: 'q = h·A·(T_{s} − T_{∞}): o h resume tudo o que acontece na **camada-limite** — velocidade, regime (laminar ou turbulento), geometria, propriedades do fluido. Por isso ele é obtido por correlações empíricas em função de Re, Pr, Gr (via Nusselt), e não de uma tabela de propriedades.',
    },
    {
      id: 'mec-cal-15',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'O número adimensional que representa a transferência de calor por **convecção** numa superfície — e que equivale ao gradiente de temperatura adimensional na superfície — é o número de',
      options: [
        { text: 'Nusselt', why: 'Correta: Nu = h·L/k compara a convecção com a condução pura através do fluido.' },
        { text: 'Prandtl', why: 'Pr = ν/α é uma propriedade do fluido (difusão de quantidade de movimento ÷ difusão de calor).' },
        { text: 'Grashof', why: 'Gr compara empuxo e forças viscosas (convecção natural).' },
        { text: 'Rayleigh', why: 'Ra = Gr·Pr decide quando a convecção natural começa ou fica turbulenta.' },
        { text: 'Reynolds', why: 'Re = inércia/viscosas: regime do escoamento, não a troca de calor em si.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: adimensional da **convecção** na superfície.',
        'Nu = h·L/k: quantas vezes a convecção supera a condução pelo fluido parado; as correlações são Nu = f(Re, Pr) ou f(Gr, Pr).',
        'Fica **Nusselt**. Prandtl, Grashof e Rayleigh entram nas correlações; Reynolds é do escoamento.',
      ],
      explanation: '**Nusselt**, Nu = h·L/k: quantas vezes a convecção supera a condução pelo fluido parado. As correlações de convecção têm a forma Nu = f(Re, Pr) (forçada) ou Nu = f(Gr, Pr) = f(Ra) (natural). Daí se tira h.',
    },
    {
      id: 'mec-cal-16',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Uma esfera oca, de condutividade constante, troca calor entre um fluido interno e um externo. Em regime permanente, sem geração de calor e com transferência apenas radial, a equação do calor adequada é',
      options: [
        { text: '(1/r²)·d/dr(r²·dT/dr) = 0', why: 'Correta: é a forma esférica — o perfil resultante varia com 1/r.' },
        { text: 'd²T/dx² = 0', why: 'Essa é a da parede plana (perfil linear).' },
        { text: '(1/r)·d/dr(r·dT/dr) = 0', why: 'Essa é a do cilindro (perfil logarítmico).' },
        { text: '(1/r²)·d/dr(r²·dT/dr) = q_{ger}/k', why: 'O enunciado diz **sem** geração de calor (e o sinal seria negativo).' },
        { text: '(1/r²)·d/dr(r²·dT/dr) = (1/α)·∂T/∂t', why: 'Essa é transiente; o enunciado diz regime permanente.' },
      ],
      answer: 0,
      roteiro: 'equacao-calor',
      steps: [
        'Esfera oca, transferência só radial.',
        'Regime permanente e sem geração: o lado direito é zero.',
        'Fica **(1/r²)·d/dr(r²·dT/dr) = 0**.',
      ],
      explanation: 'Na esfera, a área atravessada pelo calor cresce com r²: em regime permanente, q = −k·4πr²·dT/dr é constante → **d/dr(r²·dT/dr) = 0**. Integrando, T(r) = C₁/r + C₂. Plano: d²T/dx² = 0; cilindro: d/dr(r·dT/dr) = 0.',
    },
    {
      id: 'mec-cal-17',
      type: 'gen',
      difficulty: 3,
      lessonRef: 5,
      title: 'Calor numa face a partir do perfil T(x)',
      roteiro: 'equacao-calor',
      generate(rng) {
        const a = pickOne(rng, [300, 400, 600]);
        const b = pickOne(rng, [-300, -200, -150]);
        const c = pickOne(rng, [-50, 40, 60, 80]);
        const L = pickOne(rng, [0.5, 1]);
        const k = pickOne(rng, [20, 40]);
        const A = pickOne(rng, [5, 10]);
        const atL = rng() < 0.5;
        const x = atL ? L : 0;
        const dTdx = b + 2 * c * x;
        const q = -k * A * dTdx;
        const { options, answer } = numericOptions({
          correct: q / 1000,
          unit: 'kW',
          digits: 2,
          correctWhy: `dT/dx = b + 2c·x = ${b} + 2·(${c})·${fmt(x)} = ${fmt(dTdx)} °C/m; q = −k·A·dT/dx = ${fmt(q / 1000, 2)} kW.`,
          distractors: [
            { value: (-k * A * b) / 1000, why: 'Usou a derivada em x = 0; a pergunta é sobre a face x = L.' },
            { value: (-k * A * (b + 2 * c * L)) / 1000, why: 'Usou a derivada em x = L; a pergunta é sobre a face x = 0.' },
            { value: (-k * A * (b + c * x)) / 1000, why: 'Derivou c·x² como c·x (faltou o 2).' },
            { value: (k * A * dTdx) / 1000, why: 'Esqueceu o sinal de Fourier (q = −k·A·dT/dx).' },
            { value: (-k * dTdx) / 1000, why: 'Esqueceu a área: isso é o fluxo em kW/m².' },
          ],
        });
        return {
          prompt: `Numa parede de **${fmt(L)} m** de espessura e **${A} m²** de área, com k = **${k} W/(m·°C)**, a distribuição de temperatura num instante é **T(x) = ${a} ${b < 0 ? '−' : '+'} ${Math.abs(b)}·x ${c < 0 ? '−' : '+'} ${Math.abs(c)}·x²** (T em °C, x em m). A taxa de calor que atravessa a face **x = ${atL ? fmt(L) + ' m' : '0'}**, no sentido de x positivo, é, em kW,`,
          options,
          answer,
          hint: 'Derive T(x), calcule a derivada na face e use q = −k·A·dT/dx.',
          steps: [
            { do: 'Escreva a lei de Fourier para a face: q = −k·A·dT/dx.', show: `Parede plana, k = ${k} W/(m·°C), A = ${A} m².` },
            { do: 'Derive T(x) e calcule a derivada na face pedida.', show: `dT/dx = ${fmt(b)} + 2·(${fmt(c)})·x → em x = ${fmt(x)}: ${fmt(dTdx)} °C/m.` },
            { do: 'Multiplique e confira o sinal (positivo = no sentido de x).', show: `q = −${k} × ${A} × (${fmt(dTdx)}) = ${fmt(q)} W = **${fmt(q / 1000, 2)} kW**.` },
          ],
          explanation: `Fourier: q = −k·A·dT/dx, com dT/dx = ${b} + 2·(${c})·x.\n\nEm x = ${fmt(x)}: dT/dx = ${fmt(dTdx)} °C/m → q = −${k} × ${A} × (${fmt(dTdx)}) = ${fmt(q)} W = **${fmt(q / 1000, 2)} kW**.`,
        };
      },
    },
    {
      id: 'mec-cal-18',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Sobre radiação térmica, todas as afirmativas abaixo estão corretas, **EXCETO**:',
      options: [
        { text: 'Um corpo cinzento real pode ter emissividade maior que 1 em temperaturas elevadas.', why: 'Correta (é a falsa): nenhuma superfície emite mais que o corpo negro na mesma temperatura — ε ≤ 1 sempre.' },
        { text: 'Um corpo negro absorve toda a radiação que incide sobre ele.', why: 'Verdadeira: é a definição de corpo negro.' },
        { text: 'Superfícies metálicas polidas têm emissividade baixa.', why: 'Verdadeira: folha de alumínio ≈ 0,05.' },
        { text: 'A potência emitida por um corpo negro é proporcional à quarta potência da temperatura absoluta.', why: 'Verdadeira: lei de Stefan-Boltzmann, E = σ·T^{4}.' },
        { text: 'Para uma superfície cinzenta em equilíbrio, a absortividade é igual à emissividade.', why: 'Verdadeira: lei de Kirchhoff.' },
      ],
      answer: 0,
      roteiro: 'fmt.exceto',
      steps: [
        'A banca pede a afirmação **falsa** sobre radiação.',
        'Verdadeiras: o corpo negro absorve tudo; metal polido emite pouco; E ∝ T⁴; α = ε (Kirchhoff).',
        'Falsa: **ε maior que 1** — nenhuma superfície real passa do corpo negro.',
      ],
      explanation: 'O corpo negro é o limite: **ε ≤ 1** para qualquer superfície real. As demais afirmações são verdadeiras: corpo negro absorve tudo, metal polido emite pouco, E ∝ T^{4} (Stefan-Boltzmann) e α = ε (Kirchhoff). Cuidado com o comando **EXCETO**.',
    },
    {
      id: 'mec-cal-19',
      type: 'gen',
      difficulty: 3,
      lessonRef: 1,
      title: 'Espessura do isolante de um forno',
      roteiro: 'conducao-parede',
      generate(rng) {
        const L1 = pickOne(rng, [0.2, 0.25]);
        const k1 = pickOne(rng, [1, 1.2]);
        const k2 = pickOne(rng, [0.04, 0.05, 0.06]);
        const T1 = pickOne(rng, [800, 1000, 1100]);
        const T2 = pickOne(rng, [40, 50, 60]);
        const q = pickOne(rng, [800, 1000, 1200]);
        const L2 = k2 * ((T1 - T2) / q - L1 / k1);
        const { options, answer } = numericOptions({
          correct: L2 * 1000,
          unit: 'mm',
          digits: 1,
          correctWhy: `L₂ = k₂·(ΔT/q″ − L₁/k₁) = ${fmt(k2, 2)} × (${fmt((T1 - T2) / q, 3)} − ${fmt(L1 / k1, 3)}) = ${fmt(L2 * 1000, 1)} mm.`,
          distractors: [
            { value: k2 * ((T1 - T2) / q) * 1000, why: 'Esqueceu de descontar a resistência do refratário.' },
            { value: k2 * ((T1 - T2) / q + L1 / k1) * 1000, why: 'Somou a resistência do refratário em vez de descontá-la.' },
            { value: ((T1 - T2) / q - L1 / k1) * 1000, why: 'Esqueceu de multiplicar pela condutividade do isolante (L = R·k).' },
            { value: (((T1 - T2) / q - L1 / k1) / k2) * 1000, why: 'Dividiu por k₂; a espessura é R₂·k₂.' },
          ],
        });
        return {
          prompt: `A parede de um forno tem **${fmt(L1 * 100)} cm** de tijolo refratário (k = ${fmt(k1, 1)} W/m·°C) e, por fora, uma camada de isolante (k = ${fmt(k2, 2)} W/m·°C). A face interna está a **${fmt(T1)} °C** e a externa a **${T2} °C**. Para limitar a perda a **${fmt(q)} W/m²**, a espessura do isolante deve ser, em mm,`,
          options,
          answer,
          hint: 'Resistência total exigida = ΔT/q″. Desconte a do refratário; o resto é do isolante (R = L/k).',
          steps: [
            `Resistência total exigida: (${T1} − ${T2})/${q} = ${fmt((T1 - T2) / q, 3)} m²·°C/W.`,
            `Refratário: L₁/k₁ = ${fmt(L1 / k1, 3)} → sobram ${fmt((T1 - T2) / q - L1 / k1, 3)} para o isolante.`,
            `L₂ = ${fmt((T1 - T2) / q - L1 / k1, 3)} × ${fmt(k2, 2)} = **${fmt(L2 * 1000, 1)} mm**.`,
          ],
          explanation: `Resistência total exigida (por m²): (${T1} − ${T2})/${q} = ${fmt((T1 - T2) / q, 3)} m²·°C/W.\n\nRefratário: L₁/k₁ = ${fmt(L1 / k1, 3)}. Isolante: ${fmt((T1 - T2) / q - L1 / k1, 3)} m²·°C/W → L₂ = R₂·k₂ = ${fmt((T1 - T2) / q - L1 / k1, 3)} × ${fmt(k2, 2)} = **${fmt(L2 * 1000, 1)} mm**.`,
        };
      },
    },
    {
      id: 'mec-cal-20',
      type: 'gen',
      difficulty: 1,
      lessonRef: 0,
      title: 'Calor específico de um sólido',
      roteiro: 'calor-sensivel',
      generate(rng) {
        const mat = pickOne(rng, [
          { name: 'aço', c: 0.46 },
          { name: 'alumínio', c: 0.9 },
          { name: 'cobre', c: 0.385 },
        ]);
        const m = pickOne(rng, [0.5, 1, 2]);
        const dT = pickOne(rng, [20, 40, 50]);
        const Q = m * mat.c * dT;
        const { options, answer } = numericOptions({
          correct: mat.c,
          unit: 'kJ/(kg·K)',
          digits: 3,
          correctWhy: `c = Q/(m·ΔT) = ${fmt(Q, 2)}/(${fmt(m)} × ${dT}) = ${fmt(mat.c, 3)} kJ/(kg·K).`,
          distractors: [
            { value: Q / m, why: 'Esqueceu de dividir pela variação de temperatura.' },
            { value: Q / dT, why: 'Esqueceu de dividir pela massa: isso é a capacidade térmica (kJ/K).' },
            { value: (Q * m) / dT, why: 'Multiplicou pela massa em vez de dividir.' },
            { value: mat.c * 1000, why: 'Converteu para J/(kg·K) sem trocar a unidade.' },
          ],
        });
        return {
          prompt: `Um bloco de ${mat.name} de **${fmt(m)} kg** recebe **${fmt(Q, 2)} kJ** de calor e sua temperatura sobe **${dT} °C**, sem mudança de fase. O calor específico do material é, em kJ/(kg·K),`,
          options,
          answer,
          hint: 'Calor sensível: Q = m·c·ΔT.',
          steps: [
            `Q = m·c·ΔT, sem mudança de fase.`,
            `c = ${fmt(Q, 2)}/(${fmt(m)} × ${dT}).`,
            `c = **${fmt(mat.c, 3)} kJ/(kg·K)** — típico do ${mat.name}.`,
          ],
          explanation: `Q = m·c·ΔT → c = Q/(m·ΔT) = ${fmt(Q, 2)}/(${fmt(m)} × ${dT}) = **${fmt(mat.c, 3)} kJ/(kg·K)** — valor típico do ${mat.name}. (Num gráfico energia × temperatura, c = inclinação ÷ massa.)`,
        };
      },
    },
    {
      id: 'mec-cal-21',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Num trocador de calor, o fluido quente tem taxa de capacidade térmica (ṁ·c_{p}) **muito maior** que a do fluido frio. Nessas condições, ao longo do trocador,',
      options: [
        { text: 'a temperatura do fluido quente permanece praticamente constante, e a do frio sobe.', why: 'Correta: q = C·ΔT — com C enorme, o mesmo calor quase não muda a temperatura do quente.' },
        { text: 'as duas temperaturas variam igualmente.', why: 'Isso aconteceria com capacidades térmicas iguais.' },
        { text: 'a temperatura do fluido frio permanece constante.', why: 'É o fluido de C **maior** que quase não varia — aqui, o quente.' },
        { text: 'o fluido frio sempre sai mais quente que a entrada do quente.', why: 'Impossível: violaria a 2ª lei.' },
        { text: 'não há troca de calor, porque as capacidades são diferentes.', why: 'Há troca normalmente.' },
      ],
      answer: 0,
      roteiro: 'trocador',
      steps: [
        'Balanço: q = C_{q}·ΔT_{q} = C_{f}·ΔT_{f}.',
        'C_{q} muito maior que C_{f} → ΔT_{q} muito menor que ΔT_{f}.',
        'Fica **o quente quase constante e o frio subindo** — como num condensador.',
      ],
      explanation: 'Pelo balanço, q = C_{q}·ΔT_{q} = C_{f}·ΔT_{f}. Se C_{q} ≫ C_{f}, então ΔT_{q} ≪ ΔT_{f}: a temperatura do quente fica quase **constante** — o mesmo que acontece num **condensador**, onde o vapor muda de fase a temperatura fixa (C → ∞).',
    },
    {
      id: 'mec-cal-22',
      type: 'gen',
      difficulty: 2,
      lessonRef: 6,
      title: 'Vazão de água num condensador',
      roteiro: 'trocador',
      generate(rng) {
        const ms = pickOne(rng, [1, 2, 3]);
        const hlv = 2392;
        const dT = pickOne(rng, [8, 10, 12]);
        const cp = 4.18;
        const mw = (ms * hlv) / (cp * dT);
        const { options, answer } = numericOptions({
          correct: mw,
          unit: 'kg/s',
          digits: 1,
          correctWhy: `ṁ_{a} = ṁ_{v}·h_{lv}/(c_{p}·ΔT) = ${ms} × ${fmt(hlv)}/(${fmt(cp, 2)} × ${dT}) = ${fmt(mw, 1)} kg/s.`,
          distractors: [
            { value: (ms * hlv) / cp, why: 'Esqueceu o ΔT da água.' },
            { value: (ms * cp * dT) / hlv, why: 'Inverteu o balanço.' },
            { value: (ms * hlv) / (cp * (20 + dT)), why: 'Usou a temperatura de saída da água no lugar da variação.' },
            { value: (ms * hlv) / (dT * 1), why: 'Esqueceu o calor específico da água.' },
          ],
        });
        return {
          prompt: `Um condensador recebe **${ms} kg/s** de vapor saturado a 10 kPa, que sai como líquido saturado (h_{lv} = ${fmt(hlv)} kJ/kg). A água de resfriamento entra a 20 °C e sai a **${20 + dT} °C** (c_{p} = ${fmt(cp, 2)} kJ/kg·K). Desprezando perdas para o ambiente, a vazão de água de resfriamento é, em kg/s,`,
          options,
          answer,
          hint: 'Calor cedido pelo vapor (ṁ·h_{lv}) = calor recebido pela água (ṁ·c_{p}·ΔT).',
          steps: [
            `Vapor: ${ms} × ${fmt(hlv)} = ${fmt(ms * hlv)} kW cedidos.`,
            `Água: ${fmt(ms * hlv)} = ṁ_{a} × ${fmt(cp, 2)} × ${dT}.`,
            `ṁ_{a} = **${fmt(mw, 1)} kg/s** — dezenas de vezes a vazão de vapor.`,
          ],
          explanation: `Calor rejeitado: ${ms} × ${fmt(hlv)} = ${fmt(ms * hlv)} kW.\n\nÁgua: ṁ_{a} = ${fmt(ms * hlv)}/(${fmt(cp, 2)} × ${dT}) = **${fmt(mw, 1)} kg/s** — dezenas de vezes a vazão de vapor. É por isso que as usinas ficam perto de rios, lagos ou do mar.`,
        };
      },
    },
    {
      id: 'mec-cal-23',
      type: 'gen',
      difficulty: 3,
      lessonRef: 6,
      title: 'Efetividade de um condensador (ε-NUT)',
      roteiro: 'trocador',
      generate(rng) {
        const Tsat = pickOne(rng, [60, 80, 100]);
        const Tin = pickOne(rng, [20, 25]);
        const nut = pickOne(rng, [1, 2]);
        const e = nut === 1 ? 0.368 : 0.135;
        const eff = 1 - e;
        const Tout = Tin + eff * (Tsat - Tin);
        const { options, answer } = numericOptions({
          correct: Tout,
          unit: '°C',
          digits: 1,
          correctWhy: `ε = 1 − e^{−NUT} = ${fmt(eff, 3)} → T_{saída} = ${Tin} + ${fmt(eff, 3)} × (${Tsat} − ${Tin}) = ${fmt(Tout, 1)} °C.`,
          distractors: [
            { value: Tin + e * (Tsat - Tin), why: 'Usou e^{−NUT} como efetividade; ε = 1 − e^{−NUT}.' },
            { value: Tsat, why: 'Com área finita, a água não chega à temperatura do vapor.' },
            { value: Tin + (Tsat - Tin) / 2, why: 'Chutou ε = 50%; para um condensador, ε = 1 − e^{−NUT}.' },
            { value: Tsat - eff * (Tsat - Tin), why: 'Aplicou a efetividade a partir da temperatura do vapor.' },
          ],
        });
        return {
          prompt: `Num condensador, o vapor condensa a **${Tsat} °C** enquanto a água de resfriamento entra a **${Tin} °C**. O trocador tem **NUT = ${nut}**. Como um dos fluidos muda de fase, ε = 1 − e^{−NUT} (use e^{−1} = 0,368 e e^{−2} = 0,135). A temperatura de saída da água é, em °C,`,
          options,
          answer,
          hint: 'q = ε·q_{máx} com q_{máx} = C_{água}·(T_{sat} − T_{entrada}). Logo ΔT_{água} = ε·(T_{sat} − T_{entrada}).',
          steps: [
            `Mudança de fase: a água poderia, no máximo, chegar a ${Tsat} °C (ΔT_{máx} = ${Tsat - Tin} °C).`,
            `ε = 1 − e^{−${nut}} = ${fmt(eff, 3)}.`,
            `ΔT = ${fmt(eff, 3)} × ${Tsat - Tin} = ${fmt(eff * (Tsat - Tin), 1)} °C → **${fmt(Tout, 1)} °C**.`,
          ],
          explanation: `ε = 1 − e^{−${nut}} = ${fmt(eff, 3)}.\n\nO máximo que a água poderia esquentar é até ${Tsat} °C (ΔT_{máx} = ${Tsat - Tin} °C). Ela sobe ε × ΔT_{máx} = ${fmt(eff * (Tsat - Tin), 1)} °C → **${fmt(Tout, 1)} °C**. Com mudança de fase, a efetividade não depende do arranjo (paralelo, contracorrente, casco e tubos).`,
        };
      },
    },
    {
      id: 'mec-cal-24',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      shuffle: false,
      prompt: 'Analise as afirmativas sobre trocadores de calor.\n\nI – No arranjo em contracorrente, a temperatura de saída do fluido frio pode superar a temperatura de saída do fluido quente.\nII – A incrustação nos tubos aumenta o coeficiente global de transferência de calor U.\nIII – Quando um dos fluidos condensa a temperatura constante, a efetividade não depende do arranjo das correntes.\n\nEstá correto o que se afirma em',
      options: [
        { text: 'I, apenas', why: 'III também está correta.' },
        { text: 'II, apenas', why: 'II é falsa: a incrustação **reduz** U.' },
        { text: 'I e III, apenas', why: 'Correta.' },
        { text: 'II e III, apenas', why: 'II é falsa.' },
        { text: 'I, II e III', why: 'II é falsa: a incrustação é uma resistência a mais.' },
      ],
      answer: 2,
      roteiro: 'fmt.afirmativas',
      steps: [
        'I – **Correta**: na contracorrente, a saída fria fica do lado da entrada quente (cruzamento de temperaturas).',
        'II – **Errada**: a incrustação soma resistência e **reduz** U.',
        'III – **Correta**: com mudança de fase (C_{r} = 0), ε = 1 − e^{−NUT} em qualquer arranjo.',
        'Certas: I e III → "I e III, apenas".',
      ],
      explanation: '**I** – Correta: na contracorrente a saída fria fica do lado da entrada quente (cruzamento de temperaturas). **II** – Errada: incrustação soma resistência (fator de incrustação) e **reduz** U. **III** – Correta: com C_{r} = 0 (mudança de fase), ε = 1 − e^{−NUT} para qualquer arranjo.',
    },
    {
      id: 'mec-cal-25',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Troca líquida por radiação',
      roteiro: 'radiacao',
      generate(rng) {
        const eps = pickOne(rng, [0.5, 0.8, 0.9]);
        const A = pickOne(rng, [1, 2]);
        const Ts = pickOne(rng, [400, 500, 600]);
        const Tv = 300;
        const sigma = 5.67e-8;
        const q = eps * sigma * A * (Ts ** 4 - Tv ** 4);
        const { options, answer } = numericOptions({
          correct: q,
          unit: 'W',
          digits: 0,
          correctWhy: `q = ε·σ·A·(T_{s}⁴ − T_{viz}⁴) = ${fmt(eps)} × 5,67×10⁻⁸ × ${A} × (${Ts}⁴ − ${Tv}⁴) = ${fmt(q, 0)} W.`,
          distractors: [
            { value: eps * sigma * A * Ts ** 4, why: 'Esqueceu a radiação que a superfície **recebe** da vizinhança (T_{viz}⁴).' },
            { value: eps * sigma * A * (Ts - Tv) ** 4, why: 'Elevou a **diferença** à quarta; o certo é a diferença das quartas potências.' },
            { value: eps * sigma * A * ((Ts - 273) ** 4 - (Tv - 273) ** 4), why: 'Usou °C: Stefan-Boltzmann exige kelvin.' },
            { value: sigma * A * (Ts ** 4 - Tv ** 4), why: 'Esqueceu a emissividade (tratou como corpo negro).' },
          ],
        });
        return {
          prompt: `Uma superfície de **${A} m²**, com emissividade **${fmt(eps)}**, está a **${Ts} K** num ambiente grande cujas paredes estão a **${Tv} K**. Com σ = 5,67 × 10^{−8} W/(m²·K⁴), a taxa líquida de calor perdida por radiação é, aproximadamente, em W,`,
          options,
          answer,
          hint: 'q = ε·σ·A·(T_{s}⁴ − T_{viz}⁴), em kelvin.',
          steps: [
            `T_{s} = ${Ts} K; T_{viz} = ${Tv} K (já em kelvin).`,
            `T_{s}⁴ − T_{viz}⁴ = ${fmt(Ts ** 4, 0)} − ${fmt(Tv ** 4, 0)} = ${fmt(Ts ** 4 - Tv ** 4, 0)} K⁴.`,
            `q = ${fmt(eps)} × 5,67 × 10⁻⁸ × ${A} × ${fmt(Ts ** 4 - Tv ** 4, 0)} ≈ **${fmt(q, 0)} W**.`,
          ],
          explanation: `T_{s}⁴ − T_{viz}⁴ = ${fmt(Ts ** 4, 0)} − ${fmt(Tv ** 4, 0)} = ${fmt(Ts ** 4 - Tv ** 4, 0)} K⁴.\n\nq = ${fmt(eps)} × 5,67×10⁻⁸ × ${A} × ${fmt(Ts ** 4 - Tv ** 4, 0)} ≈ **${fmt(q, 0)} W**.`,
        };
      },
    },
  ],
  games: [
    {
      id: 'mec-cal-g1',
      type: 'sort',
      title: 'Condução, convecção ou radiação?',
      intro: 'Qual mecanismo de transferência de calor domina em cada situação?',
      lessonRef: 0,
      bins: ['Condução', 'Convecção', 'Radiação'],
      items: [
        { text: 'Cabo metálico da panela esquentando', bin: 0, why: 'Calor passando pelo sólido, de molécula em molécula.' },
        { text: 'Ar quente subindo de um aquecedor', bin: 1, why: 'Convecção natural: o ar aquecido fica menos denso e sobe.' },
        { text: 'Calor do Sol chegando à Terra', bin: 2, why: 'Atravessa o vácuo: só a radiação faz isso.' },
        { text: 'Ventilador resfriando um processador', bin: 1, why: 'Convecção forçada.' },
        { text: 'Calor atravessando a parede de tijolos de um forno', bin: 0, why: 'Condução através do sólido.' },
        { text: 'Calor no rosto diante de uma fogueira', bin: 2, why: 'Você sente mesmo com o ar entre vocês parado: radiação.' },
        { text: 'Fluido escoando dentro dos tubos de um trocador', bin: 1, why: 'Troca entre a parede e o fluido em movimento.' },
        { text: 'Câmera termográfica detectando um mancal quente', bin: 2, why: 'A câmera capta a radiação infravermelha emitida.' },
        { text: 'Calor ao longo de uma barra aquecida em uma ponta', bin: 0, why: 'Condução clássica (Fourier).' },
        { text: 'Brisa marítima', bin: 1, why: 'Massas de ar movidas por diferenças de temperatura.' },
        { text: 'O que o espelhamento interno da garrafa térmica bloqueia', bin: 2, why: 'A superfície refletora reduz a troca por radiação.' },
        { text: 'Água fervendo circulando na panela', bin: 1, why: 'Correntes de convecção no líquido.' },
      ],
    },
    {
      id: 'mec-cal-g2',
      type: 'match',
      title: 'Leis e expressões do calor',
      intro: 'Ligue cada lei ou grandeza à sua expressão.',
      lessonRef: 1,
      leftLabel: 'Lei / grandeza',
      rightLabel: 'Expressão',
      perRound: 6,
      pairs: [
        { left: 'Lei de Fourier', right: 'q = k·A·ΔT / L', why: 'Condução em parede plana.' },
        { left: 'Lei de Newton do resfriamento', right: 'q = h·A·(T_{s} − T_{∞})', why: 'Convecção.' },
        { left: 'Lei de Stefan-Boltzmann', right: 'q = ε·σ·A·T^{4}', why: 'Radiação (T em kelvin).' },
        { left: 'Resistência de condução', right: 'L / (k·A)', why: 'Parede plana.' },
        { left: 'Resistência de convecção', right: '1 / (h·A)', why: 'Superfície em contato com fluido.' },
        { left: 'Média logarítmica (ΔT_{ml})', right: '(ΔT₁ − ΔT₂) / ln(ΔT₁/ΔT₂)', why: 'Usada em q = U·A·ΔT_{ml}.' },
        { left: 'Número de Nusselt', right: 'h·L / k', why: 'Convecção adimensionalizada.' },
      ],
    },
    {
      id: 'mec-cal-lab1',
      type: 'lab',
      lab: 'exchanger',
      title: 'Trocador de calor',
      intro: 'Um trocador bitubular com os fluidos coloridos pela temperatura. Compare paralelo e contracorrente e veja a MLDT nascer dos perfis.',
      lessonRef: 4,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { arr: 0 },
          prompt: 'Mesmas temperaturas de entrada, mesmas vazões, mesma área. Trocando de **paralelo** para **contracorrente**, o calor trocado…',
          change: { arr: 1 },
          options: ['aumenta', 'diminui', 'não muda: a área é a mesma', 'só muda se as vazões mudarem'],
          answer: 0,
          expect: [
            { out: 'q', trend: 'up' },
            { out: 'lmtd', trend: 'up' },
          ],
          why: 'Na contracorrente o ΔT entre os fluidos fica **mais uniforme** ao longo do trocador → a **MLDT é maior** → q = U·A·MLDT cresce. Para a mesma troca, a contracorrente precisa de **menos área**.',
        },
        {
          kind: 'goal',
          setup: { arr: 0, area: 0.5 },
          lock: ['thi', 'tci'],
          prompt: 'Faça a água fria **sair mais quente do que a água quente sai** (cruzamento de temperaturas).',
          goals: [{ out: 'cross', min: 1, label: 'Saída fria acima da saída quente' }],
          hint: 'No paralelo isso é impossível. Troque o arranjo e dê área suficiente para a troca.',
          solution: { arr: 1, area: 4 },
          why: 'Na contracorrente, a saída da água fria fica do lado da **entrada** da água quente — por isso pode passar da temperatura de saída do quente. No paralelo, as duas saídas estão do mesmo lado e a fria, no máximo, se aproxima da quente.',
        },
        {
          kind: 'predict',
          setup: { arr: 0, area: 8 },
          prompt: 'No **paralelo**, mesmo com área enorme (8 m²), a temperatura de saída da água fria…',
          options: ['nunca passa da temperatura de saída da água quente', 'passa da saída quente se a área for grande o bastante', 'chega à temperatura de entrada da água quente', 'fica sempre abaixo de 50 °C'],
          answer: 0,
          why: 'Com área infinita, no paralelo as duas correntes saem **na mesma temperatura** (equilíbrio) — nunca se cruzam. Por isso a efetividade do paralelo tem teto: com capacidades iguais, ε máx = 50%.',
        },
        {
          kind: 'goal',
          setup: { arr: 0, area: 2, mc: 0.3 },
          lock: ['thi', 'tci'],
          prompt: 'Aqueça a água fria até **pelo menos 60 °C** na saída, sem mexer nas temperaturas de entrada.',
          goals: [{ out: 'tco', min: 60 }],
          hint: 'Há vários caminhos: contracorrente, mais área, menos vazão de água fria ou mais vazão de água quente.',
          solution: { arr: 1, area: 3 },
          why: 'Para esquentar mais a água fria: aumentar a MLDT (contracorrente), aumentar U·A (mais área, superfície limpa) ou mudar as capacidades térmicas (menos ṁ frio → maior ΔT da água fria; mais ṁ quente → a quente esfria menos).',
        },
        {
          kind: 'predict',
          setup: { arr: 1, foul: 0 },
          prompt: 'Com o tempo, forma-se **incrustação** nos tubos. O calor trocado…',
          change: { foul: 1 },
          options: ['diminui, porque a incrustação é uma resistência térmica a mais', 'aumenta, porque a superfície fica mais rugosa', 'não muda: só a perda de carga aumenta', 'aumenta, porque a área de troca cresce'],
          answer: 0,
          expect: [{ out: 'q', trend: 'down' }],
          why: 'A incrustação soma uma **resistência de depósito** (fator de incrustação R_{d}) à resistência total: 1/U = 1/h_{i} + R_{d} + parede + 1/h_{e}. U cai e q cai. Por isso se projeta com **sobre-área** e se limpa o trocador periodicamente.',
        },
        {
          kind: 'predict',
          setup: { arr: 1, mh: 0.3, mc: 0.3 },
          prompt: 'Contracorrente com **ṁ·cp iguais** nos dois lados. Olhe os perfis: quanto vale a MLDT?',
          options: ['O próprio ΔT, que é constante ao longo do trocador', 'A média aritmética entre a maior e a menor temperatura', 'Zero, porque as curvas são paralelas', 'Não dá para calcular: ln(ΔT₁/ΔT₂) = ln 1 = 0'],
          answer: 0,
          why: 'Com C_{q} = C_{f} na contracorrente, as retas são **paralelas**: ΔT₁ = ΔT₂ = ΔT. A fórmula vira 0/0, mas o limite é o próprio ΔT — **MLDT = ΔT**. Pegadinha clássica!',
        },
      ],
    },
  ],
});
