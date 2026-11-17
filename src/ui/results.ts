/** Resumo do fim da sessão: acertos, XP, e como cada planta (tópico) mudou. */
import { sfx } from '../core/audio';
import { formatDuration } from '../core/time';
import { content } from '../learning/content';
import { stageEmoji, stageName, type PlantStage } from '../learning/mastery';
import { simuladoVerdict, type SessionSummary } from '../learning/session';
import { bar, h, pct } from './dom';
import { isCancelKey, isConfirmKey, ui } from './UI';

const PLANT_EMOJI = ['🌰', '🌱', '🌿', '🌷', '🍎'];
const STAGE_FALLBACK = ['Semente', 'Broto', 'Muda', 'Florindo', 'Frutificando'];

function stageText(topicId: string, stage: PlantStage): string {
  const topic = content.topicById.get(topicId);
  return topic ? stageName(topic, stage) : STAGE_FALLBACK[stage];
}

function stageIcon(topicId: string, stage: PlantStage): string {
  const topic = content.topicById.get(topicId);
  return topic ? stageEmoji(topic, stage) : PLANT_EMOJI[stage];
}

function headline(s: SessionSummary): { title: string; text: string } {
  const rate = s.total ? s.correctFirstTry / s.total : 0;
  switch (s.kind) {
    case 'learn':
      return {
        title: s.subjectId && content.subjectById.get(s.subjectId)?.field === 'refinaria' ? 'Equipamento em teste! 🔧' : 'Tópico plantado! 🌱',
        text: 'Ótimo começo. Agora vem o segredo: **voltar a lembrar nos próximos dias**. Quando a planta murchar (ou o equipamento pedir manutenção), é a hora certa de revisar — é isso que transforma estudo em memória de longo prazo.',
      };
    case 'review':
      return {
        title: 'Revisão feita! 💧',
        text: 'Cada revisão bem-sucedida aumenta a estabilidade da memória: a próxima revisão ficará mais espaçada.',
      };
    case 'calc':
      return {
        title: 'Ordem de serviço concluída! 🧮',
        text: rate >= 0.8 ? 'Contas certas com números novos: sinal de que você domina o **método**, não só a resposta.' : 'Releia a resolução passo a passo das que errou. Na próxima ordem de serviço os números mudam — o método fica.',
      };
    case 'simulado': {
      const v = simuladoVerdict(s.parts);
      const parts = [v.basicos !== null ? `Básicos **${pct(v.basicos)}**` : '', v.especificos !== null ? `Específicos **${pct(v.especificos)}**` : ''].filter(Boolean).join(' · ');
      return v.ok
        ? { title: rate >= 0.7 ? 'Nota de classificação! 🎓' : 'Dentro dos mínimos! 📝', text: `${parts}. ${rate >= 0.7 ? 'Com 70% ou mais você briga pela vaga.' : 'Passaria nos mínimos do edital (50% em cada parte, sem zerar Português nem Inglês). Agora é subir para 70%.'}` }
        : {
            title: s.timeUp ? 'Tempo esgotado ⏱' : 'Simulado concluído 📝',
            text: `${parts}. ${v.zeroed.length ? `Zerou ${v.zeroed.join(' e ')} — na prova isso elimina. ` : ''}O mínimo do edital é **50%** nos Básicos e nos Específicos. Veja abaixo qual parte puxou para baixo.`,
          };
    }
    case 'challenge':
      return s.passed
        ? { title: 'Desafio vencido! 🏆', text: `Você acertou ${pct(rate)} no nível de prova. Continue revisando para manter esse desempenho no dia.` }
        : {
            title: s.timeUp ? 'Tempo esgotado ⏱' : 'Quase lá!',
            text: 'Para vencer o desafio é preciso **70%**. Treine os tópicos com plantas mais fracas e volte a tentar — errar aqui é barato; errar na prova não.',
          };
    default:
      return {
        title: 'Treino concluído!',
        text: rate >= 0.8 ? 'Excelente aproveitamento. Misturar tópicos assim prepara você para o formato da prova.' : 'Leia de novo as explicações das questões que você errou — elas voltarão para revisão no momento certo.',
      };
  }
}

export function showResults(summary: SessionSummary): Promise<void> {
  return new Promise((resolve) => {
    const { title, text } = headline(summary);
    const rate = summary.total ? summary.correctFirstTry / summary.total : 0;
    const topics = summary.topics.filter((t) => Math.abs(t.after - t.before) > 0.001 || summary.topics.length <= 4);
    const panel = h('div', { class: 'panel modal results' }, [
      h('header', { class: 'modal-head' }, [h('h2', { text: title })]),
      h('div', { class: 'results-stats' }, [
        stat('Acertos de primeira', `${summary.correctFirstTry}/${summary.total}`, pct(rate)),
        stat('Experiência', `+${summary.xp}`, 'XP'),
        stat('Moedas', `+${summary.coins}`, '💰'),
        stat('Tempo', formatDuration(summary.durationMs), ''),
      ]),
      h('p', { class: 'results-text', html: text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }),
      summary.kind === 'simulado' && summary.parts.length
        ? h(
            'div',
            { class: 'results-parts' },
            summary.parts.map((p) => {
              const subject = content.subjectById.get(p.subjectId);
              const r = p.total ? p.correct / p.total : 0;
              return h('div', { class: 'rp-row', style: `--accent:${subject?.color ?? '#4a74b8'}` }, [
                h('span', { class: 'rp-name', text: `${subject?.icon ?? ''} ${subject?.short ?? p.subjectId}` }),
                bar(r, 'accent'),
                h('span', { class: 'rp-score', text: `${p.correct}/${p.total} · ${pct(r)}` }),
              ]);
            }),
          )
        : null,
      summary.kind === 'simulado' ? null : topics.length
        ? h(
            'div',
            { class: 'results-topics' },
            topics.map((t) =>
              h('div', { class: 'rt-row' }, [
                h('span', { class: 'rt-plant', text: stageIcon(t.topicId, t.stageAfter) }),
                h('div', { class: 'rt-info' }, [
                  h('div', { class: 'rt-name' }, [
                    h('b', { text: t.name }),
                    h('span', {
                      class: t.stageAfter > t.stageBefore ? 'rt-up' : '',
                      text: t.stageAfter > t.stageBefore ? ` ${stageText(t.topicId, t.stageBefore)} → ${stageText(t.topicId, t.stageAfter)}!` : ` ${stageText(t.topicId, t.stageAfter)}`,
                    }),
                  ]),
                  h('div', { class: 'rt-bar' }, [
                    h('div', { class: 'bar' }, [
                      h('div', { class: 'bar-fill before', style: `width:${t.before * 100}%` }),
                      h('div', { class: 'bar-fill after', style: `width:${t.after * 100}%` }),
                    ]),
                    h('span', { text: `${pct(t.before)} → ${pct(t.after)}` }),
                  ]),
                ]),
              ]),
            ),
          )
        : null,
      h('footer', { class: 'modal-foot' }, [h('span', { class: 'spacer' }), h('button', { class: 'btn primary', html: 'Continuar <kbd>Enter</kbd>', on: { click: () => done() } })]),
    ]);
    const wrap = h('div', { class: 'layer layer-modal' }, [panel]);
    const done = () => {
      ui.remove(layer);
      resolve();
    };
    const layer = ui.push(wrap, {
      onKey: (e) => {
        if ((isConfirmKey(e) || isCancelKey(e)) && !e.repeat) {
          done();
          return true;
        }
        return false;
      },
    });
    if ((summary.kind === 'challenge' || summary.kind === 'simulado') && summary.passed) sfx.levelUp();
    else sfx.confirm();
  });
}

function stat(label: string, value: string, extra: string): HTMLElement {
  return h('div', { class: 'stat' }, [h('small', { text: label }), h('strong', { text: value }), extra ? h('span', { text: extra }) : null]);
}
