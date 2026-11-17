/**
 * Bancada: monta a simulação (canvas animado + controles + leituras) dentro de qualquer elemento.
 * Usada no modo livre (ui/labs/index.ts) e nas partidas com tarefas (ui/games/lab.ts).
 */
import { sfx } from '../../core/audio';
import { fmt } from '../../learning/gen';
import { LAB_MODELS } from '../../learning/labs';
import { snap, withDefaults, type LabModel, type LabParam } from '../../learning/labs/model';
import type { LabId, LabValues } from '../../learning/types';
import { h } from '../dom';
import { C, clear, fitCanvas, H, W } from './draw';
import { VIEWS, type LabActionApi, type LabView } from './views';

export interface BenchOptions {
  values?: LabValues;
  locked?: string[];
}

export interface Bench {
  readonly model: LabModel;
  readonly el: HTMLElement;
  /** Valores de destino (o desenho anima até eles). */
  get(): LabValues;
  /** Valores que estão na tela agora (durante a animação). */
  shown(): LabValues;
  outputs(): Record<string, number>;
  /** Muda os controles. `animate` faz a transição devagar (para ver o efeito acontecer). */
  set(values: LabValues, animate?: boolean): void;
  /** Volta ao padrão (mais `values`) e trava `locked`. */
  reset(values?: LabValues, locked?: string[]): void;
  lock(ids: string[]): void;
  /** Chamado a cada quadro com as leituras atuais. */
  onTick: ((o: Record<string, number>, v: LabValues) => void) | null;
  /** Avisado quando o jogador mexe em algum controle. */
  onUserChange: (() => void) | null;
  destroy(): void;
}

const fmtValue = (p: LabParam, v: number) => (p.choices ? p.choices[Math.round(v)] : `${fmt(v, p.digits ?? 0)}${p.unit ? ` ${p.unit}` : ''}`);

export function mountBench(host: HTMLElement, labId: LabId, opts: BenchOptions = {}): Bench {
  const model = LAB_MODELS[labId];
  const view: LabView = VIEWS[labId]();
  let target = withDefaults(model, opts.values);
  let shown = { ...target };
  let locked = new Set(opts.locked ?? []);
  let outputs = model.compute(shown);
  let alive = true;

  const canvas = h('canvas', { class: 'lab-canvas', width: String(W), height: String(H), 'aria-label': `Simulação: ${model.name}` }) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const status = h('div', { class: 'lab-status' });
  const controls = h('div', { class: 'lab-controls' });
  const readouts = h('table', { class: 'lab-readouts' });
  const actionApi: LabActionApi = {
    get: () => ({ ...target }),
    set: (values, animate) => applyValues(values, animate ?? false, true),
    isLocked: (id) => locked.has(id),
  };
  const actions = view.actions?.length
    ? h(
        'div',
        { class: 'lab-actions' },
        view.actions.map((a) =>
          h('button', {
            class: 'btn small ghost',
            text: a.label,
            title: a.title,
            on: {
              click: () => {
                sfx.select();
                a.run(actionApi);
              },
            },
          }),
        ),
      )
    : null;
  const el = h('div', { class: 'lab' }, [
    h('div', { class: 'lab-stage' }, [canvas, status]),
    h('aside', { class: 'lab-side' }, [h('h4', { text: 'Controles' }), controls, actions, h('h4', { text: 'Leituras' }), readouts]),
  ]);
  host.append(el);

  // ---------------------------------------------------------------- controles
  const rows = new Map<string, { row: HTMLElement; input?: HTMLInputElement; buttons?: HTMLButtonElement[]; value: HTMLElement }>();
  for (const p of model.params) {
    const value = h('span', { class: 'lab-value' });
    const label = h('label', { class: 'lab-label', title: p.help }, [h('span', { text: p.label }), value]);
    if (p.choices) {
      const buttons = p.choices.map((c, i) =>
        h('button', {
          class: 'lab-choice',
          text: c,
          on: {
            click: () => {
              if (locked.has(p.id)) return;
              sfx.select();
              userSet({ [p.id]: i });
            },
          },
        }) as HTMLButtonElement,
      );
      const row = h('div', { class: 'lab-row' }, [label, h('div', { class: 'lab-choices' }, buttons)]);
      rows.set(p.id, { row, buttons, value });
      controls.append(row);
    } else {
      const input = h('input', {
        class: 'lab-range',
        type: 'range', min: String(p.min), max: String(p.max), step: String(p.step), value: String(target[p.id]), 'aria-label': p.label,
        on: { input: (e) => userSet({ [p.id]: Number((e.target as HTMLInputElement).value) }) },
      }) as HTMLInputElement;
      const row = h('div', { class: 'lab-row' }, [label, input]);
      rows.set(p.id, { row, input, value });
      controls.append(row);
    }
  }

  const syncControls = () => {
    for (const p of model.params) {
      const r = rows.get(p.id)!;
      const isLocked = locked.has(p.id);
      r.row.classList.toggle('locked', isLocked);
      r.row.classList.toggle('hidden', p.show ? !p.show(target) : false);
      r.value.textContent = `${isLocked ? '🔒 ' : ''}${fmtValue(p, target[p.id])}`;
      if (r.input) {
        r.input.disabled = isLocked;
        if (document.activeElement !== r.input) r.input.value = String(target[p.id]);
      }
      r.buttons?.forEach((b, i) => {
        b.classList.toggle('on', Math.round(target[p.id]) === i);
        b.disabled = isLocked;
      });
    }
  };

  // ---------------------------------------------------------------- leituras
  const visibleOutputs = model.outputs.filter((o) => !o.hidden);
  const cells = new Map<string, HTMLElement>();
  for (const o of visibleOutputs) {
    const cell = h('td', { class: 'lab-out' });
    cells.set(o.id, cell);
    readouts.append(h('tr', {}, [h('th', { text: o.label }), cell]));
  }
  const syncReadouts = () => {
    for (const o of visibleOutputs) {
      const v = outputs[o.id];
      const cell = cells.get(o.id)!;
      cell.textContent = Number.isFinite(v) ? `${fmt(v, o.digits ?? 2)}${o.unit ? ` ${o.unit}` : ''}` : '—';
      if (o.show) cell.parentElement?.classList.toggle('hidden', !o.show(shown));
    }
    const st = view.status?.(shown, outputs);
    status.textContent = st?.text ?? '';
    status.className = `lab-status ${st?.tone ?? ''}`;
    status.classList.toggle('hidden', !st);
  };

  // ---------------------------------------------------------------- valores
  const clean = (values: LabValues): LabValues => {
    const out: LabValues = {};
    for (const [k, v] of Object.entries(values)) {
      const p = model.params.find((pp) => pp.id === k);
      if (p && Number.isFinite(v)) out[k] = snap(p, v);
    }
    return out;
  };

  let changeCb: (() => void) | null = null;
  function userSet(values: LabValues): void {
    const allowed = Object.fromEntries(Object.entries(values).filter(([k]) => !locked.has(k)));
    if (!Object.keys(allowed).length) return;
    const c = clean(allowed);
    target = { ...target, ...c };
    // o que o jogador mexe responde na hora
    shown = { ...shown, ...c };
    syncControls();
    changeCb?.();
  }

  /** Aplica valores; `respectLocks` = vindo do jogador/ações (o roteiro das tarefas pode mexer em tudo). */
  function applyValues(values: LabValues, animate: boolean, respectLocks: boolean): void {
    const allowed = respectLocks ? Object.fromEntries(Object.entries(values).filter(([k]) => !locked.has(k))) : values;
    const c = clean(allowed);
    if (!Object.keys(c).length) return;
    target = { ...target, ...c };
    if (!animate) shown = { ...shown, ...c };
    else {
      // opções discretas mudam na hora; números deslizam
      for (const p of model.params) if (p.choices && p.id in c) shown[p.id] = c[p.id];
    }
    syncControls();
    if (respectLocks) changeCb?.();
  }
  const set = (values: LabValues, animate = false) => applyValues(values, animate, false);

  // ---------------------------------------------------------------- mouse no desenho
  const toLogical = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  let dragging = false;
  const onPointer = (kind: 'down' | 'move' | 'up') => (e: PointerEvent) => {
    if (!view.pointer) return;
    const { x, y } = toLogical(e);
    if (kind === 'down') dragging = true;
    if (kind === 'move') canvas.style.cursor = view.cursor?.(x, y, shown) ?? 'default';
    if (kind === 'move' && !dragging) return;
    if (kind === 'up') dragging = false;
    const upd = view.pointer(kind, x, y, shown);
    if (upd) userSet(upd);
    if (kind === 'down') {
      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  };
  canvas.addEventListener('pointerdown', onPointer('down'));
  canvas.addEventListener('pointermove', onPointer('move'));
  canvas.addEventListener('pointerup', onPointer('up'));
  canvas.addEventListener('pointercancel', () => (dragging = false));

  // ---------------------------------------------------------------- laço de animação
  let last = performance.now();
  let lastReadout = 0;
  let time = 0;
  let scale = 1;
  let tickCb: ((o: Record<string, number>, v: LabValues) => void) | null = null;
  const loop = (now: number) => {
    if (!alive) return;
    if (!el.isConnected) {
      // o painel foi fechado sem destroy(): para por conta própria
      alive = false;
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    const k = 1 - Math.exp(-dt * 3.2);
    for (const p of model.params) {
      if (p.choices) continue;
      const d = target[p.id] - shown[p.id];
      shown[p.id] = Math.abs(d) < (p.max - p.min) * 0.0005 ? target[p.id] : shown[p.id] + d * k;
    }
    const own = view.tick?.(shown, dt);
    if (own) applyValues(own, false, true);
    outputs = model.compute(shown);
    scale = fitCanvas(canvas);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    clear(ctx);
    view.draw(ctx, shown, outputs, dt, time);
    if (now - lastReadout > 100) {
      lastReadout = now;
      syncReadouts();
    }
    tickCb?.(outputs, shown);
    requestAnimationFrame(loop);
  };
  syncControls();
  syncReadouts();
  requestAnimationFrame(loop);

  const bench: Bench = {
    model,
    el,
    get: () => ({ ...target }),
    shown: () => ({ ...shown }),
    outputs: () => outputs,
    set,
    reset(values, lockIds) {
      target = withDefaults(model, values);
      shown = { ...target };
      locked = new Set(lockIds ?? []);
      view.reset?.();
      syncControls();
    },
    lock(ids) {
      locked = new Set(ids);
      syncControls();
    },
    get onTick() {
      return tickCb;
    },
    set onTick(fn) {
      tickCb = fn;
    },
    get onUserChange() {
      return changeCb;
    },
    set onUserChange(fn) {
      changeCb = fn;
    },
    destroy() {
      alive = false;
      el.remove();
    },
  };
  // fundo enquanto o primeiro quadro não vem
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  return bench;
}
