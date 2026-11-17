import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

const SQ3 = Math.sqrt(3);
/** Rotações síncronas em 60 Hz e 50 Hz (para listar nas resoluções). */
const syncList = (f: number) => [2, 4, 6, 8, 10, 12].map((p) => `${p} polos → ${fmt((120 * f) / p, 0)}`).join('; ');

export default defineTopic({
  id: 'mec.motores-eletricos',
  name: 'Motores elétricos: campo girante, escorregamento e placa',
  summary:
    'Os tipos de motores elétricos, o campo girante e a rotação síncrona (n_{s} = 120·f/p), o escorregamento, a curva conjugado × rotação, as potências ativa, reativa e aparente e o fator de potência, a placa e as ligações estrela e triângulo, os métodos de partida e o inversor de frequência, as perdas e o rendimento.',
  order: 7,
  weight: 3,
  equipment: 'motor',
  edital: ['b3.eletrotecnica'],
  lesson: [
    {
      title: 'Tipos de motores elétricos',
      hot: 'Classificação **CC × CA** em afirmativas (Transpetro 2011): a rede das concessionárias é **CA**; o motor de arranque, alimentado pela bateria, é **CC**; os de CA podem ser monofásicos ou trifásicos, e os trifásicos, síncronos ou assíncronos.',
      body: 'O motor elétrico transforma energia **elétrica** em **mecânica** (o gerador faz o contrário). A classificação que a banca cobra:\n- **corrente contínua (CC):** precisa de fonte CC ou de um retificador; tem **comutador e escovas** (manutenção) e custa mais, mas a velocidade se controla fácil pela tensão. Exemplo: o **motor de arranque** do carro, alimentado pela bateria;\n- **corrente alternada (CA)**, a que as concessionárias entregam, que pode ser **monofásica** ou **trifásica**;\n- **monofásicos:** residências e pequenas potências (até ~12,5 cv); precisam de um **enrolamento auxiliar** (em geral com capacitor) para criar o campo que gira e partir;\n- **trifásicos síncronos:** giram **exatamente** na rotação síncrona, com qualquer carga; o rotor é excitado em CC; usados em **grandes potências** com rotação constante e para **corrigir o fator de potência**;\n- **trifásicos assíncronos (de indução):** giram um pouco **abaixo** da rotação síncrona; **simples, robustos e baratos** — os mais usados na indústria (bombas, compressores, ventiladores, esteiras).\n\nO rotor do motor de indução pode ser de **gaiola de esquilo** (barras em curto por dois anéis, sem nenhum contato elétrico com o lado de fora — o mais comum) ou **bobinado** (enrolamento trifásico com anéis e escovas, para pôr resistências na partida).',
      example: 'Bomba centrífuga de uma refinaria: motor de **indução** trifásico, rotor de gaiola, 4 polos, ligado à rede. Motor de arranque de um caminhão: motor **CC série**, alimentado pela bateria.',
      tip: 'Indução = **assíncrono** = gira **abaixo** do campo. Síncrono = gira **junto** com o campo.',
      trap: 'Dizer que a rede das concessionárias é de corrente contínua, ou que o motor síncrono é próprio para pequenas potências com rotação variável. É o contrário: a rede é CA, e o síncrono roda em rotação fixa e brilha nas grandes potências.',
      lab: { lab: 'motor', preset: { maq: 0, poles: 1, f: 60, load: 100 }, label: 'Ver o motor de indução' },
    },
    {
      title: 'Campo girante e rotação síncrona',
      hot: '**n_{s} = 120·f/p** com o número de polos dado em **pares** (Petrobras 2012): dois pares = 4 polos. Os enrolamentos de fase ficam a **120°** (Petrobras 2018).',
      body: 'O estator do motor trifásico tem **três enrolamentos defasados de 120°** no espaço. Alimentados por correntes também **defasadas de 120° no tempo**, eles formam juntos um campo magnético de intensidade constante que **gira** — o **campo girante** — sem nenhuma peça se mover.\n\nA rotação desse campo é a **rotação síncrona**:\n\n**n_{s} = 120·f/p** (rpm), com f em Hz e p = número de **polos** (não de pares).\n- 60 Hz: 2 polos → 3.600 rpm; 4 → 1.800; 6 → 1.200; 8 → 900; 10 → 720; 12 → 600;\n- 50 Hz: 2 polos → 3.000 rpm; 4 → 1.500; 6 → 1.000; 8 → 750.\n\nMais polos, campo mais lento — e motor maior, com mais conjugado para a mesma potência.\n\nPara **inverter o sentido** de giro de um motor trifásico, basta **trocar duas fases** da alimentação: a sequência das correntes se inverte e o campo passa a girar ao contrário.',
      example: 'Motor de 6 polos em 60 Hz: n_{s} = 120 × 60/6 = **1.200 rpm**. Se o enunciado disser "dois pares de polos", p = 4 → **1.800 rpm**.',
      tip: '**120·f/p** vale para motor e para gerador. Para achar os polos: p = 120·f/n.',
      trap: 'Usar o número de **pares** de polos na fórmula com 120 (dá o dobro da rotação), ou trocar as três fases em rodízio para inverter o sentido — o rodízio mantém a sequência e o motor gira igual.',
      lab: { lab: 'motor', preset: { maq: 0, poles: 3, f: 60, load: 100 }, label: 'Mudar os polos' },
    },
    {
      title: 'Escorregamento: por que o rotor fica para trás',
      hot: 'Afirmativas sobre o motor de indução (Petrobras 2018): **não** há escorregamento se o rotor gira com o campo (não haveria conjugado); mais carga pede **mais** conjugado; o conjugado nasce da interação do campo do rotor com o campo girante.',
      body: 'No motor de indução o rotor **não recebe corrente por fios**: o campo girante corta as barras do rotor, **induz** tensão nelas (lei de Faraday) e, como as barras estão em curto, circula corrente. Essa corrente, dentro do campo, sofre força (F = B·I·l) e o rotor é arrastado no sentido do campo.\n\nSe o rotor alcançasse o campo, não haveria **movimento relativo** — nem tensão induzida, nem corrente, nem conjugado. Por isso ele gira sempre um pouco **abaixo** da rotação síncrona. A diferença é o **escorregamento**:\n\n**s = (n_{s} − n)/n_{s}**\n- a vazio: s menor que 0,5 % (o rotor quase alcança o campo);\n- com a carga nominal: s de 2 a 5 % (motores pequenos escorregam mais);\n- na partida (rotor parado): s = 1 (100 %).\n\nAs correntes no rotor têm frequência **f_{r} = s·f** (1 a 3 Hz com a carga nominal). Mais carga → mais escorregamento → mais corrente induzida → mais conjugado.',
      example: 'Motor de 4 polos, 60 Hz, girando a 1.746 rpm: n_{s} = 1.800 rpm; s = (1.800 − 1.746)/1.800 = **3 %**; f_{r} = 0,03 × 60 = 1,8 Hz.',
      tip: 'Sem escorregamento não há indução — é isso que o nome "motor de indução" esconde.',
      trap: 'Dizer que há escorregamento quando o rotor gira na velocidade do campo (é justamente quando ele é zero), ou que mais carga exige menos conjugado.',
      lab: { lab: 'motor', preset: { maq: 0, poles: 1, f: 60, load: 0 }, label: 'Tirar a carga' },
    },
    {
      title: 'Conjugado × rotação',
      body: 'A curva conjugado × rotação do motor de indução tem três pontos que a banca cita:\n- **conjugado de partida** (rotor parado, s = 1): em geral 1,5 a 2,5 vezes o nominal;\n- **conjugado máximo**, perto de 75 a 85 % da rotação síncrona: 2 a 3 vezes o nominal;\n- o trecho de **operação**, quase reto, entre o máximo e a rotação síncrona, onde o conjugado cai a zero.\n\nO motor trabalha onde o **conjugado do motor = conjugado da carga**. Se a carga sobe, ele desacelera um pouco e o escorregamento cresce até equilibrar. Se a carga passar do **conjugado máximo**, o motor **tomba**: para e fica puxando a corrente de partida — quem salva o enrolamento é o **relé térmico** (de sobrecarga).\n\nA potência no eixo é **P = T·ω**. Com kW e rpm: **T (N·m) = 9.550·P/n**. Para a mesma potência, o motor mais lento (mais polos) entrega mais conjugado.',
      example: '7,5 kW a 1.750 rpm: T = 9.550 × 7,5/1.750 ≈ **41 N·m**. Um motor de 7,5 kW e 8 polos (875 rpm) entrega ≈ 82 N·m.',
      tip: 'O conjugado de partida precisa vencer a carga parada; o máximo mostra até onde o motor aguenta uma sobrecarga passageira.',
      trap: 'Achar que a corrente cai quando o motor tomba. Parado, ele puxa a corrente de partida (6 a 8 vezes a nominal) e queima se a proteção não desligar.',
      lab: { lab: 'motor', preset: { maq: 0, poles: 1, f: 60, load: 250 }, label: 'Carga até tombar' },
    },
    {
      title: 'Potências e fator de potência',
      hot: 'Ativa P (trabalho e calor), reativa Q (magnetização) e aparente S do motor de indução: **cos φ = P/S** e S² = P² + Q² (Petrobras 2014).',
      body: 'Além da potência que vira trabalho, o motor de indução precisa de potência para **magnetizar** o ferro. São três:\n- **ativa (P, em W):** vira trabalho no eixo e perdas (calor);\n- **reativa (Q, em var):** a da magnetização — vai e volta entre a rede e o campo, sem produzir trabalho;\n- **aparente (S, em VA):** o produto tensão × corrente que a rede precisa fornecer.\n\nElas formam o **triângulo de potências**: **S² = P² + Q²**, e o **fator de potência** é **cos φ = P/S** (φ é a defasagem entre tensão e corrente). No trifásico, com valores de linha: **S = √3·V_{L}·I_{L}**, **P = √3·V_{L}·I_{L}·cos φ**, **Q = √3·V_{L}·I_{L}·sen φ**.\n- no motor (carga indutiva), a corrente fica **atrasada** da tensão;\n- motor **a vazio** ou com pouca carga tem cos φ **baixo** (quase só magnetiza): motor superdimensionado derruba o fator de potência da instalação;\n- **capacitores em paralelo** fornecem a reativa no lugar da rede: o cos φ visto pela rede sobe e a **corrente na rede cai**, com a mesma potência ativa.',
      example: 'Motor que consome P = 8 kW com cos φ = 0,8: S = 8/0,8 = **10 kVA**; Q = √(10² − 8²) = **6 kvar**. Em 380 V: I = 10.000/(√3 × 380) ≈ **15,2 A**.',
      tip: 'Triângulo 3-4-5: cos φ = 0,8 ↔ Q, P e S proporcionais a 3, 4 e 5.',
      trap: 'Somar P + Q para achar S, ou esquecer o √3 na potência trifásica escrita com a tensão de linha.',
      lab: { lab: 'motor', preset: { maq: 0, poles: 1, f: 60, load: 25, cap: 0 }, label: 'Fator de potência e capacitores' },
    },
    {
      title: 'Placa do motor: estrela ou triângulo?',
      hot: 'Ler a placa: tensão e corrente na ligação certa — **triângulo** na tensão menor, **estrela** na maior (Transpetro 2012) — e o que ela informa sobre fases, frequência, potência e rotação (Petrobras 2012).',
      body: 'A placa diz como ligar o motor. Um motor de **6 terminais** "220/380 V" tem cada bobina feita para **220 V**:\n- na rede de **220 V**: ligue em **triângulo (Δ)** — cada bobina recebe a tensão de linha;\n- na rede de **380 V**: ligue em **estrela (Y)** — cada bobina recebe 380/√3 = 220 V.\n\nA **potência é a mesma** nas duas; a corrente de linha é maior na tensão menor: **I_{220} = √3·I_{380}** (a placa traz as duas, ex.: 24,9/14,4 A). Ligar errado é grave: em Δ na rede de 380 V cada bobina leva 380 V — o ferro satura e o motor **queima**; em Y na rede de 220 V cada bobina leva só 127 V — o conjugado cai para **1/3**.\n\nMotores de **12 terminais** aceitam quatro tensões (220/380/440/760 V). Outros dados da placa:\n- **fator de serviço (FS):** sobrecarga contínua admissível (FS 1,15 = 15 %);\n- **classe de isolamento:** temperatura máxima — A 105 °C, E 120 °C, B 130 °C, **F 155 °C**, H 180 °C;\n- **grau de proteção IP:** 1º algarismo = sólidos (0 a 6), 2º = água (0 a 8); IP55 = protegido contra poeira e jatos de água;\n- **Ip/In:** corrente de partida ÷ corrente nominal; **regime S1:** contínuo.',
      example: 'Placa "220/380 V · 24,9/14,4 A" numa rede de 380 V: ligação em **estrela**, com **14,4 A** de corrente de linha na carga nominal.',
      tip: 'Tensão **menor** da placa ↔ **triângulo**; tensão **maior** ↔ **estrela**. E 380/220 = √3 ≈ 1,73.',
      trap: 'Achar que o motor entrega menos potência ligado em estrela na rede certa. Ligado corretamente, ele dá a mesma potência nas duas tensões; só a corrente de linha muda.',
      lab: { lab: 'motor', preset: { maq: 0, poles: 1, f: 60, rede: 1, lig: 1, load: 100 }, label: 'Rede de 380 V em estrela' },
    },
    {
      title: 'Partida e inversor de frequência',
      body: 'Na **partida direta**, o motor puxa de **6 a 8 vezes** a corrente nominal: queda de tensão na rede, cabos e contatores maiores. Para reduzir:\n- **estrela-triângulo:** parte em Y (cada bobina com V/√3) e passa para Δ perto de **90 % da rotação**. Corrente e conjugado de partida caem para **1/3**. Exige motor de 6 terminais com a **tensão de triângulo igual à da rede** e partida **em vazio ou com carga leve**; é barata e não limita o número de manobras;\n- **chave compensadora (autotransformador):** taps de 50, 65 e 80 % da tensão; permite partir **com carga**; é mais cara e volumosa;\n- **soft-starter:** tiristores sobem a tensão aos poucos — partida suave, sem trancos e sem partes móveis;\n- **inversor de frequência:** retifica a rede (CA → CC) e gera CA de **frequência e tensão variáveis** com transistores IGBT (modulação PWM). Mantendo **V/f constante** até a frequência nominal, o fluxo e o conjugado se mantêm, e a rotação acompanha a frequência (n_{s} = 120·f/p). Dá rampas de aceleração e controle de velocidade — economia em bombas e ventiladores.',
      example: 'Motor com 145 A de partida direta: em estrela-triângulo, a partida fica com ≈ 48 A — mas o conjugado de partida também cai para 1/3, e com carga pesada o motor nem sai do lugar.',
      tip: 'Estrela-triângulo: ÷ 3 na corrente **e** no conjugado. Compensadora: a escolha para partir carregado.',
      trap: 'Usar estrela-triângulo num motor 220/380 V numa rede de 380 V: ele já trabalha em estrela, e em triângulo receberia 380 V por bobina.',
      lab: { lab: 'motor', preset: { maq: 0, poles: 1, f: 60, rede: 0, lig: 0, load: 30 }, label: 'Testar as partidas' },
    },
    {
      title: 'Perdas e rendimento',
      body: 'Da rede até o eixo, a potência perde pelo caminho:\n- **cobre do estator:** R·I² nos enrolamentos;\n- **ferro (núcleo):** **histerese** e **correntes parasitas (de Foucault)** — por isso o núcleo é de **chapas finas de aço-silício**, isoladas entre si;\n- **cobre do rotor:** igual a **s × a potência que passa para o rotor** — mais escorregamento, mais perda;\n- **atrito e ventilação**, que crescem com a rotação;\n- perdas suplementares.\n\n**Rendimento: η = P_{eixo}/P_{entrada}** (motores de média potência: 85 a 95 %). Ele é baixo com pouca carga e máximo perto da carga nominal. As perdas viram calor, que o ventilador do próprio motor leva embora — e a classe de isolamento limita.',
      example: 'Motor que entrega 7,5 kW no eixo puxando 8,3 kW da rede: η = 7,5/8,3 ≈ **90 %**; os 0,8 kW de perdas aquecem o motor.',
      tip: 'Ferro → chapas laminadas; cobre → corrente; rotor → escorregamento.',
      trap: 'Confundir as perdas por histerese e correntes parasitas (no ferro) com as perdas por efeito Joule nos enrolamentos (no cobre).',
      lab: { lab: 'motor', preset: { maq: 0, poles: 1, f: 60, load: 100 }, label: 'Ver o rendimento' },
    },
  ],
  roteiros: [
    {
      id: 'rotacao-motor',
      name: 'Rotação síncrona, polos e escorregamento',
      when: 'Motor de indução com frequência, polos ou rotação de placa; pedem a rotação síncrona, os polos ou o escorregamento.',
      steps: [
        'Rotação síncrona: n_{s} = 120·f/p (p = polos, não pares).',
        'O eixo gira um pouco abaixo: s = (n_{s} − n)/n_{s}, tipicamente de 2 a 5 % com carga.',
        'Calcule — ou, pela placa, ache a síncrona logo acima da rotação dada.',
      ],
      note: '60 Hz: 3.600 / 1.800 / 1.200 / 900 rpm para 2 / 4 / 6 / 8 polos. Mais carga → mais escorregamento.',
    },
    {
      id: 'torque-motor',
      name: 'Conjugado no eixo (T = P/ω)',
      when: 'Motor com potência e rotação; pedem o conjugado, ou o efeito de mudar a rotação.',
      steps: [
        'ω = 2π·n/60, com a rotação real do eixo.',
        'T = P/ω, com P em W.',
        'Confira com o atalho T ≈ 9.550·P(kW)/n(rpm).',
      ],
      note: 'Mesma potência, rotação menor → conjugado maior.',
    },
    {
      id: 'potencia-eletrica',
      name: 'Potências ativa, reativa e aparente',
      when: 'Motor ou instalação com potência, fator de potência e tensão; pedem S, Q, a corrente de linha ou o banco de capacitores.',
      steps: [
        'Potência que entra = potência no eixo ÷ rendimento (se o dado for a do eixo).',
        'Triângulo: S = P/cos φ; Q = √(S² − P²) = P·tg φ. Trifásico: P = √3·V·I·cos φ.',
        'Isole a incógnita; banco de capacitores: Q_{c} = P·(tg φ₁ − tg φ₂).',
      ],
      note: 'cos φ = 0,8 → triângulo 3-4-5 (P = 4, Q = 3, S = 5). Capacitor em paralelo: mesma P, menos corrente na rede.',
    },
    {
      id: 'ligacao-partida',
      name: 'Ligação estrela/triângulo e partida',
      when: 'Placa com duas tensões (220/380, 380/660 V); pedem a ligação, a corrente ou a partida estrela-triângulo.',
      steps: [
        'A tensão de cada bobina é a **menor** da placa (a de triângulo).',
        'Rede = menor tensão → triângulo; rede = maior (√3 × menor) → estrela. A corrente de linha é maior em triângulo.',
        'Estrela-triângulo só serve se a rede tiver a tensão de **triângulo**: parte em estrela, com corrente e conjugado a 1/3.',
      ],
      note: 'Estrela-triângulo: corrente e conjugado ÷ 3 — para partidas leves (bomba com válvula fechada, ventilador).',
    },
  ],
  questions: [
    {
      id: 'mec-mot-01',
      type: 'gen',
      difficulty: 1,
      lessonRef: 1,
      title: 'Rotação síncrona',
      roteiro: 'rotacao-motor',
      generate(rng) {
        const f = pickOne(rng, [50, 60]);
        const p = pickOne(rng, [2, 4, 6, 8, 10, 12]);
        const pairs = rng() < 0.4;
        const ns = (120 * f) / p;
        const desc = pairs ? `${p / 2} ${p === 2 ? 'par' : 'pares'} de polos` : `${p} polos`;
        const { options, answer } = numericOptions({
          correct: ns,
          unit: 'rpm',
          digits: 0,
          correctWhy: `n_{s} = 120·f/p = 120 × ${f}/${p} = ${fmt(ns, 0)} rpm.`,
          distractors: [
            { value: (120 * f) / (p / 2), why: pairs ? 'Usou o número de pares de polos na fórmula com 120: nela, p é o número de polos.' : 'Dividiu pelo número de pares de polos em vez do número de polos.' },
            { value: (60 * f) / p, why: 'Usou 60 em vez de 120: com p = número de polos, n_{s} = 120·f/p.' },
            { value: Math.round(ns * 0.97), why: 'Essa seria a rotação do eixo com 3 % de escorregamento; a pergunta é a do campo girante.' },
            { value: (120 * p) / f, why: 'Inverteu a fórmula: a frequência vai no numerador.' },
          ],
        });
        return {
          prompt: `Um motor de indução trifásico de ${desc} é alimentado por uma rede de ${f} Hz. A rotação síncrona do seu campo girante é`,
          options,
          answer,
          hint: 'n_{s} = 120·f/p, com p = número de polos (não de pares).',
          steps: [
            `${pairs ? `${p / 2} ${p === 2 ? 'par' : 'pares'} de polos = ${p} polos` : `${p} polos`}; f = ${f} Hz.`,
            `n_{s} = 120 × ${f}/${p}.`,
            `n_{s} = **${fmt(ns, 0)} rpm** (o rotor gira um pouco abaixo).`,
          ],
          explanation: `${pairs ? `${p / 2} ${p === 2 ? 'par' : 'pares'} de polos = ${p} polos. ` : ''}n_{s} = 120·f/p = 120 × ${f}/${p} = **${fmt(ns, 0)} rpm**. O rotor de um motor de indução gira um pouco abaixo disso.`,
        };
      },
    },
    {
      id: 'mec-mot-02',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Polos pela rotação da placa',
      roteiro: 'rotacao-motor',
      generate(rng) {
        const f = pickOne(rng, [60, 60, 50]);
        const p = pickOne(rng, [2, 4, 6, 8]);
        const s = pickOne(rng, [0.02, 0.025, 0.03, 0.035, 0.04]);
        const ns = (120 * f) / p;
        const n = Math.round((ns * (1 - s)) / 5) * 5;
        const sPct = ((ns - n) / ns) * 100;
        // outros números de polos, cada um com o erro que leva a ele
        const others = [p / 2, p + 2, p - 2, 2 * p, 12, 10, 8, 6, 4, 2].filter((q, i, a) => q >= 2 && q % 2 === 0 && q !== p && a.indexOf(q) === i);
        const distractors = others.map((q) => ({
          value: q,
          why:
            q === p / 2
              ? 'Esse é o número de **pares** de polos.'
              : q > p
                ? `Com ${q} polos o campo giraria a ${fmt((120 * f) / q, 0)} rpm, abaixo da rotação do eixo — impossível num motor de indução.`
                : `Com ${q} polos o campo giraria a ${fmt((120 * f) / q, 0)} rpm: o escorregamento seria grande demais para um motor em carga nominal.`,
        }));
        const { options, answer } = numericOptions({
          correct: p,
          unit: 'polos',
          digits: 0,
          correctWhy: `A síncrona logo acima de ${fmt(n, 0)} rpm é ${fmt(ns, 0)} rpm → p = 120 × ${f}/${fmt(ns, 0)} = ${p} polos.`,
          distractors,
        });
        return {
          prompt: `A placa de um motor de indução trifásico de ${f} Hz indica ${fmt(n, 0)} rpm. Esse motor tem`,
          options,
          answer,
          hint: 'A rotação da placa é com carga, um pouco abaixo da rotação síncrona. Procure a síncrona logo acima dela.',
          steps: [
            `Em ${f} Hz, as síncronas possíveis são ${syncList(f)} rpm.`,
            `A placa (${fmt(n, 0)} rpm) é com carga: um pouco abaixo da síncrona.`,
            `A primeira síncrona acima é ${fmt(ns, 0)} rpm → **${p} polos** (s ≈ ${fmt(sPct, 1)} %).`,
          ],
          explanation: `A placa traz a rotação com carga nominal, alguns por cento abaixo da síncrona. Em ${f} Hz: ${syncList(f)} rpm. A primeira acima de ${fmt(n, 0)} rpm é **${fmt(ns, 0)} rpm**, de **${p} polos** — escorregamento de ${fmt(sPct, 1)} %.`,
        };
      },
    },
    {
      id: 'mec-mot-03',
      type: 'gen',
      difficulty: 1,
      lessonRef: 2,
      title: 'Escorregamento',
      roteiro: 'rotacao-motor',
      generate(rng) {
        const f = pickOne(rng, [60, 60, 50]);
        const p = pickOne(rng, [2, 4, 6, 8]);
        const s0 = pickOne(rng, [0.02, 0.025, 0.03, 0.04, 0.05]);
        const ns = (120 * f) / p;
        const n = Math.round(ns * (1 - s0));
        const s = ((ns - n) / ns) * 100;
        const { options, answer } = numericOptions({
          correct: s,
          unit: '%',
          digits: 1,
          correctWhy: `s = (${fmt(ns, 0)} − ${fmt(n, 0)})/${fmt(ns, 0)} = ${fmt(s, 1)} %.`,
          distractors: [
            { value: ((ns - n) / n) * 100, why: 'Dividiu pela rotação do eixo: o escorregamento é em relação à rotação síncrona.' },
            { value: (n / ns) * 100, why: 'Calculou n/n_{s}: isso é a fração da rotação síncrona, não o escorregamento.' },
            { value: ((2 * ns - n) / (2 * ns)) * 100, why: 'Calculou a rotação síncrona com o número de pares de polos (dobrou n_{s}).' },
          ],
        });
        return {
          prompt: `Um motor de indução trifásico de ${p} polos, alimentado em ${f} Hz, gira a ${fmt(n, 0)} rpm com a carga nominal. O escorregamento é de`,
          options,
          answer,
          hint: 'Primeiro a rotação síncrona (120·f/p); depois s = (n_{s} − n)/n_{s}.',
          steps: [
            `n_{s} = 120 × ${f}/${p} = ${fmt(ns, 0)} rpm.`,
            `s = (${fmt(ns, 0)} − ${fmt(n, 0)})/${fmt(ns, 0)}.`,
            `s = **${fmt(s, 1)} %** (frequência no rotor: ${fmt((s / 100) * f, 2)} Hz).`,
          ],
          explanation: `n_{s} = 120 × ${f}/${p} = ${fmt(ns, 0)} rpm. s = (n_{s} − n)/n_{s} = (${fmt(ns, 0)} − ${fmt(n, 0)})/${fmt(ns, 0)} = **${fmt(s, 1)} %**. As correntes no rotor têm frequência s·f = ${fmt((s / 100) * f, 2)} Hz.`,
        };
      },
    },
    {
      id: 'mec-mot-04',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Conjugado no eixo',
      roteiro: 'torque-motor',
      generate(rng) {
        const P = pickOne(rng, [3, 5.5, 7.5, 11, 15, 22, 30, 37, 45, 55, 75]);
        const m = pickOne(rng, [
          { n: 3540, ns: 3600 },
          { n: 1760, ns: 1800 },
          { n: 1770, ns: 1800 },
          { n: 1170, ns: 1200 },
          { n: 880, ns: 900 },
        ]);
        const w = (2 * Math.PI * m.n) / 60;
        const T = (P * 1000) / w;
        const { options, answer } = numericOptions({
          correct: T,
          unit: 'N·m',
          digits: 1,
          correctWhy: `T = P/ω = ${fmt(P * 1000, 0)} W ÷ ${fmt(w, 1)} rad/s = ${fmt(T, 1)} N·m.`,
          distractors: [
            { value: (P * 1000) / m.n, why: 'Dividiu watts por rpm: converta a rotação para rad/s (× 2π/60).' },
            { value: (P * 1000 * 60) / (2 * Math.PI * m.ns), why: 'Usou a rotação síncrona; o eixo gira na rotação da placa.' },
            { value: (P * 1000) / (2 * Math.PI * m.n), why: 'Converteu rpm em rad/s sem dividir por 60.' },
            { value: (P * m.n) / 9550, why: 'Multiplicou pela rotação em vez de dividir.' },
          ],
        });
        return {
          prompt: `Um motor de indução de ${fmt(P, 1)} kW gira a ${fmt(m.n, 0)} rpm com a carga nominal. O conjugado no eixo é de aproximadamente`,
          options,
          answer,
          hint: 'P = T·ω, com ω em rad/s (ω = 2π·n/60).',
          steps: [
            `ω = 2π × ${fmt(m.n, 0)}/60 = ${fmt(w, 1)} rad/s.`,
            `T = ${fmt(P * 1000, 0)}/${fmt(w, 1)}.`,
            `T = **${fmt(T, 1)} N·m** (9.550 × ${fmt(P, 1)}/${fmt(m.n, 0)} ≈ ${fmt((9550 * P) / m.n, 1)}).`,
          ],
          explanation: `ω = 2π × ${fmt(m.n, 0)}/60 = ${fmt(w, 1)} rad/s. T = P/ω = ${fmt(P * 1000, 0)}/${fmt(w, 1)} = **${fmt(T, 1)} N·m** — o mesmo que o atalho T = 9.550·P(kW)/n(rpm).`,
        };
      },
    },
    {
      id: 'mec-mot-05',
      type: 'gen',
      difficulty: 2,
      lessonRef: 4,
      title: 'Triângulo de potências',
      roteiro: 'potencia-eletrica',
      generate(rng) {
        const fp = pickOne(rng, [0.6, 0.8]);
        const P = fp === 0.8 ? pickOne(rng, [4, 8, 12, 16, 20, 24, 40, 60, 80]) : pickOne(rng, [6, 12, 18, 24, 30, 36, 60]);
        const S = P / fp;
        const Q = Math.sqrt(S * S - P * P);
        const askS = rng() < 0.5;
        const sin = Math.sqrt(1 - fp * fp);
        const { options, answer } = askS
          ? numericOptions({
              correct: S,
              unit: 'kVA',
              digits: 1,
              correctWhy: `S = P/cos φ = ${P}/${fmt(fp, 1)} = ${fmt(S, 1)} kVA.`,
              distractors: [
                { value: P * fp, why: 'Multiplicou pelo fator de potência em vez de dividir.' },
                { value: P + Q, why: 'Somou P e Q: as potências formam um triângulo retângulo (S² = P² + Q²).' },
                { value: Q, why: 'Essa é a potência reativa, em kvar.' },
                { value: P / sin, why: 'Dividiu por sen φ: o fator de potência é o cosseno.' },
              ],
            })
          : numericOptions({
              correct: Q,
              unit: 'kvar',
              digits: 1,
              correctWhy: `S = ${P}/${fmt(fp, 1)} = ${fmt(S, 1)} kVA; Q = √(S² − P²) = ${fmt(Q, 1)} kvar.`,
              distractors: [
                { value: S, why: 'Essa é a potência aparente, em kVA.' },
                { value: S - P, why: 'Subtraiu S − P: as potências não se somam direto, S² = P² + Q².' },
                { value: P * fp, why: 'Multiplicou P pelo fator de potência.' },
                { value: P / Math.max(0.01, Q / P), why: 'Dividiu P pela tangente em vez de multiplicar: Q = P·tg φ.' },
              ],
            });
        return {
          prompt: `Um motor de indução consome ${P} kW de potência ativa com fator de potência ${fmt(fp, 1)} (indutivo). A potência ${askS ? 'aparente' : 'reativa'} é de`,
          options,
          answer,
          hint: 'cos φ = P/S e S² = P² + Q².',
          steps: [
            `A potência dada já é a ativa: P = ${P} kW (cos φ = ${fmt(fp, 1)}).`,
            `S = ${P}/${fmt(fp, 1)} = ${fmt(S, 1)} kVA; Q = √(${fmt(S * S, 0)} − ${fmt(P * P, 0)}) = ${fmt(Q, 1)} kvar.`,
            `Pedido: **${askS ? `${fmt(S, 1)} kVA` : `${fmt(Q, 1)} kvar`}** (${askS ? 'aparente' : 'reativa'}).`,
          ],
          explanation: `S = P/cos φ = ${P}/${fmt(fp, 1)} = **${fmt(S, 1)} kVA**; Q = √(S² − P²) = √(${fmt(S * S, 0)} − ${fmt(P * P, 0)}) = **${fmt(Q, 1)} kvar** (o triângulo 3-4-5).`,
        };
      },
    },
    {
      id: 'mec-mot-06',
      type: 'gen',
      difficulty: 3,
      lessonRef: 4,
      title: 'Corrente de linha do motor',
      roteiro: 'potencia-eletrica',
      generate(rng) {
        const P = pickOne(rng, [7.5, 11, 15, 22, 30, 37, 45, 55, 75]);
        const eta = pickOne(rng, [0.88, 0.9, 0.91, 0.92, 0.94]);
        const fp = pickOne(rng, [0.8, 0.82, 0.85, 0.86, 0.88]);
        const V = pickOne(rng, [220, 380, 440]);
        const Pin = (P * 1000) / eta;
        const I = Pin / (SQ3 * V * fp);
        const { options, answer } = numericOptions({
          correct: I,
          unit: 'A',
          digits: 1,
          correctWhy: `P_{entrada} = ${fmt(P, 1)}/${fmt(eta, 2)} = ${fmt(Pin / 1000, 2)} kW; I = P/(√3·V·cos φ) = ${fmt(I, 1)} A.`,
          distractors: [
            { value: Pin / (V * fp), why: 'Esqueceu o √3 da potência trifásica com a tensão de linha.' },
            { value: (P * 1000) / (SQ3 * V * fp), why: 'Usou a potência do eixo: a rede fornece também as perdas — divida pelo rendimento.' },
            { value: Pin / (SQ3 * V), why: 'Esqueceu o fator de potência: S = P/cos φ.' },
            { value: Pin / (3 * V * fp), why: 'Usou 3 em vez de √3 com a tensão de linha.' },
          ],
        });
        return {
          prompt: `Um motor trifásico entrega ${fmt(P, 1)} kW no eixo, com rendimento de ${fmt(eta * 100, 0)} % e fator de potência ${fmt(fp, 2)}, ligado a uma rede de ${V} V (tensão de linha). A corrente de linha é de aproximadamente`,
          options,
          answer,
          hint: 'Primeiro a potência que entra (P/η); depois P_{entrada} = √3·V·I·cos φ.',
          steps: [
            `P_{entrada} = ${fmt(P, 1)}/${fmt(eta, 2)} = ${fmt(Pin / 1000, 2)} kW.`,
            `P = √3·V·I·cos φ → I = ${fmt(Pin, 0)}/(1,732 × ${V} × ${fmt(fp, 2)}).`,
            `I = **${fmt(I, 1)} A**.`,
          ],
          explanation: `Potência absorvida: ${fmt(P, 1)}/${fmt(eta, 2)} = ${fmt(Pin / 1000, 2)} kW. I = P_{entrada}/(√3·V·cos φ) = ${fmt(Pin, 0)}/(1,732 × ${V} × ${fmt(fp, 2)}) = **${fmt(I, 1)} A**.`,
        };
      },
    },
    {
      id: 'mec-mot-07',
      type: 'gen',
      difficulty: 3,
      lessonRef: 4,
      title: 'Banco de capacitores',
      roteiro: 'potencia-eletrica',
      generate(rng) {
        const P = pickOne(rng, [24, 48, 60, 96, 120, 240]);
        const c = pickOne(rng, [
          { a: 0.6, b: 0.8 },
          { a: 0.8, b: 1 },
          { a: 0.6, b: 1 },
        ]);
        const tg = (x: number) => Math.sqrt(1 - x * x) / x;
        const Q1 = P * tg(c.a);
        const Q2 = P * tg(c.b);
        const Qc = Q1 - Q2;
        const distractors = [
          { value: P / c.a - P / c.b, why: 'Subtraiu as potências aparentes: o capacitor fornece potência reativa, Q_{c} = P·(tg φ_{1} − tg φ_{2}).' },
          { value: P * (Math.sqrt(1 - c.a * c.a) - Math.sqrt(1 - c.b * c.b)), why: 'Usou senos em vez de tangentes: Q = P·tg φ.' },
          { value: P * (c.b - c.a), why: 'Multiplicou P pela diferença dos fatores de potência.' },
        ];
        if (c.b < 1) distractors.unshift({ value: Q1, why: 'Essa é toda a reativa inicial: só zeraria com fator de potência 1.' });
        const { options, answer } = numericOptions({
          correct: Qc,
          unit: 'kvar',
          digits: 0,
          correctWhy: `Q_{1} = ${P} × ${fmt(tg(c.a), 3)} = ${fmt(Q1, 0)} kvar; Q_{2} = ${P} × ${fmt(tg(c.b), 3)} = ${fmt(Q2, 0)} kvar; Q_{c} = ${fmt(Qc, 0)} kvar.`,
          distractors: distractors.filter((d) => d.value >= 0.5),
        });
        return {
          prompt: `Uma instalação industrial consome ${P} kW com fator de potência ${fmt(c.a, 1)} (indutivo). Para elevar o fator de potência para ${fmt(c.b, 1)}, sem mudar a potência ativa, o banco de capacitores deve fornecer`,
          options,
          answer,
          hint: 'Q = P·tg φ antes e depois; o capacitor fornece a diferença.',
          steps: [
            `A potência ativa (${P} kW) não muda.`,
            `Q₁ = ${P} × ${fmt(tg(c.a), 3)} = ${fmt(Q1, 0)} kvar; Q₂ = ${P} × ${fmt(tg(c.b), 3)} = ${fmt(Q2, 0)} kvar.`,
            `Banco: Q_{c} = ${fmt(Q1, 0)} − ${fmt(Q2, 0)} = **${fmt(Qc, 0)} kvar**.`,
          ],
          explanation: `tg φ_{1} = ${fmt(tg(c.a), 3)} → Q_{1} = ${fmt(Q1, 0)} kvar. tg φ_{2} = ${fmt(tg(c.b), 3)} → Q_{2} = ${fmt(Q2, 0)} kvar. O banco fornece Q_{c} = Q_{1} − Q_{2} = **${fmt(Qc, 0)} kvar**, e a rede passa a entregar só o resto.`,
        };
      },
    },
    {
      id: 'mec-mot-08',
      difficulty: 2,
      lessonRef: 0,
      source: 'Autoral',
      prompt:
        'Considere as afirmações sobre motores elétricos.\n\nI – Os motores de corrente contínua precisam de uma fonte CC ou de um retificador e têm comutador e escovas, que exigem manutenção.\nII – Os motores de indução trifásicos giram exatamente na rotação síncrona quando estão com a carga nominal.\nIII – Os motores síncronos trifásicos mantêm a rotação constante qualquer que seja a carga e podem ser usados para corrigir o fator de potência de uma instalação.\n\nEstá correto o que se afirma em',
      options: [
        { text: 'I, apenas.', why: 'A III também está certa.' },
        { text: 'II, apenas.', why: 'A II está errada: o motor de indução sempre gira abaixo da síncrona (escorregamento).' },
        { text: 'I e III, apenas.', why: 'Correta.' },
        { text: 'II e III, apenas.', why: 'A II está errada.' },
        { text: 'I, II e III.', why: 'A II está errada.' },
      ],
      answer: 2,
      shuffle: false,
      roteiro: 'fmt.afirmativas',
      steps: [
        'I – **Correta**: CC precisa de fonte contínua, e o comutador com escovas desgasta.',
        'II – **Errada**: sem escorregamento não há indução nem conjugado; com carga nominal, s fica entre 2 e 5 %.',
        'III – **Correta**: o síncrono gira preso à frequência e, sobre-excitado, fornece reativa.',
        'Certas: I e III → "I e III, apenas".',
      ],
      explanation:
        'I – certa: CC precisa de fonte contínua, e o comutador com escovas desgasta. II – errada: sem escorregamento não há indução nem conjugado; com carga nominal, s fica entre 2 e 5 %. III – certa: o síncrono gira preso à frequência e, sobre-excitado, fornece reativa (melhora o fator de potência).',
    },
    {
      id: 'mec-mot-09',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'No motor de indução trifásico com rotor de gaiola, a rede elétrica é ligada',
      options: [
        { text: 'apenas ao estator; a corrente do rotor é induzida pelo campo girante.', why: 'Correta: as barras do rotor estão em curto e recebem corrente por indução.' },
        { text: 'apenas ao rotor, por meio de anéis coletores e escovas.', why: 'O rotor de gaiola não tem anéis nem escovas.' },
        { text: 'ao estator e ao rotor, por escovas e comutador.', why: 'Comutador e escovas são da máquina de corrente contínua.' },
        { text: 'ao rotor, enquanto o estator é um ímã permanente.', why: 'Isso descreve um pequeno motor CC, não o de indução.' },
        { text: 'ao estator, e o rotor recebe corrente contínua de uma excitatriz.', why: 'Rotor excitado em CC é o do motor (ou gerador) síncrono.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: onde a rede é ligada no motor de **gaiola**.',
        'Só o estator recebe a rede; o campo girante induz corrente nas barras do rotor, em curto.',
        'Fica **apenas ao estator; a corrente do rotor é induzida**.',
      ],
      explanation: 'No motor de indução, só o **estator** recebe a rede. O campo girante corta as barras do rotor de gaiola (em curto por dois anéis) e **induz** a corrente que, dentro do campo, produz o conjugado. Por isso ele é simples, robusto e quase sem manutenção.',
    },
    {
      id: 'mec-mot-10',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Sobre o funcionamento do motor de indução trifásico, é correto afirmar que',
      options: [
        { text: 'o conjugado nasce da interação entre o campo girante do estator e as correntes induzidas no rotor, o que exige que o rotor gire abaixo da rotação síncrona.', why: 'Correta: sem diferença de rotação não há indução.' },
        { text: 'a vazio, o rotor gira exatamente na rotação síncrona.', why: 'Mesmo a vazio há um pequeno escorregamento, para vencer o atrito e a ventilação.' },
        { text: 'quanto maior a carga, menor o escorregamento, porque o motor puxa mais corrente.', why: 'Ao contrário: mais carga, mais escorregamento — é ele que aumenta a corrente induzida.' },
        { text: 'os enrolamentos das três fases são defasados de 90° entre si no estator.', why: 'No trifásico, a defasagem é de 120°.' },
        { text: 'a frequência das correntes no rotor é igual à da rede, qualquer que seja a rotação.', why: 'Ela vale s·f: só é igual à da rede com o rotor parado.' },
      ],
      answer: 0,
      roteiro: 'rotacao-motor',
      steps: [
        'Campo girante do estator: três fases a 120°, girando na rotação síncrona.',
        'O conjugado vem da corrente induzida no rotor, que exige movimento relativo: o rotor fica abaixo da síncrona, e o escorregamento cresce com a carga.',
        'Fica **o conjugado nasce do campo girante com as correntes induzidas no rotor, que gira abaixo da síncrona**.',
      ],
      explanation: 'As três fases (a 120°) criam o campo girante; ele corta as barras do rotor, induz corrente nelas e a força sobre essas correntes arrasta o rotor. Como a indução depende do **movimento relativo**, o rotor fica sempre um pouco abaixo da rotação síncrona — o escorregamento cresce com a carga.',
    },
    {
      id: 'mec-mot-11',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Depois de uma manutenção, um motor de indução trifásico passou a girar no sentido errado. Para inverter o sentido de rotação, basta',
      options: [
        { text: 'trocar entre si dois dos três fios de fase da alimentação.', why: 'Correta: a sequência de fases se inverte e o campo gira ao contrário.' },
        { text: 'trocar a ligação de triângulo para estrela.', why: 'Isso muda a tensão nas bobinas, não o sentido.' },
        { text: 'inverter os fios do neutro.', why: 'O motor trifásico nem usa o neutro.' },
        { text: 'mudar os três fios de fase de posição, em rodízio (L1 → L2 → L3 → L1).', why: 'O rodízio mantém a mesma sequência: o motor continua no mesmo sentido.' },
        { text: 'reduzir a frequência da alimentação à metade.', why: 'Isso reduz a rotação, não inverte o sentido.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **inverter** o sentido de rotação.',
        'O sentido do campo girante segue a sequência de fases; trocar duas fases inverte a sequência (o rodízio das três não muda nada).',
        'Fica **trocar entre si dois dos três fios de fase**.',
      ],
      explanation: 'O sentido do campo girante segue a **sequência de fases**. Trocando duas fases, a sequência se inverte (L1-L3-L2) e o campo — e o motor — passam a girar ao contrário. Trocar as três em rodízio não muda a sequência.',
    },
    {
      id: 'mec-mot-12',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'A placa de um motor trifásico traz: 15 kW · 220/380 V · 52/30 A · 60 Hz · 1.765 rpm. Ele será instalado numa rede trifásica de 380 V. A ligação e a corrente de linha com carga nominal serão',
      options: [
        { text: 'estrela, com cerca de 30 A.', why: 'Correta: na tensão maior da placa, estrela, e a corrente menor.' },
        { text: 'triângulo, com cerca de 30 A.', why: 'Em triângulo na rede de 380 V cada bobina receberia 380 V e o motor queimaria.' },
        { text: 'estrela, com cerca de 52 A.', why: '52 A é a corrente na rede de 220 V.' },
        { text: 'triângulo, com cerca de 52 A.', why: 'Triângulo é para a rede de 220 V.' },
        { text: 'estrela, com cerca de 17 A (30/√3).', why: 'Os 30 A da placa já são a corrente de linha em 380 V.' },
      ],
      answer: 0,
      roteiro: 'ligacao-partida',
      steps: [
        'Placa 220/380 V: cada bobina é de 220 V.',
        'Rede de 380 V = √3 × 220 → **estrela**, com a menor corrente da placa.',
        'Fica **estrela, com cerca de 30 A**.',
      ],
      explanation: 'Cada bobina é de 220 V. Na rede de **380 V**, a ligação é **estrela** (380/√3 = 220 V por bobina) e a corrente de linha é a menor da placa, **30 A**. Na rede de 220 V seria triângulo, com 52 A (√3 × 30). A potência é a mesma nas duas.',
    },
    {
      id: 'mec-mot-13',
      difficulty: 3,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Um motor de 380/660 V, com 6 terminais, vai ser ligado a uma rede trifásica de 380 V. Sobre a ligação e a partida desse motor, é correto afirmar que ele',
      options: [
        { text: 'trabalha em triângulo e pode partir em estrela-triângulo, porque a tensão de triângulo coincide com a da rede.', why: 'Correta.' },
        { text: 'trabalha em estrela e não pode usar a partida estrela-triângulo.', why: 'Na rede de 380 V, este motor trabalha em triângulo (a tensão menor da placa).' },
        { text: 'trabalha em estrela, e a partida estrela-triângulo reduziria a corrente para 1/√3.', why: 'Ele trabalha em triângulo; e a estrela-triângulo reduz a corrente para 1/3.' },
        { text: 'não pode ser ligado nessa rede, que tem tensão menor que 660 V.', why: '380 V é a tensão de triângulo dele.' },
        { text: 'trabalha em triângulo, mas a partida em estrela queimaria as bobinas por sobretensão.', why: 'Em estrela cada bobina recebe menos tensão (380/√3), não mais.' },
      ],
      answer: 0,
      roteiro: 'ligacao-partida',
      steps: [
        'Placa 380/660 V: cada bobina é de 380 V.',
        'Rede de 380 V = tensão de triângulo → o motor trabalha em **triângulo**.',
        'Como a rede é a de triângulo, ele pode partir em estrela (bobina com 220 V): **triângulo, com partida estrela-triângulo**.',
      ],
      explanation: 'Bobinas de 380 V: na rede de **380 V**, ligação em **triângulo** (660 V seria em estrela). Como a tensão da rede é a de triângulo, ele pode **partir em estrela** (cada bobina com 380/√3 = 220 V, corrente e conjugado ÷ 3) e passar para triângulo — é o caso típico da partida estrela-triângulo em redes de 380 V.',
    },
    {
      id: 'mec-mot-14',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Comparada à partida direta, a partida estrela-triângulo de um motor de indução',
      options: [
        { text: 'reduz a corrente e o conjugado de partida a cerca de 1/3, e por isso é indicada para partidas em vazio ou com carga leve.', why: 'Correta.' },
        { text: 'reduz a corrente de partida a 1/3, mas mantém o conjugado de partida, por isso serve para cargas pesadas.', why: 'O conjugado cai junto (proporcional ao quadrado da tensão).' },
        { text: 'reduz a corrente de partida a 1/√3 e dobra o conjugado de partida.', why: 'Os dois caem a 1/3.' },
        { text: 'só pode ser usada em motores de 3 terminais.', why: 'Exige 6 terminais acessíveis.' },
        { text: 'deve passar para triângulo logo no primeiro instante, antes de o motor acelerar.', why: 'A comutação é perto de 90 % da rotação; antes disso o pico seria quase o da partida direta.' },
      ],
      answer: 0,
      roteiro: 'ligacao-partida',
      steps: [
        'Em estrela, cada bobina recebe V/√3.',
        'A corrente de linha e o conjugado (∝ V²) caem a cerca de 1/3.',
        'Fica **corrente e conjugado a ~1/3, para partidas leves**.',
      ],
      explanation: 'Em estrela, cada bobina recebe V/√3: a corrente de linha cai a **1/3** e o conjugado (∝ V²) também cai a **1/3**. Por isso a estrela-triângulo é para cargas que partem leves (bombas com válvula fechada, ventiladores). Com carga pesada, usa-se a chave compensadora, o soft-starter ou o inversor.',
    },
    {
      id: 'mec-mot-15',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Um inversor de frequência alimenta um motor de 4 polos que aciona uma esteira (conjugado constante). A frequência passa de 60 Hz para 30 Hz, com V/f constante. Desprezando o escorregamento, a rotação e a potência no eixo passam a ser, aproximadamente,',
      options: [
        { text: '900 rpm e metade da potência.', why: 'Correta: n_{s} = 120 × 30/4 = 900 rpm; com o mesmo conjugado, P = T·ω cai à metade.' },
        { text: '900 rpm e a mesma potência.', why: 'Com conjugado constante, a potência acompanha a rotação.' },
        { text: '1.800 rpm e metade da potência.', why: '1.800 rpm é a rotação em 60 Hz.' },
        { text: '450 rpm e um quarto da potência.', why: 'A rotação é proporcional à frequência, não ao quadrado dela.' },
        { text: '3.600 rpm e o dobro da potência.', why: 'Baixar a frequência reduz a rotação.' },
      ],
      answer: 0,
      roteiro: 'torque-motor',
      steps: [
        '30 Hz e 4 polos: n = 120 × 30/4 = 900 rpm (metade de 1.800).',
        'V/f constante mantém o conjugado disponível, e a esteira pede o mesmo conjugado.',
        'P = T·ω com ω pela metade: **900 rpm e metade da potência**.',
      ],
      explanation: 'A rotação acompanha a frequência: 120 × 30/4 = **900 rpm**. Com V/f constante, o fluxo e o conjugado disponível se mantêm; como a esteira pede o mesmo conjugado, a potência P = T·ω cai **à metade** — e a corrente fica quase a mesma.',
    },
    {
      id: 'mec-mot-16',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Numa fábrica com muitos motores de indução, instala-se um banco de capacitores em paralelo com as cargas. Em relação à situação anterior,',
      options: [
        { text: 'a corrente fornecida pela rede diminui e o fator de potência aumenta, com a mesma potência ativa.', why: 'Correta.' },
        { text: 'a potência ativa consumida pelos motores diminui na mesma proporção da corrente.', why: 'Os motores continuam fazendo o mesmo trabalho: a ativa não muda.' },
        { text: 'o fator de potência diminui, porque os capacitores consomem potência reativa.', why: 'Os capacitores fornecem a reativa que os motores consomem.' },
        { text: 'a rotação dos motores aumenta, porque eles recebem mais potência.', why: 'A rotação depende da frequência e da carga.' },
        { text: 'a potência aparente aumenta, porque se somam as reativas dos capacitores e dos motores.', why: 'As reativas se compensam (sinais opostos): a aparente diminui.' },
      ],
      answer: 0,
      roteiro: 'potencia-eletrica',
      steps: [
        'A potência ativa dos motores não muda.',
        'O banco fornece a reativa localmente: Q da rede cai, S cai, e cos φ = P/S sobe.',
        'Fica **a corrente da rede diminui e o fator de potência aumenta, com a mesma potência ativa**.',
      ],
      explanation: 'O capacitor fornece localmente a potência reativa de magnetização. A rede passa a entregar quase só a ativa: S cai, o **cos φ sobe** e a **corrente na rede cai** (menos perdas nos cabos e transformadores). Os motores continuam com a mesma corrente e a mesma potência ativa.',
    },
    {
      id: 'mec-mot-17',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Um motor de indução de 75 kW foi instalado para acionar uma bomba que exige só 15 kW. Comparado a um motor de potência adequada, esse motor superdimensionado',
      options: [
        { text: 'trabalha com fator de potência e rendimento mais baixos, porque a parcela de magnetização pesa mais com pouca carga.', why: 'Correta.' },
        { text: 'trabalha com fator de potência mais alto, porque está folgado.', why: 'Com pouca carga o cos φ cai.' },
        { text: 'consome 75 kW da rede, qualquer que seja a carga.', why: 'A potência ativa consumida acompanha a carga.' },
        { text: 'gira exatamente na rotação síncrona, porque a carga é pequena.', why: 'O escorregamento diminui, mas não zera.' },
        { text: 'não altera o fator de potência da instalação, que depende só da rede.', why: 'O fator de potência depende das cargas.' },
      ],
      answer: 0,
      roteiro: 'potencia-eletrica',
      steps: [
        'Motor de 75 kW com 15 kW de carga (20 %).',
        'A reativa de magnetização quase não muda com a carga: com P pequena, Q pesa mais (cos φ cai); as perdas fixas também pesam mais (rendimento cai).',
        'Fica **fator de potência e rendimento mais baixos**.',
      ],
      explanation: 'A corrente de magnetização (reativa) de um motor grande quase não depende da carga. Com 20 % da carga, a reativa fica grande perto da ativa: **cos φ baixo**; as perdas fixas também pesam mais: **rendimento baixo**. Por isso se dimensiona o motor perto da carga real.',
    },
    {
      id: 'mec-mot-18',
      difficulty: 1,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Na placa de um motor aparecem as indicações "IP55" e "Isol. F". Elas significam, respectivamente,',
      options: [
        { text: 'protegido contra poeira e contra jatos de água; isolamento que suporta até 155 °C.', why: 'Correta.' },
        { text: 'potência de 55 kW; isolamento próprio para 60 Hz.', why: 'IP é o grau de proteção do invólucro.' },
        { text: 'protegido contra imersão contínua; isolamento até 105 °C.', why: 'Imersão contínua é o 2º algarismo 8; 105 °C é a classe A.' },
        { text: 'índice de polaridade 5/5; fator de serviço 1,55.', why: 'IP = Ingress Protection; F é a classe térmica.' },
        { text: 'protegido contra poeira e contra jatos de água; isolamento até 180 °C.', why: '180 °C é a classe H; a F vai até 155 °C.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **IP55** e **classe F**.',
        'IP: 1º algarismo = sólidos (5 = poeira); 2º = água (5 = jatos). Isolamento: A 105, E 120, B 130, F 155, H 180 °C.',
        'Fica **protegido contra poeira e jatos de água; isolamento até 155 °C**.',
      ],
      explanation: '**IP55**: 1º algarismo 5 = protegido contra **poeira**; 2º algarismo 5 = protegido contra **jatos de água**. **Classe F**: o sistema de isolamento suporta até **155 °C** (A 105, E 120, B 130, F 155, H 180 °C).',
    },
    {
      id: 'mec-mot-19',
      type: 'ce',
      difficulty: 1,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'O escorregamento de um motor de indução relaciona a rotação real do eixo com a rotação síncrona do campo girante.',
      answer: true,
      roteiro: 'rotacao-motor',
      steps: [
        'Rotação síncrona = a do campo girante (120·f/p).',
        's = (n_{s} − n)/n_{s}: compara o eixo com o campo.',
        '**Certo**.',
      ],
      explanation: 'Certo. s = (n_{s} − n)/n_{s}: a diferença entre a rotação do campo e a do eixo, em fração da rotação síncrona.',
    },
    {
      id: 'mec-mot-20',
      type: 'ce',
      difficulty: 1,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Quanto maior a carga no eixo de um motor de indução, menor o escorregamento.',
      answer: false,
      roteiro: 'rotacao-motor',
      steps: [
        'Mais carga → o rotor desacelera um pouco.',
        's = (n_{s} − n)/n_{s} cresce → mais corrente induzida → mais conjugado, até igualar a carga.',
        'O escorregamento **aumenta**: **Errado**.',
      ],
      explanation: 'Errado. Mais carga pede mais conjugado; o rotor desacelera um pouco, o escorregamento **cresce** e com ele a corrente induzida, até o conjugado do motor igualar o da carga.',
    },
    {
      id: 'mec-mot-21',
      type: 'ce',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'No estator de um motor trifásico, os enrolamentos das três fases estão deslocados de 120° elétricos entre si.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: enrolamentos a **120°** elétricos.',
        'Três enrolamentos a 120° no espaço, com correntes a 120° no tempo, formam o campo girante.',
        '**Certo**.',
      ],
      explanation: 'Certo. Três enrolamentos a 120° no espaço, com correntes a 120° no tempo, formam o campo girante.',
    },
    {
      id: 'mec-mot-22',
      type: 'ce',
      difficulty: 2,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'O núcleo do estator dos motores é feito de aço maciço para reduzir as perdas por correntes parasitas.',
      answer: false,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: núcleo de aço **maciço**.',
        'Para cortar as correntes parasitas, o núcleo é de chapas finas de aço-silício, isoladas entre si.',
        'Maciço teria perdas enormes: **Errado**.',
      ],
      explanation: 'Errado. O núcleo é de **chapas finas** de aço-silício, isoladas entre si: elas cortam o caminho das correntes parasitas (de Foucault). Um núcleo maciço teria perdas enormes.',
    },
    {
      id: 'mec-mot-23',
      type: 'ce',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Capacitores ligados em paralelo com motores de indução elevam o fator de potência visto pela rede sem alterar a potência ativa consumida.',
      answer: true,
      roteiro: 'potencia-eletrica',
      steps: [
        'A potência ativa dos motores é a mesma.',
        'Os capacitores fornecem a reativa: a rede entrega menos Q e menos corrente.',
        'O cos φ visto pela rede sobe: **Certo**.',
      ],
      explanation: 'Certo. Eles fornecem a potência reativa de magnetização: a rede entrega menos reativa e menos corrente, e a ativa (o trabalho dos motores) não muda.',
    },
    {
      id: 'mec-mot-24',
      type: 'ce',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Na partida estrela-triângulo, o conjugado de partida fica igual ao da partida direta; só a corrente de partida é reduzida.',
      answer: false,
      roteiro: 'ligacao-partida',
      steps: [
        'Partida em estrela: cada bobina recebe V/√3.',
        'O conjugado (∝ V²) cai a 1/3, junto com a corrente de linha.',
        'O conjugado não fica igual: **Errado**.',
      ],
      explanation: 'Errado. Em estrela, cada bobina recebe V/√3: a corrente de linha e o conjugado de partida caem os dois para cerca de **1/3** do valor na partida direta.',
    },
  ],
  games: [
    {
      id: 'mec-mot-g1',
      type: 'sort',
      title: 'Indução, síncrono ou CC?',
      intro: 'Cada característica é do motor de **indução** (assíncrono), do motor **síncrono** ou do motor de **corrente contínua**?',
      lessonRef: 0,
      bins: ['Indução', 'Síncrono', 'Corrente contínua'],
      items: [
        { text: 'Gira um pouco abaixo da rotação do campo', bin: 0, why: 'É o escorregamento.' },
        { text: 'Gira exatamente na rotação síncrona, com qualquer carga', bin: 1, why: 'O rotor segue o campo.' },
        { text: 'Tem comutador e escovas', bin: 2, why: 'O comutador inverte a corrente na armadura.' },
        { text: 'Rotor de gaiola de esquilo', bin: 0, why: 'Barras em curto, sem ligação externa.' },
        { text: 'Pode corrigir o fator de potência da fábrica', bin: 1, why: 'Sobre-excitado, fornece reativa.' },
        { text: 'Motor de arranque do carro, ligado à bateria', bin: 2, why: 'Motor CC série.' },
        { text: 'O mais usado em bombas, ventiladores e compressores', bin: 0, why: 'Simples, robusto e barato.' },
        { text: 'Polos do rotor alimentados em CC por anéis coletores', bin: 1, why: 'É a excitação do síncrono.' },
        { text: 'Velocidade controlada pela tensão da armadura', bin: 2, why: 'Controle simples de velocidade.' },
        { text: 'Nenhuma ligação elétrica com o rotor', bin: 0, why: 'A corrente no rotor é induzida.' },
        { text: 'Grandes potências com rotação rigorosamente constante', bin: 1, why: 'Rotação presa à frequência.' },
        { text: 'Exige fonte contínua ou um retificador', bin: 2, why: 'Não roda direto na rede CA.' },
      ],
    },
    {
      id: 'mec-mot-g2',
      type: 'match',
      title: 'Placa, fórmulas e partida',
      intro: 'Ligue cada item ao que ele significa.',
      lessonRef: 5,
      leftLabel: 'Item',
      rightLabel: 'Significado',
      perRound: 6,
      pairs: [
        { left: 'n_{s} = 120·f/p', right: 'Rotação do campo girante', why: 'f em Hz, p = número de polos.' },
        { left: 's = (n_{s} − n)/n_{s}', right: 'Escorregamento', why: 'Diferença relativa entre campo e eixo.' },
        { left: 'Triângulo (Δ)', right: 'Motor 220/380 V numa rede de 220 V', why: 'A tensão menor da placa.' },
        { left: 'Estrela (Y)', right: 'Motor 220/380 V numa rede de 380 V', why: 'Cada bobina com 380/√3 = 220 V.' },
        { left: 'FS 1,15', right: 'Aguenta 15 % de sobrecarga contínua', why: 'Fator de serviço.' },
        { left: 'Classe F', right: 'Isolamento até 155 °C', why: 'A 105, E 120, B 130, F 155, H 180 °C.' },
        { left: 'IP55', right: 'Protegido contra poeira e jatos de água', why: '1º algarismo: sólidos; 2º: água.' },
        { left: 'Ip/In = 7', right: 'Partida puxa 7 vezes a corrente nominal', why: 'Relação de corrente de partida.' },
        { left: 'cos φ', right: 'P/S: a fração da potência aparente que vira trabalho', why: 'Fator de potência.' },
        { left: 'Chave compensadora', right: 'Autotransformador com taps de 50, 65 e 80 %', why: 'Permite partir com carga.' },
        { left: 'Inversor de frequência', right: 'Varia a rotação mudando f, com V/f constante', why: 'Retificador + IGBTs (PWM).' },
      ],
    },
    {
      id: 'mec-mot-g3',
      type: 'order',
      title: 'Como o motor de indução cria conjugado',
      intro: 'Ponha em ordem o que acontece desde que o motor é ligado até ele girar.',
      lessonRef: 2,
      steps: [
        { text: 'Correntes trifásicas, defasadas de 120°, percorrem os enrolamentos do estator', why: 'A alimentação.' },
        { text: 'Forma-se o campo girante, na rotação síncrona (120·f/p)', why: 'Três fases a 120° no espaço e no tempo.' },
        { text: 'O campo corta as barras do rotor parado (movimento relativo)', why: 'É a condição da indução.' },
        { text: 'Induz-se tensão nas barras, e como elas estão em curto, circula corrente', why: 'Lei de Faraday.' },
        { text: 'As correntes no campo sofrem força: aparece o conjugado no eixo', why: 'F = B·I·l.' },
        { text: 'O rotor acelera até um pouco abaixo da rotação síncrona (escorregamento)', why: 'Sem diferença, não haveria indução.' },
      ],
    },
    {
      id: 'mec-mot-lab1',
      type: 'lab',
      lab: 'motor',
      title: 'Motor de indução',
      intro: 'Um motor de 7,5 kW, 220/380 V: mude os polos, a carga, a ligação, a frequência e os capacitores, e preveja o que acontece com a rotação, o escorregamento e as correntes.',
      lessonRef: 2,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { maq: 0, poles: 1, f: 60, load: 100 },
          prompt: 'O motor tem **4 polos** e roda na rede de 60 Hz. Um motor igual, mas de **8 polos**, teria o campo girando a…',
          change: { poles: 3 },
          options: ['900 rpm: metade', '3.600 rpm: o dobro', '1.800 rpm: só depende da frequência', '1.200 rpm'],
          answer: 0,
          expect: [
            { out: 'ns', trend: 'down' },
            { out: 'n', trend: 'down' },
          ],
          why: 'n_{s} = 120·f/p = 120 × 60/8 = **900 rpm**. O eixo fica um pouco abaixo (~875 rpm). Com a mesma potência, o motor mais lento entrega o dobro do conjugado.',
        },
        {
          kind: 'predict',
          setup: { maq: 0, poles: 1, f: 60, load: 50 },
          prompt: 'A carga no eixo sobe de **50 % para 100 %** da nominal. O que acontece?',
          change: { load: 100 },
          options: ['A rotação cai um pouco; o escorregamento e a corrente sobem', 'A rotação sobe para compensar', 'O escorregamento cai, porque o motor puxa mais corrente', 'Nada muda: o motor de indução tem rotação constante'],
          answer: 0,
          expect: [
            { out: 'n', trend: 'down' },
            { out: 's', trend: 'up' },
            { out: 'I', trend: 'up' },
          ],
          why: 'Para dar mais conjugado, o rotor precisa de mais corrente induzida — e ela só cresce com mais **escorregamento**. O motor desacelera um pouco (de ~1.776 para ~1.750 rpm) e a corrente vai de ~16 para ~25 A.',
        },
        {
          kind: 'predict',
          setup: { maq: 0, poles: 1, f: 60, load: 100 },
          prompt: 'E se a carga **sumir** (eixo livre)?',
          change: { load: 0 },
          options: ['O rotor quase alcança o campo, mas não chega aos 1.800 rpm', 'O rotor passa a girar exatamente a 1.800 rpm', 'O rotor dispara acima de 1.800 rpm', 'O rotor para, porque não há carga'],
          answer: 0,
          expect: [
            { out: 's', trend: 'down' },
            { out: 'n', trend: 'up' },
            { out: 'fp', trend: 'down' },
          ],
          why: 'Sem carga, basta um conjugado mínimo (atrito e ventilação): o escorregamento cai para ~0,03 % e as barras quase apagam. Mas ele nunca é zero — sem movimento relativo não haveria indução. E o fator de potência despenca: o motor só magnetiza.',
        },
        {
          kind: 'goal',
          setup: { maq: 0, poles: 1, f: 60, load: 100 },
          lock: ['maq', 'poles', 'load', 'rede', 'lig', 'seq'],
          prompt: 'Uma esteira precisa girar a **cerca de 1.200 rpm** com este motor de 4 polos e carga nominal. Ajuste a **frequência do inversor**.',
          goals: [{ out: 'n', min: 1180, max: 1220, label: 'eixo entre 1.180 e 1.220 rpm' }],
          hint: 'n_{s} = 120·f/p. O eixo fica uns 50 rpm abaixo do campo com essa carga: o campo precisa girar um pouco acima de 1.200 rpm.',
          solution: { f: 42 },
          why: 'Com 42 Hz, o campo gira a 120 × 42/4 = 1.260 rpm e o eixo, a ~1.208 rpm. O inversor muda a rotação mudando a frequência — com V/f constante, o conjugado disponível se mantém.',
        },
        {
          kind: 'predict',
          setup: { maq: 0, poles: 1, f: 60, rede: 0, lig: 0, load: 30 },
          prompt: 'Motor 220/380 V na rede de 220 V, em **triângulo**. Se as pontes da caixa forem trocadas para **estrela**, a corrente de partida (direta) fica…',
          change: { lig: 1 },
          options: ['Cerca de 1/3 da anterior', 'Cerca de 1/√3 da anterior', '√3 vezes maior', 'Igual'],
          answer: 0,
          expect: [
            { out: 'Ip', trend: 'down' },
            { out: 'Tp', trend: 'down' },
          ],
          why: 'Em estrela, cada bobina recebe 220/√3 = 127 V: a corrente em cada bobina cai √3 vezes, e a de linha deixa de ser √3 × a da bobina — no total, **÷ 3** (de 145 para ~48 A). O conjugado, proporcional a V², também cai para 1/3. É a partida estrela-triângulo.',
        },
        {
          kind: 'goal',
          setup: { maq: 0, poles: 1, f: 60, rede: 1, lig: 0, load: 100 },
          lock: ['maq', 'rede', 'load', 'poles', 'f', 'seq'],
          prompt: 'Este motor de placa **220/380 V** foi ligado em **triângulo numa rede de 380 V**. Corrija a ligação para que cada bobina receba a tensão de projeto.',
          goals: [{ out: 'Vbob', min: 210, max: 230, label: 'bobinas com cerca de 220 V' }],
          hint: 'Na tensão maior da placa, a ligação é… (dá para clicar nos bornes da caixa de ligação).',
          solution: { lig: 1 },
          why: 'Em triângulo, cada bobina recebia os 380 V da rede — √3 vezes o projeto: o ferro satura e o motor queima. Em **estrela**, cada bobina recebe 380/√3 = 220 V. Na placa: tensão menor ↔ triângulo; maior ↔ estrela.',
        },
        {
          kind: 'predict',
          setup: { maq: 0, poles: 1, f: 60, load: 25, cap: 0 },
          prompt: 'O motor está com **25 % de carga** (fator de potência baixo). Ligam-se **3 kvar de capacitores** na rede. O que acontece?',
          change: { cap: 3 },
          options: [
            'A corrente na rede cai e o fator de potência visto por ela sobe; a potência ativa não muda',
            'A potência ativa do motor cai',
            'A corrente do próprio motor cai à metade',
            'O fator de potência piora, porque o capacitor consome reativa',
          ],
          answer: 0,
          expect: [
            { out: 'Irede', trend: 'down' },
            { out: 'fpRede', trend: 'up' },
            { out: 'P', trend: 'same' },
          ],
          why: 'O capacitor fornece ali mesmo a reativa da magnetização: a rede passa a ver cos φ ≈ 0,9 (era ~0,5) e a corrente na rede cai de ~12 para ~7 A. O motor continua igual — mesma corrente, mesma potência ativa.',
        },
        {
          kind: 'predict',
          setup: { maq: 0, poles: 1, f: 60, load: 100, seq: 0 },
          prompt: 'Um eletricista **troca dois fios de fase** na caixa de ligação. O motor…',
          change: { seq: 1 },
          options: ['Gira no sentido contrário, com a mesma rotação', 'Para, porque as fases ficam desequilibradas', 'Gira no mesmo sentido, com metade da rotação', 'Queima, porque as bobinas recebem o dobro da tensão'],
          answer: 0,
          expect: [
            { out: 'dir', trend: 'down' },
            { out: 'n', trend: 'same' },
          ],
          why: 'A sequência de fases se inverte (L2-L1-L3) e o **campo girante** passa a rodar ao contrário — o rotor vai atrás. Rotação, corrente e conjugado ficam iguais.',
        },
        {
          kind: 'predict',
          setup: { maq: 0, poles: 1, f: 60, load: 100 },
          prompt: 'Com carga de **conjugado constante**, o inversor baixa a frequência de 60 para **30 Hz** (V/f constante). A potência no eixo…',
          change: { f: 30 },
          options: ['Cai mais ou menos à metade, com a corrente quase igual', 'Fica igual, com a corrente dobrada', 'Cai a 1/4, porque a tensão também caiu', 'Sobe, porque o fluxo aumenta'],
          answer: 0,
          expect: [
            { out: 'Pout', trend: 'down' },
            { out: 'ns', trend: 'down' },
          ],
          why: 'O campo vai a 120 × 30/4 = 900 rpm. O conjugado é o mesmo (a carga pede o mesmo, e o fluxo se mantém com V/f constante), então P = T·ω cai **à metade** (de 7,5 para ~3,6 kW) — e a corrente fica quase igual.',
        },
        {
          kind: 'predict',
          setup: { maq: 0, poles: 1, f: 60, load: 100 },
          prompt: 'A carga sobe de 100 % para **350 %** — além do conjugado máximo (~320 %). O motor…',
          change: { load: 350 },
          options: ['Tomba: para e fica puxando a corrente de partida', 'Acelera para compensar', 'Segue girando, só que com mais escorregamento', 'Desliga sozinho, sem risco para o enrolamento'],
          answer: 0,
          expect: [
            { out: 'n', trend: 'down' },
            { out: 'I', trend: 'up' },
            { out: 'stall', trend: 'up' },
          ],
          why: 'Nenhum ponto da curva do motor alcança a carga: ele **tomba** e para, puxando ~145 A (quase 6 vezes a nominal). Se o relé térmico não desligar, o enrolamento queima.',
        },
        {
          kind: 'goal',
          setup: { maq: 0, poles: 1, f: 60, load: 100 },
          lock: ['maq', 'f', 'load', 'rede', 'lig', 'seq'],
          prompt: 'Um ventilador precisa de **cerca de 1.150 rpm**, com o motor ligado direto na rede de 60 Hz. Escolha o **número de polos**.',
          goals: [{ out: 'n', min: 1100, max: 1200, label: 'eixo entre 1.100 e 1.200 rpm' }],
          hint: 'n_{s} = 120·f/p: procure o p que dá um campo um pouco acima de 1.150 rpm.',
          solution: { poles: 2 },
          why: 'Com **6 polos**, o campo gira a 120 × 60/6 = 1.200 rpm e o eixo, a ~1.167 rpm. Com 4 polos daria ~1.750 rpm; com 8, ~875 rpm.',
        },
      ],
    },
  ],
});
