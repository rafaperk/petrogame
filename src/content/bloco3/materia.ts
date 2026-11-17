import { defineSubject } from '../../learning/types';

/** Conhecimentos Específicos — Bloco 3 (Edital PSP RH 2018.1, Engenheiro(a) de Equipamentos Júnior – Mecânica). */
export default defineSubject({
  id: 'bloco3',
  name: 'Específicos · Bloco 3',
  short: 'Bloco 3',
  color: '#8a63d2',
  icon: '🔧',
  mentorId: 'dandara',
  place: 'Oficina de Manutenção',
  description: 'Calor, Motores, Corrosão, Materiais, Soldagem, Instrumentação, Fabricação, Estatística e Eletrotécnica (15 questões).',
  order: 5,
  field: 'refinaria',
  equipment: 'gearbox',
  exam: {
    part: 'especificos',
    questions: 15,
    items: [
      { id: 'b3.calor', text: 'Transmissão de calor: fundamentos e mecanismos (condução, convecção e radiação)' },
      { id: 'b3.trocadores', text: 'Princípios de operação dos trocadores de calor' },
      { id: 'b3.mci', text: 'Motores de combustão interna: ciclos padrão a ar Otto e Diesel; motores de 2 e 4 tempos' },
      { id: 'b3.corrosao', text: 'Corrosão eletroquímica e em temperaturas elevadas; métodos de proteção anticorrosiva' },
      { id: 'b3.selecao', text: 'Seleção de materiais metálicos e não metálicos de uso industrial' },
      { id: 'b3.soldagem-metalurgia', text: 'Metalurgia da soldagem: ciclo térmico, transformações na junta, pré e pós-aquecimento, trincas a frio e a quente, decoesão lamelar' },
      { id: 'b3.soldagem-processos', text: 'Processos de soldagem: eletrodo revestido, TIG, MIG, MAG e arco submerso; oxicorte' },
      { id: 'b3.instrumentacao', text: 'Instrumentação: medição de pressão, temperatura, nível e vazão; simbologia' },
      { id: 'b3.controle', text: 'Controle de processos industriais: pressão, temperatura, nível e vazão' },
      { id: 'b3.fabricacao', text: 'Tecnologia de fabricação: fundição, conformação e usinagem; tratamento térmico e superficial' },
      { id: 'b3.estatistica', text: 'Noções de estatística e probabilidade com aplicações em engenharia' },
      { id: 'b3.eletrotecnica', text: 'Eletrotécnica: princípios de geradores e motores elétricos' },
    ],
  },
});
