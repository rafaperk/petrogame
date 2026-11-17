import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

export default defineTopic({
  id: 'mec.bombas-centrifugas',
  name: 'Bombas centrífugas',
  summary: 'Como a bomba funciona, curvas e ponto de operação, potência, leis de afinidade, NPSH e cavitação, associação em série e paralelo, tipos de bomba, perdas e velocidade específica.',
  order: 1,
  weight: 3,
  equipment: 'pump',
  requires: ['mec.hidrostatica-bernoulli'],
  edital: ['b2.bombas', 'b2.maquinas-desempenho'],
  lesson: [
    {
      title: 'Como funciona',
      body: 'O **rotor** (impelidor) gira e transfere energia ao líquido, aumentando sua velocidade; a **voluta** (ou o difusor) desacelera o fluxo e converte essa energia cinética em **pressão**.\n\n- A bomba centrífuga **não é autoescorvante**: com ar na carcaça ela gira e não bombeia. Antes de partir, é preciso **escorvar** (encher de líquido).\n- A **altura manométrica H** (metros de coluna do fluido) não depende do fluido; a **pressão** gerada depende: Δp = ρ·g·H.\n- Partida típica: **sucção aberta** e **descarga fechada** — na centrífuga radial, a potência é **mínima com vazão nula**.',
      tip: 'Mesma bomba, mesma rotação: com água ou com gasolina ela entrega a **mesma H** — mas a pressão (ρgH) e a potência caem com o fluido mais leve.',
      trap: 'Em bombas **axiais** é o contrário: a potência é máxima com vazão nula, e elas partem com a descarga aberta.',
      lab: { lab: 'pump', label: 'Ver a bomba por dentro' },
    },
    {
      title: 'Curvas e ponto de operação',
      body: '- **Curva da bomba (H × Q):** a altura cai quando a vazão aumenta.\n- **Curva do sistema:** H_{sis} = parcela estática (Δz + Δp/ρg) + perdas (∝ Q²).\n- O **ponto de operação** é a interseção das duas.\n\nPara reduzir a vazão: **estrangular a válvula de descarga** (mais perda no sistema → o ponto sobe pela curva da bomba: menor Q, maior H) ou **reduzir a rotação** (inversor de frequência — mais eficiente). O rendimento máximo fica no **BEP** (ponto de melhor eficiência).\n\nAs curvas de catálogo (H, potência, rendimento e NPSH_{req} × Q) são levantadas com **rotação, diâmetro do rotor e fluido constantes**.',
      hot: 'O que se mantém constante ao levantar as curvas da bomba: a **rotação** (BR 2012). E o efeito de estrangular a descarga no ponto de operação.',
      tip: 'A bomba **entrega o que o sistema pede**: quem muda o ponto de operação é a curva do sistema (válvula) ou a curva da bomba (rotação, rotor).',
      trap: '**Nunca** controle a vazão estrangulando a **sucção**: isso derruba o NPSH disponível e provoca cavitação.',
      lab: { lab: 'pump', preset: { valve: 60 }, label: 'Mexer no ponto de operação' },
    },
    {
      title: 'Potência e rendimento',
      body: '**Potência hidráulica** (entregue ao fluido): **P_{h} = ρ·g·Q·H**\n\n**Potência no eixo** (consumida): **P_{eixo} = ρ·g·Q·H / η**\n\nUnidades SI: ρ em kg/m³, g em m/s², Q em **m³/s**, H em m → P em W.',
      example: 'Q = 36 m³/h = 0,01 m³/s, H = 50 m, água, η = 0,8:\nP_{h} = 1.000 × 10 × 0,01 × 50 = 5 kW → P_{eixo} = 5/0,8 = **6,25 kW**.',
      tip: 'Em CV: 1 CV ≈ 735,5 W. Em kgf: P(CV) = γ(kgf/m³)·Q(m³/s)·H(m)/(75·η).',
      trap: 'Esquecer de converter **m³/h → m³/s** (÷ 3.600) é o erro número 1 dessa conta.',
    },
    {
      title: 'Leis de afinidade (semelhança)',
      body: 'Para a **mesma bomba** (mesmo rotor), mudando a rotação n:\n\n- **Q ∝ n**\n- **H ∝ n²**\n- **P ∝ n³**\n\nMudando o diâmetro D do rotor (corte do rotor, mesma rotação), valem relações análogas e aproximadas: Q ∝ D, H ∝ D², P ∝ D³.',
      example: 'Rotação 10% maior: Q × 1,1; H × 1,21; P × 1,33 (+33% de potência!).',
      tip: '**1, 2, 3:** vazão na 1ª potência, altura na 2ª, potência na 3ª.',
      lab: { lab: 'pump', preset: { rpm: 2100, valve: 100 }, label: 'Ver as leis de afinidade' },
    },
    {
      title: 'NPSH e cavitação',
      body: '**Cavitação:** se a pressão na entrada do rotor cair abaixo da **pressão de vapor** do líquido, formam-se bolhas que colapsam violentamente ao chegar às regiões de maior pressão.\n\nSintomas: ruído de "cascalho", vibração, queda de H e de η, **erosão** do rotor.\n\n- **NPSH disponível** (do sistema): energia na sucção acima da pressão de vapor.\n- **NPSH requerido** (da bomba, dado pelo fabricante; cresce com a vazão).\n- Condição: **NPSH_{disp} > NPSH_{req}** (com margem).\n\nO NPSH disponível **cai** com: bomba mais alta que o reservatório, líquido mais quente (pressão de vapor maior), perdas na sucção (filtro sujo, válvula estrangulada, tubo fino ou longo) e maior altitude.\n\n**NPSH_{disp} = (p_{tanque} − p_{v})/(ρ·g) + z_{s} − h_{perdas,sucção}**, com z_{s} > 0 se o nível está **acima** da bomba (bomba afogada).',
      hot: 'Definição de cavitação — **vaporização** do líquido em movimento quando a pressão local cai até a pressão de vapor na temperatura de bombeamento (Petrobras 2012) — e o NPSH com água quente, na bancada e nas provas.',
      tip: '**Disponível é da instalação, requerido é da bomba.** Para não cavitar: disponível > requerido.',
      trap: 'Fechar parcialmente a válvula de **sucção** para "aliviar" a bomba piora a cavitação.',
      lab: { lab: 'pump', preset: { temp: 90, zs: -1, valve: 100 }, label: 'Ver a cavitação acontecer' },
    },
    {
      title: 'Associação de bombas',
      body: '- **Em série:** as alturas se **somam** (mesma vazão) — para vencer grandes alturas.\n- **Em paralelo:** as vazões se **somam** (mesma altura) — para aumentar a vazão.\n\nNa prática, com perdas no sistema, duas bombas iguais em paralelo entregam **menos que o dobro** da vazão de uma só: a curva do sistema sobe com Q².',
      tip: '**Série soma altura, paralelo soma vazão** — sempre lendo as curvas no mesmo eixo: em série, some H para cada Q; em paralelo, some Q para cada H.',
      trap: 'Paralelo com sistema de muitas perdas: a vazão quase não aumenta. Ali, a solução é rever a tubulação.',
    },
    {
      title: 'Tipos de bomba, perdas e velocidade específica',
      body: '**Bombas dinâmicas** (turbobombas: a energia vem da rotação do rotor):\n- **Centrífuga radial:** **grandes alturas** e vazões menores.\n- **Diagonal** (fluxo misto): valores médios de altura e vazão.\n- **Helicoidal / axial:** **grandes vazões** e alturas pequenas.\n\n**Bombas de deslocamento positivo** (volumétricas: aprisionam e empurram volumes): engrenagens, palhetas, parafusos, lóbulos, pistão/êmbolo, diafragma. A vazão quase não depende da pressão — nunca opere com a descarga bloqueada (use **válvula de alívio**).\n\n**Perdas** na centrífuga (η_{total} = η_{h}·η_{v}·η_{m}):\n- **hidráulicas:** atrito do líquido nas passagens e choques na entrada das pás;\n- **volumétricas:** recirculação do líquido da descarga para a sucção pelas folgas — o **anel de desgaste** reduz essa fuga;\n- **mecânicas:** atrito nos mancais, selos e gaxetas.\n\n**Velocidade específica:** n_{s} = n·√Q/H^{3/4} (Q por boca de sucção e H por estágio). n_{s} baixa → rotor **radial**; alta → **axial**.',
      example: 'Bomba de 2 estágios e dupla sucção, 3.500 rpm, 0,08 m³/s e 160 m: Q por boca = 0,04 m³/s e H por estágio = 80 m → n_{s} = 3.500 × 0,2/80^{0,75} = 700/26,7 ≈ **26**: rotor radial.',
      hot: 'Tipo de bomba × altura e vazão (Transpetro 2012, Petrobras 2011, Petrobras Biocombustível 2010), exemplo de bomba **dinâmica** × deslocamento positivo (BR 2012), função do **anel de desgaste** (Petrobras 2014), origem das **perdas volumétricas** (Transpetro 2012) e velocidade específica de bomba com **dupla sucção e 2 estágios** (Petrobras 2018).',
      tip: '**Radial = Recalque alto; Axial = Água em quantidade.** E o anel de desgaste é a "vedação" entre a descarga e a sucção dentro da bomba.',
      trap: 'Na velocidade específica, divida a vazão pelo número de bocas de sucção e a altura pelo número de estágios **antes** de aplicar a fórmula.',
    },
  ],
  roteiros: [
    {
      id: 'potencia-bomba',
      name: 'Potência de bomba',
      when: 'Bomba com vazão, altura manométrica e rendimento; pedem a potência hidráulica ou no eixo.',
      steps: [
        'Passe a vazão para m³/s (m³/h ÷ 3.600).',
        'Potência hidráulica: P_{h} = ρ·g·Q·H (em W).',
        'Potência no eixo: P_{h}/η (rendimento total = hidráulico × volumétrico × mecânico).',
      ],
      note: 'Esquecer de dividir a vazão por 3.600 é o erro mais comum. O rendimento divide — a potência no eixo é sempre a maior.',
    },
    {
      id: 'altura-pressao',
      name: 'Da altura manométrica para a pressão',
      when: 'Bomba com altura manométrica e um fluido; pedem a pressão gerada ou o efeito de trocar o fluido.',
      steps: [
        'Lembre: a bomba entrega **altura** (energia por peso), que não depende do fluido.',
        'Pressão gerada: Δp = ρ·g·H.',
        'Converta para a unidade pedida (Pa ÷ 1.000 = kPa).',
      ],
      note: 'Água: 10 m ≈ 100 kPa ≈ 1 bar. Fluido mais leve, mesma altura: menos pressão e menos potência.',
    },
    {
      id: 'afinidade',
      name: 'Leis de afinidade (rotação e diâmetro)',
      when: 'Bomba ou ventilador muda de rotação, ou tem o rotor usinado; pedem a nova vazão, altura ou potência.',
      steps: [
        'Calcule a razão: n₂/n₁ (ou D₂/D₁, no corte do rotor).',
        'Escolha o expoente: vazão ∝ razão¹, altura ∝ razão², potência ∝ razão³.',
        'Multiplique o valor antigo pela razão elevada ao expoente.',
      ],
      note: '**Q, H, P → 1, 2, 3.** Com inversor, −20 % de rotação dá 0,8³ ≈ 51 % da potência (num sistema só com atrito).',
    },
    {
      id: 'npsh',
      name: 'NPSH disponível e cavitação',
      when: 'Bomba succionando de um tanque; pedem o NPSH disponível, se ela cavita ou o que fazer contra a cavitação.',
      steps: [
        'Carga de pressão na superfície menos a de vapor: (p_{tanque} − p_{v})/(ρ·g).',
        'Some a altura estática (+ se o nível está acima da bomba, − se abaixo) e subtraia as perdas na sucção.',
        'Compare: NPSH_{d} > NPSH_{r} (com margem) → sem cavitação.',
      ],
      note: 'Sobem o NPSH_{d}: elevar o nível, baixar a bomba, reduzir perdas na sucção, resfriar o líquido, pressurizar o tanque. O NPSH_{r} cresce com a vazão.',
    },
    {
      id: 'associacao-bombas',
      name: 'Associação de bombas (série × paralelo)',
      when: 'Duas bombas ligadas num sistema; pedem a vazão ou a altura do conjunto.',
      steps: [
        'Monte a curva do conjunto: paralelo → soma vazões na mesma altura (cada uma leva Q/2); série → soma alturas na mesma vazão.',
        'Iguale à curva do sistema (H = H_{estática} + k·Q²).',
        'Resolva para Q e compare com uma bomba sozinha.',
      ],
      note: 'Num sistema com perdas, paralelo **não dobra** a vazão. Série serve para ganhar altura; paralelo, para ganhar vazão.',
    },
    {
      id: 'ponto-operacao',
      name: 'Ponto de operação (bomba × sistema)',
      when: 'Mudança na válvula, no sistema ou na bomba; pedem para onde vai o ponto de operação.',
      steps: [
        'Veja qual curva mudou: a da bomba (rotação, diâmetro) ou a do sistema (válvula, perdas, níveis).',
        'Desloque essa curva — estrangular a descarga deixa a do sistema mais inclinada.',
        'Ache a nova interseção e leia Q e H.',
      ],
      note: 'Estrangular a descarga: menor Q e maior H, sobre a mesma curva da bomba. O inversor muda a curva da bomba e economiza energia.',
    },
    {
      id: 'velocidade-especifica',
      name: 'Velocidade específica (tipo de rotor)',
      when: 'Pedem n_{s} ou o tipo de rotor para uma combinação de vazão e altura.',
      steps: [
        'Divida a vazão pelo número de bocas de sucção e a altura pelo número de estágios.',
        'n_{s} = n·√Q/H^{3/4}, com Q em m³/s e H em m.',
        'Classifique: n_{s} baixa → radial (muita H, pouca Q); n_{s} alta → axial (muita Q, pouca H).',
      ],
      note: 'Muita altura com pouca vazão: rotor radial (ou vários estágios em série).',
    },
  ],
  questions: [
    {
      id: 'mec-bom-01',
      type: 'gen',
      difficulty: 1,
      lessonRef: 2,
      title: 'Potência no eixo de uma bomba',
      roteiro: 'potencia-bomba',
      generate(rng) {
        const Qh = pickOne(rng, [18, 36, 54, 72, 90, 108, 144, 180]);
        const H = pickOne(rng, [20, 25, 30, 40, 50, 60, 80]);
        const eta = pickOne(rng, [0.5, 0.6, 0.75, 0.8]);
        const Q = Qh / 3600;
        const Ph = (1000 * 10 * Q * H) / 1000;
        const Pe = Ph / eta;
        const { options, answer } = numericOptions({
          correct: Pe,
          unit: 'kW',
          digits: 2,
          correctWhy: `P_{eixo} = ρgQH/η = ${fmt(Ph)} kW / ${fmt(eta)} = ${fmt(Pe)} kW.`,
          distractors: [
            { value: Ph, why: 'Essa é a potência **hidráulica**: faltou dividir pelo rendimento.' },
            { value: Ph * eta, why: 'Multiplicou pelo rendimento: a potência no eixo é **maior** que a hidráulica.' },
            { value: Pe * 3600, why: 'Esqueceu de converter m³/h para m³/s (÷ 3.600).' },
          ],
        });
        return {
          prompt: `Uma bomba centrífuga recalca **${Qh} m³/h** de água (ρ = 1.000 kg/m³) com altura manométrica de **${H} m**. Com rendimento global de **${fmt(eta * 100)}%** e g = 10 m/s², a potência no eixo é`,
          options,
          answer,
          hint: 'Converta a vazão para m³/s antes de tudo.',
          steps: [
            `Q = ${Qh}/3.600 = ${fmt(Q, 4)} m³/s.`,
            `P_{h} = 1.000 × 10 × ${fmt(Q, 4)} × ${H} = ${fmt(Ph * 1000)} W = ${fmt(Ph)} kW.`,
            `P_{eixo} = ${fmt(Ph)}/${fmt(eta)} = **${fmt(Pe)} kW**.`,
          ],
          explanation: `Q = ${Qh}/3.600 = ${fmt(Q, 4)} m³/s.\n\nP_{h} = ρ·g·Q·H = 1.000 × 10 × ${fmt(Q, 4)} × ${H} = ${fmt(Ph * 1000)} W = ${fmt(Ph)} kW.\n\nP_{eixo} = P_{h}/η = ${fmt(Ph)}/${fmt(eta)} = **${fmt(Pe)} kW**.`,
        };
      },
    },
    {
      id: 'mec-bom-02',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Leis de afinidade',
      roteiro: 'afinidade',
      generate(rng) {
        const n1 = 1750;
        const n2 = pickOne(rng, [875, 1400, 2100, 2625, 3500]);
        const r = n2 / n1;
        const what = pickOne(rng, ['vazão', 'altura manométrica', 'potência'] as const);
        const base = what === 'vazão' ? pickOne(rng, [40, 60, 80, 100]) : what === 'altura manométrica' ? pickOne(rng, [20, 30, 40, 50]) : pickOne(rng, [5, 8, 10, 15]);
        const unit = what === 'vazão' ? 'm³/h' : what === 'altura manométrica' ? 'm' : 'kW';
        const exp = what === 'vazão' ? 1 : what === 'altura manométrica' ? 2 : 3;
        const correct = base * r ** exp;
        const law = ['', 'Q ∝ n', 'H ∝ n²', 'P ∝ n³'];
        const distractors = [1, 2, 3]
          .filter((e) => e !== exp)
          .map((e) => ({ value: base * r ** e, why: `Usou expoente ${e}; para a ${what}, a lei é ${law[exp]}.` }));
        distractors.push({ value: base / r ** exp, why: 'Inverteu a razão das rotações.' });
        distractors.push({ value: base, why: 'A rotação mudou — a grandeza também muda.' });
        const { options, answer } = numericOptions({
          correct,
          unit,
          digits: 1,
          correctWhy: `${law[exp]}: ${fmt(base)} × (${n2}/${n1})^{${exp}} = ${fmt(correct, 1)} ${unit}.`,
          distractors,
        });
        return {
          prompt: `Uma bomba centrífuga opera a **${fmt(n1)} rpm** e, nessa condição, sua ${what} é de **${fmt(base)} ${unit}**. Se a rotação passar para **${fmt(n2)} rpm** (mesmo rotor e mesmo fluido), a nova ${what} será, aproximadamente,`,
          options,
          answer,
          hint: 'Leis de afinidade: Q ∝ n, H ∝ n², P ∝ n³.',
          steps: [
            `n₂/n₁ = ${fmt(n2)}/${fmt(n1)} = ${fmt(r, 2)}.`,
            `${what === 'vazão' ? 'Vazão' : what === 'altura manométrica' ? 'Altura' : 'Potência'}: ${law[exp]} → expoente ${exp}.`,
            `${fmt(base)} × ${fmt(r, 2)}${exp > 1 ? `^{${exp}}` : ''} = **${fmt(correct, 1)} ${unit}**.`,
          ],
          explanation: `Razão de rotações: ${fmt(n2)}/${fmt(n1)} = ${fmt(r, 2)}.\n\n${law[exp]} → nova ${what} = ${fmt(base)} × ${fmt(r, 2)}${exp > 1 ? `^{${exp}}` : ''} = **${fmt(correct, 1)} ${unit}**.`,
        };
      },
    },
    {
      id: 'mec-bom-03',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Antes da partida, uma bomba centrífuga deve ser **escorvada** porque',
      options: [
        { text: 'ela não consegue succionar ar: a carcaça e a sucção precisam estar cheias de líquido.', why: 'Correta: o rotor girando no ar não gera pressão suficiente para puxar o líquido.' },
        { text: 'o motor elétrico precisa ser preaquecido.', why: 'Escorva não tem relação com o motor.' },
        { text: 'a escorva lubrifica os rolamentos dos mancais.', why: 'Os mancais têm lubrificação própria (óleo ou graxa).' },
        { text: 'a escorva evita sobrecarga do motor na partida.', why: 'O que reduz a potência de partida é a descarga fechada, não a escorva.' },
        { text: 'é preciso zerar a pressão de descarga.', why: 'A escorva serve para encher a bomba de líquido.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **escorvar** — encher a carcaça e a sucção antes da partida.',
        'A centrífuga não é autoescorvante: girando com ar, o rotor não cria depressão suficiente para puxar o líquido.',
        'Fica **ela não consegue succionar ar**.',
      ],
      explanation: 'Bombas centrífugas **não são autoescorvantes**. A energia que o rotor transfere ao ar é insuficiente para criar a depressão que puxa o líquido. Por isso enchemos a carcaça e a linha de sucção (escorva), purgando o ar pelo respiro.',
    },
    {
      id: 'mec-bom-04',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Uma bomba centrífuga apresenta ruído semelhante ao de cascalho, vibração e queda da altura manométrica. Qual medida tende a **reduzir** o problema?',
      options: [
        { text: 'Elevar o nível do reservatório de sucção (ou baixar a bomba), aumentando o NPSH disponível.', why: 'Correta: mais carga estática na sucção → mais margem acima da pressão de vapor.' },
        { text: 'Estrangular a válvula de sucção para reduzir a vazão.', why: 'Estrangular a sucção aumenta as perdas e derruba o NPSH disponível: piora.' },
        { text: 'Aumentar a rotação da bomba.', why: 'Rotação maior aumenta o NPSH **requerido**: piora.' },
        { text: 'Aquecer o líquido bombeado para reduzir sua viscosidade.', why: 'Líquido mais quente tem pressão de vapor maior: cavita mais fácil.' },
        { text: 'Instalar um filtro de malha mais fina na sucção.', why: 'Mais perda de carga na sucção → menos NPSH disponível.' },
      ],
      answer: 0,
      roteiro: 'npsh',
      steps: [
        'Ruído de cascalho, vibração e queda de altura são sintomas de **cavitação**: falta NPSH disponível.',
        'Elevar o nível da sucção (ou baixar a bomba) aumenta a parcela da altura estática.',
        'Mais NPSH_{d} afasta a cavitação: **elevar o nível ou baixar a bomba**. Estrangular a sucção e aquecer o líquido pioram; mais rotação aumenta o NPSH_{r}.',
      ],
      explanation: 'Os sintomas são de **cavitação**: NPSH disponível menor que o requerido. Para combater: aumentar o NPSH disponível (elevar o nível de sucção, baixar a bomba, reduzir perdas na sucção, resfriar o líquido, pressurizar o tanque) ou reduzir o requerido (menor vazão ou rotação).',
    },
    {
      id: 'mec-bom-05',
      difficulty: 2,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Ao fechar parcialmente a válvula de **descarga** de uma bomba centrífuga em operação, o ponto de operação',
      options: [
        { text: 'desloca-se sobre a curva da bomba para menor vazão e maior altura manométrica.', why: 'Correta: a curva do sistema fica mais íngreme e cruza a curva da bomba mais à esquerda.' },
        { text: 'desloca-se para maior vazão e menor altura manométrica.', why: 'É o contrário: mais perda no sistema → menos vazão.' },
        { text: 'permanece o mesmo, pois a curva da bomba não muda.', why: 'A curva da bomba não muda, mas a do sistema muda — e a interseção também.' },
        { text: 'muda porque a curva da bomba se desloca para cima.', why: 'Válvula não altera a curva da bomba; rotação e diâmetro do rotor, sim.' },
        { text: 'leva a bomba a cavitar imediatamente.', why: 'Estrangular a **descarga** não derruba o NPSH disponível; com menos vazão, o requerido até diminui.' },
      ],
      answer: 0,
      roteiro: 'ponto-operacao',
      steps: [
        'Fechar a válvula de descarga muda o **sistema** (mais perda), não a bomba.',
        'A curva do sistema fica mais inclinada.',
        'A interseção vai para **menor vazão e maior altura**, sobre a mesma curva da bomba.',
      ],
      explanation: 'Estrangular a descarga acrescenta perda de carga ao **sistema**: a curva do sistema fica mais inclinada e intercepta a curva da bomba em **menor Q e maior H**. É o controle mais simples (e menos eficiente) de vazão; o inversor de frequência economiza energia.',
    },
    {
      id: 'mec-bom-06',
      difficulty: 3,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Duas bombas centrífugas iguais são associadas em **paralelo** num sistema com perdas de carga significativas. Em relação à vazão de uma bomba operando sozinha nesse mesmo sistema, a vazão total',
      options: [
        { text: 'aumenta, mas fica abaixo do dobro.', why: 'Correta: com mais vazão a perda de carga cresce (∝ Q²), a altura exigida sobe e cada bomba entrega menos.' },
        { text: 'dobra exatamente.', why: 'Só dobraria se a curva do sistema fosse horizontal (sem perdas variáveis com a vazão).' },
        { text: 'permanece igual, porque a altura manométrica não muda.', why: 'A vazão aumenta — é o objetivo da associação em paralelo.' },
        { text: 'diminui, pelas perdas adicionais.', why: 'A vazão total aumenta, apenas menos que o dobro.' },
        { text: 'dobra, e a altura manométrica também dobra.', why: 'Somar alturas é característica da associação em **série**.' },
      ],
      answer: 0,
      roteiro: 'associacao-bombas',
      steps: [
        'Paralelo: para a mesma altura, as vazões se somam.',
        'Mas o sistema tem perdas (∝ Q²): mais vazão exige mais altura.',
        'O novo ponto fica acima da vazão de uma bomba, mas **abaixo do dobro**.',
      ],
      explanation: 'Em paralelo, somam-se as vazões **para a mesma altura**. Mas, quando a vazão aumenta, a curva do sistema exige mais altura (perdas ∝ Q²). O novo ponto de operação fica com **menos que o dobro** da vazão de uma bomba sozinha.',
    },
    {
      id: 'mec-bom-07',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Sobre NPSH em bombas centrífugas, é correto afirmar que',
      options: [
        { text: 'o NPSH disponível depende da instalação, e o requerido é característica da bomba que cresce com a vazão.', why: 'Correta.' },
        { text: 'o NPSH requerido é calculado a partir das condições da instalação de sucção.', why: 'O requerido vem do fabricante (ensaio); o **disponível** é que depende da instalação.' },
        { text: 'para evitar cavitação, o NPSH requerido deve ser maior que o disponível.', why: 'Invertido: o disponível precisa superar o requerido.' },
        { text: 'o NPSH disponível aumenta com a temperatura do líquido.', why: 'Temperatura maior → pressão de vapor maior → NPSH disponível **menor**.' },
        { text: 'a cavitação ocorre na descarga da bomba, onde a pressão é máxima.', why: 'Ela nasce na entrada do rotor, a região de menor pressão.' },
      ],
      answer: 0,
      roteiro: 'npsh',
      steps: [
        'NPSH disponível: vem da instalação (pressão no tanque, pressão de vapor, níveis e perdas).',
        'NPSH requerido: dado do fabricante, que cresce com a vazão.',
        'Sem cavitação: NPSH_{d} > NPSH_{r}. Correta: **o disponível depende da instalação; o requerido é da bomba e cresce com a vazão**.',
      ],
      explanation: '**NPSH disponível** = energia na sucção acima da pressão de vapor — depende do nível, das perdas, da temperatura e da pressão no tanque. **NPSH requerido** = o mínimo que a bomba precisa (dado do fabricante), que cresce com a vazão. Sem cavitação: NPSH_{disp} > NPSH_{req}.',
    },
    {
      id: 'mec-bom-08',
      difficulty: 1,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'É exemplo de bomba **dinâmica** (de deslocamento não positivo):',
      options: [
        { text: 'bomba centrífuga de fluxo misto (diagonal)', why: 'Correta: turbobombas (radial, diagonal, axial) transferem energia pela rotação do rotor.' },
        { text: 'bomba de engrenagens', why: 'Deslocamento positivo: os dentes aprisionam volumes de líquido.' },
        { text: 'bomba de palhetas', why: 'Deslocamento positivo: as palhetas formam câmaras que variam de volume.' },
        { text: 'bomba de diafragma', why: 'Deslocamento positivo (alternativa): o diafragma empurra o volume da câmara.' },
        { text: 'bomba de pistão', why: 'Deslocamento positivo alternativa.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: bomba **dinâmica** (turbobomba), o oposto de deslocamento positivo.',
        'Dinâmicas aceleram o líquido no rotor: radiais, diagonais (fluxo misto) e axiais. Engrenagens, palhetas, pistão e diafragma aprisionam volumes.',
        'Fica **centrífuga de fluxo misto (diagonal)**.',
      ],
      explanation: '**Dinâmicas (turbobombas):** centrífugas radiais, diagonais (fluxo misto) e axiais — o rotor acelera o líquido e a carcaça converte velocidade em pressão. **Deslocamento positivo:** engrenagens, palhetas, parafusos, lóbulos, pistão e diafragma — aprisionam e empurram volumes, com vazão quase independente da pressão.',
    },
    {
      id: 'mec-bom-09',
      difficulty: 1,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Numa bomba centrífuga, o **anel de desgaste** tem a função de',
      options: [
        { text: 'reduzir a recirculação de líquido da região de descarga para a sucção, pela folga entre o rotor e a carcaça.', why: 'Correta: ele mantém a folga pequena (e substituível), limitando a perda volumétrica.' },
        { text: 'aumentar a viscosidade do líquido para reduzir vazamentos.', why: 'Nenhuma peça da bomba altera a viscosidade do líquido.' },
        { text: 'resfriar o líquido que passa pelo rotor.', why: 'Não é trocador de calor.' },
        { text: 'aumentar a recirculação interna para evitar a cavitação.', why: 'É o contrário: ele reduz a recirculação.' },
        { text: 'vedar o eixo contra vazamentos para o ambiente.', why: 'Isso é função do selo mecânico ou da gaxeta.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **anel de desgaste**.',
        'Entre o rotor e a carcaça há uma folga por onde o líquido da descarga volta para a sucção; o anel mantém essa folga pequena e é a peça trocada quando gasta.',
        'Fica **reduzir a recirculação da descarga para a sucção**. Vedar o eixo é função do selo ou da gaxeta.',
      ],
      explanation: 'Entre o rotor (que gira) e a carcaça existe uma folga por onde o líquido de alta pressão tenta voltar para a sucção. O **anel de desgaste** mantém essa folga pequena — e, quando gasta, é trocado em vez do rotor ou da carcaça. Folga aumentando = mais **perda volumétrica** e queda de rendimento.',
    },
    {
      id: 'mec-bom-10',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Numa instalação que precisa de **altura manométrica elevada** e **vazão relativamente pequena**, o tipo de rotor mais indicado é o',
      options: [
        { text: 'centrífugo radial.', why: 'Correta: rotores radiais (baixa velocidade específica) dão muita altura com pouca vazão.' },
        { text: 'axial.', why: 'O axial é para grandes vazões e pequenas alturas (drenagem, circulação de condensadores).' },
        { text: 'helicoidal.', why: 'Também favorece vazão em vez de altura.' },
        { text: 'diagonal (fluxo misto).', why: 'Fica no meio do caminho: alturas e vazões médias.' },
        { text: 'qualquer centrífuga associada em paralelo com outra igual.', why: 'Paralelo soma **vazão**, não altura.' },
      ],
      answer: 0,
      roteiro: 'velocidade-especifica',
      steps: [
        'Altura elevada e vazão pequena.',
        'n_{s} = n·√Q/H^{3/4}: Q pequena e H grande dão n_{s} **baixa**.',
        'n_{s} baixa → rotor **centrífugo radial**.',
      ],
      explanation: 'A velocidade específica (n_{s} = n·√Q/H^{3/4}) organiza os rotores: **baixa n_{s}** (muita H, pouca Q) → **radial**; média → diagonal; **alta n_{s}** (muita Q, pouca H) → **axial**. Para ganhar altura com bombas, associe em **série** ou use vários estágios.',
    },
    {
      id: 'mec-bom-11',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Numa bomba centrífuga, as perdas **volumétricas** têm origem principalmente',
      options: [
        { text: 'nas fugas de líquido pelas folgas entre o rotor e a carcaça, que fazem parte da vazão recircular.', why: 'Correta: esse líquido recebe energia do rotor e volta para a sucção sem chegar à descarga.' },
        { text: 'no atrito do líquido com as paredes das passagens do rotor e da carcaça.', why: 'Essa é uma perda **hidráulica**.' },
        { text: 'no choque do líquido contra a entrada das pás fora do ponto de projeto.', why: 'Também é perda **hidráulica**.' },
        { text: 'no atrito dos mancais e das gaxetas.', why: 'Essas são perdas **mecânicas**.' },
        { text: 'no aquecimento do motor elétrico.', why: 'Perda do motor, não da bomba.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: perdas **volumétricas** (nem hidráulicas, nem mecânicas).',
        'η = hidráulico × volumétrico × mecânico. Volumétrico: vazão que recircula pelas folgas. Hidráulico: atrito e choques. Mecânico: mancais e selos.',
        'Fica **fugas pelas folgas entre rotor e carcaça**.',
      ],
      explanation: 'Rendimento total = hidráulico × volumétrico × mecânico. **Volumétrico:** parte da vazão recircula pelas folgas (anéis de desgaste, furos de balanceamento). **Hidráulico:** atrito e choques no escoamento. **Mecânico:** mancais, selos, gaxetas.',
    },
    {
      id: 'mec-bom-12',
      type: 'gen',
      difficulty: 2,
      lessonRef: 6,
      title: 'Velocidade específica',
      roteiro: 'velocidade-especifica',
      generate(rng) {
        const n = pickOne(rng, [1750, 3500]);
        const stages = pickOne(rng, [1, 2, 3]);
        const sides = pickOne(rng, [1, 2]);
        const qEach = pickOne(rng, [0.01, 0.04, 0.09]);
        const hStage = pickOne(rng, [16, 81, 256]);
        const Q = qEach * sides;
        const H = hStage * stages;
        const ns = (n * Math.sqrt(qEach)) / hStage ** 0.75;
        const { options, answer } = numericOptions({
          correct: ns,
          digits: 1,
          correctWhy: `Por boca e por estágio: Q = ${fmt(qEach)} m³/s e H = ${hStage} m → n_{s} = ${n} × ${fmt(Math.sqrt(qEach), 1)}/${fmt(hStage ** 0.75, 0)} = ${fmt(ns, 1)}.`,
          distractors: [
            { value: (n * Math.sqrt(Q)) / H ** 0.75, why: 'Usou a vazão total e a altura total, sem dividir por bocas de sucção e estágios.' },
            { value: (n * Math.sqrt(qEach)) / H ** 0.75, why: 'Corrigiu a vazão, mas esqueceu de dividir a altura pelo número de estágios.' },
            { value: (n * Math.sqrt(Q)) / hStage ** 0.75, why: 'Corrigiu a altura, mas esqueceu de dividir a vazão pelas bocas de sucção.' },
            { value: (n * qEach) / hStage ** 0.75, why: 'Esqueceu a raiz quadrada da vazão.' },
          ],
        });
        const tipo = `${stages} ${stages > 1 ? 'estágios' : 'estágio'}, ${sides === 2 ? 'com rotor de **dupla sucção**' : 'com sucção simples'}`;
        return {
          prompt: `Uma bomba centrífuga de ${tipo}, deve recalcar **${fmt(Q)} m³/s** a uma altura de **${H} m**, girando a **${fmt(n)} rpm**. A velocidade específica n_{s} = n·√Q/H^{3/4} (Q em m³/s e H em m, por boca de sucção e por estágio) é aproximadamente`,
          options,
          answer,
          hint: 'Divida Q pelo número de bocas de sucção e H pelo número de estágios antes de aplicar a fórmula.',
          steps: [
            `Q por boca: ${fmt(Q)}/${sides} = ${fmt(qEach)} m³/s; H por estágio: ${H}/${stages} = ${hStage} m.`,
            `n_{s} = ${fmt(n)} × √${fmt(qEach)}/${hStage}^{0,75} = ${fmt(n)} × ${fmt(Math.sqrt(qEach), 1)}/${fmt(hStage ** 0.75, 0)}.`,
            `n_{s} ≈ **${fmt(ns, 1)}** (quanto menor, mais radial o rotor).`,
          ],
          explanation: `Vazão por boca de sucção: ${fmt(Q)}/${sides} = ${fmt(qEach)} m³/s. Altura por estágio: ${H}/${stages} = ${hStage} m.\n\nn_{s} = ${fmt(n)} × √${fmt(qEach)} / ${hStage}^{0,75} = ${fmt(n)} × ${fmt(Math.sqrt(qEach), 1)} / ${fmt(hStage ** 0.75, 0)} = **${fmt(ns, 1)}**. Quanto menor n_{s}, mais "radial" é o rotor.`,
        };
      },
    },
    {
      id: 'mec-bom-13',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Corte do rotor',
      roteiro: 'afinidade',
      generate(rng) {
        const D1 = pickOne(rng, [250, 260, 300, 320]);
        const D2 = Math.round(D1 * pickOne(rng, [0.85, 0.9, 0.95]));
        const r = D2 / D1;
        const what = pickOne(rng, ['vazão', 'altura manométrica', 'potência'] as const);
        const base = what === 'vazão' ? pickOne(rng, [60, 80, 120]) : what === 'altura manométrica' ? pickOne(rng, [40, 50, 60]) : pickOne(rng, [15, 22, 30]);
        const unit = what === 'vazão' ? 'm³/h' : what === 'altura manométrica' ? 'm' : 'kW';
        const exp = what === 'vazão' ? 1 : what === 'altura manométrica' ? 2 : 3;
        const correct = base * r ** exp;
        const law = ['', 'Q ∝ D', 'H ∝ D²', 'P ∝ D³'];
        const distractors = [1, 2, 3]
          .filter((e) => e !== exp)
          .map((e) => ({ value: base * r ** e, why: `Usou expoente ${e}; para a ${what}, vale ${law[exp]}.` }));
        distractors.push({ value: base / r ** exp, why: 'Inverteu a razão dos diâmetros: o rotor ficou **menor**, a grandeza cai.' });
        distractors.push({ value: base, why: 'O diâmetro mudou — a grandeza também muda.' });
        const { options, answer } = numericOptions({
          correct,
          unit,
          digits: 1,
          correctWhy: `${law[exp]}: ${fmt(base)} × (${D2}/${D1})^{${exp}} = ${fmt(correct, 1)} ${unit}.`,
          distractors,
        });
        return {
          prompt: `Para ajustar uma bomba ao sistema, o rotor de **${D1} mm** é usinado para **${D2} mm**, mantendo a rotação. Antes do corte, a ${what} no ponto de projeto era de **${fmt(base)} ${unit}**. Pelas leis de semelhança, a nova ${what} será, aproximadamente,`,
          options,
          answer,
          hint: 'Com rotação constante e corte pequeno: Q ∝ D, H ∝ D², P ∝ D³.',
          steps: [
            `D₂/D₁ = ${D2}/${D1} = ${fmt(r, 3)}.`,
            `${what === 'vazão' ? 'Vazão' : what === 'altura manométrica' ? 'Altura' : 'Potência'}: ${law[exp]} → expoente ${exp}.`,
            `${fmt(base)} × ${fmt(r, 3)}${exp > 1 ? `^{${exp}}` : ''} = **${fmt(correct, 1)} ${unit}** (vale para cortes pequenos).`,
          ],
          explanation: `Razão de diâmetros: ${D2}/${D1} = ${fmt(r, 3)}.\n\n${law[exp]} → ${fmt(base)} × ${fmt(r, 3)}${exp > 1 ? `^{${exp}}` : ''} = **${fmt(correct, 1)} ${unit}**. (Vale para cortes pequenos, até uns 10% a 15%; além disso a geometria muda demais.)`,
        };
      },
    },
    {
      id: 'mec-bom-14',
      type: 'gen',
      difficulty: 2,
      lessonRef: 4,
      title: 'NPSH disponível',
      roteiro: 'npsh',
      generate(rng) {
        const site = pickOne(rng, [
          { name: 'ao nível do mar', patm: 101 },
          { name: 'numa cidade a cerca de 1.000 m de altitude', patm: 90 },
        ]);
        const fluid = pickOne(rng, [
          { t: 20, pv: 2.3 },
          { t: 60, pv: 19.9 },
          { t: 80, pv: 47.4 },
        ]);
        let zs = pickOne(rng, [-3, -2, -1, 1, 2, 3]);
        const hf = pickOne(rng, [0.5, 1, 1.5]);
        let npsh = (site.patm - fluid.pv) / 10 + zs - hf;
        if (npsh < 0.5) {
          zs = Math.abs(zs);
          npsh = (site.patm - fluid.pv) / 10 + zs - hf;
        }
        const { options, answer } = numericOptions({
          correct: npsh,
          unit: 'm',
          digits: 2,
          correctWhy: `NPSH_{d} = (${site.patm} − ${fmt(fluid.pv, 1)})/10 ${zs >= 0 ? '+' : '−'} ${Math.abs(zs)} − ${fmt(hf, 1)} = ${fmt(npsh, 2)} m.`,
          distractors: [
            { value: site.patm / 10 + zs - hf, why: 'Esqueceu de descontar a pressão de vapor — o coração do NPSH.' },
            { value: (site.patm - fluid.pv) / 10 - zs - hf, why: 'Trocou o sinal da altura: nível **acima** da bomba soma, nível **abaixo** subtrai.' },
            { value: (site.patm - fluid.pv) / 10 + zs + hf, why: 'Somou a perda de carga: ela **reduz** o NPSH disponível.' },
            { value: (site.patm - fluid.pv) / 10 + zs, why: 'Esqueceu a perda de carga na sucção.' },
          ],
        });
        return {
          prompt: `Uma bomba succiona água a **${fluid.t} °C** (pressão de vapor ${fmt(fluid.pv, 1)} kPa) de um tanque aberto, ${site.name} (p_{atm} = ${site.patm} kPa). O nível da água fica **${Math.abs(zs)} m ${zs >= 0 ? 'acima' : 'abaixo'}** da linha de centro da bomba e a perda de carga na sucção é de **${fmt(hf, 1)} m**. Com ρ = 1.000 kg/m³ e g = 10 m/s², o NPSH disponível, em metros, é`,
          options,
          answer,
          hint: 'NPSH_{d} = (p_{atm} − p_{v})/(ρg) + z_{s} − perdas, com z_{s} positivo se o nível está acima da bomba.',
          steps: [
            `(${site.patm} − ${fmt(fluid.pv, 1)}) kPa/(1.000 × 10) = ${fmt((site.patm - fluid.pv) / 10, 2)} m.`,
            `${zs >= 0 ? `Nível ${zs} m acima da bomba: + ${zs} m` : `Nível ${Math.abs(zs)} m abaixo da bomba: − ${Math.abs(zs)} m`}; perdas na sucção: − ${fmt(hf, 1)} m.`,
            `NPSH_{d} = **${fmt(npsh, 2)} m** — compare com o NPSH requerido da bomba.`,
          ],
          explanation: `Carga de pressão disponível: (${site.patm} − ${fmt(fluid.pv, 1)}) kPa / (1.000 × 10) = ${fmt((site.patm - fluid.pv) / 10, 2)} m.\n\n${zs >= 0 ? 'Bomba afogada: soma' : 'Bomba acima do nível: subtrai'} ${Math.abs(zs)} m; perda na sucção: −${fmt(hf, 1)} m.\n\nNPSH_{d} = **${fmt(npsh, 2)} m**. Compare com o NPSH requerido da bomba (com margem): se for menor, ela cavita.`,
        };
      },
    },
    {
      id: 'mec-bom-15',
      difficulty: 2,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'As curvas características de uma bomba centrífuga (altura, potência e rendimento em função da vazão) apresentadas nos catálogos são levantadas mantendo constantes',
      options: [
        { text: 'a rotação, o diâmetro do rotor e o fluido de ensaio.', why: 'Correta: são as grandezas "neutras" do ensaio; mudando qualquer uma, a curva muda (leis de semelhança).' },
        { text: 'a vazão e a altura manométrica.', why: 'Essas são justamente as variáveis da curva.' },
        { text: 'a potência no eixo e o rendimento.', why: 'Potência e rendimento variam ao longo da curva.' },
        { text: 'a pressão de descarga e o NPSH disponível.', why: 'Pressão de descarga varia com a vazão; o NPSH disponível é da instalação, não da bomba.' },
        { text: 'a abertura da válvula de descarga.', why: 'Varia-se a válvula justamente para percorrer a curva.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: o que fica **constante** no levantamento das curvas.',
        'No ensaio, a bomba gira numa rotação fixa, com um rotor definido e com água; a válvula de descarga é que varia a vazão.',
        'Fica **rotação, diâmetro do rotor e fluido de ensaio**.',
      ],
      explanation: 'No ensaio, a bomba gira numa **rotação fixa**, com um **rotor de diâmetro definido** e com **água** (fluido de referência). A válvula de descarga é aberta aos poucos para levantar H, P, η e NPSH_{req} em função de Q. Por isso os catálogos trazem uma família de curvas: uma para cada rotação ou diâmetro de rotor.',
    },
    {
      id: 'mec-bom-16',
      type: 'gen',
      difficulty: 3,
      lessonRef: 5,
      title: 'Duas bombas iguais num sistema com perdas',
      roteiro: 'associacao-bombas',
      generate(rng) {
        const H0 = pickOne(rng, [40, 50, 60]);
        const Hs = pickOne(rng, [10, 20]);
        const a = 0.004;
        const b = 0.006;
        const single = Math.sqrt((H0 - Hs) / (a + b));
        const parallel = Math.sqrt((H0 - Hs) / (a / 4 + b));
        const series = Math.sqrt((2 * H0 - Hs) / (2 * a + b));
        const isParallel = rng() < 0.5;
        const correct = isParallel ? parallel : series;
        const { options, answer } = numericOptions({
          correct,
          unit: 'm³/h',
          digits: 1,
          correctWhy: isParallel
            ? `Paralelo: cada bomba leva Q/2 → ${H0} − ${a}(Q/2)² = ${Hs} + ${b}Q² → Q = ${fmt(parallel, 1)} m³/h.`
            : `Série: alturas somadas → 2(${H0} − ${a}Q²) = ${Hs} + ${b}Q² → Q = ${fmt(series, 1)} m³/h.`,
          distractors: [
            { value: 2 * single, why: 'Dobrou a vazão de uma bomba sozinha; com perdas ∝ Q², o sistema não deixa.' },
            { value: single, why: 'Essa é a vazão de uma bomba sozinha.' },
            { value: isParallel ? series : parallel, why: isParallel ? 'Essa seria a vazão com as bombas em **série**.' : 'Essa seria a vazão com as bombas em **paralelo**.' },
            { value: Math.sqrt(correct * single), why: 'Média sem base física entre os dois pontos de operação.' },
          ],
        });
        return {
          prompt: `Cada uma de duas bombas iguais tem curva **H = ${H0} − ${fmt(a, 3)}·Q²** (H em m, Q em m³/h). O sistema exige **H = ${Hs} + ${fmt(b, 3)}·Q²**. Sozinha, uma bomba entrega ${fmt(single, 1)} m³/h. Associando as duas em **${isParallel ? 'paralelo' : 'série'}**, a vazão no sistema passa a ser, aproximadamente,`,
          options,
          answer,
          hint: isParallel ? 'Em paralelo, para a mesma altura, cada bomba leva metade da vazão.' : 'Em série, para a mesma vazão, as alturas se somam.',
          steps: [
            `${isParallel ? `Paralelo: cada bomba leva Q/2 → H = ${H0} − ${fmt(a, 3)}·(Q/2)² = ${H0} − ${fmt(a / 4, 3)}·Q².` : `Série: alturas somadas → H = 2·(${H0} − ${fmt(a, 3)}·Q²) = ${2 * H0} − ${fmt(2 * a, 3)}·Q².`}`,
            `${isParallel ? `${H0} − ${fmt(a / 4, 3)}·Q² = ${Hs} + ${fmt(b, 3)}·Q²` : `${2 * H0} − ${fmt(2 * a, 3)}·Q² = ${Hs} + ${fmt(b, 3)}·Q²`}.`,
            `${isParallel ? `Q² = ${H0 - Hs}/${fmt(a / 4 + b, 3)} → **Q ≈ ${fmt(parallel, 1)} m³/h**` : `Q² = ${2 * H0 - Hs}/${fmt(2 * a + b, 3)} → **Q ≈ ${fmt(series, 1)} m³/h**`} (uma bomba sozinha: ${fmt(single, 1)} m³/h).`,
          ],
          explanation: isParallel
            ? `Curva das duas em paralelo: H = ${H0} − ${fmt(a, 3)}·(Q/2)² = ${H0} − ${fmt(a / 4, 3)}·Q².\n\nInterseção com o sistema: ${H0} − ${fmt(a / 4, 3)}Q² = ${Hs} + ${fmt(b, 3)}Q² → Q² = ${H0 - Hs}/${fmt(a / 4 + b, 3)} → **Q ≈ ${fmt(parallel, 1)} m³/h** — mais que uma bomba (${fmt(single, 1)}), mas bem menos que o dobro.`
            : `Curva das duas em série: H = 2·(${H0} − ${fmt(a, 3)}Q²) = ${2 * H0} − ${fmt(2 * a, 3)}Q².\n\nInterseção com o sistema: ${2 * H0} − ${fmt(2 * a, 3)}Q² = ${Hs} + ${fmt(b, 3)}Q² → Q² = ${2 * H0 - Hs}/${fmt(2 * a + b, 3)} → **Q ≈ ${fmt(series, 1)} m³/h**.`,
        };
      },
    },
    {
      id: 'mec-bom-17',
      type: 'ce',
      difficulty: 1,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Numa bomba de deslocamento positivo, a vazão praticamente não depende da pressão de descarga; por isso, ela não deve operar com a descarga bloqueada sem uma válvula de alívio.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: deslocamento positivo com a **descarga bloqueada**.',
        'Ela empurra um volume fixo por ciclo: com a descarga fechada, a pressão sobe até romper algo ou parar o motor.',
        'Por isso se instala válvula de alívio: **Certo**.',
      ],
      explanation: '**Certo.** A bomba volumétrica empurra um volume fixo por rotação ou ciclo: com a descarga fechada, a pressão sobe até romper alguma coisa (tubo, selo, carcaça) ou parar o motor. Por isso se instala **válvula de alívio** — e a vazão é controlada pela rotação ou por recirculação, não estrangulando a descarga.',
    },
    {
      id: 'mec-bom-18',
      difficulty: 2,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Uma bomba centrífuga que recalcava água passa a recalcar um óleo leve de massa específica 850 kg/m³ (viscosidade semelhante), com a mesma rotação e a mesma vazão. Em relação à operação com água,',
      options: [
        { text: 'a altura manométrica é a mesma, mas a pressão gerada e a potência consumida caem cerca de 15%.', why: 'Correta: H depende do rotor e da rotação; Δp = ρgH e P = ρgQH/η acompanham a massa específica.' },
        { text: 'a altura manométrica cai 15% e a pressão gerada fica igual.', why: 'É o contrário: a altura (em metros de coluna do fluido) fica igual e a pressão cai.' },
        { text: 'tudo fica igual, pois a vazão e a rotação não mudaram.', why: 'A pressão e a potência dependem de ρ.' },
        { text: 'a potência aumenta, porque o óleo é mais difícil de bombear.', why: 'Com viscosidade semelhante, o fluido mais leve exige **menos** potência.' },
        { text: 'a altura manométrica aumenta, porque o fluido é mais leve.', why: 'A altura fornecida por uma bomba centrífuga não depende da massa específica.' },
      ],
      answer: 0,
      roteiro: 'altura-pressao',
      steps: [
        'Mesma bomba, rotação e vazão: a altura manométrica não muda com o fluido.',
        'Δp = ρ·g·H e P = ρ·g·Q·H/η: as duas são proporcionais a ρ.',
        'ρ cai de 1.000 para 850 (15 %): **mesma altura, com pressão e potência 15 % menores**.',
      ],
      explanation: 'A bomba centrífuga entrega **altura** (energia por unidade de peso) que depende da geometria e da rotação, não do fluido. A **pressão** é Δp = ρ·g·H e a **potência** é P = ρ·g·Q·H/η: com ρ 15% menor, as duas caem 15%. (Com fluidos bem mais viscosos que a água, aí sim as curvas pioram.)',
    },
    {
      id: 'mec-bom-19',
      difficulty: 3,
      lessonRef: 4,
      source: 'Autoral',
      shuffle: false,
      prompt: 'Analise as afirmativas sobre cavitação em bombas centrífugas.\n\nI – Ocorre quando a pressão em algum ponto do escoamento cai até a pressão de vapor do líquido na temperatura de bombeamento.\nII – O NPSH requerido pela bomba diminui quando a vazão aumenta.\nIII – Aumentar a temperatura do líquido bombeado reduz o NPSH disponível.\n\nEstá correto o que se afirma em',
      options: [
        { text: 'I, apenas', why: 'III também está correta: líquido mais quente tem pressão de vapor maior.' },
        { text: 'II, apenas', why: 'II é falsa: o NPSH requerido **aumenta** com a vazão.' },
        { text: 'I e III, apenas', why: 'Correta: I define a cavitação e III mostra o efeito da temperatura.' },
        { text: 'II e III, apenas', why: 'II é falsa.' },
        { text: 'I, II e III', why: 'II é falsa: mais vazão → mais velocidade na entrada do rotor → mais NPSH requerido.' },
      ],
      answer: 2,
      roteiro: 'fmt.afirmativas',
      steps: [
        'I – **Correta**: é a definição — o líquido vaporiza onde a pressão chega à de vapor, e as bolhas colapsam adiante.',
        'II – **Errada**: o NPSH requerido **cresce** com a vazão.',
        'III – **Correta**: a pressão de vapor sobe com a temperatura e "come" o NPSH disponível.',
        'Certas: I e III → "I e III, apenas".',
      ],
      explanation: '**I** – Correta: é a definição — o líquido vaporiza localmente e as bolhas colapsam nas regiões de pressão maior. **II** – Errada: o NPSH requerido **cresce** com a vazão. **III** – Correta: a pressão de vapor sobe com a temperatura e "come" o NPSH disponível.',
    },
    {
      id: 'mec-bom-20',
      type: 'gen',
      difficulty: 1,
      lessonRef: 0,
      title: 'Da altura para a pressão',
      roteiro: 'altura-pressao',
      generate(rng) {
        const H = pickOne(rng, [20, 30, 50, 80, 100]);
        const fluid = pickOne(rng, [
          { name: 'água', rho: 1000 },
          { name: 'óleo (ρ = 850 kg/m³)', rho: 850 },
          { name: 'gasolina (ρ = 750 kg/m³)', rho: 750 },
          { name: 'salmoura (ρ = 1.200 kg/m³)', rho: 1200 },
        ]);
        const dp = (fluid.rho * 10 * H) / 1000;
        const { options, answer } = numericOptions({
          correct: dp,
          unit: 'kPa',
          digits: 1,
          correctWhy: `Δp = ρ·g·H = ${fmt(fluid.rho)} × 10 × ${H} = ${fmt(dp * 1000)} Pa = ${fmt(dp, 1)} kPa.`,
          distractors: [
            { value: (1000 * 10 * H) / 1000, why: 'Usou a massa específica da água.' },
            { value: (fluid.rho * H) / 1000, why: 'Esqueceu o g.' },
            { value: (fluid.rho * 10 * H) / 1e6, why: 'Converteu errado: Pa → kPa é ÷ 1.000.' },
            { value: H, why: 'Confundiu metros de coluna com kPa.' },
          ],
        });
        return {
          prompt: `Uma bomba centrífuga fornece **${H} m** de altura manométrica a ${fluid.name}. Com g = 10 m/s², o aumento de pressão entre a sucção e a descarga (mesmo diâmetro e mesma cota) é, em kPa,`,
          options,
          answer,
          hint: 'Δp = ρ·g·H.',
          steps: [
            `H = ${H} m de ${fluid.name}.`,
            `Δp = ${fmt(fluid.rho)} × 10 × ${H} = ${fmt(fluid.rho * 10 * H)} Pa.`,
            `Δp = **${fmt(dp, 1)} kPa**.`,
          ],
          explanation: `A altura manométrica é energia por unidade de peso. Em pressão: Δp = ρ·g·H = ${fmt(fluid.rho)} × 10 × ${H} = **${fmt(dp, 1)} kPa**. Com água, 10 m ≈ 100 kPa ≈ 1 bar.`,
        };
      },
    },
    {
      id: 'mec-bom-21',
      difficulty: 3,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Ventiladores centrífugos com pás curvadas **para frente** são compactos, silenciosos e baratos. Mesmo assim, **NÃO** são indicados para',
      options: [
        { text: 'instalações de grande potência em operação contínua, porque têm rendimento baixo e a potência cresce com a vazão (risco de sobrecarga do motor).', why: 'Correta: pás para frente dão muita pressão por tamanho, mas com rendimento modesto e curva de potência sempre crescente.' },
        { text: 'sistemas de ar-condicionado residenciais e comerciais.', why: 'Essa é justamente uma aplicação típica (silenciosos e compactos).' },
        { text: 'aplicações em que se deseja baixo custo inicial.', why: 'O baixo custo é uma vantagem deles.' },
        { text: 'locais com pouco espaço.', why: 'São compactos — vantagem.' },
        { text: 'serviço intermitente de baixa potência.', why: 'Aí eles se dão bem.' },
      ],
      answer: 0,
      roteiro: 'fmt.exceto',
      steps: [
        'A banca pede onde as pás para frente **NÃO** são indicadas: procure a aplicação ruim para elas.',
        'Pás para frente: compactas, silenciosas e baratas — boas para ar-condicionado, pouco espaço e serviço leve.',
        'Rendimento baixo e potência que cresce com a vazão: **não servem para grande potência em operação contínua**.',
      ],
      explanation: 'Pás **para frente**: muita pressão e vazão para o tamanho, baixo ruído e custo, mas rendimento menor e potência que sobe sem parar com a vazão (o motor pode sobrecarregar se a resistência do sistema cair). Pás **para trás** (ou de perfil aerodinâmico): melhor rendimento e curva de potência "autolimitada" — preferidas para grandes potências em operação contínua.',
    },
    {
      id: 'mec-bom-22',
      type: 'gen',
      difficulty: 2,
      lessonRef: 6,
      title: 'Rendimentos parciais',
      roteiro: 'potencia-bomba',
      generate(rng) {
        const eh = pickOne(rng, [0.8, 0.85, 0.9]);
        const ev = pickOne(rng, [0.95, 0.97]);
        const em = pickOne(rng, [0.95, 0.98]);
        const Ph = pickOne(rng, [10, 15, 20, 30]);
        const eta = eh * ev * em;
        const Pe = Ph / eta;
        const { options, answer } = numericOptions({
          correct: Pe,
          unit: 'kW',
          digits: 2,
          correctWhy: `η = ${fmt(eh)} × ${fmt(ev)} × ${fmt(em)} = ${fmt(eta, 3)} → P_{eixo} = ${Ph}/${fmt(eta, 3)} = ${fmt(Pe, 2)} kW.`,
          distractors: [
            { value: Ph / eh, why: 'Usou só o rendimento hidráulico; os três se multiplicam.' },
            { value: Ph * eta, why: 'Multiplicou pelo rendimento: a potência no eixo é **maior** que a hidráulica.' },
            { value: Ph / ((eh + ev + em) / 3), why: 'Fez a média dos rendimentos; o certo é o produto.' },
            { value: Ph / (eh * ev), why: 'Esqueceu o rendimento mecânico.' },
          ],
        });
        return {
          prompt: `Uma bomba entrega **${Ph} kW** de potência hidráulica ao líquido. Seus rendimentos são: hidráulico **${fmt(eh * 100)}%**, volumétrico **${fmt(ev * 100)}%** e mecânico **${fmt(em * 100)}%**. A potência no eixo é, em kW,`,
          options,
          answer,
          hint: 'O rendimento total é o produto dos três.',
          steps: [
            `Não há vazão a converter: a potência hidráulica já foi dada.`,
            `P_{h} = ${Ph} kW.`,
            `η = ${fmt(eh)} × ${fmt(ev)} × ${fmt(em)} = ${fmt(eta, 3)} → P_{eixo} = ${Ph}/${fmt(eta, 3)} = **${fmt(Pe, 2)} kW**.`,
          ],
          explanation: `η_{total} = η_{h}·η_{v}·η_{m} = ${fmt(eh)} × ${fmt(ev)} × ${fmt(em)} = ${fmt(eta, 3)}.\n\nP_{eixo} = P_{h}/η_{total} = ${Ph}/${fmt(eta, 3)} = **${fmt(Pe, 2)} kW**.`,
        };
      },
    },
    {
      id: 'mec-bom-23',
      difficulty: 2,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Uma bomba **axial** de grande vazão vai ser colocada em operação. Diferentemente da centrífuga radial, ela deve partir com a válvula de descarga',
      options: [
        { text: 'aberta, porque a potência absorvida é máxima com vazão nula.', why: 'Correta: na axial, a curva de potência cai com a vazão — em shutoff ela consome mais.' },
        { text: 'fechada, porque a potência é mínima com vazão nula.', why: 'Isso vale para a centrífuga **radial**.' },
        { text: 'fechada, para evitar a cavitação.', why: 'A descarga fechada não é o que evita cavitação.' },
        { text: 'aberta, porque bombas axiais são autoescorvantes.', why: 'O motivo é a curva de potência, não a escorva.' },
        { text: 'em qualquer posição: a potência não varia com a vazão.', why: 'Varia, e muito: na axial, cai com a vazão.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: bomba **axial**, na partida.',
        'Na axial, a potência é **máxima com vazão nula** — o contrário da radial, que parte com a descarga fechada.',
        'Fica **aberta**, para não sobrecarregar o motor.',
      ],
      explanation: 'A forma da curva de potência depende da velocidade específica: na **radial**, P cresce com Q (mínima em shutoff → parte fechada); na **axial**, P cai com Q (máxima em shutoff → parte **aberta**, senão sobrecarrega o motor). As diagonais ficam no meio.',
    },
    {
      id: 'mec-bom-24',
      difficulty: 3,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Uma bomba controlada por inversor de frequência tem a rotação reduzida em **20%**, num sistema praticamente sem altura estática (só perdas por atrito, ∝ Q²). A potência consumida passa a ser, aproximadamente,',
      shuffle: false,
      options: [
        { text: '80% da original', why: 'Esse seria o caso se a potência fosse proporcional à rotação.' },
        { text: '64% da original', why: 'Esse é o efeito na **altura** (H ∝ n²).' },
        { text: '51% da original', why: 'Correta: P ∝ n³ → 0,8³ = 0,512. Sem altura estática, o ponto de operação segue a parábola de afinidade.' },
        { text: '40% da original', why: 'Reduziu a mais: 0,8³ ≈ 0,51.' },
        { text: '20% da original', why: 'Confundiu redução de 20% com sobra de 20%.' },
      ],
      answer: 2,
      roteiro: 'afinidade',
      steps: [
        'n₂/n₁ = 0,8.',
        'Sistema só com atrito: os pontos de operação são semelhantes e vale P ∝ n³.',
        '0,8³ = 0,512 → **cerca de 51 %** da potência original.',
      ],
      explanation: 'Num sistema só com atrito (H_{sis} = k·Q²), os pontos de operação em rotações diferentes são **semelhantes**: valem as leis de afinidade direto — Q ∝ n, H ∝ n², **P ∝ n³**. Com n × 0,8: P × 0,512 ≈ **51%**. É por isso que inversores economizam tanta energia em bombas e ventiladores. (Com altura estática grande, a economia é menor.)',
    },
  ],
  games: [
    {
      id: 'mec-bom-g1',
      type: 'order',
      title: 'Partida de uma bomba centrífuga',
      intro: 'Monte o procedimento de partida, do primeiro ao último passo.',
      lessonRef: 0,
      steps: [
        { text: 'Conferir a lubrificação dos mancais e o sistema de selagem', why: 'Mancal sem óleo ou selo sem fluido de selagem falham em minutos.' },
        { text: 'Abrir totalmente a válvula de sucção', why: 'A sucção nunca deve ficar estrangulada: derruba o NPSH disponível.' },
        { text: 'Escorvar: encher a carcaça e a sucção de líquido, purgando o ar pelo respiro', why: 'A centrífuga não succiona ar: sem escorva, ela gira em seco.' },
        { text: 'Partir o motor com a válvula de descarga fechada', why: 'Na centrífuga radial, a potência é mínima com vazão nula: partida mais leve para o motor.' },
        { text: 'Conferir a pressão de descarga e abrir a válvula de descarga lentamente', why: 'Não opere muito tempo com a descarga fechada: o líquido aquece e pode vaporizar.' },
        { text: 'Ajustar a vazão e monitorar corrente, vibração e temperatura dos mancais', why: 'Confirma que a bomba opera perto do BEP e sem anomalias.' },
      ],
    },
    {
      id: 'mec-bom-g2',
      type: 'sort',
      title: 'Aumenta ou diminui o NPSH disponível?',
      intro: 'Cada mudança na instalação mexe no NPSH **disponível**. Para que lado?',
      lessonRef: 4,
      bins: ['Aumenta o NPSH disponível', 'Diminui o NPSH disponível'],
      items: [
        { text: 'Elevar o nível do reservatório de sucção', bin: 0, why: 'Mais carga estática na sucção.' },
        { text: 'Aumentar a temperatura do líquido', bin: 1, why: 'A pressão de vapor sobe.' },
        { text: 'Filtro de sucção entupido', bin: 1, why: 'Mais perda de carga na sucção.' },
        { text: 'Usar tubulação de sucção de maior diâmetro', bin: 0, why: 'Menor velocidade → menos perda de carga.' },
        { text: 'Instalar a bomba mais acima do reservatório', bin: 1, why: 'Menos carga estática (sucção negativa).' },
        { text: 'Pressurizar o tanque de sucção', bin: 0, why: 'Mais pressão sobre a superfície livre.' },
        { text: 'Válvula de sucção parcialmente fechada', bin: 1, why: 'Estrangular a sucção = mais perda de carga.' },
        { text: 'Eliminar curvas e acessórios na sucção', bin: 0, why: 'Menos perdas localizadas.' },
        { text: 'Operar a mesma instalação numa cidade de maior altitude', bin: 1, why: 'A pressão atmosférica é menor.' },
        { text: 'Resfriar o líquido antes da bomba', bin: 0, why: 'A pressão de vapor cai.' },
      ],
    },
    {
      id: 'mec-bom-g3',
      type: 'sort',
      title: 'Dinâmica ou de deslocamento positivo?',
      intro: 'Separe as bombas (e compressores) pelo princípio: rotor que acelera o fluido (**dinâmica**) ou câmara que aprisiona e empurra um volume (**deslocamento positivo**).',
      lessonRef: 6,
      bins: ['Dinâmica (turbomáquina)', 'Deslocamento positivo'],
      items: [
        { text: 'Bomba centrífuga radial', bin: 0, why: 'O rotor acelera o líquido; a voluta converte velocidade em pressão.' },
        { text: 'Bomba axial (hélice)', bin: 0, why: 'Turbomáquina de grande vazão e pouca altura.' },
        { text: 'Bomba centrífuga helicoidal', bin: 0, why: 'Turbobomba de fluxo misto/helicoidal.' },
        { text: 'Bomba de engrenagens', bin: 1, why: 'Os dentes carregam volumes de óleo da sucção à descarga.' },
        { text: 'Bomba de palhetas', bin: 1, why: 'Câmaras de volume variável entre as palhetas.' },
        { text: 'Bomba de parafusos', bin: 1, why: 'Os fusos formam cavidades que avançam.' },
        { text: 'Bomba de lóbulos', bin: 1, why: 'Rotores lobulares aprisionam o fluido.' },
        { text: 'Bomba de pistão (alternativa)', bin: 1, why: 'Cada curso desloca o volume do cilindro.' },
        { text: 'Bomba de diafragma', bin: 1, why: 'O diafragma varia o volume da câmara.' },
        { text: 'Compressor axial de turbina a gás', bin: 0, why: 'Compressor dinâmico: as pás aceleram o ar.' },
        { text: 'Compressor centrífugo', bin: 0, why: 'Compressor dinâmico (turbocompressor).' },
        { text: 'Compressor alternativo de pistão', bin: 1, why: 'Volumétrico: comprime o gás reduzindo o volume do cilindro.' },
      ],
    },
    {
      id: 'mec-bom-lab1',
      type: 'lab',
      lab: 'pump',
      title: 'Bomba centrífuga por dentro',
      intro: 'Uma bomba de verdade, em câmera lenta: rotor, voluta, curvas H × Q e NPSH. Preveja antes de ver e cumpra as missões.',
      lessonRef: 1,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { valve: 100 },
          prompt: 'A bomba opera com a válvula de descarga **toda aberta**. Você vai **fechar a válvula até 30%**. O que acontece com a vazão (Q) e com a altura manométrica (H)?',
          change: { valve: 30 },
          options: ['Q diminui e H aumenta', 'Q diminui e H diminui', 'Q aumenta e H aumenta', 'Q diminui e H não muda', 'Nada muda: a válvula só altera a perda de carga'],
          answer: 0,
          expect: [
            { out: 'Q', trend: 'down' },
            { out: 'H', trend: 'up' },
          ],
          why: 'Fechar a válvula **aumenta a perda de carga**: a curva do sistema fica mais íngreme e o ponto de operação **sobe pela curva da bomba** — menos vazão, mais altura. A bomba entrega o que o sistema pede.',
        },
        {
          kind: 'predict',
          setup: { valve: 0, rpm: 1500 },
          prompt: 'Com a válvula fechada (**shutoff**), a bomba gira a **1.500 rpm**. Se a rotação subir para **1.800 rpm** (+20%), a altura de shutoff…',
          change: { rpm: 1800 },
          options: ['sobe 20%', 'sobe 44%', 'sobe 73%', 'dobra', 'não muda: sem vazão não há altura'],
          answer: 1,
          expect: [{ out: 'H', trend: 'up' }],
          why: 'Leis de afinidade: **H ∝ n²** → (1.800/1.500)² = 1,2² = **1,44**, ou seja, +44%. A vazão iria com n (+20%) e a potência com n³ (+73%).',
        },
        {
          kind: 'goal',
          setup: { valve: 100 },
          lock: ['rpm', 'zs', 'temp', 'primed'],
          prompt: 'A bomba está trabalhando à direita do BEP, com rendimento baixo. **Só com a válvula**, leve o rendimento a pelo menos **77%**.',
          goals: [{ out: 'eta', min: 77 }],
          hint: 'Vá fechando a válvula: o ponto de operação anda para a esquerda na curva. Mire no ponto verde (BEP).',
          solution: { valve: 45 },
          why: 'Perto do **BEP** (ponto de melhor eficiência) a bomba gasta menos energia por m³ e sofre menos com vibração e recirculação. Estrangular resolve aqui, mas joga energia fora na válvula — o ajuste fino seria mudar a rotação (inversor) ou o diâmetro do rotor.',
        },
        {
          kind: 'goal',
          setup: { temp: 90, zs: -1, valve: 100 },
          lock: ['temp', 'rpm', 'primed'],
          prompt: 'Água a **90 °C** e a bomba **cavitando** (ouça o barulho de cascalho). Sem mudar a temperatura, acabe com a cavitação (**margem de NPSH ≥ 0,5 m**) mantendo **pelo menos 90 m³/h**.',
          goals: [
            { out: 'margin', min: 0.5 },
            { out: 'Q', min: 90 },
          ],
          hint: 'O NPSH disponível cresce com a **altura do nível de sucção** (zs). Afogue a bomba: arraste o nível do tanque para cima.',
          solution: { zs: 6 },
          why: 'NPSH_{d} = (P_{atm} − P_{v})/ρg + z_{s} − perdas na sucção. Com a água quente, P_{v} é alta: é preciso **ganhar carga na sucção** — tanque mais alto (bomba afogada), tubulação de sucção curta e larga. Fechar a válvula também reduz o NPSH requerido, mas sacrifica a vazão.',
        },
        {
          kind: 'predict',
          setup: { temp: 25, valve: 60 },
          prompt: 'Tudo certo com água a 25 °C. Se a água da sucção **esquentar para 80 °C**, o NPSH **disponível**…',
          change: { temp: 80 },
          options: ['diminui, porque a pressão de vapor aumenta', 'aumenta, porque a água quente é menos densa', 'não muda: depende só da geometria da instalação', 'aumenta, porque a viscosidade cai'],
          answer: 0,
          expect: [{ out: 'npshd', trend: 'down' }],
          why: 'NPSH_{d} = (P_{atm} − **P_{v}**)/ρg + z_{s} − perdas. A pressão de vapor sobe muito com a temperatura (a 80 °C já vale ~4,8 m de coluna d’água): sobra menos folga até a água ferver na entrada do rotor — aqui a bomba até começa a cavitar.',
        },
        {
          kind: 'predict',
          setup: { valve: 60 },
          prompt: 'A bomba vai partir **sem escorva** (carcaça cheia de ar). O que acontece?',
          change: { primed: 0 },
          options: ['Bombeia normalmente, só que com mais barulho', 'O rotor gira, mas a pressão gerada é desprezível: não succiona', 'Bombeia com metade da vazão', 'Cavita e para em seguida'],
          answer: 1,
          expect: [{ out: 'Q', trend: 'down' }],
          why: 'A pressão gerada é **ρ·g·H**: com ar (ρ cerca de 800 vezes menor que a da água) ela é minúscula e não puxa a água do tanque. Bombas centrífugas comuns **não são autoescorvantes**: encha a carcaça e a sucção antes de partir.',
        },
        {
          kind: 'predict',
          setup: { valve: 100 },
          prompt: 'Por que se costuma **partir uma bomba centrífuga radial com a válvula de descarga fechada**? Responda e veja a bancada fechar a válvula: observe a potência.',
          change: { valve: 0 },
          options: ['Porque a potência absorvida é mínima com vazão nula', 'Porque a altura é mínima em shutoff', 'Porque assim se evita a cavitação permanente', 'Porque o rendimento é máximo em shutoff'],
          answer: 0,
          expect: [{ out: 'P', trend: 'down' }],
          why: 'Na bomba **radial**, a potência cresce com a vazão: em shutoff ela é mínima, o que alivia a partida do motor. Depois abre-se a válvula aos poucos — e não se deixa a bomba muito tempo fechada (a água aquece). Nas bombas **axiais** é o contrário.',
        },
      ],
    },
  ],
});
