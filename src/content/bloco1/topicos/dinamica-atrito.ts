import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

const G = 10;

export default defineTopic({
  id: 'mec.dinamica-atrito',
  name: 'Dinâmica: Newton, atrito e rolamento',
  summary:
    'Diagrama de corpo livre e 2ª lei de Newton, elevador, atrito estático e cinético, plano inclinado, polias, movimento circular, momento de inércia e rolamento sem deslizamento.',
  order: 5,
  weight: 3,
  equipment: 'ramp',
  edital: ['b1.dinamica'],
  lesson: [
    {
      title: '2ª lei de Newton e diagrama de corpo livre',
      hot: '**Elevador**: em que fase a força no cabo é máxima (Transpetro 2011) e a força de uma caixa no piso quando o elevador desce freando, **m·(g + a)** (Petrobras 2014). Aceleração do centro de massa de um sistema de partículas: só as forças **externas** entram (Petrobras 2012).',
      body: 'Roteiro para qualquer problema de dinâmica:\n1. isole o corpo e desenhe **todas** as forças que agem nele (o **diagrama de corpo livre**): peso, normal, atrito, trações, forças aplicadas;\n2. escolha os eixos (um deles no sentido do movimento);\n3. aplique **ΣF = m·a** em cada eixo.\n\nPeso: **P = m·g**. A **normal** é perpendicular à superfície e vale o necessário para o corpo não atravessá-la — **não é sempre igual ao peso**.\n\n**Elevador** (pessoa de massa m no piso), com a positiva para cima: N − m·g = m·a.\n- Subindo e acelerando, ou **descendo e freando**: **N = m·(g + a)** — a pessoa "pesa" mais na balança.\n- Descendo e acelerando, ou subindo e freando: **N = m·(g − a)**.\n- Velocidade constante: N = m·g.\n\n**Sistema de partículas:** só as forças **externas** aceleram o centro de massa, **ΣF_{ext} = m_{total}·a_{CM}** — as internas se anulam aos pares. Sem força externa, a quantidade de movimento total (m·v) se conserva, como nas colisões.',
      example: 'Pessoa de 50 kg num elevador que desce e freia com 2 m/s² (aceleração para cima): N = 50 × (10 + 2) = **600 N**.',
      tip: '"Freando" quer dizer aceleração **contra** a velocidade. Descendo e freando → aceleração para cima → normal maior que o peso.',
      trap: 'Somar forças internas (a tração do fio entre dois blocos, por exemplo) ao calcular a aceleração do conjunto. Para o conjunto, só entram as forças externas.',
    },
    {
      title: 'Atrito estático × atrito cinético',
      hot: 'Caixa puxada com atrito: primeiro veja se a força vence μ_{e}·N; se vencer, use μ_{c} para a aceleração (Transpetro 2018).',
      body: 'O atrito seco age na superfície de contato, **contra o movimento** — ou contra a **tendência** de movimento.\n- **Parado (estático):** o atrito vale **só o necessário** para impedir o deslizamento, até um máximo: **f ≤ μ_{e}·N**.\n- **Deslizando (cinético):** o atrito é constante, **f = μ_{c}·N**, com μ_{c} < μ_{e}. Por isso, depois que a caixa "sai do lugar", fica mais fácil empurrá-la.\n\nRoteiro com uma força F puxando:\n1. calcule o atrito estático máximo μ_{e}·N;\n2. se F ≤ μ_{e}·N, **a caixa não sai do lugar**: a = 0 e o atrito vale F;\n3. se F > μ_{e}·N, ela desliza com **a = (F − μ_{c}·N)/m**.\n\nNo modelo de Coulomb, o atrito **não depende da área de contato** — só da normal e dos materiais.',
      example: 'Caixa de 60 kg (N = 600 N), μ_{e} = 0,5 e μ_{c} = 0,4:\n- F = 250 N < 300 N → **parada**, e o atrito vale 250 N;\n- F = 360 N > 300 N → desliza: a = (360 − 240)/60 = **2 m/s²**.',
      tip: 'Primeiro pergunte "**sai do lugar?**" (compare com μ_{e}·N). Só depois use μ_{c}.',
      trap: 'Aplicar μ_{c}·N direto, sem verificar se a força vence o atrito estático. Se F não passa de μ_{e}·N, a aceleração é **zero** — não dá para "frear" uma caixa parada.',
      lab: { lab: 'ramp', preset: { body: 0, theta: 0, m: 60, mus: 0.5, muk: 0.4, F: 250 }, label: 'Puxar a caixa na bancada' },
    },
    {
      title: 'Plano inclinado',
      hot: 'Carga solta na carroceria: a maior aceleração do veículo sem a carga escorregar é **μ_{e}·g** (Petrobras 2014).',
      body: 'Numa rampa de ângulo θ, decomponha o peso:\n- **ao longo da rampa:** P·sen θ, puxando rampa abaixo;\n- **perpendicular à rampa:** P·cos θ, equilibrada pela normal: **N = m·g·cos θ**.\n\nSem outras forças, o bloco fica parado enquanto m·g·sen θ ≤ μ_{e}·m·g·cos θ, isto é, **tg θ ≤ μ_{e}** — o **ângulo de repouso**, que **não depende da massa**. Passou disso, ele desce com **a = g·(sen θ − μ_{c}·cos θ)**.\n\nCom uma força F paralela à rampa, para cima, o bloco fica parado para F entre **m·g·sen θ − μ_{e}·N** (o mínimo para segurar) e **m·g·sen θ + μ_{e}·N** (o máximo antes de subir). Dentro dessa faixa, o atrito **muda de sentido**.\n\nCarga solta na **carroceria** de um caminhão: o atrito estático é a única força horizontal que a acelera, então ela escorrega se **a > μ_{e}·g**.',
      example: 'Rampa de 30°, bloco de 10 kg, μ_{e} = 0,3 e μ_{c} = 0,2: tg 30° = 0,58 > 0,3, então ele desce com a = 10 × (0,5 − 0,2 × 0,866) ≈ **3,27 m/s²**.',
      tip: 'Veículo subindo uma rampa com aceleração a: a força de tração nos pneus (atrito estático) precisa ser F = m·(g·sen θ + a).',
      trap: 'Usar N = m·g na rampa. Ali, **N = m·g·cos θ** — e a normal muda de novo se alguma força puxar o bloco para fora da superfície.',
      lab: { lab: 'ramp', preset: { body: 0, theta: 15, m: 20, mus: 0.4, muk: 0.3, F: 0 }, label: 'Achar o ângulo de repouso' },
    },
    {
      title: 'Polias e cabos',
      hot: 'Carga içada por roldanas com a força no cabo dada: conte os **ramos** que sustentam a carga e aplique ΣF = m·a para achar a aceleração e o sentido dela (Transpetro 2018).',
      body: 'Cabo ideal (sem massa e inextensível) passando por **polia ideal** (sem massa e sem atrito): a **tração é a mesma** em todo o cabo.\n- **Polia fixa:** só muda a direção da força.\n- **Polia móvel:** a carga fica presa em **2 ramos** de cabo → para segurar, T = P/2 (em compensação, o cabo anda o dobro).\n- **Talha com n ramos** sustentando a carga: T = P/n no equilíbrio.\n\nCom aceleração, aplique ΣF = m·a à carga: na polia móvel, **2·T − m·g = m·a**.\n\n**Máquina de Atwood** (duas massas penduradas numa polia fixa): **a = (m_{1} − m_{2})·g/(m_{1} + m_{2})** e T = 2·m_{1}·m_{2}·g/(m_{1} + m_{2}).\n\nSe a polia tiver **momento de inércia** I, as trações dos dois lados ficam diferentes: (T_{1} − T_{2})·r = I·α.',
      example: 'Carga de 120 kg numa polia móvel; o cabo é puxado com 720 N: 2 × 720 − 1.200 = 120·a → **a = 2 m/s²**, para cima.',
      trap: 'Esquecer quantos ramos de cabo sustentam a carga: com 2 ramos, a força que levanta a carga é 2·T, não T.',
    },
    {
      title: 'Movimento circular',
      hot: 'Velocidade de módulo constante numa curva: a aceleração é **centrípeta** — normal à trajetória, apontando para o centro (Transpetro 2012 e 2018, Petrobras 2014 e 2018). Na forma vetorial, ω × (ω × R) = −ω²·R aponta para o centro (Petrobras 2010).',
      body: 'Numa curva de raio R, a aceleração tem duas componentes:\n- **normal (centrípeta):** **a_{n} = v²/R = ω²·R**, sempre apontando para o **centro** — muda a **direção** da velocidade;\n- **tangencial:** a_{t}, muda o **módulo** da velocidade.\n\nO movimento circular **uniforme** (velocidade de módulo constante) **tem aceleração**: a centrípeta. A resultante das forças aponta para o centro: **F = m·v²/R**.\n- Curva plana: quem faz a força centrípeta é o atrito → v_{máx} = √(μ_{e}·g·R).\n- Topo de um *looping*: a velocidade mínima para não perder contato é aquela em que o **peso sozinho** faz o papel de força centrípeta: m·g = m·v²/R → **v_{mín} = √(g·R)**.\n\nEm linha reta com velocidade constante, a = 0. Acelerando ou freando em linha reta, só existe a_{t}.',
      example: 'Looping de raio 4,9 m: v_{mín} = √(10 × 4,9) = **7 m/s** no ponto mais alto.',
      tip: 'Velocidade constante em **módulo** não é aceleração nula: se a direção muda, há aceleração — apontando para o centro.',
      trap: 'Desenhar a "força centrífuga" no diagrama de corpo livre feito no referencial do chão. A resultante aponta para o **centro**.',
    },
    {
      title: 'Corpo rígido: momento de inércia e rotação',
      hot: '**M = I·α** direto: engrenagem com I e momento dados (Transpetro 2012), aro com I = m·r² (Petrobras 2012), haste solta do repouso (Petrobras 2012). O momento de inércia depende da **massa e de como ela se distribui** em torno do eixo (Petrobras 2014).',
      body: 'Na rotação em torno de um eixo fixo, o papel da massa é do **momento de inércia**: **I = Σ m·r²** — ele mede como a massa está **distribuída em relação ao eixo**. A 2ª lei vira **ΣM = I·α** (M em N·m, α em rad/s²).\n\nValores de tabela, com o eixo passando pelo centro:\n- **aro** ou tubo de parede fina: I = m·r²;\n- **disco** ou cilindro maciço: I = m·r²/2;\n- **esfera maciça**: I = 2·m·r²/5;\n- **barra** de comprimento L: m·L²/12 pelo centro e **m·L²/3 pela ponta**.\n\n**Eixos paralelos (Steiner):** I = I_{CM} + m·d².\n\nCinemática angular: ω = ω_{0} + α·t; v = ω·r; a_{t} = α·r; a_{n} = ω²·r. Energia cinética de rotação: **E = I·ω²/2**.',
      example: 'Aro de 8 kg e raio 0,25 m sob um momento de 2 N·m: I = 8 × 0,25² = 0,5 kg·m² → α = 2/0,5 = **4 rad/s²**.\nBarra de 1,2 m articulada na ponta e solta na horizontal: α = (m·g·L/2)/(m·L²/3) = 3g/(2L) = **12,5 rad/s²** — sem depender da massa.',
      tip: 'Mesma massa e mesmo raio: o aro (toda a massa na borda) tem o **dobro** do I do disco — é mais difícil de pôr para girar.',
      trap: 'O momento de inércia **não** depende do momento aplicado, da aceleração nem da resistência do material: só da massa e de como ela se distribui em torno do eixo.',
      lab: { lab: 'ramp', preset: { body: 1, theta: 25, mus: 0.6, muk: 0.4, r: 0.2 }, label: 'Ver o aro rolando' },
    },
    {
      title: 'Rolamento sem deslizamento',
      hot: 'Roda sem deslizar: **v = ω·r** — converta km/h para m/s (÷ 3,6) e use o **raio**, não o diâmetro (Petrobras 2018). Tambor rolando rampa abaixo: a = g·sen θ/(1 + β) (Petrobras 2010).',
      body: 'Rolando **sem deslizar**, o ponto de contato está parado em relação ao chão: **v_{CM} = ω·r** e **a_{CM} = α·r**.\n\nNuma rampa, o peso puxa o centro rampa abaixo e o **atrito estático** faz o corpo girar. Juntando ΣF = m·a e ΣM = I·α, com I = β·m·r²:\n\n**a = g·sen θ/(1 + β)**, com β = I/(m·r²)\n- aro (β = 1): a = g·sen θ/2;\n- cilindro maciço (β = 1/2): a = 2·g·sen θ/3;\n- esfera maciça (β = 2/5): a = 5·g·sen θ/7;\n- bloco sem atrito (não gira): a = g·sen θ.\n\nSoltos juntos, chega primeiro quem tem **menor β**: esfera, depois cilindro, depois aro — **qualquer que seja a massa ou o raio**.\n\nO atrito estático **não dissipa energia** (o ponto de contato não escorrega): m·g·h = m·v²/2 + I·ω²/2. Se a rampa for íngreme demais (**tg θ > μ_{e}·(1 + β)/β**), o atrito não dá conta e o corpo **rola e escorrega**.',
      example: 'Cilindro maciço descendo, sem deslizar, uma rampa com sen θ = 0,6: a = 2 × 10 × 0,6/3 = **4 m/s²**. Um aro na mesma rampa teria 3 m/s², e um bloco sem atrito, 6 m/s².',
      tip: 'Para saber quem chega primeiro, olhe só β = I/(m·r²): quanto mais massa longe do eixo, mais devagar o corpo desce.',
      trap: 'Dizer que o atrito "freia" o corpo e dissipa energia no rolamento sem deslizamento. Ele é **estático**: faz o corpo girar e não gasta energia.',
      lab: { lab: 'ramp', preset: { body: 2, theta: 30, mus: 0.4, muk: 0.3 }, label: 'Ver a corrida na bancada' },
    },
  ],
  roteiros: [
    {
      id: 'atrito',
      name: 'Atrito: parado ou deslizando?',
      when: 'Corpo num piso com μe e μc e uma força aplicada; pedem o atrito ou a aceleração.',
      steps: [
        'Calcule a normal (no piso horizontal, N = m·g).',
        'Compare a força aplicada com o atrito estático máximo, μe·N.',
        'Não venceu: fica parado e o atrito iguala a força aplicada. Venceu: desliza com μc·N e a = (F − μc·N)/m.',
      ],
      note: 'μe·N é o **máximo**, não o valor do atrito em repouso. Use μc só depois que o corpo desliza.',
    },
    {
      id: 'rampa',
      name: 'Bloco na rampa',
      when: 'Bloco numa rampa inclinada, com ou sem atrito; pedem a aceleração, uma força ou se ele escorrega.',
      steps: [
        'Decomponha o peso: m·g·sen θ ao longo da rampa e m·g·cos θ contra ela (a normal).',
        'O atrito age contra o movimento (ou contra a tendência): μ·N = μ·m·g·cos θ.',
        'Some ao longo da rampa e divida pela massa — ela se cancela: a = g·(sen θ − μ·cos θ). Escorrega se tg θ > μe.',
      ],
      note: 'A massa não muda a aceleração nem o ângulo-limite (tg θ = μe). O seno vai no peso ao longo da rampa; o cosseno, na normal.',
    },
    {
      id: 'carga-veiculo',
      name: 'Carga solta num veículo que acelera',
      when: 'Caixa solta sobre carroceria, esteira ou bandeja que acelera; pedem a maior aceleração sem escorregar.',
      steps: [
        'Ache a força que acelera a carga: só o atrito estático.',
        'Imponha o limite do atrito: m·a ≤ μe·m·g.',
        'Isole a aceleração máxima: a = μe·g (a massa se cancela).',
      ],
      note: 'O coeficiente cinético é distrator: enquanto não escorrega, só vale o estático.',
    },
    {
      id: 'elevador',
      name: 'Peso aparente no elevador',
      when: 'Pessoa ou carga num elevador acelerando ou freando; pedem a normal, a tração ou o que a balança marca.',
      steps: [
        'Ache o sentido da aceleração: acelerando = no sentido do movimento; freando = contra ele.',
        'Escreva ΣF = m·a com "para cima" positivo: N − m·g = m·a.',
        'Isole: aceleração para cima → N = m·(g + a), maior que o peso; para baixo → N = m·(g − a), menor.',
      ],
      note: 'Sobe acelerando = desce freando (aceleração para cima: "mais pesado"). Sobe freando = desce acelerando ("mais leve").',
    },
    {
      id: 'fios-polias',
      name: 'Corpos ligados por fios e polias',
      when: 'Blocos presos a fios que passam por polias (Atwood, polia móvel, bloco puxando bloco); pedem a aceleração ou a tração.',
      steps: [
        'Isole cada corpo e desenhe as forças: peso e uma tração T em cada ramo de fio preso a ele.',
        'Escreva ΣF = m·a para cada corpo, no sentido do movimento (fio ideal: mesma tração e mesma aceleração).',
        'Resolva: some as equações para eliminar T, ou isole a incógnita.',
      ],
      note: 'Atalho: a = (forças que movem − forças que freiam)/(massa total). Na polia móvel, cada ramo carrega metade.',
    },
    {
      id: 'circular',
      name: 'Força centrípeta (curva e looping)',
      when: 'Looping, curva ou rotação; pedem a velocidade mínima ou máxima, a normal ou a tração.',
      steps: [
        'Marque o centro da curva: a resultante na direção dele vale m·v²/R.',
        'Some as forças na direção do centro (peso, normal, tração, atrito) e iguale a m·v²/R.',
        'Isole a incógnita; na velocidade-limite, a normal (ou a tração) vai a zero.',
      ],
      note: 'No topo do looping, sem normal: v_{mín} = √(g·R) — não depende da massa.',
    },
    {
      id: 'centro-massa',
      name: 'Aceleração do centro de massa',
      when: 'Várias partículas com forças externas e internas; pedem a aceleração do centro de massa.',
      steps: [
        'Separe as forças externas das internas (as internas se anulam aos pares).',
        'Some as externas, com sinal.',
        'a_{CM} = ΣF_{ext}/m_{total}.',
      ],
      note: 'Forças internas nunca mudam o movimento do centro de massa.',
    },
    {
      id: 'rotacao',
      name: 'Rotação em torno de eixo fixo (ΣM = I·α)',
      when: 'Polia, barra ou disco girando em torno de um eixo fixo sob um momento; pedem a aceleração angular, o momento ou a inércia.',
      steps: [
        'Escolha o momento de inércia da forma e do eixo: disco m·r²/2, aro m·r², barra pela ponta m·L²/3.',
        'Calcule o momento das forças em relação ao eixo (força × braço).',
        'α = ΣM/I.',
      ],
      note: 'Mesma massa e raio: o aro tem o **dobro** da inércia do disco. Barra pela ponta: m·L²/3; pelo centro: m·L²/12.',
    },
    {
      id: 'rolamento',
      name: 'Rolamento sem deslizar',
      when: 'Esfera, cilindro ou aro rolando sem deslizar numa rampa; pedem a aceleração, a ordem de chegada ou a divisão da energia.',
      steps: [
        'Ache β = I/(m·r²) do corpo: esfera 2/5, cilindro 1/2, aro 1.',
        'Use a = g·sen θ/(1 + β) para a aceleração, ou E_{rot}/E_{total} = β/(1 + β) para a energia.',
        'Conclua: β menor acelera mais — a massa e o raio não importam.',
      ],
      note: 'Ordem de chegada: **esfera, cilindro, aro**. O atrito no rolamento sem deslizar é estático: não dissipa energia.',
    },
  ],
  questions: [
    {
      id: 'mec-din-01',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Caixa puxada com atrito',
      roteiro: 'atrito',
      generate(rng) {
        const m = pickOne(rng, [20, 25, 40, 50, 60, 80, 100]);
        const mus = pickOne(rng, [0.4, 0.5, 0.6]);
        const muk = Math.round((mus - pickOne(rng, [0.1, 0.2])) * 10) / 10;
        const N = m * G;
        const fe = mus * N;
        const fc = muk * N;
        const parada = rng() < 0.4;
        const F = parada ? Math.round((fe + fc) / 20) * 10 : Math.round((fe + pickOne(rng, [0.1, 0.15, 0.2, 0.3]) * N) / 10) * 10;
        const a = parada ? 0 : (F - fc) / m;
        const distractors = parada
          ? [
              { value: (F - fc) / m, why: `Usou o atrito cinético sem verificar se a caixa sai do lugar: F = ${F} N não passa do atrito estático máximo (${fmt(fe, 0)} N).` },
              { value: F / m, why: 'Ignorou o atrito.' },
              { value: (F + fc) / m, why: 'Somou o atrito à força: ele se opõe ao movimento.' },
              { value: (fe - F) / m, why: 'Dividiu pela massa a "sobra" do atrito máximo: a caixa está parada, a aceleração é zero.' },
            ]
          : [
              { value: (F - fe) / m, why: 'Usou μe com a caixa já deslizando: depois que ela sai do lugar, vale μc.' },
              { value: F / m, why: 'Ignorou o atrito.' },
              { value: (F + fc) / m, why: 'Somou o atrito à força: ele se opõe ao movimento.' },
              { value: 0, why: `F = ${F} N é maior que o atrito estático máximo (${fmt(fe, 0)} N): a caixa desliza.` },
            ];
        const { options, answer } = numericOptions({
          correct: a,
          unit: 'm/s²',
          digits: 2,
          correctWhy: parada
            ? `F = ${F} N ≤ μe·N = ${fmt(fe, 0)} N: a caixa não sai do lugar, a = 0 (o atrito estático vale ${F} N).`
            : `F = ${F} N > μe·N = ${fmt(fe, 0)} N: desliza com a = (${F} − ${fmt(fc, 0)})/${m} = ${fmt(a, 2)} m/s².`,
          distractors,
        });
        return {
          prompt: `Uma caixa de ${m} kg está parada sobre um piso horizontal. Os coeficientes de atrito estático e cinético entre a caixa e o piso valem ${fmt(mus, 1)} e ${fmt(muk, 1)}. Uma força horizontal de ${F} N passa a puxá-la. Com g = 10 m/s², a aceleração da caixa é`,
          options,
          answer,
          hint: 'Primeiro compare F com o atrito estático máximo μe·N. Só se F for maior, use μc.',
          steps: [
            `N = ${m} × 10 = ${fmt(N, 0)} N.`,
            `μe·N = ${fmt(mus, 1)} × ${fmt(N, 0)} = ${fmt(fe, 0)} N; a força aplicada é ${fmt(F, 0)} N.`,
            `${parada ? `${fmt(F, 0)} N ≤ ${fmt(fe, 0)} N: a caixa **não sai do lugar** e a = **0** (o atrito estático vale ${fmt(F, 0)} N).` : `${fmt(F, 0)} N > ${fmt(fe, 0)} N: desliza com atrito μc·N = ${fmt(fc, 0)} N → a = (${fmt(F, 0)} − ${fmt(fc, 0)})/${m} = **${fmt(a, 2)} m/s²**.`}`,
          ],
          explanation: `1. N = m·g = ${m} × 10 = ${N} N.\n2. Atrito estático máximo: μe·N = ${fmt(mus, 1)} × ${N} = **${fmt(fe, 0)} N**.\n3. ${parada ? `F = ${F} N não vence esse máximo: a caixa **não sai do lugar** e a = **0**. O atrito vale só o necessário, ${F} N.` : `F = ${F} N vence esse máximo: a caixa desliza e o atrito cai para μc·N = ${fmt(fc, 0)} N.\n4. a = (F − μc·N)/m = (${F} − ${fmt(fc, 0)})/${m} = **${fmt(a, 2)} m/s²**.`}`,
        };
      },
    },
    {
      id: 'mec-din-02',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Bloco descendo a rampa com atrito',
      roteiro: 'rampa',
      generate(rng) {
        const ang = pickOne(rng, [
          { d: 37, s: 0.6, c: 0.8 },
          { d: 53, s: 0.8, c: 0.6 },
        ]);
        const muk = pickOne(rng, [0.1, 0.2, 0.25, 0.3, 0.4, 0.5]);
        const m = pickOne(rng, [2, 5, 10, 20, 50]);
        const a = G * (ang.s - muk * ang.c);
        const { options, answer } = numericOptions({
          correct: a,
          unit: 'm/s²',
          digits: 2,
          correctWhy: `a = g·(sen θ − μc·cos θ) = 10 × (${fmt(ang.s, 1)} − ${fmt(muk, 2)} × ${fmt(ang.c, 1)}) = ${fmt(a, 2)} m/s².`,
          distractors: [
            { value: G * ang.s, why: 'Esqueceu o atrito: g·sen θ seria a aceleração sem atrito.' },
            { value: G * (ang.s + muk * ang.c), why: 'Somou o atrito: ele aponta rampa acima, contra o movimento.' },
            { value: G * (ang.c - muk * ang.s), why: 'Trocou seno e cosseno: o peso puxa rampa abaixo com P·sen θ, e a normal vale P·cos θ.' },
            { value: G * (ang.s - muk), why: 'Usou N = m·g: na rampa, N = m·g·cos θ.' },
          ],
        });
        return {
          prompt: `Um bloco de ${m} kg desce escorregando por uma rampa inclinada de ${ang.d}° (sen ${ang.d}° = ${fmt(ang.s, 1)}; cos ${ang.d}° = ${fmt(ang.c, 1)}). O coeficiente de atrito cinético entre o bloco e a rampa é ${fmt(muk, 2)}. Com g = 10 m/s², a aceleração do bloco é`,
          options,
          answer,
          hint: 'Ao longo da rampa: m·g·sen θ − μc·m·g·cos θ = m·a. A massa se cancela.',
          steps: [
            `Ao longo da rampa: m·g·sen ${ang.d}° = m·10·${fmt(ang.s, 1)}; normal: N = m·10·${fmt(ang.c, 1)}.`,
            `Atrito (rampa acima): ${fmt(muk, 2)} × m·10·${fmt(ang.c, 1)}.`,
            `a = 10 × (${fmt(ang.s, 1)} − ${fmt(muk, 2)} × ${fmt(ang.c, 1)}) = **${fmt(a, 2)} m/s²** — a massa de ${m} kg se cancela.`,
          ],
          explanation: `1. Rampa abaixo: P·sen θ = m·g·${fmt(ang.s, 1)}.\n2. Atrito, rampa acima: μc·N = ${fmt(muk, 2)}·m·g·${fmt(ang.c, 1)}.\n3. a = g·(sen θ − μc·cos θ) = 10 × (${fmt(ang.s, 1)} − ${fmt(muk * ang.c, 3)}) = **${fmt(a, 2)} m/s²** — não depende da massa (${m} kg).`,
        };
      },
    },
    {
      id: 'mec-din-03',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Carga solta na carroceria',
      roteiro: 'carga-veiculo',
      generate(rng) {
        const mus = pickOne(rng, [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.8]);
        const muk = Math.round((mus - pickOne(rng, [0.05, 0.1])) * 100) / 100;
        const m = pickOne(rng, [15, 20, 40, 60, 120, 300]);
        const a = mus * G;
        const { options, answer } = numericOptions({
          correct: a,
          unit: 'm/s²',
          digits: 2,
          correctWhy: `Só o atrito estático acelera a carga: μe·m·g = m·a → a = μe·g = ${fmt(mus, 2)} × 10 = ${fmt(a, 2)} m/s².`,
          distractors: [
            { value: muk * G, why: 'Usou o atrito cinético: enquanto a carga não escorrega, o atrito é estático.' },
            { value: G / mus, why: 'Inverteu: a = μe·g.' },
            { value: mus, why: 'Esqueceu de multiplicar por g.' },
            { value: (mus * G) / 2, why: 'Dividiu por 2 sem motivo: a = μe·g.' },
          ],
        });
        return {
          prompt: `Uma caixa de ${m} kg está solta sobre a carroceria plana de um caminhão. Os coeficientes de atrito estático e cinético entre a caixa e a carroceria valem ${fmt(mus, 2)} e ${fmt(muk, 2)}. Com g = 10 m/s², a maior aceleração que o caminhão pode ter, sem que a caixa escorregue, é`,
          options,
          answer,
          hint: 'A única força horizontal na caixa é o atrito estático, que tem um máximo μe·N.',
          steps: [
            `Na caixa, a única força horizontal é o atrito estático, para a frente.`,
            `m·a ≤ ${fmt(mus, 2)}·m·10.`,
            `a_{máx} = ${fmt(mus, 2)} × 10 = **${fmt(a, 2)} m/s²** — a massa (${m} kg) e o μc (${fmt(muk, 2)}) não entram.`,
          ],
          explanation: `1. Na caixa, a única força horizontal é o **atrito estático** (para a frente).\n2. Para não escorregar: m·a ≤ μe·m·g → **a ≤ μe·g**.\n3. a_{máx} = ${fmt(mus, 2)} × 10 = **${fmt(a, 2)} m/s²** — a massa (${m} kg) se cancela.`,
        };
      },
    },
    {
      id: 'mec-din-04',
      type: 'gen',
      difficulty: 2,
      lessonRef: 0,
      title: 'Balança no elevador',
      roteiro: 'elevador',
      generate(rng) {
        const m = pickOne(rng, [40, 50, 60, 70, 80, 90, 100]);
        const a = pickOne(rng, [1, 1.5, 2, 2.5, 3, 4]);
        const cs = pickOne(rng, [
          { txt: 'sobe e está acelerando', up: true },
          { txt: 'desce e está freando', up: true },
          { txt: 'sobe e está freando', up: false },
          { txt: 'desce e está acelerando', up: false },
        ]);
        const N = m * (G + (cs.up ? a : -a));
        const { options, answer } = numericOptions({
          correct: N,
          unit: 'N',
          digits: 0,
          correctWhy: `Aceleração para ${cs.up ? 'cima' : 'baixo'}: N = m·(g ${cs.up ? '+' : '−'} a) = ${m} × ${fmt(G + (cs.up ? a : -a), 1)} = ${fmt(N, 0)} N.`,
          distractors: [
            { value: m * (G + (cs.up ? -a : a)), why: `Errou o sentido da aceleração: quem ${cs.txt} tem aceleração para ${cs.up ? 'cima' : 'baixo'}.` },
            { value: m * G, why: 'Ignorou a aceleração: N = m·g só vale com velocidade constante.' },
            { value: m * a, why: 'Usou só m·a: falta o peso.' },
            { value: m * (G + 2 * a), why: 'Contou a aceleração duas vezes.' },
          ],
        });
        return {
          prompt: `Uma pessoa de ${m} kg está sobre uma balança no piso de um elevador que ${cs.txt}, com aceleração de módulo ${fmt(a, 1)} m/s². Com g = 10 m/s², a força que a balança exerce sobre a pessoa é`,
          options,
          answer,
          hint: 'Ache o sentido da aceleração: acelerar = no sentido da velocidade; frear = contra ela. Depois, N − m·g = m·a (para cima positivo).',
          steps: [
            `O elevador ${cs.txt} → aceleração para **${cs.up ? 'cima' : 'baixo'}**.`,
            `N − ${fmt(m * G, 0)} = ${m} × (${cs.up ? '+' : '−'}${fmt(a, 1)}).`,
            `N = ${m} × (10 ${cs.up ? '+' : '−'} ${fmt(a, 1)}) = **${fmt(N, 0)} N** — ${cs.up ? 'mais' : 'menos'} que o peso (${fmt(m * G, 0)} N).`,
          ],
          explanation: `1. O elevador ${cs.txt}: a aceleração aponta para **${cs.up ? 'cima' : 'baixo'}**.\n2. Na pessoa: N − m·g = m·(${cs.up ? '+' : '−'}a).\n3. N = ${m} × (10 ${cs.up ? '+' : '−'} ${fmt(a, 1)}) = **${fmt(N, 0)} N** — a balança marca ${cs.up ? 'mais' : 'menos'} que o peso (${m * G} N).`,
        };
      },
    },
    {
      id: 'mec-din-05',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Carga içada por polia móvel',
      roteiro: 'fios-polias',
      generate(rng) {
        const m = pickOne(rng, [50, 60, 80, 100, 120, 150, 200, 250]);
        const a = pickOne(rng, [0.5, 1, 1.5, 2, 2.5, 3, 4, 5]);
        const F = (m * (G + a)) / 2;
        const { options, answer } = numericOptions({
          correct: a,
          unit: 'm/s²',
          digits: 2,
          correctWhy: `2·T − m·g = m·a → a = (2 × ${fmt(F, 1)} − ${m * G})/${m} = ${fmt(a, 2)} m/s².`,
          distractors: [
            { value: (2 * F) / m, why: 'Esqueceu o peso da carga: 2·T/m não é a aceleração.' },
            { value: F / m, why: 'Usou um ramo só e ainda esqueceu o peso.' },
            { value: a / 2, why: 'Dividiu a resultante pelo dobro da massa: divida 2·T − m·g pela massa da carga.' },
            { value: (4 * F - m * G) / m, why: 'Contou quatro ramos de cabo; na polia móvel simples são dois.' },
          ],
        });
        return {
          prompt: `Uma carga de ${m} kg está presa a uma polia móvel, sustentada por dois ramos do mesmo cabo. A ponta livre do cabo é puxada com ${fmt(F, 1)} N. Desprezando as massas do cabo e da polia e os atritos, com g = 10 m/s², a aceleração da carga é`,
          options,
          answer,
          hint: 'Dois ramos puxam a carga para cima, cada um com a tração T. Depois, ΣF = m·a.',
          steps: [
            `Na carga: dois ramos puxando para cima (2T) e o peso de ${fmt(m * G, 0)} N para baixo.`,
            `2·T − m·g = m·a, com T = ${fmt(F, 1)} N.`,
            `a = (2 × ${fmt(F, 1)} − ${fmt(m * G, 0)})/${m} = (${fmt(2 * F, 0)} − ${fmt(m * G, 0)})/${m} = **${fmt(a, 2)} m/s²**, para cima.`,
          ],
          explanation: `1. Forças na carga: 2·T para cima e m·g = ${m * G} N para baixo.\n2. 2·T = 2 × ${fmt(F, 1)} = ${fmt(2 * F, 0)} N.\n3. a = (${fmt(2 * F, 0)} − ${m * G})/${m} = **${fmt(a, 2)} m/s²**, para cima.`,
        };
      },
    },
    {
      id: 'mec-din-06',
      type: 'gen',
      difficulty: 2,
      lessonRef: 4,
      title: 'Velocidade mínima no looping',
      roteiro: 'circular',
      generate(rng) {
        const R = pickOne(rng, [2.5, 3.6, 4.9, 6.4, 8.1, 10, 12.1, 14.4]);
        const v = Math.sqrt(G * R);
        const { options, answer } = numericOptions({
          correct: v,
          unit: 'm/s',
          digits: 2,
          correctWhy: `No limite, o peso é a força centrípeta: m·g = m·v²/R → v = √(g·R) = √(10 × ${fmt(R, 1)}) = ${fmt(v, 2)} m/s.`,
          distractors: [
            { value: Math.sqrt(2 * G * R), why: '√(2·g·R) é a velocidade de queda livre de uma altura R, não a condição do topo.' },
            { value: Math.sqrt(5 * G * R), why: '√(5·g·R) é a velocidade mínima no ponto mais baixo do looping, não no topo.' },
            { value: G * R, why: 'Esqueceu a raiz quadrada: v² = g·R.' },
            { value: Math.sqrt(G / R), why: 'Inverteu: v = √(g·R).' },
          ],
        });
        return {
          prompt: `Num brinquedo de parque, um carrinho percorre um looping vertical de raio ${fmt(R, 1)} m. Desprezando os atritos, com g = 10 m/s², a menor velocidade que o carrinho pode ter no ponto mais alto, sem perder contato com o trilho, é`,
          options,
          answer,
          hint: 'No limite, a normal no topo vai a zero: só o peso faz a força centrípeta.',
          steps: [
            `No topo do looping, o centro fica abaixo do carrinho: peso e normal apontam para o centro.`,
            `N + m·g = m·v²/R; no limite de perder contato, N = 0 → m·g = m·v²/R.`,
            `v = √(g·R) = √(10 × ${fmt(R, 1)}) = **${fmt(v, 2)} m/s**.`,
          ],
          explanation: `1. No topo, a força centrípeta (para baixo, para o centro) é N + m·g = m·v²/R.\n2. Na velocidade mínima, N → 0: m·g = m·v²/R.\n3. v = √(g·R) = √(10 × ${fmt(R, 1)}) = **${fmt(v, 2)} m/s**.`,
        };
      },
    },
    {
      id: 'mec-din-07',
      type: 'gen',
      difficulty: 2,
      lessonRef: 5,
      title: 'Aceleração angular de uma polia',
      roteiro: 'rotacao',
      generate(rng) {
        const kind = pickOne(rng, [
          { nome: 'um aro fino', f: 1, outra: 0.5, formula: 'm·r²', outraNome: 'a do disco (m·r²/2)' },
          { nome: 'um disco maciço', f: 0.5, outra: 1, formula: 'm·r²/2', outraNome: 'a do aro (m·r²)' },
        ]);
        const m = pickOne(rng, [2, 4, 5, 8, 10, 20]);
        const r = pickOne(rng, [0.1, 0.2, 0.25, 0.4, 0.5]);
        const M = pickOne(rng, [1, 2, 2.5, 4, 5, 10]);
        const I = kind.f * m * r * r;
        const alpha = M / I;
        const { options, answer } = numericOptions({
          correct: alpha,
          unit: 'rad/s²',
          digits: 2,
          correctWhy: `I = ${kind.formula} = ${fmt(I, 4)} kg·m² → α = M/I = ${M}/${fmt(I, 4)} = ${fmt(alpha, 2)} rad/s².`,
          distractors: [
            { value: M / (kind.outra * m * r * r), why: `Usou a fórmula errada do momento de inércia: ${kind.outraNome}.` },
            { value: M / (kind.f * m * r), why: 'Esqueceu de elevar o raio ao quadrado.' },
            { value: M / m, why: 'Dividiu só pela massa: na rotação, quem resiste é o momento de inércia.' },
            { value: M * I, why: 'Multiplicou em vez de dividir: α = M/I.' },
          ],
        });
        return {
          prompt: `Uma polia que pode ser modelada como ${kind.nome} de ${m} kg e raio ${fmt(r, 2)} m gira sem atrito em torno do seu eixo central, sob um momento de ${fmt(M, 1)} N·m. A aceleração angular da polia é`,
          options,
          answer,
          hint: `ΣM = I·α, com I = ${kind.formula}.`,
          steps: [
            `Polia como ${kind.nome}: I = ${kind.formula} = ${kind.f === 1 ? '' : '0,5 × '}${m} × ${fmt(r, 2)}² = **${fmt(I, 4)} kg·m²**.`,
            `M = ${fmt(M, 1)} N·m (dado).`,
            `α = ${fmt(M, 1)}/${fmt(I, 4)} = **${fmt(alpha, 2)} rad/s²**.`,
          ],
          explanation: `1. I = ${kind.formula} = ${kind.f === 1 ? '' : '0,5 × '}${m} × ${fmt(r, 2)}² = **${fmt(I, 4)} kg·m²**.\n2. α = M/I = ${fmt(M, 1)}/${fmt(I, 4)} = **${fmt(alpha, 2)} rad/s²**.`,
        };
      },
    },
    {
      id: 'mec-din-08',
      type: 'gen',
      difficulty: 3,
      lessonRef: 6,
      title: 'Rolando rampa abaixo',
      roteiro: 'rolamento',
      generate(rng) {
        const bodies = [
          { n: 'aro (tubo de parede fina)', b: 1, bt: '1' },
          { n: 'cilindro maciço', b: 0.5, bt: '1/2' },
          { n: 'esfera maciça', b: 0.4, bt: '2/5' },
        ];
        const body = pickOne(rng, bodies);
        const ang = pickOne(rng, [
          { d: 30, s: 0.5 },
          { d: 37, s: 0.6 },
          { d: 53, s: 0.8 },
        ]);
        const a = (G * ang.s) / (1 + body.b);
        const others = bodies.filter((o) => o !== body).map((o) => ({ value: (G * ang.s) / (1 + o.b), why: `Esse é o resultado de um ${o.n} (β = ${o.bt}).` }));
        const { options, answer } = numericOptions({
          correct: a,
          unit: 'm/s²',
          digits: 2,
          correctWhy: `a = g·sen θ/(1 + β), com β = I/(m·r²) = ${body.bt}: a = ${fmt(G * ang.s, 1)}/${fmt(1 + body.b, 1)} = ${fmt(a, 2)} m/s².`,
          distractors: [
            { value: G * ang.s, why: 'g·sen θ é a aceleração de um bloco sem atrito, que não gira. Rolando, parte do peso vai para a rotação.' },
            ...others,
            { value: (G * ang.s * body.b) / (1 + body.b), why: 'Essa é a parcela que vira atrito (dividida pela massa), não a aceleração.' },
          ],
        });
        return {
          prompt: `Um ${body.n} desce rolando, sem deslizar, uma rampa inclinada de ${ang.d}° (sen ${ang.d}° = ${fmt(ang.s, 1)}). Com g = 10 m/s², a aceleração do centro do corpo é`,
          options,
          answer,
          hint: 'Translação: m·g·sen θ − f = m·a. Rotação: f·r = I·α, com α = a/r.',
          steps: [
            `${body.n[0].toUpperCase()}${body.n.slice(1)}: β = ${body.bt}.`,
            `a = g·sen θ/(1 + β) = 10 × ${fmt(ang.s, 1)}/(1 + ${body.bt}) = ${fmt(G * ang.s, 1)}/${fmt(1 + body.b, 1)}.`,
            `a = **${fmt(a, 2)} m/s²**, sem depender da massa nem do raio.`,
          ],
          explanation: `1. Translação: m·g·sen θ − f = m·a.\n2. Rotação: f·r = I·a/r → f = (I/r²)·a = β·m·a, com β = ${body.bt}.\n3. Somando: m·g·sen θ = m·a·(1 + β) → a = g·sen θ/(1 + β) = **${fmt(a, 2)} m/s²** — sem depender da massa nem do raio.`,
        };
      },
    },
    {
      id: 'mec-din-09',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Uma caixa de 30 kg está parada num piso horizontal (μ_{e} = 0,5; μ_{c} = 0,4). Uma pessoa a empurra horizontalmente com 100 N e ela **não se move**. Com g = 10 m/s², a força de atrito sobre a caixa vale',
      options: [
        { text: '100 N.', why: 'Correta: parada, o atrito estático equilibra a força aplicada — vale só o necessário.' },
        { text: '150 N.', why: 'Esse é o máximo, μe·N; só é atingido na iminência de escorregar.' },
        { text: '120 N.', why: 'Esse é o atrito cinético, que só age com a caixa deslizando.' },
        { text: '300 N.', why: 'Esse é o peso (e a normal), não o atrito.' },
        { text: 'zero, porque a caixa está parada.', why: 'Se o atrito fosse zero, os 100 N acelerariam a caixa.' },
      ],
      answer: 0,
      explanation: 'Com a caixa parada, ΣF = 0 na horizontal: o atrito **estático** vale exatamente 100 N, contra a força. O máximo μ_{e}·N = 0,5 × 300 = 150 N só aparece na iminência do movimento.',
      roteiro: 'atrito',
      steps: [
        'N = m·g = 30 × 10 = 300 N.',
        'μe·N = 0,5 × 300 = 150 N; a pessoa empurra com 100 N.',
        '100 N < 150 N: a caixa **não se move** e o atrito estático vale só o necessário para o equilíbrio: **100 N**.',
      ],
    },
    {
      id: 'mec-din-10',
      difficulty: 1,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Um carro faz uma curva circular com o velocímetro marcando sempre 60 km/h. Durante a curva, a aceleração do carro',
      options: [
        { text: 'aponta para o centro da curva.', why: 'Correta: é a aceleração centrípeta, v²/R.' },
        { text: 'é nula, porque a velocidade é constante.', why: 'Só o módulo é constante; a direção muda, e isso exige aceleração.' },
        { text: 'é tangente à trajetória, no sentido do movimento.', why: 'Uma aceleração tangencial mudaria o valor da velocidade.' },
        { text: 'aponta para fora da curva.', why: 'A "força centrífuga" só aparece no referencial do carro; a aceleração aponta para o centro.' },
        { text: 'é vertical e igual a g.', why: 'Na vertical, o peso é equilibrado pela normal.' },
      ],
      answer: 0,
      explanation: 'No movimento circular **uniforme**, a velocidade muda de **direção** a todo instante: há aceleração **normal (centrípeta)**, a_{n} = v²/R, apontando para o centro. Não há componente tangencial, porque o módulo da velocidade não muda.',
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: velocímetro **constante** numa **curva** — o módulo da velocidade não muda, mas a direção muda o tempo todo.',
        'Mudar de direção exige aceleração centrípeta, a_{n} = v²/R. Componente tangencial não há, porque o módulo é constante.',
        'A aceleração **aponta para o centro** da curva. "Nula" é a troca clássica: confunde velocidade escalar constante com vetor constante.',
      ],
    },
    {
      id: 'mec-din-11',
      difficulty: 1,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'O momento de inércia de massa de um corpo rígido em relação a um eixo depende',
      options: [
        { text: 'da massa do corpo e de como ela está distribuída em relação ao eixo.', why: 'Correta: I = Σ m·r².' },
        { text: 'do momento aplicado ao corpo.', why: 'O momento aplicado define a aceleração angular, não o I.' },
        { text: 'da aceleração angular do corpo.', why: 'α = M/I é consequência; I é propriedade do corpo e do eixo.' },
        { text: 'do módulo de elasticidade do material.', why: 'Rigidez não entra no momento de inércia de massa.' },
        { text: 'da velocidade angular do corpo.', why: 'Girando rápido ou devagar, o I é o mesmo.' },
      ],
      answer: 0,
      explanation: 'I = Σ m·r²: só a **massa** e a **distância de cada parte até o eixo**. Por isso o mesmo corpo tem I diferentes para eixos diferentes (Steiner: I = I_{CM} + m·d²).',
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **momento de inércia de massa** — do que ele depende.',
        'I = Σ m·r²: só entram a **massa** e a **distância de cada parte até o eixo**.',
        'Fica "da massa e de como ela está distribuída em relação ao eixo". Momento aplicado, α e ω não aparecem em Σ m·r².',
      ],
    },
    {
      id: 'mec-din-12',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Uma esfera maciça, um cilindro maciço e um aro, de massas e raios diferentes, são soltos juntos do alto da mesma rampa e descem rolando sem deslizar. A ordem de chegada é',
      options: [
        { text: 'esfera, cilindro e aro.', why: 'Correta: β = 2/5, 1/2 e 1 — menor β, maior aceleração.' },
        { text: 'aro, cilindro e esfera.', why: 'Ao contrário: o aro tem toda a massa na borda e é o mais lento.' },
        { text: 'todos juntos, pois a aceleração não depende da forma.', why: 'Não depende da massa nem do raio, mas depende da forma (I/(m·r²)).' },
        { text: 'o mais pesado primeiro, qualquer que seja a forma.', why: 'A massa se cancela: a = g·sen θ/(1 + β).' },
        { text: 'cilindro, esfera e aro.', why: 'A esfera (β = 2/5) ganha do cilindro (β = 1/2).' },
      ],
      answer: 0,
      explanation: 'Rolando sem deslizar, a = g·sen θ/(1 + β), com β = I/(m·r²): **esfera** (2/5) → 0,71·g·sen θ; **cilindro** (1/2) → 0,67·g·sen θ; **aro** (1) → 0,5·g·sen θ. Massa e raio não importam.',
      roteiro: 'rolamento',
      steps: [
        'Esfera: β = 2/5; cilindro: 1/2; aro: 1.',
        'a = g·sen θ/(1 + β): esfera 0,71·g·sen θ; cilindro 0,67·g·sen θ; aro 0,5·g·sen θ.',
        'Maior aceleração chega primeiro: **esfera, cilindro e aro** — massa e raio não importam.',
      ],
    },
    {
      id: 'mec-din-13',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Um bloco está **na iminência** de escorregar numa rampa. Se ele for trocado por outro do mesmo material e com o triplo da massa, o novo bloco',
      options: [
        { text: 'continua na iminência: o ângulo-limite (tg θ = μe) não depende da massa.', why: 'Correta: peso e atrito máximo crescem na mesma proporção.' },
        { text: 'escorrega, porque o peso ao longo da rampa triplicou.', why: 'O atrito máximo também triplicou (a normal triplicou).' },
        { text: 'fica mais firme, porque a normal triplicou.', why: 'O peso ao longo da rampa também triplicou.' },
        { text: 'escorrega com o triplo da aceleração.', why: 'Nem escorrega, e a aceleração não depende da massa.' },
        { text: 'sobe a rampa.', why: 'Nenhuma força puxa o bloco para cima.' },
      ],
      answer: 0,
      explanation: 'Na iminência, m·g·sen θ = μ_{e}·m·g·cos θ → **tg θ = μ_{e}**. A massa aparece dos dois lados e se cancela: o ângulo de repouso depende só dos materiais.',
      roteiro: 'rampa',
      steps: [
        'Peso ao longo da rampa (m·g·sen θ) e normal (m·g·cos θ): os dois triplicam com a massa.',
        'Atrito máximo, μe·m·g·cos θ: também triplica.',
        'Na iminência, m·g·sen θ = μe·m·g·cos θ → tg θ = μe. A massa se cancela: o novo bloco **continua na iminência**.',
      ],
    },
    {
      id: 'mec-din-14',
      difficulty: 2,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Três partículas, de 1 kg, 3 kg e 4 kg, deslizam sem atrito sobre uma mesa horizontal. Sobre elas agem forças externas horizontais de 10 N, 6 N e 8 N, respectivamente: as duas primeiras para leste e a terceira para oeste (além de forças internas entre as partículas). O módulo da aceleração do centro de massa do sistema é',
      options: [
        { text: '1 m/s².', why: 'Correta: (10 + 6 − 8)/(1 + 3 + 4) = 8/8.' },
        { text: '3 m/s².', why: 'Somou as forças sem considerar o sentido: 24/8.' },
        { text: '8 m/s².', why: 'Esqueceu de dividir pela massa total.' },
        { text: 'zero, porque as forças internas se anulam.', why: 'As internas se anulam, mas as externas não.' },
        { text: '2 m/s².', why: 'Dividiu a resultante (8 N) só pela maior massa (4 kg).' },
      ],
      answer: 0,
      explanation: 'Para o centro de massa, só as **externas**: ΣF_{ext} = 10 + 6 − 8 = 8 N (para leste) e m_{total} = 8 kg → **a_{CM} = 1 m/s²**. As forças internas aparecem aos pares (ação e reação) e se cancelam.',
      roteiro: 'centro-massa',
      steps: [
        'Externas: 10 N e 6 N para leste, 8 N para oeste. As internas se anulam aos pares.',
        'ΣF_{ext} = 10 + 6 − 8 = 8 N, para leste.',
        'a_{CM} = 8/(1 + 3 + 4) = **1 m/s²**.',
      ],
    },
    {
      id: 'mec-din-15',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Um trem percorre três trechos: (I) uma reta, ganhando velocidade; (II) outra reta, com velocidade constante; (III) uma curva circular, com o velocímetro parado no mesmo valor. A aceleração do trem é diferente de zero',
      options: [
        { text: 'nos trechos I e III, apenas.', why: 'Correta: em I há aceleração tangencial; em III, centrípeta.' },
        { text: 'no trecho I, apenas.', why: 'Na curva, mesmo com o velocímetro parado, há aceleração centrípeta.' },
        { text: 'nos trechos I e II, apenas.', why: 'Em II (reta e velocidade constante) a aceleração é zero.' },
        { text: 'nos três trechos.', why: 'Em II a aceleração é zero.' },
        { text: 'no trecho III, apenas.', why: 'Em I a velocidade aumenta: há aceleração tangencial.' },
      ],
      answer: 0,
      explanation: 'Aceleração aparece quando a velocidade muda em **módulo** (trecho I, tangencial) ou em **direção** (trecho III, centrípeta). Só no trecho II — reta com velocidade constante — ela é nula.',
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: aceleração diferente de zero — a velocidade muda em **módulo** ou em **direção**.',
        'Trecho I: o módulo cresce (aceleração tangencial). Trecho II: reta com módulo constante (a = 0). Trecho III: a direção muda (centrípeta).',
        'Há aceleração nos trechos **I e III, apenas**.',
      ],
    },
    {
      id: 'mec-din-16',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Dois blocos, de 7 kg e 3 kg, estão pendurados nas pontas de um fio que passa por uma polia fixa ideal (máquina de Atwood). Com g = 10 m/s², o módulo da aceleração dos blocos é',
      options: [
        { text: '4 m/s².', why: 'Correta: (7 − 3) × 10/(7 + 3).' },
        { text: '10 m/s².', why: 'Isso seria queda livre: o bloco menor freia o maior.' },
        { text: '5,7 m/s².', why: 'Dividiu só pela massa maior: o fio acelera os dois blocos.' },
        { text: '13,3 m/s².', why: 'Dividiu pela massa menor.' },
        { text: '2 m/s².', why: 'Contou a massa total duas vezes.' },
      ],
      answer: 0,
      explanation: 'A diferença de pesos, (7 − 3) × 10 = 40 N, acelera a massa total de 10 kg: **a = 4 m/s²**. A tração no fio é T = 7 × (10 − 4) = 42 N.',
      roteiro: 'fios-polias',
      steps: [
        'Bloco de 7 kg: peso de 70 N e tração T. Bloco de 3 kg: peso de 30 N e tração T.',
        '7 kg desce: 70 − T = 7·a. 3 kg sobe: T − 30 = 3·a.',
        'Somando: 40 = 10·a → **a = 4 m/s²** (e T = 42 N).',
      ],
    },
    {
      id: 'mec-din-17',
      difficulty: 3,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Uma barra homogênea de 1,5 m, articulada sem atrito numa das pontas, é solta do repouso na posição horizontal. Com g = 10 m/s², a aceleração angular da barra no instante em que é solta vale',
      options: [
        { text: '10 rad/s².', why: 'Correta: α = (m·g·L/2)/(m·L²/3) = 3g/(2L).' },
        { text: '40 rad/s².', why: 'Usou I = m·L²/12, que vale para o eixo no centro, não na articulação.' },
        { text: '20 rad/s².', why: 'Usou o braço L: o peso atua no centro da barra, a L/2 da articulação.' },
        { text: '6,7 rad/s².', why: 'Fez g/L, que não vem de ΣM = I·α.' },
        { text: 'zero, porque a barra parte do repouso.', why: 'Partir do repouso zera a velocidade angular, não a aceleração angular.' },
      ],
      answer: 0,
      explanation: 'Em relação à articulação: M = m·g·(L/2) e I = m·L²/3. Então α = M/I = 3g/(2L) = 30/3 = **10 rad/s²** — a massa se cancela.',
      roteiro: 'rotacao',
      steps: [
        'Barra homogênea girando pela ponta: I = m·L²/3.',
        'O peso atua no meio da barra: M = m·g·(L/2).',
        'α = M/I = 3g/(2L) = 30/3 = **10 rad/s²** — a massa se cancela.',
      ],
    },
    {
      id: 'mec-din-18',
      difficulty: 3,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Uma esfera maciça rola sem deslizar. Que fração da sua energia cinética total está na **rotação**?',
      options: [
        { text: '2/7 (≈ 29 %).', why: 'Correta: β/(1 + β) = 0,4/1,4.' },
        { text: '2/5 (40 %).', why: '2/5 é β = I/(m·r²), não a fração da energia.' },
        { text: '1/2 (50 %).', why: 'Essa é a fração do aro (β = 1).' },
        { text: '1/3 (≈ 33 %).', why: 'Essa é a fração do cilindro maciço (β = 1/2).' },
        { text: '5/7 (≈ 71 %).', why: 'Essa é a parcela da translação.' },
      ],
      answer: 0,
      explanation: 'E_{rot} = I·ω²/2 = β·m·v²/2 (porque ω = v/r) e E_{trans} = m·v²/2. A fração na rotação é β/(1 + β) = (2/5)/(7/5) = **2/7**.',
      roteiro: 'rolamento',
      steps: [
        'Esfera maciça: β = 2/5.',
        'E_{rot}/E_{total} = β/(1 + β), porque ω = v/r.',
        '(2/5)/(7/5) = **2/7 ≈ 29 %** da energia está na rotação.',
      ],
    },
    {
      id: 'mec-din-19',
      type: 'ce',
      difficulty: 1,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Um corpo em movimento circular uniforme tem aceleração diferente de zero.',
      answer: true,
      explanation: 'Certo. A velocidade tem módulo constante, mas muda de **direção**: há aceleração centrípeta, v²/R, apontando para o centro.',
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: movimento **uniforme** (módulo constante) e aceleração **diferente de zero**.',
        'No MCU a velocidade muda de direção: há aceleração centrípeta, v²/R, apontando para o centro.',
        'A aceleração não é nula: **Certo**.',
      ],
    },
    {
      id: 'mec-din-20',
      type: 'ce',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Enquanto uma caixa permanece parada sobre um piso, a força de atrito sobre ela vale sempre μ_{e}·N.',
      answer: false,
      explanation: 'Errado. Parado, o atrito estático vale **só o necessário** para equilibrar as outras forças (pode até ser zero). μ_{e}·N é o **máximo**, atingido na iminência do movimento.',
      roteiro: 'atrito',
      steps: [
        'A normal (m·g) define só o **máximo** do atrito estático, μe·N.',
        'Parada, a caixa está em equilíbrio: o atrito iguala as outras forças horizontais, que podem ser menores que μe·N — ou zero.',
        'μe·N só aparece na iminência do movimento: **Errado**.',
      ],
    },
    {
      id: 'mec-din-21',
      type: 'ce',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'No rolamento sem deslizamento, o atrito entre a roda e o piso dissipa energia mecânica em calor.',
      answer: false,
      explanation: 'Errado. O ponto de contato não escorrega: o atrito é **estático** e não dissipa energia. Ele só transfere parte da energia para a rotação (m·g·h = m·v²/2 + I·ω²/2).',
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: **dissipa** energia, no rolamento **sem deslizamento**.',
        'Sem deslizar, o ponto de contato não escorrega: o atrito é **estático** e não dissipa; só transfere energia para a rotação.',
        'm·g·h = m·v²/2 + I·ω²/2, sem perdas: **Errado**.',
      ],
    },
    {
      id: 'mec-din-22',
      type: 'ce',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Com a mesma massa e o mesmo raio, um aro fino tem o dobro do momento de inércia de um disco maciço em relação ao eixo central.',
      answer: true,
      explanation: 'Certo. Aro: I = m·r²; disco: I = m·r²/2. No aro, toda a massa está na distância máxima do eixo.',
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: **o dobro**, comparando aro e disco de mesma massa e raio.',
        'Aro: I = m·r² (toda a massa no raio máximo). Disco: I = m·r²/2.',
        'm·r² = 2 × (m·r²/2): **Certo**.',
      ],
    },
    {
      id: 'mec-din-23',
      type: 'ce',
      difficulty: 2,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Num elevador que desce e está freando, a força que o piso exerce sobre um passageiro é menor que o peso dele.',
      answer: false,
      explanation: 'Errado. Descendo e **freando**, a aceleração aponta para **cima**: N = m·(g + a), **maior** que o peso. A sensação de "pesar menos" acontece descendo e acelerando.',
      roteiro: 'elevador',
      steps: [
        'Desce e **freia**: a aceleração é contra o movimento → aponta para **cima**.',
        'N − m·g = m·a, com a para cima.',
        'N = m·(g + a) > m·g: a força do piso é **maior** que o peso. **Errado**.',
      ],
    },
    {
      id: 'mec-din-24',
      type: 'ce',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'O ângulo de inclinação a partir do qual um bloco começa a escorregar numa rampa não depende da massa do bloco.',
      answer: true,
      explanation: 'Certo. A condição é tg θ > μ_{e}: o peso ao longo da rampa e o atrito máximo crescem juntos com a massa.',
      roteiro: 'rampa',
      steps: [
        'Ao longo da rampa: m·g·sen θ; normal: m·g·cos θ.',
        'Atrito máximo: μe·m·g·cos θ.',
        'Escorrega quando m·g·sen θ > μe·m·g·cos θ → tg θ > μe: a massa se cancela. **Certo**.',
      ],
    },
  ],
  games: [
    {
      id: 'mec-din-g1',
      type: 'sort',
      title: 'A aceleração rampa abaixo sobe, desce ou fica?',
      intro: 'Um corpo desce uma rampa. O que cada mudança faz com a **aceleração** dele?',
      lessonRef: 6,
      bins: ['Aumenta', 'Diminui', 'Não muda'],
      items: [
        { text: 'Inclinar mais a rampa (bloco que já escorrega)', bin: 0, why: 'a = g·(sen θ − μc·cos θ) cresce com θ.' },
        { text: 'Dobrar a massa do bloco', bin: 2, why: 'A massa se cancela: peso e atrito crescem juntos.' },
        { text: 'Usar uma superfície com μc maior', bin: 1, why: 'Mais atrito contra o movimento.' },
        { text: 'Trocar um cilindro maciço por um aro de mesma massa e raio', bin: 1, why: 'β passa de 1/2 para 1: a = g·sen θ/(1 + β) cai.' },
        { text: 'Trocar o cilindro maciço por uma esfera maciça', bin: 0, why: 'β cai de 1/2 para 2/5.' },
        { text: 'Aumentar o raio do cilindro, mantendo a massa', bin: 2, why: 'Rolando sem deslizar, o raio se cancela.' },
        { text: 'Puxar o bloco rampa acima com uma força pequena (ele continua descendo)', bin: 1, why: 'A força se opõe ao movimento.' },
        { text: 'Encerar a rampa (μc menor) sob um bloco que já escorrega', bin: 0, why: 'Menos atrito contra o movimento.' },
        { text: 'Deixar a rampa sem atrito sob um cilindro (ele passa a escorregar sem girar)', bin: 0, why: 'Sem atrito, nada o faz girar: a = g·sen θ, maior que 2/3·g·sen θ.' },
        { text: 'Aumentar só o μe, com o bloco já deslizando', bin: 2, why: 'Deslizando, vale o atrito cinético.' },
      ],
    },
    {
      id: 'mec-din-g2',
      type: 'match',
      title: 'Fórmulas da dinâmica',
      intro: 'Ligue cada grandeza à sua expressão.',
      lessonRef: 5,
      leftLabel: 'Grandeza',
      rightLabel: 'Expressão',
      perRound: 6,
      pairs: [
        { left: 'Atrito estático máximo', right: 'μe·N', why: 'Parado, o atrito vai de zero até esse valor.' },
        { left: 'Atrito cinético', right: 'μc·N', why: 'Constante enquanto desliza.' },
        { left: 'Normal num plano inclinado', right: 'm·g·cos θ', why: 'Equilibra a componente do peso perpendicular à rampa.' },
        { left: 'Aceleração centrípeta', right: 'v²/R, para o centro', why: 'Muda a direção da velocidade.' },
        { left: 'Velocidade mínima no topo do looping', right: '√(g·R)', why: 'O peso sozinho faz a força centrípeta.' },
        { left: 'Momento de inércia do aro', right: 'm·r²', why: 'Toda a massa na borda.' },
        { left: 'Momento de inércia do disco maciço', right: 'm·r²/2', why: 'Metade do aro de mesma massa e raio.' },
        { left: 'Rolar sem deslizar', right: 'v = ω·r', why: 'O ponto de contato fica parado.' },
        { left: '2ª lei na rotação', right: 'ΣM = I·α', why: 'O análogo de ΣF = m·a.' },
        { left: 'Teorema dos eixos paralelos', right: 'I = I_{CM} + m·d²', why: 'Steiner.' },
      ],
    },
    {
      id: 'mec-din-g3',
      type: 'order',
      title: 'Caixa puxada com atrito',
      intro: 'Ponha em ordem o roteiro para achar a aceleração de uma caixa puxada sobre um piso com atrito.',
      lessonRef: 1,
      steps: [
        { text: 'Desenhar o diagrama de corpo livre: peso, normal, atrito e a força F', why: 'Sem todas as forças, a soma sai errada.' },
        { text: 'Achar a normal pelo equilíbrio na direção perpendicular ao piso', why: 'No piso horizontal e com F horizontal, N = m·g.' },
        { text: 'Calcular o atrito estático máximo μe·N', why: 'É o limite para a caixa sair do lugar.' },
        { text: 'Comparar a força que tenta mover a caixa com μe·N', why: 'A pergunta-chave: ela sai do lugar?' },
        { text: 'Se não vence, a = 0; se vence, o atrito passa a ser μc·N', why: 'A pegadinha clássica está aqui.' },
        { text: 'Aplicar ΣF = m·a no sentido do movimento', why: 'a = (F − μc·N)/m.' },
      ],
    },
    {
      id: 'mec-din-lab1',
      type: 'lab',
      lab: 'ramp',
      title: 'Rampa: atrito e rolamento',
      intro: 'Uma caixa com atrito e corpos que rolam. Puxe, incline e preveja: quando a caixa sai do lugar, quanto vale o atrito e quem desce mais rápido.',
      lessonRef: 2,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { body: 0, theta: 0, m: 40, mus: 0.5, muk: 0.3, F: 150 },
          prompt: 'Caixa de **40 kg** no piso (μ_{e} = 0,5; μ_{c} = 0,3), puxada com 150 N: está parada. Se a força subir para **180 N**, a caixa…',
          change: { F: 180 },
          options: ['Continua parada, e o atrito sobe para 180 N', 'Desliza com a = (180 − 120)/40 = 1,5 m/s²', 'Continua parada, com atrito de 200 N', 'Continua parada, com atrito de 120 N', 'Desliza com velocidade constante'],
          answer: 0,
          expect: [
            { out: 'f', trend: 'up' },
            { out: 'a', trend: 'same' },
            { out: 'regime', trend: 'same' },
          ],
          why: 'O atrito estático máximo é μ_{e}·N = 0,5 × 400 = **200 N**. Com 180 N a caixa não sai do lugar, e o atrito acompanha a força: vale **180 N**. Usar μ_{c} aqui é a pegadinha.',
        },
        {
          kind: 'predict',
          setup: { body: 0, theta: 0, m: 40, mus: 0.5, muk: 0.3, F: 180 },
          prompt: 'Agora a força vai para **240 N**, acima do atrito estático máximo (200 N). A caixa…',
          change: { F: 240 },
          options: ['Desliza com a = 3 m/s², e o atrito cai para 120 N', 'Desliza com a = 1 m/s² (240 − 200 = 40 N)', 'Continua parada', 'Desliza com a = 6 m/s², sem atrito', 'Desliza com velocidade constante'],
          answer: 0,
          expect: [
            { out: 'a', trend: 'up' },
            { out: 'f', trend: 'down' },
            { out: 'slips', trend: 'up' },
          ],
          why: 'Vencido o estático, quem age é o **cinético**: μ_{c}·N = 0,3 × 400 = 120 N. Então a = (240 − 120)/40 = **3 m/s²**. Repare no gráfico: o atrito "cai" quando a caixa sai do lugar.',
        },
        {
          kind: 'goal',
          setup: { body: 0, theta: 0, m: 50, mus: 0.5, muk: 0.4, F: 0 },
          lock: ['body', 'theta', 'm', 'mus', 'muk'],
          prompt: 'Puxe a caixa de **50 kg** (μ_{e} = 0,5; μ_{c} = 0,4) com a força certa para que ela deslize com **a = 2 m/s²**.',
          goals: [{ out: 'a', min: 1.95, max: 2.05, label: 'a = 2 m/s²' }],
          hint: 'Primeiro vença o atrito estático (μe·N = 250 N). Deslizando, a = (F − μc·N)/m.',
          solution: { F: 300 },
          why: 'F − μ_{c}·N = m·a → F = 200 + 50 × 2 = **300 N**, que também vence o estático (250 N). Se F ficasse abaixo de 250 N, a caixa nem sairia do lugar.',
        },
        {
          kind: 'predict',
          setup: { body: 0, theta: 15, m: 20, mus: 0.4, muk: 0.3, F: 0 },
          prompt: 'A caixa de 20 kg está parada na rampa de **15°** (μ_{e} = 0,4). O atrito que a segura agora vale…',
          options: ['m·g·sen θ ≈ 51,8 N: só o necessário', 'μe·N ≈ 77,3 N: o máximo', 'μc·N ≈ 58 N', 'm·g = 200 N', 'Zero, porque a caixa está parada'],
          answer: 0,
          why: 'Parada, ΣF = 0 ao longo da rampa: o atrito equilibra P·sen θ = 200 × sen 15° ≈ **51,8 N**. O máximo, μ_{e}·N ≈ 77,3 N, só seria atingido na iminência de escorregar.',
        },
        {
          kind: 'predict',
          setup: { body: 0, theta: 15, m: 20, mus: 0.4, muk: 0.3, F: 0 },
          prompt: 'Se a massa da caixa **triplicar** (20 → 60 kg), na mesma rampa de 15°…',
          change: { m: 60 },
          options: ['Continua parada: tg θ ≤ μe não depende da massa', 'Escorrega, porque o peso aumentou', 'Escorrega, porque o atrito máximo não muda', 'Continua parada, e o atrito não muda', 'Sobe a rampa'],
          answer: 0,
          expect: [
            { out: 'a', trend: 'same' },
            { out: 'regime', trend: 'same' },
            { out: 'f', trend: 'up' },
          ],
          why: 'P·sen θ e μ_{e}·N triplicam juntos: a condição tg 15° = 0,27 ≤ 0,4 continua valendo. O atrito triplica (≈ 155 N), mas segue abaixo do máximo.',
        },
        {
          kind: 'goal',
          setup: { body: 0, theta: 10, m: 20, mus: 0.45, muk: 0.3, F: 0 },
          lock: ['body', 'm', 'mus', 'muk', 'F'],
          prompt: 'Incline a rampa até a caixa (μ_{e} = 0,45) **começar a escorregar** — no menor ângulo em que isso acontece.',
          goals: [
            { out: 'slips', min: 1, label: 'A caixa escorrega' },
            { out: 'Pt', max: 86, label: 'No menor ângulo possível' },
          ],
          hint: 'Ela escorrega quando tg θ > μe. Suba grau a grau.',
          solution: { theta: 25 },
          why: 'tg θ = 0,45 → θ ≈ 24,2°: a **25°** a caixa escorrega. Esse ângulo de repouso não depende da massa, só de μ_{e}.',
        },
        {
          kind: 'predict',
          setup: { body: 2, theta: 30, mus: 0.4, muk: 0.3 },
          prompt: 'O **cilindro maciço** rola sem deslizar. Trocando-o por um **aro** de mesma massa e mesmo raio, a aceleração rampa abaixo…',
          change: { body: 1 },
          options: ['Diminui: o aro tem a massa longe do eixo (I maior)', 'Aumenta: o aro é oco e mais leve no meio', 'Não muda: massa e raio são os mesmos', 'Vai a zero: o aro não rola', 'Dobra'],
          answer: 0,
          expect: [
            { out: 'a', trend: 'down' },
            { out: 'I', trend: 'up' },
            { out: 'erot', trend: 'up' },
          ],
          why: 'a = g·sen θ/(1 + β): cilindro (β = 1/2) → 3,33 m/s²; aro (β = 1) → **2,5 m/s²**. No aro, metade da energia cinética vai para a rotação (no cilindro, um terço).',
        },
        {
          kind: 'predict',
          setup: { body: 3, theta: 30, m: 20, r: 0.2 },
          prompt: 'Uma esfera maciça rola rampa abaixo. Trocamos por outra esfera maciça **10 vezes mais pesada e com o dobro do raio**. A aceleração do centro…',
          change: { m: 200, r: 0.4 },
          options: ['Não muda: a = 5·g·sen θ/7 para qualquer esfera maciça', 'Aumenta 10 vezes', 'Cai pela metade', 'Aumenta, porque o peso é maior', 'Diminui, porque o momento de inércia é maior'],
          answer: 0,
          expect: [
            { out: 'a', trend: 'same' },
            { out: 'I', trend: 'up' },
            { out: 'alpha', trend: 'down' },
          ],
          why: 'Massa e raio se cancelam: a = g·sen θ/(1 + 2/5) ≈ **3,57 m/s²** para qualquer esfera maciça. O I cresce 40 vezes e a aceleração angular α = a/r cai à metade.',
        },
        {
          kind: 'predict',
          setup: { body: 1, theta: 25, mus: 0.25, muk: 0.2 },
          prompt: 'O aro rola sem deslizar a 25° (μ_{e} = 0,25). Se a rampa for para **35°**…',
          change: { theta: 35 },
          options: ['Passa a rolar e escorregar: o atrito necessário passa do máximo', 'Continua rolando sem deslizar, só que mais rápido', 'Para de girar e só escorrega', 'Fica parado', 'Rola sem deslizar com a = g·sen 35°'],
          answer: 0,
          expect: [
            { out: 'slips', trend: 'up' },
            { out: 'regime', trend: 'up' },
            { out: 'a', trend: 'up' },
          ],
          why: 'Para rolar sem deslizar, o aro precisa de atrito igual a metade de P·sen θ. Isso só cabe em μ_{e}·N enquanto tg θ ≤ μ_{e}·(1 + β)/β = 0,5 (θ ≈ 26,6°). A 35°, ele **rola e escorrega**, e o atrito vira o cinético.',
        },
        {
          kind: 'goal',
          setup: { body: 0, theta: 30, m: 20, mus: 0.35, muk: 0.25, F: 0 },
          lock: ['body', 'theta', 'm', 'mus', 'muk'],
          prompt: 'A caixa de 20 kg escorrega na rampa de 30° (μ_{e} = 0,35). Puxe-a rampa acima com a **menor força possível** que a mantenha **parada**.',
          goals: [
            { out: 'regime', max: 0, label: 'Caixa parada' },
            { out: 'f', min: 59.5, label: 'Com a menor força possível' },
          ],
          hint: 'F mínima = m·g·sen θ − μe·m·g·cos θ: o atrito estático ajuda a segurar até o máximo dele.',
          solution: { F: 40 },
          why: 'P·sen θ = 100 N e μ_{e}·N = 0,35 × 173 ≈ 60,6 N. O atrito estático segura até 60,6 N, e F completa o resto: **≈ 39,4 N** (40 N na bancada). Com menos que isso, a caixa desce.',
        },
        {
          kind: 'predict',
          setup: { body: 3, theta: 30, mus: 0.4, muk: 0.3 },
          prompt: 'E se a rampa ficasse **sem atrito nenhum** (μ = 0)? A esfera…',
          change: { mus: 0, muk: 0 },
          options: ['Desce escorregando sem girar, com a = g·sen θ', 'Continua rolando sem deslizar', 'Fica parada: sem atrito não há movimento', 'Desce rolando mais devagar', 'Gira sem sair do lugar'],
          answer: 0,
          expect: [
            { out: 'a', trend: 'up' },
            { out: 'alpha', trend: 'down' },
            { out: 'slips', trend: 'up' },
          ],
          why: 'Quem faz a esfera girar é o momento do **atrito** em torno do centro. Sem atrito, ela escorrega sem girar, com a = g·sen θ = **5 m/s²** — mais rápido que rolando (3,57 m/s²).',
        },
      ],
    },
  ],
});
