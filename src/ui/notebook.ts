/** Caderno: painel de estudo com matérias, tópicos, maestria, revisões e estatísticas. */
import { sfx } from '../core/audio';
import { state } from '../core/state';
import { dayKey, formatDuration, formatUntil } from '../core/time';
import { CARGO } from '../content/cargo';
import { content, formatRoteiros, roteiroQuestions } from '../learning/content';
import { depthLayer, depthMeters, dueCount, examCoverage, missingRequirements, nextDueDate, plantStage, stageEmoji, stageName, subjectMastery, topicMastery, topicStatus } from '../learning/mastery';
import { planRoteiro, type SessionPlan } from '../learning/session';
import type { Question, Roteiro, Topic } from '../learning/types';
import { bar, h, md, pct } from './dom';
import { showLesson } from './lesson';
import { renderAchievements } from './shop';
import { isCancelKey, ui } from './UI';

type Tab = 'materias' | 'dicas' | 'roteiros' | 'edital' | 'conquistas' | 'stats' | 'ajuda';
const TAB_ORDER: Tab[] = ['materias', 'dicas', 'roteiros', 'edital', 'conquistas', 'stats', 'ajuda'];
type TipKind = 'hot' | 'tip' | 'trap';
const TIP_KINDS: [TipKind, string][] = [
  ['hot', '🔥 Sempre cai'],
  ['tip', '💡 Macetes'],
  ['trap', '⚠️ Pegadinhas'],
];

export interface NotebookActions {
  reviewAll: () => Promise<void>;
  reviewTopic: (topic: Topic) => Promise<void>;
  /** Roda uma sessão de questões (treino por roteiro). */
  practice: (plan: SessionPlan) => Promise<void>;
}

export function openNotebook(actions: NotebookActions, initial: Tab = 'materias'): Promise<void> {
  return new Promise((resolve) => {
    let tab: Tab = initial;
    let busy = false;
    const tabs = h('nav', { class: 'tabs' });
    const body = h('div', { class: 'notebook-body' });
    const close = h('button', { class: 'btn-close', title: 'Fechar (Esc)', text: '✕', on: { click: () => done() } });
    const panel = h('div', { class: 'panel modal notebook' }, [
      h('header', { class: 'modal-head' }, [h('h2', { text: '📒 Caderno de Estudos' }), tabs, close]),
      body,
    ]);
    const wrap = h('div', { class: 'layer layer-modal' }, [panel]);

    const act = async (fn: () => Promise<void>) => {
      if (busy) return;
      busy = true;
      wrap.classList.add('hidden');
      await fn();
      wrap.classList.remove('hidden');
      busy = false;
      render();
    };

    const renderTabs = () => {
      tabs.innerHTML = '';
      const items: [Tab, string][] = [
        ['materias', 'Matérias'],
        ['dicas', 'Revisão rápida'],
        ['roteiros', 'Roteiros'],
        ['edital', 'Edital'],
        ['conquistas', 'Conquistas'],
        ['stats', 'Estatísticas'],
        ['ajuda', 'Como funciona'],
      ];
      for (const [id, label] of items) {
        tabs.append(h('button', { class: `tab${tab === id ? ' active' : ''}`, text: label, on: { click: () => ((tab = id), sfx.page(), render()) } }));
      }
    };

    const renderSubjects = () => {
      const allDue = content.subjects.reduce((s, sub) => s + sub.topics.reduce((a, t) => a + (state.isTopicLearned(t.id) ? dueCount(t) : 0), 0), 0);
      body.append(
        h('div', { class: 'nb-summary' }, [
          h('div', {}, [h('strong', { text: allDue ? `💧 ${allDue} ${allDue > 1 ? 'itens' : 'item'} para revisar` : '🌤️ Nenhuma revisão pendente' }), h('small', { text: ' — revisar na hora certa é o que mais fixa conteúdo.' })]),
          allDue ? h('button', { class: 'btn primary', text: 'Revisar agora', on: { click: () => void act(actions.reviewAll) } }) : null,
        ]),
      );
      for (const subject of content.subjects) {
        const m = subjectMastery(subject.id);
        const section = h('section', { class: 'nb-subject', style: `--accent:${subject.color}` }, [
          h('div', { class: 'nb-subject-head' }, [
            h('span', { class: 'nb-icon', text: subject.icon }),
            h('div', { class: 'nb-subject-title' }, [h('h3', { text: subject.name }), h('small', { text: `${subject.place} · ${subject.description}` })]),
            h('div', { class: 'nb-subject-mastery' }, [bar(m, 'accent'), h('small', { text: `${pct(m)} de maestria` })]),
          ]),
        ]);
        const list = h('div', { class: 'nb-topics' });
        if (!subject.topics.length) list.append(h('p', { class: 'muted', text: 'Conteúdo em preparação.' }));
        for (const topic of subject.topics) list.append(topicRow(topic));
        section.append(list);
        body.append(section);
      }
    };

    const topicRow = (topic: Topic): HTMLElement => {
      const status = topicStatus(topic);
      const m = topicMastery(topic);
      const due = status === 'learned' ? dueCount(topic) : 0;
      const next = status === 'learned' ? nextDueDate(topic) : null;
      const seen = topic.questions.filter((q) => state.data.qstats[q.id]?.seen);
      const answered = seen.reduce((s, q) => s + state.data.qstats[q.id].seen, 0);
      const correct = seen.reduce((s, q) => s + state.data.qstats[q.id].correct, 0);
      let statusText = '';
      if (status === 'locked') statusText = `🔒 Requer ${missingRequirements(topic).map((t) => t.name).join(', ')}`;
      else if (status === 'available') statusText = '✨ Disponível com o mentor';
      else statusText = `${stageEmoji(topic, plantStage(m))} ${stageName(topic, plantStage(m))}${due ? ` · 💧 ${due} para revisar` : next ? ` · próxima revisão ${formatUntil(next)}` : ''}`;
      return h('div', { class: `nb-topic ${status}` }, [
        h('div', { class: 'nb-topic-main' }, [
          h('b', { text: topic.name }),
          h('small', { text: statusText }),
          h('small', { class: 'muted', text: `${topic.questions.length} questões${topic.games.length ? ` · ${topic.games.length} ${topic.games.length > 1 ? 'jogos' : 'jogo'}` : ''}${answered ? ` · ${pct(correct / answered)} de acerto (${answered} respostas)` : ''}` }),
        ]),
        h('div', { class: 'nb-topic-bar' }, [bar(m, 'accent'), h('small', { text: pct(m) })]),
        h('div', { class: 'nb-topic-actions' }, [
          status === 'learned' ? h('button', { class: 'btn small ghost', text: '📖 Lição', on: { click: () => void act(async () => void (await showLesson(topic, { finishLabel: 'Fechar' }))) } }) : null,
          due ? h('button', { class: 'btn small primary', text: `💧 Revisar ${due}`, on: { click: () => void act(() => actions.reviewTopic(topic)) } }) : null,
        ]),
      ]);
    };

    /** Revisão rápida: os "sempre cai", macetes e pegadinhas de todas as lições, para ler na véspera. */
    let tipKind: TipKind = 'hot';
    let tipAll = false;
    const renderTips = () => {
      const filters = h(
        'div',
        { class: 'tips-filters' },
        TIP_KINDS.map(([kind, label]) =>
          h('button', { class: `btn small${tipKind === kind ? ' primary' : ' ghost'}`, text: label, on: { click: () => ((tipKind = kind), sfx.page(), render()) } }),
        ),
      );
      const all = h('input', { type: 'checkbox' }) as HTMLInputElement;
      all.checked = tipAll;
      all.addEventListener('change', () => ((tipAll = all.checked), render()));
      body.append(
        h('div', { class: 'nb-summary tips-head' }, [
          h('div', {}, [
            h('strong', { text: '⚡ Revisão rápida' }),
            h('small', { text: ' — o essencial de cada lição em poucas linhas. Clique no título para abrir o card.' }),
          ]),
          filters,
          h('label', { class: 'tips-all small' }, [all, h('span', { text: ' incluir tópicos ainda não estudados' })]),
        ]),
      );
      let shown = 0;
      for (const subject of content.subjects) {
        const blocks: HTMLElement[] = [];
        for (const topic of subject.topics) {
          if (!tipAll && !state.isTopicLearned(topic.id)) continue;
          const cards = topic.lesson.map((card, index) => ({ card, index })).filter(({ card }) => card[tipKind]);
          if (!cards.length) continue;
          shown += cards.length;
          blocks.push(
            h('div', { class: 'tips-topic' }, [
              h('h4', { text: topic.name }),
              h(
                'ul',
                { class: `tips-list ${tipKind}` },
                cards.map(({ card, index }) =>
                  h('li', {}, [
                    h('button', {
                      class: 'link tips-card',
                      text: card.title,
                      title: 'Abrir este card da lição',
                      on: { click: () => void act(async () => void (await showLesson(topic, { startAt: index, finishLabel: 'Fechar' }))) },
                    }),
                    h('div', { class: 'md', html: md(card[tipKind] ?? '') }),
                  ]),
                ),
              ),
            ]),
          );
        }
        if (!blocks.length) continue;
        body.append(
          h('section', { class: 'nb-subject tips-subject', style: `--accent:${subject.color}` }, [
            h('div', { class: 'nb-subject-head' }, [h('span', { class: 'nb-icon', text: subject.icon }), h('div', { class: 'nb-subject-title' }, [h('h3', { text: subject.name })])]),
            ...blocks,
          ]),
        );
      }
      if (!shown) {
        body.append(
          h('p', {
            class: 'muted',
            text: tipAll ? 'Nenhum item deste tipo ainda.' : 'Estude um tópico com um mentor e os macetes, pegadinhas e "sempre cai" dele aparecem aqui.',
          }),
        );
      }
    };

    /** Roteiros: o passo a passo de cada tipo de questão, com treino só daquele tipo. */
    let rtAll = false;
    const roteiroCard = (r: Roteiro, items: { question: Question; topic: Topic }[], learnedItems: { question: Question; topic: Topic }[]): HTMLElement => {
      const plan = learnedItems.length ? planRoteiro(r.name, learnedItems) : null;
      return h('article', { class: 'rt-card' }, [
        h('div', { class: 'rt-head' }, [
          h('b', { text: r.name }),
          h('small', { class: 'muted', text: `${items.length} ${items.length === 1 ? 'questão' : 'questões'}` }),
          plan
            ? h('button', { class: 'btn small primary', title: 'Questões só deste tipo (as de cálculo mudam os números)', text: '▶ Treinar', on: { click: () => void act(() => actions.practice(plan)) } })
            : h('small', { class: 'muted', text: '🔒 estude o tópico' }),
        ]),
        h('div', { class: 'rt-when md', html: md(`🔎 **Como reconhecer:** ${r.when}`) }),
        h('ol', { class: 'rt-steps' }, r.steps.map((step) => h('li', { html: md(step).replace(/^<p>|<\/p>$/g, '') }))),
        r.note ? h('div', { class: 'rt-note md', html: md(`📌 **Para as próximas:** ${r.note}`) }) : null,
      ]);
    };

    const renderRoteiros = () => {
      const all = h('input', { type: 'checkbox' }) as HTMLInputElement;
      all.checked = rtAll;
      all.addEventListener('change', () => ((rtAll = all.checked), render()));
      body.append(
        h('div', { class: 'nb-summary tips-head' }, [
          h('div', {}, [
            h('strong', { text: '🧭 Roteiros de resolução' }),
            h('small', { text: ' — o passo a passo de cada tipo de questão. A prova repete os tipos; mudam os números e o contexto. Nas questões, abra um passo por vez (tecla P).' }),
          ]),
          h('label', { class: 'tips-all small' }, [all, h('span', { text: ' incluir tópicos ainda não estudados' })]),
        ]),
      );
      const topics = content.subjects.flatMap((s) => s.topics);
      const learned = topics.filter((t) => state.isTopicLearned(t.id));
      const visible = rtAll ? topics : learned;

      const formats = formatRoteiros
        .map((r) => ({ r, items: roteiroQuestions(r.id, visible), learnedItems: roteiroQuestions(r.id, learned) }))
        .filter((f) => f.items.length);
      if (formats.length) {
        body.append(
          h('section', { class: 'nb-subject rt-subject', style: '--accent:#2f6fb0' }, [
            h('div', { class: 'nb-subject-head' }, [
              h('span', { class: 'nb-icon', text: '📝' }),
              h('div', { class: 'nb-subject-title' }, [h('h3', { text: 'Formatos da prova' }), h('small', { text: 'Valem para todas as matérias: como atacar cada formato da Cesgranrio.' })]),
            ]),
            h('div', { class: 'rt-grid' }, formats.map((f) => roteiroCard(f.r, f.items, f.learnedItems))),
          ]),
        );
      }

      let shown = 0;
      for (const subject of content.subjects) {
        const blocks: HTMLElement[] = [];
        for (const topic of subject.topics) {
          if (!visible.includes(topic) || !topic.roteiros.length) continue;
          const isLearned = learned.includes(topic);
          shown += topic.roteiros.length;
          blocks.push(
            h('div', { class: 'tips-topic' }, [
              h('h4', { text: topic.name }),
              h(
                'div',
                { class: 'rt-grid' },
                topic.roteiros.map((r) => {
                  const items = roteiroQuestions(r.id, [topic]);
                  return roteiroCard(r, items, isLearned ? items : []);
                }),
              ),
            ]),
          );
        }
        if (!blocks.length) continue;
        body.append(
          h('section', { class: 'nb-subject tips-subject', style: `--accent:${subject.color}` }, [
            h('div', { class: 'nb-subject-head' }, [h('span', { class: 'nb-icon', text: subject.icon }), h('div', { class: 'nb-subject-title' }, [h('h3', { text: subject.name })])]),
            ...blocks,
          ]),
        );
      }
      if (!shown && !formats.length) {
        body.append(
          h('p', {
            class: 'muted',
            text: rtAll ? 'Nenhum roteiro cadastrado ainda.' : 'Estude um tópico com um mentor e os roteiros das questões dele aparecem aqui.',
          }),
        );
      }
    };

    const renderEdital = () => {
      body.append(
        h('div', { class: 'nb-summary edital-head' }, [
          h('div', {}, [h('strong', { text: `🎯 ${CARGO.name}` }), h('small', { text: ` — ${CARGO.level}. Referência: ${CARGO.reference}. ${CARGO.format}` })]),
        ]),
      );
      for (const part of CARGO.parts) {
        const subjects = content.subjects.filter((s) => s.exam?.part === part.id);
        const section = h('section', { class: 'edital-part' }, [h('h3', { text: `${part.name} · ${part.questions} questões` }), h('p', { class: 'muted small', text: part.rule })]);
        for (const subject of subjects) {
          const coverage = examCoverage(subject.id);
          const covered = coverage.filter((c) => c.topics.length).length;
          const avg = coverage.length ? coverage.reduce((sum, c) => sum + c.mastery, 0) / coverage.length : 0;
          const block = h('div', { class: 'edital-subject', style: `--accent:${subject.color}` }, [
            h('div', { class: 'nb-subject-head' }, [
              h('span', { class: 'nb-icon', text: subject.icon }),
              h('div', { class: 'nb-subject-title' }, [
                h('h3', { text: `${subject.name} — ${subject.exam!.questions} questões` }),
                h('small', { text: `${covered} de ${coverage.length} itens do edital já têm conteúdo no jogo` }),
              ]),
              h('div', { class: 'nb-subject-mastery' }, [bar(avg, 'accent'), h('small', { text: `${pct(avg)} do edital dominado` })]),
            ]),
          ]);
          const list = h('ul', { class: 'edital-items' });
          for (const item of coverage) {
            const learned = item.topics.some((t) => state.isTopicLearned(t.id));
            const icon = !item.topics.length ? '⬜' : item.mastery >= 0.6 ? '✅' : learned ? '🟡' : '📘';
            list.append(
              h('li', { class: item.topics.length ? 'has-content' : 'no-content' }, [
                h('span', { class: 'edital-icon', text: icon }),
                h('div', { class: 'edital-text' }, [
                  h('span', { text: item.text }),
                  h('small', {
                    class: 'muted',
                    text: item.topics.length ? item.topics.map((t) => `${t.name} (${pct(topicMastery(t))})`).join(' · ') : 'Sem conteúdo ainda — entra com o seu banco de questões.',
                  }),
                ]),
                item.topics.length ? h('div', { class: 'edital-bar' }, [bar(item.mastery, 'accent')]) : null,
              ]),
            );
          }
          block.append(list);
          section.append(block);
        }
        body.append(section);
      }
      body.append(h('p', { class: 'muted small', text: 'Legenda: ⬜ sem conteúdo · 📘 com conteúdo, ainda não estudado · 🟡 em estudo · ✅ maestria de 60% ou mais.' }));
    };

    const renderStats = () => {
      const d = state.data;
      const s = d.stats;
      const meters = depthMeters();
      const days = Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        const key = dayKey(date);
        return { key, label: date.toLocaleDateString('pt-BR', { weekday: 'narrow' }), value: d.stats.byDay[key]?.answered ?? 0 };
      });
      const maxDay = Math.max(5, ...days.map((x) => x.value));
      body.append(
        h('div', { class: 'stats-grid' }, [
          statCard('⛏ Profundidade', `${meters.toLocaleString('pt-BR')} m`, depthLayer(meters)),
          statCard('✅ Questões respondidas', String(s.answered), s.answered ? `${pct(s.correct / s.answered)} de acerto de primeira` : '—'),
          statCard('🔥 Ofensiva', `${state.currentStreak()} dia(s)`, `Recorde: ${d.streak.best}`),
          statCard('⏱ Tempo estudando', formatDuration(s.studyMs), `${s.sessions} sessões`),
          statCard('💧 Revisões', String(s.reviewSessions), 'sessões de rega'),
          statCard('🏆 Desafios vencidos', String(s.challengesPassed), ''),
          statCard('🎮 Minijogos', String(s.gamesPlayed), 'partidas'),
        ]),
        h('h3', { text: 'Últimos 14 dias' }),
        h(
          'div',
          { class: 'day-chart' },
          days.map((x) =>
            h('div', { class: 'day', title: `${x.key}: ${x.value} respostas` }, [
              h('div', { class: 'day-bar', style: `height:${(x.value / maxDay) * 100}%` }),
              h('small', { text: x.label }),
            ]),
          ),
        ),
      );
    };

    const renderHelp = () => {
      body.append(
        h('div', {
          class: 'md help',
          html: md(`### Como o jogo te ensina
- **Aprender:** os mentores explicam cada tópico em cards curtos (com exemplos, macetes e pegadinhas da banca). O quadro **🔥 Sempre cai** diz o que a banca repete e em quais provas caiu.
- **Revisão rápida:** a aba do Caderno que junta os quadros 🔥 Sempre cai, 💡 macetes e ⚠️ pegadinhas de todos os tópicos — boa para a véspera.
- **Praticar:** logo depois, questões com **correção comentada** — inclusive o porquê de cada alternativa errada. As de nível 2 aparecem com 30% de maestria no tópico, e as de nível prova, com 60%.
- **Passo a passo:** toda questão segue um **roteiro** do seu tipo. Travou? Aperte **P** para abrir o próximo passo (só o que fazer), **V** para conferir a conta desse passo e **T** para ver tudo — os passos seguintes ficam escondidos, para você tentar sozinho. Usar ajuda conta como acerto "difícil" na revisão. Errou? O feedback já abre o roteiro no 1º passo.
- **Roteiros:** a aba do Caderno com o passo a passo de cada tipo de questão (como reconhecer, os passos e o "para as próximas"), com **▶ Treinar** só aquele tipo.
- **Revisar:** cada questão tem um "cartão de memória" (algoritmo **FSRS**, o mesmo do Anki). Ele calcula quando você está prestes a esquecer e marca a revisão para esse momento.
- **Intercalar:** os treinos misturam tópicos, como na prova.
- **Desafiar:** desafios com tempo e sem dicas, no nível da prova.

### Horta e Refinaria
Português e Inglês viram **plantas** na Horta do Saber; os Específicos viram **equipamentos** na Refinaria Escola. Eles **crescem** (ou melhoram) com a sua memória de longo prazo e **murcham** (ou pedem manutenção 🔧) quando há revisões vencidas. Regar = revisar.

### Minijogos
- **📦 Esteira:** separe conceitos parecidos antes que o item passe (teclas 1–4 ou setas).
- **🔗 Conexões:** ligue termos às definições (1–9 e A–J).
- **📋 Procedimento:** monte a sequência certa escolhendo o próximo passo (A–L).
- **🧮 Ordem de serviço:** contas com valores sorteados — os números mudam a cada vez.
- **🔬 Bancada:** simulação interativa (bomba centrífuga, Venturi/Bernoulli, trocador de calor, diagrama Fe-C, cilindro com pistão, ciclos Otto/Diesel/Brayton, ciclos a vapor de Rankine e de refrigeração, compressor alternativo, ensaio de tração, viga em flexão, encruamento e recozimento, ensaio de impacto Charpy, motor sobre molas com absorvedor dinâmico, rampa com atrito e rolamento, redutor de engrenagens, pilha de corrosão e proteção catódica, motor de indução e alternador, eixo com mancais e lubrificação, molas e macaco de parafuso). Nas tarefas **🔮 Preveja e observe** você aposta antes de ver; nas **🎯 Missões** mexe nos controles até cumprir a meta. A bancada livre abre pelos cards da lição (tecla **B**) e pelo equipamento.

Cada jogo também entra na revisão espaçada. Eles ficam nos equipamentos, com os mentores e no **Salão de Jogos** da vila.

**Níveis dos jogos:** ★ Treino → ★★ Campo → ★★★ Prova. Acertou de primeira 90% ou mais? O jogo sobe de nível: mais itens e menos tempo na Esteira, mais pares nas Conexões, sem dicas no Procedimento e mais tarefas na Bancada — e mais XP. Abaixo de 50%, ele desce um nível.

### Simulado
No **Centro de Pesquisas** (a leste da praça): simulado rápido (20 questões) ou completo (70, com as 4 h da prova). Mesma divisão por matéria, questões nível prova primeiro, sem dicas e só com os tópicos que você já estudou. No fim, a nota de cada parte e a regra da prova: ≥ 50% nos Básicos sem zerar Português nem Inglês, e ≥ 50% nos Específicos.

### Carreira, missões e Armazém
- O nível vira **cargo** (de Trainee a Consultor(a)), e cada promoção traz presente.
- A **missão principal** guia do primeiro canteiro ao pré-sal; cumprir as três **missões do dia** abre um **baú**.
- **Conquistas** dão moedas e XP (aba Conquistas do Caderno).
- No **Armazém da Dona Cida**: ☕ cafezinho (+50% de XP por 30 min), 🛡️ folga (salva a ofensiva num dia sem estudo) e peças de visual. A **mochila** (tecla **I**) guarda tudo, inclusive as **amostras do poço** (uma a cada 1.000 m).

### Maestria e profundidade
A maestria de um tópico combina a chance de você lembrar **agora** com a estabilidade da memória (quantos dias ela aguenta). Por isso a planta só floresce com revisões espaçadas ao longo de dias — não dá para "maratonar" um tópico em uma noite.

### Controles
- **WASD / setas:** andar · **Shift:** correr
- **E / Espaço / Enter:** interagir
- **C:** caderno · **M:** missões · **I:** mochila · **Esc:** menu
- Nas questões: **1–5** ou **A–E** escolhem, **Enter** responde, **P** abre o próximo passo, **V** confere o passo, **T** mostra tudo, **L** revê a lição.`),
        }),
      );
    };

    const render = () => {
      renderTabs();
      body.innerHTML = '';
      if (tab === 'materias') renderSubjects();
      else if (tab === 'dicas') renderTips();
      else if (tab === 'roteiros') renderRoteiros();
      else if (tab === 'edital') renderEdital();
      else if (tab === 'conquistas') renderAchievements(body);
      else if (tab === 'stats') renderStats();
      else renderHelp();
    };

    const done = () => {
      if (busy) return;
      ui.remove(layer);
      resolve();
    };

    const layer = ui.push(wrap, {
      onKey: (e) => {
        if (busy) return false;
        if (isCancelKey(e) || e.code === 'KeyC') {
          done();
          return true;
        }
        if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
          const i = TAB_ORDER.indexOf(tab) + (e.code === 'ArrowRight' ? 1 : -1);
          tab = TAB_ORDER[(i + TAB_ORDER.length) % TAB_ORDER.length];
          sfx.page();
          render();
          return true;
        }
        return false;
      },
    });
    render();
  });
}

function statCard(label: string, value: string, sub: string): HTMLElement {
  return h('div', { class: 'stat-card' }, [h('small', { text: label }), h('strong', { text: value }), sub ? h('span', { text: sub }) : null]);
}
