import { defineSubject } from '../../learning/types';

/** Conhecimentos Específicos — Bloco 2 (Edital PSP RH 2018.1, Engenheiro(a) de Equipamentos Júnior – Mecânica). */
export default defineSubject({
  id: 'bloco2',
  name: 'Específicos · Bloco 2',
  short: 'Bloco 2',
  color: '#3f7fd6',
  icon: '⚙️',
  mentorId: 'beatriz',
  place: 'Casa de Máquinas',
  description: 'Metalurgia, Vibrações, Máquinas de Fluxo e Ciclos de Potência e Refrigeração (15 questões).',
  order: 4,
  field: 'refinaria',
  equipment: 'compressor',
  exam: {
    part: 'especificos',
    questions: 15,
    items: [
      { id: 'b2.metalurgia', text: 'Metalurgia: estrutura cristalina dos metais e propriedades mecânicas dos materiais' },
      { id: 'b2.ensaios', text: 'Ensaios mecânicos (tração, dureza, impacto e tenacidade)' },
      { id: 'b2.fases', text: 'Transformações de fase, diagramas de equilíbrio e diagrama ferro-carbono' },
      { id: 'b2.tratamentos', text: 'Tratamentos térmicos e termoquímicos; mecanismos de aumento da resistência mecânica' },
      { id: 'b2.vibracoes', text: 'Vibrações: sistemas com 1 e 2 graus de liberdade (livre, forçada periódica, transiente; frequências e modos naturais)' },
      { id: 'b2.giroscopicos', text: 'Sistemas giroscópicos; autovalores e autovetores na formulação de estado' },
      { id: 'b2.bombas', text: 'Máquinas de fluxo: bombas centrífugas' },
      { id: 'b2.compressores', text: 'Compressores alternativos, centrífugos e axiais' },
      { id: 'b2.turbinas', text: 'Turbinas a vapor e a gás' },
      { id: 'b2.maquinas-desempenho', text: 'Aspectos termodinâmicos, condições de serviço, desempenho e potência das máquinas de fluxo' },
      { id: 'b2.rankine-brayton', text: 'Ciclos de Rankine e Brayton: balanço energético, eficiência, perdas e equipamentos auxiliares' },
      { id: 'b2.refrigeracao', text: 'Refrigeração industrial: compressão de vapor e absorção de amônia (coeficiente de eficácia)' },
      { id: 'b2.cogeracao', text: 'Ciclos combinados e cogeração' },
    ],
  },
});
