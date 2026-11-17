import { fmt, numericOptions, pickOne } from '../../../learning/gen';
import { defineTopic } from '../../../learning/types';

/** Potencial com sinal (−0,76 / +0,34). */
const fE = (E: number) => `${E < 0 ? '−' : '+'}${fmt(Math.abs(E), 2)}`;
const F = 96500;
const YEAR = 3.15e7;

/** Potenciais padrão de redução (V, eletrodo-padrão de hidrogênio). */
const STD = [
  { name: 'magnésio', ion: 'Mg²⁺/Mg', E: -2.37 },
  { name: 'alumínio', ion: 'Al³⁺/Al', E: -1.66 },
  { name: 'zinco', ion: 'Zn²⁺/Zn', E: -0.76 },
  { name: 'ferro', ion: 'Fe²⁺/Fe', E: -0.44 },
  { name: 'níquel', ion: 'Ni²⁺/Ni', E: -0.25 },
  { name: 'estanho', ion: 'Sn²⁺/Sn', E: -0.14 },
  { name: 'cobre', ion: 'Cu²⁺/Cu', E: 0.34 },
  { name: 'prata', ion: 'Ag⁺/Ag', E: 0.8 },
];

export default defineTopic({
  id: 'mec.corrosao-eletroquimica',
  name: 'Corrosão eletroquímica: pilhas, série galvânica e taxa',
  summary:
    'A pilha de corrosão (anodo, catodo, eletrólito e contato metálico), as reações catódicas de cada meio, a série galvânica, a relação de áreas, a passivação, a aeração diferencial, a taxa de corrosão (perda de massa e Faraday) e a corrosão em altas temperaturas.',
  order: 5,
  weight: 3,
  equipment: 'cell',
  edital: ['b3.corrosao'],
  lesson: [
    {
      title: 'A pilha de corrosão',
      hot: 'Componentes da pilha — o **anodo** é onde ocorre a **oxidação**, e o catodo, a redução (Transpetro 2012) — e as semirreações de uma pilha ferro–cobre (Petrobras 2010).',
      body: 'A corrosão eletroquímica é uma **pilha** funcionando sozinha. Ela precisa de quatro coisas:\n- **anodo:** onde o metal **se oxida** e vai para a solução como íon — é ali que ele **corrói** (Fe → Fe²⁺ + 2e⁻);\n- **catodo:** onde algo do meio **se reduz** e consome os elétrons (O₂, H⁺...); o metal do catodo **não** se dissolve;\n- **eletrólito:** a solução que conduz os **íons** entre o anodo e o catodo;\n- **contato metálico:** o caminho dos **elétrons**, sempre do **anodo para o catodo**.\n\nTire qualquer um dos quatro e a corrosão para: essa é a base de todos os métodos de proteção.\n\nAnodo e catodo podem ser **dois metais** diferentes (pilha galvânica) ou **regiões da mesma peça** (micropilhas: contornos de grão, inclusões, regiões deformadas, diferenças de aeração). Por isso uma chapa de aço sozinha também enferruja.',
      example: 'Aço ligado a cobre na água do mar: o aço (anodo) perde elétrons, que correm pelo contato metálico até o cobre (catodo), onde O₂ + 2H₂O + 4e⁻ → 4OH⁻. Na água, os íons Fe²⁺ e OH⁻ se encontram e formam a ferrugem.',
      tip: '**A**nodo → **o**xidação; **c**atodo → redução. Os elétrons saem do **A**nodo e chegam ao **C**atodo (ordem alfabética).',
      trap: 'Dizer que a corrosão acontece no catodo ou que os elétrons vão do catodo para o anodo. O catodo é a região **protegida**; pelo metal andam os elétrons (do anodo para o catodo) e, pela solução, os **íons**.',
      lab: { lab: 'corrosion', preset: { metA: 3, metB: 5, env: 0, link: 1, aA: 100, aB: 100 }, label: 'Ver a pilha na bancada' },
    },
    {
      title: 'Reação catódica: o meio decide',
      hot: 'As reações da corrosão do aço em água de resfriamento: dissolução do ferro, formação do Fe(OH)₂ com as hidroxilas e oxidação a Fe(OH)₃ (Petrobras 2011).',
      body: 'A reação **anódica** é sempre a oxidação do metal: M → Mⁿ⁺ + n·e⁻. A **catódica** depende do meio:\n- **ácido, sem O₂:** 2H⁺ + 2e⁻ → H₂ (bolhas);\n- **ácido com O₂:** O₂ + 4H⁺ + 4e⁻ → 2H₂O;\n- **neutro ou básico, com O₂** (água do mar, água doce, solo úmido): O₂ + 2H₂O + 4e⁻ → 4OH⁻;\n- **solução com íons de um metal mais nobre:** Mⁿ⁺ + n·e⁻ → M (o metal se deposita, como o cobre sobre o ferro);\n- **água sem O₂, só com metais muito ativos:** 2H₂O + 2e⁻ → H₂ + 2OH⁻.\n\nEm água neutra, a corrosão do aço é controlada pelo **O₂ que chega à superfície**: tirar o oxigênio (desaeração da água de caldeira e da água de injeção) quase para a corrosão.\n\n**Ferrugem**, passo a passo: Fe → Fe²⁺ + 2e⁻; Fe²⁺ + 2OH⁻ → Fe(OH)₂; com mais O₂, Fe(OH)₂ → Fe(OH)₃; desidratado, vira **Fe₂O₃·nH₂O**, a ferrugem.',
      example: 'Zinco e cobre num ácido sem oxigênio, ligados por um fio: o zinco se dissolve, mas as **bolhas de H₂ saem do cobre** — é no catodo que o H⁺ recebe os elétrons. Sozinho nesse ácido, o cobre nem corrói: é mais nobre que o hidrogênio e não há O₂.',
      tip: 'Procure o **oxidante** do meio. Sem O₂ e sem H⁺ disponível, o catodo não tem o que reduzir e a corrosão para.',
      trap: 'Achar que as bolhas de hidrogênio saem do metal que corrói. Elas saem de onde os elétrons são consumidos: o **catodo**.',
      lab: { lab: 'corrosion', preset: { metA: 1, metB: 5, env: 3, link: 1, aA: 100, aB: 100 }, label: 'Zinco e cobre no ácido' },
    },
    {
      title: 'Série galvânica: quem é o anodo?',
      hot: 'Ligado ao aço na água do mar, quem faz o **aço** corroer é um metal **mais nobre**, como o estanho; zinco, magnésio, alumínio e cádmio se sacrificam por ele (Petrobras 2012).',
      body: 'Ligue dois metais num eletrólito: o **mais ativo** (potencial mais negativo) vira o **anodo** e corrói mais; o **mais nobre** vira o **catodo** e fica protegido.\n\nDuas tabelas ordenam os metais:\n- **potenciais padrão de redução** (eletrodo-padrão de hidrogênio, soluções 1 mol/L): Ag +0,80; Cu +0,34; H 0,00; Sn −0,14; Ni −0,25; Cd −0,40; Fe −0,44; Zn −0,76; Al −1,66; Mg −2,37 V;\n- **série galvânica prática**, medida num meio real (água do mar), do mais nobre ao mais ativo: grafite, inox passivo, bronzes e cobre, estanho, aço e ferro fundido, cádmio, alumínio, zinco, magnésio.\n\nAs duas quase sempre concordam, mas a série galvânica inclui as **ligas** e o efeito dos **filmes**: o alumínio, muito ativo na tabela padrão, fica mais nobre na prática por causa do óxido; o **inox** aparece duas vezes — **passivo** (nobre) e **ativo** (com o filme rompido); o **cádmio**, um pouco mais nobre que o ferro na tabela padrão, é **mais ativo que o aço** na água do mar — por isso a cadmiagem protege o aço como anodo de sacrifício.\n\nA fem da pilha é a diferença: **E = E_{catodo} − E_{anodo}**. Quanto mais longe na série, maior a tendência — mas a **velocidade** depende também da área, do meio e da polarização.',
      example: 'Pilha zinco–cobre com os potenciais padrão: E = 0,34 − (−0,76) = **1,10 V**, e o zinco é o anodo.\nFolha de flandres (aço estanhado) em água: o estanho é mais nobre que o aço; riscado o revestimento, quem corrói é o **aço**.',
      tip: 'Anodo de sacrifício = metal **abaixo** do aço na série: magnésio, zinco e ligas de alumínio.',
      trap: 'Somar os potenciais em vez de subtrair, ou achar que o metal mais nobre (de cima) é o que corrói.',
      lab: { lab: 'corrosion', preset: { metA: 3, metB: 4, env: 0, link: 1, aA: 100, aB: 100 }, label: 'Aço ligado a estanho' },
    },
    {
      title: 'Relação de áreas: catodo grande, anodo pequeno',
      hot: '**Catodo grande e anodo pequeno corroem mais rápido** (Transpetro 2012, numa questão que também testava passividade, produtos de corrosão solúveis e folha de flandres).',
      body: 'Em água neutra, a corrente da pilha é limitada pelo **O₂ que chega ao catodo** — e isso é proporcional à **área do catodo**. Toda essa corrente sai do anodo. Para o aço, que sozinho já corrói no limite do O₂:\n\n**taxa do anodo ≈ taxa sozinho × (1 + A_{catodo}/A_{anodo})**\n\n- **catodo grande e anodo pequeno: péssimo** — rebites de aço numa chapa de cobre corroem dezenas de vezes mais rápido;\n- **catodo pequeno e anodo grande: tolerável** — rebites de cobre numa chapa de aço quase não mudam a corrosão da chapa.\n\nConsequências práticas:\n- num par inevitável, faça a peça **pequena e crítica** (parafuso, rebite, solda) do metal **mais nobre**;\n- **nunca pinte só o anodo**: uma falha na pintura vira um anodo minúsculo diante de um catodo enorme. Se só um puder ser pintado, **pinte o catodo**.',
      example: 'Aço com 100 cm² ligado a cobre com 500 cm², em água do mar: a corrosão do aço fica **1 + 500/100 = 6 vezes** maior que a dele sozinho.',
      tip: 'Pense na corrente como fixada pelo catodo: quanto menor o anodo, mais concentrada ela fica.',
      trap: 'Achar que um anodo pequeno corrói "pouco" por ter pouca área. A **penetração** (mm/ano) concentrada fura a peça muito antes.',
      lab: { lab: 'corrosion', preset: { metA: 3, metB: 5, env: 0, link: 1, aA: 10, aB: 1000 }, label: 'Rebite de aço em chapa de cobre' },
    },
    {
      title: 'Passivação',
      hot: 'O que é **passividade** — perda de reatividade de metais normalmente ativos, por um filme fino e aderente (Transpetro 2011) — e qual óxido passiva o inox: **Cr₂O₃** (Petrobras 2018).',
      body: 'Alguns metais formam um **filme de óxido fino, aderente e contínuo** que separa o metal do meio: é a **passivação**, e ela **diminui muito** a taxa de corrosão.\n- **Aços inoxidáveis:** com cromo acima de cerca de **11 %**, formam um filme de **Cr₂O₃** que se refaz sozinho na presença de oxigênio;\n- **alumínio:** Al₂O₃; **titânio:** TiO₂ — por isso eles resistem bem, apesar de muito ativos na tabela padrão.\n\nO filme pode falhar:\n- **cloretos** (água do mar) o rompem em pontos → **pites**;\n- **falta de O₂** (frestas, depósitos) impede que ele se refaça → corrosão em frestas;\n- **falta de cromo** nos contornos de grão → **sensitização** e corrosão intergranular.\n\nPassivo, o inox é nobre (catódico); ativo, comporta-se quase como um aço comum.',
      example: 'Aço carbono ligado a inox passivo na água do mar: o inox é o catodo e o **aço** corrói mais — o filme de Cr₂O₃ não protege o vizinho.',
      tip: 'Passivo = protegido pelo **filme**, não pela nobreza do metal.',
      trap: 'Dizer que a passividade acelera a corrosão, ou que o filme do inox é de óxido de ferro ou de níquel. É **Cr₂O₃**.',
      lab: { lab: 'corrosion', preset: { metA: 3, metB: 6, env: 0, link: 1, aA: 100, aB: 100 }, label: 'Aço ligado a inox' },
    },
    {
      title: 'Aeração diferencial e outras micropilhas',
      body: 'Duas regiões do **mesmo metal** viram uma pilha quando o meio é diferente em cada uma:\n- **aeração diferencial:** a região **menos aerada** (menos O₂) é o **anodo** e corrói; a bem aerada é o catodo. Acontece em **frestas**, sob **depósitos** e incrustações, sob uma gota d’água (corrói o centro, não a borda), na **linha d’água** de tanques e em estacas enterradas;\n- **concentração iônica:** a região em contato com a solução **mais diluída** nos íons do metal tende a ser o anodo.\n\nOutras micropilhas na mesma peça: região **deformada a frio** ou **tensionada** (anódica em relação à recozida), **contornos de grão**, **inclusões**, a zona afetada pelo calor de uma solda e o tubo **novo** ligado a um velho (o novo, sem produto de corrosão, vira o anodo).',
      example: 'Flange com fresta: dentro dela a solução fica parada e sem O₂ — vira o anodo — enquanto a superfície de fora, aerada, é o catodo. A corrosão acontece **dentro** da fresta, onde ninguém vê.',
      tip: 'Menos oxigênio = anodo. Parece contraintuitivo, mas o O₂ é consumido no catodo, a região aerada.',
      trap: 'Achar que a parte mais exposta ao ar é a que mais corrói. Na aeração diferencial é justamente a região escondida, com pouco O₂.',
    },
    {
      title: 'Taxa de corrosão',
      hot: 'Taxa em mm/ano a partir da perda de massa de uma chapa (Transpetro 2011, com K = 87,6; Petrobras 2012). Confira as unidades: mg, g/cm³, cm² e horas.',
      body: 'A taxa se mede em **perda de espessura por tempo** (mm/ano) ou em perda de massa por área e tempo.\n\n**Pela perda de massa** (cupom de ensaio): espessura perdida = Δm/(ρ·A). Na forma de tabela:\n**CR = K·W/(ρ·A·t)**, com **K = 87,6** para CR em mm/ano, W em **mg**, ρ em g/cm³, A em **cm²** e t em **horas** (1 ano = 8.760 h).\n\n**Pela corrente (lei de Faraday):** a massa dissolvida é **m = I·t·M/(n·F)**, com F ≈ 96.500 C/mol, M a massa molar e n os elétrons por átomo (Fe → Fe²⁺: n = 2). Para o aço, 1 A durante 1 ano dissolve **≈ 9 kg**, e 1 A/m² equivale a **≈ 1,2 mm/ano**.\n\nA corrosão **uniforme** é previsível: o projeto soma uma **sobre-espessura de corrosão** (taxa × vida).',
      example: 'Chapa de aço (ρ = 7,9 g/cm³) com 200 cm² perde 79 g em um ano: espessura = 79/(7,9 × 200) = 0,05 cm = **0,5 mm/ano**. Pela fórmula: 87,6 × 79.000/(7,9 × 200 × 8.760) = 0,5 mm/ano.',
      tip: 'Com t = 1 ano, K/t = 87,6/8.760 = 0,01: CR = 0,01·W(mg)/(ρ·A) — é o mesmo Δm/(ρ·A), convertido para mm.',
      trap: 'Usar W em gramas na fórmula com K = 87,6 (erra por 1.000) ou o tempo em dias ou anos em vez de horas.',
      lab: { lab: 'corrosion', preset: { metA: 3, metB: 5, env: 0, link: 1, aA: 100, aB: 100 }, label: 'Ver as taxas na bancada' },
    },
    {
      title: 'Corrosão em altas temperaturas',
      hot: 'O processo que **não** é corrosão em alta temperatura: a **fosfatização**, um tratamento de superfície (Petrobras 2018).',
      body: 'Em altas temperaturas o metal reage **direto com os gases**, sem eletrólito líquido (corrosão "seca"): a **oxidação** forma uma camada de óxido (carepa) que cresce com o tempo.\n\nA camada protege se for contínua e aderente. A **razão de Pilling–Bedworth** (volume do óxido ÷ volume do metal consumido) dá uma ideia:\n- **menor que 1:** o óxido não cobre o metal — camada porosa, **não protetora** (magnésio, sódio, potássio);\n- **entre 1 e 2:** camada contínua e **protetora** (alumínio, níquel, cromo);\n- **bem acima de 2:** o óxido fica comprimido, trinca e **descasca** (molibdênio, tungstênio).\n\nOutras formas em alta temperatura: **sulfetação** (gases com enxofre e H₂S), **carbonetação** (atmosferas ricas em carbono), **descarbonetação** (o aço perde carbono da superfície), ataque por hidrogênio em alta pressão e cinzas fundidas com vanádio.\n\nProteção: ligas com **Cr, Al e Si**, que formam óxidos protetores (inox refratários, ligas de níquel), e revestimentos. Os **cerâmicos**, em geral, resistem mais que os metais em alta temperatura.',
      example: 'Tubos de fornos de refinaria usam aços Cr–Mo (5Cr–½Mo, 9Cr–1Mo) e inox: o cromo forma uma camada que resiste à oxidação e à sulfetação.',
      tip: 'Pilling–Bedworth: abaixo de 1 "falta" óxido; bem acima de 2 "sobra" e ele trinca; entre 1 e 2 é o bom.',
      trap: '**Fosfatização** não é corrosão em alta temperatura: é um **tratamento de superfície** (camada de conversão) que dá aderência à pintura.',
    },
  ],
  roteiros: [
    {
      id: 'pilha',
      name: 'Pilha de corrosão: quem é anodo, quem é catodo',
      when: 'Dois metais em contato num eletrólito (ou um metal ligado a outro); pedem quem corrói, a reação, o caminho dos elétrons ou a força eletromotriz.',
      steps: [
        'Ache o anodo: o metal mais ativo — potencial mais negativo na tabela, ou mais ativo na série galvânica do meio.',
        'Escreva as reações: o anodo se oxida (M → Mⁿ⁺ + n·e⁻); no catodo, o O₂ é reduzido (meio neutro: O₂ + 2H₂O + 4e⁻ → 4OH⁻). Elétrons pelo metal; íons pelo eletrólito.',
        'Conclua: o anodo corrói e o catodo fica protegido; f.e.m. = E_{catodo} − E_{anodo}.',
      ],
      note: '**Anodo = Oxida.** A série galvânica no meio real pode diferir da tabela padrão (o alumínio passivado fica mais nobre).',
    },
    {
      id: 'areas',
      name: 'Relação de áreas no par galvânico',
      when: 'Par galvânico com áreas diferentes; pedem onde a corrosão é pior, o que pintar ou a nova taxa de corrosão.',
      steps: [
        'A corrente é limitada pelo O₂ que chega ao **catodo**: ela cresce com a área catódica.',
        'Toda essa corrente sai do **anodo**: a densidade no anodo é proporcional a (área que consome O₂)/(área anódica).',
        'Conclua: catodo grande com anodo pequeno é o pior caso; para reduzir, diminua a área catódica (pinte o catodo).',
      ],
      note: 'Pintar só o anodo é perigoso: cada falha da pintura vira um anodo minúsculo ligado a um catodo enorme.',
    },
    {
      id: 'aeracao',
      name: 'Aeração diferencial (frestas, gotas, depósitos)',
      when: 'Regiões com acesso diferente ao oxigênio; pedem onde a corrosão acontece.',
      steps: [
        'Ache onde chega mais O₂ e onde chega menos.',
        'A região bem aerada é o catodo (reduz O₂); a pobre em O₂ é o anodo.',
        'Conclua: corrói onde falta oxigênio — centro da gota, fundo da fresta, embaixo do depósito.',
      ],
      note: 'Na fresta a solução acidifica e acumula cloretos: o ataque acelera com o tempo.',
    },
    {
      id: 'taxa-corrosao',
      name: 'Taxa de corrosão (massa, espessura, corrente)',
      when: 'Perda de massa, espessura ou corrente de corrosão; pedem a taxa em mm/ano, a massa consumida ou a vida.',
      steps: [
        'Junte as unidades: massa, massa específica, área e tempo; corrente × tempo = carga (C).',
        'Escolha a relação: CR = 87,6·W/(ρ·A·t); espessura = massa ÷ (ρ·A); Faraday: mols = Q/(n·F).',
        'Calcule e confira a ordem de grandeza (aço: 1 A/m² ≈ 1,2 mm/ano).',
      ],
      note: 'Espessura perdida = volume ÷ área. g/cm³ × 1.000 = kg/m³.',
    },
  ],
  questions: [
    {
      id: 'mec-cor-01',
      type: 'gen',
      difficulty: 2,
      lessonRef: 6,
      title: 'Taxa de corrosão pela perda de massa',
      roteiro: 'taxa-corrosao',
      generate(rng) {
        const mat = pickOne(rng, [
          { n: 'aço carbono', rho: 7.9 },
          { n: 'zinco', rho: 7.1 },
          { n: 'cobre', rho: 8.9 },
          { n: 'alumínio', rho: 2.7 },
        ]);
        const A = pickOne(rng, [100, 150, 200, 250, 400, 500]);
        const CR = pickOne(rng, [0.05, 0.1, 0.2, 0.25, 0.4, 0.5, 0.8, 1, 1.2, 1.5]);
        const per = pickOne(rng, [
          { y: 0.5, s: '6 meses' },
          { y: 1, s: '1 ano' },
          { y: 2, s: '2 anos' },
        ]);
        const h = 8760 * per.y;
        const Wg = (CR * mat.rho * A * per.y) / 10;
        const Wmg = Wg * 1000;
        const distractors = [
          { value: CR / 1000, why: 'Usou W em gramas: com K = 87,6, a massa entra em miligramas.' },
          { value: CR * 24, why: 'Usou o tempo em dias: com K = 87,6, ele entra em horas.' },
          { value: CR * mat.rho * mat.rho, why: 'Multiplicou pela massa específica em vez de dividir.' },
          { value: CR / 10, why: 'Deu o resultado em cm/ano: falta multiplicar por 10 para mm.' },
        ];
        if (per.y !== 1) distractors.unshift({ value: CR * per.y, why: `Não dividiu pelo tempo: ${per.s} não é 1 ano.` });
        const { options, answer } = numericOptions({
          correct: CR,
          unit: 'mm/ano',
          digits: 3,
          // só distratores que aparecem diferentes de zero com 3 casas
          correctWhy: `CR = 87,6 × ${fmt(Wmg, 0)}/(${fmt(mat.rho, 1)} × ${A} × ${fmt(h, 0)}) = ${fmt(CR, 3)} mm/ano.`,
          distractors: distractors.filter((d) => d.value >= 0.0005),
        });
        return {
          prompt: `Um cupom de ${mat.n} (ρ = ${fmt(mat.rho, 1)} g/cm³), com ${A} cm² de área exposta, ficou ${per.s} (${fmt(h, 0)} h) num meio corrosivo e perdeu ${fmt(Wg, 3)} g por corrosão uniforme. Usando CR = K·W/(ρ·A·t), com K = 87,6 (W em mg, ρ em g/cm³, A em cm² e t em horas), a taxa de corrosão é`,
          options,
          answer,
          hint: 'Converta a massa para miligramas e o tempo para horas antes de usar K = 87,6.',
          steps: [
            `W = ${fmt(Wg, 3)} g = ${fmt(Wmg, 0)} mg; t = ${fmt(h, 0)} h; ρ = ${fmt(mat.rho, 1)} g/cm³; A = ${A} cm².`,
            `CR = 87,6 × ${fmt(Wmg, 0)}/(${fmt(mat.rho, 1)} × ${A} × ${fmt(h, 0)}).`,
            `CR = **${fmt(CR, 3)} mm/ano**.`,
          ],
          explanation: `1. W = ${fmt(Wg, 3)} g = ${fmt(Wmg, 0)} mg; t = ${fmt(h, 0)} h.\n2. CR = 87,6 × ${fmt(Wmg, 0)}/(${fmt(mat.rho, 1)} × ${A} × ${fmt(h, 0)}) = **${fmt(CR, 3)} mm/ano**.\n3. Conferindo pela espessura: ${fmt(Wg, 3)}/(${fmt(mat.rho, 1)} × ${A}) = ${fmt((CR * per.y) / 10, 4)} cm em ${per.s} → ${fmt(CR, 3)} mm/ano.`,
        };
      },
    },
    {
      id: 'mec-cor-02',
      type: 'gen',
      difficulty: 2,
      lessonRef: 6,
      title: 'Espessura perdida por ano',
      roteiro: 'taxa-corrosao',
      generate(rng) {
        const rho = pickOne(rng, [2.7, 7.1, 7.8, 7.9, 8.9]);
        const A = pickOne(rng, [0.5, 1, 2, 2.5, 4]);
        const years = pickOne(rng, [2, 4, 5, 8, 10]);
        const CR = pickOne(rng, [0.01, 0.02, 0.025, 0.04, 0.05, 0.08, 0.1, 0.2]);
        const m = CR * years * A * rho;
        const { options, answer } = numericOptions({
          correct: CR,
          unit: 'mm/ano',
          digits: 4,
          correctWhy: `Espessura = ${fmt(m, 3)} kg/(${fmt(rho * 1000, 0)} kg/m³ × ${fmt(A, 1)} m²) = ${fmt((CR * years) / 1000, 6)} m = ${fmt(CR * years, 3)} mm em ${years} anos → ${fmt(CR, 4)} mm/ano.`,
          distractors: [
            { value: CR * years, why: `Não dividiu pelos ${years} anos: essa é a espessura total perdida.` },
            { value: CR * 10, why: 'Errou a conversão de unidades por um fator 10 (cm × mm).' },
            { value: CR / 10, why: 'Errou a conversão de unidades por um fator 10 (cm × mm).' },
            { value: CR * 1000, why: 'Usou ρ em g/cm³ como se fosse kg/m³ (ou esqueceu de converter metros em milímetros).' },
          ],
        });
        return {
          prompt: `Uma chapa espessa de um material com massa específica ${fmt(rho, 1)} g/cm³ tem ${fmt(A, 1)} m² expostos a um ambiente corrosivo. Em ${years} anos ela perdeu ${fmt(m, 3)} kg, por corrosão uniforme. A taxa de corrosão é`,
          options,
          answer,
          hint: 'Espessura perdida = massa ÷ (massa específica × área). Cuidado com as unidades: g/cm³ = 1.000 kg/m³.',
          steps: [
            `ρ = ${fmt(rho, 1)} g/cm³ = ${fmt(rho * 1000, 0)} kg/m³; A = ${fmt(A, 1)} m²; t = ${years} anos.`,
            `Espessura = massa ÷ (ρ·A) = ${fmt(m, 3)}/(${fmt(rho * 1000, 0)} × ${fmt(A, 1)}) = ${fmt(CR * years, 3)} mm.`,
            `Por ano: ${fmt(CR * years, 3)}/${years} = **${fmt(CR, 4)} mm/ano**.`,
          ],
          explanation: `1. ρ = ${fmt(rho, 1)} g/cm³ = ${fmt(rho * 1000, 0)} kg/m³.\n2. Volume perdido = ${fmt(m, 3)}/${fmt(rho * 1000, 0)} = ${fmt(m / (rho * 1000), 7)} m³.\n3. Espessura = volume ÷ área = ${fmt(m / (rho * 1000), 7)}/${fmt(A, 1)} = ${fmt((CR * years) / 1000, 6)} m = ${fmt(CR * years, 3)} mm.\n4. Por ano: ${fmt(CR * years, 3)}/${years} = **${fmt(CR, 4)} mm/ano**.`,
        };
      },
    },
    {
      id: 'mec-cor-03',
      type: 'gen',
      difficulty: 3,
      lessonRef: 6,
      title: 'Massa dissolvida pela corrente (Faraday)',
      roteiro: 'taxa-corrosao',
      generate(rng) {
        const met = pickOne(rng, [
          { n: 'ferro', M: 55.8, z: 2, ion: 'Fe²⁺' },
          { n: 'zinco', M: 65.4, z: 2, ion: 'Zn²⁺' },
          { n: 'alumínio', M: 27, z: 3, ion: 'Al³⁺' },
          { n: 'magnésio', M: 24.3, z: 2, ion: 'Mg²⁺' },
        ]);
        const I = pickOne(rng, [0.1, 0.2, 0.5, 1, 2, 5]);
        const mol = (I * YEAR) / (met.z * F);
        const kg = (mol * met.M) / 1000;
        const { options, answer } = numericOptions({
          correct: kg,
          unit: 'kg',
          digits: kg < 1 ? 3 : 2,
          correctWhy: `m = I·t·M/(n·F) = ${fmt(I, 1)} × 3,15 × 10⁷ × ${fmt(met.M, 1)}/(${met.z} × 96.500) ≈ ${fmt(kg * 1000, 0)} g.`,
          distractors: [
            { value: kg * met.z, why: `Esqueceu de dividir por n = ${met.z} (elétrons por átomo de ${met.ion}).` },
            { value: kg / met.z, why: 'Dividiu por n duas vezes.' },
            { value: mol, why: 'Parou no número de mols (I·t/(n·F)): falta multiplicar pela massa molar.' },
            { value: kg * 1000, why: 'Achou a massa em gramas e não converteu para kg.' },
          ],
        });
        return {
          prompt: `Um anodo de ${met.n} (M = ${fmt(met.M, 1)} g/mol; dissolve como ${met.ion}) fornece uma corrente constante de ${fmt(I, 1)} A durante 1 ano (≈ 3,15 × 10⁷ s). Com F = 96.500 C/mol, a massa de ${met.n} consumida é, aproximadamente,`,
          options,
          answer,
          hint: 'Carga Q = I·t (em coulombs); mols de metal = Q/(n·F); massa = mols × M.',
          steps: [
            `Q = I·t = ${fmt(I, 1)} × 3,15 × 10⁷ = ${fmt(I * YEAR, 0)} C.`,
            `Mols = Q/(n·F) = ${fmt(I * YEAR, 0)}/(${met.z} × 96.500) = ${fmt(mol, 1)} mol.`,
            `Massa = ${fmt(mol, 1)} × ${fmt(met.M, 1)} = ${fmt(kg * 1000, 0)} g = **${fmt(kg, 3)} kg**.`,
          ],
          explanation: `1. Q = I·t = ${fmt(I, 1)} × 3,15 × 10⁷ = ${fmt(I * YEAR, 0)} C.\n2. Mols de ${met.n}: Q/(n·F) = ${fmt(I * YEAR, 0)}/(${met.z} × 96.500) = ${fmt(mol, 1)} mol.\n3. Massa: ${fmt(mol, 1)} × ${fmt(met.M, 1)} = ${fmt(kg * 1000, 0)} g = **${fmt(kg, 3)} kg**.`,
        };
      },
    },
    {
      id: 'mec-cor-04',
      type: 'gen',
      difficulty: 1,
      lessonRef: 2,
      title: 'Força eletromotriz de uma pilha',
      roteiro: 'pilha',
      generate(rng) {
        let a = pickOne(rng, STD);
        let b = pickOne(rng, STD);
        while (b === a || Math.abs(a.E - b.E) < 0.2) b = pickOne(rng, STD);
        if (a.E > b.E) [a, b] = [b, a];
        const fem = b.E - a.E;
        const { options, answer } = numericOptions({
          correct: fem,
          unit: 'V',
          digits: 2,
          correctWhy: `E = E_{catodo} − E_{anodo} = ${fE(b.E)} − (${fE(a.E)}) = ${fmt(fem, 2)} V; o ${a.name} é o anodo.`,
          distractors: [
            { value: Math.abs(a.E + b.E), why: 'Somou os potenciais: a fem é a diferença entre o do catodo e o do anodo.' },
            { value: Math.abs(a.E), why: 'Usou só o potencial do anodo.' },
            { value: Math.abs(b.E), why: 'Usou só o potencial do catodo.' },
            { value: -fem, why: 'Subtraiu ao contrário: a fem de uma pilha que funciona sozinha é positiva.' },
          ],
        });
        return {
          prompt: `Os potenciais padrão de redução são ${a.ion}: ${fE(a.E)} V e ${b.ion}: ${fE(b.E)} V. A força eletromotriz padrão da pilha formada por ${a.name} e ${b.name} é`,
          options,
          answer,
          hint: 'O metal de potencial mais negativo é o anodo. E = E_{catodo} − E_{anodo}.',
          steps: [
            `Mais negativo: ${a.name} (${fE(a.E)} V) → **anodo**.`,
            `${b.name[0].toUpperCase()}${b.name.slice(1)} (${fE(b.E)} V) → **catodo**: lá ocorre a redução, e ele fica protegido.`,
            `E = ${fE(b.E)} − (${fE(a.E)}) = **${fmt(fem, 2)} V**.`,
          ],
          explanation: `1. O mais negativo, ${a.name} (${fE(a.E)} V), é o **anodo**: ele se oxida.\n2. O ${b.name} (${fE(b.E)} V) é o **catodo**.\n3. E = ${fE(b.E)} − (${fE(a.E)}) = **${fmt(fem, 2)} V**.`,
        };
      },
    },
    {
      id: 'mec-cor-05',
      type: 'gen',
      difficulty: 2,
      lessonRef: 3,
      title: 'Relação de áreas no par galvânico',
      roteiro: 'areas',
      generate(rng) {
        const cat = pickOne(rng, ['cobre', 'bronze', 'inox 316 passivo', 'monel']);
        const Aa = pickOne(rng, [2, 5, 10, 20, 25, 50]);
        const k = pickOne(rng, [4, 5, 9, 10, 19, 20, 49]);
        const Ac = Aa * k;
        const r0 = pickOne(rng, [0.1, 0.12, 0.15, 0.2]);
        const r = r0 * (1 + Ac / Aa);
        const { options, answer } = numericOptions({
          correct: r,
          unit: 'mm/ano',
          digits: 2,
          correctWhy: `taxa = ${fmt(r0, 2)} × (1 + ${fmt(Ac, 0)}/${Aa}) = ${fmt(r0, 2)} × ${k + 1} = ${fmt(r, 2)} mm/ano.`,
          distractors: [
            { value: r0 * (Ac / Aa), why: 'Esqueceu que o O₂ também chega à própria área do aço: são (1 + Ac/Aa) partes, não Ac/Aa.' },
            { value: r0 * (1 + Aa / Ac), why: 'Inverteu a relação de áreas.' },
            { value: r0, why: 'A área importa: toda a corrente do catodo sai do aço.' },
            { value: r0 * 2, why: 'Dobrou a taxa sem considerar as áreas.' },
          ],
        });
        return {
          prompt: `Em água do mar, o aço sozinho corrói a ${fmt(r0, 2)} mm/ano, com a corrente limitada pelo O₂ que chega à superfície. Parafusos de aço com ${Aa} cm² de área molhada prendem uma peça de ${cat} com ${fmt(Ac, 0)} cm². Admitindo que o O₂ chegue com a mesma densidade de corrente às duas superfícies e que toda a corrente catódica saia do aço, a taxa de corrosão dos parafusos passa a ser, aproximadamente,`,
          options,
          answer,
          hint: 'A corrente total é proporcional à área que recebe O₂ (aço + catodo), e sai só da área do aço.',
          steps: [
            `Área que consome O₂: ${Aa} + ${fmt(Ac, 0)} = ${fmt(Aa + Ac, 0)} cm² (aço + ${cat}).`,
            `Área que fornece os elétrons: só o aço, ${Aa} cm² → densidade ${fmt(Aa + Ac, 0)}/${Aa} = ${k + 1} vezes maior.`,
            `${fmt(r0, 2)} × ${k + 1} = **${fmt(r, 2)} mm/ano**.`,
          ],
          explanation: `1. Área que consome O₂ (e puxa elétrons do aço): ${Aa} + ${fmt(Ac, 0)} = ${fmt(Aa + Ac, 0)} cm².\n2. Área que fornece os elétrons: só o aço, ${Aa} cm².\n3. A densidade de corrente no aço sobe ${fmt(Aa + Ac, 0)}/${Aa} = ${k + 1} vezes: ${fmt(r0, 2)} × ${k + 1} = **${fmt(r, 2)} mm/ano**. Catodo grande e anodo pequeno é a pior combinação.`,
        };
      },
    },
    {
      id: 'mec-cor-06',
      type: 'gen',
      difficulty: 3,
      lessonRef: 6,
      title: 'Densidade de corrente × taxa de penetração',
      roteiro: 'taxa-corrosao',
      generate(rng) {
        const met = pickOne(rng, [
          { n: 'aço carbono', M: 55.8, z: 2, rho: 7.9 },
          { n: 'zinco', M: 65.4, z: 2, rho: 7.1 },
          { n: 'cobre', M: 63.5, z: 2, rho: 8.9 },
        ]);
        const i = pickOne(rng, [0.05, 0.1, 0.2, 0.5, 1, 2]);
        const mmYear = ((i * met.M) / (met.z * F * met.rho * 1000)) * YEAR;
        const { options, answer } = numericOptions({
          correct: mmYear,
          unit: 'mm/ano',
          digits: 3,
          correctWhy: `taxa = i·M/(n·F·ρ) × t = ${fmt(i, 2)} × ${fmt(met.M / 1000, 4)}/(${met.z} × 96.500 × ${fmt(met.rho * 1000, 0)}) × 3,15 × 10⁷ m = ${fmt(mmYear, 3)} mm/ano.`,
          distractors: [
            { value: mmYear * met.z, why: `Esqueceu de dividir por n = ${met.z}.` },
            { value: mmYear * 1000, why: 'Usou ρ em g/cm³ no lugar de kg/m³ (ou M em g/mol com ρ em kg/m³).' },
            { value: mmYear / 10, why: 'Converteu metros em milímetros multiplicando por 100 (o certo é 1.000).' },
            { value: mmYear / 2, why: 'Dividiu por n duas vezes.' },
          ],
        });
        return {
          prompt: `A densidade de corrente de corrosão numa superfície de ${met.n} é ${fmt(i, 2)} A/m². Com M = ${fmt(met.M, 1)} g/mol, n = ${met.z}, ρ = ${fmt(met.rho, 1)} g/cm³, F = 96.500 C/mol e 1 ano ≈ 3,15 × 10⁷ s, a taxa de penetração é, aproximadamente,`,
          options,
          answer,
          hint: 'Em 1 s e 1 m², a massa dissolvida é i·M/(n·F); divida por ρ para ter a espessura. Use SI: M em kg/mol e ρ em kg/m³.',
          steps: [
            `i = ${fmt(i, 2)} A/m²; M = ${fmt(met.M / 1000, 4)} kg/mol; ρ = ${fmt(met.rho * 1000, 0)} kg/m³; t = 3,15 × 10⁷ s.`,
            `Espessura por segundo = i·M/(n·F·ρ) = ${fmt(i, 2)} × ${fmt(met.M / 1000, 4)}/(${met.z} × 96.500 × ${fmt(met.rho * 1000, 0)}) m/s.`,
            `Vezes 1 ano: ${fmt(mmYear / 1000, 6)} m = **${fmt(mmYear, 3)} mm/ano**.`,
          ],
          explanation: `1. Massa por segundo e por m²: i·M/(n·F) = ${fmt(i, 2)} × ${fmt(met.M / 1000, 4)}/(${met.z} × 96.500) kg/(m²·s).\n2. Dividindo por ρ = ${fmt(met.rho * 1000, 0)} kg/m³: espessura por segundo, em m/s.\n3. Vezes 3,15 × 10⁷ s: ${fmt(mmYear / 1000, 6)} m/ano = **${fmt(mmYear, 3)} mm/ano**. (Para o aço, 1 A/m² ≈ 1,2 mm/ano.)`,
        };
      },
    },
    {
      id: 'mec-cor-07',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Uma tubulação de aço enterrada está ligada por um cabo a um bloco de magnésio, também enterrado. Sobre o funcionamento dessa pilha, é correto afirmar que',
      options: [
        { text: 'os elétrons saem do magnésio e chegam ao aço pelo cabo, e o solo úmido conduz os íons.', why: 'Correta: o magnésio, mais ativo, é o anodo; o aço é o catodo; o solo é o eletrólito.' },
        { text: 'o aço se oxida e cede elétrons ao magnésio.', why: 'O aço é mais nobre que o magnésio: ele recebe elétrons (catodo).' },
        { text: 'o magnésio é o catodo da pilha, por ser o metal mais ativo.', why: 'O mais ativo é o **anodo**: é ele que se oxida.' },
        { text: 'o solo conduz os elétrons do magnésio até o aço.', why: 'Os elétrons andam pelo contato metálico (o cabo); o solo conduz íons.' },
        { text: 'a reação Fe → Fe²⁺ + 2e⁻ fica mais intensa no aço.', why: 'Ao contrário: ligado ao magnésio, o aço é polarizado e a dissolução dele cai.' },
      ],
      answer: 0,
      roteiro: 'pilha',
      steps: [
        'O magnésio é muito mais ativo que o aço → é o anodo.',
        'Mg → Mg²⁺ + 2e⁻; os elétrons vão **pelo cabo** até o aço, onde o O₂ do solo é reduzido; no solo andam os **íons**.',
        'Fica **os elétrons saem do magnésio e chegam ao aço pelo cabo; o solo conduz os íons**.',
      ],
      explanation: 'É uma proteção catódica por anodo de sacrifício: o **magnésio** (anodo) se oxida, Mg → Mg²⁺ + 2e⁻; os **elétrons** vão pelo **cabo** até o aço (catodo), onde o O₂ do solo é reduzido; no **solo úmido** (eletrólito) andam os **íons**.',
    },
    {
      id: 'mec-cor-08',
      difficulty: 1,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Um tanque de aço armazena água do mar com oxigênio dissolvido (pH ≈ 8). A principal reação catódica na corrosão do tanque é',
      options: [
        { text: 'O₂ + 2H₂O + 4e⁻ → 4OH⁻', why: 'Correta: meio neutro ou básico com O₂.' },
        { text: '2H⁺ + 2e⁻ → H₂', why: 'Típica de meio ácido sem oxigênio.' },
        { text: 'O₂ + 4H⁺ + 4e⁻ → 2H₂O', why: 'Típica de meio ácido com oxigênio.' },
        { text: 'Fe → Fe²⁺ + 2e⁻', why: 'Essa é a reação anódica.' },
        { text: 'Cu²⁺ + 2e⁻ → Cu', why: 'Deposição de metal: exigiria íons de um metal mais nobre na solução.' },
      ],
      answer: 0,
      roteiro: 'pilha',
      steps: [
        'O anodo é o aço (Fe → Fe²⁺ + 2e⁻) — mas a pergunta é sobre o catodo.',
        'Meio neutro ou básico e aerado (pH 8, com O₂): O₂ + 2H₂O + 4e⁻ → 4OH⁻.',
        'Fica **O₂ + 2H₂O + 4e⁻ → 4OH⁻**. A reação 2H⁺ → H₂ é de meio ácido.',
      ],
      explanation: 'Em meio **neutro ou básico aerado**, o oxidante é o O₂ dissolvido: **O₂ + 2H₂O + 4e⁻ → 4OH⁻**. Os OH⁻ encontram os Fe²⁺ vindos do anodo e formam os hidróxidos que viram ferrugem.',
    },
    {
      id: 'mec-cor-09',
      difficulty: 2,
      lessonRef: 1,
      source: 'Autoral',
      prompt: 'Na corrosão do aço em água aerada, a ferrugem que se acumula sobre a superfície é',
      options: [
        { text: 'óxido de ferro hidratado (Fe₂O₃·nH₂O), resultado da oxidação do Fe(OH)₂ a Fe(OH)₃ e da desidratação.', why: 'Correta: Fe²⁺ + 2OH⁻ → Fe(OH)₂ → Fe(OH)₃ → Fe₂O₃·nH₂O.' },
        { text: 'ferro metálico depositado pelos íons Fe²⁺ no catodo.', why: 'O Fe²⁺ não se reduz de volta: a reação catódica é a do O₂.' },
        { text: 'cloreto de ferro insolúvel, formado pelos íons Cl⁻ da água.', why: 'Os cloretos aceleram a corrosão, mas a ferrugem é óxido/hidróxido de ferro.' },
        { text: 'hidrogênio retido nos poros do aço.', why: 'Em água aerada e neutra, a reação catódica não forma H₂.' },
        { text: 'carboneto de ferro que se separa da perlita.', why: 'A cementita não é produto de corrosão.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: o que é a **ferrugem**.',
        'Fe²⁺ (anodo) + OH⁻ (catodo) → Fe(OH)₂ → com mais O₂, Fe(OH)₃ → desidratado, Fe₂O₃·nH₂O.',
        'Fica **óxido de ferro hidratado (Fe₂O₃·nH₂O)** — poroso e pouco protetor.',
      ],
      explanation: 'Sequência: **Fe → Fe²⁺ + 2e⁻** (anodo); **O₂ + 2H₂O + 4e⁻ → 4OH⁻** (catodo); **Fe²⁺ + 2OH⁻ → Fe(OH)₂**; com mais O₂, **Fe(OH)₂ → Fe(OH)₃**; desidratado, **Fe₂O₃·nH₂O** — a ferrugem, porosa e pouco protetora.',
    },
    {
      id: 'mec-cor-10',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Numa linha de água do mar em aço carbono, uma válvula de bronze foi aparafusada direto no flange de aço, sem isolamento elétrico. Espera-se que',
      options: [
        { text: 'o aço junto à válvula corroa mais, por ser mais ativo que o bronze.', why: 'Correta: o aço vira o anodo do par.' },
        { text: 'o bronze corroa mais, por ser mais nobre.', why: 'O mais nobre é o catodo: fica protegido.' },
        { text: 'os dois fiquem protegidos, porque estão em contato.', why: 'O contato forma a pilha: um dos dois corrói mais.' },
        { text: 'nada mude, porque a água do mar é um meio neutro.', why: 'Neutra, mas aerada e muito condutora: é um ótimo eletrólito.' },
        { text: 'o aço fique protegido catodicamente pelo bronze.', why: 'Para proteger o aço, o outro metal precisaria ser mais ativo que ele.' },
      ],
      answer: 0,
      roteiro: 'pilha',
      steps: [
        'Na série galvânica em água do mar, o bronze é mais nobre: o **aço é o anodo**.',
        'Contato elétrico e mesmo eletrólito formam a pilha: o aço se oxida e o bronze recebe os elétrons.',
        'Fica **o aço junto à válvula corrói mais**.',
      ],
      explanation: 'Na série galvânica em água do mar, as ligas de cobre (bronzes) são **mais nobres** que o aço. Em contato elétrico e no mesmo eletrólito, o **aço é o anodo** e corrói mais, sobretudo perto da junção. Solução: isolar o par (juntas e luvas dielétricas) ou escolher materiais próximos na série.',
    },
    {
      id: 'mec-cor-11',
      difficulty: 1,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Potenciais padrão de redução: Zn²⁺/Zn −0,76 V; Fe²⁺/Fe −0,44 V; Ni²⁺/Ni −0,25 V; Sn²⁺/Sn −0,14 V; Pb²⁺/Pb −0,13 V; Cu²⁺/Cu +0,34 V. Ligado a uma estrutura de aço, o metal que a protegeria como anodo de sacrifício é o',
      options: [
        { text: 'zinco.', why: 'Correta: único da lista mais ativo que o ferro.' },
        { text: 'níquel.', why: 'Mais nobre que o ferro: o aço é que corroeria.' },
        { text: 'estanho.', why: 'Mais nobre que o ferro: o aço é que corroeria.' },
        { text: 'chumbo.', why: 'Mais nobre que o ferro: o aço é que corroeria.' },
        { text: 'cobre.', why: 'O mais nobre da lista: aceleraria a corrosão do aço.' },
      ],
      answer: 0,
      roteiro: 'pilha',
      steps: [
        'Para proteger o aço, o outro metal tem de ser o anodo: mais negativo que −0,44 V.',
        'Da lista, só o Zn (−0,76 V) é mais ativo; Ni, Sn, Pb e Cu são mais nobres e seriam catodos.',
        'Fica **zinco**.',
      ],
      explanation: 'O anodo de sacrifício precisa ser **mais ativo** (potencial mais negativo) que o ferro (−0,44 V). Da lista, só o **zinco** (−0,76 V) serve. Na prática também se usam magnésio e ligas de alumínio.',
    },
    {
      id: 'mec-cor-12',
      difficulty: 2,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Na tabela de potenciais padrão, o alumínio (−1,66 V) é bem mais ativo que o zinco (−0,76 V). Na série galvânica em água do mar, porém, o alumínio comercial fica mais nobre que o zinco. A diferença se explica',
      options: [
        { text: 'pelo filme de óxido (Al₂O₃) que passiva a superfície do alumínio.', why: 'Correta: a série prática inclui o efeito dos filmes.' },
        { text: 'por um erro de medição na tabela de potenciais padrão.', why: 'As duas tabelas medem coisas diferentes; nenhuma está errada.' },
        { text: 'porque a água do mar reduz o alumínio a metal.', why: 'Não há redução do Al³⁺ em água.' },
        { text: 'porque o zinco é mais denso que o alumínio.', why: 'Densidade não define a posição na série.' },
        { text: 'pela maior condutividade elétrica do alumínio.', why: 'A condutividade do metal não muda o potencial de corrosão.' },
      ],
      answer: 0,
      roteiro: 'pilha',
      steps: [
        'Pela tabela padrão, o Al (−1,66 V) seria mais ativo que o Zn (−0,76 V).',
        'Mas a série galvânica é medida no meio real: o alumínio se cobre de Al₂O₃ e fica passivo.',
        'Fica **o filme de óxido (Al₂O₃) que passiva o alumínio**.',
      ],
      explanation: 'A tabela padrão vale para o metal "nu", em solução dos próprios íons (1 mol/L). A **série galvânica** é medida no meio real: o alumínio se cobre de **Al₂O₃** e fica mais nobre. Por isso anodos de alumínio usam ligas com zinco e índio, que impedem a passivação.',
    },
    {
      id: 'mec-cor-13',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Em água do mar, qual montagem leva à maior taxa de penetração (mm/ano) no metal que se corrói?',
      options: [
        { text: 'Rebites de aço numa chapa grande de cobre.', why: 'Correta: anodo pequeno e catodo grande.' },
        { text: 'Rebites de cobre numa chapa grande de aço.', why: 'Catodo pequeno: a corrosão da chapa quase não muda.' },
        { text: 'Chapa de aço e chapa de cobre de mesma área.', why: 'Há corrosão galvânica, mas bem menos concentrada.' },
        { text: 'Rebites de aço numa chapa grande de aço.', why: 'Mesmo metal: não há par galvânico.' },
        { text: 'Rebites de cobre numa chapa grande de cobre.', why: 'Mesmo metal: não há par galvânico.' },
      ],
      answer: 0,
      roteiro: 'areas',
      steps: [
        'A corrente depende da área catódica (onde o O₂ é reduzido).',
        'Rebites de aço numa chapa de cobre: catodo enorme e anodo minúsculo → corrente grande saindo de pouca área.',
        'Fica **rebites de aço numa chapa grande de cobre**.',
      ],
      explanation: 'A corrente é limitada pelo O₂ que chega ao **catodo** — proporcional à área dele — e sai toda do **anodo**. Com rebites de aço numa chapa de cobre, uma corrente grande sai de uma área pequena: a penetração é **muito** alta. Invertendo os materiais, quase nada muda.',
    },
    {
      id: 'mec-cor-14',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Um tanque de aço carbono tem o fundo de inox, ligado eletricamente ao costado, e guarda água salgada. Se só um dos dois puder ser pintado por dentro, para reduzir a corrosão galvânica deve-se pintar',
      options: [
        { text: 'o inox (catodo), porque diminuir a área catódica reduz a corrente da pilha.', why: 'Correta: o catodo controla a corrente.' },
        { text: 'o aço (anodo), para isolá-lo do meio.', why: 'Qualquer falha na pintura vira um anodo minúsculo diante de um catodo enorme.' },
        { text: 'qualquer um dos dois: o efeito é o mesmo.', why: 'Não é: pintar o anodo pode concentrar o ataque.' },
        { text: 'nenhum: pintura não altera pares galvânicos.', why: 'Altera, porque muda as áreas expostas ao eletrólito.' },
        { text: 'só o cordão de solda entre eles.', why: 'Não muda as áreas do anodo e do catodo.' },
      ],
      answer: 0,
      roteiro: 'areas',
      steps: [
        'Inox = catodo; aço = anodo.',
        'Pintar o catodo reduz a área que consome O₂ e, com ela, a corrente que sai do aço.',
        'Fica **pintar o inox (catodo)**. Pintar só o aço concentraria o ataque nas falhas.',
      ],
      explanation: 'Pintar o **catodo** diminui a área que consome O₂ e, com ela, a corrente que sai do aço. Pintar só o **anodo** é perigoso: os defeitos da pintura viram anodos pequenos ligados a um catodo grande, e o ataque fura a chapa nesses pontos.',
    },
    {
      id: 'mec-cor-15',
      difficulty: 1,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'Sobre a passividade dos aços inoxidáveis, é correto afirmar que ela',
      options: [
        { text: 'vem de um filme fino de Cr₂O₃ que se refaz sozinho na presença de oxigênio.', why: 'Correta.' },
        { text: 'acelera a corrosão, porque o óxido é mais nobre que o metal.', why: 'A passividade **reduz** a corrosão.' },
        { text: 'se mantém mesmo dentro de frestas sem oxigênio.', why: 'Sem O₂ o filme não se refaz: é a corrosão em frestas.' },
        { text: 'é reforçada pelos íons cloreto da água do mar.', why: 'Os cloretos rompem o filme e causam pites.' },
        { text: 'depende do níquel, que forma uma camada de NiO.', why: 'O filme é de óxido de **cromo**; o níquel estabiliza a austenita.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: **passividade** do inox.',
        'Com cromo acima de ~11 %, forma-se um filme de Cr₂O₃ de poucos nanômetros, que se regenera com O₂; ele falha sem O₂ (frestas) ou com cloretos (pites).',
        'Fica **filme de Cr₂O₃ que se refaz sozinho na presença de oxigênio**.',
      ],
      explanation: 'Com cromo acima de cerca de 11 %, o aço forma um filme de **Cr₂O₃** de poucos nanômetros, aderente e que se **regenera** com o oxigênio. Ele falha onde falta O₂ (frestas) ou onde há cloretos (pites).',
    },
    {
      id: 'mec-cor-16',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Uma gota de água salgada fica parada sobre uma chapa de aço. Depois de um tempo, a corrosão aparece',
      options: [
        { text: 'no centro da gota, onde chega menos O₂; a borda funciona como catodo.', why: 'Correta: aeração diferencial.' },
        { text: 'na borda da gota, onde chega mais O₂.', why: 'A região bem aerada é o **catodo**.' },
        { text: 'por igual em toda a área molhada.', why: 'A diferença de aeração cria anodo e catodo separados.' },
        { text: 'só fora da gota, onde o aço está seco.', why: 'Sem eletrólito não há pilha.' },
        { text: 'em nenhum ponto, porque o aço carbono passiva em água salgada.', why: 'O aço carbono não passiva em água salgada.' },
      ],
      answer: 0,
      roteiro: 'aeracao',
      steps: [
        'A borda da gota é fina: o O₂ chega fácil. O centro é espesso: chega pouco.',
        'Borda = catodo; centro = anodo.',
        'Fica **no centro da gota** (é o experimento de Evans).',
      ],
      explanation: 'O O₂ chega mais fácil à **borda** da gota (fina), que vira o **catodo**. O **centro**, com menos O₂, é o **anodo** e corrói. É o clássico experimento de Evans da aeração diferencial — o mesmo mecanismo das frestas e dos depósitos.',
    },
    {
      id: 'mec-cor-17',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Num flange com junta de vedação, a corrosão se concentra dentro da fresta entre a junta e o metal porque',
      options: [
        { text: 'a solução parada ali perde O₂ e a região vira o anodo de uma pilha de aeração diferencial.', why: 'Correta.' },
        { text: 'a fresta concentra oxigênio e acelera a reação catódica dentro dela.', why: 'É o contrário: falta O₂ na fresta.' },
        { text: 'a junta de vedação é sempre de um metal mais nobre.', why: 'Juntas costumam ser não metálicas; o mecanismo é a aeração diferencial.' },
        { text: 'o aperto dos parafusos encrua o aço da fresta.', why: 'O encruamento local não explica o ataque concentrado na fresta.' },
        { text: 'a fresta fica mais quente que o resto do flange.', why: 'Não há diferença de temperatura relevante.' },
      ],
      answer: 0,
      roteiro: 'aeracao',
      steps: [
        'Na fresta a solução fica parada: o O₂ consumido não volta. Fora, a superfície é aerada.',
        'Dentro = anodo; fora = catodo.',
        'Fica **a solução parada perde O₂ e a fresta vira o anodo de uma pilha de aeração diferencial**.',
      ],
      explanation: 'Na fresta a solução **não se renova**: o O₂ é consumido e não volta. A região vira o **anodo**; a superfície de fora, aerada, é o **catodo**. Com o tempo, a solução da fresta acidifica e acumula cloretos, e o ataque se acelera.',
    },
    {
      id: 'mec-cor-18',
      difficulty: 2,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Na oxidação em alta temperatura, um metal cuja razão de Pilling–Bedworth é menor que 1, como o magnésio, forma uma camada de óxido',
      options: [
        { text: 'porosa e não protetora, porque o óxido ocupa menos volume que o metal consumido.', why: 'Correta.' },
        { text: 'compacta e protetora, como a do alumínio.', why: 'A do alumínio tem razão entre 1 e 2.' },
        { text: 'que trinca e descasca por excesso de volume.', why: 'Isso ocorre quando a razão é bem maior que 2.' },
        { text: 'que só cresce na presença de água líquida.', why: 'A oxidação em alta temperatura é "seca", sem eletrólito líquido.' },
        { text: 'que se regenera como o filme passivo do inox.', why: 'O óxido não cobre a superfície: não pode proteger.' },
      ],
      answer: 0,
      roteiro: 'fmt.conceito',
      steps: [
        'Palavra que decide: razão de **Pilling–Bedworth** menor que 1.',
        'PB = volume do óxido ÷ volume do metal consumido. < 1: o óxido não cobre o metal; entre 1 e 2: protetor; muito acima de 2: trinca e descasca.',
        'Fica **porosa e não protetora**.',
      ],
      explanation: 'Razão de Pilling–Bedworth = volume do óxido ÷ volume do metal consumido. **Menor que 1**: não há óxido suficiente para cobrir o metal → camada porosa, oxidação contínua. **Entre 1 e 2**: camada contínua e protetora. **Bem acima de 2**: o óxido fica comprimido, trinca e descasca.',
    },
    {
      id: 'mec-cor-19',
      type: 'ce',
      difficulty: 1,
      lessonRef: 0,
      source: 'Autoral',
      prompt: 'Numa pilha de corrosão, os elétrons percorrem o contato metálico do anodo para o catodo.',
      answer: true,
      roteiro: 'pilha',
      steps: [
        'O anodo se oxida e libera elétrons.',
        'Os elétrons vão pelo metal até o catodo; na solução andam os íons.',
        'Do anodo para o catodo, pelo contato metálico: **Certo**.',
      ],
      explanation: 'Certo. O anodo se oxida e libera elétrons, que vão pelo metal até o catodo, onde são consumidos pela reação de redução. Na solução andam os íons.',
    },
    {
      id: 'mec-cor-20',
      type: 'ce',
      difficulty: 1,
      lessonRef: 2,
      source: 'Autoral',
      prompt: 'Ligando-se aço carbono a cobre em água do mar, o cobre passa a corroer mais rápido do que corroía sozinho.',
      answer: false,
      roteiro: 'pilha',
      steps: [
        'Aço × cobre em água do mar: o aço é mais ativo → anodo.',
        'O cobre vira catodo e recebe elétrons.',
        'O cobre fica **protegido**; quem corrói mais é o aço: **Errado**.',
      ],
      explanation: 'Errado. O cobre é mais nobre: vira o **catodo** e fica protegido. Quem passa a corroer mais é o **aço**, o anodo do par.',
    },
    {
      id: 'mec-cor-21',
      type: 'ce',
      difficulty: 1,
      lessonRef: 4,
      source: 'Autoral',
      prompt: 'A passivação diminui a taxa de corrosão de um metal.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: a passivação **diminui** a taxa de corrosão?',
        'O filme de óxido aderente (Cr₂O₃ no inox, Al₂O₃ no alumínio) separa o metal do meio.',
        '**Certo**.',
      ],
      explanation: 'Certo. O filme de óxido aderente (Cr₂O₃ no inox, Al₂O₃ no alumínio) separa o metal do meio e reduz muito a corrosão.',
    },
    {
      id: 'mec-cor-22',
      type: 'ce',
      difficulty: 2,
      lessonRef: 3,
      source: 'Autoral',
      prompt: 'Num par galvânico em água do mar, aumentar a área do catodo em relação à do anodo reduz a corrosão do anodo.',
      answer: false,
      roteiro: 'areas',
      steps: [
        'Catodo maior consome mais O₂.',
        'Toda essa corrente extra sai do anodo.',
        'O anodo corrói **mais**: **Errado**.',
      ],
      explanation: 'Errado. Catodo maior consome mais O₂ e puxa mais corrente — toda ela sai do anodo, que corrói **mais**. A pior combinação é catodo grande com anodo pequeno.',
    },
    {
      id: 'mec-cor-23',
      type: 'ce',
      difficulty: 2,
      lessonRef: 5,
      source: 'Autoral',
      prompt: 'Numa pilha de aeração diferencial, a região menos aerada é a que sofre corrosão.',
      answer: true,
      roteiro: 'aeracao',
      steps: [
        'Há regiões com mais e com menos O₂.',
        'A menos aerada é o anodo; a bem aerada, o catodo.',
        'A menos aerada corrói: **Certo**.',
      ],
      explanation: 'Certo. A região com menos O₂ é o anodo; a bem aerada é o catodo, onde o O₂ é reduzido. Por isso frestas e depósitos corroem por baixo.',
    },
    {
      id: 'mec-cor-24',
      type: 'ce',
      difficulty: 2,
      lessonRef: 7,
      source: 'Autoral',
      prompt: 'Em altas temperaturas, os materiais cerâmicos costumam resistir mais à corrosão que os metálicos.',
      answer: true,
      roteiro: 'fmt.ce',
      steps: [
        'Termo que decide: cerâmicos × metálicos em **alta temperatura**.',
        'Cerâmicos já são óxidos, carbonetos ou nitretos — compostos estáveis, que não têm para onde oxidar.',
        'Por isso viram refratários e barreiras térmicas: **Certo**.',
      ],
      explanation: 'Certo. Os cerâmicos já são óxidos, carbonetos ou nitretos — compostos estáveis — e por isso são usados em revestimentos refratários e barreiras térmicas.',
    },
  ],
  games: [
    {
      id: 'mec-cor-g1',
      type: 'sort',
      title: 'Anodo ou catodo?',
      intro: 'Em cada situação, a região ou o metal citado é o **anodo** (corrói) ou o **catodo** (protegido)?',
      lessonRef: 2,
      bins: ['Anodo (corrói)', 'Catodo (protegido)'],
      items: [
        { text: 'O aço, ligado a cobre na água do mar', bin: 0, why: 'O aço é mais ativo que o cobre.' },
        { text: 'O aço, ligado a um bloco de zinco', bin: 1, why: 'O zinco, mais ativo, se sacrifica.' },
        { text: 'O centro de uma gota d’água sobre o aço', bin: 0, why: 'Menos O₂: aeração diferencial.' },
        { text: 'A borda da gota d’água', bin: 1, why: 'Mais O₂: é onde ele é reduzido.' },
        { text: 'O aço exposto num risco da folha de flandres', bin: 0, why: 'O estanho é mais nobre que o aço.' },
        { text: 'O aço exposto num risco do aço galvanizado', bin: 1, why: 'O zinco em volta se sacrifica.' },
        { text: 'O fundo de uma fresta com solução parada', bin: 0, why: 'Sem renovação de O₂.' },
        { text: 'O inox passivo ligado a aço carbono', bin: 1, why: 'Passivo, o inox é nobre.' },
        { text: 'O metal que perde elétrons', bin: 0, why: 'Oxidação = anodo.' },
        { text: 'O metal onde o O₂ vira OH⁻', bin: 1, why: 'Redução = catodo.' },
        { text: 'O cobre onde saem as bolhas de H₂, ligado ao zinco num ácido', bin: 1, why: 'As bolhas saem de onde os elétrons são consumidos.' },
        { text: 'A estrutura ligada ao polo negativo de um retificador', bin: 1, why: 'Ela recebe elétrons: proteção catódica.' },
      ],
    },
    {
      id: 'mec-cor-g2',
      type: 'match',
      title: 'A pilha e as reações',
      intro: 'Ligue cada termo ao que ele faz ou significa.',
      lessonRef: 0,
      leftLabel: 'Termo',
      rightLabel: 'O que é',
      perRound: 6,
      pairs: [
        { left: 'Anodo', right: 'Região que se oxida e corrói', why: 'M → Mⁿ⁺ + n·e⁻.' },
        { left: 'Catodo', right: 'Região onde ocorre a redução', why: 'Consome os elétrons.' },
        { left: 'Eletrólito', right: 'Conduz os íons', why: 'A água, o solo úmido.' },
        { left: 'Contato metálico', right: 'Conduz os elétrons do anodo ao catodo', why: 'O fio, o próprio metal.' },
        { left: 'Meio ácido sem O₂', right: '2H⁺ + 2e⁻ → H₂', why: 'Bolhas no catodo.' },
        { left: 'Meio neutro aerado', right: 'O₂ + 2H₂O + 4e⁻ → 4OH⁻', why: 'Água do mar, água doce, solo.' },
        { left: 'Passivação', right: 'Filme de óxido aderente que freia a corrosão', why: 'Cr₂O₃ no inox.' },
        { left: 'Série galvânica', right: 'Metais e ligas ordenados num meio real', why: 'Do mais nobre ao mais ativo, em água do mar.' },
        { left: 'Lei de Faraday', right: 'm = I·t·M/(n·F)', why: 'Massa dissolvida pela corrente.' },
        { left: 'Pilling–Bedworth', right: 'Volume do óxido ÷ volume do metal', why: 'Entre 1 e 2, camada protetora.' },
      ],
    },
    {
      id: 'mec-cor-g3',
      type: 'order',
      title: 'Como a ferrugem se forma',
      intro: 'Ponha em ordem as etapas da corrosão do aço numa água aerada.',
      lessonRef: 1,
      steps: [
        { text: 'No anodo, o ferro se oxida: Fe → Fe²⁺ + 2e⁻', why: 'A dissolução do metal.' },
        { text: 'Os elétrons correm pelo metal até a região catódica', why: 'O contato metálico fecha o circuito.' },
        { text: 'No catodo, o O₂ é reduzido: O₂ + 2H₂O + 4e⁻ → 4OH⁻', why: 'Meio neutro aerado.' },
        { text: 'Fe²⁺ e OH⁻ se encontram e formam Fe(OH)₂', why: 'Hidróxido ferroso.' },
        { text: 'Com mais O₂, o Fe(OH)₂ vira Fe(OH)₃', why: 'Hidróxido férrico.' },
        { text: 'O Fe(OH)₃ perde água e vira Fe₂O₃·nH₂O, a ferrugem', why: 'Porosa: não protege o aço.' },
      ],
    },
    {
      id: 'mec-cor-lab1',
      type: 'lab',
      lab: 'corrosion',
      title: 'Pilha de corrosão',
      intro: 'Duas placas numa cuba: ligue, troque metais, áreas e o meio, e preveja quem corrói, para onde vão os elétrons e quanto a corrosão acelera.',
      lessonRef: 0,
      perRound: 5,
      tasks: [
        {
          kind: 'predict',
          setup: { metA: 3, metB: 5, env: 0, link: 0, aA: 100, aB: 100 },
          prompt: 'Uma placa de **aço** e uma de **cobre** estão na água do mar, cada uma sozinha. Se elas forem ligadas por um fio…',
          change: { link: 1 },
          options: ['O aço corrói mais e o cobre quase para de corroer', 'O cobre corrói mais e o aço fica protegido', 'Os dois passam a corroer mais', 'Nada muda: o fio não conduz íons', 'Os dois param de corroer'],
          answer: 0,
          expect: [
            { out: 'rA', trend: 'up' },
            { out: 'rB', trend: 'down' },
            { out: 'I', trend: 'up' },
          ],
          why: 'O aço (−0,65 V) é mais ativo que o cobre (−0,32 V): vira o **anodo** e passa a fornecer os elétrons que o O₂ consome no cobre. O cobre vira o **catodo** e fica protegido. Aqui, com áreas iguais, o aço corrói o **dobro**.',
        },
        {
          kind: 'predict',
          setup: { metA: 3, metB: 5, env: 0, link: 1, aA: 100, aB: 100 },
          prompt: 'Com o fio ligado, **para onde vão os elétrons** e onde o O₂ é consumido?',
          options: ['Do aço para o cobre, pelo fio; o O₂ vira OH⁻ no cobre', 'Do cobre para o aço, pelo fio; o O₂ vira OH⁻ no aço', 'Do aço para o cobre, pela água; o cobre se dissolve', 'Não há corrente: os dois metais estão na mesma água'],
          answer: 0,
          why: 'O anodo (aço) se oxida e solta elétrons, que vão **pelo fio** até o catodo (cobre). Lá, O₂ + 2H₂O + 4e⁻ → 4OH⁻. Pela água andam os **íons** (Fe²⁺ para um lado, OH⁻ para o outro), que se encontram e formam a ferrugem.',
        },
        {
          kind: 'predict',
          setup: { metA: 3, metB: 5, env: 0, link: 1, aA: 100, aB: 100 },
          prompt: 'O cobre (catodo) passa a ter **10 vezes mais área** (1.000 cm²); o aço continua com 100 cm². A corrosão do aço…',
          change: { aB: 1000 },
          options: ['Aumenta muito: o catodo maior puxa mais corrente do mesmo anodo', 'Diminui: a corrente se espalha por uma área maior', 'Não muda: a diferença de potencial é a mesma', 'Para: o cobre passa a ser o anodo'],
          answer: 0,
          expect: [
            { out: 'rA', trend: 'up' },
            { out: 'I', trend: 'up' },
          ],
          why: 'A corrente é limitada pelo O₂ que chega ao catodo — proporcional à área dele. Com 10× mais cobre, a corrente fica ~10× maior e sai **toda** dos mesmos 100 cm² de aço: a taxa vai de 2× para cerca de **11×** a do aço sozinho.',
        },
        {
          kind: 'predict',
          setup: { metA: 3, metB: 5, env: 0, link: 0, aA: 1000, aB: 10 },
          prompt: 'Agora é o contrário: um **rebite de cobre** (10 cm²) numa **chapa de aço** de 1.000 cm². Ao ligar os dois, a corrosão da chapa…',
          change: { link: 1 },
          options: ['Quase não muda (sobe cerca de 1 %)', 'Fica umas 100 vezes mais rápida', 'Cai a zero', 'Passa para o cobre'],
          answer: 0,
          expect: [{ out: 'rA', trend: 'up' }],
          why: 'O catodo pequeno consome pouco O₂ e puxa pouca corrente, que ainda se espalha por uma área grande de aço: a taxa sobe só **1 + 10/1.000 ≈ 1,01** vez. Catodo pequeno com anodo grande é tolerável.',
        },
        {
          kind: 'goal',
          setup: { metA: 5, metB: 3, env: 0, link: 1, aA: 100, aB: 100 },
          lock: ['metB', 'env', 'link', 'aA', 'aB'],
          prompt: 'A placa B é de **aço**. Escolha um metal para a placa A que faça o aço virar o **catodo** e ficar **100 % protegido**.',
          goals: [{ out: 'protB', min: 99.9, label: 'aço 100 % protegido' }],
          hint: 'O anodo é o mais ativo do par: procure um metal abaixo do aço na série galvânica (clique em A na série).',
          solution: { metA: 1 },
          why: 'Zinco (−1,03 V) ou magnésio (−1,60 V), mais ativos que o aço, viram o anodo e o protegem. O alumínio comum (−0,80 V) fica perto demais do aço e protege só em parte — por isso os anodos de alumínio usam ligas com zinco e índio.',
        },
        {
          kind: 'predict',
          setup: { metA: 3, metB: 5, env: 0, link: 1, aA: 100, aB: 100 },
          prompt: 'Tire o **oxigênio dissolvido** da água do mar. A corrosão do aço…',
          change: { env: 2 },
          options: ['Cai muito: sem O₂ quase não há reação catódica', 'Aumenta: a água sem O₂ fica mais agressiva', 'Não muda: quem corrói é o metal, não o O₂', 'Para no aço, mas o cobre passa a corroer'],
          answer: 0,
          expect: [
            { out: 'rA', trend: 'down' },
            { out: 'I', trend: 'down' },
          ],
          why: 'Em meio neutro, o O₂ é o oxidante que consome os elétrons no catodo. Sem ele, a pilha quase não tem como funcionar: a corrosão cai a **~2 %**. É por isso que se **desaera** a água de caldeiras e a água de injeção dos poços.',
        },
        {
          kind: 'predict',
          setup: { metA: 3, metB: 5, env: 0, link: 1, aA: 10, aB: 1000 },
          prompt: 'O rebite de aço (10 cm²) na chapa de cobre (1.000 cm²) sai da água do mar e vai para a **água doce**. A corrente da pilha…',
          change: { env: 1 },
          options: ['Cai muito: a água doce conduz bem menos que a água do mar', 'Sobe: a água doce tem mais oxigênio', 'Não muda: o par de metais é o mesmo', 'Inverte: o cobre vira o anodo'],
          answer: 0,
          expect: [
            { out: 'I', trend: 'down' },
            { out: 'rA', trend: 'down' },
          ],
          why: 'A água doce tem resistividade centenas de vezes maior: a queda ôhmica entre as placas limita a corrente. A corrosão galvânica é muito mais séria em água do mar — na água doce ela fica concentrada perto da junção.',
        },
        {
          kind: 'predict',
          setup: { metA: 1, metB: 5, env: 3, link: 1, aA: 100, aB: 100 },
          prompt: 'Zinco e cobre ligados num **ácido sem oxigênio**. Onde aparecem as bolhas e qual metal se dissolve?',
          options: ['Bolhas de H₂ no cobre; o zinco se dissolve', 'Bolhas de H₂ no zinco; o cobre se dissolve', 'Bolhas de O₂ no cobre; o zinco se dissolve', 'Não há bolhas: o ácido não reage com metais'],
          answer: 0,
          why: 'O zinco (anodo) se oxida: Zn → Zn²⁺ + 2e⁻. Os elétrons vão ao cobre (catodo), onde **2H⁺ + 2e⁻ → H₂**: as bolhas saem do **cobre**, mas quem perde massa é o zinco.',
        },
        {
          kind: 'predict',
          setup: { metA: 5, metB: 5, env: 0, link: 0, aA: 100, aB: 100 },
          prompt: 'Placas de **cobre**, sozinhas, saem da água do mar e vão para um **ácido sem oxigênio** (pH 2). A corrosão delas…',
          change: { env: 3 },
          options: ['Para: o cobre é mais nobre que o hidrogênio e não há O₂', 'Aumenta muito: ácido corrói qualquer metal', 'Não muda', 'Aumenta, com bolhas de H₂ no cobre'],
          answer: 0,
          expect: [{ out: 'rA', trend: 'down' }],
          why: 'Para corroer, o metal precisa de um oxidante com potencial acima do dele. O cobre (+0,34 V na tabela padrão) é mais nobre que o H⁺/H₂ (0 V): sem O₂, o ácido não tem como oxidá-lo. Na série da bancada, a linha do H⁺ fica abaixo do cobre.',
        },
        {
          kind: 'goal',
          setup: { metA: 3, metB: 5, env: 0, link: 1, aA: 100, aB: 100 },
          lock: ['metA', 'metB', 'env', 'link', 'aA'],
          prompt: 'Mudando só a **área do cobre**, faça o aço (100 cm²) corroer **6 vezes** mais rápido que sozinho.',
          goals: [{ out: 'kAn', min: 5.95, max: 6.05, label: '6× a taxa sozinho' }],
          hint: 'No limite do O₂, o anodo de aço corrói (1 + A_{catodo}/A_{anodo}) vezes mais.',
          solution: { aB: 500 },
          why: '1 + A_{c}/A_{a} = 6 → A_{c} = 5 × 100 = **500 cm²**. A corrente que o O₂ puxa da área do cobre soma-se à da própria área do aço, e tudo sai dos mesmos 100 cm².',
        },
      ],
    },
  ],
});
