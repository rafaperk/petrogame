import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

const TWO_PI = 2 * Math.PI;

/** Trincas (σ, τ, σ_eq) com σ² + 3τ² = σ_eq² — von Mises de conta exata. */
const VM_TRIPLES: readonly (readonly [number, number, number])[] = [
  [50, 50, 100],
  [20, 80, 140],
  [65, 40, 95],
  [55, 25, 70],
  [26, 40, 74],
  [69, 21, 78],
  [55, 20, 65],
  [66, 24, 78],
  [110, 50, 140],
  [39, 60, 111],
];

/** Chavetas paralelas (DIN 6885, aproximado): diâmetro da árvore → largura × altura (mm). */
const KEYS: Record<number, [number, number]> = { 25: [8, 7], 30: [10, 8], 40: [12, 8], 50: [14, 9] };

export default defineTopic({
  id: 'mec.eixos-mancais',
  name: 'Eixos e árvores, mancais e lubrificação',
  summary:
    'Eixos e árvores, chavetas e estrias; torque, forças nos dentes e reações nos mancais; flexão e torção combinadas (von Mises e Tresca); a fadiga da árvore que gira; a velocidade crítica; os rolamentos e a vida L_{10}; os mancais de deslizamento, a cunha de óleo, o número de Sommerfeld e a curva de Stribeck; e os lubrificantes (viscosidade, graus SAE e ISO, graxas).',
  order: 7,
  weight: 2,
  equipment: 'bearing',
  requires: ['mec.mecanismos-engrenagens'],
  edital: ['b1.combinados', 'b1.criterios', 'b2.vibracoes'],
  lesson: [
    {
      title: 'Eixos, árvores e a fixação das peças',
      hot: 'Caixa de marchas com engrenagens que **deslizam sobre estrias** da árvore (BR 2012): o estriado transmite o torque e deixa o cubo correr na direção axial.',
      body: '**Eixo** é o elemento que **suporta** peças (rodas, polias, roldanas), fixo ou girando, **sem transmitir torque** — como o eixo de uma roldana. **Árvore** é o que **gira e transmite potência**: a árvore de um redutor, o eixo de uma bomba. No dia a dia tudo vira "eixo", mas a banca pode cobrar a diferença.\n\nPara posicionar e prender as peças, a árvore é **escalonada** (ressaltos com **raios de concordância** generosos, para não concentrar tensão) e leva:\n- **chaveta**: peça encaixada num rasgo da árvore e do cubo, que transmite o torque. Tipos: **paralela** (plana), **meia-lua** (Woodruff), **inclinada** (de cunha, que também trava na direção axial) e **tangencial** (cargas altas e reversíveis);\n- **eixo estriado** (ranhurado): vários "dentes" em volta da árvore; transmite mais torque que uma chaveta e deixa o cubo **deslizar** na direção axial (caixas de câmbio);\n- **anéis elásticos** (de retenção) e **porcas**: seguram as peças na direção axial;\n- **pinos** e **cavilhas**: posicionam e prendem — às vezes como **fusível** (pino de cisalhamento).\n\n**Conta da chaveta** (árvore de diâmetro d, torque T, chaveta b × h × L): a força na face do rasgo é F = 2T/d.\n- cisalhamento na chaveta: **τ = F/(b·L) = 2T/(d·b·L)**;\n- esmagamento (contato em metade da altura): **σ = F/(L·h/2) = 4T/(d·h·L)**.',
      example: 'Árvore de 40 mm com 200 N·m e chaveta de 12 × 8 × 50 mm: F = 2 × 200/0,040 = 10.000 N; τ = 10.000/(12 × 50) = **16,7 MPa**; σ = 10.000/(4 × 50) = **50 MPa**.',
      tip: 'A chaveta costuma ser de aço **mais mole** que a árvore: numa sobrecarga, cisalha a chaveta (barata), não a árvore.',
      trap: 'Achar que a chaveta paralela prende a peça na direção axial. Ela só transmite torque; quem segura é o ressalto, o anel elástico ou a porca (a chaveta inclinada é a exceção, por cunha).',
      lab: { lab: 'shaft', preset: { brg: 0, P: 15, n: 1150, a: 400, d: 40 }, label: 'Ver a árvore em dois mancais' },
    },
    {
      title: 'Torque, força nos dentes e reações nos mancais',
      hot: 'Num redutor de várias marchas, o par de **maior torque** vai perto do mancal (BR 2012). Torque multiplicado pelo redutor: Petrobras 2011 e Transpetro 2018.',
      body: 'O dimensionamento começa pelo **torque** que a árvore transmite:\n\n**T = P/ω** (P em W, ω em rad/s) — ou, de cabeça, **T [N·m] ≈ 9.550·P [kW]/n [rpm]**. Mesma potência com menos rotação = **mais torque**.\n\nO torque vira **força nos dentes** da engrenagem (ou na correia da polia): **F_{t} = 2T/D**, com D = diâmetro primitivo. Em dentes retos há também a componente **radial**, F_{r} = F_{t}·tg α (α = ângulo de pressão, em geral 20°).\n\nCom a força F a uma distância a do mancal A (vão L, b = L − a), a árvore é uma **viga biapoiada**:\n- reações: **R_{A} = F·b/L** e **R_{B} = F·a/L**;\n- momento fletor máximo, sob a carga: **M = F·a·b/L** (no meio do vão, F·L/4);\n- o **torque** só existe entre a entrada (acoplamento) e a saída (engrenagem): depois dela, T = 0.\n\nPor isso as engrenagens e polias mais carregadas vão **perto dos mancais**: o momento fletor e a flecha caem — e o mancal vizinho passa a levar quase toda a carga.',
      example: '15 kW a 1.150 rpm: T = 9.550 × 15/1.150 ≈ **125 N·m**. Engrenagem de 250 mm: F_{t} = 2 × 125/0,25 = **1.000 N**. No meio de um vão de 800 mm: M = 1.000 × 0,8/4 = **200 N·m**; a 160 mm do mancal A: M = 1.000 × 0,16 × 0,64/0,8 = **128 N·m**.',
      tip: 'Num redutor, o par de **menor rotação** (mais torque, dentes mais carregados) é o que mais pede para ficar junto de um mancal.',
      trap: 'Achar que o torque age na árvore inteira: depois do elemento que tira a potência, o trecho só sofre flexão.',
      lab: { lab: 'shaft', preset: { brg: 0, P: 30, n: 600, a: 400, d: 40 }, label: 'Arrastar a engrenagem' },
    },
    {
      title: 'Flexão e torção juntas: von Mises e Tresca',
      body: 'Na superfície da árvore atuam ao mesmo tempo a tensão normal da **flexão** e a de cisalhamento da **torção** (seção circular cheia):\n- **σ = 32·M/(π·d³)**;\n- **τ = 16·T/(π·d³)**.\n\nPara um material **dúctil** (aço), junta-se as duas numa tensão equivalente e compara-se com o limite de escoamento σ_{e}:\n- **von Mises** (máxima energia de distorção): **σ_{eq} = √(σ² + 3τ²)** ≤ σ_{e}/n. Em torção pura, escoa com τ = 0,577·σ_{e};\n- **Tresca** (máxima tensão de cisalhamento): **τ_{máx} = √((σ/2)² + τ²)** ≤ σ_{e}/(2n). Em torção pura, escoa com τ = 0,5·σ_{e} — por isso é **mais conservador** (pede uma árvore um pouco mais grossa).\n\nIsolando o diâmetro:\n- Tresca: d³ = (32·n/(π·σ_{e}))·√(M² + T²);\n- von Mises: d³ = (32·n/(π·σ_{e}))·√(M² + ¾·T²).\n\nComo as tensões caem com **d³**, aumentar o diâmetro em 26 % já divide as tensões por 2.',
      example: 'Num ponto com σ = 55 MPa e τ = 25 MPa: von Mises = √(55² + 3 × 25²) = √(3.025 + 1.875) = **70 MPa**. Tresca: τ_{máx} = √(27,5² + 25²) ≈ **37,2 MPa**, que equivale a 74,3 MPa de tração.',
      tip: 'Material **frágil** (ferro fundido) não segue von Mises nem Tresca: usa-se a máxima tensão normal (Rankine) ou Coulomb-Mohr.',
      trap: 'Somar σ + τ, ou usar √(σ² + τ²): na equivalente de von Mises, o τ entra com peso **3**.',
      lab: { lab: 'shaft', preset: { brg: 0, P: 30, n: 600, a: 400, d: 40 }, label: 'Ver as tensões na seção' },
    },
    {
      title: 'Fadiga na árvore que gira',
      body: 'A carga da engrenagem fica **parada no espaço**, mas a árvore **gira**. Cada ponto da superfície passa pelo lado tracionado (embaixo) e pelo comprimido (em cima) a cada volta: a flexão vira tensão **alternada** (média zero, amplitude σ), um ciclo por rotação. O torque constante dá uma tensão **média**.\n\nPor isso árvores quase sempre falham por **fadiga**, não por sobrecarga:\n- **limite de fadiga** S_{e}: nos aços, cerca de 0,5·σ_{r} no corpo de prova polido, **reduzido** por acabamento superficial, tamanho, confiabilidade e temperatura;\n- **concentradores de tensão** (K_{f}): ressaltos com raio pequeno, **rasgos de chaveta**, furos e canais de anel elástico multiplicam a tensão local — é dali que a trinca parte;\n- **critérios** com tensão média e alternada (com von Mises nas duas): **Goodman**, σ_{a}/S_{e} + σ_{m}/σ_{r} = 1/n; **Soderberg**, mais conservador, com σ_{e} no lugar de σ_{r}; **Gerber**, uma parábola, menos conservador.\n\nO que aumenta a vida: raios de concordância generosos, bom acabamento (retífica, polimento), **jateamento com granalha** (*shot peening*, que deixa compressão residual na superfície) e evitar rasgos e furos nas seções mais carregadas.',
      example: 'Árvore com σ = 66 MPa (alternada) e τ = 19,5 MPa (constante), num aço com S_{e} = 200 MPa e σ_{r} = 565 MPa: σ\'_{m} = √3 × 19,5 = 33,7 MPa; Goodman: 1/n = 66/200 + 33,7/565 = 0,39 → **n ≈ 2,6**.',
      tip: 'A fratura por fadiga tem **marcas de praia** saindo do ponto de início e uma pequena região rugosa no fim (a ruptura final, instantânea).',
      trap: 'Achar que momento constante dá tensão constante na árvore que gira. Para cada ponto da árvore, a tensão inverte a cada meia volta.',
      lab: { lab: 'shaft', preset: { brg: 0, P: 30, n: 600, a: 400, d: 50 }, label: 'Ver a tensão alternada' },
    },
    {
      title: 'Velocidade crítica',
      hot: 'Velocidade crítica da árvore de um redutor (BR 2012). É a mesma conta da ressonância de motor sobre molas, que cai quase todo ano em vibrações (Transpetro 2011 e 2012, Petrobras 2014 e 2018).',
      body: 'Um rotor (engrenagem, disco, impelidor) sobre uma árvore forma um sistema **massa-mola**: a mola é a rigidez à flexão da própria árvore. Ele tem uma frequência natural — e o **desbalanceamento** residual empurra o rotor **uma vez por volta**. Quando a rotação coincide com a frequência natural, há **ressonância**: a árvore "chicoteia", com amplitude limitada só pelo amortecimento. Essa rotação é a **velocidade crítica**:\n- **ω_{c} = √(k/m)**, ou, pela **deflexão estática** δ que o peso do rotor provoca (Rayleigh), **ω_{c} = √(g/δ)**;\n- em rpm: n_{c} = 60·ω_{c}/(2π) ≈ 9,55·ω_{c}.\n\nRegras de projeto:\n- **eixo rígido**: trabalhar bem **abaixo** da primeira crítica (até uns 70 a 80 % dela) — a maioria das máquinas;\n- **eixo flexível**: trabalhar **acima** dela (turbinas, compressores centrífugos grandes), passando pela crítica depressa na partida e na parada;\n- **afastar-se** pelo menos uns 20 % da crítica.\n\nPara **subir** a crítica: aumentar o diâmetro (k ∝ d⁴, então n_{c} ∝ d²), encurtar o vão (k ∝ 1/L³), levar as massas para **perto dos mancais** e aliviar o rotor. **Balancear** diminui a força que excita, mas **não muda** a velocidade crítica.',
      example: 'Disco que deflete a árvore **0,25 mm** sob o próprio peso (g = 10 m/s²): ω_{c} = √(10/0,00025) = 200 rad/s → n_{c} = 200 × 60/(2π) ≈ **1.910 rpm**. Rodar a 1.750 rpm (92 % dela) é pedir vibração.',
      tip: 'Quanto **maior** a deflexão estática, **menor** a velocidade crítica: árvore mole e rotor pesado, crítica baixa.',
      trap: 'Achar que balancear o rotor eleva a velocidade crítica. O balanceamento só reduz a vibração (inclusive na passagem pela crítica).',
      lab: { lab: 'shaft', preset: { brg: 0, P: 7.5, n: 1750, a: 400, d: 30 }, label: 'Ver a árvore perto da crítica' },
    },
    {
      title: 'Mancais de rolamento',
      body: 'O rolamento troca o deslizamento por **rolamento**: **anel interno** (na árvore), **anel externo** (na caixa), **elementos rolantes** (esferas, rolos ou agulhas) e **gaiola** (o separador, que mantém o espaçamento). Os tipos mais cobrados:\n- **rígido de esferas**: o mais comum; carga radial e alguma axial, alta rotação;\n- **de contato angular**: radial + axial num sentido (montados aos pares);\n- **autocompensador** (de esferas ou de rolos): pista externa esférica, **aceita desalinhamento** e a flexão da árvore;\n- **de rolos cilíndricos**: grande carga **radial**, quase nenhuma axial;\n- **de rolos cônicos**: radial + axial **combinadas** (cubos de roda), montados aos pares, com ajuste da folga;\n- **de agulhas**: pouco **espaço radial**;\n- **axiais** (de escora): só carga **axial**.\n\n**Vida nominal** (90 % de confiabilidade): **L_{10} = (C/P)^{p}** milhões de rotações, com p = **3** para esferas e **10/3** para rolos. C = capacidade de carga **dinâmica** (a carga que dá 1 milhão de rotações) e P = carga equivalente (P = X·F_{r} + Y·F_{a}). Em horas: **L_{10h} = 10⁶·L_{10}/(60·n)**.\n\n**Defeitos**: descascamento (fadiga das pistas, o fim natural), **brinelamento** (mossas nas pistas por pancada ou sobrecarga parada — montagem a marteladas), falso brinelamento (vibração com o rolamento parado), corrosão, crateras por **passagem de corrente** elétrica e engripamento por falta de lubrificante. Na montagem, a força vai no **anel que tem interferência**, nunca através dos elementos rolantes; aquecer o rolamento (uns 80 a 100 °C) facilita.',
      example: 'Esferas, C = 15 kN, P = 3 kN: L_{10} = (15/3)³ = **125 milhões de rotações**; a 1.000 rpm, 125 × 10⁶/(60 × 1.000) ≈ **2.080 h**. Com P = 1,5 kN: 10³ = 1.000 milhões — **8 vezes** mais.',
      tip: 'Carga dobrada: vida **÷ 8** (esferas) ou **÷ 10** (rolos).',
      trap: 'Usar o expoente 3 para rolos, ou confundir a capacidade dinâmica C (vida) com a estática C_{0} (deformação permanente com o rolamento parado).',
      lab: { lab: 'shaft', preset: { brg: 0, P: 30, n: 600, a: 400, d: 50 }, label: 'Ver a vida dos rolamentos' },
    },
    {
      title: 'Mancais de deslizamento e a cunha de óleo',
      hot: 'Como o **número de Sommerfeld** muda quando se mexe em viscosidade, rotação, carga e folga (BR 2012). Monte a razão S_{novo}/S com S = (r/c)²·μ·N/P.',
      body: 'No mancal de deslizamento (bucha, casquilho, bronzina), a árvore gira dentro da bucha, separada dela por um **filme de óleo**. Materiais da bucha: **bronze**, **metal patente** (*babbitt*, liga mole de estanho ou chumbo que se acomoda e embute partículas), **bronze ou ferro sinterizado** impregnado de óleo (autolubrificante) e polímeros (PTFE, náilon).\n\nRegimes de lubrificação:\n- **hidrodinâmica**: o próprio giro **arrasta o óleo** para a folga que se estreita (a **cunha**) e gera a pressão que sustenta a árvore, que flutua um pouco **excêntrica**. Precisa de rotação: na partida e na parada há contato;\n- **hidrostática**: o óleo chega **bombeado sob pressão** de fora e sustenta a árvore **mesmo parada** — grandes cargas e baixas rotações;\n- **elasto-hidrodinâmica**: contatos concentrados (rolamentos, dentes de engrenagens), com filme finíssimo e as superfícies se deformando elasticamente;\n- **limítrofe** (de contorno): filme de poucas moléculas, as rugosidades se tocam — é onde trabalham os aditivos antidesgaste e de extrema pressão (EP);\n- **mista**: parte filme, parte contato.\n\nA **curva de Stribeck** mostra o atrito contra o parâmetro μ·N/P (viscosidade × rotação ÷ pressão): alto no regime limítrofe, cai no misto, passa por um **mínimo** e volta a subir devagar no hidrodinâmico (atrito viscoso).\n\nO **número de Sommerfeld**, **S = (r/c)²·μ·N/P** (r = raio, c = folga radial, N em rotações por segundo, P = carga/(L·D)), resume o mancal: S grande → árvore mais **centrada** e filme espesso; S pequeno → árvore encostando. Com carga leve e árvore centrada vale a equação de **Petroff**: f = 2π²·(r/c)·(μN/P).',
      example: 'Se a folga radial **dobrar**, (r/c)² cai para 1/4: S fica **4 vezes menor** e a árvore encosta mais. Se a viscosidade cair à metade e a rotação dobrar, S **não muda**.',
      tip: 'S **cresce** com viscosidade e rotação e **cai** com carga e folga.',
      trap: 'Achar que o mancal hidrodinâmico sustenta a árvore parada (isso é o hidrostático), ou que a árvore gira centrada na bucha sob carga.',
      lab: { lab: 'shaft', preset: { brg: 2, P: 10, n: 200, a: 400, d: 40, oil: 1, temp: 60, cr: 1 }, label: 'Ver o filme de óleo' },
    },
    {
      title: 'Lubrificantes: viscosidade, graus SAE e ISO, graxas',
      hot: 'Óleo **multiviscoso** num mancal: a quais graus SAE ele equivale no frio e a quente (BR 2012). O número com W vale para o frio; o sem W, para 100 °C.',
      body: 'A **viscosidade** (a resistência do óleo a escoar) é a propriedade mais importante — e **cai muito com a temperatura**. O **índice de viscosidade** (IV) mede essa sensibilidade: IV alto = viscosidade que varia **pouco** (sintéticos, multiviscosos).\n\nClassificações:\n- **ISO VG** (óleos industriais): o número é a viscosidade cinemática média a **40 °C**, em cSt (mm²/s): VG 32, 46, 68, 100, 150, 220...;\n- **SAE J300** (óleos de motor): graus de inverno **0W a 25W** (W = *winter*, viscosidade na partida a frio) e graus **20 a 60**, medidos a **100 °C**;\n- **multiviscoso** (ex.: SAE 15W-40): um aditivo melhorador do IV faz o óleo se comportar como um **15W no frio** e como um **SAE 40 quente**. Óleos de engrenagens usam outra escala (SAE J306: 75W-90, 80W-140...).\n\nOutras propriedades: **ponto de fulgor** (os vapores inflamam com uma chama), **ponto de combustão** (passam a queimar sem parar) e **ponto de fluidez** (a menor temperatura em que o óleo ainda escoa — quanto mais baixo, melhor no frio). Aditivos: antioxidantes, antidesgaste, **EP**, detergentes e dispersantes, melhoradores do IV, abaixadores do ponto de fluidez, antiespumantes e inibidores de corrosão.\n\n**Graxa** = óleo + **espessante** (sabão de lítio, cálcio ou sódio, complexo de lítio, argila). Fica no lugar, **veda** contra sujeira, dispensa sistema de circulação e serve bem a rolamentos e pontos de difícil acesso; em troca, refrigera mal e limita a rotação. A consistência segue a escala **NLGI** (000 a 6; a 2 é a mais usada). O **ponto de gota** (quando ela começa a pingar) fica bem acima da temperatura de trabalho: uma graxa de lítio pinga perto de 190 °C e trabalha até uns 120 °C.',
      example: 'Na bancada, a 0 °C o 10W-30 tem 336 cSt, igual ao SAE 10, enquanto o SAE 30 passa de 1.600 cSt. A 100 °C, o 10W-30 e o SAE 30 têm os mesmos 11,5 cSt.',
      tip: 'No grau SAE, o número **com W** vale para o frio; o número **sem W**, para 100 °C.',
      trap: 'Achar que o 15W-40 é mais grosso no frio do que um SAE 40. No frio ele se comporta como o 15W — é isso que facilita a partida.',
      lab: { lab: 'shaft', preset: { brg: 2, P: 10, n: 200, a: 400, d: 40, oil: 2, temp: 20, cr: 1 }, label: 'Comparar os óleos' },
    },
  ],
  roteiros: [
    {
      id: 'torque-forca',
      name: 'Do torque à força no dente',
      when: 'Potência e rotação de uma árvore; pedem o torque ou a força tangencial numa engrenagem ou polia.',
      steps: [
        'Passe a rotação para rad/s: ω = 2π·n/60.',
        'Torque: T = P/ω (P em W).',
        'Força no raio primitivo: F_{t} = T/r = 2T/D (D em metros).',
      ],
      note: 'Atalho: T [N·m] ≈ 9.550·P [kW]/n [rpm]. Mesmo torque, diâmetro menor → força maior.',
    },
    {
      id: 'momento-viga',
      name: 'Momento fletor sob uma carga (árvore biapoiada)',
      when: 'Árvore apoiada em dois mancais com uma carga concentrada (engrenagem, polia); pedem as reações ou o momento máximo.',
      steps: [
        'Ache as distâncias da carga aos dois apoios: a e b = L − a.',
        'Reação no apoio A, pelo equilíbrio de momentos: R_{A} = F·b/L.',
        'O momento máximo fica sob a carga: M = R_{A}·a = F·a·b/L.',
      ],
      note: 'Carga no meio: M = F·L/4. Perto de um apoio o momento cai — por isso a engrenagem mais carregada fica junto ao mancal.',
    },
    {
      id: 'von-mises',
      name: 'Tensão equivalente (von Mises × Tresca)',
      when: 'Ponto com flexão (σ) e torção (τ) ao mesmo tempo; pedem a tensão equivalente ou qual critério vale.',
      steps: [
        'Separe as tensões no ponto: σ da flexão e τ da torção.',
        'Escolha o critério: von Mises √(σ² + 3τ²); Tresca √(σ² + 4τ²).',
        'Calcule e compare com o escoamento (com o coeficiente de segurança, se houver).',
      ],
      note: 'Torção pura: Tresca escoa com τ = 0,5·σ_{e}; von Mises, com τ = 0,577·σ_{e}. Tresca é o mais conservador; os dois valem para materiais dúcteis.',
    },
    {
      id: 'velocidade-critica',
      name: 'Velocidade crítica de uma árvore',
      when: 'Rotor ou disco numa árvore; dão a rigidez e a massa, ou a deflexão estática; pedem a velocidade crítica.',
      steps: [
        'A velocidade crítica é a frequência natural do conjunto: ω_{c} = √(k/m).',
        'Com a deflexão estática δ, use k/m = g/δ: ω_{c} = √(g/δ), com δ em metros.',
        'Passe para rpm: n_{c} = 60·ω_{c}/(2π).',
      ],
      note: 'Sobe a crítica: árvore mais grossa, vão menor, rotor mais leve. Balancear não muda a crítica — só reduz a vibração.',
    },
    {
      id: 'vida-rolamento',
      name: 'Vida de rolamento (L_{10})',
      when: 'Rolamento com capacidade dinâmica C, carga P e rotação; pedem a vida em rotações ou em horas, ou o efeito de mudar a carga.',
      steps: [
        'Calcule a razão C/P.',
        'Eleve ao expoente: L_{10} = (C/P)^{p} milhões de rotações (p = 3 para esferas; 10/3 para rolos).',
        'Para horas, divida pelas rotações por hora: L_{10h} = L_{10}·10⁶/(60·n).',
      ],
      note: 'Dobrar a carga: vida 8 vezes menor (esferas). Dobrar a rotação: metade das horas, com as mesmas rotações.',
    },
    {
      id: 'sommerfeld',
      name: 'Número de Sommerfeld (mancal hidrodinâmico)',
      when: 'Mancal de deslizamento hidrodinâmico; pedem o efeito de mudar a viscosidade, a rotação, a carga ou a folga.',
      steps: [
        'Escreva S = (r/c)²·μ·N/P e marque quem fica em cima (μ e N) e quem fica embaixo (P e c²).',
        'Aplique cada fator; a folga entra ao quadrado.',
        'Conclua: S maior → filme mais grosso e árvore mais centrada.',
      ],
      note: 'Óleo mais viscoso ou rotação maior engrossam o filme; carga maior ou folga maior o afinam.',
    },
    {
      id: 'chaveta',
      name: 'Chaveta: cisalhamento e esmagamento',
      when: 'Chaveta prendendo engrenagem ou polia na árvore; pedem a tensão de cisalhamento, a de esmagamento ou o comprimento mínimo.',
      steps: [
        'Força na chaveta: o torque no raio da árvore, F = 2T/d.',
        'Escolha a área: cisalhamento → b·L (largura × comprimento); esmagamento → L·h/2 (metade da altura em contato).',
        'Tensão = F/área (N/mm² = MPa).',
      ],
      note: 'Cisalhamento usa a **largura**; esmagamento, a **meia altura**. Trocar as áreas é o distrator clássico.',
    },
  ],
  questions: [
    {
      id: 'mec-eix-01',
      type: 'gen',
      difficulty: 1,
      lessonRef: 1,
      title: 'Força nos dentes',
      roteiro: 'torque-forca',
      generate(rng) {
        const P = pickOne(rng, [5, 7.5, 10, 15, 20, 30]);
        const n = pickOne(rng, [300, 500, 600, 750, 1000, 1200, 1500]);
        const D = pickOne(rng, [100, 150, 200, 250, 300, 400]);
        const w = (TWO_PI * n) / 60;
        const T = (P * 1000) / w;
        const Ft = (2 * T) / (D / 1000);
        const { options, answer } = numericOptions({
          correct: Ft,
          unit: 'N',
          digits: 0,
          correctWhy: `T = P/ω = ${fmt(P * 1000, 0)}/${fmt(w, 2)} = ${fmt(T, 1)} N·m; F_{t} = 2T/D = 2 × ${fmt(T, 1)}/${fmt(D / 1000, 3)} = ${fmt(Ft, 0)} N.`,
          distractors: [
            { value: T / (D / 1000), why: 'Dividiu o torque pelo diâmetro: a força é T/r = 2T/D.' },
            { value: (2 * ((P * 1000) / n)) / (D / 1000), why: 'Usou a rotação em rpm como se fosse rad/s: ω = 2π·n/60.' },
            { value: (2 * ((P * 1000) / (n / 60))) / (D / 1000), why: 'Esqueceu o 2π: ω = 2π·n/60, não n/60.' },
            { value: (2 * T) / D, why: 'Deixou o diâmetro em milímetros.' },
          ],
        });
        return {
          prompt: `Uma árvore transmite ${fmt(P, 1)} kW a ${fmt(n, 0)} rpm para uma engrenagem de diâmetro primitivo ${D} mm. A força tangencial nos dentes dessa engrenagem é de, aproximadamente,`,
          options,
          answer,
          hint: 'Primeiro o torque, T = P/ω (ω = 2π·n/60). Depois a força no raio primitivo: F_{t} = T/r = 2T/D.',
          steps: [
            `ω = 2π × ${fmt(n, 0)}/60 = ${fmt(w, 2)} rad/s.`,
            `T = ${fmt(P * 1000, 0)}/${fmt(w, 2)} = ${fmt(T, 1)} N·m.`,
            `F_{t} = 2 × ${fmt(T, 1)}/${fmt(D / 1000, 3)} ≈ **${fmt(Ft, 0)} N**.`,
          ],
          explanation: `ω = 2π × ${fmt(n, 0)}/60 = ${fmt(w, 2)} rad/s; T = ${fmt(P * 1000, 0)}/${fmt(w, 2)} = ${fmt(T, 1)} N·m; F_{t} = 2T/D = 2 × ${fmt(T, 1)}/${fmt(D / 1000, 3)} ≈ **${fmt(Ft, 0)} N**.`,
        };
      },
    },
    {
      id: 'mec-eix-02',
      type: 'gen',
      difficulty: 2,
      lessonRef: 1,
      title: 'Momento fletor sob a polia',
      roteiro: 'momento-viga',
      generate(rng) {
        const L = pickOne(rng, [400, 500, 600, 800, 1000]);
        const a = L * pickOne(rng, [0.2, 0.25, 0.3, 0.4, 0.5]);
        const b = L - a;
        const F = pickOne(rng, [1000, 1200, 1500, 2000, 2400, 3000, 4000, 5000]);
        const RA = (F * b) / L;
        const M = (F * a * b) / L / 1000;
        const { options, answer } = numericOptions({
          correct: M,
          unit: 'N·m',
          digits: 1,
          correctWhy: `R_{A} = F·b/L = ${fmt(RA, 0)} N; M = R_{A}·a = ${fmt(RA, 0)} × ${fmt(a / 1000, 3)} = ${fmt(M, 1)} N·m.`,
          distractors: [
            { value: (F * L) / 4 / 1000, why: 'F·L/4 só vale com a carga no meio do vão.' },
            { value: (F * a) / 1000, why: 'Tratou a árvore como viga em balanço: com dois apoios, M = F·a·b/L.' },
            { value: (F * b) / 1000, why: 'Multiplicou a força pela distância ao outro mancal: M = F·a·b/L.' },
            { value: (F * a * b) / L / 2000, why: 'Dividiu por 2L: M = F·a·b/L.' },
          ],
        });
        return {
          prompt: `Uma árvore apoiada em dois mancais distantes ${fmt(L, 0)} mm recebe uma força radial de ${fmt(F, 0)} N de uma polia montada a ${fmt(a, 0)} mm do mancal A. O momento fletor máximo na árvore é de`,
          options,
          answer,
          hint: 'Viga biapoiada com carga concentrada: o momento máximo fica sob a carga e vale F·a·b/L.',
          steps: [
            `a = ${fmt(a, 0)} mm; b = ${fmt(L, 0)} − ${fmt(a, 0)} = ${fmt(b, 0)} mm.`,
            `R_{A} = ${fmt(F, 0)} × ${fmt(b, 0)}/${fmt(L, 0)} = ${fmt(RA, 0)} N.`,
            `M = ${fmt(RA, 0)} × ${fmt(a / 1000, 3)} m = **${fmt(M, 1)} N·m**.`,
          ],
          explanation: `b = ${fmt(L, 0)} − ${fmt(a, 0)} = ${fmt(b, 0)} mm. R_{A} = F·b/L = ${fmt(F, 0)} × ${fmt(b, 0)}/${fmt(L, 0)} = ${fmt(RA, 0)} N. Sob a polia: M = R_{A}·a = F·a·b/L = **${fmt(M, 1)} N·m**.`,
        };
      },
    },
    {
      id: 'mec-eix-03',
      type: 'gen',
      difficulty: 2,
      lessonRef: 2,
      title: 'Tensão equivalente de von Mises',
      roteiro: 'von-mises',
      generate(rng) {
        const [s, t, eq] = pickOne(rng, VM_TRIPLES);
        const { options, answer } = numericOptions({
          correct: eq,
          unit: 'MPa',
          digits: 1,
          correctWhy: `√(σ² + 3τ²) = √(${s}² + 3 × ${t}²) = ${eq} MPa.`,
          distractors: [
            { value: Math.sqrt(s * s + 4 * t * t), why: 'Esse é o equivalente de Tresca (2·τ_{máx} = √(σ² + 4τ²)), não o de von Mises.' },
            { value: s + t, why: 'Tensões normal e de cisalhamento não se somam direto.' },
            { value: Math.sqrt(s * s + t * t), why: 'Faltou o fator 3 no τ²: σ_{eq} = √(σ² + 3τ²).' },
            { value: s + Math.sqrt(3) * t, why: 'Somou σ e √3·τ em vez de tirar a raiz da soma dos quadrados.' },
          ],
        });
        return {
          prompt: `Num ponto da superfície de uma árvore de aço atuam uma tensão normal de flexão de ${s} MPa e uma tensão de cisalhamento de torção de ${t} MPa. A tensão equivalente de von Mises nesse ponto é de`,
          options,
          answer,
          hint: 'Von Mises (máxima energia de distorção): σ_{eq} = √(σ² + 3τ²).',
          steps: [
            `σ = ${s} MPa (flexão); τ = ${t} MPa (torção).`,
            `Von Mises: σ_{eq} = √(σ² + 3τ²).`,
            `√(${fmt(s * s, 0)} + ${fmt(3 * t * t, 0)}) = **${fmt(eq, 1)} MPa** (Tresca daria ${fmt(Math.sqrt(s * s + 4 * t * t), 1)} MPa).`,
          ],
          explanation: `σ_{eq} = √(σ² + 3τ²) = √(${fmt(s * s, 0)} + ${fmt(3 * t * t, 0)}) = **${eq} MPa**. Pelo critério de Tresca, o equivalente seria √(σ² + 4τ²) = ${fmt(Math.sqrt(s * s + 4 * t * t), 1)} MPa — mais conservador.`,
        };
      },
    },
    {
      id: 'mec-eix-04',
      type: 'gen',
      difficulty: 2,
      lessonRef: 4,
      title: 'Velocidade crítica',
      roteiro: 'velocidade-critica',
      generate(rng) {
        let w: number;
        let prompt: string;
        let how: string;
        if (rng() < 0.5) {
          const delta = pickOne(rng, [0.16, 0.25, 0.4, 1, 1.6]);
          w = Math.sqrt(10 / (delta / 1000));
          prompt = `Um disco montado no meio de uma árvore de massa desprezível provoca, com o próprio peso, uma deflexão estática de ${fmt(delta, 2)} mm. Considerando g = 10 m/s², a primeira velocidade crítica do conjunto é de, aproximadamente,`;
          how = `ω_{c} = √(g/δ) = √(10/${fmt(delta / 1000, 5)}) = ${fmt(w, 1)} rad/s`;
        } else {
          const m = pickOne(rng, [10, 20, 25, 40, 50]);
          w = pickOne(rng, [100, 150, 200, 250, 300]);
          const k = (m * w * w) / 1000;
          prompt = `Um rotor de ${m} kg está montado sobre uma árvore de massa desprezível cuja rigidez à flexão, no ponto do rotor, é de ${fmt(k, 0)} kN/m. A velocidade crítica desse conjunto é de, aproximadamente,`;
          how = `ω_{c} = √(k/m) = √(${fmt(k * 1000, 0)}/${m}) = ${fmt(w, 0)} rad/s`;
        }
        const nc = (w * 60) / TWO_PI;
        const { options, answer } = numericOptions({
          correct: nc,
          unit: 'rpm',
          digits: 0,
          correctWhy: `${how}; n_{c} = 60·ω_{c}/(2π) = ${fmt(nc, 0)} rpm.`,
          distractors: [
            { value: w, why: 'Esse é ω_{c} em rad/s: falta passar para rpm (× 60/2π).' },
            { value: w / TWO_PI, why: 'Essa é a frequência em Hz (rotações por segundo); em rpm, multiplique por 60.' },
            { value: 60 * w, why: 'Multiplicou por 60 sem dividir por 2π.' },
            { value: (w * w * 60) / TWO_PI / 100, why: 'Esqueceu a raiz quadrada em √(k/m).' },
          ],
        });
        return {
          prompt,
          options,
          answer,
          hint: 'A velocidade crítica é a frequência natural do conjunto: ω_{c} = √(k/m) = √(g/δ). Depois, rpm = ω·60/(2π).',
          steps: [
            `Frequência natural do conjunto: ${how.includes('g/δ') ? 'o enunciado dá a deflexão estática δ, que já "contém" k/m' : 'o enunciado dá k e m'}.`,
            `${how}.`,
            `n_{c} = ${fmt(w, 1)} × 60/(2π) ≈ **${fmt(nc, 0)} rpm**.`,
          ],
          explanation: `${how}. Em rpm: n_{c} = ${fmt(w, 1)} × 60/(2π) ≈ **${fmt(nc, 0)} rpm**. A árvore deve trabalhar bem longe dessa rotação.`,
        };
      },
    },
    {
      id: 'mec-eix-05',
      type: 'gen',
      difficulty: 2,
      lessonRef: 5,
      title: 'Vida de um rolamento',
      roteiro: 'vida-rolamento',
      generate(rng) {
        const P = pickOne(rng, [2, 2.5, 3, 4, 5]);
        const q = pickOne(rng, [5, 6, 8, 10]);
        const C = P * q;
        const n = pickOne(rng, [500, 600, 750, 1000, 1200, 1500, 1800]);
        const hrs = (x: number) => (x * 1e6) / (60 * n);
        const L10 = q ** 3;
        const correct = hrs(L10);
        const { options, answer } = numericOptions({
          correct,
          unit: 'h',
          digits: 0,
          correctWhy: `L_{10} = (C/P)³ = ${fmt(q, 0)}³ = ${fmt(L10, 0)} milhões de rotações; ÷ (60 × ${fmt(n, 0)}) = ${fmt(correct, 0)} h.`,
          distractors: [
            { value: hrs(q ** (10 / 3)), why: 'Usou o expoente 10/3, que é dos rolamentos de rolos.' },
            { value: hrs(q), why: 'Esqueceu o expoente: para esferas, L_{10} = (C/P)³.' },
            { value: (L10 * 1e6) / n, why: 'Dividiu pela rotação em rpm sem passar para rotações por hora (× 60): isso dá minutos.' },
            { value: hrs(q * q), why: 'Usou o expoente 2: para esferas, é 3.' },
          ],
        });
        return {
          prompt: `Um rolamento rígido de esferas tem capacidade de carga dinâmica C = ${fmt(C, 1)} kN e trabalha com carga equivalente P = ${fmt(P, 1)} kN a ${fmt(n, 0)} rpm. A vida nominal L_{10} desse rolamento é de, aproximadamente,`,
          options,
          answer,
          hint: 'L_{10} = (C/P)^{p} milhões de rotações (p = 3 para esferas). Em horas: L_{10}·10⁶/(60·n).',
          steps: [
            `C/P = ${fmt(C, 1)}/${fmt(P, 1)} = ${q}.`,
            `L_{10} = ${q}³ = ${fmt(L10, 0)} milhões de rotações (esferas: p = 3).`,
            `${fmt(L10, 0)} × 10⁶/(60 × ${fmt(n, 0)}) ≈ **${fmt(correct, 0)} h**.`,
          ],
          explanation: `C/P = ${fmt(C, 1)}/${fmt(P, 1)} = ${q}; L_{10} = ${q}³ = ${fmt(L10, 0)} milhões de rotações. A ${fmt(n, 0)} rpm o rolamento dá ${fmt(60 * n, 0)} rotações por hora: ${fmt(L10, 0)} × 10⁶/${fmt(60 * n, 0)} ≈ **${fmt(correct, 0)} h**.`,
        };
      },
    },
    {
      id: 'mec-eix-06',
      type: 'gen',
      difficulty: 3,
      lessonRef: 6,
      title: 'Número de Sommerfeld',
      roteiro: 'sommerfeld',
      generate(rng) {
        // a folga sempre muda (entra ao quadrado) e mais uma grandeza
        const folga = pickOne(rng, [
          { f: 2, text: 'a folga radial dobra (desgaste)' },
          { f: 0.5, text: 'a folga radial cai à metade' },
        ]);
        const other = pickOne(rng, [
          { key: 'mu', f: 2, text: 'o óleo é trocado por outro com o dobro da viscosidade' },
          { key: 'mu', f: 0.5, text: 'o óleo esquenta e sua viscosidade cai à metade' },
          { key: 'N', f: 2, text: 'a rotação dobra' },
          { key: 'N', f: 0.5, text: 'a rotação cai à metade' },
          { key: 'W', f: 2, text: 'a carga no mancal dobra' },
          { key: 'W', f: 0.5, text: 'a carga no mancal cai à metade' },
        ]);
        const f = { mu: 1, N: 1, W: 1, c: folga.f } as Record<string, number>;
        f[other.key] = other.f;
        const top = f.mu * f.N;
        const ratio = top / (f.W * f.c * f.c);
        const first = rng() < 0.5 ? folga : other;
        const second = first === folga ? other : folga;
        const { options, answer } = numericOptions({
          correct: ratio,
          unit: '× S',
          digits: 3,
          correctWhy: `S ∝ μ·N/(P·c²): ${fmt(f.mu, 1)} × ${fmt(f.N, 1)}/(${fmt(f.W, 1)} × ${fmt(f.c, 1)}²) = ${fmt(ratio, 3)}.`,
          distractors: [
            { value: top / (f.W * f.c), why: 'A folga entra ao quadrado: S = (r/c)²·μN/P.' },
            { value: (top * f.c * f.c) / f.W, why: 'Inverteu o efeito da folga: folga maior diminui S.' },
            { value: 1 / (f.W * f.c * f.c), why: 'Esqueceu a mudança de viscosidade ou de rotação.' },
            { value: top / f.W, why: 'Esqueceu a mudança da folga.' },
            { value: other.key === 'W' ? (top * f.W) / (f.c * f.c) : 1 / (top * f.W * f.c * f.c), why: other.key === 'W' ? 'Inverteu o efeito da carga: carga maior diminui S.' : 'Inverteu o efeito da viscosidade e da rotação: elas aumentam S.' },
          ],
        });
        return {
          prompt: `Num mancal de deslizamento com lubrificação hidrodinâmica, ${first.text} e ${second.text}; o resto não muda. Chamando de S o número de Sommerfeld original, o novo número de Sommerfeld vale`,
          options,
          answer,
          hint: 'S = (r/c)²·μ·N/P: cresce com a viscosidade e a rotação, cai com a carga (P = W/(L·D)) e com o quadrado da folga.',
          steps: [
            `S ∝ μ·N/(P·c²).`,
            `Viscosidade × ${fmt(f.mu, 1)}, rotação × ${fmt(f.N, 1)}, carga × ${fmt(f.W, 1)}, folga × ${fmt(f.c, 1)} → ${fmt(f.mu, 1)} × ${fmt(f.N, 1)}/(${fmt(f.W, 1)} × ${fmt(f.c * f.c, 2)}).`,
            `Novo S = **${fmt(ratio, 3)} × S**${ratio < 1 ? ': o filme afina.' : ratio > 1 ? ': o filme engrossa.' : ': os efeitos se compensam.'}`,
          ],
          explanation: `S = (r/c)²·μN/P. Fatores: viscosidade × ${fmt(f.mu, 1)}, rotação × ${fmt(f.N, 1)}, carga × ${fmt(f.W, 1)}, folga × ${fmt(f.c, 1)} (entra ao quadrado, no denominador). Novo S = ${fmt(f.mu, 1)} × ${fmt(f.N, 1)}/(${fmt(f.W, 1)} × ${fmt(f.c * f.c, 2)}) × S = **${fmt(ratio, 3)} × S**.${ratio < 1 ? ' O filme afina.' : ratio > 1 ? ' O filme engrossa.' : ' Os efeitos se compensam.'}`,
        };
      },
    },
    {
      id: 'mec-eix-07',
      type: 'gen',
      difficulty: 2,
      lessonRef: 0,
      title: 'Chaveta: cisalhamento e esmagamento',
      roteiro: 'chaveta',
      generate(rng) {
        const d = pickOne(rng, [25, 30, 40, 50]);
        const [b, h] = KEYS[d];
        const T = pickOne(rng, [100, 150, 200, 250, 300, 400]);
        const L = pickOne(rng, [30, 40, 50, 60]);
        const F = (2 * T * 1000) / d;
        const shear = rng() < 0.5;
        const tau = F / (b * L);
        const sig = F / ((h / 2) * L);
        const base = `Uma engrenagem é presa a uma árvore de ${d} mm por uma chaveta paralela de ${b} × ${h} mm (largura × altura) e ${L} mm de comprimento. A árvore transmite ${T} N·m.`;
        const { options, answer } = shear
          ? numericOptions({
              correct: tau,
              unit: 'MPa',
              digits: 1,
              correctWhy: `F = 2T/d = ${fmt(F, 0)} N; τ = F/(b·L) = ${fmt(F, 0)}/(${b} × ${L}) = ${fmt(tau, 1)} MPa.`,
              distractors: [
                { value: F / (h * L), why: 'Usou a altura da chaveta: o corte acontece na seção b × L.' },
                { value: tau / 2, why: 'Usou F = T/d: a força no raio é T/(d/2) = 2T/d.' },
                { value: F / (d * L), why: 'Usou o diâmetro da árvore como largura da área cisalhada.' },
                { value: sig, why: 'Essa é a pressão de esmagamento (área L·h/2), não o cisalhamento.' },
              ],
            })
          : numericOptions({
              correct: sig,
              unit: 'MPa',
              digits: 1,
              correctWhy: `F = 2T/d = ${fmt(F, 0)} N; σ = F/(L·h/2) = ${fmt(F, 0)}/(${L} × ${fmt(h / 2, 1)}) = ${fmt(sig, 1)} MPa.`,
              distractors: [
                { value: F / (h * L), why: 'Usou a altura inteira: só metade da chaveta encosta no cubo.' },
                { value: tau, why: 'Essa é a tensão de cisalhamento (área b·L), não a de esmagamento.' },
                { value: sig / 2, why: 'Usou F = T/d: a força no raio é T/(d/2) = 2T/d.' },
                { value: 2 * sig, why: 'Usou um quarto da altura: o contato é na metade dela.' },
              ],
            });
        return {
          prompt: shear
            ? `${base} A tensão de cisalhamento média na chaveta é de, aproximadamente,`
            : `${base} Considerando metade da altura da chaveta em contato com o cubo, a pressão de esmagamento é de, aproximadamente,`,
          options,
          answer,
          hint: 'A força na chaveta vem do torque no raio da árvore: F = T/(d/2) = 2T/d. Cisalhamento na área b·L; esmagamento na área L·h/2.',
          steps: [
            `F = 2 × ${T}/${fmt(d / 1000, 3)} = ${fmt(F, 0)} N.`,
            `${shear ? `Cisalhamento: A = b·L = ${b} × ${L} = ${fmt(b * L, 0)} mm².` : `Esmagamento: A = L·h/2 = ${L} × ${fmt(h / 2, 1)} = ${fmt((L * h) / 2, 0)} mm².`}`,
            `${shear ? `τ = ${fmt(F, 0)}/${fmt(b * L, 0)} = **${fmt(tau, 1)} MPa**.` : `σ = ${fmt(F, 0)}/${fmt((L * h) / 2, 0)} = **${fmt(sig, 1)} MPa**.`}`,
          ],
          explanation: `F = 2T/d = 2 × ${T}/${fmt(d / 1000, 3)} = ${fmt(F, 0)} N. Cisalhamento: τ = F/(b·L) = ${fmt(tau, 1)} MPa. Esmagamento: σ = F/(L·h/2) = ${fmt(sig, 1)} MPa. ${shear ? `Resposta: **${fmt(tau, 1)} MPa**.` : `Resposta: **${fmt(sig, 1)} MPa**.`}`,
        };
      },
    },
    {
      id: 'mec-eix-08',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Na nomenclatura dos elementos de máquinas, a peça que gira e transmite torque de um elemento a outro — como a que liga o motor à engrenagem de um redutor — é chamada de',
      options: [
        { text: 'eixo fixo.', why: 'O eixo fixo só suporta peças (como uma roldana), sem transmitir torque.' },
        { text: 'árvore.', why: 'Correta: árvore gira e transmite potência.' },
        { text: 'mancal.', why: 'O mancal apoia a árvore.' },
        { text: 'cubo.', why: 'O cubo é a parte central da engrenagem ou da polia, que abraça a árvore.' },
        { text: 'chaveta.', why: 'A chaveta liga o cubo à árvore.' },
      ],
      answer: 1,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: a peça **gira** e **transmite torque**.',
        'Árvore gira e transmite torque; eixo, no sentido estrito, só suporta peças; mancal apoia; cubo e chaveta são da montagem.',
        'Fica **árvore**. "Eixo fixo" é a troca: não transmite torque.',
      ],
      explanation: '**Árvore** é o elemento que gira e transmite torque. **Eixo**, no sentido estrito, suporta peças sem transmitir torque (fixo ou girando). No dia a dia, "eixo" vale para os dois.',
    },
    {
      id: 'mec-eix-09',
      difficulty: 2,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Uma árvore de redutor, apoiada em rolamentos nas extremidades, recebe duas engrenagens: uma transmite grande torque (forças altas nos dentes) e a outra, um torque pequeno. Para reduzir a flexão da árvore, a engrenagem de maior torque deve ficar',
      options: [
        { text: 'junto a um dos mancais.', why: 'Correta: perto do apoio, o momento fletor (F·a·b/L) e a flecha são pequenos.' },
        { text: 'no meio do vão, onde a árvore é mais rígida.', why: 'No meio do vão o momento é o maior possível (F·L/4), e a árvore é ali mais flexível.' },
        { text: 'em balanço, fora dos mancais.', why: 'Em balanço o momento cresce ainda mais e o mancal vizinho fica sobrecarregado.' },
        { text: 'em qualquer posição, pois o momento depende só do torque.', why: 'O momento depende da força e da posição: M = F·a·b/L.' },
        { text: 'o mais longe possível dos dois mancais, para dividir a carga entre eles.', why: 'Dividir a carga igualmente é justamente o caso de momento máximo.' },
      ],
      answer: 0,
      roteiro: 'momento-viga',
      steps: [
        'A engrenagem fica a uma distância a de um mancal e b = L − a do outro.',
        'R_{A} = F·b/L: o mancal mais próximo leva quase toda a carga (escolhe-se o rolamento para isso).',
        'M = F·a·b/L: com a pequeno, o momento cai. A engrenagem de maior torque vai **junto a um dos mancais**.',
      ],
      explanation: 'Com a força F a uma distância a de um mancal, M = F·a·b/L: perto do apoio, a ou b é pequeno e o momento cai. O mancal vizinho passa a levar quase toda a carga, o que se resolve escolhendo o rolamento certo — bem mais fácil que engrossar a árvore.',
    },
    {
      id: 'mec-eix-10',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt:
        'Considere as afirmações sobre os critérios de escoamento usados no dimensionamento de árvores de aço.\n\nI – Para materiais dúcteis, o critério de Tresca é mais conservador que o de von Mises.\nII – Pelo critério de von Mises, uma árvore em torção pura começa a escoar quando a tensão de cisalhamento chega a 0,5 vez o limite de escoamento em tração.\nIII – Os dois critérios foram desenvolvidos para materiais frágeis, como o ferro fundido.\n\nEstá correto o que se afirma em',
      options: [
        { text: 'I, apenas.', why: 'Correta.' },
        { text: 'II, apenas.', why: 'A II troca os números: 0,5 é de Tresca; von Mises dá 0,577.' },
        { text: 'I e II, apenas.', why: 'A II está errada.' },
        { text: 'I e III, apenas.', why: 'A III está errada: os dois são para materiais dúcteis.' },
        { text: 'I, II e III.', why: 'A II e a III estão erradas.' },
      ],
      answer: 0,
      shuffle: false,
      roteiro: 'fmt.afirmativas',
      steps: [
        'I – **Correta**: Tresca prevê o escoamento antes (τ = 0,5·σ_{e} em torção pura) e leva a peças um pouco maiores.',
        'II – **Errada**: 0,5 é o valor de Tresca; von Mises dá τ = σ_{e}/√3 ≈ 0,577·σ_{e}.',
        'III – **Errada**: os dois são critérios de escoamento de materiais **dúcteis**; para frágeis usa-se Rankine ou Coulomb-Mohr.',
        'Só a I está certa → "I, apenas".',
      ],
      explanation: 'I – certa: Tresca prevê o escoamento antes (τ = 0,5·σ_{e} em torção pura) e pede peças um pouco maiores. II – errada: 0,5 é o valor de Tresca; von Mises dá τ = σ_{e}/√3 = 0,577·σ_{e}. III – errada: ambos são critérios de **escoamento** de materiais **dúcteis**; para frágeis usa-se Rankine (máxima tensão normal) ou Coulomb-Mohr.',
    },
    {
      id: 'mec-eix-11',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Uma árvore gira com velocidade constante sob um momento fletor constante (a força da polia não gira com ela). Num ponto da superfície da árvore, a tensão normal de flexão',
      options: [
        { text: 'é constante, pois o momento é constante.', why: 'O momento é constante no espaço, mas o ponto gira e passa pelos dois lados da linha neutra.' },
        { text: 'é sempre de tração, pois a carga puxa a árvore para baixo.', why: 'Metade da volta o ponto está do lado comprimido.' },
        { text: 'é nula, pois a árvore gira.', why: 'Girar não anula a flexão.' },
        { text: 'varia entre zero e o máximo, sem nunca inverter de sinal.', why: 'Isso seria tensão pulsante (carga que liga e desliga numa peça parada).' },
        { text: 'alterna entre tração e compressão a cada volta, com média nula.', why: 'Correta: é a flexão rotativa, totalmente alternada.' },
      ],
      answer: 4,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: a árvore **gira** sob um momento **fixo** no espaço.',
        'Um ponto da superfície passa pelo lado tracionado e pelo comprimido a cada volta: σ(t) = σ·cos(ωt).',
        'Fica **alterna entre tração e compressão, com média nula** — fadiga por flexão rotativa.',
      ],
      explanation: 'O ponto passa pelo lado tracionado e pelo comprimido a cada volta: σ(t) = σ·cos(ωt), com média zero e amplitude σ = 32M/(πd³). É um ciclo de fadiga por rotação — milhões de ciclos em poucas horas. Por isso árvores se dimensionam à **fadiga**.',
    },
    {
      id: 'mec-eix-12',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Um ventilador vibra muito porque trabalha perto da velocidade crítica da sua árvore. Qual medida **eleva** essa velocidade crítica?',
      options: [
        { text: 'Balancear o rotor.', why: 'Reduz a força que excita a vibração, mas não muda a frequência natural.' },
        { text: 'Aumentar a distância entre os mancais.', why: 'Vão maior deixa a árvore mais flexível (k ∝ 1/L³): a crítica cai.' },
        { text: 'Aumentar o diâmetro da árvore.', why: 'Correta: k ∝ d⁴, e n_{c} = √(k/m) cresce com d².' },
        { text: 'Trocar o rotor por um mais pesado.', why: 'Mais massa: ω_{c} = √(k/m) cai.' },
        { text: 'Lubrificar melhor os mancais.', why: 'Não muda a rigidez nem a massa.' },
      ],
      answer: 2,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **elevar** a velocidade crítica — a frequência natural ω_{c} = √(k/m).',
        'Ela sobe com mais rigidez (k ∝ d⁴/L³: árvore mais grossa, vão menor) e com menos massa. Balancear e lubrificar não mudam k nem m.',
        'Fica **aumentar o diâmetro da árvore**. Mais distância entre mancais e rotor mais pesado **baixam** a crítica.',
      ],
      explanation: 'ω_{c} = √(k/m). Sobem a crítica: árvore mais grossa (k ∝ d⁴), vão menor (k ∝ 1/L³), massas perto dos mancais e rotor mais leve. Balancear não muda a crítica: diminui a força excitadora e, com ela, a amplitude.',
    },
    {
      id: 'mec-eix-13',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'O cubo de roda de um caminhão recebe, ao mesmo tempo, cargas radiais altas (o peso) e cargas axiais nas curvas. O rolamento mais indicado, montado aos pares e com ajuste de folga, é o de',
      options: [
        { text: 'agulhas.', why: 'Agulhas servem quando falta espaço radial e não levam carga axial.' },
        { text: 'escora (axial) de esferas.', why: 'Só leva carga axial.' },
        { text: 'esferas autocompensador.', why: 'Aceita desalinhamento, mas tem pouca capacidade axial.' },
        { text: 'rolos cilíndricos.', why: 'Leva muita carga radial, mas quase nenhuma axial.' },
        { text: 'rolos cônicos.', why: 'Correta: as pistas inclinadas levam radial e axial combinadas.' },
      ],
      answer: 4,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: cargas **radiais e axiais ao mesmo tempo**, com montagem aos pares e ajuste de folga.',
        'Rolos cônicos têm pistas inclinadas: levam radial e axial combinadas, a axial num sentido só — por isso vão aos pares.',
        'Fica **rolos cônicos**. Agulhas e rolos cilíndricos: só radial; escora: só axial; autocompensador: desalinhamento.',
      ],
      explanation: 'O rolamento de **rolos cônicos** tem pistas e rolos inclinados: leva carga radial e axial combinadas. Como cada um leva axial num sentido só, monta-se aos pares, ajustando a folga (cubos de roda, redutores com engrenagens helicoidais).',
    },
    {
      id: 'mec-eix-14',
      difficulty: 1,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Num rolamento, a peça que mantém os elementos rolantes igualmente espaçados, sem que eles se toquem, é',
      options: [
        { text: 'o anel interno.', why: 'O anel interno vai montado na árvore e tem uma das pistas.' },
        { text: 'o anel externo.', why: 'O anel externo vai na caixa e tem a outra pista.' },
        { text: 'a gaiola.', why: 'Correta: a gaiola (separador) guia os elementos rolantes.' },
        { text: 'o retentor.', why: 'O retentor é uma vedação.' },
        { text: 'a bucha de fixação.', why: 'A bucha de fixação prende o rolamento numa árvore lisa.' },
      ],
      answer: 2,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: mantém os elementos rolantes **igualmente espaçados**.',
        'Partes do rolamento: anéis interno e externo (com as pistas), elementos rolantes e **gaiola**, que mantém o espaçamento.',
        'Fica **a gaiola**. Retentor veda; bucha de fixação prende o rolamento na árvore.',
      ],
      explanation: 'Partes do rolamento: **anel interno** e **anel externo** (com as pistas), **elementos rolantes** (esferas, rolos ou agulhas) e a **gaiola**, que mantém o espaçamento entre eles.',
    },
    {
      id: 'mec-eix-15',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Ao inspecionar um rolamento, o técnico encontra mossas nas pistas espaçadas exatamente como as esferas, causadas por golpes de martelo dados no anel errado durante a montagem. Esse defeito é chamado de',
      options: [
        { text: 'descascamento.', why: 'É a fadiga das pistas depois de milhões de ciclos: lascas, sem o padrão de mossas.' },
        { text: 'falso brinelamento.', why: 'Parecido, mas causado por vibração com o rolamento parado (desgaste por pequenos movimentos), sem a pancada.' },
        { text: 'brinelamento.', why: 'Correta: mossas por deformação plástica, no passo dos elementos rolantes.' },
        { text: 'erosão por corrente elétrica.', why: 'A corrente deixa crateras e estrias regulares, de origem elétrica.' },
        { text: 'corrosão de contato no assento.', why: 'Aparece no assento do anel, não nas pistas.' },
      ],
      answer: 2,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: mossas **no passo das esferas**, causadas por **pancada** na montagem.',
        'Deformação plástica das pistas pelos elementos rolantes (golpe ou sobrecarga parado) é brinelamento. O falso brinelamento vem de vibração com o rolamento parado: é desgaste, sem deformação plástica.',
        'Fica **brinelamento**.',
      ],
      explanation: '**Brinelamento** é a deformação plástica das pistas pelos elementos rolantes — por pancada (montar batendo no anel que não tem interferência, com a força passando pelas esferas) ou sobrecarga com o rolamento parado. As mossas ficam no passo das esferas, como impressões de dureza Brinell.',
    },
    {
      id: 'mec-eix-16',
      difficulty: 2,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Num mancal de deslizamento, a árvore fica separada da bucha por um filme de óleo mesmo com a máquina parada. Isso caracteriza a lubrificação',
      options: [
        { text: 'hidrodinâmica, pela cunha de óleo formada com o giro.', why: 'A hidrodinâmica precisa de rotação: parada, a árvore encosta na bucha.' },
        { text: 'hidrostática, com óleo bombeado sob pressão por uma fonte externa.', why: 'Correta.' },
        { text: 'limítrofe, por camadas moleculares de aditivo.', why: 'Na limítrofe as rugosidades se tocam.' },
        { text: 'elasto-hidrodinâmica, típica de rolamentos e engrenagens.', why: 'Essa é de contatos concentrados, com movimento.' },
        { text: 'a seco, com lubrificante sólido como grafite.', why: 'Aí não há filme de óleo.' },
      ],
      answer: 1,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: filme de óleo **com a máquina parada**.',
        'A hidrodinâmica precisa do giro para formar a cunha de óleo; a hidrostática usa uma **bomba externa** que injeta óleo sob pressão.',
        'Fica **hidrostática**. Limítrofe e elasto-hidrodinâmica não separam as peças com a máquina parada.',
      ],
      explanation: 'Na lubrificação **hidrostática**, uma bomba externa injeta óleo sob pressão entre as superfícies: o filme existe mesmo sem movimento (grandes cargas, baixas rotações, partidas sob carga). Na **hidrodinâmica**, é o giro que arrasta o óleo para a cunha — sem rotação, não há filme.',
    },
    {
      id: 'mec-eix-17',
      difficulty: 3,
      lessonRef: 6,
      source: 'Autoral',
      prompt: 'Sobre um mancal de deslizamento com lubrificação hidrodinâmica, assinale a afirmativa correta.',
      options: [
        { text: 'Aumentar a carga aumenta o número de Sommerfeld e engrossa o filme de óleo.', why: 'Carga maior → pressão maior → S menor e filme mais fino.' },
        { text: 'Sob carga, a árvore gira perfeitamente centrada na bucha.', why: 'Ela gira excêntrica: é a excentricidade que forma a cunha.' },
        { text: 'Na curva de Stribeck, o menor atrito ocorre no regime limítrofe.', why: 'O limítrofe tem o maior atrito; o mínimo fica na passagem para o hidrodinâmico.' },
        { text: 'Aumentar a viscosidade do óleo aumenta o número de Sommerfeld e deixa a árvore mais centrada.', why: 'Correta: S = (r/c)²·μN/P cresce com μ.' },
        { text: 'Dobrar a folga radial dobra o número de Sommerfeld.', why: 'S ∝ (r/c)²: dobrar a folga divide S por 4.' },
      ],
      answer: 3,
      roteiro: 'sommerfeld',
      steps: [
        'S = (r/c)²·μ·N/P: viscosidade e rotação em cima; carga e folga (ao quadrado) embaixo.',
        'Carga maior e folga maior **diminuem** S; óleo mais viscoso **aumenta** S. Sob carga a árvore fica excêntrica, e o atrito mínimo de Stribeck está no começo do regime hidrodinâmico, não no limítrofe.',
        'S maior → filme mais grosso e árvore mais centrada: a correta é a da **viscosidade maior**.',
      ],
      explanation: 'S = (r/c)²·μN/P. Óleo mais viscoso → S maior → a árvore flutua mais centrada, com filme mais espesso. Carga maior ou folga maior diminuem S. Na curva de Stribeck o atrito é alto no regime limítrofe, mínimo no começo do hidrodinâmico e cresce devagar depois (atrito viscoso).',
    },
    {
      id: 'mec-eix-18',
      difficulty: 2,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Um óleo de motor multiviscoso SAE 15W-40 se comporta',
      options: [
        { text: 'como um óleo de grau 15W no frio e como um SAE 40 a 100 °C.', why: 'Correta.' },
        { text: 'como um SAE 40 no frio e como um 15W a quente.', why: 'Invertido: o W (winter) descreve o comportamento no frio.' },
        { text: 'como um óleo de 15 cSt a 40 °C e de 40 cSt a 100 °C.', why: 'Os graus SAE não são valores em cSt — e a viscosidade cai com a temperatura, não sobe.' },
        { text: 'como uma mistura de 15 % de óleo leve e 40 % de óleo pesado.', why: 'Os números não são porcentagens.' },
        { text: 'como um SAE 55, somando os dois graus.', why: 'Graus não se somam.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: os dois números do óleo **multiviscoso** 15W-40.',
        'O grau com **W** (winter) vale para o frio, na partida; o grau sem W é a viscosidade a **100 °C**.',
        'Fica **15W no frio e SAE 40 a 100 °C**. Não é cSt, nem mistura, nem soma.',
      ],
      explanation: 'No multiviscoso, o grau **com W** (*winter*) é o do frio — facilita a partida — e o grau **sem W** é medido a **100 °C**. Um aditivo melhorador do índice de viscosidade faz o óleo "segurar" a viscosidade quando esquenta.',
    },
    {
      id: 'mec-eix-19',
      type: 'ce',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'A chaveta paralela transmite o torque entre a árvore e o cubo, mas não impede, sozinha, que o cubo deslize ao longo da árvore.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: chaveta **paralela** e o movimento **axial** do cubo.',
        'A chaveta paralela só transmite torque; a posição axial vem de ressaltos, anéis elásticos, porcas ou buchas. A de cunha (inclinada) é que trava também no sentido axial.',
        'Sozinha, a paralela não impede o deslizamento axial: **Certo**.',
      ],
      explanation: 'Certo. A chaveta paralela só transmite torque; a posição axial é garantida por ressaltos, anéis elásticos, porcas ou buchas. A chaveta inclinada (de cunha) é a que também trava na direção axial.',
    },
    {
      id: 'mec-eix-20',
      type: 'ce',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Pelo critério de Tresca, uma árvore em torção pura começa a escoar quando a tensão de cisalhamento chega a 0,577 vez o limite de escoamento em tração.',
      answer: false,
      roteiro: 'von-mises',
      steps: [
        'Torção pura: σ = 0 e só há τ.',
        'Tresca: τ_{máx} = σ_{e}/2 → escoa com τ = 0,5·σ_{e}. Von Mises: √3·τ = σ_{e} → τ = 0,577·σ_{e}.',
        '0,577 é de von Mises, não de Tresca: **Errado**.',
      ],
      explanation: 'Errado. 0,577 (= 1/√3) é o valor de **von Mises**. Por Tresca, o escoamento em torção pura ocorre com τ = 0,5·σ_{e} — por isso Tresca é mais conservador.',
    },
    {
      id: 'mec-eix-21',
      type: 'ce',
      difficulty: 1,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Num rolamento de esferas, dobrar a carga equivalente reduz a vida nominal L_{10} a um oitavo.',
      answer: true,
      roteiro: 'vida-rolamento',
      steps: [
        'Com a carga dobrada, C/P cai à metade.',
        'L_{10} = (C/P)³ → (1/2)³ = 1/8.',
        'A vida cai a um oitavo: **Certo** (em rolos, com expoente 10/3, cai a cerca de 1/10).',
      ],
      explanation: 'Certo. L_{10} = (C/P)³: com P dobrada, a vida fica (1/2)³ = 1/8. Em rolamentos de rolos (expoente 10/3), cai para cerca de 1/10.',
    },
    {
      id: 'mec-eix-22',
      type: 'ce',
      difficulty: 2,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Balancear cuidadosamente o rotor eleva a velocidade crítica da árvore.',
      answer: false,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: balancear **eleva** a velocidade crítica?',
        'A crítica depende só de rigidez e massa: ω_{c} = √(k/m). Balancear reduz a força que excita a vibração, sem mudar k nem m.',
        'A amplitude cai, mas a crítica fica onde estava: **Errado**.',
      ],
      explanation: 'Errado. A velocidade crítica depende da rigidez e da massa (ω_{c} = √(k/m)). O balanceamento diminui o desbalanceamento — a força que excita a vibração — e reduz a amplitude, mas a crítica continua no mesmo lugar.',
    },
    {
      id: 'mec-eix-23',
      type: 'ce',
      difficulty: 1,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'O ponto de fluidez é a menor temperatura em que o óleo ainda escoa; para partidas em clima frio, convém um ponto de fluidez baixo.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: **ponto de fluidez** e partida no frio.',
        'Ponto de fluidez é a menor temperatura em que o óleo ainda escoa; abaixo dele, cristais de parafina travam o óleo.',
        'Para clima frio, quer-se ponto de fluidez **baixo**: **Certo**.',
      ],
      explanation: 'Certo. Abaixo do ponto de fluidez o óleo não escoa (cristais de parafina, viscosidade enorme). Óleos para frio têm ponto de fluidez baixo — os aditivos abaixadores do ponto de fluidez ajudam.',
    },
    {
      id: 'mec-eix-24',
      type: 'ce',
      difficulty: 2,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Uma graxa de sabão de lítio, por ter ponto de gota elevado, pode trabalhar continuamente acima de 250 °C.',
      answer: false,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: graxa de **lítio** trabalhando **continuamente acima de 250 °C**.',
        'Ponto de gota não é temperatura de trabalho: a graxa de lítio pinga por volta de 190 °C e trabalha bem até uns 120 °C.',
        'Para temperaturas mais altas, usam-se graxas de complexo de lítio, poliureia ou bentonita com óleo sintético: **Errado**.',
      ],
      explanation: 'Errado. A graxa de lítio pinga por volta de 190 °C e trabalha bem até uns 120 °C. Para altas temperaturas usam-se graxas de complexo de lítio, poliureia ou argila (bentonita), com óleos sintéticos.',
    },
  ],
  games: [
    {
      id: 'mec-eix-g1',
      type: 'sort',
      title: 'Rolamento ou bucha?',
      intro: 'Cada característica é de um mancal de **rolamento** ou de um mancal de **deslizamento** (bucha com óleo)?',
      lessonRef: 6,
      bins: ['Rolamento', 'Bucha (deslizamento)'],
      items: [
        { text: 'Atrito baixo já na partida', bin: 0, why: 'Os elementos rolam desde o primeiro instante.' },
        { text: 'Vida nominal L_{10} = (C/P)^{p}', bin: 0, why: 'Fadiga das pistas, em milhões de rotações.' },
        { text: 'Anéis, elementos rolantes e gaiola', bin: 0, why: 'As partes do rolamento.' },
        { text: 'Peça padronizada, escolhida em catálogo', bin: 0, why: 'Medidas e capacidades normalizadas.' },
        { text: 'Falha final por descascamento das pistas', bin: 0, why: 'Fadiga de contato.' },
        { text: 'Lubrificado com um pouco de graxa, quase sem manutenção', bin: 0, why: 'Graxa basta na maioria dos rolamentos.' },
        { text: 'Precisa de rotação para formar a cunha de óleo', bin: 1, why: 'Mancal hidrodinâmico.' },
        { text: 'Número de Sommerfeld', bin: 1, why: 'Parâmetro do mancal de deslizamento.' },
        { text: 'Metal patente (babbitt) ou bronze', bin: 1, why: 'Materiais de bucha.' },
        { text: 'O filme de óleo amortece choques e vibrações', bin: 1, why: 'Bom para cargas de impacto.' },
        { text: 'Ocupa pouco espaço na direção radial', bin: 1, why: 'É só uma casca fina em volta da árvore.' },
        { text: 'Bronzinas de motores de combustão e de turbinas grandes', bin: 1, why: 'Exemplos clássicos de deslizamento.' },
      ],
    },
    {
      id: 'mec-eix-g2',
      type: 'match',
      title: 'Termos de eixos e mancais',
      intro: 'Ligue cada termo ao que ele significa.',
      lessonRef: 2,
      leftLabel: 'Termo',
      rightLabel: 'Significado',
      perRound: 6,
      pairs: [
        { left: 'Árvore', right: 'Gira e transmite torque', why: 'O eixo, em sentido estrito, só suporta peças.' },
        { left: 'Eixo fixo', right: 'Só suporta peças, sem torque', why: 'Como o eixo de uma roldana.' },
        { left: 'Chaveta', right: 'Transmite o torque entre a árvore e o cubo', why: 'Encaixada nos dois rasgos.' },
        { left: 'Eixo estriado', right: 'Transmite torque e deixa o cubo deslizar', why: 'Caixas de câmbio.' },
        { left: 'Anel elástico', right: 'Segura a peça na direção axial', why: 'Encaixado num canal da árvore.' },
        { left: 'von Mises', right: '√(σ² + 3τ²)', why: 'Máxima energia de distorção.' },
        { left: 'Tresca', right: 'Escoa com τ_{máx} = σ_{e}/2', why: 'Máxima tensão de cisalhamento.' },
        { left: 'Velocidade crítica', right: 'Rotação igual à frequência natural', why: 'ω_{c} = √(k/m).' },
        { left: 'L_{10}', right: 'Vida com 90 % de confiabilidade', why: '(C/P)^{p} milhões de rotações.' },
        { left: 'Gaiola', right: 'Mantém os elementos rolantes espaçados', why: 'O separador do rolamento.' },
        { left: 'Número de Sommerfeld', right: '(r/c)²·μN/P', why: 'Resume o mancal de deslizamento.' },
        { left: 'ISO VG 68', right: '68 cSt a 40 °C', why: 'Viscosidade cinemática média.' },
      ],
    },
    {
      id: 'mec-eix-g3',
      type: 'order',
      title: 'Dimensionar uma árvore',
      intro: 'Ponha em ordem os passos do projeto de uma árvore de redutor.',
      lessonRef: 2,
      steps: [
        { text: 'Calcular o torque pela potência e pela rotação (T = P/ω)', why: 'O ponto de partida.' },
        { text: 'Achar as forças das engrenagens e polias (F_{t} = 2T/D)', why: 'O torque vira força nos dentes.' },
        { text: 'Calcular as reações nos mancais e o diagrama de momento fletor', why: 'A árvore como viga biapoiada.' },
        { text: 'Na seção crítica, combinar flexão e torção e checar a fadiga', why: 'Von Mises ou Tresca, com Goodman.' },
        { text: 'Escolher o diâmetro com o fator de segurança', why: 'd³ ∝ √(M² + ¾T²).' },
        { text: 'Conferir flecha e velocidade crítica e escolher rolamentos e chavetas', why: 'Rigidez, vibração e os elementos de apoio e fixação.' },
      ],
    },
    {
      id: 'mec-eix-lab1',
      type: 'lab',
      lab: 'shaft',
      title: 'Árvore em dois mancais',
      intro: 'Uma árvore de aço leva a potência do motor até uma engrenagem. Mude a posição da engrenagem, a rotação, o diâmetro e os mancais, e preveja as tensões, a vibração, a vida dos rolamentos e o filme de óleo.',
      lessonRef: 1,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { brg: 0, P: 30, n: 600, a: 400, d: 40 },
          prompt: 'A engrenagem está no **meio do vão**. Se ela for montada a **160 mm do mancal A**, o momento fletor máximo na árvore…',
          change: { a: 160 },
          options: ['Cai, e o mancal A passa a levar a maior parte da carga', 'Sobe, porque a carga fica concentrada num mancal', 'Fica igual: a força nos dentes é a mesma', 'Cai, e os dois mancais passam a dividir a carga igualmente'],
          answer: 0,
          expect: [
            { out: 'M', trend: 'down' },
            { out: 'RA', trend: 'up' },
            { out: 'nc', trend: 'up' },
          ],
          why: 'M = F·a·b/L: no meio, 4.065 × 0,4 × 0,4/0,8 = 813 N·m; a 160 mm, 4.065 × 0,16 × 0,64/0,8 = **520 N·m**. A reação em A vai de 2.032 para 3.252 N (b/L = 80 %). De quebra, a árvore fica mais rígida sob a engrenagem e a velocidade crítica sobe.',
        },
        {
          kind: 'predict',
          setup: { brg: 0, P: 15, n: 1150, a: 400, d: 40 },
          prompt: 'O motor passa a girar a árvore na **metade da rotação** (575 rpm), transmitindo a **mesma potência**. O que acontece com as tensões?',
          change: { n: 575 },
          options: ['Torque, força nos dentes e tensões dobram', 'Caem à metade, porque a árvore gira mais devagar', 'Ficam iguais: a potência é a mesma', 'Só a torção dobra; a flexão não muda'],
          answer: 0,
          expect: [
            { out: 'T', trend: 'up' },
            { out: 'sig', trend: 'up' },
            { out: 'tau', trend: 'up' },
          ],
          why: 'T = P/ω: metade da rotação, **o dobro do torque** (de 125 para 249 N·m). A força nos dentes (2T/D) dobra, o momento dobra, e σ e τ dobram. Por isso árvores lentas são mais grossas.',
        },
        {
          kind: 'predict',
          setup: { brg: 0, P: 30, n: 600, a: 400, d: 40 },
          prompt: 'O diâmetro da árvore passa de **40 para 50 mm** (25 % maior). A tensão de flexão…',
          change: { d: 50 },
          options: ['Cai para cerca da metade', 'Cai 25 %', 'Cai para cerca de 64 %', 'Não muda: o momento é o mesmo'],
          answer: 0,
          expect: [
            { out: 'sig', trend: 'down' },
            { out: 'tau', trend: 'down' },
            { out: 'FS', trend: 'up' },
          ],
          why: 'σ = 32M/(πd³): (40/50)³ = 0,51 — a tensão cai **quase à metade** (129 → 66 MPa) com uma árvore só 25 % mais grossa.',
        },
        {
          kind: 'goal',
          setup: { brg: 0, P: 30, n: 600, a: 400, d: 30 },
          lock: ['brg', 'P', 'n', 'a'],
          prompt: 'Com 30 mm a árvore **escoa** (von Mises passa dos 310 MPa do aço). Escolha o **menor diâmetro** que dê fator de segurança **2** por von Mises.',
          goals: [{ out: 'FS', min: 2, label: 'FS de von Mises ≥ 2' }],
          hint: 'As tensões caem com d³. Com 30 mm, FS ≈ 0,9: a árvore precisa ficar uns (2/0,9)^(1/3) ≈ 1,3 vez mais grossa.',
          solution: { d: 40 },
          why: 'Com 40 mm: σ = 129 MPa, τ = 38 MPa e von Mises = 145 MPa → FS = 310/145 = **2,1** (com 39 mm, ainda 1,98). Direto: d³ = (32·n/(π·σ_{e}))·√(M² + ¾T²) dá 39,1 mm.',
        },
        {
          kind: 'predict',
          setup: { brg: 0, P: 7.5, n: 1750, a: 400, d: 40 },
          prompt: 'Para economizar, alguém propõe afinar a árvore de **40 para 30 mm**: com 7,5 kW ela continua resistindo com folga. O que muda na vibração a 1.750 rpm?',
          change: { d: 30 },
          options: ['A velocidade crítica cai para perto de 1.750 rpm e a vibração dispara', 'Nada: as tensões continuam baixas', 'A velocidade crítica sobe, porque a árvore fica mais leve', 'A vibração cai, porque a árvore fica mais flexível'],
          answer: 0,
          expect: [
            { out: 'nc', trend: 'down' },
            { out: 'amp', trend: 'up' },
          ],
          why: 'n_{c} ∝ d²: (30/40)² = 0,56 → a crítica cai de 3.785 para **2.129 rpm**, e 1.750 rpm passam a ser 82 % dela: a amplitude sobe de ~5 para ~41 µm. Resistir não basta — a rigidez também conta.',
        },
        {
          kind: 'goal',
          setup: { brg: 0, P: 7.5, n: 1750, a: 400, d: 30 },
          lock: ['brg', 'P', 'n', 'd'],
          prompt: 'Sem engrossar a árvore de 30 mm nem mudar a rotação, afaste a velocidade crítica: a rotação deve ficar em **no máximo 80 %** dela.',
          goals: [{ out: 'r', max: 0.8, label: 'rotação ≤ 80 % da crítica' }],
          hint: 'Leve a engrenagem (a massa) para perto de um mancal: ali a árvore é mais rígida.',
          solution: { a: 280 },
          why: 'k = 3EIL/(a²·b²): com a engrenagem a 280 mm do mancal A, a rigidez sob ela sobe e a crítica vai para ~2.340 rpm (1.750 rpm = 75 % dela). Massas perto dos mancais = críticas mais altas.',
        },
        {
          kind: 'predict',
          setup: { brg: 0, P: 15, n: 600, a: 400, d: 50 },
          prompt: 'Rolamentos de esferas. A potência **dobra** (15 → 30 kW) na mesma rotação, e a carga em cada mancal dobra junto. A vida L_{10}…',
          change: { P: 30 },
          options: ['Cai para 1/8', 'Cai à metade', 'Cai para 1/4', 'Não muda: a rotação é a mesma'],
          answer: 0,
          expect: [
            { out: 'LA', trend: 'down' },
            { out: 'LB', trend: 'down' },
          ],
          why: 'L_{10} = (C/P)³: carga 2× → vida (1/2)³ = **1/8** (de ~89 mil para ~11 mil horas). O expoente 3 é o que torna a carga tão decisiva.',
        },
        {
          kind: 'predict',
          setup: { brg: 0, P: 30, n: 600, a: 400, d: 50 },
          prompt: 'Com 30 kW, os rolamentos de esferas duram ~11 mil horas. Trocando-os por rolamentos de **rolos cilíndricos** do mesmo tamanho (C = 28 kN), a vida…',
          change: { brg: 1 },
          options: ['Sobe muito: C maior e expoente 10/3', 'Cai: rolos têm mais atrito', 'Fica igual: a carga é a mesma', 'Sobe só na proporção de C (28/15)'],
          answer: 0,
          expect: [{ out: 'LA', trend: 'up' }],
          why: 'Rolos têm contato em linha: C sobe de 15 para 28 kN e o expoente passa a 10/3. (28/2,03)^(10/3) ≈ 6.270 milhões de rotações → **~174 mil h**, contra 11 mil. Em compensação, rolos cilíndricos quase não aceitam carga axial.',
        },
        {
          kind: 'predict',
          setup: { brg: 2, P: 10, n: 200, a: 400, d: 40, oil: 1, temp: 60, cr: 1 },
          prompt: 'Buchas com óleo SAE 30 a 60 °C. Se o óleo esquentar até **100 °C**, o filme de óleo…',
          change: { temp: 100 },
          options: ['Afina: a viscosidade e o número de Sommerfeld caem', 'Engrossa: o óleo quente se expande', 'Não muda: o filme depende só da rotação', 'Some de vez: óleo quente não lubrifica'],
          answer: 0,
          expect: [
            { out: 'visc', trend: 'down' },
            { out: 'S', trend: 'down' },
            { out: 'h0', trend: 'down' },
          ],
          why: 'A viscosidade cai de 40 para 11,5 cSt, S cai de 0,092 para 0,026 e o filme mínimo afina de 6,9 para 2,8 µm — já na lubrificação **mista**. Por isso mancais grandes têm o óleo resfriado.',
        },
        {
          kind: 'predict',
          setup: { brg: 2, P: 2, n: 400, a: 400, d: 40, oil: 0, temp: 80, cr: 1 },
          prompt: 'Óleo SAE 10 a 80 °C e filme completo a 400 rpm. A máquina passa a girar a **50 rpm**, com a mesma potência. O que acontece no mancal?',
          change: { n: 50 },
          options: ['O filme se rompe: lubrificação limítrofe e atrito alto', 'O filme engrossa, porque a árvore gira mais devagar', 'Nada muda: a carga é a mesma', 'O atrito cai, porque há menos arraste de óleo'],
          answer: 0,
          expect: [
            { out: 'S', trend: 'down' },
            { out: 'h0', trend: 'down' },
            { out: 'f', trend: 'up' },
          ],
          why: 'Menos rotação arrasta menos óleo para a cunha — e, com a mesma potência, o torque e a carga ficam 8 vezes maiores. S despenca de 0,39 para 0,006, o filme afina para menos de 1 µm (abaixo da rugosidade) e o atrito sobe de ~0,008 para ~0,12. É o que acontece a cada partida e parada de um mancal hidrodinâmico.',
        },
        {
          kind: 'goal',
          setup: { brg: 2, P: 2, n: 50, a: 400, d: 40, oil: 0, temp: 80, cr: 1 },
          lock: ['brg', 'P', 'n', 'a', 'd', 'cr'],
          prompt: 'Sem mudar a rotação nem a carga, devolva o **filme completo** (h_{0} ≥ 3 µm) escolhendo o **óleo** e a **temperatura**.',
          goals: [{ out: 'h0', min: 3, label: 'filme mínimo ≥ 3 µm' }],
          hint: 'S = (r/c)²·μN/P: só a viscosidade sobrou. Óleo mais grosso, e mais frio.',
          solution: { oil: 1, temp: 40 },
          why: 'O SAE 30 a 40 °C tem 100 cSt, contra 8,5 cSt do SAE 10 a 80 °C: S sobe para 0,07 e o filme volta a ~5,9 µm. Em baixa rotação, é a viscosidade que segura a carga.',
        },
      ],
    },
  ],
});
