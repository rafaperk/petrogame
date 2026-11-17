import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

export default defineTopic({
  id: 'mec.tracao-hooke',
  name: 'Tração, compressão e Lei de Hooke',
  summary: 'Tensão normal, deformação, módulo de elasticidade, Poisson, o diagrama tensão-deformação, a tensão térmica, estruturas hiperestáticas e o estado plano de tensões (Mohr).',
  order: 3,
  weight: 3,
  equipment: 'tester',
  edital: ['b1.tracao', 'b2.ensaios', 'b1.tensoes'],
  lesson: [
    {
      title: 'Tensão normal',
      body: 'Uma força **axial** F distribuída na seção transversal A gera a **tensão normal**:\n\n**σ = F / A**\n\n- Unidade: Pa = N/m². Na prática, **MPa = N/mm²**.\n- **Tração** (σ > 0) alonga; **compressão** (σ < 0) encurta.\n- Barra circular: A = π·d²/4.',
      example: 'F = 30 kN numa barra de 200 mm²: σ = 30.000 N / 200 mm² = **150 MPa**.',
      hot: 'Força máxima numa barra de **seção variável** com tensões admissíveis diferentes em cada trecho (Petrobras 2018), barras de treliça e tirantes inclinados (Petrobras 2014, Transpetro 2011).',
      tip: 'Trabalhe em **N e mm**: a tensão sai direto em MPa.',
      trap: 'Usar o **raio** no lugar do diâmetro em π·d²/4 (ou o contrário) e errar a conversão de área (1 cm² = 100 mm²).',
    },
    {
      title: 'Deformação e Lei de Hooke',
      body: '**Deformação normal:** ε = δ / L (adimensional; às vezes em % ou mm/mm).\n\nNo regime **elástico linear** (até o limite de proporcionalidade) vale a **Lei de Hooke**:\n\n**σ = E·ε**\n\nCombinando as duas: o alongamento de uma barra é **δ = F·L / (A·E)**.\n\nMódulos de elasticidade típicos: aço ≈ **200–210 GPa**; alumínio ≈ **70 GPa**; cobre ≈ 110–120 GPa.',
      example: 'F = 20 kN, L = 2 m, A = 100 mm², E = 200 GPa:\nδ = 20.000 × 2.000 / (100 × 200.000) = **2 mm**.',
      hot: 'A lei que relaciona linearmente tensão e deformação é a de **Hooke** (Petrobras 2018); com a mesma carga e a mesma geometria, o material de **maior E** deforma **menos** (BR 2012).',
      tip: 'Com F em N, L e A em mm e E em **MPa** (200 GPa = 200.000 MPa), δ sai em mm.',
      trap: 'Esquecer que **1 GPa = 1.000 MPa** — o resultado fica mil vezes errado.',
      lab: { lab: 'tensile', preset: { mat: 0, eps: 0.1 }, label: 'Ver a reta de Hooke' },
    },
    {
      title: 'Poisson e deformação transversal',
      body: 'Quando a barra é tracionada, ela **alonga** e **afina**. O **coeficiente de Poisson** relaciona as duas deformações:\n\n**ν = − ε_{transversal} / ε_{longitudinal}**\n\n- Metais: ν ≈ 0,25 a 0,35 (aço ≈ 0,3).\n- Para materiais isotrópicos: **0 ≤ ν ≤ 0,5** (0,5 = incompressível, como a borracha).\n- Relação entre os módulos: **G = E / [2·(1 + ν)]**.',
      example: 'Aço (ν = 0,3) com ε_{long} = 0,001: ε_{trans} = −0,3 × 0,001 = **−0,0003** (o diâmetro diminui).',
      hot: 'Tensão em uma direção, deformação nas três: a Transpetro 2018 perguntou quais deformações não são nulas numa barra tracionada (todas) e a Petrobras 2012, os sinais na compressão (axial negativa, transversais positivas).',
      tip: 'Tração: **alonga e afina**. Compressão: **encurta e engorda**.',
    },
    {
      title: 'Diagrama tensão-deformação e projeto',
      body: 'No ensaio de tração aparecem:\n- **limite de proporcionalidade** (fim da reta de Hooke);\n- **limite de escoamento** (σ_{e}): começa a deformação **plástica** (permanente);\n- **limite de resistência** (σ_{r}): a maior tensão do diagrama — a partir daí ocorre a **estricção**;\n- **ruptura**.\n\nMateriais **dúcteis** (aço de baixo carbono, cobre, alumínio) deformam bastante antes de romper; **frágeis** (ferro fundido cinzento, vidro, cerâmicas) rompem quase sem deformação plástica.\n\nProjeto: **σ_{adm} = σ_{e} / FS** (dúcteis) ou **σ_{r} / FS** (frágeis), e a área mínima é **A ≥ F / σ_{adm}**.',
      hot: 'Ler no gráfico o escoamento convencional e a deformação (Transpetro 2011) e comparar o módulo de elasticidade na tração e na compressão de um material (Transpetro 2012).',
      tip: '**P**roporcionalidade → **E**scoamento → **R**esistência (máximo) → **R**uptura: "**PERR**".',
      trap: 'Dimensionar material **dúctil** pelo limite de resistência: o critério é o **escoamento** — a peça já falhou quando deforma permanentemente.',
      lab: { lab: 'tensile', preset: { mat: 0, eps: 25 }, label: 'Ver o diagrama no ensaio' },
    },
    {
      title: 'Tensão térmica',
      body: 'Uma barra livre que aquece se dilata: **δ_{T} = α·ΔT·L**. Se ela estiver **impedida** (engastada nas duas pontas), aparece uma tensão de compressão:\n\n**σ = E·α·ΔT**\n\nRepare: **não depende do comprimento nem da área**. Aço: α ≈ 12 × 10^{−6} /°C.',
      example: 'Barra de aço presa nas pontas e aquecida 50 °C: σ = 200.000 MPa × 12 × 10^{−6} × 50 = **120 MPa** (compressão).',
      trap: 'Achar que uma barra mais curta ou mais grossa sofre tensão térmica menor. Para barra totalmente impedida, σ = E·α·ΔT.',
    },
    {
      title: 'O ensaio de tração na prática',
      body: 'Um **corpo de prova** normalizado (área A₀, marcas a uma distância L₀) é puxado por uma **máquina universal**: a célula de carga mede a força F e o **extensômetro** mede o alongamento ΔL. Daí saem:\n- **σ = F / A₀** e **ε = ΔL / L₀** (valores de **engenharia**: sempre com as medidas iniciais);\n- **limite de escoamento** σ_{e}: no aço doce aparece um **patamar** (a deformação cresce sem a força subir); sem patamar (alumínio, aço temperado), usa-se o **escoamento convencional a 0,2 %**: uma reta paralela à elástica, partindo de ε = 0,2 %, corta a curva em σ_{e};\n- **limite de resistência** σ_{r} = F_{máx} / A₀;\n- **ductilidade**: alongamento após a ruptura (L_{f} − L₀)/L₀ e **estricção** (A₀ − A_{f})/A₀.',
      example: 'A₀ = 100 mm², L₀ = 50 mm, F_{máx} = 40 kN: σ_{r} = 40.000/100 = **400 MPa**. Juntando as partes depois da ruptura, L_{f} = 66 mm: alongamento = (66 − 50)/50 = **32 %**.',
      tip: 'Depois do limite de resistência a **força** cai porque a área do pescoço diminui depressa; a **tensão verdadeira** F/A (com a área real) continua subindo.',
      trap: 'Ler o escoamento a 0,2 % **na própria curva**, no ponto ε = 0,2 %. O certo é a interseção da curva com a **paralela à reta elástica** que parte de 0,2 %.',
      lab: { lab: 'tensile', preset: { mat: 1, eps: 1 }, label: 'Ver o escoamento a 0,2 %' },
    },
    {
      title: 'Descarga, encruamento e energia',
      body: 'Retirando a carga de um material que já escoou, ele volta por uma reta **paralela ao trecho elástico** (mesmo E): recupera só a parte elástica σ/E e fica a **deformação permanente** ε_{p} = ε − σ/E.\n\nRecarregado, ele só volta a escoar na tensão em que parou: o limite de escoamento **subiu**. É o **encruamento** — a base da conformação a frio (trefilação, laminação a frio).\n\n**Energia** por volume = área sob a curva σ × ε:\n- **resiliência** (só o trecho elástico): U_{r} = σ_{e}² / (2E);\n- **tenacidade**: a área inteira até a ruptura. O aço doce, que deforma muito, absorve centenas de vezes mais energia que o ferro fundido cinzento.',
      example: 'Aço 1020 (E = 200 GPa) levado a ε = 8 %, com σ = 337 MPa, e descarregado: recupera 337/200.000 = 0,17 % e ficam **7,83 %** permanentes. Recarregado, só escoa de novo perto de **337 MPa** (antes, 250 MPa).',
      tip: 'Com σ em MPa, U_{r} sai em **MJ/m³** (1 MPa = 1 MJ/m³). Aço 1020: 250²/(2 × 200.000) ≈ 0,16 MJ/m³.',
      trap: 'Tratamento térmico e encruamento **não mudam o módulo de elasticidade**: o aço temperado é mais **resistente**, não mais **rígido**. Sob a mesma carga elástica, ele deforma o mesmo que o aço doce.',
      hot: 'Escolher o material de uma **mola** que absorva a maior energia sem deformar permanentemente = maior **resiliência**, σ_{e}²/(2E) (Transpetro 2018).',
      lab: { lab: 'tensile', preset: { mat: 0, eps: 8, unload: 1 }, label: 'Descarregar no meio do ensaio' },
    },
    {
      title: 'Hiperestáticos e estado de tensões',
      body: '**Estruturas hiperestáticas:** há mais reações incógnitas do que equações da estática (no plano, **3**: ΣF_{x}, ΣF_{y}, ΣM). Articulação fixa = 2 reações; rolete = 1; engaste = 3. A diferença é o **grau de hiperestaticidade** — falta uma equação de **compatibilidade** de deformações.\n\nExemplo clássico: barras do mesmo material e comprimento que encurtam **juntas** (sob uma placa rígida) têm a **mesma deformação** → a **mesma tensão**; a força se divide na proporção das áreas (rigidez E·A/L).\n\n**Estado de tensões num ponto:**\n- Barra tracionada: estado **uniaxial** de tensões (mas triaxial de deformações, por Poisson).\n- **Estado plano:** tensões principais **σ₁,₂ = (σ_{x} + σ_{y})/2 ± √[((σ_{x} − σ_{y})/2)² + τ²]**; cisalhamento máximo no plano **τ_{máx} = (σ₁ − σ₂)/2** = raio do círculo de Mohr.\n- **Torção pura:** σ₁ = +τ e σ₂ = −τ (iguais e opostas), a 45° do eixo; o círculo de Mohr fica centrado na origem.\n- Torção + carga axial: o círculo se desloca; as principais ficam com módulos diferentes e sinais contrários.',
      example: 'σ_{x} = 80, σ_{y} = 20 e τ = 40 MPa: centro 50, raio √(30² + 40²) = 50 → σ₁ = **100 MPa**, σ₂ = **0** e τ_{máx} = **50 MPa**.',
      hot: 'Principais na **torção pura** — iguais e de sinais contrários (Petrobras 2018, BR 2012); torção com compressão axial (Petrobras 2014); τ_{máx} a partir das principais (Petrobras 2012); qual estado o círculo de Mohr representa (Petrobras 2011); contar incógnitas × equações numa viga de três apoios (Transpetro 2012); barras e colunas dividindo carga (Petrobras 2011, Petrobras Biocombustível 2010).',
      tip: 'Mohr: **centro = média das normais**, **raio = hipotenusa** de (meia-diferença, τ). Principais = centro ± raio.',
      trap: 'Na torção pura **existem** tensões normais — as principais, a 45°. Por isso materiais frágeis torcidos rompem em hélice a 45°.',
    },
  ],
  roteiros: [
    {
      id: 'tensao-normal',
      name: 'Tensão normal e dimensionamento à tração',
      when: 'Barra, tirante ou coluna com força axial; pedem a tensão, a força máxima ou a área mínima.',
      steps: [
        'Ache a força em cada barra (equilíbrio do nó ou da estrutura); em trechos em série, a força é a mesma.',
        'Use σ = F/A com N e mm² (N/mm² = MPa).',
        'Compare com a admissível — com vários trechos, manda o que aguenta menos.',
      ],
      note: 'kN → N (× 1.000) e cm² → mm² (× 100). Tirante inclinado: só a componente vertical segura o peso.',
    },
    {
      id: 'alongamento',
      name: 'Alongamento elástico (δ = F·L/(A·E))',
      when: 'Barra tracionada ou comprimida no regime elástico; pedem o alongamento ou comparam barras diferentes.',
      steps: [
        'Junte em N, mm e MPa (200 GPa = 200.000 MPa).',
        'Escreva δ = F·L/(A·E) e veja o que muda entre os casos.',
        'Calcule — ou aplique a proporção (δ ∝ 1/A ∝ 1/d²).',
      ],
      note: 'Dobrar o diâmetro: área 4×, alongamento 4× menor. Tratamento térmico não muda E: aços diferentes deformam igual.',
    },
    {
      id: 'tensao-termica',
      name: 'Tensão térmica com dilatação impedida',
      when: 'Barra presa nas duas pontas que é aquecida ou resfriada; pedem a tensão que surge.',
      steps: [
        'Dilatação livre: ε_{T} = α·ΔT (δ = α·ΔT·L).',
        'Os apoios impedem: a deformação mecânica precisa anular a térmica (descontando a folga, se houver).',
        'σ = E·α·ΔT — compressão no aquecimento; o comprimento não entra.',
      ],
      note: 'Aço: E·α ≈ 2,4 MPa por °C. Com folga, só a dilatação que passa da folga gera tensão.',
    },
    {
      id: 'ensaio-tracao',
      name: 'Grandezas do ensaio de tração',
      when: 'Corpo de prova antes e depois do ensaio, ou carga e descarga; pedem estricção, deformação permanente, resiliência, tenacidade ou limite de resistência.',
      steps: [
        'Identifique a grandeza: estricção (área), deformação permanente (descarga), resiliência ou tenacidade (energia), limite de resistência (força máxima).',
        'Escreva a definição: Z = 1 − (d_{f}/d₀)²; ε_{p} = ε − σ/E; U_{r} = σ_{e}²/(2E); σ_{r} = F_{máx}/A₀.',
        'Calcule com unidades coerentes (1 MPa = 1 MJ/m³) ou julgue a afirmação.',
      ],
      note: 'A descarga volta pela reta de inclinação E. Tensões de engenharia usam a área **inicial**.',
    },
    {
      id: 'poisson',
      name: 'Coeficiente de Poisson',
      when: 'Barra tracionada ou comprimida; pedem as deformações transversais ou quais deformações não são nulas.',
      steps: [
        'Deformação axial: ε_{axial} = σ/E (tração +, compressão −).',
        'Transversais: ε_{trans} = −ν·ε_{axial}, com sinal contrário ao da axial.',
        'Conclua: tensão uniaxial dá três deformações normais (alonga e afina; encurta e engorda).',
      ],
      note: 'Estado uniaxial de **tensões** não é estado uniaxial de **deformações**.',
    },
    {
      id: 'barras-paralelo',
      name: 'Barras em paralelo dividindo uma carga (hiperestático)',
      when: 'Uma peça rígida apoiada em duas ou mais barras que se deformam juntas; pedem a força ou a tensão em cada uma.',
      steps: [
        'Equilíbrio: F₁ + F₂ = F.',
        'Compatibilidade: as barras se deformam igual (δ₁ = δ₂) → F₁·L₁/(A₁·E₁) = F₂·L₂/(A₂·E₂).',
        'Resolva o sistema; com mesmo E e mesmo L, as tensões são iguais: σ = F/(A₁ + A₂).',
      ],
      note: 'Hiperestático: a estática sozinha não basta — falta uma equação de deformação.',
    },
    {
      id: 'mohr',
      name: 'Tensões principais pelo círculo de Mohr',
      when: 'Estado plano com σ_{x}, σ_{y} e τ_{xy} (ou torção com força axial); pedem as tensões principais ou o cisalhamento máximo.',
      steps: [
        'Centro do círculo: C = (σ_{x} + σ_{y})/2.',
        'Raio: R = √[((σ_{x} − σ_{y})/2)² + τ_{xy}²].',
        'σ₁ = C + R; σ₂ = C − R; τ_{máx} (no plano) = R.',
      ],
      note: 'Torção pura: C = 0 e R = τ → σ₁ = +τ e σ₂ = −τ, a 45° do eixo (o giz quebra em hélice).',
    },
  ],
  questions: [
    {
      id: 'mec-res-01',
      type: 'gen',
      difficulty: 1,
      lessonRef: 0,
      title: 'Tensão normal em uma barra',
      roteiro: 'tensao-normal',
      generate(rng) {
        const A = pickOne(rng, [50, 80, 100, 125, 200, 250, 400, 500]);
        const F = pickOne(rng, [5, 10, 12, 15, 20, 25, 30, 40, 50, 60]);
        const sigma = (F * 1000) / A;
        const { options, answer } = numericOptions({
          correct: sigma,
          unit: 'MPa',
          digits: 2,
          correctWhy: `σ = F/A = ${fmt(F * 1000)} N / ${A} mm² = ${fmt(sigma)} MPa.`,
          distractors: [
            { value: sigma / 1000, why: 'Usou F em kN com A em mm² sem converter (kN/mm² = GPa): faltou multiplicar por 1.000.' },
            { value: sigma * 10, why: 'Erro de potência de 10 na conversão de área (cm² ↔ mm²).' },
            { value: sigma / 10, why: 'Erro de potência de 10 na conversão de área (1 cm² = 100 mm²).' },
          ],
        });
        return {
          prompt: `Uma barra com seção transversal de **${A} mm²** é tracionada por uma força axial de **${F} kN**. A tensão normal na barra é`,
          options,
          answer,
          hint: 'Converta a força para newtons: N/mm² = MPa.',
          steps: [
            `Força axial: ${F} kN = ${fmt(F * 1000)} N; área: ${A} mm².`,
            `σ = ${fmt(F * 1000)}/${A}.`,
            `σ = **${fmt(sigma)} MPa** (1 N/mm² = 1 MPa).`,
          ],
          explanation: `σ = F/A = ${F} kN / ${A} mm² = ${fmt(F * 1000)} N / ${A} mm² = **${fmt(sigma)} MPa** (1 N/mm² = 1 MPa).`,
        };
      },
    },
    {
      id: 'mec-res-02',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Alongamento elástico',
      roteiro: 'alongamento',
      generate(rng) {
        const F = pickOne(rng, [10, 20, 30, 40, 50]);
        const L = pickOne(rng, [1, 1.5, 2, 2.5, 3]);
        const A = pickOne(rng, [100, 200, 250, 500]);
        const mat = pickOne(rng, [
          { name: 'aço', E: 200 },
          { name: 'liga de cobre', E: 100 },
        ]);
        const delta = (F * L * 1000) / (A * mat.E);
        const strain = delta / (L * 1000);
        const { options, answer } = numericOptions({
          correct: delta,
          unit: 'mm',
          digits: 4,
          correctWhy: `δ = F·L/(A·E) = ${fmt(F * 1000)} × ${fmt(L * 1000)} / (${A} × ${fmt(mat.E * 1000)}) = ${fmt(delta, 4)} mm.`,
          distractors: [
            { value: delta * 1000, why: 'Usou E em GPa como se fosse MPa: o resultado ficou mil vezes maior.' },
            { value: delta / 1000, why: 'Deixou o comprimento em metros enquanto o resto estava em N e mm.' },
            { value: strain, why: 'Calculou a **deformação** ε (adimensional), e não o alongamento δ = ε·L.' },
          ],
        });
        return {
          prompt: `Uma barra de ${mat.name} (E = ${mat.E} GPa), com **${fmt(L)} m** de comprimento e seção de **${A} mm²**, é tracionada por **${F} kN** no regime elástico. O alongamento da barra é`,
          options,
          answer,
          hint: 'δ = F·L/(A·E). Use N, mm e MPa (1 GPa = 1.000 MPa).',
          steps: [
            `F = ${fmt(F * 1000)} N; L = ${fmt(L * 1000)} mm; A = ${A} mm²; E = ${fmt(mat.E * 1000)} MPa.`,
            `δ = ${fmt(F * 1000)} × ${fmt(L * 1000)}/(${A} × ${fmt(mat.E * 1000)}).`,
            `δ = **${fmt(delta, 4)} mm**.`,
          ],
          explanation: `Lei de Hooke para barra: δ = F·L/(A·E).\n\nF = ${fmt(F * 1000)} N; L = ${fmt(L * 1000)} mm; A = ${A} mm²; E = ${fmt(mat.E * 1000)} MPa.\n\nδ = ${fmt(F * 1000)} × ${fmt(L * 1000)} / (${A} × ${fmt(mat.E * 1000)}) = **${fmt(delta, 4)} mm**.`,
        };
      },
    },
    {
      id: 'mec-res-03',
      type: 'gen',
      difficulty: 3,
      lessonRef: 4,
      title: 'Tensão térmica em barra impedida',
      roteiro: 'tensao-termica',
      generate(rng) {
        const dT = pickOne(rng, [20, 25, 40, 50, 60, 75, 80, 100]);
        const L = pickOne(rng, [1, 2, 3, 4, 5]);
        const sigma = 200_000 * 12e-6 * dT;
        const { options, answer } = numericOptions({
          correct: sigma,
          unit: 'MPa',
          digits: 4,
          correctWhy: `σ = E·α·ΔT = 200.000 × 12 × 10⁻⁶ × ${dT} = ${fmt(sigma)} MPa.`,
          distractors: [
            { value: sigma / 1000, why: 'Deixou E em GPa: o resultado sai em GPa (0,12 GPa = 120 MPa), não em MPa.' },
            { value: 12e-6 * dT, why: 'Calculou a deformação térmica ε = α·ΔT (adimensional), não a tensão.' },
            { value: sigma * L, why: 'Multiplicou pelo comprimento: a tensão térmica de barra impedida **não depende** de L.' },
          ],
        });
        return {
          prompt: `Uma barra de aço de **${L} m**, engastada nas duas extremidades sem folga, é aquecida uniformemente em **${dT} °C**. Considere E = 200 GPa e α = 12 × 10^{−6} /°C. O módulo da tensão normal que surge na barra, em MPa, é`,
          options,
          answer,
          hint: 'Impedida de dilatar, a barra "devolve" a dilatação como compressão: σ = E·α·ΔT.',
          steps: [
            `ε_{T} = α·ΔT = 12 × 10^{−6} × ${dT} = ${fmt(12 * dT, 0)} × 10^{−6}.`,
            `Engastada sem folga: a deformação total é zero, então a mecânica vale −α·ΔT.`,
            `σ = E·α·ΔT = 200.000 × 12 × 10^{−6} × ${dT} = **${fmt(sigma)} MPa** (compressão; o comprimento de ${L} m não entra).`,
          ],
          explanation: `A dilatação livre seria δ = α·ΔT·L, mas os engastes a impedem. A deformação mecânica que "anula" a térmica é ε = α·ΔT, logo σ = E·α·ΔT = 200.000 MPa × 12 × 10⁻⁶ × ${dT} = **${fmt(sigma)} MPa** (compressão).\n\nO comprimento (${L} m) não entra na conta.`,
        };
      },
    },
    {
      id: 'mec-res-04',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'A Lei de Hooke, σ = E·ε, é válida',
      options: [
        { text: 'no regime elástico linear, até o limite de proporcionalidade.', why: 'Correta: além desse limite a relação tensão × deformação deixa de ser linear.' },
        { text: 'em qualquer ponto do diagrama tensão-deformação.', why: 'Depois do limite de proporcionalidade a relação deixa de ser linear.' },
        { text: 'apenas na região de deformação plástica.', why: 'É o contrário: na região plástica a Lei de Hooke não vale.' },
        { text: 'somente para materiais frágeis.', why: 'Vale para qualquer material no seu trecho elástico linear.' },
        { text: 'somente em compressão.', why: 'Vale em tração e em compressão.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **onde vale** σ = E·ε.',
        'Hooke descreve o trecho **reto** do diagrama tensão-deformação: E é a inclinação dessa reta.',
        'Fica **regime elástico linear, até o limite de proporcionalidade**.',
      ],
      explanation: 'A Lei de Hooke descreve o trecho **reto** do diagrama tensão-deformação: σ = E·ε, com E (módulo de elasticidade) sendo a inclinação dessa reta. Ela vale até o limite de proporcionalidade.',
    },
    {
      id: 'mec-res-05',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Uma barra de aço (ν = 0,3) é tracionada e sofre deformação longitudinal de **0,0010**. A deformação transversal é',
      shuffle: false,
      options: [
        { text: '−0,0033', why: 'Dividiu por ν em vez de multiplicar.' },
        { text: '−0,0010', why: 'A deformação transversal não é igual à longitudinal: ela vale ν vezes a longitudinal.' },
        { text: '−0,0003', why: 'Correta: ε_{trans} = −ν·ε_{long} = −0,3 × 0,0010.' },
        { text: '+0,0003', why: 'Sinal trocado: na tração a barra **afina** (deformação transversal negativa).' },
        { text: '+0,0030', why: 'Erro de potência de 10 e de sinal.' },
      ],
      answer: 2,
      roteiro: 'poisson',
      steps: [
        'ε_{long} = +0,0010 (tração).',
        'ε_{trans} = −ν·ε_{long} = −0,3 × 0,0010.',
        '= **−0,0003**: o diâmetro diminui enquanto a barra alonga.',
      ],
      explanation: 'ν = −ε_{trans}/ε_{long} → ε_{trans} = −ν·ε_{long} = −0,3 × 0,0010 = **−0,0003**. O sinal negativo indica que o diâmetro **diminui** enquanto a barra alonga.',
    },
    {
      id: 'mec-res-06',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'No dimensionamento de uma barra de **aço estrutural** (material dúctil) sob tração estática, a tensão admissível normalmente é obtida dividindo-se por um fator de segurança o(a)',
      options: [
        { text: 'limite de escoamento.', why: 'Correta: em material dúctil, a falha funcional é a deformação permanente.' },
        { text: 'limite de resistência à tração.', why: 'É o critério usual para materiais **frágeis**; no dúctil a peça já falhou ao escoar.' },
        { text: 'limite de proporcionalidade.', why: 'Fica muito próximo do escoamento, mas é difícil de medir; projeto usa o escoamento.' },
        { text: 'módulo de elasticidade.', why: 'E mede rigidez, não resistência.' },
        { text: 'tensão de ruptura.', why: 'Romper é muito depois de escoar: dimensionar por ela deixaria a peça deformar permanentemente.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: material **dúctil** sob carga **estática**.',
        'A falha do dúctil é o **escoamento** (deformação permanente): σ_{adm} = σ_{e}/FS. O frágil, que rompe sem escoar, usa σ_{r}/FS.',
        'Fica **limite de escoamento**.',
      ],
      explanation: 'Para materiais dúcteis: **σ_{adm} = σ_{e}/FS**. A peça não pode escoar (deformar permanentemente) em serviço. Para frágeis, que rompem sem escoar, usa-se o limite de resistência: σ_{adm} = σ_{r}/FS.',
    },
    {
      id: 'mec-res-07',
      difficulty: 3,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Duas barras do mesmo material e mesmo comprimento estão sob a mesma força de tração. O diâmetro da barra B é o **dobro** do diâmetro da barra A. A razão entre os alongamentos δ_{B}/δ_{A} é',
      shuffle: false,
      options: [
        { text: '1/4', why: 'Correta: A ∝ d² → dobro do diâmetro = 4× a área → alongamento 4× menor.' },
        { text: '1/2', why: 'Considerou a área proporcional ao diâmetro; ela é proporcional ao **quadrado** do diâmetro.' },
        { text: '1', why: 'A área maior reduz a tensão e, com ela, o alongamento.' },
        { text: '2', why: 'Barra mais grossa alonga **menos**, não mais.' },
        { text: '4', why: 'Inverteu a razão: a barra B (mais grossa) alonga 4 vezes **menos**.' },
      ],
      answer: 0,
      roteiro: 'alongamento',
      steps: [
        'Mesmo material, mesmo comprimento e mesma força: F, L e E iguais.',
        'δ = F·L/(A·E) → δ ∝ 1/A, com A = π·d²/4.',
        'd dobra → A fica 4 vezes maior → **δ_{B}/δ_{A} = 1/4**.',
      ],
      explanation: 'δ = F·L/(A·E). F, L e E iguais → δ ∝ 1/A. Como A = π·d²/4, dobrar d multiplica A por 4. Logo **δ_{B} = δ_{A}/4**.',
    },
    {
      id: 'mec-res-08',
      type: 'gen',
      difficulty: 2,
      lessonRef: 5,
      title: 'Estricção no ensaio de tração',
      roteiro: 'ensaio-tracao',
      generate(rng) {
        const d0 = pickOne(rng, [10, 12.5, 20]);
        const r = pickOne(rng, [0.5, 0.6, 0.7, 0.8]);
        const df = d0 * r;
        const Z = (1 - r * r) * 100;
        const { options, answer } = numericOptions({
          correct: Z,
          unit: '%',
          digits: 3,
          correctWhy: `Z = (A₀ − A_{f})/A₀ = 1 − (d_{f}/d₀)² = 1 − ${fmt(r)}² = ${fmt(Z)} %.`,
          distractors: [
            { value: (1 - r) * 100, why: 'Comparou os **diâmetros**, não as áreas: a área cai com o quadrado do diâmetro.' },
            { value: r * r * 100, why: 'Essa é a área que **sobrou** (A_{f}/A₀), não a redução.' },
            { value: ((1 - r * r) / (r * r)) * 100, why: 'Dividiu a redução pela área **final**; a estricção usa a área inicial A₀.' },
          ],
        });
        return {
          prompt: `Num ensaio de tração, um corpo de prova cilíndrico com **${fmt(d0)} mm** de diâmetro rompe com **${fmt(df)} mm** de diâmetro na seção da fratura. A estricção (redução percentual de área) foi de`,
          options,
          answer,
          hint: 'A = π·d²/4: a razão entre as áreas é o quadrado da razão entre os diâmetros.',
          steps: [
            `Estricção = redução percentual de **área** na fratura.`,
            `Z = 1 − (d_{f}/d₀)² = 1 − (${fmt(df)}/${fmt(d0)})² = 1 − ${fmt(r)}².`,
            `Z = 1 − ${fmt(r * r)} = **${fmt(Z)} %**.`,
          ],
          explanation: `A_{f}/A₀ = (d_{f}/d₀)² = (${fmt(df)}/${fmt(d0)})² = ${fmt(r)}² = ${fmt(r * r)}.\n\nEstricção: Z = 1 − ${fmt(r * r)} = **${fmt(Z)} %**. Estricção alta indica material **dúctil** (aço doce: 50 a 70 %).`,
        };
      },
    },
    {
      id: 'mec-res-09',
      type: 'gen',
      difficulty: 2,
      lessonRef: 6,
      title: 'Deformação permanente depois de descarregar',
      roteiro: 'ensaio-tracao',
      generate(rng) {
        const mat = pickOne(rng, [
          { name: 'aço', E: 200, sig: [300, 320, 360, 400, 440] },
          { name: 'alumínio', E: 70, sig: [210, 245, 280] },
        ]);
        const sig = pickOne(rng, mat.sig);
        const eps = pickOne(rng, [1, 1.5, 2, 2.5, 3, 4, 5]);
        const el = (sig / (mat.E * 1000)) * 100;
        const ep = eps - el;
        const { options, answer } = numericOptions({
          correct: ep,
          unit: '%',
          digits: 3,
          correctWhy: `ε_{p} = ε − σ/E = ${fmt(eps)} % − ${fmt(el)} % = ${fmt(ep)} %.`,
          distractors: [
            { value: eps, why: 'Esqueceu a **recuperação elástica**: ao descarregar, a parte σ/E volta.' },
            { value: el, why: 'Essa é a parte que **volta** (σ/E), não a que fica.' },
            { value: eps + el, why: 'Somou a parte elástica em vez de subtrair.' },
          ],
        });
        return {
          prompt: `Uma barra de ${mat.name} (E = ${mat.E} GPa) é tracionada além do escoamento até a deformação total de **${fmt(eps)} %**, sob tensão de **${sig} MPa**, e então a carga é retirada. A deformação permanente da barra é`,
          options,
          answer,
          hint: 'O descarregamento segue uma reta paralela ao trecho elástico: volta σ/E.',
          steps: [
            `Deformação permanente: o que sobra depois de **descarregar**.`,
            `ε_{p} = ε − σ/E, com σ/E = ${sig}/${fmt(mat.E * 1000)} = ${fmt(el)} %.`,
            `ε_{p} = ${fmt(eps)} − ${fmt(el)} = **${fmt(ep)} %**.`,
          ],
          explanation: `Na descarga, o material recupera só a parte elástica: σ/E = ${sig}/${fmt(mat.E * 1000)} = ${fmt(el / 100, 5)} = ${fmt(el)} %.\n\nFica ε_{p} = ${fmt(eps)} − ${fmt(el)} = **${fmt(ep)} %**.`,
        };
      },
    },
    {
      id: 'mec-res-10',
      type: 'gen',
      difficulty: 3,
      lessonRef: 6,
      title: 'Módulo de resiliência',
      roteiro: 'ensaio-tracao',
      generate(rng) {
        const mat = pickOne(rng, [
          { name: 'Um aço', E: 200, se: [200, 250, 300, 400, 600] },
          { name: 'Uma liga de alumínio', E: 70, se: [210, 280] },
        ]);
        const se = pickOne(rng, mat.se);
        const Ur = ((se * se) / (2 * mat.E * 1000)) * 1000; // kJ/m³
        const { options, answer } = numericOptions({
          correct: Ur,
          unit: 'kJ/m³',
          digits: 4,
          correctWhy: `U_{r} = σ_{e}²/(2E) = ${se}²/(2 × ${fmt(mat.E * 1000)}) = ${fmt(Ur / 1000, 5)} MJ/m³ = ${fmt(Ur)} kJ/m³.`,
          distractors: [
            { value: Ur * 2, why: 'Faltou o ½: a energia elástica é a **área do triângulo** sob a reta, σ·ε/2.' },
            { value: (se / (2 * mat.E * 1000)) * 1000, why: 'Esqueceu de elevar σ_{e} ao quadrado.' },
            { value: Ur * 1000, why: 'Usou E em GPa no lugar de MPa: o resultado ficou mil vezes maior.' },
          ],
        });
        return {
          prompt: `${mat.name} tem limite de escoamento de **${se} MPa** e módulo de elasticidade de **${mat.E} GPa**. O módulo de resiliência (energia elástica armazenada por volume até o escoamento) é`,
          options,
          answer,
          hint: 'Área sob a reta elástica até σ_{e}: um triângulo. Lembre que 1 MPa = 1 MJ/m³.',
          steps: [
            `Módulo de resiliência: energia elástica por volume até o escoamento (o triângulo sob a reta de Hooke).`,
            `U_{r} = σ_{e}²/(2E) = ${se}²/(2 × ${fmt(mat.E * 1000)}).`,
            `U_{r} = ${fmt(Ur / 1000, 5)} MJ/m³ = **${fmt(Ur)} kJ/m³**.`,
          ],
          explanation: `A resiliência é a área do triângulo sob a reta de Hooke: U_{r} = ½·σ_{e}·ε_{e} = σ_{e}²/(2E).\n\nU_{r} = ${se}² / (2 × ${fmt(mat.E * 1000)} MPa) = ${fmt(Ur / 1000, 5)} MPa = ${fmt(Ur / 1000, 5)} MJ/m³ = **${fmt(Ur)} kJ/m³**.`,
        };
      },
    },
    {
      id: 'mec-res-11',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Em materiais que não apresentam patamar de escoamento nítido, como ligas de alumínio e aços temperados e revenidos, o **limite de escoamento convencional (0,2 %)** é obtido',
      options: [
        { text: 'pela interseção da curva tensão-deformação com uma reta paralela ao trecho elástico que parte de ε = 0,2 %.', why: 'Correta: é o método da paralela (offset). A tensão lida corresponde a 0,2 % de deformação **permanente**.' },
        { text: 'lendo a tensão na própria curva, no ponto em que a deformação total vale 0,2 %.', why: 'Nesse ponto, boa parte da deformação ainda é elástica; o método usa a paralela à reta elástica.' },
        { text: 'tomando 0,2 % do limite de resistência à tração.', why: 'Daria uma tensão minúscula; 0,2 % é uma deformação, não uma fração de tensão.' },
        { text: 'no ponto em que a curva deixa de ser reta.', why: 'Esse é o limite de proporcionalidade, difícil de medir com precisão — por isso se convencionou o 0,2 %.' },
        { text: 'dividindo a força máxima pela área final do pescoço.', why: 'Mistura limite de resistência com área real; não tem relação com o escoamento.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: escoamento **convencional (0,2 %)**, para material sem patamar.',
        'Convenciona-se 0,2 % de deformação **permanente**: a partir de ε = 0,002, traça-se uma reta paralela ao trecho elástico (inclinação E).',
        'Fica a **interseção da curva com a paralela que parte de 0,2 %**. Ler a curva em ε = 0,2 % total é a troca.',
      ],
      explanation: 'Sem patamar, o início da plasticidade é gradual. Convenciona-se que o material "escoou" quando sobra **0,2 % de deformação permanente**: traça-se, a partir de ε = 0,002, uma reta com a inclinação E, e a tensão no cruzamento com a curva é o **σ_{e} convencional**.',
    },
    {
      id: 'mec-res-12',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'No ensaio de tração de um aço dúctil, depois de atingido o limite de resistência, a força registrada pela máquina **diminui** até a ruptura. Nesse trecho,',
      options: [
        { text: 'a tensão verdadeira (força dividida pela área real) continua aumentando, porque a área do pescoço diminui mais depressa que a força.', why: 'Correta: o material no pescoço continua encruando; quem cai é a área.' },
        { text: 'o material amolece e a tensão verdadeira também diminui.', why: 'A queda é da **força**, causada pela redução localizada da área (estricção).' },
        { text: 'a tensão de engenharia aumenta, porque é calculada com a área do pescoço.', why: 'A tensão de engenharia usa a área **inicial** A₀; por isso ela cai junto com a força.' },
        { text: 'a deformação volta a ser elástica e recuperável.', why: 'É o trecho de maior deformação plástica do ensaio.' },
        { text: 'a área da seção permanece constante até a ruptura.', why: 'É justamente a redução de área (estricção) que explica a queda da força.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: a força **cai** depois do limite de resistência — e a tensão **verdadeira**?',
        'Tensão verdadeira = F/A, com a área real. No pescoço, a área cai mais depressa que a força.',
        'Fica **a tensão verdadeira continua aumentando**; só a de engenharia (F/A₀) cai.',
      ],
      explanation: 'A partir de σ_{r}, a deformação se concentra no **pescoço**. A força F cai, então σ = F/A₀ cai. Mas a área real A do pescoço cai ainda mais rápido, e **σ_{v} = F/A sobe** até a ruptura.',
    },
    {
      id: 'mec-res-13',
      type: 'ce',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Um eixo de aço SAE 4140 temperado e revenido tem limite de escoamento bem maior que o de um eixo idêntico de aço SAE 1020. Por isso, sob a mesma carga e dentro do regime elástico, o eixo de 4140 sofre **deflexão menor**.',
      answer: false,
      roteiro: 'alongamento',
      steps: [
        'Mesma geometria e mesma carga; muda só o aço (e o tratamento).',
        'A deformação elástica depende de E (rigidez), não da resistência (σ_{e}, σ_{r}).',
        '4140 e 1020 têm E ≈ 200 GPa: **mesma deflexão**. **Errado**.',
      ],
      explanation: 'A deflexão elástica depende da rigidez E·I. O tratamento térmico muda a **resistência** (σ_{e}, σ_{r}), mas **não** o módulo de elasticidade: os dois aços têm E ≈ 200 GPa. Mesma geometria e mesma carga → **mesma deflexão**. Item **errado**.',
    },
    {
      id: 'mec-res-14',
      type: 'ce',
      difficulty: 1,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Ao se retirar a carga de um corpo de prova de aço que já escoou, o descarregamento segue uma reta aproximadamente paralela ao trecho elástico inicial, e parte da deformação não é recuperada.',
      answer: true,
      roteiro: 'ensaio-tracao',
      steps: [
        'Grandeza: a deformação depois de **descarregar** um aço que já escoou.',
        'A descarga segue a reta de inclinação E: recupera só σ/E; sobra ε_{p} = ε − σ/E.',
        'Reta paralela ao trecho elástico e deformação permanente: **Certo**.',
      ],
      explanation: 'Na descarga o material recupera só a parcela elástica σ/E, pela reta de inclinação E. Sobra a **deformação permanente** ε_{p} = ε − σ/E. Item **certo**.',
    },
    {
      id: 'mec-res-15',
      type: 'ce',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'A tenacidade medida no ensaio de tração corresponde à área sob toda a curva tensão-deformação até a ruptura; assim, um material dúctil de resistência moderada pode ser mais tenaz que um material frágil de resistência mais alta.',
      answer: true,
      roteiro: 'ensaio-tracao',
      steps: [
        'Grandeza: **tenacidade** — energia por volume até a ruptura.',
        'É a área **total** sob a curva: depende da resistência **e** da deformação.',
        'Um dúctil moderado (30 % de alongamento) absorve mais que um frágil resistente que rompe com 0,5 %: **Certo**.',
      ],
      explanation: 'Tenacidade = energia absorvida por volume até romper = **área total** sob a curva. Ela depende da resistência **e** da deformação. Um aço doce (σ_{r} ≈ 400 MPa, alongamento ≈ 30 %) absorve muito mais energia que um material frágil que rompe com 0,5 %. Item **certo**.',
    },
    {
      id: 'mec-res-16',
      type: 'ce',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'No ensaio de tração, o limite de resistência é calculado dividindo-se a força máxima pela área da seção do pescoço medida no instante da ruptura.',
      answer: false,
      roteiro: 'ensaio-tracao',
      steps: [
        'Grandeza: **limite de resistência**, uma tensão de engenharia.',
        'σ_{r} = F_{máx}/A₀, com a área **inicial** — e a força máxima ocorre antes do pescoço.',
        'Força sobre a área do pescoço na ruptura é outra grandeza (tensão verdadeira de ruptura): **Errado**.',
      ],
      explanation: 'O limite de resistência é uma tensão de **engenharia**: σ_{r} = F_{máx}/**A₀** (área inicial). Além disso, a força máxima acontece **antes** do pescoço, e não na ruptura. Item **errado**.',
    },
    {
      id: 'mec-res-17',
      type: 'ce',
      difficulty: 1,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'O patamar de escoamento — trecho em que a deformação aumenta sem aumento significativo da força — é típico do aço de baixo carbono e não costuma aparecer em ligas de alumínio.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: **patamar de escoamento**, típico do aço de baixo carbono.',
        'O aço doce tem limites superior e inferior de escoamento; alumínio, cobre e aços temperados escoam de forma gradual.',
        'Por isso esses usam o escoamento convencional a 0,2 %: **Certo**.',
      ],
      explanation: 'O patamar (com limites superior e inferior de escoamento) é característico dos aços de baixo carbono. Ligas de alumínio, cobre e aços temperados escoam de forma gradual — por isso se usa o **escoamento convencional a 0,2 %**. Item **certo**.',
    },
    {
      id: 'mec-res-18',
      type: 'gen',
      difficulty: 2,
      lessonRef: 0,
      title: 'Força máxima numa barra de dois trechos',
      roteiro: 'tensao-normal',
      generate(rng) {
        const s1 = pickOne(rng, [120, 150, 200, 250]);
        const s2 = pickOne(rng, [60, 80, 100]);
        const A1 = pickOne(rng, [1, 1.5, 2]);
        const A2 = pickOne(rng, [3, 4, 5]);
        const F1 = s1 * A1 * 100 / 1000; // kN (cm² → mm²)
        const F2 = s2 * A2 * 100 / 1000;
        const F = Math.min(F1, F2);
        const { options, answer } = numericOptions({
          correct: F,
          unit: 'kN',
          digits: 1,
          correctWhy: `Trecho 1: ${s1} MPa × ${fmt(A1 * 100)} mm² = ${fmt(F1, 1)} kN; trecho 2: ${s2} × ${fmt(A2 * 100)} = ${fmt(F2, 1)} kN. Vale o **menor**: ${fmt(F, 1)} kN.`,
          distractors: [
            { value: Math.max(F1, F2), why: 'Pegou o maior valor: o outro trecho passaria da tensão admissível.' },
            { value: F1 + F2, why: 'Somou as capacidades; os trechos estão em **série** e carregam a **mesma** força.' },
            { value: F / 10, why: 'Errou a conversão: 1 cm² = 100 mm².' },
            { value: (s1 + s2) / 2 * (A1 + A2) * 100 / 1000 / 2, why: 'Usou médias de tensão e área — cada trecho precisa ser verificado separadamente.' },
          ],
        });
        return {
          prompt: `Uma barra tracionada tem dois trechos em série: no trecho 1, área de **${fmt(A1, 1)} cm²** e tensão admissível de **${s1} MPa**; no trecho 2, área de **${fmt(A2, 1)} cm²** e tensão admissível de **${s2} MPa**. A maior força axial F que pode ser aplicada sem ultrapassar nenhuma tensão admissível é, em kN,`,
          options,
          answer,
          hint: 'Em série, a força é a mesma nos dois trechos: calcule F = σ_{adm}·A de cada um e fique com o menor.',
          steps: [
            `Trechos em série: a mesma força F passa pelos dois.`,
            `Áreas: ${fmt(A1, 1)} cm² = ${fmt(A1 * 100)} mm² e ${fmt(A2, 1)} cm² = ${fmt(A2 * 100)} mm². Cada trecho aguenta F = σ_{adm}·A: ${fmt(F1, 1)} kN e ${fmt(F2, 1)} kN.`,
            `Manda o menor: **F_{máx} = ${fmt(F, 1)} kN**.`,
          ],
          explanation: `A força axial é a mesma em todo o comprimento. Cada trecho aguenta F = σ_{adm}·A:\n\n- trecho 1: ${s1} × ${fmt(A1 * 100)} = ${fmt(F1, 1)} kN;\n- trecho 2: ${s2} × ${fmt(A2 * 100)} = ${fmt(F2, 1)} kN.\n\nO **menor** manda: **F_{máx} = ${fmt(F, 1)} kN**.`,
        };
      },
    },
    {
      id: 'mec-res-19',
      type: 'gen',
      difficulty: 2,
      lessonRef: 0,
      title: 'Tirante inclinado',
      roteiro: 'tensao-normal',
      generate(rng) {
        const ang = pickOne(rng, [
          { deg: 30, sin: 0.5 },
          { deg: 45, sin: 0.707 },
          { deg: 60, sin: 0.866 },
        ]);
        const A = pickOne(rng, [100, 150, 200, 250]);
        const sadm = pickOne(rng, [80, 100, 120, 150]);
        const T = sadm * A; // N
        const W = (T * ang.sin) / 1000; // kN
        const { options, answer } = numericOptions({
          correct: W,
          unit: 'kN',
          digits: 2,
          correctWhy: `Tração máxima no tirante: ${sadm} × ${A} = ${fmt(T / 1000, 1)} kN; equilíbrio vertical: W = T·sen ${ang.deg}° = ${fmt(W, 2)} kN.`,
          distractors: [
            { value: T / 1000, why: 'Igualou o peso à força no tirante: só a componente **vertical** do tirante sustenta o peso.' },
            { value: (T / 1000) / ang.sin, why: 'Dividiu pelo seno: a componente vertical é T·sen θ, menor que T.' },
            { value: (T / 1000) * Math.sqrt(1 - ang.sin * ang.sin), why: 'Usou o cosseno (componente horizontal).' },
            { value: W * 1000 / 1000 / 10, why: 'Errou a ordem de grandeza na conversão de unidades.' },
          ],
        });
        return {
          prompt: `Um peso W é sustentado num nó por uma escora horizontal e por um tirante de aço que faz **${ang.deg}°** com a horizontal. O tirante tem **${A} mm²** de área e tensão admissível de **${sadm} MPa**. O maior peso W que o conjunto pode sustentar, limitado pelo tirante, é, em kN,`,
          options,
          answer,
          hint: 'Só a componente vertical do tirante equilibra o peso: T·sen θ = W.',
          steps: [
            `Nó: a escora é horizontal, então só o tirante segura o peso → T·sen ${ang.deg}° = W.`,
            `Tração máxima no tirante: T = σ_{adm}·A = ${sadm} × ${A} = ${fmt(T)} N.`,
            `W = ${fmt(T / 1000, 1)} × ${fmt(ang.sin, 3)} = **${fmt(W, 2)} kN**.`,
          ],
          explanation: `Tração máxima no tirante: T = σ_{adm}·A = ${sadm} × ${A} = ${fmt(T)} N.\n\nEquilíbrio vertical do nó (a escora é horizontal e não ajuda): W = T·sen ${ang.deg}° = ${fmt(T / 1000, 1)} × ${fmt(ang.sin, 3)} = **${fmt(W, 2)} kN**. Quanto mais "deitado" o tirante, maior a força nele para o mesmo peso.`,
        };
      },
    },
    {
      id: 'mec-res-20',
      difficulty: 1,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Uma barra é tracionada axialmente: no estado de tensões de um ponto, σ_{x} ≠ 0 e σ_{y} = σ_{z} = 0. Nesse ponto, **não** são nulas as deformações normais',
      shuffle: false,
      options: [
        { text: 'ε_{x}, apenas', why: 'Pelo efeito de Poisson, a barra também afina nas direções y e z.' },
        { text: 'ε_{y}, apenas', why: 'A deformação na direção da carga (x) certamente não é nula.' },
        { text: 'ε_{x} e ε_{y}, apenas', why: 'A direção z se comporta como a y: também contrai.' },
        { text: 'ε_{y} e ε_{z}, apenas', why: 'Falta ε_{x}, a deformação principal da barra.' },
        { text: 'ε_{x}, ε_{y} e ε_{z}', why: 'Correta: ε_{x} = σ/E e ε_{y} = ε_{z} = −ν·σ/E.' },
      ],
      answer: 4,
      roteiro: 'poisson',
      steps: [
        'ε_{x} = σ_{x}/E ≠ 0.',
        'ε_{y} = ε_{z} = −ν·ε_{x} ≠ 0.',
        'As **três** são diferentes de zero: ε_{x}, ε_{y} e ε_{z}.',
      ],
      explanation: 'Estado **uniaxial de tensões** não é estado uniaxial de **deformações**: ε_{x} = σ_{x}/E (alonga) e, por Poisson, ε_{y} = ε_{z} = −ν·ε_{x} (afina). As três deformações normais são diferentes de zero.',
    },
    {
      id: 'mec-res-21',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Uma coluna curta é comprimida axialmente no regime elástico linear. As deformações normais que aparecem são',
      options: [
        { text: 'uma axial negativa e duas transversais positivas.', why: 'Correta: encurta na direção da carga e "engorda" nas transversais (Poisson).' },
        { text: 'uma axial negativa e duas transversais nulas.', why: 'O efeito de Poisson faz as transversais não serem nulas.' },
        { text: 'uma axial positiva e duas transversais negativas.', why: 'Isso é a **tração**.' },
        { text: 'três negativas.', why: 'As transversais têm sinal oposto ao da axial.' },
        { text: 'uma axial negativa e duas transversais negativas, de mesmo valor.', why: 'Comprimida, a coluna aumenta de seção: transversais positivas.' },
      ],
      answer: 0,
      roteiro: 'poisson',
      steps: [
        'Compressão: ε_{axial} = σ/E < 0.',
        'ε_{trans} = −ν·ε_{axial} > 0.',
        '**Uma axial negativa e duas transversais positivas**: a seção engorda um pouco.',
      ],
      explanation: 'Compressão: ε_{axial} = σ/E < 0. Poisson: ε_{trans} = −ν·ε_{axial} > 0 — a seção **aumenta** um pouco. Na tração, é o contrário (alonga e afina).',
    },
    {
      id: 'mec-res-22',
      type: 'gen',
      difficulty: 3,
      lessonRef: 7,
      title: 'Duas colunas dividindo uma carga',
      roteiro: 'barras-paralelo',
      generate(rng) {
        const A1 = pickOne(rng, [200, 300, 400, 500]);
        const k = pickOne(rng, [2, 3]);
        const A2 = k * A1;
        const F = pickOne(rng, [60, 90, 120, 150, 180]);
        const sigma = (F * 1000) / (A1 + A2);
        const ask1 = rng() < 0.5;
        const F1 = (F * A1) / (A1 + A2);
        const F2 = (F * A2) / (A1 + A2);
        const { options, answer } = numericOptions({
          correct: sigma,
          unit: 'MPa',
          digits: 1,
          correctWhy: `Mesma deformação e mesmo E → mesma tensão: σ = F/(A₁ + A₂) = ${fmt(F * 1000)}/${A1 + A2} = ${fmt(sigma, 1)} MPa.`,
          distractors: [
            { value: (F * 1000) / 2 / (ask1 ? A1 : A2), why: 'Dividiu a carga igualmente entre as colunas; a mais rígida (maior área) leva mais.' },
            { value: (F * 1000) / (ask1 ? A1 : A2), why: 'Pôs a carga toda numa coluna só.' },
            { value: ask1 ? (F2 * 1000) / A1 : (F1 * 1000) / A2, why: 'Trocou as forças: a coluna de **maior** área leva a **maior** força.' },
            { value: sigma * k, why: 'Achou que a tensão é proporcional à área; com o mesmo encurtamento, as tensões são iguais.' },
          ],
        });
        return {
          prompt: `Uma plataforma rígida e horizontal, com carga centrada de **${F} kN**, apoia-se em duas colunas do mesmo material e do mesmo comprimento, com áreas A₁ = **${A1} mm²** e A₂ = **${A2} mm²**, posicionadas de modo que a plataforma desça sem girar. A tensão normal na coluna **${ask1 ? '1' : '2'}** é, em MPa,`,
          options,
          answer,
          hint: 'Plataforma rígida descendo sem girar → as duas colunas encurtam o mesmo. Mesmo E e mesmo L → mesma deformação → mesma tensão.',
          steps: [
            `F₁ + F₂ = ${F} kN.`,
            `A plataforma desce sem girar → δ₁ = δ₂; mesmo E e mesmo L → F₁/A₁ = F₂/A₂ (tensões iguais).`,
            `σ = ${fmt(F * 1000)}/(${A1} + ${A2}) = **${fmt(sigma, 1)} MPa** nas duas (F₁ = ${fmt(F1, 1)} kN e F₂ = ${fmt(F2, 1)} kN).`,
          ],
          explanation: `Compatibilidade: δ₁ = δ₂ → F₁L/(A₁E) = F₂L/(A₂E) → F₁/A₁ = F₂/A₂: as **tensões são iguais**.\n\nσ = F/(A₁ + A₂) = ${fmt(F * 1000)} N/${A1 + A2} mm² = **${fmt(sigma, 1)} MPa** nas duas. As forças é que diferem: F₁ = ${fmt(F1, 1)} kN e F₂ = ${fmt(F2, 1)} kN (a coluna ${k} vezes mais larga leva ${k} vezes mais força).`,
        };
      },
    },
    {
      id: 'mec-res-23',
      difficulty: 2,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Num ponto da superfície de um eixo submetido a **torção pura**, as tensões principais são',
      options: [
        { text: 'iguais em módulo e de sinais contrários (σ₁ = τ e σ₂ = −τ).', why: 'Correta: cisalhamento puro — o círculo de Mohr fica centrado na origem.' },
        { text: 'iguais em módulo e de mesmo sinal.', why: 'Isso seria uma tração (ou compressão) biaxial igual.' },
        { text: 'diferentes em módulo e de mesmo sinal.', why: 'No cisalhamento puro, a média das normais é zero.' },
        { text: 'nulas, porque só há tensão de cisalhamento.', why: 'As tensões principais existem — só estão a 45° do eixo.' },
        { text: 'diferentes em módulo e de sinais contrários.', why: 'Isso acontece quando se soma uma carga axial à torção.' },
      ],
      answer: 0,
      roteiro: 'mohr',
      steps: [
        'Torção pura: σ_{x} = σ_{y} = 0 → C = 0.',
        'R = √(0 + τ²) = τ.',
        'σ₁ = +τ e σ₂ = −τ: **iguais em módulo e de sinais contrários**, a 45° do eixo.',
      ],
      explanation: 'Na torção pura, o elemento da superfície tem só τ (σ_{x} = σ_{y} = 0). O círculo de Mohr tem centro na origem e raio τ: **σ₁ = +τ** e **σ₂ = −τ**, a 45° do eixo — por isso o giz quebra em hélice a 45° e o ferro fundido torcido rompe assim.',
    },
    {
      id: 'mec-res-24',
      type: 'gen',
      difficulty: 2,
      lessonRef: 7,
      title: 'Tensões principais (Mohr)',
      roteiro: 'mohr',
      generate(rng) {
        const c = pickOne(rng, [-20, 0, 20, 40, 60]);
        const [a, t, R] = pickOne(rng, [
          [30, 40, 50],
          [40, 30, 50],
          [60, 80, 100],
          [80, 60, 100],
          [15, 20, 25],
          [20, 15, 25],
        ]);
        const sx = c + a;
        const sy = c - a;
        const what = pickOne(rng, ['s1', 's2', 'tmax'] as const);
        const correct = what === 's1' ? c + R : what === 's2' ? c - R : R;
        const label = what === 's1' ? 'a tensão principal máxima σ₁' : what === 's2' ? 'a tensão principal mínima σ₂' : 'a tensão de cisalhamento máxima no plano';
        const { options, answer } = numericOptions({
          correct,
          unit: 'MPa',
          digits: 1,
          correctWhy: `Centro = (σx + σy)/2 = ${c}; raio = √(${a}² + ${t}²) = ${R}. ${what === 's1' ? `σ₁ = ${c} + ${R}` : what === 's2' ? `σ₂ = ${c} − ${R}` : `τ_{máx} = R`} = ${correct} MPa.`,
          distractors: [
            { value: what === 'tmax' ? R / 2 : what === 's1' ? c + a : c - a, why: what === 'tmax' ? 'Dividiu o raio por 2: o τ máximo no plano é o próprio raio.' : 'Usou só a meia-diferença das normais e esqueceu o cisalhamento no raio.' },
            { value: what === 'tmax' ? a : what === 's1' ? sx + t : sy - t, why: 'Somou o cisalhamento direto à tensão normal; o certo é combinar os dois no raio do círculo.' },
            { value: what === 'tmax' ? t : what === 's1' ? c + R / 2 : c - R / 2, why: what === 'tmax' ? 'Esse é só o cisalhamento no plano original.' : 'Usou metade do raio.' },
            { value: what === 'tmax' ? 2 * R : what === 's1' ? c - R : c + R, why: what === 'tmax' ? 'Esse é o diâmetro do círculo (σ₁ − σ₂).' : 'Trocou a máxima pela mínima.' },
          ],
        });
        return {
          prompt: `Num ponto, o estado plano de tensões é σ_{x} = **${sx} MPa**, σ_{y} = **${sy} MPa** e τ_{xy} = **${t} MPa**. Pelo círculo de Mohr, ${label} vale, em MPa,`,
          options,
          answer,
          hint: 'Centro = (σx + σy)/2; raio = √[((σx − σy)/2)² + τ²]. σ₁,₂ = centro ± raio; τ_{máx} (no plano) = raio.',
          steps: [
            `C = (${fmt(sx)} + ${sy < 0 ? `(${fmt(sy)})` : fmt(sy)})/2 = ${fmt(c)} MPa.`,
            `R = √[((${fmt(sx)} − ${sy < 0 ? `(${fmt(sy)})` : fmt(sy)})/2)² + ${t}²] = √(${a}² + ${t}²) = ${R} MPa.`,
            `σ₁ = ${fmt(c + R)} MPa; σ₂ = ${fmt(c - R)} MPa; τ_{máx} = ${R} MPa. Pedido: **${fmt(correct)} MPa**.`,
          ],
          explanation: `Centro C = (${sx} + ${sy})/2 = ${c} MPa. Raio R = √[((${sx} − ${sy})/2)² + ${t}²] = √(${a}² + ${t}²) = ${R} MPa.\n\nσ₁ = C + R = ${c + R} MPa; σ₂ = C − R = ${c - R} MPa; τ_{máx} = R = ${R} MPa. Pedido: **${correct} MPa**.`,
        };
      },
    },
    {
      id: 'mec-res-25',
      difficulty: 3,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Um eixo de seção circular está sujeito a um **torque** e a uma **força axial de compressão**. Num ponto da superfície, as tensões principais são',
      options: [
        { text: 'diferentes em módulo e de sinais contrários.', why: 'Correta: o círculo de Mohr se desloca para a esquerda (σ_{x} < 0), mas ainda cruza a origem: σ₁ > 0 > σ₂, com |σ₂| > σ₁.' },
        { text: 'iguais em módulo e de sinais contrários.', why: 'Só na torção **pura** (círculo centrado na origem).' },
        { text: 'iguais em módulo e ambas negativas.', why: 'Com cisalhamento, as duas principais não podem ser iguais.' },
        { text: 'diferentes em módulo e ambas negativas.', why: 'Como o raio (√((σ/2)² + τ²)) é maior que |σ/2|, a máxima é positiva.' },
        { text: 'nulas, pois os efeitos se cancelam.', why: 'Torque e compressão não se cancelam.' },
      ],
      answer: 0,
      roteiro: 'mohr',
      steps: [
        'σ_{x} = −P/A (compressão) e σ_{y} = 0 → C = σ_{x}/2 < 0.',
        'R = √[(σ_{x}/2)² + τ²] > |σ_{x}/2|.',
        'σ₁ = C + R > 0 e σ₂ = C − R < 0, com |σ₂| > σ₁: **diferentes em módulo e de sinais contrários**.',
      ],
      explanation: 'Elemento da superfície: σ_{x} = −P/A e τ = T·c/J. Centro do círculo em σ_{x}/2 < 0 e raio R = √[(σ_{x}/2)² + τ²] > |σ_{x}/2|. Logo **σ₁ = σ_{x}/2 + R > 0** e **σ₂ = σ_{x}/2 − R < 0**, com |σ₂| > σ₁: sinais contrários e módulos diferentes.',
    },
    {
      id: 'mec-res-26',
      difficulty: 2,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Uma viga reta, num plano, apoia-se num apoio de 2º gênero (articulação fixa) e em dois apoios de 1º gênero (roletes). Ela é estaticamente indeterminada porque o número de reações incógnitas e o número de equações da estática são, respectivamente,',
      shuffle: false,
      options: [
        { text: '3 e 3', why: 'Seriam 3 incógnitas só com um rolete — a viga seria isostática.' },
        { text: '4 e 2', why: 'No plano há três equações de equilíbrio (ΣFx, ΣFy, ΣM).' },
        { text: '4 e 3', why: 'Correta: 2 reações na articulação + 1 em cada rolete = 4; equações = 3 → hiperestática de grau 1.' },
        { text: '5 e 3', why: 'Um rolete tem só uma reação; a articulação, duas.' },
        { text: '6 e 3', why: 'Contou reações demais.' },
      ],
      answer: 2,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: reações **incógnitas** × **equações** da estática, no plano.',
        'No plano há 3 equações (ΣF_{x}, ΣF_{y} e ΣM). Articulação fixa = 2 reações; cada rolete = 1 → 2 + 1 + 1 = 4.',
        'Fica **4 e 3**: hiperestática de grau 1, que pede uma equação de compatibilidade.',
      ],
      explanation: 'No plano: **3 equações** (ΣF_{x} = 0, ΣF_{y} = 0, ΣM = 0). Articulação fixa = 2 reações; rolete = 1. Com 4 incógnitas, sobra **1** — a viga é **hiperestática de grau 1** e precisa de uma equação de compatibilidade (deformação) para ser resolvida.',
    },
  ],
  games: [
    {
      id: 'mec-res-g1',
      type: 'match',
      title: 'Grandezas da resistência dos materiais',
      intro: 'Ligue cada grandeza à sua definição.',
      lessonRef: 3,
      leftLabel: 'Grandeza',
      rightLabel: 'Definição',
      perRound: 6,
      pairs: [
        { left: 'Tensão normal', right: 'Força por área da seção (MPa = N/mm²)', why: 'σ = F/A.' },
        { left: 'Deformação', right: 'Variação de comprimento por comprimento original', why: 'ε = δ/L (adimensional).' },
        { left: 'Módulo de elasticidade', right: 'Inclinação da reta σ × ε no regime elástico', why: 'Aço ≈ 200 GPa.' },
        { left: 'Coeficiente de Poisson', right: 'Razão entre deformação transversal e longitudinal (com sinal trocado)', why: 'Aço ≈ 0,3.' },
        { left: 'Limite de escoamento', right: 'Tensão em que começa a deformação permanente', why: 'Critério de projeto para dúcteis.' },
        { left: 'Limite de resistência', right: 'Maior tensão do diagrama tensão-deformação', why: 'Depois dele vem a estricção.' },
        { left: 'Fator de segurança', right: 'Razão entre a tensão de falha e a tensão admissível', why: 'σ_{adm} = σ_{falha}/FS.' },
        { left: 'Estricção', right: 'Redução localizada da seção antes da ruptura', why: 'Típica de materiais dúcteis.' },
      ],
    },
    {
      id: 'mec-res-g2',
      type: 'sort',
      title: 'Dúctil ou frágil?',
      intro: 'Classifique o comportamento típico de cada material à temperatura ambiente.',
      lessonRef: 3,
      bins: ['Dúctil', 'Frágil'],
      items: [
        { text: 'Aço de baixo carbono', bin: 0, why: 'Grande alongamento antes da ruptura e escoamento nítido.' },
        { text: 'Ferro fundido cinzento', bin: 1, why: 'As lamelas de grafita concentram tensões: rompe quase sem deformar.' },
        { text: 'Ferro fundido nodular', bin: 0, why: 'A grafita em nódulos (esferas) dá ductilidade — também chamado de ferro fundido dúctil.' },
        { text: 'Cobre', bin: 0, why: 'Muito dúctil (fios, tubos).' },
        { text: 'Alumínio', bin: 0, why: 'Dúctil e fácil de conformar.' },
        { text: 'Vidro', bin: 1, why: 'Rompe sem deformação plástica.' },
        { text: 'Cerâmica técnica (alumina)', bin: 1, why: 'Dura, resistente à compressão, frágil em tração.' },
        { text: 'Concreto', bin: 1, why: 'Ótimo em compressão, frágil em tração.' },
        { text: 'Aço temperado sem revenimento', bin: 1, why: 'Martensita não revenida: muito dura e pouco tenaz.' },
        { text: 'Latão', bin: 0, why: 'Liga de cobre e zinco, dúctil.' },
        { text: 'Ferro fundido branco', bin: 1, why: 'Carbono na forma de cementita: duríssimo e frágil.' },
      ],
    },
    {
      id: 'mec-res-g3',
      type: 'order',
      title: 'Roteiro do ensaio de tração',
      intro: 'Coloque as etapas do ensaio na ordem em que o laboratório as executa.',
      lessonRef: 5,
      steps: [
        { text: 'Medir o diâmetro inicial e marcar o comprimento de referência L₀ no corpo de prova', why: 'σ = F/A₀ e ε = ΔL/L₀ usam as medidas **iniciais**.' },
        { text: 'Prender o corpo de prova nas garras, alinhado com o eixo da máquina', why: 'Desalinhamento soma flexão à tração e falseia o resultado.' },
        { text: 'Instalar o extensômetro entre as marcas', why: 'Mede o alongamento com precisão no trecho elástico (E e escoamento).' },
        { text: 'Aplicar a carga com velocidade controlada, registrando força e alongamento', why: 'Daí sai o diagrama tensão × deformação.' },
        { text: 'Retirar o extensômetro depois do escoamento', why: 'Protege o instrumento antes da estricção e da ruptura.' },
        { text: 'Seguir até a ruptura, registrando a força máxima', why: 'σ_{r} = F_{máx}/A₀.' },
        { text: 'Juntar as partes e medir o comprimento final e o diâmetro na fratura', why: 'Alongamento (L_{f} − L₀)/L₀ e estricção (A₀ − A_{f})/A₀: as medidas de ductilidade.' },
      ],
    },
    {
      id: 'mec-res-lab1',
      type: 'lab',
      lab: 'tensile',
      title: 'O ensaio de tração na bancada',
      intro: 'Uma máquina universal de verdade, em câmera lenta: aposte no que acontece antes de ver e cumpra as missões de laboratório.',
      lessonRef: 6,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { mat: 0, eps: 0.1 },
          prompt: 'O aço 1020 está a **0,1 %** de deformação, no trecho elástico (σ = 200 MPa). Você vai **retirar a carga**. Quanto sobra de deformação permanente?',
          change: { unload: 1 },
          options: ['Nada: no trecho elástico ele volta ao comprimento original', 'Os mesmos 0,1 %: toda deformação é permanente', 'Metade, 0,05 %', 'Depende da velocidade de descarga'],
          answer: 0,
          expect: [
            { out: 'ep', trend: 'same' },
            { out: 'sig', trend: 'down' },
            { out: 'def', trend: 'down' },
          ],
          why: 'Abaixo do escoamento a deformação é **elástica**: as ligações atômicas se esticam e voltam. Sem carga, o corpo de prova retorna aos 50 mm originais.',
        },
        {
          kind: 'predict',
          setup: { mat: 0, eps: 10, unload: 1 },
          prompt: 'O aço 1020 foi esticado até **10 %** (σ ≈ 356 MPa) e descarregado: sobraram 9,8 % permanentes. Ao **recarregar**, quando ele volta a escoar?',
          change: { unload: 0 },
          options: ['Só perto dos 356 MPa em que parou: o escoamento subiu (encruamento)', 'Nos mesmos 250 MPa do início do ensaio', 'Logo no começo: o aço ficou mais fraco', 'Nunca mais: agora ele rompe sem escoar'],
          answer: 0,
          expect: [
            { out: 'sig', trend: 'up' },
            { out: 'ep', trend: 'same' },
          ],
          why: 'A recarga sobe pela mesma reta paralela à elástica e só reencontra a curva em ≈ 356 MPa. O material **encruou**: o novo limite de escoamento é mais alto (e a ductilidade restante, menor). É o que a trefilação e a laminação a frio fazem de propósito.',
        },
        {
          kind: 'predict',
          setup: { mat: 0, eps: 0.1 },
          prompt: 'Aço 1020 a 0,1 % de deformação, com 200 MPa. Trocando pelo **aço 4140 temperado e revenido** — quase três vezes mais resistente — e mantendo a mesma deformação, a tensão…',
          change: { mat: 1 },
          options: ['não muda: o módulo de elasticidade é o mesmo e σ = E·ε', 'quase triplica, acompanhando a resistência', 'cai, porque o aço temperado é mais frágil', 'vai a zero: o aço temperado rompe'],
          answer: 0,
          expect: [
            { out: 'sig', trend: 'same' },
            { out: 'E', trend: 'same' },
          ],
          why: 'No trecho elástico, σ = E·ε, e **E ≈ 200 GPa para qualquer aço**: depende das ligações entre os átomos de ferro, não da microestrutura. O tratamento térmico sobe o **escoamento** (de 250 para ≈ 700 MPa), não a rigidez.',
        },
        {
          kind: 'predict',
          setup: { mat: 0, eps: 0.1 },
          prompt: 'Aço 1020 a 0,1 % de deformação, com 200 MPa. Trocando pelo **alumínio 6061-T6** e mantendo a deformação, a tensão…',
          change: { mat: 2 },
          options: ['cai para cerca de um terço: o alumínio tem E ≈ 70 GPa', 'não muda: no trecho elástico todos os metais são iguais', 'sobe, porque o alumínio é mais leve', 'cai pela metade, porque o alumínio é menos resistente'],
          answer: 0,
          expect: [
            { out: 'sig', trend: 'down' },
            { out: 'F', trend: 'down' },
            { out: 'E', trend: 'down' },
          ],
          why: 'σ = E·ε = 70.000 MPa × 0,001 = **70 MPa**, contra 200 MPa do aço. O alumínio é cerca de três vezes **menos rígido**: sob a mesma tensão, deforma três vezes mais.',
        },
        {
          kind: 'goal',
          setup: { mat: 0, eps: 5 },
          lock: ['mat', 'unload'],
          prompt: 'Leve o corpo de prova de aço 1020 até a **maior força** que ele suporta.',
          goals: [{ out: 'F', min: 39.8, label: 'força máxima' }],
          hint: 'A força sobe enquanto o encruamento ganha da redução de área. Avance a deformação e observe quando a força para de subir.',
          solution: { eps: 20 },
          why: 'O ponto mais alto da curva de engenharia é o **limite de resistência**: σ_{r} = F_{máx}/A₀ = 40 kN / 100 mm² = 400 MPa, a cerca de 20 % de deformação. Dali em diante começa a estricção e a força cai.',
        },
        {
          kind: 'goal',
          setup: { mat: 0, eps: 0 },
          lock: ['mat'],
          prompt: 'Um cliente quer uma barra de aço 1020 **esticada a frio**, com **5 % de deformação permanente** (entre 4,8 % e 5,2 %), entregue já **sem carga**.',
          goals: [
            { out: 'ep', min: 4.8, max: 5.2 },
            { out: 'sig', max: 1, label: 'sem carga' },
          ],
          hint: 'Ao descarregar, o aço recupera σ/E (cerca de 0,15 % nessa faixa). Passe um pouco de 5 % e retire a carga.',
          solution: { eps: 5.2, unload: 1 },
          why: 'Descarregando a 5,2 %, o aço volta σ/E = 304/200.000 ≈ 0,15 % e ficam ≈ 5,05 % permanentes. De quebra, a barra sai encruada: escoamento mais alto que os 250 MPa originais.',
        },
        {
          kind: 'goal',
          setup: { mat: 2, eps: 0 },
          lock: ['mat', 'unload'],
          prompt: 'No alumínio 6061-T6, aplique **cerca de 200 MPa** (entre 195 e 215 MPa) **sem deixar deformação permanente**.',
          goals: [
            { out: 'sig', min: 195, max: 215 },
            { out: 'ep', max: 0.01 },
          ],
          hint: 'No trecho elástico, ε = σ/E, com E = 70 GPa. Para o ajuste fino, arraste no gráfico ampliado.',
          solution: { eps: 0.29 },
          why: 'ε = σ/E = 200/70.000 ≈ 0,29 %, abaixo do escoamento (≈ 276 MPa): tudo volta ao descarregar. No aço, os mesmos 200 MPa pediriam só 0,1 %.',
        },
        {
          kind: 'predict',
          setup: { mat: 3, eps: 0.3 },
          prompt: 'O ferro fundido cinzento está a **0,3 %** de deformação, com cerca de 156 MPa. Você vai puxar até **2 %**, o que um aço doce aguenta sem problema. O que acontece?',
          change: { eps: 2 },
          options: ['Rompe antes de 0,5 %, sem escoar e sem pescoço', 'Escoa como o aço e encrua até 2 %', 'Forma pescoço e rompe em taça e cone', 'Nada: o ferro fundido é mais resistente que o aço'],
          answer: 0,
          expect: [
            { out: 'broken', trend: 'up' },
            { out: 'F', trend: 'down' },
          ],
          why: 'O ferro fundido **cinzento** é frágil: as lamelas de grafita funcionam como trincas e ele rompe a cerca de 200 MPa e 0,45 % de deformação, com fratura plana. Por isso se dimensiona material frágil pelo **limite de resistência**.',
        },
        {
          kind: 'predict',
          setup: { mat: 0, eps: 1 },
          prompt: 'A **resiliência** é a energia que o material absorve sem deformar permanentemente: U_{r} = σ_{e}²/(2E). Trocando o aço 1020 (σ_{e} = 250 MPa, E = 200 GPa) pelo alumínio 6061-T6 (σ_{e} ≈ 276 MPa, E = 70 GPa), a resiliência…',
          change: { mat: 2 },
          options: ['aumenta mais de três vezes: σ_{e} parecido e E bem menor', 'diminui, porque o alumínio é menos resistente', 'não muda: depende só do limite de escoamento', 'diminui, porque o alumínio é menos rígido'],
          answer: 0,
          expect: [{ out: 'Ur', trend: 'up' }],
          why: 'U_{r} = 250²/(2 × 200.000) ≈ 0,16 MJ/m³ no aço; 276²/(2 × 70.000) ≈ 0,54 MJ/m³ no alumínio. E pequeno com σ_{e} alto armazena mais energia elástica — a lógica das **molas**, feitas de aços de escoamento muito alto.',
        },
        {
          kind: 'predict',
          setup: { mat: 0, eps: 22 },
          prompt: 'Passado o limite de resistência, o aço 1020 já tem **pescoço**. Indo de 22 % para 28 % de deformação, a força cai. E a **tensão verdadeira** (força dividida pela área real do pescoço)?',
          change: { eps: 28 },
          options: ['Sobe: a área do pescoço cai mais depressa que a força', 'Cai junto com a força', 'Fica constante, igual ao limite de resistência', 'Vai a zero'],
          answer: 0,
          expect: [
            { out: 'F', trend: 'down' },
            { out: 'sv', trend: 'up' },
            { out: 'd', trend: 'down' },
          ],
          why: 'De 22 % para 28 %, a força cai de 39,8 para 36,4 kN, mas o diâmetro do pescoço afina de 9,8 para 8,3 mm: F/A sobe de ≈ 520 para ≈ 670 MPa. O material continua encruando; quem "perde" é a área.',
        },
      ],
    },
  ],
});
