import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

export default defineTopic({
  id: 'mec.compressores',
  name: 'Compressores: alternativos, centrífugos e axiais',
  summary: 'Tipos de compressores, o ciclo do alternativo com espaço morto, rendimento volumétrico, trabalho e temperatura de descarga, estágios com resfriamento intermediário, surge e controle de capacidade.',
  order: 5,
  weight: 2,
  equipment: 'compressor',
  requires: ['mec.gases-1a-lei'],
  edital: ['b2.compressores', 'b2.maquinas-desempenho', 'b1.termo-1lei'],
  lesson: [
    {
      title: 'Tipos de compressores',
      body: 'Compressores elevam a pressão de gases e vapores. Há dois grandes grupos:\n\n- **Deslocamento positivo (volumétricos):** um volume de gás é aprisionado e reduzido mecanicamente — **alternativos** (pistão), **parafuso**, **palhetas** e **lóbulos**. A vazão depende pouco da pressão de descarga, e chegam a pressões muito altas.\n- **Dinâmicos (turbocompressores):** o rotor acelera o gás e o difusor transforma velocidade em pressão — **centrífugos** (saída radial) e **axiais** (fluxo paralelo ao eixo). Fluxo contínuo e grandes vazões.\n\nRegra de bolso para a escolha:\n\n- **alternativo:** pressão alta e vazão pequena;\n- **centrífugo:** vazões médias a altas, com razão moderada por estágio;\n- **axial:** vazões enormes com razão pequena por estágio (o compressor das turbinas a gás).',
      hot: 'Exemplo de compressor **dinâmico** — o axial — contra os volumétricos (palhetas, lóbulos, parafusos, diafragma) (Petrobras 2014); afirmativas sobre o compressor de **diafragma** (Petrobras 2012) e sobre o alternativo de pistão (Petrobras 2012).',
      tip: 'O volumétrico **empurra** o gás para um volume menor; o dinâmico **acelera** o gás e depois o **freia** no difusor.',
      trap: 'Um volumétrico com a descarga bloqueada continua comprimindo até algo romper. Por isso ele exige **válvula de segurança** entre o compressor e qualquer válvula de bloqueio.',
      lab: { lab: 'compressor', label: 'Ver o compressor alternativo' },
    },
    {
      title: 'O ciclo do alternativo e o espaço morto',
      body: 'No **PMS** (ponto morto superior) sempre sobra um pequeno volume entre o pistão e o cabeçote: o **espaço morto** V_{c} (folga mecânica e passagens das válvulas). Em relação ao volume deslocado: **c = V_{c}/V_{d}**, tipicamente de 3 % a 10 %.\n\nO ciclo indicado (o diagrama P–V medido no cilindro) tem quatro etapas:\n\n- **1 → 2 compressão**, com as duas válvulas fechadas;\n- **2 → 3 descarga** a P₂: a válvula de descarga abre quando a pressão no cilindro supera a da linha;\n- **3 → 4 re-expansão** do gás que ficou no espaço morto, de novo com as válvulas fechadas;\n- **4 → 1 aspiração** a P₁: a válvula de sucção só abre quando a pressão cai abaixo da de sucção.\n\nAs válvulas são **automáticas** (placas ou lâminas com mola): quem as abre é a **diferença de pressão**, não um eixo de cames como no motor.',
      hot: 'Válvulas com **mais resistência** ao escoamento pioram o enchimento e o consumo de energia do alternativo (Transpetro 2018); definição do rendimento volumétrico real × o do espaço nocivo (Petrobras 2014).',
      trap: 'O gás preso no espaço morto re-expande e **devolve** ao pistão o trabalho que recebeu. O que se perde é **curso de aspiração** (capacidade), não energia por kg.',
      lab: { lab: 'compressor', preset: { p2: 900, c: 15, n: 1.3, stages: 0 }, label: 'Ver a re-expansão' },
    },
    {
      title: 'Rendimento volumétrico',
      body: 'É a fração do volume deslocado que vira gás novo:\n\n**η_{v} = (V₁ − V₄)/V_{d} = 1 + c − c·(P₂/P₁)^{1/n}**\n\n- cai quando a **razão de pressões** aumenta;\n- cai quando o **espaço morto** aumenta;\n- chega a **zero** na razão máxima **(P₂/P₁)_{máx} = (1 + 1/c)^{n}**: o gás preso re-expande o curso inteiro e a sucção nem chega a abrir.\n\nVazão aspirada num compressor de **simples efeito**: **V̇ = η_{v}·V_{d}·N**, com V_{d} = (π·D²/4)·L (D = diâmetro, L = curso, N = rotação). No **duplo efeito**, as duas faces do pistão comprimem: quase o dobro.',
      example: 'c = 5 %, aspiração a 100 kPa e descarga a 700 kPa (absolutas), n = 1,3: 7^{1/1,3} ≈ 4,47 → η_{v} = 1 + 0,05 − 0,05 × 4,47 ≈ **0,827**. Com V_{d} = 10 L e 600 rpm: 0,827 × 10 L × 600 ≈ **4,96 m³/min** de ar.',
      trap: 'A razão é entre pressões **absolutas**: descarga a 6 bar manométricos com aspiração atmosférica dá razão 7, não 6.',
      lab: { lab: 'compressor', preset: { p2: 1200, c: 20, n: 1.3, stages: 0 }, label: 'Ver o compressor que não aspira' },
    },
    {
      title: 'Trabalho, potência e temperatura de descarga',
      body: 'Por kg de gás, entre P₁ e P₂ (o espaço morto não entra na conta):\n\n- **isotérmico** (n = 1): w = R·T₁·ln(P₂/P₁) — o **menor** trabalho;\n- **politrópico**: w = n/(n−1)·R·T₁·[(P₂/P₁)^{(n−1)/n} − 1];\n- **adiabático** (n = k = 1,4 para o ar): o maior dos três.\n\nPotência: **Ẇ = ṁ·w**. Com a vazão medida na sucção: Ẇ = n/(n−1)·P₁·V̇₁·[(P₂/P₁)^{(n−1)/n} − 1].\n\nTemperatura de descarga: **T₂ = T₁·(P₂/P₁)^{(n−1)/n}**, com T em **kelvin**. Quanto mais calor as camisas d’água e as aletas tiram durante a compressão, mais perto do isotérmico. O **rendimento isotérmico** compara os dois: η_{iso} = w_{iso}/w.',
      example: 'Ar a 27 °C (300 K), de 100 para 700 kPa com n = 1,3: 7^{0,231} ≈ 1,567 → T₂ ≈ 470 K = **197 °C** e w = 4,33 × 0,287 × 300 × 0,567 ≈ **211 kJ/kg**. O isotérmico gastaria 0,287 × 300 × ln 7 ≈ 168 kJ/kg.',
      trap: 'Elevar a temperatura em °C dá absurdo: 27 × 1,567 ≈ 42 °C. Converta para kelvin antes.',
      lab: { lab: 'compressor', preset: { p2: 800, c: 5, n: 1, stages: 0 }, label: 'Comparar isotérmico e adiabático' },
    },
    {
      title: 'Estágios com resfriamento intermediário',
      body: 'Para razões de pressão altas, a compressão é dividida em estágios, com um **resfriador intermediário** (*intercooler*) que devolve o gás à temperatura de entrada. Ganhos:\n\n- **menos trabalho**: o caminho se aproxima da isoterma;\n- **descarga mais fria** em cada estágio (protege o óleo, as válvulas e as gaxetas);\n- **η_{v} maior**, porque cada estágio trabalha com razão menor;\n- o condensado é drenado nos separadores entre os estágios.\n\nCom resfriamento perfeito, o trabalho total é mínimo com **razões iguais**: **P_{i} = √(P₁·P₂)** em dois estágios, ou razão **(P₂/P₁)^{1/z}** em cada um de z estágios. Assim os estágios realizam **o mesmo trabalho** e têm a mesma temperatura de descarga.',
      example: 'Aspiração a 1 bar e descarga a 16 bar (absolutas), dois estágios: P_{i} = √(1 × 16) = **4 bar**, razão 4 em cada um. Em três estágios: 16^{1/3} ≈ 2,52 por estágio.',
      hot: 'No diagrama P–V da compressão em **dois estágios**, a área economizada pelo resfriamento intermediário e a área do trabalho adiabático de um estágio só, o que mais consome (Petrobras 2011).',
      tip: 'Pressão intermediária ótima é a **média geométrica**, não a aritmética (que daria 8,5 bar no exemplo).',
      trap: 'O ganho vem de **tirar o calor** entre os estágios. Se a compressão já fosse isotérmica, dividir em estágios não economizaria nada.',
      lab: { lab: 'compressor', preset: { p2: 1000, c: 5, n: 1.3, stages: 1 }, label: 'Ver os dois estágios' },
    },
    {
      title: 'Centrífugos e axiais',
      body: '**Centrífugo:** o **impelidor** lança o gás para a periferia, aumentando velocidade e pressão; o **difusor** e a **voluta** convertem a velocidade em pressão. Cada estágio dá razão de cerca de 1,5 a 4; vários impelidores no mesmo eixo formam um compressor de múltiplos estágios, com resfriamento entre grupos.\n\n**Axial:** fileiras alternadas de **palhetas móveis** (rotor) e **palhetas fixas** (estator). Cada estágio dá razão pequena (cerca de 1,1 a 1,4), então são muitos estágios; em compensação, a vazão é enorme e o rendimento é alto. É o compressor das turbinas a gás.\n\nPara a mesma máquina e o mesmo gás valem as **leis de semelhança** das bombas: Q ∝ N, H ∝ N² e P ∝ N³.\n\nNa curva de desempenho, a altura cresce quando a vazão cai, até um limite: o **surge** (próximo card).',
      hot: 'Vantagens do **centrífugo** sobre o alternativo de mesma capacidade — menos peças com desgaste, vazão contínua, menos manutenção (Transpetro 2012).',
      tip: 'Dinâmico: **muita vazão, pouca razão por estágio**. Alternativo: **pouca vazão, muita razão**.',
      trap: 'O axial **não** tem razão por estágio maior que a do centrífugo: é o contrário. Ele ganha em vazão e rendimento.',
    },
    {
      title: 'Surge, choke e controle de capacidade',
      body: '**Surge** (bombeamento), nos dinâmicos: abaixo de uma vazão mínima, o compressor não sustenta a pressão do sistema e o fluxo **reverte** periodicamente — ruído, vibração, golpes de empuxo nos mancais e aquecimento. Proteção: **válvula anti-surge**, que recircula gás da descarga para a sucção e mantém a vazão à direita da **linha de surge**. No axial, o descolamento nas palhetas é o **estol**.\n\n**Choke** (*stonewall*): na vazão máxima, o escoamento chega à velocidade do som em alguma seção e a vazão não sobe mais.\n\nControle de capacidade:\n\n- **Alternativo:** **descarregadores** (mantêm a válvula de sucção aberta e o cilindro trabalha em vazio, também na partida), **bolsões de espaço morto** (aumentam c e reduzem η_{v}), rotação variável e *by-pass*.\n- **Centrífugo:** rotação variável, **palhetas guias de entrada** (IGV), estrangulamento da sucção e reciclo (o mais caro em energia).',
      trap: 'Surge é problema de vazão **baixa**; choke, de vazão **alta**. E não se reduz a vazão de um alternativo estrangulando a descarga: a pressão sobe sem limite.',
      lab: { lab: 'compressor', preset: { p2: 700, c: 18, n: 1.3, stages: 0 }, label: 'Ver o bolsão de espaço morto' },
    },
  ],
  roteiros: [
    {
      id: 'espaco-morto',
      name: 'Espaço morto e rendimento volumétrico',
      when: 'Compressor alternativo com espaço morto e razão de pressões; pedem o rendimento volumétrico, a vazão aspirada ou a razão-limite.',
      steps: [
        'Escreva η_{v} = 1 + c − c·(P₂/P₁)^{1/n}, com c em fração e pressões absolutas.',
        'Substitua — ou imponha η_{v} = 0 para achar a razão em que ele deixa de aspirar.',
        'Conclua: vazão aspirada = η_{v} × volume deslocado; razão maior ou espaço morto maior → η_{v} menor.',
      ],
      note: 'Espaço morto maior reduz a vazão, mas não o trabalho por kg: o gás re-expande devolvendo a energia.',
    },
    {
      id: 'multiestagio',
      name: 'Compressão em estágios com resfriamento intermediário',
      when: 'Compressor de dois ou mais estágios com intercooler; pedem a pressão intermediária, o trabalho ou a temperatura.',
      steps: [
        'Passe as pressões para **absolutas** (manométrica + atmosférica).',
        'Pressão intermediária ótima: P_{i} = √(P₁·P₂) — razões iguais nos estágios.',
        'Com resfriamento perfeito, cada estágio faz o mesmo trabalho e descarrega à mesma temperatura.',
      ],
      note: 'Usar pressão manométrica na raiz é o erro clássico. O intercooler reduz o trabalho total e a temperatura de descarga.',
    },
    {
      id: 'compressao-gas',
      name: 'Temperatura e potência na compressão de gás',
      when: 'Gás comprimido de P₁ a P₂ (politrópico, isentrópico, isotérmico ou real); pedem a temperatura de descarga ou a potência.',
      steps: [
        'Temperaturas em kelvin e pressões absolutas; identifique o processo (n ou k).',
        'Escreva a relação: T₂ = T₁·(P₂/P₁)^{(n−1)/n}; isotérmico, Ẇ = P₁·V̇₁·ln(P₂/P₁); real, ΔT = ΔT_{ideal}/η.',
        'Calcule e volte para a unidade pedida (K → °C; kPa·m³/s = kW).',
      ],
      note: 'Isotérmico é o mínimo de trabalho; adiabático, o máximo. A ineficiência do compressor vira calor no próprio gás.',
    },
  ],
  questions: [
    {
      id: 'mec-comp-01',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Rendimento volumétrico com espaço morto',
      roteiro: 'espaco-morto',
      generate(rng) {
        const c = pickOne(rng, [3, 4, 5, 6, 8]);
        const p2 = pickOne(rng, [400, 500, 600, 700, 800, 900]);
        const n = pickOne(rng, [1.2, 1.25, 1.3, 1.35]);
        const r = p2 / 100;
        const X = Math.round(Math.pow(r, 1 / n) * 100) / 100;
        const cf = c / 100;
        const eta = (1 + cf - cf * X) * 100;
        const { options, answer } = numericOptions({
          correct: eta,
          unit: '%',
          digits: 1,
          correctWhy: `η_{v} = 1 + ${fmt(cf, 2)} − ${fmt(cf, 2)} × ${fmt(X, 2)} = ${fmt(eta, 1)} %.`,
          distractors: [
            { value: (1 - cf * X) * 100, why: 'Esqueceu o "+ c": η_{v} = 1 + c − c·(P₂/P₁)^{1/n}.' },
            { value: (1 + cf - cf * r) * 100, why: 'Faltou o expoente 1/n na razão de pressões.' },
            { value: (1 - cf) * 100, why: 'Descontou só o espaço morto. O gás preso re-expande até V₄ = V_{c}·(P₂/P₁)^{1/n} e rouba bem mais curso.' },
            { value: (cf * X - cf) * 100, why: 'Essa é a fração do curso perdida na re-expansão (1 − η_{v}), não o rendimento.' },
          ],
        });
        return {
          prompt: `Um compressor alternativo de ar tem espaço morto de **${c} %** do volume deslocado. Ele aspira a **100 kPa** e descarrega a **${fmt(p2)} kPa** (pressões absolutas), e a re-expansão segue P·Vⁿ = cte com **n = ${fmt(n, 2)}**. Dado: (P₂/P₁)^{1/n} ≈ ${fmt(X, 2)}. O rendimento volumétrico é, aproximadamente,`,
          options,
          answer,
          hint: 'η_{v} = 1 + c − c·(P₂/P₁)^{1/n}.',
          steps: [
            `c = ${fmt(cf, 2)}; P₂/P₁ = ${fmt(p2)}/100 = ${fmt(r)}; (P₂/P₁)^{1/n} ≈ ${fmt(X, 2)}.`,
            `η_{v} = 1 + ${fmt(cf, 2)} − ${fmt(cf, 2)} × ${fmt(X, 2)}.`,
            `η_{v} = **${fmt(eta, 1)} %**.`,
          ],
          explanation: `O gás do espaço morto re-expande até a pressão de sucção antes de a válvula de sucção abrir.\n\nη_{v} = 1 + c − c·(P₂/P₁)^{1/n} = 1 + ${fmt(cf, 2)} − ${fmt(cf, 2)} × ${fmt(X, 2)} = **${fmt(eta, 1)} %**.`,
        };
      },
    },
    {
      id: 'mec-comp-02',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Vazão aspirada pelo alternativo',
      roteiro: 'espaco-morto',
      generate(rng) {
        const D = pickOne(rng, [0.1, 0.12, 0.15, 0.2]);
        const L = pickOne(rng, [0.1, 0.12, 0.15, 0.2]);
        const N = pickOne(rng, [300, 400, 500, 600]);
        const ev = pickOne(rng, [0.75, 0.8, 0.85, 0.9]);
        const Vd = (3 * D * D * L) / 4;
        const Q = ev * Vd * N;
        const { options, answer } = numericOptions({
          correct: Q,
          unit: 'm³/min',
          digits: 3,
          correctWhy: `V̇ = η_{v}·V_{d}·N = ${fmt(ev, 2)} × ${fmt(Vd, 6)} × ${N} = ${fmt(Q, 3)} m³/min.`,
          distractors: [
            { value: Vd * N, why: 'Essa é a vazão **deslocada**; a aspirada é η_{v} vezes ela.' },
            { value: 2 * Q, why: 'Contou as duas faces do pistão: isso vale para o **duplo efeito**, não para o simples.' },
            { value: 4 * Q, why: 'Usou π·D² como área; a área do pistão é π·D²/4.' },
            { value: (Vd * N) / ev, why: 'Dividiu pelo rendimento volumétrico; a vazão real é **menor** que a deslocada.' },
          ],
        });
        return {
          prompt: `Um compressor alternativo de **simples efeito** tem cilindro de **${fmt(D * 1000)} mm** de diâmetro e **${fmt(L * 1000)} mm** de curso, gira a **${N} rpm** e tem rendimento volumétrico de **${fmt(ev * 100)} %**. Considerando π = 3, a vazão de ar aspirado é, aproximadamente,`,
          options,
          answer,
          hint: 'Volume deslocado por volta: (π·D²/4)·L. Simples efeito: uma compressão por volta.',
          steps: [
            { do: 'Volume deslocado por volta: (π·D²/4)·L (simples efeito: uma compressão por volta).', show: `V_{d} = (3 × ${fmt(D, 2)}²/4) × ${fmt(L, 2)} = ${fmt(Vd, 6)} m³.` },
            { do: 'Vazão aspirada = rendimento volumétrico × V_{d} × rotação.', show: `V̇ = ${fmt(ev, 2)} × ${fmt(Vd, 6)} × ${N}.` },
            { do: 'Calcule, de olho na unidade (com rpm, sai em m³/min).', show: `V̇ = **${fmt(Q, 3)} m³/min**.` },
          ],
          explanation: `Volume deslocado por volta: V_{d} = (π·D²/4)·L = (3 × ${fmt(D, 2)}²/4) × ${fmt(L, 2)} = ${fmt(Vd, 6)} m³.\n\nV̇ = η_{v}·V_{d}·N = ${fmt(ev, 2)} × ${fmt(Vd, 6)} × ${N} = **${fmt(Q, 3)} m³/min**.`,
        };
      },
    },
    {
      id: 'mec-comp-03',
      type: 'gen',
      difficulty: 3,
      lessonRef: 2,
      title: 'Razão de pressões máxima',
      roteiro: 'espaco-morto',
      generate(rng) {
        const c = pickOne(rng, [4, 5, 8, 10]);
        const n = pickOne(rng, [1.2, 1.25, 1.3]);
        const base = 1 + 100 / c;
        const A = Math.pow(base, n);
        const B = Math.pow(base, 1 / n);
        const { options, answer } = numericOptions({
          correct: A,
          digits: 1,
          correctWhy: `η_{v} = 0 → (P₂/P₁)^{1/n} = 1 + 1/c = ${fmt(base, 1)} → P₂/P₁ = ${fmt(base, 1)}^{${fmt(n, 2)}} ≈ ${fmt(A, 1)}.`,
          distractors: [
            { value: B, why: 'Usou o expoente 1/n. Da condição η_{v} = 0 sai (P₂/P₁)^{1/n} = 1 + 1/c; logo P₂/P₁ = (1 + 1/c)^{n}.' },
            { value: base, why: 'Ignorou o expoente: isso só valeria com re-expansão isotérmica (n = 1).' },
            { value: 100 / c, why: 'Usou 1/c; a condição é (P₂/P₁)^{1/n} = 1 + 1/c.' },
            { value: Math.pow(100 / c, n), why: 'Faltou somar 1: 1 + c − c·r^{1/n} = 0 → r^{1/n} = (1 + c)/c = 1 + 1/c.' },
          ],
        });
        return {
          prompt: `Um compressor alternativo tem espaço morto de **${c} %** do volume deslocado, e a re-expansão segue P·Vⁿ = cte com **n = ${fmt(n, 2)}**. A partir de qual razão de pressões absolutas P₂/P₁ ele **deixa de aspirar** gás? Dados: ${fmt(base, 1)}^{${fmt(n, 2)}} ≈ ${fmt(A, 1)} e ${fmt(base, 1)}^{${fmt(1 / n, 2)}} ≈ ${fmt(B, 1)}.`,
          options,
          answer,
          hint: 'Ele deixa de aspirar quando o rendimento volumétrico chega a zero.',
          steps: [
            `c = ${fmt(c / 100, 2)}; a incógnita é P₂/P₁.`,
            `η_{v} = 0 → (P₂/P₁)^{1/n} = (1 + c)/c = 1 + 1/c = ${fmt(base, 1)}.`,
            `(P₂/P₁)_{máx} = ${fmt(base, 1)}^{${fmt(n, 2)}} ≈ **${fmt(A, 1)}** — acima disso, ele não aspira mais.`,
          ],
          explanation: `O compressor deixa de aspirar quando η_{v} = 0:\n\n1 + c − c·(P₂/P₁)^{1/n} = 0 → (P₂/P₁)^{1/n} = (1 + c)/c = 1 + 1/c = ${fmt(base, 1)}.\n\nLogo (P₂/P₁)_{máx} = ${fmt(base, 1)}^{${fmt(n, 2)}} ≈ **${fmt(A, 1)}**. Acima disso, o gás do espaço morto re-expande o curso inteiro sem chegar à pressão de sucção.`,
        };
      },
    },
    {
      id: 'mec-comp-04',
      type: 'gen',
      difficulty: 2,
      lessonRef: 4,
      title: 'Pressão intermediária ótima',
      roteiro: 'multiestagio',
      generate(rng) {
        const k = pickOne(rng, [3, 4, 5, 6, 7, 8]);
        const p2abs = k * k;
        const p2g = p2abs - 1;
        const { options, answer } = numericOptions({
          correct: k,
          unit: 'bar',
          digits: 2,
          correctWhy: `P_{i} = √(P₁·P₂) = √(1 × ${p2abs}) = ${k} bar (absoluto).`,
          distractors: [
            { value: Math.sqrt(p2g), why: `Usou a pressão manométrica na raiz; a conta é com pressões **absolutas** (P₂ = ${p2g} + 1 = ${p2abs} bar).` },
            { value: (1 + p2abs) / 2, why: 'Média aritmética: a pressão ótima é a média **geométrica**, √(P₁·P₂).' },
            { value: p2abs / 2, why: 'Dividiu a pressão final ao meio; o que se iguala nos estágios é a **razão**, não o salto de pressão.' },
            { value: k - 1, why: 'Esse valor é a pressão intermediária **manométrica**; a pergunta pede a absoluta.' },
          ],
        });
        return {
          prompt: `Um compressor de **dois estágios** com resfriamento intermediário perfeito aspira ar atmosférico (**1 bar** absoluto) e o entrega a **${p2g} bar manométricos**. Para o menor trabalho total, a pressão intermediária, em bar **absolutos**, deve ser de`,
          options,
          answer,
          hint: 'Razões iguais nos dois estágios — e só com pressões absolutas.',
          steps: [
            `P₁ = 1 bar; P₂ = ${p2g} + 1 = ${p2abs} bar (absolutos).`,
            `P_{i} = √(1 × ${p2abs}) = **${k} bar** absolutos (${k - 1} bar manométricos).`,
            `Cada estágio comprime ${k} vezes: ${k} × ${k} = ${p2abs}.`,
          ],
          explanation: `Pressões absolutas: P₁ = 1 bar e P₂ = ${p2g} + 1 = ${p2abs} bar.\n\nRazões iguais nos dois estágios: P_{i} = √(P₁·P₂) = √(1 × ${p2abs}) = **${k} bar** (absoluto), ou seja, ${k - 1} bar manométricos. Cada estágio comprime ${k} vezes.`,
        };
      },
    },
    {
      id: 'mec-comp-05',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Temperatura de descarga',
      roteiro: 'compressao-gas',
      generate(rng) {
        const t1 = pickOne(rng, [17, 27, 37]);
        const r = pickOne(rng, [4, 6, 8, 9]);
        const n = pickOne(rng, [1.25, 1.3, 1.4]);
        const e = (n - 1) / n;
        const F = Math.round(Math.pow(r, e) * 100) / 100;
        const T1 = t1 + 273;
        const T2 = T1 * F;
        const { options, answer } = numericOptions({
          correct: T2 - 273,
          unit: '°C',
          digits: 0,
          correctWhy: `T₂ = ${T1} K × ${fmt(F, 2)} = ${fmt(T2, 0)} K = ${fmt(T2 - 273, 0)} °C.`,
          distractors: [
            { value: t1 * F, why: 'Multiplicou a temperatura em °C; a relação vale para temperatura **absoluta** (K).' },
            { value: T2, why: 'Esse é T₂ em **kelvin**; em °C, subtraia 273.' },
            { value: t1, why: 'Supôs compressão isotérmica; com n > 1 o gás esquenta.' },
            { value: T1 * r - 273, why: 'Usou T ∝ P, como se o volume ficasse constante; na compressão o volume também diminui.' },
          ],
        });
        return {
          prompt: `Ar a **${t1} °C** é comprimido de **100 kPa** para **${r * 100} kPa** num processo politrópico com **n = ${fmt(n, 2)}**. Dado: ${r}^{${fmt(e, 3)}} ≈ ${fmt(F, 2)}. A temperatura de descarga é, aproximadamente,`,
          options,
          answer,
          hint: 'T₂ = T₁·(P₂/P₁)^{(n−1)/n}, com T em kelvin.',
          steps: [
            `T₁ = ${t1} + 273 = ${T1} K; P₂/P₁ = ${r}; (n − 1)/n = ${fmt(e, 3)}.`,
            `T₂ = ${T1} × ${r}^{${fmt(e, 3)}} = ${T1} × ${fmt(F, 2)}.`,
            `T₂ = ${fmt(T2, 0)} K = **${fmt(T2 - 273, 0)} °C**.`,
          ],
          explanation: `T₂ = T₁·(P₂/P₁)^{(n−1)/n}, com T em kelvin: T₁ = ${t1} + 273 = ${T1} K e (n − 1)/n = ${fmt(e, 3)}.\n\nT₂ = ${T1} × ${fmt(F, 2)} = ${fmt(T2, 0)} K = **${fmt(T2 - 273, 0)} °C**.`,
        };
      },
    },
    {
      id: 'mec-comp-06',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Potência mínima (compressão isotérmica)',
      roteiro: 'compressao-gas',
      generate(rng) {
        const Vm = pickOne(rng, [3, 6, 9, 12]);
        const r = pickOne(rng, [4, 5, 8, 10] as const);
        const lnr = { 4: 1.386, 5: 1.609, 8: 2.079, 10: 2.303 }[r];
        const V = Vm / 60;
        const W = 100 * V * lnr;
        const { options, answer } = numericOptions({
          correct: W,
          unit: 'kW',
          digits: 1,
          correctWhy: `Ẇ = P₁·V̇₁·ln(P₂/P₁) = 100 × ${fmt(V, 3)} × ${fmt(lnr, 3)} = ${fmt(W, 1)} kW.`,
          distractors: [
            { value: 100 * Vm * lnr, why: 'Esqueceu de converter m³/min para m³/s (÷ 60).' },
            { value: 100 * V * Math.log10(r), why: 'Usou o logaritmo decimal; a fórmula pede o **natural** (ln).' },
            { value: 100 * V * (r - 1), why: 'Trocou ln(P₂/P₁) por (P₂/P₁ − 1).' },
            { value: r * W, why: 'Usou a pressão de descarga: Ẇ = P₁·V̇₁·ln(P₂/P₁), com pressão e volume medidos na sucção.' },
          ],
        });
        return {
          prompt: `Um compressor aspira **${Vm} m³/min** de ar a **100 kPa** e o descarrega a **${r * 100} kPa**. Considerando compressão **isotérmica** reversível (o mínimo teórico) e ln ${r} ≈ ${fmt(lnr, 3)}, a potência necessária é, aproximadamente,`,
          options,
          answer,
          hint: 'Isotérmico: Ẇ = P₁·V̇₁·ln(P₂/P₁). kPa × m³/s = kW.',
          steps: [
            `Isotérmico reversível; V̇₁ = ${Vm}/60 = ${fmt(V, 3)} m³/s; P₂/P₁ = ${r}.`,
            `Ẇ = P₁·V̇₁·ln(P₂/P₁) = 100 × ${fmt(V, 3)} × ${fmt(lnr, 3)}.`,
            `Ẇ = **${fmt(W, 1)} kW** (kPa·m³/s = kW) — o mínimo teórico.`,
          ],
          explanation: `Na compressão isotérmica, Ẇ = P₁·V̇₁·ln(P₂/P₁).\n\nV̇₁ = ${Vm}/60 = ${fmt(V, 3)} m³/s.\n\nẆ = 100 kPa × ${fmt(V, 3)} m³/s × ${fmt(lnr, 3)} = **${fmt(W, 1)} kW** (kPa·m³/s = kW). Com n > 1 a potência real seria maior.`,
        };
      },
    },
    {
      id: 'mec-comp-07',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Para comprimir uma **pequena vazão** de gás até uma **pressão muito alta** (por exemplo, 200 bar), o tipo de compressor mais indicado é o',
      options: [
        { text: 'alternativo, em vários estágios com resfriamento intermediário.', why: 'Correta: volumétrico, com razão alta por estágio e estágios para dividir a compressão.' },
        { text: 'axial de um só estágio.', why: 'O axial dá razão pequena por estágio e serve para vazões enormes.' },
        { text: 'centrífugo de um só estágio.', why: 'Um estágio centrífugo dá razão de poucas unidades.' },
        { text: 'ventilador centrífugo.', why: 'Ventiladores elevam a pressão muito pouco.' },
        { text: 'soprador de lóbulos (roots).', why: 'O roots não comprime internamente: serve para razões baixas.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **pequena vazão** e **pressão muito alta**.',
        'Alternativos dominam a alta pressão com pouca vazão; centrífugos, as vazões médias; axiais, as vazões enormes com pouca razão por estágio.',
        'Fica **alternativo, em vários estágios com resfriamento intermediário**.',
      ],
      explanation: 'Os alternativos dominam as **altas pressões com vazões pequenas**; os centrífugos, as vazões médias a altas com razões moderadas; os axiais, as vazões enormes com razão pequena por estágio. Para razões muito altas, a compressão é dividida em estágios com resfriamento intermediário.',
    },
    {
      id: 'mec-comp-08',
      difficulty: 2,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Num compressor alternativo, a válvula de **sucção** abre quando',
      options: [
        { text: 'a pressão no cilindro cai abaixo da pressão na linha de sucção.', why: 'Correta: as válvulas são automáticas, abertas pela diferença de pressão.' },
        { text: 'o pistão chega ao ponto morto superior.', why: 'No PMS ainda há gás comprimido no espaço morto; ele precisa re-expandir antes.' },
        { text: 'o eixo de cames empurra a haste da válvula.', why: 'Isso é do motor de combustão; no compressor as válvulas são automáticas.' },
        { text: 'a válvula de descarga termina de fechar.', why: 'A descarga fecha no PMS, mas a sucção só abre depois da re-expansão.' },
        { text: 'a temperatura no cilindro chega à do ar externo.', why: 'Quem comanda a abertura é a pressão, não a temperatura.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: quando a válvula de **sucção** abre.',
        'As válvulas são automáticas (placa com mola) e abrem por diferença de pressão. Depois do PMS, o gás do espaço morto re-expande até a pressão cair.',
        'Fica **quando a pressão no cilindro cai abaixo da de sucção**.',
      ],
      explanation: 'As válvulas do compressor alternativo são **automáticas** (placas ou lâminas com mola). Depois do PMS, o gás do espaço morto re-expande com as válvulas fechadas; quando a pressão no cilindro fica abaixo da de sucção, a diferença de pressão vence a mola e a válvula de sucção abre.',
    },
    {
      id: 'mec-comp-09',
      difficulty: 2,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Num compressor alternativo ideal, **aumentar o espaço morto**, mantidas as pressões de sucção e de descarga,',
      options: [
        { text: 'reduz a vazão aspirada, sem alterar o trabalho por kg de gás comprimido.', why: 'Correta: o gás preso re-expande e devolve o trabalho; perde-se curso de aspiração.' },
        { text: 'aumenta o trabalho por kg, pois há mais gás a comprimir em cada ciclo.', why: 'O gás do espaço morto é comprimido e re-expandido: o trabalho dele volta ao pistão.' },
        { text: 'aumenta o rendimento volumétrico.', why: 'O rendimento volumétrico cai: η_{v} = 1 + c − c·(P₂/P₁)^{1/n}.' },
        { text: 'aumenta a temperatura de descarga.', why: 'T₂ = T₁·(P₂/P₁)^{(n−1)/n} não depende do espaço morto.' },
        { text: 'não altera nada, pois o espaço morto é só uma folga mecânica.', why: 'Ele reduz a capacidade; por isso bolsões de espaço morto servem para controlar a vazão.' },
      ],
      answer: 0,
      roteiro: 'espaco-morto',
      steps: [
        'η_{v} = 1 + c − c·(P₂/P₁)^{1/n}: c maior, mesma razão de pressões.',
        'O termo c·[(P₂/P₁)^{1/n} − 1] cresce → η_{v} cai.',
        'Menos gás aspirado por ciclo, e o gás do espaço morto re-expande devolvendo o trabalho: **reduz a vazão, sem alterar o trabalho por kg**.',
      ],
      explanation: 'No ciclo ideal, o gás que fica no espaço morto é comprimido e depois re-expande pela mesma politrópica, devolvendo ao pistão o trabalho recebido. O trabalho por kg e a temperatura de descarga não mudam; o que cai é o **curso útil de aspiração** e, com ele, a vazão e a potência. É o princípio dos **bolsões de espaço morto** do controle de capacidade.',
    },
    {
      id: 'mec-comp-10',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'O **surge** (bombeamento) de um compressor centrífugo',
      options: [
        { text: 'ocorre em vazão baixa, com inversão periódica do fluxo, e é evitado com uma válvula de reciclo anti-surge.', why: 'Correta.' },
        { text: 'ocorre na vazão máxima, quando o escoamento atinge a velocidade do som.', why: 'Isso é o choke (stonewall).' },
        { text: 'é a formação de bolhas de vapor na sucção, como a cavitação das bombas.', why: 'Cavitação é de líquidos; o surge é uma instabilidade do escoamento.' },
        { text: 'é eliminado fechando-se a válvula de descarga.', why: 'Fechar a descarga reduz a vazão e **provoca** o surge.' },
        { text: 'é típico dos compressores alternativos com espaço morto grande.', why: 'Surge é fenômeno dos compressores dinâmicos (centrífugos e axiais).' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **surge** (bombeamento) do centrífugo.',
        'Abaixo de uma vazão mínima, o compressor não sustenta a pressão do sistema: o fluxo reverte e volta, em ciclos.',
        'Fica **vazão baixa, com inversão periódica do fluxo, evitado com reciclo anti-surge**.',
      ],
      explanation: 'Na curva do centrífugo, a altura cresce quando a vazão cai, até um máximo. Abaixo da vazão desse ponto (**linha de surge**), o compressor não sustenta a pressão do sistema: o fluxo reverte, a pressão cai, o fluxo volta, e o ciclo se repete — ruído, vibração e esforços nos mancais. O controle **anti-surge** recircula gás (resfriado) da descarga para a sucção e mantém a vazão no compressor acima do limite.',
    },
    {
      id: 'mec-comp-11',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Num compressor de dois estágios, o **resfriador intermediário**',
      options: [
        { text: 'reduz o trabalho total e a temperatura de descarga do segundo estágio.', why: 'Correta: devolve o gás a T₁ e aproxima a compressão da isotérmica.' },
        { text: 'aumenta a pressão final sem aumentar o trabalho.', why: 'A pressão final é a mesma; o ganho é gastar menos trabalho para chegar a ela.' },
        { text: 'serve apenas para separar o óleo do ar.', why: 'Separadores retiram condensado e óleo, mas a função do resfriador é tirar calor.' },
        { text: 'diminui o rendimento volumétrico do segundo estágio.', why: 'O gás frio é mais denso: o segundo estágio aspira mais massa por volta.' },
        { text: 'só traz vantagem se a compressão for isotérmica.', why: 'É o contrário: na isotérmica não haveria calor a retirar.' },
      ],
      answer: 0,
      roteiro: 'multiestagio',
      steps: [
        'Dois estágios: o gás sai quente do primeiro.',
        'Resfriado entre eles, entra no segundo com volume específico menor — e w = ∫v·dP cai.',
        'Fica **reduz o trabalho total e a temperatura de descarga do segundo estágio**.',
      ],
      explanation: 'Resfriado entre os estágios, o gás entra no segundo estágio com volume específico menor: o trabalho (w = ∫v·dP) cai e a descarga sai mais fria. Com resfriamento perfeito e P_{i} = √(P₁·P₂), os dois estágios fazem o mesmo trabalho. O condensado formado no resfriador é drenado no separador.',
    },
    {
      id: 'mec-comp-12',
      type: 'ce',
      difficulty: 1,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Entre as mesmas pressões de sucção e de descarga, a compressão **isotérmica** reversível exige menos trabalho que a **adiabática** reversível.',
      answer: true,
      roteiro: 'compressao-gas',
      steps: [
        'Mesmas pressões absolutas; compara isotérmico (n = 1) com adiabático (n = k).',
        'w = ∫v·dP: resfriando durante a compressão, o volume específico fica menor em cada pressão.',
        'Isotérmica < politrópica < adiabática: **Certo**.',
      ],
      explanation: 'Em regime permanente, w = ∫v·dP. Resfriando o gás durante a compressão, o volume específico fica menor em cada pressão e o trabalho também. A isotérmica é o limite ideal; a adiabática (n = k), a maior das três (isotérmica < politrópica < adiabática).',
    },
    {
      id: 'mec-comp-13',
      type: 'ce',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Nos compressores alternativos, as válvulas de sucção e de descarga são acionadas por um eixo de cames sincronizado com o virabrequim, como nos motores de combustão interna.',
      answer: false,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: válvulas acionadas por **eixo de cames**.',
        'No compressor alternativo, as válvulas são automáticas: molas e diferença de pressão.',
        'Comando por cames é de motor de combustão: **Errado**.',
      ],
      explanation: 'São **automáticas**: placas ou lâminas mantidas fechadas por molas e abertas pela diferença de pressão entre o cilindro e a linha. Por isso a sucção só abre depois que o gás do espaço morto re-expande abaixo da pressão de sucção.',
    },
    {
      id: 'mec-comp-14',
      type: 'ce',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'O rendimento volumétrico de um compressor alternativo **aumenta** quando se eleva a pressão de descarga, mantida a de sucção.',
      answer: false,
      roteiro: 'espaco-morto',
      steps: [
        'η_{v} = 1 + c − c·(P₂/P₁)^{1/n}, com c fixo.',
        'P₂ maior → (P₂/P₁)^{1/n} maior → η_{v} **menor**.',
        'O gás do espaço morto precisa de mais curso para re-expandir: **Errado**.',
      ],
      explanation: 'Diminui: η_{v} = 1 + c − c·(P₂/P₁)^{1/n}. Com razão maior, o gás do espaço morto sai mais comprimido e precisa de mais curso para re-expandir até a pressão de sucção; sobra menos curso para aspirar gás novo.',
    },
    {
      id: 'mec-comp-15',
      type: 'ce',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Num compressor de dois estágios com resfriamento intermediário perfeito e pressão intermediária ótima, os dois estágios realizam o **mesmo trabalho**.',
      answer: true,
      roteiro: 'multiestagio',
      steps: [
        'Resfriamento perfeito: os dois estágios aspiram à mesma temperatura T₁.',
        'P_{i} = √(P₁·P₂) → as razões dos estágios são iguais.',
        'Mesma temperatura de entrada e mesma razão → **mesmo trabalho**: **Certo**.',
      ],
      explanation: 'Com P_{i} = √(P₁·P₂), as razões dos estágios são iguais. Como os dois aspiram à mesma temperatura (o resfriador devolve o gás a T₁), w = n/(n−1)·R·T₁·[r^{(n−1)/n} − 1] é igual nos dois — e a temperatura de descarga também.',
    },
    {
      id: 'mec-comp-16',
      type: 'ce',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Os compressores **axiais** obtêm, por estágio, razões de pressão maiores que as dos centrífugos, e por isso precisam de menos estágios.',
      answer: false,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: razão por estágio do **axial** maior que a do centrífugo.',
        'O estágio axial dá pouca razão (≈ 1,1 a 1,4): por isso o axial tem muitos estágios; a vantagem dele é a vazão enorme.',
        'É o contrário: **Errado**.',
      ],
      explanation: 'É o contrário: o estágio axial dá razão pequena (cerca de 1,1 a 1,4), e por isso o axial tem muitos estágios. Sua vantagem é a vazão enorme com alto rendimento, como nas turbinas a gás.',
    },
    {
      id: 'mec-comp-17',
      type: 'ce',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'O **choke** (*stonewall*) de um compressor centrífugo ocorre quando a vazão é muito baixa, com inversão periódica do escoamento.',
      answer: false,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: **choke** com vazão **muito baixa**.',
        'Vazão baixa com inversão de fluxo é o **surge**; o choke acontece na vazão **máxima**, quando o gás chega à velocidade do som.',
        'Trocou surge por choke: **Errado**.',
      ],
      explanation: 'Essa descrição é do **surge**. O choke acontece na vazão **máxima**: o escoamento chega à velocidade do som em alguma seção e a vazão não sobe mais, por mais que a pressão de descarga caia.',
    },
    {
      id: 'mec-comp-18',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Os compressores **volumétricos** reduzem o volume do gás para elevar a pressão; os **dinâmicos** aceleram o gás e convertem velocidade em pressão. É exemplo de compressor dinâmico o compressor',
      options: [
        { text: 'axial.', why: 'Correta: fileiras de pás aceleram o gás (como na turbina a gás).' },
        { text: 'de palhetas.', why: 'Volumétrico rotativo: as palhetas formam câmaras que diminuem de volume.' },
        { text: 'de lóbulos (Roots).', why: 'Volumétrico rotativo.' },
        { text: 'de parafusos.', why: 'Volumétrico rotativo: os fusos aprisionam e comprimem o gás.' },
        { text: 'de diafragma.', why: 'Volumétrico alternativo.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: compressor **dinâmico** (acelera o gás).',
        'Dinâmicos: centrífugos e axiais. Volumétricos: alternativos e rotativos (palhetas, lóbulos, parafusos), além do diafragma.',
        'Fica **axial**.',
      ],
      explanation: '**Dinâmicos (turbocompressores):** centrífugos e axiais. **Volumétricos:** alternativos (pistão, diafragma) e rotativos (palhetas, lóbulos, parafusos, anel líquido).',
    },
    {
      id: 'mec-comp-19',
      difficulty: 2,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Num compressor alternativo, as válvulas de sucção e de descarga passam a oferecer **maior resistência** ao escoamento do gás (molas endurecidas, sujeira). A consequência é',
      options: [
        { text: 'a queda do rendimento volumétrico e o aumento do consumo de energia por unidade de gás comprimido.', why: 'Correta: o cilindro enche com o gás a pressão menor e precisa subir acima da pressão de descarga para expulsá-lo.' },
        { text: 'o aumento do rendimento volumétrico.', why: 'Mais perda na sucção → menos massa admitida por ciclo.' },
        { text: 'a redução da temperatura de descarga.', why: 'Com mais razão de compressão efetiva, a temperatura tende a subir.' },
        { text: 'a redução do trabalho por ciclo.', why: 'O laço do diagrama P–V fica maior (mais trabalho).' },
        { text: 'nenhuma, porque a vazão é imposta pelo pistão.', why: 'O deslocamento é do pistão, mas a massa admitida depende da pressão no cilindro.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: válvulas com **mais resistência** ao escoamento.',
        'O gás entra no cilindro abaixo da pressão de sucção e sai acima da de descarga: menos massa por ciclo e laço P–V maior.',
        'Fica **cai o rendimento volumétrico e sobe o consumo por unidade de gás**.',
      ],
      explanation: 'Perdas nas válvulas fazem o gás entrar no cilindro **abaixo** da pressão de sucção e sair **acima** da de descarga: menos massa por ciclo (rendimento volumétrico menor) e laço P–V maior (mais energia por m³). Por isso válvulas são inspecionadas com frequência.',
    },
    {
      id: 'mec-comp-20',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Potência de eixo pela pressão média efetiva',
      roteiro: 'compressao-gas',
      generate(rng) {
        const pme = pickOne(rng, [150, 200, 250, 300]);
        const Qmin = pickOne(rng, [3, 5, 6, 10]);
        const eta = pickOne(rng, [0.5, 0.6, 0.75, 0.8]);
        const Pind = (pme * Qmin) / 60; // kW
        const Peixo = Pind / eta;
        const { options, answer } = numericOptions({
          correct: Peixo,
          unit: 'kW',
          digits: 1,
          correctWhy: `P_{ind} = PME·Q = ${pme} kPa × ${Qmin}/60 m³/s = ${fmt(Pind, 2)} kW; P_{eixo} = P_{ind}/η_{m} = ${fmt(Peixo, 1)} kW.`,
          distractors: [
            { value: Pind, why: 'Essa é a potência **indicada** (no cilindro); no eixo é maior, por causa das perdas mecânicas.' },
            { value: Pind * eta, why: 'Multiplicou pelo rendimento: a potência de acionamento é **maior** que a indicada.' },
            { value: pme * Qmin / eta, why: 'Esqueceu de converter m³/min para m³/s (÷ 60).' },
            { value: Peixo / 1.36, why: 'Converteu para CV dividindo (1 kW ≈ 1,36 CV — é multiplicando).' },
          ],
        });
        return {
          prompt: `Um compressor alternativo de ar opera com pressão média efetiva de **${pme} kPa** e desloca **${Qmin} m³/min**. Se o rendimento mecânico é de **${fmt(eta * 100)}%**, a potência necessária no eixo é, em kW,`,
          options,
          answer,
          hint: 'Potência indicada = PME × vazão volumétrica deslocada (m³/s). No eixo, divida pelo rendimento mecânico.',
          steps: [
            { do: 'Passe a vazão deslocada para m³/s.', show: `Q = ${Qmin}/60 = ${fmt(Qmin / 60, 4)} m³/s.` },
            { do: 'Potência indicada = pressão média efetiva × vazão deslocada (kPa·m³/s = kW).', show: `P_{ind} = ${pme} × ${fmt(Qmin / 60, 4)} = ${fmt(Pind, 2)} kW.` },
            { do: 'Potência no eixo = indicada ÷ rendimento mecânico.', show: `P_{eixo} = ${fmt(Pind, 2)}/${fmt(eta)} = **${fmt(Peixo, 1)} kW**.` },
          ],
          explanation: `Q = ${Qmin}/60 = ${fmt(Qmin / 60, 4)} m³/s. P_{ind} = ${pme} kPa × ${fmt(Qmin / 60, 4)} m³/s = ${fmt(Pind, 2)} kW.\n\nP_{eixo} = ${fmt(Pind, 2)}/${fmt(eta)} = **${fmt(Peixo, 1)} kW** (≈ ${fmt(Peixo * 1.36, 1)} CV).`,
        };
      },
    },
    {
      id: 'mec-comp-21',
      difficulty: 2,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'O compressor **de diafragma** é escolhido para comprimir gases tóxicos, muito puros ou corrosivos porque',
      options: [
        { text: 'o gás fica separado do mecanismo por uma membrana: não há vazamento pela haste nem contaminação por óleo.', why: 'Correta: um fluido hidráulico move o diafragma; o gás só toca a membrana e a câmara.' },
        { text: 'é o tipo que comprime as maiores vazões.', why: 'É o contrário: as vazões são pequenas.' },
        { text: 'é um compressor dinâmico, sem peças alternativas.', why: 'É um compressor **alternativo** (volumétrico).' },
        { text: 'dispensa qualquer tipo de válvula.', why: 'Tem válvulas de sucção e descarga, como qualquer alternativo.' },
        { text: 'opera sempre com razão de compressão unitária.', why: 'Atinge razões altas — por isso é usado em gases puros a alta pressão.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: gases **tóxicos, puros ou corrosivos** — nada pode vazar nem contaminar.',
        'No diafragma, uma membrana separa o gás do óleo e do mecanismo: não há haste atravessando a câmara de gás.',
        'Fica **o gás fica separado por uma membrana: sem vazamento pela haste nem óleo**.',
      ],
      explanation: 'No compressor de **diafragma**, um pistão empurra óleo hidráulico que flexiona uma membrana metálica; do outro lado fica o gás. Sem haste atravessando a câmara de gás, não há gaxeta para vazar nem óleo para contaminar — ideal para hidrogênio, oxigênio puro, gases tóxicos. O preço: vazões pequenas.',
    },
    {
      id: 'mec-comp-22',
      difficulty: 3,
      lessonRef: 5,
      source: 'Autoral',
      shuffle: false,
      prompt: 'Comparando um compressor **centrífugo** com um **alternativo** de mesma capacidade, analise as afirmativas.\n\nI – O centrífugo tem menos peças sujeitas a desgaste (basicamente mancais e selos) e exige menos manutenção.\nII – O centrífugo fornece uma vazão pulsante, que exige amortecedores de pulsação.\nIII – A razão de pressões do centrífugo depende da massa molar do gás: gás mais leve, menos pressão.\n\nEstá correto o que se afirma em',
      options: [
        { text: 'I, apenas', why: 'III também está correta.' },
        { text: 'II, apenas', why: 'II é falsa: a vazão do centrífugo é **contínua**; quem pulsa é o alternativo.' },
        { text: 'I e III, apenas', why: 'Correta.' },
        { text: 'II e III, apenas', why: 'II é falsa.' },
        { text: 'I, II e III', why: 'II é falsa.' },
      ],
      answer: 2,
      roteiro: 'fmt.afirmativas',
      steps: [
        'I – **Correta**: sem válvulas, anéis e pistões, o centrífugo tem poucas peças de desgaste (mancais e selos).',
        'II – **Errada**: a vazão do centrífugo é contínua; pulsação é típica do **alternativo**.',
        'III – **Correta**: o rotor entrega altura (energia por kg); com gás leve, a pressão gerada por estágio é menor.',
        'Certas: I e III → "I e III, apenas".',
      ],
      explanation: '**I** – Correta: sem válvulas, anéis e pistões, o centrífugo roda meses sem parar. **II** – Errada: a vazão do centrífugo é contínua; a pulsação é típica do **alternativo**. **III** – Correta: o rotor fornece uma **altura** (energia por kg); a pressão gerada cresce com a densidade do gás — com gás leve (H₂), cada estágio comprime pouco.',
    },
    {
      id: 'mec-comp-23',
      type: 'gen',
      difficulty: 3,
      lessonRef: 3,
      title: 'Temperatura de descarga real (eficiência isentrópica)',
      roteiro: 'compressao-gas',
      generate(rng) {
        const T1 = pickOne(rng, [290, 300, 310]);
        const st = pickOne(rng, [
          { rp: 4, f: 1.486 },
          { rp: 6, f: 1.67 },
          { rp: 8, f: 1.811 },
        ]);
        const eta = pickOne(rng, [0.75, 0.8, 0.85]);
        const T2s = T1 * st.f;
        const T2 = T1 + (T2s - T1) / eta;
        const { options, answer } = numericOptions({
          correct: T2,
          unit: 'K',
          digits: 0,
          correctWhy: `T_{2s} = ${T1} × ${fmt(st.f, 3)} = ${fmt(T2s, 1)} K; T₂ = T₁ + (T_{2s} − T₁)/η = ${fmt(T2, 0)} K.`,
          distractors: [
            { value: T2s, why: 'Essa é a temperatura **ideal**; o compressor real aquece mais o gás.' },
            { value: T1 + (T2s - T1) * eta, why: 'Multiplicou pela eficiência: no compressor, o real gasta **mais** (divide-se por η).' },
            { value: T1 * st.rp, why: 'Multiplicou T₁ pela razão de pressões; o expoente (k−1)/k é essencial.' },
            { value: T2 - 273, why: 'Converteu para °C; a pergunta pede kelvin.' },
          ],
        });
        return {
          prompt: `Ar (k = 1,4) entra num compressor a **${T1} K** e é comprimido com razão de pressões **${st.rp}** (r_{p}^{(k−1)/k} = ${fmt(st.f, 3)}). Se a eficiência isentrópica do compressor é **${fmt(eta * 100)}%**, a temperatura real de descarga é, aproximadamente, em K,`,
          options,
          answer,
          hint: 'Ideal: T_{2s} = T₁·r_{p}^{(k−1)/k}. Real: o aumento de temperatura é o ideal dividido por η.',
          steps: [
            `T₁ = ${T1} K; r_{p}^{(k−1)/k} = ${fmt(st.f, 3)}.`,
            `Ideal: T_{2s} = ${T1} × ${fmt(st.f, 3)} = ${fmt(T2s, 1)} K → ΔT_{s} = ${fmt(T2s - T1, 1)} K; real: ΔT = ΔT_{s}/η = ${fmt((T2s - T1) / eta, 1)} K.`,
            `T₂ = ${T1} + ${fmt((T2s - T1) / eta, 1)} ≈ **${fmt(T2, 0)} K**.`,
          ],
          explanation: `Ideal: T_{2s} = ${T1} × ${fmt(st.f, 3)} = ${fmt(T2s, 1)} K (ΔT_{s} = ${fmt(T2s - T1, 1)} K).\n\nReal: η = (h_{2s} − h₁)/(h₂ − h₁) = ΔT_{s}/ΔT → ΔT = ${fmt(T2s - T1, 1)}/${fmt(eta)} = ${fmt((T2s - T1) / eta, 1)} K → **T₂ ≈ ${fmt(T2, 0)} K**. A ineficiência vira calor no próprio gás.`,
        };
      },
    },
  ],
  games: [
    {
      id: 'mec-comp-g1',
      type: 'order',
      title: 'Uma volta do compressor alternativo',
      intro: 'Comece no ponto morto inferior e monte o ciclo indicado, etapa por etapa.',
      lessonRef: 1,
      steps: [
        { text: 'PMI: cilindro cheio de ar a P₁, com as duas válvulas fechadas', why: 'Estado 1: começa a compressão.' },
        { text: 'O pistão sobe e comprime o ar; a pressão e a temperatura sobem', why: '1 → 2: as válvulas continuam fechadas.' },
        { text: 'A pressão passa da linha de descarga e a válvula de descarga abre', why: 'Estado 2: a válvula é automática, aberta pela diferença de pressão.' },
        { text: 'O ar é empurrado para o vaso, a P₂ constante, até o PMS', why: '2 → 3: descarga.' },
        { text: 'O pistão desce e o gás do espaço morto re-expande', why: '3 → 4: válvulas fechadas; esse trecho do curso não aspira nada.' },
        { text: 'A pressão cai abaixo de P₁: a válvula de sucção abre e entra ar novo até o PMI', why: '4 → 1: aspiração.' },
      ],
    },
    {
      id: 'mec-comp-g2',
      type: 'sort',
      title: 'Alternativo, centrífugo ou axial?',
      intro: 'Cada característica é típica de um tipo de compressor. Qual?',
      lessonRef: 5,
      bins: ['Alternativo', 'Centrífugo', 'Axial'],
      perRound: 10,
      items: [
        { text: 'Válvulas automáticas de sucção e de descarga', bin: 0, why: 'Placas ou lâminas abertas pela diferença de pressão.' },
        { text: 'Espaço morto e rendimento volumétrico', bin: 0, why: 'O gás preso no PMS re-expande e rouba curso de aspiração.' },
        { text: 'Pressões muito altas com vazão pequena', bin: 0, why: 'É o campo dos volumétricos de pistão.' },
        { text: 'Fluxo pulsante, que pede vaso amortecedor de pulsação', bin: 0, why: 'Cada volta entrega um "pulso" de gás.' },
        { text: 'Cruzeta, haste e gaxetas de vedação', bin: 0, why: 'Peças dos alternativos de processo de grande porte.' },
        { text: 'Impelidor que lança o gás para a periferia', bin: 1, why: 'Saída radial: centrífugo.' },
        { text: 'Difusor e voluta convertem velocidade em pressão', bin: 1, why: 'Logo depois do impelidor.' },
        { text: 'Razão de 1,5 a 4 por estágio, com vazões médias e altas', bin: 1, why: 'Faixa típica de um estágio centrífugo.' },
        { text: 'Fileiras alternadas de palhetas móveis e fixas', bin: 2, why: 'Rotor e estator de cada estágio axial.' },
        { text: 'Razão de 1,1 a 1,4 por estágio: muitos estágios', bin: 2, why: 'Pouca razão por estágio, muita vazão.' },
        { text: 'Compressor típico das turbinas a gás de avião', bin: 2, why: 'Vazão enorme e alto rendimento numa seção frontal pequena.' },
        { text: 'Escoamento paralelo ao eixo do começo ao fim', bin: 2, why: 'Daí o nome: axial.' },
      ],
    },
    {
      id: 'mec-comp-g3',
      type: 'match',
      title: 'Termos dos compressores',
      intro: 'Ligue cada termo ao que ele significa.',
      lessonRef: 6,
      perRound: 6,
      pairs: [
        { left: 'Espaço morto', right: 'Volume que sobra entre o pistão no PMS e o cabeçote', why: 'c = V_{c}/V_{d}, tipicamente 3 % a 10 %.' },
        { left: 'Rendimento volumétrico', right: 'Volume de gás novo aspirado ÷ volume deslocado', why: 'η_{v} = 1 + c − c·(P₂/P₁)^{1/n}.' },
        { left: 'Resfriador intermediário', right: 'Devolve o gás à temperatura de entrada entre dois estágios', why: 'Menos trabalho e descarga mais fria.' },
        { left: 'Descarregador', right: 'Mantém a válvula de sucção aberta para o cilindro trabalhar em vazio', why: 'Controle de capacidade e partida aliviada do alternativo.' },
        { left: 'Bolsão de espaço morto', right: 'Aumenta a folga do cilindro para reduzir a capacidade', why: 'Mais espaço morto, menos curso útil de aspiração.' },
        { left: 'Válvula anti-surge', right: 'Recircula gás da descarga para a sucção quando a vazão cai', why: 'Mantém o centrífugo longe da linha de surge.' },
        { left: 'Choke (stonewall)', right: 'Vazão máxima: escoamento sônico numa seção', why: 'Do outro lado da curva, oposto ao surge.' },
        { left: 'Vaso amortecedor de pulsação', right: 'Suaviza o fluxo pulsante do compressor alternativo', why: 'Protege tubulação e instrumentos da vibração.' },
      ],
    },
    {
      id: 'mec-comp-lab1',
      type: 'lab',
      lab: 'compressor',
      title: 'O compressor alternativo na bancada',
      intro: 'Um compressor de pistão em câmera lenta: válvulas automáticas, espaço morto, diagrama P–V indicado e estágios. Aposte antes de ver e cumpra as missões.',
      lessonRef: 2,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { p2: 700, c: 5, n: 1.3, stages: 0 },
          prompt: 'O compressor trabalha com **5 %** de espaço morto. Um bolsão é aberto e o espaço morto passa a **15 %**. O que acontece com a vazão aspirada e com o trabalho **por kg** de ar?',
          change: { c: 15 },
          options: ['A vazão cai e o trabalho por kg não muda', 'A vazão cai e o trabalho por kg aumenta', 'A vazão não muda e o trabalho por kg aumenta', 'Os dois aumentam: há mais gás no cilindro'],
          answer: 0,
          expect: [
            { out: 'fad', trend: 'down' },
            { out: 'etav', trend: 'down' },
            { out: 'w', trend: 'same' },
            { out: 'T2', trend: 'same' },
            { out: 'Pw', trend: 'down' },
          ],
          why: 'O gás preso no espaço morto **re-expande** antes de a sucção abrir e devolve ao pistão o trabalho que recebeu: no ciclo ideal, o trabalho por kg e a descarga não mudam. Perde-se **curso de aspiração**: entra menos ar, e a potência cai junto. É assim que os **bolsões de espaço morto** controlam a capacidade.',
        },
        {
          kind: 'predict',
          setup: { p2: 400, c: 8, n: 1.3, stages: 0 },
          prompt: 'Com **8 %** de espaço morto, a pressão de descarga vai subir de **400** para **1.000 kPa**. O rendimento volumétrico…',
          change: { p2: 1000 },
          options: ['cai, porque o gás do espaço morto re-expande por mais curso', 'sobe, porque o ar sai mais comprimido', 'não muda: depende só do espaço morto', 'sobe, porque o pistão faz mais força'],
          answer: 0,
          expect: [
            { out: 'etav', trend: 'down' },
            { out: 'fad', trend: 'down' },
            { out: 'T2', trend: 'up' },
          ],
          why: 'η_{v} = 1 + c − c·(P₂/P₁)^{1/n}: com razão maior, o gás do espaço morto fica mais comprimido e precisa de mais curso para voltar a P₁. A sucção abre mais tarde, entra menos ar (de 85 % para 61 % do volume deslocado) e a descarga sai mais quente.',
        },
        {
          kind: 'predict',
          setup: { p2: 800, c: 20, n: 1.3, stages: 0 },
          prompt: 'Com **20 %** de espaço morto, o compressor mal aspira ar descarregando a 800 kPa. Se a descarga subir para **1.200 kPa**…',
          change: { p2: 1200 },
          options: ['a vazão vai a zero: a válvula de sucção nunca chega a abrir', 'a vazão cai pela metade', 'a vazão não muda, só a pressão sobe', 'o compressor passa a aspirar mais, para compensar'],
          answer: 0,
          expect: [
            { out: 'fad', trend: 'down' },
            { out: 'etav', trend: 'down' },
          ],
          why: 'A razão máxima é (P₂/P₁)_{máx} = (1 + 1/c)^{n} = 6^{1,3} ≈ 10,3. Pedindo razão 12, o gás do espaço morto re-expande o curso **inteiro** sem chegar a 100 kPa: a sucção não abre, a descarga não abre e o ar só vai e volta dentro do cilindro (η_{v} = 0).',
        },
        {
          kind: 'goal',
          setup: { p2: 800, c: 15, n: 1.3, stages: 0 },
          lock: ['p2', 'n', 'stages'],
          prompt: 'A rede precisa de **pelo menos 5 m³/min** de ar a 800 kPa, e com 15 % de espaço morto o compressor não entrega. Ajuste a máquina.',
          goals: [{ out: 'fad', min: 5 }],
          hint: 'Só sobrou o espaço morto: feche o bolsão (diminua c) e veja a vazão subir.',
          solution: { c: 4 },
          why: 'Menos espaço morto, menos gás para re-expandir: a sucção abre mais cedo. Com c = 4 %, η_{v} = 1 + 0,04 − 0,04 × 8^{1/1,3} ≈ 84 % e a vazão chega a 0,84 × 10 L × 600 rpm ≈ 5,05 m³/min.',
        },
        {
          kind: 'goal',
          setup: { p2: 1000, c: 5, n: 1.3, stages: 0 },
          lock: ['p2', 'c', 'n'],
          prompt: 'O óleo do cilindro não aguenta descarga acima de **150 °C**, mas a rede pede **1.000 kPa**. Sem mexer na pressão nem no resfriamento das camisas, resolva.',
          goals: [{ out: 'T2', max: 150 }],
          hint: 'Divida a compressão em duas etapas, com um resfriador no meio.',
          solution: { stages: 1 },
          why: 'Com 2 estágios e P_{i} = √(100 × 1.000) ≈ 316 kPa, cada estágio comprime só 3,16 vezes e o resfriador devolve o ar a 27 °C antes do segundo: a descarga cai de 237 °C para cerca de 118 °C — e ainda se economiza trabalho.',
        },
        {
          kind: 'predict',
          setup: { p2: 900, c: 6, n: 1.3, stages: 0 },
          prompt: 'O ar vai de 100 para 900 kPa num estágio só. Você vai passar para **dois estágios** com resfriamento intermediário (P_{i} ótima). O trabalho por kg de ar…',
          change: { stages: 1 },
          options: ['diminui, e a descarga sai bem mais fria', 'aumenta, porque agora são dois cilindros', 'não muda: a razão total é a mesma', 'diminui, mas a descarga sai mais quente'],
          answer: 0,
          expect: [
            { out: 'w', trend: 'down' },
            { out: 'T2', trend: 'down' },
            { out: 'etav', trend: 'up' },
          ],
          why: 'Cada estágio comprime só √9 = 3 vezes e o resfriador tira o calor no meio do caminho: a compressão fica mais perto da isotérmica (o mínimo). Com P_{i} = √(P₁·P₂) = 300 kPa, as razões e os trabalhos dos estágios ficam iguais; o η_{v} do primeiro estágio também sobe, porque a razão dele é menor.',
        },
        {
          kind: 'predict',
          setup: { p2: 900, c: 5, n: 1, stages: 0 },
          prompt: 'Agora o cilindro é resfriado à perfeição (**n = 1**, isotérmico). Passando para dois estágios com resfriador, o trabalho por kg…',
          change: { stages: 1 },
          options: ['não muda: o ar já não esquentava, não há calor a tirar entre os estágios', 'cai cerca de 13 %, como com n = 1,3', 'cai pela metade', 'aumenta, por causa do segundo cilindro'],
          answer: 0,
          expect: [
            { out: 'w', trend: 'same' },
            { out: 'T2', trend: 'same' },
          ],
          why: 'O resfriador intermediário economiza trabalho porque devolve o ar a T₁ antes do 2º estágio. Na compressão isotérmica o ar nunca esquenta: w = R·T₁·ln(P₂/P₁) com um ou com dez estágios. Na prática n > 1 — e é por isso que os estágios compensam.',
        },
        {
          kind: 'goal',
          setup: { p2: 800, c: 5, n: 1.4, stages: 0 },
          lock: ['p2', 'c', 'stages'],
          prompt: 'Leve o **rendimento isotérmico** a pelo menos **90 %**, num estágio só e a 800 kPa.',
          goals: [{ out: 'etaiso', min: 90 }],
          hint: 'O rendimento isotérmico compara com o ideal n = 1. Melhore o resfriamento das camisas: diminua n.',
          solution: { n: 1.1 },
          why: 'η_{iso} = w_{iso}/w = R·T₁·ln(P₂/P₁)/w. Quanto mais calor se tira durante a compressão (camisas d’água, aletas), mais o processo se aproxima do isotérmico e menor o trabalho: com n = 1,1 já se passa de 90 %.',
        },
      ],
    },
  ],
});
