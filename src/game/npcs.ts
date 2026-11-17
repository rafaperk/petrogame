/**
 * Personagens da vila. Mentores ensinam uma matéria (subjectId); os demais dão dicas de estudo.
 * Use {nome} nas falas para inserir o nome do jogador.
 */
import type { CharacterLook } from '../art/characters';
import { HAIR, SKIN } from '../art/palette';

export type NpcRole = 'mentor' | 'guide' | 'villager' | 'shopkeeper';

export interface NpcDef {
  id: string;
  name: string;
  title: string;
  role: NpcRole;
  subjectId?: string;
  look: CharacterLook;
  /** Primeira conversa. */
  intro?: string[];
  /** Falas soltas (sorteadas). */
  lines: string[];
}

export const PLAYER_LOOK: CharacterLook = {
  skin: SKIN[1],
  hair: HAIR.chestnut,
  hairStyle: 'short',
  shirt: '#2f7fb5',
  pants: '#35405a',
  shoes: '#4a3428',
};

export const NPCS: NpcDef[] = [
  {
    id: 'joaquim',
    name: 'Seu Joaquim',
    title: 'Petroleiro aposentado',
    role: 'guide',
    look: { skin: SKIN[2], hair: HAIR.white, hairStyle: 'bald', beard: HAIR.white, shirt: '#3f6fa8', pants: '#4a4a55' },
    intro: [
      'Ora, ora! Você deve ser **{nome}**, quem chegou para o programa de trainees. Boas-vindas à **Vila Maré**!',
      'Passei trinta anos embarcado em plataforma. Sabe o que aprendi? Para chegar ao **pré-sal**, a gente perfura camada por camada. Sem pular etapas.',
      'Com o estudo é igual. Cada tópico que você domina deixa o seu poço mais fundo — repare na **profundidade** no canto da tela.',
      'Aqui na vila ficam os **Conhecimentos Básicos**: a **Profª Lúcia** ensina Português na Biblioteca, ao norte, e o **Capitão Harris**, Inglês, lá no porto.',
      'Os **Conhecimentos Específicos** de Engenharia Mecânica — 50 das 70 questões, e o que decide a sua classificação — ficam na **Refinaria Escola**, no fim da estrada a leste.',
      'E tem a sua **Horta do Saber**, ao lado da sua casa: Português e Inglês viram plantas lá. Quando uma planta **murchar**, é hora de revisar. Na Refinaria é igual, só que com equipamentos.',
      'Conselho de velho: revisar um pouco **todo dia** rende mais do que virar a noite uma vez só. Agora vá — a Profª Lúcia está esperando!',
    ],
    lines: [
      'Não releia só: tente **lembrar** antes de olhar a resposta. É o esforço de lembrar que fixa a memória.',
      'Errou? Ótimo. Leia a explicação com calma — o erro bem analisado ensina mais do que o acerto no chute.',
      'Misture as matérias nos treinos. Na prova elas vêm todas misturadas!',
      'Planta murcha não é fracasso: é a curva do esquecimento agindo. Uma regada e ela volta mais forte.',
      'Estude em blocos curtos, com pausas. Cérebro cansado não perfura rocha.',
      'Leia o comando da questão duas vezes: "correta", "incorreta", "exceto"... A banca adora inverter o pedido.',
      'O quadro de missões aqui na praça muda todo dia. Dá uma olhada!',
    ],
  },
  {
    id: 'lucia',
    name: 'Profª Lúcia',
    title: 'Mentora de Língua Portuguesa',
    role: 'mentor',
    subjectId: 'portugues',
    look: { skin: SKIN[1], hair: HAIR.brown, hairStyle: 'bun', glasses: true, shirt: '#8e4a7a', pants: '#3a3550' },
    intro: [
      'Olá, {nome}! Eu sou a Lúcia e cuido da Biblioteca.',
      'Português cai em **todos** os cargos da Petrobras — e costuma decidir a nota de corte. A banca não perdoa crase nem concordância!',
      'Comigo funciona assim: primeiro eu **explico**, depois você **pratica** com correção comentada. Quando estiver firme, eu te **desafio** com questões no nível da prova.',
    ],
    lines: ['Que bom te ver de novo, {nome}!', 'Uma vírgula fora do lugar muda tudo... vamos estudar?', 'Leitura atenta é metade da prova de Português.'],
  },
  {
    id: 'otavio',
    name: 'Engº Otávio',
    title: 'Mentor do Bloco 1 · Fundamentos',
    role: 'mentor',
    subjectId: 'bloco1',
    look: { skin: SKIN[3], hair: HAIR.black, hairStyle: 'short', hat: 'hardhat', hatColor: '#f4f4f0', vest: '#f08a24', shirt: '#2f6f5f', pants: '#5a4a3a' },
    intro: [
      'E aí, {nome}! Otávio, do Laboratório de Fundamentos.',
      'O **Bloco 1** tem **20 questões** — o maior da prova — e ainda desempata a classificação. Termodinâmica, Mecânica dos Fluidos, Resistência dos Materiais e Dinâmica: a base de todo o resto.',
      'A Cesgranrio adora conta de mão: números redondos, sem calculadora. Por isso, nas **ordens de serviço** os valores mudam toda vez — você treina o método até ele virar automático.',
    ],
    lines: ['Bora calcular, {nome}?', 'Lápis na mão!', 'Primeiro o raciocínio; a fórmula vem de brinde.', 'Confere as unidades antes de fazer a conta. Metade dos erros mora aí.'],
  },
  {
    id: 'harris',
    name: 'Capitão Harris',
    title: 'Mentor de Língua Inglesa',
    role: 'mentor',
    subjectId: 'ingles',
    look: { skin: SKIN[0], hair: HAIR.red, hairStyle: 'short', beard: HAIR.red, hat: 'captain', shirt: '#26354f', pants: '#26354f' },
    intro: [
      'Ahoy, {nome}! Captain Harris here — mas pode me chamar só de Harris.',
      'Na prova de inglês, o segredo é ler o texto técnico sem travar. Muita palavra parece português... e algumas são **armadilhas**!',
      "Let's sail? Primeiro a lição, depois a prática.",
    ],
    lines: ['Welcome aboard, {nome}!', 'Ready to read some English?', 'Fair winds! Vamos estudar?'],
  },
  {
    id: 'beatriz',
    name: 'Engª Beatriz',
    title: 'Mentora do Bloco 2 · Máquinas',
    role: 'mentor',
    subjectId: 'bloco2',
    look: { skin: SKIN[4], hair: HAIR.black, hairStyle: 'ponytail', hat: 'hardhat', hatColor: '#f4f4f0', vest: '#f08a24', shirt: '#3f6fa8', pants: '#2e3440' },
    intro: [
      'Oi, {nome}! Beatriz, da Casa de Máquinas. Boas-vindas à área mais barulhenta da refinaria!',
      'O **Bloco 2** tem **15 questões**: metalurgia e tratamentos térmicos, vibrações, bombas, compressores, turbinas e os ciclos de potência e refrigeração.',
      'Aqui a pegadinha é conceito parecido: recozimento × normalização, NPSH disponível × requerido... Os jogos da **Esteira** foram feitos para separar essas coisas na sua cabeça.',
    ],
    lines: ['Ouviu esse barulho de cascalho na bomba? Cavitação!', 'Bora pôr mais um equipamento para rodar, {nome}?', 'Máquina boa é máquina com manutenção em dia — memória também.'],
  },
  {
    id: 'dandara',
    name: 'Mestra Dandara',
    title: 'Mentora do Bloco 3 · Manutenção',
    role: 'mentor',
    subjectId: 'bloco3',
    look: { skin: SKIN[3], hair: HAIR.black, hairStyle: 'bun', hat: 'hardhat', hatColor: '#f2c94c', glasses: true, shirt: '#8a4f2a', pants: '#2e3440' },
    intro: [
      'Salve, {nome}! Dandara, inspetora de soldagem e chefe da Oficina de Manutenção.',
      'O **Bloco 3** tem **15 questões** e é o mais variado: transmissão de calor, motores, corrosão, seleção de materiais, soldagem, instrumentação, fabricação, estatística e eletrotécnica.',
      'Muita coisa aqui é procedimento e classificação — qual processo, qual instrumento, qual trinca. Treine com os **Procedimentos** e a **Esteira** que a prova fica com cara de rotina.',
    ],
    lines: ['Solda boa começa no preaquecimento, {nome}.', 'Instrumento sem calibração é palpite com ponteiro.', 'Vamos pôr a mão na massa?'],
  },
  {
    id: 'ze',
    name: 'Seu Zé',
    title: 'Vigia da Refinaria',
    role: 'villager',
    look: { skin: SKIN[2], hair: HAIR.grey, hairStyle: 'short', hat: 'cap', hatColor: '#2f4f8f', shirt: '#4a5a7a', pants: '#2e3440', shoes: '#2b2b30' },
    intro: [
      'Opa! Crachá de trainee? Pode passar, {nome}. Aqui na **Refinaria Escola** ficam os Conhecimentos Específicos.',
      'Regra da casa: equipamento cinza está **parado** — estude o tópico para colocar para rodar. A lâmpada mostra como ele está, e a **chave inglesa** 🔧 é sinal de manutenção: hora de revisar.',
      'Cada bloco tem a sua unidade e o seu mentor. E as **bases vazias** são para os próximos tópicos que chegarem.',
    ],
    lines: [
      'Segurança em primeiro lugar — e revisão em segundo!',
      'Já deu uma olhada nas placas das unidades? Elas mostram quantos equipamentos estão rodando.',
      'Trinta anos de portaria e nunca vi alguém passar sem estudar um pouco todo dia.',
      'O Bloco 1 vale 20 questões, viu? É o que mais pesa.',
    ],
  },
  {
    id: 'tonho',
    name: 'Seu Tonho',
    title: 'Pescador',
    role: 'villager',
    look: { skin: SKIN[2], hair: HAIR.grey, hairStyle: 'short', hat: 'cap', hatColor: '#e0b84a', shirt: '#c96f3b', pants: '#3d5a80' },
    lines: [
      'Peixe bom a gente pesca com paciência. Conteúdo também: um pouquinho todo dia.',
      'Sabia que o pré-sal fica a mais de 5 mil metros abaixo do nível do mar? Vai fundo, {nome}!',
      'Maré baixa, eu remendo a rede. Planta murcha, você revisa. Cada coisa no seu tempo.',
      'Dizem que quem explica em voz alta aprende em dobro. Me conta o que você estudou hoje!',
    ],
  },
  {
    id: 'cida',
    name: 'Dona Cida',
    title: 'Dona do armazém',
    role: 'shopkeeper',
    look: { skin: SKIN[1], hair: HAIR.grey, hairStyle: 'bun', shirt: '#e07a5f', pants: '#6d597a' },
    intro: [
      'Bom dia, {nome}! Eu sou a Cida, do armazém aqui da praça.',
      'Tenho **cafezinho** (o estudo rende mais), **folga programada** (para a sua ofensiva não zerar num dia corrido) e **EPI**: capacete, colete, óculos, uniforme...',
      'Tudo se paga com as **moedas** que você ganha estudando. E as peças melhores eu só vendo para quem já subiu de cargo!',
    ],
    lines: [
      'Bom dia, {nome}! Já regou sua horta hoje?',
      'Meu neto passou num concurso estudando uma hora por dia. Constância, viu?',
      'Dorme direito! É dormindo que a memória se arruma.',
      'O quadro de missões ali na praça tem tarefas novas todo dia. Concluiu as três? Tem **baú**!',
      'Cafezinho fresquinho: meia hora de estudo rendendo mais.',
    ],
  },
];

export const npcById = new Map(NPCS.map((n) => [n.id, n]));
