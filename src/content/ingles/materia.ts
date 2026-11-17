import { defineSubject } from '../../learning/types';

export default defineSubject({
  id: 'ingles',
  name: 'Língua Inglesa',
  short: 'Inglês',
  color: '#e8a91e',
  icon: '⚓',
  mentorId: 'harris',
  place: 'Porto',
  description: 'Leitura de textos técnicos e jornalísticos. 10 questões dos Conhecimentos Básicos — zerar elimina.',
  order: 2,
  field: 'horta',
  // Conteúdo programático (nível superior) do Edital PSP RH 2018.1 — Cesgranrio
  exam: {
    part: 'basicos',
    questions: 10,
    items: [
      { id: 'en.compreensao', text: 'Compreensão de texto escrito em língua inglesa' },
      { id: 'en.gramatica', text: 'Itens gramaticais relevantes para a compreensão dos conteúdos semânticos' },
    ],
  },
});
