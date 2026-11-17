import { defineSubject } from '../../learning/types';

export default defineSubject({
  id: 'portugues',
  name: 'Língua Portuguesa',
  short: 'Português',
  color: '#d9534f',
  icon: '📖',
  mentorId: 'lucia',
  place: 'Biblioteca',
  description: 'Gramática e interpretação. 10 questões dos Conhecimentos Básicos — zerar elimina.',
  order: 1,
  field: 'horta',
  // Conteúdo programático (nível superior) do Edital PSP RH 2018.1 — Cesgranrio
  exam: {
    part: 'basicos',
    questions: 10,
    items: [
      { id: 'pt.interpretacao', text: 'Interpretação textual' },
      { id: 'pt.semantica', text: 'Aspectos semânticos: adequação vocabular, denotação, conotação, polissemia e ambiguidade' },
      { id: 'pt.pontuacao', text: 'Pontuação: vírgula, ponto, ponto e vírgula, dois-pontos, reticências, aspas, travessão e parênteses' },
      { id: 'pt.crase', text: 'Emprego do acento indicativo de crase' },
      { id: 'pt.coesao', text: 'Coesão e coerência: conexão e sequência lógica (coesão referencial, lexical, sequencial e temporal); paralelismo sintático e semântico' },
      { id: 'pt.oracoes', text: 'Coordenação, correlação e subordinação entre orações e termos das orações' },
      { id: 'pt.colocacao', text: 'Colocação pronominal (próclise, mesóclise e ênclise)' },
      { id: 'pt.concordancia', text: 'Concordância verbal e nominal' },
      { id: 'pt.regencia', text: 'Regência verbal' },
    ],
  },
});
