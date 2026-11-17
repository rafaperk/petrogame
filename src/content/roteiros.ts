/**
 * Roteiros de FORMATO: o jeito de atacar cada formato de questão da prova, valendo para todas as matérias.
 * As questões apontam para eles com `roteiro: 'fmt.…'` e escrevem só o que é revelado em cada passo.
 * Roteiros de conteúdo (ex.: "Bernoulli numa mudança de seção") ficam no próprio tópico, em `roteiros`.
 */
import type { Roteiro } from '../learning/types';

export const FORMAT_ROTEIROS: Roteiro[] = [
  {
    id: 'fmt.conceito',
    name: 'Questão conceitual',
    when: 'O enunciado termina em vírgula ou lacuna, ou pergunta qual definição, causa ou efeito vale. É o formato de cerca de **2/3** das questões da Cesgranrio.',
    steps: [
      'Ache a palavra que decide: o conceito, a grandeza ou a condição que o enunciado cobra.',
      'Antes de ler as alternativas, lembre a regra ou a definição e preveja a resposta.',
      'Compare e elimine: fica a alternativa que bate com a regra inteira.',
    ],
    note: 'As erradas da Cesgranrio costumam ser **trocas**: aumenta ↔ diminui, causa ↔ efeito, um nome parecido, a regra certa aplicada no lugar errado. Procure a troca.',
  },
  {
    id: 'fmt.ce',
    name: 'Certo ou Errado',
    when: 'Uma afirmação para julgar inteira. Não é o formato da Cesgranrio, mas treina a regra exata.',
    steps: [
      'Ache o termo que decide a frase: o efeito (aumenta, reduz), o quantificador (sempre, somente, nunca) ou o nome técnico.',
      'Lembre a regra certa sobre esse termo.',
      'Julgue: a frase só está certa se **todas** as partes batem com a regra.',
    ],
    note: 'Uma palavra fora do lugar derruba a frase inteira. Desconfie de "sempre", "somente", "nunca" e de causa e efeito trocados.',
  },
  {
    id: 'fmt.afirmativas',
    name: 'Afirmativas I, II e III',
    when: '"É correto o que se afirma em" e alternativas como "I, apenas" ou "I e III, apenas".',
    steps: [
      'Julgue a afirmativa I sozinha.',
      'Julgue a afirmativa II.',
      'Julgue a afirmativa III.',
      'Combine: marque a alternativa que traz exatamente as afirmativas certas.',
    ],
    note: 'Comece pela afirmativa de que você tem **mais certeza** e risque as alternativas incompatíveis com ela: muitas vezes a resposta aparece antes de julgar todas.',
  },
  {
    id: 'fmt.exceto',
    name: 'EXCETO, INCORRETA ou NÃO',
    when: 'O enunciado pede a única alternativa que **não** vale: EXCETO, INCORRETA, NÃO se constata...',
    steps: [
      'Marque a negação e lembre: você procura a alternativa **falsa**.',
      'Teste as alternativas contra a regra: as verdadeiras saem.',
      'Confirme a que sobrou: ela contraria a regra em quê?',
    ],
    note: 'O erro clássico é marcar a primeira afirmação verdadeira, esquecendo o EXCETO. Escreva V ou F ao lado de cada alternativa.',
  },
  {
    id: 'fmt.associacao',
    name: 'Associação de colunas',
    when: 'Duas listas para ligar (I – P, II – Q...) e alternativas com as sequências.',
    steps: [
      'Ligue primeiro o par de que você tem certeza.',
      'Risque as alternativas sem esse par e ligue o próximo par mais fácil.',
      'Confira os pares que sobraram e marque a sequência.',
    ],
    note: 'Quase nunca é preciso ligar tudo: dois pares certos costumam deixar uma alternativa só.',
  },
  {
    id: 'fmt.porque',
    name: 'Asserção e razão (PORQUE)',
    when: 'Duas afirmações ligadas por PORQUE; as alternativas dizem se cada uma é verdadeira e se a segunda justifica a primeira.',
    steps: [
      'Julgue a primeira afirmação sozinha.',
      'Julgue a segunda afirmação sozinha.',
      'Se as duas forem verdadeiras, pergunte: a segunda **explica** a primeira?',
    ],
    note: 'Duas verdades sem relação de causa são o distrator mais comum: "as duas são verdadeiras, mas a segunda não justifica a primeira".',
  },
];
