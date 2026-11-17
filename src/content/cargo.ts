/**
 * O cargo e a prova de referência. Se você mudar de cargo, ajuste aqui e nas matérias (`exam` em materia.ts).
 *
 * Referência: Edital nº 1 – PETROBRAS/PSP RH 2018.1, de 07/02/2018 (Fundação Cesgranrio) — o último processo
 * seletivo da Petrobras para este cargo organizado pela Cesgranrio. O próximo edital ainda não saiu.
 */
export interface ExamPart {
  id: string;
  name: string;
  questions: number;
  rule: string;
}

export const CARGO = {
  name: 'Engenheiro(a) de Equipamentos Júnior – Mecânica',
  level: 'Nível superior',
  reference: 'Edital nº 1 – PETROBRAS/PSP RH 2018.1 (Fundação Cesgranrio)',
  format: '70 questões de múltipla escolha (A a E), cada uma valendo 1 ponto.',
  parts: [
    {
      id: 'basicos',
      name: 'Conhecimentos Básicos',
      questions: 20,
      rule: 'Eliminatória: é preciso fazer pelo menos 50% dos pontos e não zerar Português nem Inglês. Só conta para desempate.',
    },
    {
      id: 'especificos',
      name: 'Conhecimentos Específicos',
      questions: 50,
      rule: 'Eliminatória e classificatória: mínimo de 50%. A classificação usa apenas esta parte; nos desempates, a nota do Bloco 1 vem logo depois do critério de idade.',
    },
  ] as ExamPart[],
};
