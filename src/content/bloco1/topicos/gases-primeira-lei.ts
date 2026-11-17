import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

export default defineTopic({
  id: 'mec.gases-1a-lei',
  name: 'Gases perfeitos, 1ª e 2ª leis',
  summary: 'Propriedades de estado, equação dos gases perfeitos, trabalho de fronteira, o balanço de energia Q − W = ΔU e a 2ª lei: Carnot, Clausius, Kelvin-Planck e entropia.',
  order: 1,
  weight: 3,
  equipment: 'vessel',
  edital: ['b1.termo-propriedades', 'b1.gases', 'b1.termo-1lei', 'b1.termo-2lei'],
  lesson: [
    {
      title: 'Estado e propriedades',
      body: 'O **estado** de um sistema é descrito por suas **propriedades** (P, T, v, u, h, s...). Elas dependem só do estado atual, não do caminho percorrido até ele.\n\n- **Intensivas** não dependem da quantidade de matéria: pressão, temperatura, massa específica.\n- **Extensivas** dependem: massa, volume, energia interna, entalpia, entropia.\n- **Específicas** (extensiva ÷ massa) se comportam como intensivas: v = V/m, u = U/m, h = H/m.\n\n**Calor (Q)** e **trabalho (W)** NÃO são propriedades: são energia em trânsito e dependem do caminho.\n\n**Postulado de estado:** para uma substância pura simples compressível, **duas propriedades intensivas independentes** definem o estado. Na mudança de fase, P e T **não** são independentes (a água ferve a 100 °C só se P = 1 atm): aí é preciso P (ou T) **e** o título, o v, o h...',
      example: 'Divida um tanque de ar ao meio com uma placa: cada metade tem a mesma P e a mesma T (intensivas), mas metade do volume e da massa (extensivas).',
      hot: 'Quantas propriedades definem o estado? **Duas intensivas independentes** — inclusive para o ar tratado como substância pura numa só fase. Caiu na Transpetro 2012 e na Petrobras 2014 e 2018.',
      tip: '**Teste da divisão:** divida o sistema ao meio. O que não muda é intensivo.',
      trap: '"Volume **específico**" é intensivo, apesar do "volume" no nome. E calor e trabalho não são propriedades de estado.',
    },
    {
      title: 'Gás perfeito',
      body: 'Para gases a baixa pressão e temperatura alta (longe do ponto crítico):\n\n**P·v = R·T**   ou   **P·V = m·R·T**\n\n- **P** e **T** sempre **absolutas** (Pa e K);\n- **R = R̄/M** é a constante do gás: ar ≈ 0,287 kJ/(kg·K); R̄ = 8,314 kJ/(kmol·K);\n- para massa fixa: **P_{1}·V_{1}/T_{1} = P_{2}·V_{2}/T_{2}**.\n\nNo gás perfeito, **u e h dependem só de T**: Δu = c_{v}·ΔT e Δh = c_{p}·ΔT, com c_{p} − c_{v} = R e k = c_{p}/c_{v} (ar ≈ 1,4). Por definição, **c_{v} = (∂u/∂T)_{v}** e **c_{p} = (∂h/∂T)_{p}**.\n\nQuanto o gás real foge do perfeito? Pelo **fator de compressibilidade Z = P·v/(R·T)**: Z ≈ 1 longe do ponto crítico. O **diagrama generalizado de compressibilidade** (Z × pressão reduzida, para cada temperatura reduzida) diz se o modelo serve.',
      example: 'Tanque rígido com ar a 200 kPa e 27 °C (300 K) aquecido até 177 °C (450 K). Volume constante → P_{2} = 200 × 450/300 = **300 kPa**.',
      hot: 'Tanque rígido que **vaza**: a massa muda, então escreva P·V = m·R·T antes e depois (m₂ = m₁ − massa perdida). Caiu na Petrobras Biocombustível 2010 e na Petrobras 2011. Também caem as definições de c_{v} e c_{p} (Transpetro 2018) e o diagrama de compressibilidade (Petrobras 2014).',
      tip: 'Use **kPa, m³, kg, kJ/(kg·K) e K**: P·V = m·R·T fecha sem nenhuma conversão.',
      trap: 'Usar °C na razão de temperaturas (200 × 177/27 daria 1.311 kPa!) ou usar a pressão manométrica no lugar da absoluta.',
    },
    {
      title: 'Processos e trabalho de fronteira',
      body: 'Trabalho de fronteira (pistão em um cilindro): **W = ∫P·dV**, a área sob a curva no diagrama P–V.\n\n- **Isobárico** (P constante): W = P·(V_{2} − V_{1})\n- **Isocórico** (V constante): W = 0\n- **Isotérmico** (gás perfeito): W = P_{1}·V_{1}·ln(V_{2}/V_{1})\n- **Politrópico** (P·V^{n} = constante, n ≠ 1): W = (P_{2}·V_{2} − P_{1}·V_{1})/(1 − n)\n- **Adiabático reversível** (isentrópico) no gás perfeito: politrópico com **n = k**.',
      example: 'Pressão constante de 500 kPa, volume de 0,2 m³ para 0,5 m³: W = 500 × 0,3 = **150 kJ**.',
      hot: 'Trabalho **politrópico**: a Petrobras 2018 deu P·V² = constante e pediu o trabalho de expansão. Ache P₂ = P₁·(V₁/V₂)^{n} e use W = (P₂V₂ − P₁V₁)/(1 − n).',
      tip: '**kPa × m³ = kJ.** Trabalhe nessas unidades e o trabalho sai direto em kJ. E os expoentes em ordem: **n = 0** isobárico, **n = 1** isotérmico, **n = k** isentrópico, **n → ∞** isocórico.',
      lab: { lab: 'piston', preset: { proc: 4, n: 0, v2: 2 }, label: 'Ver os processos no pistão' },
    },
    {
      title: '1ª lei para sistema fechado',
      body: '**Q − W = ΔU** (+ ΔE_{c} + ΔE_{p}, se houver)\n\nConvenção mais usada: **Q > 0** quando o calor **entra** no sistema; **W > 0** quando o sistema **realiza** trabalho (expansão).\n\nCasos que caem:\n- **Isocórico:** W = 0 → Q = ΔU\n- **Isotérmico (gás perfeito):** ΔU = 0 → Q = W\n- **Adiabático:** Q = 0 → W = −ΔU (expande e esfria)\n- **Ciclo:** ΔU = 0 → Q_{líq} = W_{líq}',
      example: 'Um gás recebe 80 kJ de calor e realiza 30 kJ de trabalho: ΔU = 80 − 30 = **+50 kJ**.',
      hot: '**Tanque rígido** com água mudando de fase: o volume não muda, então **W = 0** e Q = ΔU = m·(u₂ − u₁), mesmo com líquido virando vapor. A Petrobras 2018 deu o calor e a energia interna e perguntou o **trabalho** (zero!). Já na vaporização a pressão constante, W = P·ΔV e ΔU = Q − P·ΔV (Petrobras 2012).',
      tip: '**Q entra, W sai:** ΔU = (o que entrou como calor) − (o que saiu como trabalho).',
      trap: 'Alguns livros usam W > 0 para trabalho feito **sobre** o sistema (aí fica Q + W = ΔU). Veja como o enunciado define o sinal.',
      lab: { lab: 'piston', preset: { proc: 0, t2: 327 }, label: 'Ver Q = ΔU + W no pistão' },
    },
    {
      title: 'Volume de controle (regime permanente)',
      body: 'Quando há escoamento, a energia que entra e sai com a massa é contada pela **entalpia** h = u + P·v. Por unidade de tempo (kW e kg/s):\n\n**Q − W = m·[(h_{2} − h_{1}) + (V_{2}^{2} − V_{1}^{2})/2 + g·(z_{2} − z_{1})]**\n\n- **Turbina e compressor** adiabáticos: W = m·(h_{1} − h_{2})\n- **Bocal:** a entalpia vira energia cinética\n- **Válvula de estrangulamento:** **h_{1} = h_{2}** (isentálpica)\n- **Trocador de calor:** sem trabalho; o calor de um fluido vai para o outro\n\nEm compressores e bombas, o trabalho reversível é **w = ∫v·dP**: quanto menor o volume específico durante a compressão, menor o trabalho. Por isso bombear líquido custa muito menos que comprimir gás — e resfriar o gás entre estágios (**intercooler**) economiza potência.',
      hot: '**Turbina em regime permanente** é figurinha certa: Ẇ = ṁ·(h₁ − h₂) + Q̇, com Q̇ **negativo** quando ela perde calor (a potência cai). Às vezes entra a velocidade: Δe_{c} = (V₂² − V₁²)/2 em J/kg — divida por 1.000 para kJ/kg. Caiu na Transpetro 2008, 2011 e 2012 e na Petrobras 2011 e 2014 (turbina e compressor).',
      tip: 'Turbina **produz** (h cai), compressor e bomba **consomem** (h sobe), válvula **não troca nada** (h igual dos dois lados).',
      trap: 'Na válvula de estrangulamento quem fica constante é a **entalpia**, não a temperatura (a temperatura só fica constante para gás perfeito).',
    },
    {
      title: '2ª lei: Carnot, Clausius e entropia',
      body: 'A 1ª lei conta a energia; a **2ª lei** diz para que lado as coisas acontecem.\n\n- **Kelvin-Planck (motor):** nenhum motor cíclico transforma em trabalho **todo** o calor que recebe de uma única fonte — sempre rejeita calor para uma fonte fria.\n- **Clausius (refrigerador):** calor não passa **sozinho** do frio para o quente — é preciso gastar trabalho.\n- **Carnot:** nenhum ciclo entre T_{Q} e T_{F} supera o reversível: **η_{máx} = 1 − T_{F}/T_{Q}**, **COP_{ref,máx} = T_{F}/(T_{Q} − T_{F})** e **COP_{BC,máx} = T_{Q}/(T_{Q} − T_{F})**, sempre em **kelvin**. No ciclo reversível, Q_{F}/Q_{Q} = T_{F}/T_{Q}.\n\n**Entropia:** ΔS_{sistema} = ∫δQ/T + S_{ger}, com **S_{ger} ≥ 0** (zero só no reversível). A entropia de um sistema **fechado** só **diminui** se ele **rejeitar calor**. Num ciclo completo, ΔS do fluido é zero; quem acumula a S_{ger} é a vizinhança.\n\n**Irreversibilidades** (geram entropia): atrito, expansão livre, troca de calor com diferença **finita** de temperatura, mistura, histerese, reação química, corrente elétrica numa resistência.',
      example: 'Motor entre 600 K e 300 K: η_{máx} = 1 − 300/600 = 50 %. Se ele recebe 1.000 kJ e rejeita 700 kJ (η = 30 %), a vizinhança ganha S_{ger} = 700/300 − 1.000/600 = 2,33 − 1,67 = **+0,67 kJ/K** > 0: possível, mas irreversível.',
      hot: '**Carnot em kelvin** é a questão mais repetida de termodinâmica: rendimento entre duas temperaturas, a temperatura da fonte fria a partir do rendimento ou o COP de um refrigerador. Caiu na Transpetro 2012 e na Petrobras 2012, 2014 e 2018. Também caem: o enunciado de Clausius × Kelvin-Planck (Petrobras 2014), a "invenção" com COP maior que o de Carnot (Petrobras 2011), o único jeito de diminuir a entropia — rejeitar calor (Transpetro 2011) — e o que torna um processo irreversível (Petrobras 2018).',
      tip: '**C**lausius fala do **C**alor que não sobe sozinho (geladeira); **K**elvin-Planck fala do motor que não **K**onverte tudo. Para checar uma "invenção": calcule o limite de Carnot e compare — se a promessa passa do limite, é impossível.',
      trap: 'Conta com °C: entre 400 °C e 40 °C, 1 − 40/400 daria 90 %, mas o certo é 1 − 313/673 ≈ 53 %. E "a entropia nunca diminui" vale para o **sistema isolado** (ou sistema + vizinhança), não para um sistema que perde calor.',
    },
  ],
  roteiros: [
    {
      id: 'trabalho-fronteira',
      name: 'Trabalho de fronteira (P·dV)',
      when: 'Gás num cilindro com pistão (ou num tanque) que se expande ou é comprimido; pedem o trabalho.',
      steps: [
        'Identifique o processo: P constante (isobárico), P·V^{n} = constante (politrópico), T constante (isotérmico) ou V constante.',
        'Escolha a fórmula: isobárico W = P·ΔV; politrópico W = (P₂V₂ − P₁V₁)/(1 − n); isotérmico W = P₁V₁·ln(V₂/V₁); volume constante W = 0.',
        'Calcule (kPa × m³ = kJ) e confira o sinal: expansão → W > 0.',
      ],
      note: '**Tanque rígido não realiza trabalho**, por mais números que o enunciado dê.',
    },
    {
      id: 'gas-perfeito',
      name: 'Equação de estado do gás perfeito',
      when: 'Gás num tanque ou cilindro muda de pressão, volume ou temperatura (com ou sem vazamento); pedem o estado final.',
      steps: [
        'Passe as temperaturas para kelvin e use pressões absolutas.',
        'Veja o que é constante (massa, volume, pressão) e escreva P·V = m·R·T antes e depois (sem vazamento: P₁V₁/T₁ = P₂V₂/T₂).',
        'Isole a incógnita e calcule.',
      ],
      note: 'Temperatura sempre em **kelvin**: usar °C é o distrator mais comum. Se a massa muda, calcule as massas antes e depois.',
    },
    {
      id: 'primeira-lei',
      name: '1ª lei para sistema fechado (ΔU = Q − W)',
      when: 'Dão calor e trabalho trocados por um gás, um ciclo ou uma mudança de fase; pedem ΔU, Q ou W.',
      steps: [
        'Fixe a convenção: Q > 0 entrando no sistema; W > 0 feito pelo sistema.',
        'Dê sinal a cada dado: calor perdido → Q < 0; trabalho recebido (compressão) → W < 0.',
        'Aplique ΔU = Q − W.',
      ],
      note: 'Ciclo: ΔU = 0 → Q = W. Isotérmico de gás perfeito: ΔU = 0 → Q = W. **Adiabático é Q = 0**, não W = 0.',
    },
    {
      id: 'carnot',
      name: 'Limite de Carnot (motor e refrigerador)',
      when: 'Motor, refrigerador ou bomba de calor entre duas temperaturas; pedem o rendimento ou o COP máximo, uma temperatura, ou se um anúncio é possível.',
      steps: [
        'Passe as temperaturas para kelvin.',
        'Escreva o limite: motor η = 1 − T_{F}/T_{Q}; refrigerador COP = T_{F}/(T_{Q} − T_{F}); bomba de calor COP = T_{Q}/(T_{Q} − T_{F}).',
        'Isole a incógnita ou compare: valor acima do de Carnot é impossível.',
      ],
      note: 'Em °C a conta sai absurda. O COP da bomba de calor é o do refrigerador + 1 — não troque um pelo outro.',
    },
    {
      id: 'volume-controle',
      name: '1ª lei em regime permanente (turbina, compressor, válvula)',
      when: 'Turbina, compressor, bomba, válvula ou trocador em regime permanente, com vazão e entalpias; pedem a potência, o calor ou o que se conserva.',
      steps: [
        'Escreva Q̇ − Ẇ = ṁ·(h₂ − h₁), desprezando as energias cinética e potencial.',
        'Dê sinal: calor perdido → Q̇ < 0; Ẇ > 0 é produzido (turbina), Ẇ < 0 é consumido (compressor). Válvula: Q̇ = 0 e Ẇ = 0.',
        'Isole a incógnita e confira se a potência sai produzida ou consumida.',
      ],
      note: 'Perda de calor reduz a potência da turbina e aumenta a do compressor. Válvula de estrangulamento: h₂ = h₁ (isentálpico).',
    },
    {
      id: 'entropia-gerada',
      name: 'Entropia gerada num ciclo',
      when: 'Motor ou refrigerador entre duas fontes, com os calores dados; pedem a entropia gerada ou se o ciclo é possível.',
      steps: [
        'Feche o balanço de energia: Q_{R} = Q_{A} − W = Q_{A}·(1 − η).',
        'O fluido volta ao estado inicial (ΔS = 0); cada fonte troca Q/T: a quente perde Q_{A}/T_{Q} e a fria ganha Q_{R}/T_{F}.',
        'S_{ger} = Q_{R}/T_{F} − Q_{A}/T_{Q}: > 0 possível (irreversível); = 0 reversível; < 0 impossível.',
      ],
      note: 'É o critério de Carnot escrito em entropia: rendimento acima do de Carnot dá S_{ger} negativo.',
    },
  ],
  questions: [
    {
      id: 'mec-gas-01',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Qual das grandezas abaixo é uma propriedade **intensiva**?',
      options: [
        { text: 'Volume', why: 'Extensiva: dobra quando a massa do sistema dobra.' },
        { text: 'Energia interna', why: 'Extensiva (U). A energia interna **específica**, u = U/m, é que se comporta como intensiva.' },
        { text: 'Temperatura', why: 'Correta: não depende da quantidade de matéria — metade do sistema tem a mesma temperatura.' },
        { text: 'Massa', why: 'Extensiva por definição.' },
        { text: 'Entalpia', why: 'Extensiva (H); só h = H/m é intensiva.' },
      ],
      answer: 2,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: propriedade **intensiva**.',
        'Teste: divida o sistema ao meio. O que não muda é intensivo (P, T, ρ, v); o que cai à metade é extensivo (m, V, U, H, S).',
        'Fica **temperatura**.',
      ],
      explanation: 'Intensivas não dependem do tamanho do sistema (P, T, ρ, v). Extensivas dependem (m, V, U, H, S). Divida o sistema ao meio: o que não muda é intensivo.',
    },
    {
      id: 'mec-gas-02',
      type: 'gen',
      difficulty: 1,
      lessonRef: 2,
      title: 'Trabalho em expansão isobárica',
      roteiro: 'trabalho-fronteira',
      generate(rng) {
        const P = pickOne(rng, [100, 150, 200, 250, 300, 400, 500]);
        const V1 = pickOne(rng, [0.1, 0.2, 0.3, 0.4]);
        const dV = pickOne(rng, [0.1, 0.2, 0.3, 0.5, 0.6]);
        const V2 = V1 + dV;
        const W = P * dV;
        const { options, answer } = numericOptions({
          correct: W,
          unit: 'kJ',
          digits: 2,
          correctWhy: `W = P·(V₂ − V₁) = ${fmt(P)} × ${fmt(dV)} = ${fmt(W)} kJ.`,
          distractors: [
            { value: P * V2, why: 'Usou só o volume final (P·V₂). O trabalho depende da **variação** de volume.' },
            { value: W / 1000, why: 'Achou que kPa·m³ dá joule e dividiu por 1.000. Na verdade, kPa·m³ = kJ.' },
            { value: P * (V1 + V2), why: 'Somou os volumes; o correto é a diferença V₂ − V₁.' },
            { value: -W, why: 'Sinal trocado: na expansão o gás **realiza** trabalho (W > 0 na convenção Q − W = ΔU).' },
          ],
        });
        return {
          prompt: `Um gás em um cilindro com pistão se expande de **${fmt(V1)} m³** para **${fmt(V2)} m³** sob pressão constante de **${fmt(P)} kPa**. O trabalho realizado pelo gás, em kJ, é`,
          options,
          answer,
          hint: 'Pressão constante: o trabalho é a área de um retângulo no diagrama P–V.',
          steps: [
            `Pressão constante (${fmt(P)} kPa) → processo **isobárico**.`,
            `W = P·(V₂ − V₁).`,
            `W = ${fmt(P)} × (${fmt(V2)} − ${fmt(V1)}) = **${fmt(W)} kJ** (expansão: positivo).`,
          ],
          explanation: `Processo **isobárico**: W = P·(V₂ − V₁) = ${fmt(P)} kPa × (${fmt(V2)} − ${fmt(V1)}) m³ = **${fmt(W)} kJ**.\n\nkPa × m³ = kN/m² × m³ = kN·m = **kJ**. O trabalho é positivo porque o gás se expande (realiza trabalho sobre a vizinhança).`,
        };
      },
    },
    {
      id: 'mec-gas-03',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Tanque rígido aquecido',
      roteiro: 'gas-perfeito',
      generate(rng) {
        const P1 = pickOne(rng, [100, 120, 150, 200, 300]);
        const T1c = 27;
        const T1 = 300;
        const T2c = pickOne(rng, [77, 127, 177, 227, 327]);
        const T2 = T2c + 273;
        const P2 = (P1 * T2) / T1;
        const { options, answer } = numericOptions({
          correct: P2,
          unit: 'kPa',
          digits: 1,
          correctWhy: `Volume constante: P₂ = P₁ × T₂/T₁ = ${fmt(P1)} × ${fmt(T2)}/${fmt(T1)} = ${fmt(P2, 1)} kPa (em kelvin).`,
          distractors: [
            { value: (P1 * T2c) / T1c, why: 'Usou °C. A razão entre temperaturas só vale em **kelvin**.' },
            { value: (P1 * T1) / T2, why: 'Inverteu a razão: aquecendo a volume constante, a pressão **aumenta**.' },
            { value: P1, why: 'Volume constante não significa pressão constante: aquecer aumenta a pressão.' },
            { value: (P1 * (T2 - T1)) / T1, why: 'Calculou só o **aumento** de pressão (ΔP = P₁·ΔT/T₁), não a pressão final.' },
          ],
        });
        return {
          prompt: `Um tanque **rígido** contém ar (gás perfeito) a **${fmt(P1)} kPa** (pressão absoluta) e **${T1c} °C**. O ar é aquecido até **${T2c} °C**. A pressão absoluta final, em kPa, é aproximadamente`,
          options,
          answer,
          hint: 'Tanque rígido = volume constante. E temperatura sempre em kelvin.',
          steps: [
            `T₁ = ${T1c} + 273 = ${T1} K; T₂ = ${T2c} + 273 = ${T2} K (pressões já absolutas).`,
            `Tanque rígido e fechado: V e m constantes → P₁/T₁ = P₂/T₂.`,
            `P₂ = ${fmt(P1)} × ${T2}/${T1} = **${fmt(P2, 1)} kPa**.`,
          ],
          explanation: `Massa e volume constantes: P₁/T₁ = P₂/T₂ → P₂ = P₁·T₂/T₁.\n\nT₁ = ${T1c} + 273 = ${T1} K; T₂ = ${T2c} + 273 = ${T2} K.\n\nP₂ = ${fmt(P1)} × ${T2}/${T1} = **${fmt(P2, 1)} kPa**.`,
        };
      },
    },
    {
      id: 'mec-gas-04',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: '1ª lei: calor, trabalho e energia interna',
      roteiro: 'primeira-lei',
      generate(rng) {
        const Q = pickOne(rng, [20, 30, 40, 50, 60, 80, 100, 120]);
        let W = pickOne(rng, [10, 15, 25, 35, 45, 70, 90]);
        if (Q === W) W += 5;
        const compression = rng() < 0.45;
        if (!compression) {
          const dU = Q - W;
          const { options, answer } = numericOptions({
            correct: dU,
            unit: 'kJ',
            digits: 0,
            correctWhy: `ΔU = Q − W = ${Q} − ${W} = ${dU} kJ.`,
            distractors: [
              { value: Q + W, why: 'Somou: o trabalho realizado **pelo** gás é energia que sai do sistema (subtrai).' },
              { value: W - Q, why: 'Sinais trocados: o calor recebido entra (+) e o trabalho realizado sai (−).' },
              { value: -(Q + W), why: 'Tratou as duas parcelas como saídas de energia.' },
            ],
          });
          return {
            prompt: `Um gás contido em um cilindro **recebe ${Q} kJ de calor** e **realiza ${W} kJ de trabalho** sobre a vizinhança. A variação da energia interna do gás é`,
            options,
            answer,
            steps: [
              `Q > 0 entrando; W > 0 feito pelo gás.`,
              `Recebe calor → Q = +${Q} kJ; realiza trabalho → W = +${W} kJ.`,
              `ΔU = ${Q} − ${W} = **${fmt(dU, 0)} kJ**.`,
            ],
            explanation: `1ª lei (sistema fechado, Q > 0 entrando e W > 0 realizado pelo sistema): ΔU = Q − W = ${Q} − ${W} = **${dU} kJ**.`,
          };
        }
        // compressão: trabalho entra (W < 0) e calor sai (Q < 0)
        const dU = W - Q;
        const { options, answer } = numericOptions({
          correct: dU,
          unit: 'kJ',
          digits: 0,
          correctWhy: `Q = −${Q} kJ (sai) e W = −${W} kJ (entra): ΔU = Q − W = −${Q} − (−${W}) = ${dU} kJ.`,
          distractors: [
            { value: W + Q, why: 'Somou: o calor **perdido** sai do sistema, então subtrai.' },
            { value: Q - W, why: 'Sinais trocados: o trabalho recebido aumenta a energia interna; o calor perdido diminui.' },
            { value: -(W + Q), why: 'Tratou o trabalho recebido como saída de energia.' },
          ],
        });
        return {
          prompt: `Um gás é **comprimido**, recebendo **${W} kJ de trabalho**, e ao mesmo tempo **perde ${Q} kJ de calor** para o ambiente. A variação da energia interna do gás é`,
          options,
          answer,
          steps: [
            `Q > 0 entrando; W > 0 feito pelo gás.`,
            `Perde calor → Q = −${Q} kJ; é comprimido (recebe trabalho) → W = −${W} kJ.`,
            `ΔU = (−${Q}) − (−${W}) = **${fmt(dU, 0)} kJ**.`,
          ],
          explanation: `Na convenção Q − W = ΔU: o calor perdido é Q = −${Q} kJ e o trabalho recebido (feito **sobre** o gás) é W = −${W} kJ.\n\nΔU = (−${Q}) − (−${W}) = **${dU} kJ**. Em palavras: entrou ${W} kJ como trabalho e saiu ${Q} kJ como calor.`,
        };
      },
    },
    {
      id: 'mec-gas-05',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Em uma expansão **isotérmica** de um gás perfeito, é correto afirmar que',
      options: [
        { text: 'não há troca de calor com a vizinhança.', why: 'Isso é o processo adiabático. No isotérmico, o gás recebe calor para manter T constante enquanto expande.' },
        { text: 'todo o calor recebido é convertido em trabalho.', why: 'Correta: no gás perfeito U depende só de T; com T constante, ΔU = 0 e Q = W.' },
        { text: 'o trabalho realizado é nulo.', why: 'Trabalho nulo é o processo isocórico (volume constante).' },
        { text: 'a energia interna do gás aumenta.', why: 'Com T constante, a energia interna de um gás perfeito não muda.' },
        { text: 'a pressão permanece constante.', why: 'Na expansão isotérmica a pressão cai: P·V = constante.' },
      ],
      answer: 1,
      roteiro: 'primeira-lei',
      steps: [
        'Q > 0 entrando; W > 0 feito pelo gás, que se expande.',
        'Gás perfeito: u depende só de T. Isotérmico → ΔU = 0.',
        '0 = Q − W → **Q = W**: todo o calor recebido vira trabalho. (A pressão cai: P₁V₁ = P₂V₂.)',
      ],
      explanation: 'Para gás perfeito, u = u(T). Se T não muda, ΔU = 0 e a 1ª lei dá **Q = W**: o calor que entra sai integralmente como trabalho de expansão. A pressão cai na proporção inversa do volume (P₁V₁ = P₂V₂).',
    },
    {
      id: 'mec-gas-06',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Em um **compressor** operando em regime permanente, um gás perfeito é comprimido da mesma pressão de entrada até a mesma pressão de descarga por três processos reversíveis: isotérmico, politrópico (1 < n < k) e adiabático. Sobre o trabalho específico de compressão, é correto afirmar que',
      options: [
        { text: 'o isotérmico exige o menor trabalho, e o adiabático, o maior.', why: 'Correta: w = ∫v·dP; resfriar o gás durante a compressão reduz v ao longo do caminho e, com ele, o trabalho.' },
        { text: 'o adiabático exige o menor trabalho, pois não há perda de calor.', why: 'Sem rejeitar calor o gás esquenta, o volume específico fica maior e o trabalho ∫v·dP aumenta: é o pior caso.' },
        { text: 'os três exigem o mesmo trabalho, pois as pressões inicial e final são iguais.', why: 'Trabalho depende do caminho — não é propriedade de estado.' },
        { text: 'o politrópico exige o menor trabalho.', why: 'O politrópico fica entre os dois extremos (isotérmico e adiabático).' },
        { text: 'o trabalho é o mesmo; só a temperatura de descarga muda.', why: 'Mudam a temperatura de descarga **e** o trabalho.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **trabalho de compressão** em regime permanente, entre as mesmas pressões.',
        'w = ∫v·dP: quanto mais o gás é resfriado durante a compressão, menor o volume específico no caminho e menor o trabalho.',
        'Isotérmico = **menor** trabalho; adiabático = **maior**. Por isso se usa resfriamento intermediário (intercooler).',
      ],
      explanation: 'Em regime permanente, o trabalho reversível de compressão é w = ∫v·dP. Quanto mais o gás é resfriado durante a compressão, menor o volume específico ao longo do caminho e menor o trabalho. O limite ideal é a compressão **isotérmica**; a **adiabática** é a que mais consome. Por isso compressores de múltiplos estágios usam **resfriamento intermediário** (intercooler).',
    },
    {
      id: 'mec-gas-07',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Vapor passa por uma válvula de estrangulamento parcialmente aberta, em regime permanente, sem troca de calor e com variações de energia cinética e potencial desprezíveis. Nesse processo, permanece constante a',
      options: [
        { text: 'entropia específica.', why: 'O estrangulamento é irreversível: a entropia **aumenta**.' },
        { text: 'pressão.', why: 'A pressão cai — é justamente a função da válvula.' },
        { text: 'entalpia específica.', why: 'Correta: sem Q, sem W e sem ΔE_{c}/ΔE_{p}, a 1ª lei para volume de controle dá h₁ = h₂.' },
        { text: 'temperatura, para qualquer fluido.', why: 'Só no gás perfeito (h = h(T)) a temperatura fica constante. Em fluidos reais ela costuma cair — é o efeito usado na refrigeração.' },
        { text: 'energia interna específica.', why: 'h = u + P·v: como P·v muda, u também muda.' },
      ],
      answer: 2,
      roteiro: 'volume-controle',
      steps: [
        'Válvula em regime permanente: Q̇ − Ẇ = ṁ·(h₂ − h₁).',
        'Sem troca de calor (Q̇ = 0) e sem eixo (Ẇ = 0).',
        'Sobra h₂ = h₁: processo **isentálpico** — a entalpia específica se conserva; a pressão cai e, em geral, a temperatura também.',
      ],
      explanation: 'Válvula de estrangulamento = processo **isentálpico**: Q = 0, W = 0, ΔE_{c} ≈ 0 → h_{entrada} = h_{saída}. É o que acontece na válvula de expansão do ciclo de refrigeração: a pressão cai, parte do líquido evapora e a temperatura despenca.',
    },
    {
      id: 'mec-gas-08',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Um engenheiro lê a **pressão** e a **temperatura** de um vapor superaquecido num tanque e, só com essas duas leituras, encontra nas tabelas o volume específico, a entalpia e a entropia. Isso é possível porque',
      options: [
        { text: 'o estado de uma substância pura simples compressível fica definido por duas propriedades intensivas independentes.', why: 'Correta: é o postulado de estado. No vapor superaquecido, P e T são independentes, então bastam.' },
        { text: 'toda substância segue P·v = R·T.', why: 'O vapor d’água perto da saturação não é gás perfeito — por isso existem as tabelas.' },
        { text: 'a temperatura, sozinha, define o estado de qualquer substância.', why: 'Uma propriedade só não basta: a mesma temperatura serve para infinitas pressões.' },
        { text: 'pressão e temperatura são sempre independentes, até na mudança de fase.', why: 'Na mudança de fase elas ficam amarradas (a água ferve a 100 °C só a 1 atm): aí é preciso outra propriedade, como o título.' },
        { text: 'o estado só fica definido quando a massa também é conhecida.', why: 'A massa é extensiva: muda o tamanho do sistema, não o estado intensivo (v, h, s).' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: só **duas** leituras (P e T) bastam para achar o resto, no vapor **superaquecido**.',
        'Postulado de estado: duas propriedades intensivas **independentes** fixam o estado de uma substância pura simples compressível. Fora da saturação, P e T são independentes.',
        'Fica o **postulado de estado**. P·v = R·T vale só para gás perfeito; na mistura, P e T não são independentes.',
      ],
      explanation: '**Postulado de estado:** para uma substância pura simples compressível, duas propriedades **intensivas independentes** fixam o estado. Fora da saturação (líquido comprimido ou vapor superaquecido), P e T são independentes e bastam. Na mistura líquido + vapor, não: P e T dependem uma da outra, e é preciso o título (ou v, h, s).',
    },
    {
      id: 'mec-gas-09',
      type: 'ce',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Numa mistura de água líquida e vapor em equilíbrio, conhecer a pressão e a temperatura basta para determinar o volume específico da mistura.',
      answer: false,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: **mistura** líquido + vapor — e P e T "bastam".',
        'Na saturação, P e T não são independentes (cada pressão tem a sua temperatura de ebulição); v = v_{l} + x·(v_{v} − v_{l}) depende do **título**.',
        'Sem o título (ou h, s, v), o estado fica indefinido: **Errado**.',
      ],
      explanation: '**Errado.** Na saturação, P e T **não são independentes** (cada pressão tem a sua temperatura de ebulição). O volume específico da mistura depende de quanto já evaporou: v = v_{l} + x·(v_{v} − v_{l}), com o **título x**. Sem o título (ou outra propriedade, como h ou s), o estado não fica definido.',
    },
    {
      id: 'mec-gas-10',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Para um gás perfeito, a taxa de variação da energia interna específica com a temperatura (du/dT) e a taxa de variação da entalpia específica com a temperatura (dh/dT) recebem, respectivamente, os nomes de',
      options: [
        { text: 'calor específico a volume constante (c_{v}) e calor específico a pressão constante (c_{p}).', why: 'Correta: c_{v} = (∂u/∂T)_{v} e c_{p} = (∂h/∂T)_{p}; no gás perfeito, u e h só dependem de T.' },
        { text: 'calor específico a pressão constante (c_{p}) e calor específico a volume constante (c_{v}).', why: 'Ordem trocada: a energia interna anda com o c_{v} (volume constante, sem trabalho).' },
        { text: 'constante do gás (R) e razão de calores específicos (k).', why: 'R = c_{p} − c_{v} e k = c_{p}/c_{v} são combinações dos dois, não as derivadas.' },
        { text: 'razão de calores específicos (k) e constante do gás (R).', why: 'k e R são derivados de c_{p} e c_{v}, não as próprias derivadas.' },
        { text: 'capacidade térmica e entropia específica.', why: 'Capacidade térmica é m·c (extensiva) e entropia é outra propriedade.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: du/dT e dh/dT — nessa ordem.',
        'c_{v} = (∂u/∂T)_{v} e c_{p} = (∂h/∂T)_{p}: a energia interna anda com o volume constante; a entalpia, com a pressão constante.',
        'Fica **c_{v} e c_{p}**, respectivamente. A ordem trocada é o distrator.',
      ],
      explanation: 'Por definição, **c_{v} = (∂u/∂T)_{v}** e **c_{p} = (∂h/∂T)_{p}**. No gás perfeito, u e h dependem só da temperatura, então du = c_{v}·dT e dh = c_{p}·dT. Daí saem c_{p} − c_{v} = R e k = c_{p}/c_{v}.',
    },
    {
      id: 'mec-gas-11',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Tanque rígido com vazamento',
      roteiro: 'gas-perfeito',
      generate(rng) {
        const gas = pickOne(rng, [
          { name: 'ar', R: 0.287 },
          { name: 'nitrogênio', R: 0.297 },
          { name: 'um gás', R: 0.3 },
        ]);
        const V = pickOne(rng, [0.5, 0.8, 1, 1.2, 1.5, 2]);
        const T1 = pickOne(rng, [300, 350, 400, 450, 500]);
        const m1 = pickOne(rng, [3, 4, 5, 6, 8]);
        const P1 = Math.round((m1 * gas.R * T1) / V);
        const m1c = (P1 * V) / (gas.R * T1);
        const lost = pickOne(rng, [0.25, 0.4, 0.5]) * m1;
        const m2 = m1c - lost;
        const T2 = T1 - pickOne(rng, [10, 20, 30, 40, 50]);
        const head = `Um tanque **rígido** de **${fmt(V)} m³** contém ${gas.name} (gás perfeito, R = ${fmt(gas.R, 3)} kJ/(kg·K)) a **${fmt(P1)} kPa** e **${T1} K**. Um vazamento deixa escapar **${fmt(lost)} kg** do gás.`;
        const massText = `m₁ = P₁·V/(R·T₁) = ${fmt(P1)} × ${fmt(V)}/(${fmt(gas.R, 3)} × ${T1}) = ${fmt(m1c, 3)} kg; m₂ = ${fmt(m1c, 3)} − ${fmt(lost)} = ${fmt(m2, 3)} kg.`;
        if (rng() < 0.5) {
          const P2 = Math.round((m2 * gas.R * T2) / V);
          const T2c = (P2 * V) / (m2 * gas.R);
          const { options, answer } = numericOptions({
            correct: T2c,
            unit: 'K',
            digits: 0,
            correctWhy: `${massText} T₂ = P₂·V/(m₂·R) = ${fmt(T2c, 0)} K.`,
            distractors: [
              { value: (P2 * V) / (m1c * gas.R), why: 'Usou a massa **inicial**: o vazamento reduziu a massa no tanque.' },
              { value: (T1 * P2) / P1, why: 'Usou P/T = constante, que só vale com a massa fixa.' },
              { value: (P2 * V) / (lost * gas.R), why: 'Usou a massa que **saiu** em vez da que ficou.' },
              { value: T2c - 273, why: 'Converteu para °C — a pergunta pede kelvin.' },
            ],
          });
          return {
            prompt: `${head} Depois do vazamento, a pressão é de **${fmt(P2)} kPa**. A temperatura final do gás, em K, é aproximadamente`,
            options,
            answer,
            hint: 'Ache a massa inicial com P·V = m·R·T, desconte o que vazou e use de novo a equação de estado.',
            steps: [
              `Temperaturas já em kelvin (T₁ = ${T1} K); pressões absolutas.`,
              `A massa muda (vazamento): P·V = m·R·T antes e depois. ${massText}`,
              `T₂ = P₂·V/(m₂·R) = ${fmt(P2)} × ${fmt(V)}/(${fmt(m2, 3)} × ${fmt(gas.R, 3)}) = **${fmt(T2c, 0)} K**.`,
            ],
            explanation: `A massa muda, então use a equação de estado **antes** e **depois**:\n\n${massText}\n\nT₂ = P₂·V/(m₂·R) = ${fmt(P2)} × ${fmt(V)}/(${fmt(m2, 3)} × ${fmt(gas.R, 3)}) = **${fmt(T2c, 0)} K**.`,
          };
        }
        const P2c = (m2 * gas.R * T2) / V;
        const { options, answer } = numericOptions({
          correct: P2c,
          unit: 'kPa',
          digits: 0,
          correctWhy: `${massText} P₂ = m₂·R·T₂/V = ${fmt(P2c, 0)} kPa.`,
          distractors: [
            { value: (m1c * gas.R * T2) / V, why: 'Usou a massa **inicial** (como se nada tivesse vazado).' },
            { value: (m2 * gas.R * T1) / V, why: 'Usou a temperatura inicial; o enunciado dá T₂.' },
            { value: (lost * gas.R * T2) / V, why: 'Usou a massa que **saiu** em vez da que ficou.' },
            { value: P1 - (lost * gas.R * T2) / V, why: 'Descontou a pressão da massa perdida a T₂, mas a massa que ficou também esfriou de T₁ para T₂.' },
          ],
        });
        return {
          prompt: `${head} Depois do vazamento, a temperatura do gás é de **${T2} K**. A pressão final, em kPa, é aproximadamente`,
          options,
          answer,
          hint: 'Massa inicial pela equação de estado, menos o que vazou; depois P₂ = m₂·R·T₂/V.',
          steps: [
            `Temperaturas já em kelvin (T₁ = ${T1} K, T₂ = ${T2} K); pressões absolutas.`,
            `A massa muda (vazamento): P·V = m·R·T antes e depois. ${massText}`,
            `P₂ = m₂·R·T₂/V = ${fmt(m2, 3)} × ${fmt(gas.R, 3)} × ${T2}/${fmt(V)} = **${fmt(P2c, 0)} kPa**.`,
          ],
          explanation: `A massa muda, então use a equação de estado **antes** e **depois**:\n\n${massText}\n\nP₂ = m₂·R·T₂/V = ${fmt(m2, 3)} × ${fmt(gas.R, 3)} × ${T2}/${fmt(V)} = **${fmt(P2c, 0)} kPa**.`,
        };
      },
    },
    {
      id: 'mec-gas-12',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Trabalho numa expansão politrópica',
      roteiro: 'trabalho-fronteira',
      generate(rng) {
        const P1 = pickOne(rng, [200, 300, 400, 500, 600]);
        const V1 = pickOne(rng, [0.05, 0.1, 0.2]);
        const r = pickOne(rng, [2, 4]);
        const n = pickOne(rng, [1.5, 2]);
        const V2 = r * V1;
        const P2 = P1 * (V1 / V2) ** n;
        const W = (P2 * V2 - P1 * V1) / (1 - n);
        const { options, answer } = numericOptions({
          correct: W,
          unit: 'kJ',
          digits: 2,
          correctWhy: `P₂ = ${fmt(P1)} × (${fmt(V1)}/${fmt(V2)})^{${fmt(n, 1)}} = ${fmt(P2, 2)} kPa; W = (P₂V₂ − P₁V₁)/(1 − n) = ${fmt(W, 2)} kJ.`,
          distractors: [
            { value: P1 * (V2 - V1), why: 'Tratou como **isobárico** com a pressão inicial; na politrópica a pressão cai durante a expansão.' },
            { value: P2 * (V2 - V1), why: 'Usou a pressão final como se fosse constante.' },
            { value: P1 * V1 * Math.log(r), why: 'Essa é a fórmula do **isotérmico** (n = 1).' },
            { value: (P1 * V1 - P2 * V2) / (1 + n), why: 'Errou o denominador: é (1 − n), não (1 + n).' },
          ],
        });
        return {
          prompt: `Um gás se expande num cilindro de **${fmt(V1)} m³** para **${fmt(V2)} m³** seguindo a relação **P·V^{${fmt(n, 1)}} = constante**. A pressão inicial é de **${fmt(P1)} kPa**. O trabalho realizado pelo gás, em kJ, é`,
          options,
          answer,
          hint: 'Ache P₂ pela relação politrópica e use W = (P₂V₂ − P₁V₁)/(1 − n).',
          steps: [
            `P·V^{${fmt(n, 1)}} = constante → **politrópico** com n = ${fmt(n, 1)}.`,
            `P₂ = P₁·(V₁/V₂)^{n} = ${fmt(P1)} × (1/${r})^{${fmt(n, 1)}} = ${fmt(P2, 2)} kPa; W = (P₂V₂ − P₁V₁)/(1 − n).`,
            `W = (${fmt(P2 * V2, 2)} − ${fmt(P1 * V1, 2)})/(1 − ${fmt(n, 1)}) = **${fmt(W, 2)} kJ** (expansão: positivo).`,
          ],
          explanation: `Politrópico com n = ${fmt(n, 1)}:\n\nP₂ = P₁·(V₁/V₂)^{n} = ${fmt(P1)} × (1/${r})^{${fmt(n, 1)}} = ${fmt(P2, 2)} kPa.\n\nW = (P₂V₂ − P₁V₁)/(1 − n) = (${fmt(P2 * V2, 2)} − ${fmt(P1 * V1, 2)})/(1 − ${fmt(n, 1)}) = **${fmt(W, 2)} kJ** (positivo: o gás realiza trabalho na expansão).`,
        };
      },
    },
    {
      id: 'mec-gas-13',
      type: 'gen',
      difficulty: 2,
      lessonRef: 5,
      title: 'Carnot: a temperatura da fonte fria',
      roteiro: 'carnot',
      generate(rng) {
        const TQc = pickOne(rng, [227, 327, 427, 527, 727]);
        const TQ = TQc + 273;
        const eta = pickOne(rng, [0.3, 0.4, 0.5, 0.6]);
        const TF = TQ * (1 - eta);
        const TFc = TF - 273;
        const { options, answer } = numericOptions({
          correct: TFc,
          unit: '°C',
          digits: 0,
          correctWhy: `T_{F} = T_{Q}·(1 − η) = ${TQ} × ${fmt(1 - eta)} = ${fmt(TF, 0)} K = ${fmt(TFc, 0)} °C.`,
          distractors: [
            { value: TQc * (1 - eta), why: 'Aplicou Carnot em °C. O rendimento de Carnot só vale com temperaturas **absolutas**.' },
            { value: TF, why: 'Esse é o valor em **kelvin**; a pergunta pede °C (subtraia 273).' },
            { value: TQ * eta - 273, why: 'Inverteu: T_{F}/T_{Q} = 1 − η, não η.' },
            { value: TQc - eta * 100, why: 'Subtraiu o rendimento da temperatura — sem relação com a 2ª lei.' },
          ],
        });
        return {
          prompt: `Um motor térmico **reversível** (ciclo de Carnot) tem rendimento de **${fmt(eta * 100)}%** e recebe calor de uma fonte a **${TQc} °C**. A temperatura da fonte fria, em °C, é`,
          options,
          answer,
          hint: 'η = 1 − T_{F}/T_{Q}, em kelvin.',
          steps: [
            `T_{Q} = ${TQc} + 273 = ${TQ} K.`,
            `η = 1 − T_{F}/T_{Q} → T_{F} = T_{Q}·(1 − η) = ${TQ} × ${fmt(1 - eta)}.`,
            `T_{F} = ${fmt(TF, 0)} K → **${fmt(TFc, 0)} °C**.`,
          ],
          explanation: `Carnot: η = 1 − T_{F}/T_{Q} → T_{F} = T_{Q}·(1 − η).\n\nT_{Q} = ${TQc} + 273 = ${TQ} K → T_{F} = ${TQ} × ${fmt(1 - eta)} = ${fmt(TF, 0)} K → **${fmt(TFc, 0)} °C**.`,
        };
      },
    },
    {
      id: 'mec-gas-14',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'O enunciado de **Clausius** da segunda lei da termodinâmica pode ser escrito assim:',
      options: [
        { text: 'É impossível um dispositivo cíclico cujo único efeito seja transferir calor de um corpo mais frio para um corpo mais quente.', why: 'Correta: é o enunciado ligado ao refrigerador e à bomba de calor — para levar calor do frio ao quente, é preciso gastar trabalho.' },
        { text: 'É impossível um motor cíclico que troque calor com um único reservatório e produza trabalho líquido.', why: 'Esse é o enunciado de **Kelvin-Planck**, ligado ao motor térmico.' },
        { text: 'A energia se conserva: Q − W = ΔU.', why: 'Essa é a 1ª lei.' },
        { text: 'A entropia de qualquer sistema nunca diminui.', why: 'Só vale para o sistema **isolado**. Um sistema que rejeita calor pode ter a entropia reduzida.' },
        { text: 'Nenhum motor real pode ter rendimento acima de 50%.', why: 'O teto é o de Carnot, 1 − T_{F}/T_{Q}, que pode passar de 50% com fontes bem separadas.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: enunciado de **Clausius** (não o de Kelvin-Planck).',
        'Clausius fala de **refrigerador**: calor não passa sozinho do frio para o quente. Kelvin-Planck fala de **motor**: nenhum motor cíclico converte em trabalho todo o calor de uma só fonte.',
        'Fica o do **calor do frio para o quente**. A do motor com um só reservatório é Kelvin-Planck.',
      ],
      explanation: '**Clausius** = refrigerador: calor não sobe sozinho do frio para o quente. **Kelvin-Planck** = motor: nenhum motor cíclico converte em trabalho todo o calor de uma única fonte. Os dois enunciados são equivalentes — violar um implica violar o outro.',
    },
    {
      id: 'mec-gas-15',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      shuffle: false,
      prompt: 'Considere os processos a seguir.\n\nI – Um gás escapa por um furo para um recipiente onde havia vácuo (expansão livre).\nII – Calor passa de gases de combustão a 900 °C para a água de uma caldeira a 200 °C.\nIII – Um gás é comprimido muito lentamente, sem atrito, passando por estados de equilíbrio.\n\nSão processos **irreversíveis** apenas',
      options: [
        { text: 'I', why: 'A troca de calor com diferença finita de temperatura (II) também é irreversível.' },
        { text: 'II', why: 'A expansão livre (I) também é irreversível: o gás não volta sozinho para o recipiente.' },
        { text: 'I e II', why: 'Correta: expansão livre e troca de calor com ΔT finito geram entropia. III é o modelo de processo reversível (quase-estático e sem atrito).' },
        { text: 'II e III', why: 'III é justamente o processo idealizado como reversível.' },
        { text: 'I, II e III', why: 'III não tem atrito nem desequilíbrio: é reversível.' },
      ],
      answer: 2,
      roteiro: 'fmt.afirmativas',
      steps: [
        'I – **Irreversível**: a expansão livre (contra o vácuo) é fonte clássica de irreversibilidade.',
        'II – **Irreversível**: troca de calor com diferença **finita** de temperatura (900 °C → 200 °C).',
        'III – **Reversível** (idealização): lento, sem atrito, passando por estados de equilíbrio.',
        'Irreversíveis: I e II → "I e II".',
      ],
      explanation: 'Fontes de irreversibilidade: atrito, **expansão livre**, **troca de calor com diferença finita de temperatura**, mistura, histerese, reação química. O processo reversível é um limite ideal: lento (quase-estático), sem atrito e trocando calor com ΔT infinitesimal (III).',
    },
    {
      id: 'mec-gas-16',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'A entropia de um **sistema fechado** pode diminuir durante um processo. Isso só é possível quando',
      options: [
        { text: 'o sistema rejeita calor para a vizinhança.', why: 'Correta: o calor que sai leva entropia (∫δQ/T < 0) e pode superar a entropia gerada.' },
        { text: 'há atrito dentro do sistema.', why: 'Irreversibilidades **geram** entropia (S_{ger} > 0): aumentam, nunca diminuem.' },
        { text: 'o sistema recebe calor.', why: 'Calor entrando aumenta a entropia (δQ/T > 0).' },
        { text: 'o processo é adiabático e reversível.', why: 'Esse é o isentrópico: ΔS = 0.' },
        { text: 'o sistema realiza trabalho de expansão.', why: 'Trabalho não transporta entropia.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: a entropia de um **sistema fechado** **diminuir**.',
        'ΔS = ∫δQ/T + S_{ger}, com S_{ger} ≥ 0. Só a parcela do calor pode ser negativa.',
        'Fica **o sistema rejeita calor**. Atrito gera entropia (aumenta); adiabático reversível a mantém.',
      ],
      explanation: 'Balanço de entropia de um sistema fechado: **ΔS = ∫δQ/T + S_{ger}**, com S_{ger} ≥ 0. A única parcela que pode ser negativa é a do calor: só **rejeitando calor** a entropia do sistema cai. (Num volume de controle, a massa que sai também leva entropia.)',
    },
    {
      id: 'mec-gas-17',
      type: 'gen',
      difficulty: 2,
      lessonRef: 4,
      title: 'Turbina ou compressor com perda de calor',
      roteiro: 'volume-controle',
      generate(rng) {
        if (rng() < 0.6) {
          const m = pickOne(rng, [1.5, 2, 2.5, 3, 4, 5]);
          const h1 = pickOne(rng, [3050, 3150, 3230, 3350, 3450]);
          const dh = pickOne(rng, [450, 500, 600, 700, 800]);
          const h2 = h1 - dh;
          const Q = pickOne(rng, [30, 40, 50, 60, 80]);
          const W = m * dh - Q;
          const { options, answer } = numericOptions({
            correct: W,
            unit: 'kW',
            digits: 1,
            correctWhy: `Ẇ = ṁ·(h₁ − h₂) + Q̇ = ${fmt(m)} × ${dh} + (−${Q}) = ${fmt(W, 1)} kW.`,
            distractors: [
              { value: m * dh + Q, why: 'Somou a perda: o calor que **sai** da turbina reduz a potência (Q̇ < 0).' },
              { value: m * dh, why: 'Ignorou a perda de calor.' },
              { value: dh - Q, why: 'Esqueceu de multiplicar pela vazão mássica: (h₁ − h₂) é por kg.' },
              { value: m * h1 - Q, why: 'Usou só a entalpia de entrada; o que importa é a **queda** de entalpia.' },
            ],
          });
          return {
            prompt: `Vapor entra numa turbina, em regime permanente, com vazão de **${fmt(m)} kg/s** e entalpia de **${fmt(h1)} kJ/kg**, e sai com **${fmt(h2)} kJ/kg**. A turbina **perde ${Q} kW** de calor para o ambiente. Desprezando as variações de energia cinética e potencial, a potência produzida, em kW, é`,
            options,
            answer,
            hint: 'Q̇ − Ẇ = ṁ·(h₂ − h₁), com Q̇ negativo (calor saindo).',
            steps: [
              `Q̇ − Ẇ = ṁ·(h₂ − h₁) → Ẇ = Q̇ + ṁ·(h₁ − h₂).`,
              `Perda de calor: Q̇ = −${Q} kW; ṁ·(h₁ − h₂) = ${fmt(m)} × ${fmt(dh)} = ${fmt(m * dh)} kW.`,
              `Ẇ = −${Q} + ${fmt(m * dh)} = **${fmt(W, 1)} kW** produzidos.`,
            ],
            explanation: `1ª lei em regime permanente: Q̇ − Ẇ = ṁ·(h₂ − h₁) → Ẇ = Q̇ + ṁ·(h₁ − h₂).\n\nCom Q̇ = −${Q} kW (perda): Ẇ = −${Q} + ${fmt(m)} × (${fmt(h1)} − ${fmt(h2)}) = **${fmt(W, 1)} kW**.`,
          };
        }
        const m = pickOne(rng, [0.1, 0.2, 0.5, 1, 1.5]);
        const h1 = pickOne(rng, [290, 300, 310]);
        const dh = pickOne(rng, [150, 180, 200, 250]);
        const h2 = h1 + dh;
        const q = pickOne(rng, [10, 15, 20, 25]);
        const W = m * (dh + q);
        const { options, answer } = numericOptions({
          correct: W,
          unit: 'kW',
          digits: 1,
          correctWhy: `Potência consumida = ṁ·[(h₂ − h₁) + q_{perdido}] = ${fmt(m)} × (${dh} + ${q}) = ${fmt(W, 1)} kW.`,
          distractors: [
            { value: m * (dh - q), why: 'Descontou a perda: o calor que sai é energia que o compressor também precisa fornecer.' },
            { value: m * dh, why: 'Ignorou o calor perdido para a camisa.' },
            { value: dh + q, why: 'Esqueceu a vazão mássica (o resultado ficou em kJ/kg).' },
            { value: m * h2, why: 'Usou a entalpia de saída inteira, não a variação.' },
          ],
        });
        return {
          prompt: `Um compressor, em regime permanente, comprime **${fmt(m)} kg/s** de ar, cuja entalpia sobe de **${h1}** para **${h2} kJ/kg**. Durante a compressão, o ar perde **${q} kJ/kg** de calor para a camisa de refrigeração. Desprezando as variações de energia cinética e potencial, a potência consumida pelo compressor, em kW, é`,
          options,
          answer,
          hint: 'Q̇ − Ẇ = ṁ·(h₂ − h₁): com Q̇ negativo, o trabalho também sai negativo (consumido).',
          steps: [
            `Q̇ − Ẇ = ṁ·(h₂ − h₁) → Ẇ = Q̇ − ṁ·(h₂ − h₁).`,
            `Perda de calor: Q̇ = −${fmt(m)} × ${q} kW; h₂ − h₁ = ${dh} kJ/kg.`,
            `Ẇ = −${fmt(m)} × (${q} + ${dh}) = −${fmt(W, 1)} kW → o compressor **consome ${fmt(W, 1)} kW**.`,
          ],
          explanation: `Q̇ − Ẇ = ṁ·(h₂ − h₁) com Q̇ = −${fmt(m)} × ${q} kW:\n\nẆ = Q̇ − ṁ·(h₂ − h₁) = −${fmt(m)} × (${q} + ${dh}) = −${fmt(W, 1)} kW → o compressor **consome ${fmt(W, 1)} kW**. Tudo o que entra como trabalho sai como aumento de entalpia mais o calor perdido.`,
        };
      },
    },
    {
      id: 'mec-gas-18',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Vaporização a pressão constante',
      roteiro: 'primeira-lei',
      generate(rng) {
        const st = pickOne(rng, [
          { P: 100, vfg: 1.693, hfg: 2257.5 },
          { P: 200, vfg: 0.8847, hfg: 2201.6 },
          { P: 500, vfg: 0.3737, hfg: 2108 },
        ]);
        const m = pickOne(rng, [0.5, 1, 2, 3]);
        const Q = m * st.hfg;
        const dV = Math.round(m * st.vfg * 1000) / 1000;
        const W = st.P * dV;
        const dU = Q - W;
        const { options, answer } = numericOptions({
          correct: dU,
          unit: 'kJ',
          digits: 0,
          correctWhy: `ΔU = Q − P·ΔV = ${fmt(Q, 1)} − ${st.P} × ${fmt(dV, 3)} = ${fmt(dU, 0)} kJ.`,
          distractors: [
            { value: Q, why: 'Esqueceu o trabalho de expansão: o vapor empurra o pistão (W = P·ΔV).' },
            { value: Q + W, why: 'Somou o trabalho: ele é energia que **sai** do sistema.' },
            { value: W, why: 'Esse é só o trabalho de fronteira.' },
            { value: W - Q, why: 'Trocou os sinais: o calor **entra** (+) e o trabalho de expansão **sai** (−).' },
          ],
        });
        return {
          prompt: `**${fmt(m)} kg** de água líquida saturada vaporizam completamente a **${st.P} kPa** num cilindro com pistão (pressão constante). O volume aumenta **${fmt(dV, 3)} m³** e a água recebe **${fmt(Q, 1)} kJ** de calor. A variação da energia interna da água, em kJ, é aproximadamente`,
          options,
          answer,
          hint: 'O vapor empurra o pistão: W = P·ΔV. Depois, ΔU = Q − W.',
          steps: [
            `Q > 0 entrando; W > 0 feito pela água.`,
            `Q = +${fmt(Q, 1)} kJ (recebido); W = +P·ΔV = ${st.P} × ${fmt(dV, 3)} = +${fmt(W, 1)} kJ (o vapor empurra o pistão).`,
            `ΔU = ${fmt(Q, 1)} − ${fmt(W, 1)} = **${fmt(dU, 0)} kJ** — a maior parte do calor latente fica como energia interna.`,
          ],
          explanation: `Pressão constante → W = P·ΔV = ${st.P} kPa × ${fmt(dV, 3)} m³ = ${fmt(W, 1)} kJ.\n\nΔU = Q − W = ${fmt(Q, 1)} − ${fmt(W, 1)} = **${fmt(dU, 0)} kJ**. (Confere com a tabela de vapor: m·u_{lv} ≈ ${fmt(dU, 0)} kJ.) Só uma parte pequena do calor latente vira trabalho; o resto separa as moléculas (energia interna).`,
        };
      },
    },
    {
      id: 'mec-gas-19',
      difficulty: 3,
      lessonRef: 3,
      source: 'Autoral',
      shuffle: false,
      prompt: 'Um tanque **rígido e fechado** contém uma mistura de água líquida e vapor saturados. Fornecem-se **400 MJ** de calor até que reste apenas vapor saturado; a energia interna da água sobe de **90 MJ** para **490 MJ**. O trabalho realizado pela água nesse processo é',
      options: [
        { text: 'zero', why: 'Correta: tanque rígido → o volume do sistema não muda → não há trabalho de fronteira. Todo o calor vira energia interna (ΔU = Q = 400 MJ).' },
        { text: '90 MJ', why: 'É a energia interna inicial, não trabalho.' },
        { text: '400 MJ', why: 'Esse é o calor fornecido. Num tanque rígido ele vira todo energia interna.' },
        { text: '490 MJ', why: 'É a energia interna final.' },
        { text: '890 MJ', why: 'Somou calor e energia interna final — não tem sentido físico.' },
      ],
      answer: 0,
      roteiro: 'trabalho-fronteira',
      steps: [
        'Tanque **rígido e fechado**: o volume não muda.',
        'Volume constante → W = ∫P·dV = 0.',
        'W = **zero**. Confere: Q = ΔU = 490 − 90 = 400 MJ, igual ao calor fornecido.',
      ],
      explanation: 'O líquido vira vapor, mas o **recipiente** não muda de volume: W = ∫P·dV = 0. A 1ª lei fica Q = ΔU = 490 − 90 = 400 MJ — e confere com o calor fornecido. A banca gosta de dar vários números (calor, energias internas, volumes) para você esquecer que **tanque rígido não realiza trabalho**.',
    },
    {
      id: 'mec-gas-20',
      difficulty: 3,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Um fabricante anuncia um refrigerador que mantém uma câmara a **−23 °C**, num ambiente a **27 °C**, com **COP = 6**. Sobre esse anúncio, é correto afirmar que ele é',
      options: [
        { text: 'impossível: o COP máximo (de Carnot) nessas temperaturas é 5.', why: 'Correta: COP_{máx} = T_{F}/(T_{Q} − T_{F}) = 250/(300 − 250) = 5. Prometer 6 viola a 2ª lei.' },
        { text: 'possível: o COP de Carnot nessas temperaturas é 6, igual ao anunciado.', why: '6 é o COP de Carnot da **bomba de calor**, T_{Q}/(T_{Q} − T_{F}) = 300/50. Para o refrigerador é 5.' },
        { text: 'possível: qualquer COP maior que 1 é aceitável.', why: 'COP acima de 1 é comum, mas existe um teto: o de Carnot.' },
        { text: 'impossível: o COP de um refrigerador não pode passar de 1.', why: 'Não há essa regra: geladeiras reais têm COP de 2 a 4.' },
        { text: 'possível: em °C, o COP de Carnot daria −0,46, e qualquer valor positivo é melhor que isso.', why: 'Em °C a conta não tem sentido; a 2ª lei usa temperaturas absolutas.' },
      ],
      answer: 0,
      roteiro: 'carnot',
      steps: [
        'T_{F} = −23 + 273 = 250 K; T_{Q} = 27 + 273 = 300 K.',
        'COP_{ref,máx} = T_{F}/(T_{Q} − T_{F}) = 250/50.',
        '= **5** < 6: o anúncio é **impossível**. (6 seria o COP de Carnot da bomba de calor.)',
      ],
      explanation: 'Para julgar uma "invenção", calcule o limite de Carnot com **kelvin**: T_{F} = 250 K, T_{Q} = 300 K → COP_{ref,máx} = 250/50 = **5**. Nenhum refrigerador entre essas temperaturas passa disso; o anúncio de 6 é impossível. Cuidado para não usar o COP da bomba de calor (que dá 6).',
    },
    {
      id: 'mec-gas-21',
      difficulty: 2,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Para saber se é razoável tratar um gás real como **gás perfeito** numa dada condição, consulta-se o diagrama generalizado de compressibilidade. Nele, o modelo de gás perfeito é adequado quando',
      options: [
        { text: 'o fator Z = P·v/(R·T) é próximo de 1, o que ocorre em pressões reduzidas baixas e temperaturas reduzidas altas.', why: 'Correta: longe do ponto crítico (P ≪ P_{cr} ou T ≫ T_{cr}), Z ≈ 1 e P·v ≈ R·T.' },
        { text: 'Z é próximo de zero, perto do ponto crítico.', why: 'Perto do ponto crítico o desvio é máximo: o gás perfeito é um péssimo modelo ali.' },
        { text: 'a pressão é muito alta, qualquer que seja a temperatura.', why: 'Pressão alta aproxima as moléculas e afasta Z de 1.' },
        { text: 'o gás está na condição de vapor saturado.', why: 'Na saturação o fluido está prestes a condensar: use as tabelas, não P·v = R·T.' },
        { text: 'a temperatura está abaixo da crítica, em qualquer pressão.', why: 'Abaixo da crítica e com pressão alta o fluido pode até condensar.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: quando o gás real se comporta como **perfeito** — o fator Z.',
        'Z = P·v/(R·T); Z = 1 é o gás perfeito. Isso acontece longe do ponto crítico: pressão reduzida baixa e temperatura reduzida alta.',
        'Fica **Z próximo de 1, com P_{R} baixa e T_{R} alta**.',
      ],
      explanation: 'O **fator de compressibilidade** Z = P·v/(R·T) mede o desvio: Z = 1 é o gás perfeito. O diagrama generalizado (Z × P_{R}, com curvas de T_{R}) vale para muitos gases, porque eles se comportam parecido nas mesmas condições **reduzidas** (P/P_{cr}, T/T_{cr}). Longe do ponto crítico — pressão baixa ou temperatura alta — o modelo funciona.',
    },
    {
      id: 'mec-gas-22',
      difficulty: 2,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Comparado ao vapor **saturado** na mesma pressão, o vapor **superaquecido** tem',
      options: [
        { text: 'temperatura maior, volume específico maior e entalpia maior.', why: 'Correta: superaquecer é continuar aquecendo a pressão constante depois de todo o líquido evaporar — T, v, u e h sobem.' },
        { text: 'a mesma temperatura e entalpia menor.', why: 'Na mesma pressão, o superaquecido está **acima** da temperatura de saturação.' },
        { text: 'temperatura maior, mas volume específico menor.', why: 'Aquecido a pressão constante, o vapor se expande: v aumenta.' },
        { text: 'temperatura menor e energia interna maior.', why: 'A temperatura é maior, não menor.' },
        { text: 'as mesmas propriedades, pois a pressão é a mesma.', why: 'No vapor superaquecido, P e T são independentes: a mesma pressão admite várias temperaturas (e estados).' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: vapor **superaquecido** × **saturado**, na mesma pressão.',
        'A pressão constante, depois do vapor saturado a temperatura volta a subir: T, v, u e h aumentam.',
        'Fica **temperatura, volume específico e entalpia maiores**.',
      ],
      explanation: 'A pressão constante: líquido comprimido → líquido saturado → mistura (T constante) → **vapor saturado** → **vapor superaquecido** (T sobe de novo). Do vapor saturado para o superaquecido, a temperatura, o volume específico, a energia interna e a entalpia aumentam.',
    },
    {
      id: 'mec-gas-23',
      type: 'gen',
      difficulty: 3,
      lessonRef: 5,
      title: 'Entropia gerada por um motor real',
      roteiro: 'entropia-gerada',
      generate(rng) {
        const TQ = pickOne(rng, [500, 600, 800, 1000]);
        const TF = 300;
        const QA = pickOne(rng, [1000, 1200, 1500, 2000, 2400, 3000]);
        const etaMax = 1 - TF / TQ;
        const eta = Math.round(etaMax * pickOne(rng, [0.5, 0.6, 0.75]) * 100) / 100;
        const QR = QA * (1 - eta);
        const S = QR / TF - QA / TQ;
        const { options, answer } = numericOptions({
          correct: S,
          unit: 'kJ/K',
          digits: 2,
          correctWhy: `S_{ger} = Q_{R}/T_{F} − Q_{A}/T_{Q} = ${fmt(QR, 0)}/${TF} − ${QA}/${TQ} = ${fmt(S, 2)} kJ/K (> 0: possível e irreversível).`,
          distractors: [
            { value: QR / TF + QA / TQ, why: 'Somou as duas parcelas: a fonte quente **perde** entropia (−Q_{A}/T_{Q}).' },
            { value: QR / TF, why: 'Contou só o ganho da fonte fria.' },
            { value: QA / TQ, why: 'Contou só a perda da fonte quente.' },
            { value: 0, why: 'A entropia do **fluido** volta ao valor inicial no ciclo, mas a das fontes não: a soma é a entropia gerada.' },
          ],
        });
        return {
          prompt: `Um motor térmico opera em ciclos entre uma fonte a **${fmt(TQ)} K** e o ambiente a **${TF} K**. A cada ciclo, recebe **${fmt(QA)} kJ** da fonte quente e tem rendimento de **${fmt(eta * 100)}%**. A entropia gerada em cada ciclo (fluido + fontes), em kJ/K, é`,
          options,
          answer,
          hint: 'O fluido volta ao estado inicial (ΔS = 0). Some o que cada fonte perde ou ganha: −Q_{A}/T_{Q} e +Q_{R}/T_{F}.',
          steps: [
            `Q_{R} = ${fmt(QA)} × ${fmt(1 - eta)} = ${fmt(QR, 0)} kJ.`,
            `Fonte quente: −${fmt(QA)}/${fmt(TQ)} = −${fmt(QA / TQ, 2)} kJ/K; fonte fria: +${fmt(QR, 0)}/${TF} = +${fmt(QR / TF, 2)} kJ/K.`,
            `S_{ger} = **${fmt(S, 2)} kJ/K** > 0: possível, mas irreversível (Carnot daria ${fmt(etaMax * 100, 0)}%).`,
          ],
          explanation: `Calor rejeitado: Q_{R} = Q_{A}·(1 − η) = ${QA} × ${fmt(1 - eta)} = ${fmt(QR, 0)} kJ.\n\nNo ciclo, ΔS_{fluido} = 0. Fonte quente: −${QA}/${TQ} = −${fmt(QA / TQ, 2)} kJ/K. Fonte fria: +${fmt(QR, 0)}/${TF} = +${fmt(QR / TF, 2)} kJ/K.\n\nS_{ger} = **${fmt(S, 2)} kJ/K** > 0 — o motor é possível, mas irreversível (rendimento abaixo do de Carnot, ${fmt(etaMax * 100, 0)}%). Se desse negativo, o motor seria impossível.`,
        };
      },
    },
    {
      id: 'mec-gas-24',
      difficulty: 3,
      lessonRef: 3,
      source: 'Autoral',
      shuffle: false,
      prompt: 'Analise as afirmativas sobre a 1ª lei da termodinâmica para um sistema fechado.\n\nI – Ao final de um ciclo, o calor líquido recebido é igual ao trabalho líquido realizado.\nII – Em todo processo adiabático, o trabalho é nulo.\nIII – Na expansão isotérmica de um gás perfeito, o calor recebido é igual ao trabalho realizado.\n\nEstá correto o que se afirma em',
      options: [
        { text: 'I, apenas', why: 'III também está correta: no gás perfeito isotérmico, ΔU = 0 e Q = W.' },
        { text: 'II, apenas', why: 'II é falsa: adiabático é sem **calor**; o trabalho vale −ΔU.' },
        { text: 'I e III, apenas', why: 'Correta: no ciclo ΔU = 0 (Q = W) e na isotérmica do gás perfeito também (u só depende de T).' },
        { text: 'II e III, apenas', why: 'II é falsa: no adiabático Q = 0, mas o gás pode realizar ou receber trabalho.' },
        { text: 'I, II e III', why: 'II confunde adiabático (Q = 0) com isocórico (W = 0).' },
      ],
      answer: 2,
      roteiro: 'fmt.afirmativas',
      steps: [
        'I – **Correta**: no ciclo o estado final é o inicial: ΔU = 0 e Q_{líq} = W_{líq}.',
        'II – **Errada**: adiabático quer dizer **Q = 0**; o trabalho vale W = −ΔU, não zero.',
        'III – **Correta**: gás perfeito com T constante → ΔU = 0 → Q = W.',
        'Certas: I e III → "I e III, apenas".',
      ],
      explanation: '**I** – Correta: no ciclo o estado final é o inicial, ΔU = 0 e Q_{líq} = W_{líq}.\n**II** – Errada: adiabático quer dizer **Q = 0**; o trabalho é W = −ΔU (expansão adiabática esfria o gás).\n**III** – Correta: gás perfeito com T constante → ΔU = 0 → Q = W.',
    },
  ],
  games: [
    {
      id: 'mec-gas-g1',
      type: 'sort',
      title: 'Intensiva ou extensiva?',
      intro: 'Classifique cada grandeza. Lembre do teste da divisão: o que não muda ao dividir o sistema ao meio é **intensivo**.',
      lessonRef: 0,
      bins: ['Intensiva', 'Extensiva'],
      perRound: 10,
      items: [
        { text: 'Temperatura', bin: 0, why: 'Não depende da quantidade de matéria.' },
        { text: 'Pressão', bin: 0, why: 'Cada metade do sistema tem a mesma pressão.' },
        { text: 'Massa específica (ρ)', bin: 0, why: 'ρ = m/V: razão entre duas extensivas dá uma intensiva.' },
        { text: 'Volume específico (v)', bin: 0, why: 'v = V/m é propriedade específica: se comporta como intensiva (pegadinha do nome!).' },
        { text: 'Volume (V)', bin: 1, why: 'Dobra quando o sistema dobra.' },
        { text: 'Massa', bin: 1, why: 'Extensiva por definição.' },
        { text: 'Energia interna (U)', bin: 1, why: 'U dobra se o sistema dobra; u = U/m é que é intensiva.' },
        { text: 'Entalpia (H)', bin: 1, why: 'Depende da quantidade de matéria.' },
        { text: 'Entropia (S)', bin: 1, why: 'Extensiva; a entropia específica s é intensiva.' },
        { text: 'Entalpia específica (h)', bin: 0, why: 'h = H/m.' },
        { text: 'Calor específico (c)', bin: 0, why: 'Propriedade do material, por unidade de massa.' },
        { text: 'Capacidade térmica (C)', bin: 1, why: 'C = m·c: depende da massa.' },
        { text: 'Viscosidade', bin: 0, why: 'Propriedade do fluido, independente da quantidade.' },
      ],
    },
    {
      id: 'mec-gas-g2',
      type: 'match',
      title: 'Processos termodinâmicos',
      intro: 'Ligue cada processo ao que acontece nele (gás perfeito, sistema fechado).',
      lessonRef: 2,
      leftLabel: 'Processo',
      rightLabel: 'O que acontece',
      perRound: 6,
      pairs: [
        { left: 'Isobárico', right: 'P constante: W = P·ΔV', why: 'Área de um retângulo no diagrama P–V.' },
        { left: 'Isocórico', right: 'V constante: W = 0 e Q = ΔU', why: 'Sem variação de volume não há trabalho de fronteira.' },
        { left: 'Isotérmico', right: 'T constante: ΔU = 0 e Q = W', why: 'No gás perfeito, U depende só de T.' },
        { left: 'Adiabático', right: 'Sem troca de calor: W = −ΔU', why: 'Expande e esfria; comprime e esquenta.' },
        { left: 'Isentrópico', right: 'Adiabático e reversível: P·V^{k} = constante', why: 'k = c_{p}/c_{v} (ar ≈ 1,4).' },
        { left: 'Politrópico', right: 'P·V^{n} = constante (caso geral)', why: 'n = 0 isobárico, n = 1 isotérmico, n = k isentrópico.' },
        { left: 'Isentálpico', right: 'h constante: válvula de estrangulamento', why: 'Q = 0, W = 0 e ΔE_{c} ≈ 0 → h₁ = h₂.' },
      ],
    },
    {
      id: 'mec-gas-g3',
      type: 'sort',
      title: 'Possível ou impossível?',
      intro: 'Cada item é uma "invenção" ou um processo. A 2ª lei permite? Na dúvida, calcule o limite de Carnot **em kelvin**.',
      lessonRef: 5,
      bins: ['Possível', 'Impossível'],
      items: [
        { text: 'Motor entre 600 K e 300 K com rendimento de 40%', bin: 0, why: 'Carnot: 1 − 300/600 = 50%. 40% fica abaixo do limite.' },
        { text: 'Motor entre 600 K e 300 K com rendimento de 55%', bin: 1, why: 'Passa do limite de Carnot (50%).' },
        { text: 'Geladeira que leva calor do frio para o quente sem consumir energia', bin: 1, why: 'Viola o enunciado de Clausius.' },
        { text: 'Motor cíclico que transforma em trabalho todo o calor de uma única fonte', bin: 1, why: 'Viola o enunciado de Kelvin-Planck: algum calor tem de ir para uma fonte fria.' },
        { text: 'Refrigerador entre −23 °C e 27 °C com COP = 4', bin: 0, why: 'COP de Carnot = 250/50 = 5. 4 está abaixo.' },
        { text: 'Refrigerador entre −23 °C e 27 °C com COP = 6', bin: 1, why: 'Passa do COP de Carnot (5).' },
        { text: 'Bomba de calor entre 0 °C e 27 °C com COP = 9', bin: 0, why: 'COP de Carnot da bomba de calor = 300/27 ≈ 11. 9 está abaixo.' },
        { text: 'Bomba de calor com COP = 0,8', bin: 1, why: 'Na bomba de calor, Q_{Q} = Q_{F} + W ≥ W: o COP nunca é menor que 1.' },
        { text: 'Sistema fechado que perde calor e tem a entropia reduzida', bin: 0, why: 'O calor que sai leva entropia. É assim que a água congelando no freezer perde entropia.' },
        { text: 'Sistema isolado cuja entropia diminui', bin: 1, why: 'Sem troca de calor, ΔS = S_{ger} ≥ 0.' },
        { text: 'Compressão adiabática e reversível com entropia constante', bin: 0, why: 'É o processo isentrópico.' },
        { text: 'Ciclo em que o fluido termina com entropia maior que a inicial', bin: 1, why: 'Entropia é propriedade: no fim do ciclo o fluido volta ao mesmo estado (ΔS = 0). A entropia gerada fica nas fontes.' },
        { text: 'Gás que sofreu expansão livre e depois volta sozinho ao recipiente original', bin: 1, why: 'A expansão livre é irreversível: voltar sozinho reduziria a entropia de um sistema isolado.' },
      ],
    },
    {
      id: 'mec-gas-lab1',
      type: 'lab',
      lab: 'piston',
      title: 'Cilindro com pistão',
      intro: 'Ar num cilindro, sempre partindo de 100 kPa, 27 °C e 1 m³. Escolha o processo, aposte no resultado e confira no diagrama P–V (área = trabalho) e na 1ª lei Q = ΔU + W.',
      lessonRef: 3,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { proc: 0, t2: 327 },
          prompt: 'Aquecer o ar de 27 para 327 °C a **pressão constante** exige 350 kJ. Com o pistão **travado** (volume constante), o mesmo aquecimento exige…',
          change: { proc: 1 },
          options: ['menos calor: sem trabalho, todo o calor vira energia interna', 'mais calor, porque a pressão sobe', 'o mesmo calor, porque a variação de temperatura é igual', 'nenhum calor'],
          answer: 0,
          expect: [
            { out: 'Q', trend: 'down' },
            { out: 'W', trend: 'down' },
            { out: 'dU', trend: 'same' },
          ],
          why: 'ΔU depende só de T (gás perfeito): é 250 kJ nos dois casos. A pressão constante o gás ainda realiza 100 kJ de trabalho empurrando o pistão, então precisa de Q = 250 + 100 = 350 kJ. Travado, W = 0 e Q = ΔU = 250 kJ. É por isso que c_{p} > c_{v}.',
        },
        {
          kind: 'predict',
          setup: { proc: 2, v2: 2 },
          prompt: 'Expansão **isotérmica** de 1 para 2 m³. Repetindo a mesma expansão com as paredes **isoladas** (adiabática), o ar no fim estará…',
          change: { proc: 3 },
          options: ['mais frio e com pressão menor', 'mais quente e com pressão maior', 'a 27 °C, com a mesma pressão', 'mais frio, com a mesma pressão'],
          answer: 0,
          expect: [
            { out: 'T2', trend: 'down' },
            { out: 'P2', trend: 'down' },
            { out: 'W', trend: 'down' },
          ],
          why: 'Sem receber calor, o gás paga o trabalho de expansão com a própria energia interna: ΔU = −W < 0 e a temperatura cai (para −46 °C aqui). A pressão cai mais que no isotérmico (P·V^{1,4} = cte) e o trabalho é menor — no P–V, a adiabática passa por baixo da isoterma.',
        },
        {
          kind: 'goal',
          setup: { proc: 3, v2: 1 },
          lock: ['proc'],
          prompt: 'Comprima o ar **sem troca de calor** até ele passar de **200 °C** — é assim que o motor diesel inflama o combustível.',
          goals: [{ out: 'T2', min: 200, label: 'T₂ acima de 200 °C' }],
          hint: 'Empurre o pistão (ou arraste a manopla no desenho): quanto menor V₂, mais quente o ar fica.',
          solution: { v2: 0.3 },
          why: 'Na compressão adiabática todo o trabalho recebido vira energia interna: T₂ = T₁·(V₁/V₂)^{k−1}. Com V₂ = 0,3 m³ o ar já passa de 210 °C; num diesel, com taxa de compressão 18, passa de 650 °C.',
        },
        {
          kind: 'predict',
          setup: { proc: 4, n: 1.3, v2: 0.5 },
          prompt: 'Compressão politrópica (n = 1,3) de 1 para 0,5 m³. Se o expoente subir para **n = 1,4**, a temperatura e a pressão finais…',
          change: { n: 1.4 },
          options: ['sobem as duas', 'caem as duas', 'não mudam', 'a temperatura sobe e a pressão cai'],
          answer: 0,
          expect: [
            { out: 'T2', trend: 'up' },
            { out: 'P2', trend: 'up' },
            { out: 'absQ', trend: 'down' },
          ],
          why: 'Com n = 1,3 o ar perde um pouco de calor enquanto é comprimido (como num compressor com camisa de água). Com n = k = 1,4 ele não perde nada: mais energia fica no gás e T₂ e P₂ sobem. Quanto mais resfriada a compressão (n menor), menos trabalho ela consome.',
        },
        {
          kind: 'goal',
          setup: { proc: 4, n: 1.2, v2: 0.5 },
          lock: ['proc', 'v2'],
          prompt: 'Comprimindo de 1 para 0,5 m³, faça o ar **receber** calor (Q > 0) em vez de perder.',
          goals: [{ out: 'Q', min: 1, label: 'Q > 0 (o ar recebe calor)' }],
          hint: 'Com 1 < n < k o ar perde calor na compressão; com n = k, Q = 0. E acima de k?',
          solution: { n: 1.6 },
          why: 'Para n > k, a temperatura sobe mais do que subiria só com o trabalho recebido: o ar precisa **receber** calor. Entre 1 e k ele perde calor; com n = k, Q = 0.',
        },
        {
          kind: 'predict',
          setup: { proc: 0, t2: 127 },
          prompt: 'A pressão constante, aquecendo de 27 para 127 °C, 28,6 % do calor recebido vira trabalho. Aquecendo até **327 °C**, essa fração…',
          change: { t2: 327 },
          options: ['continua 28,6 % (é R/c_{p})', 'aumenta', 'diminui', 'chega a 100 %'],
          answer: 0,
          expect: [
            { out: 'wq', trend: 'same' },
            { out: 'Q', trend: 'up' },
          ],
          why: 'A pressão constante, W = m·R·ΔT e Q = m·c_{p}·ΔT: a razão W/Q = R/c_{p} = 0,287/1,005 ≈ 28,6 %, qualquer que seja o ΔT. O resto (c_{v}/c_{p} ≈ 71,4 %) vira energia interna.',
        },
      ],
    },
  ],
});
