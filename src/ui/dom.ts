/** Helpers de DOM e uma marcação leve (estilo Markdown) para textos de lições e diálogos. */

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/==([^=]+)==/g, '<mark>$1</mark>')
    .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
    .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
}

/**
 * Converte o texto do conteúdo em HTML seguro.
 * Suporta **negrito**, *itálico*, `código`, ==destaque==, listas ("- ") e parágrafos (linha em branco).
 * `{chave}` é substituído por vars[chave] (ex.: {nome}).
 */
export function md(text: string, vars: Record<string, string> = {}): string {
  const filled = text.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? vars[key] : m));
  return filled
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split('\n');
      const parts: string[] = [];
      let list: string[] = [];
      const flush = () => {
        if (list.length) parts.push(`<ul>${list.map((l) => `<li>${inline(l)}</li>`).join('')}</ul>`);
        list = [];
      };
      const para: string[] = [];
      const flushPara = () => {
        if (para.length) parts.push(`<p>${para.map(inline).join('<br>')}</p>`);
        para.length = 0;
      };
      for (const line of lines) {
        const heading = /^#{1,4}\s+(.*)$/.exec(line);
        if (heading) {
          flushPara();
          flush();
          parts.push(`<h4>${inline(heading[1])}</h4>`);
          continue;
        }
        const m = /^\s*-\s+(.*)$/.exec(line);
        if (m) {
          flushPara();
          list.push(m[1]);
        } else {
          flush();
          para.push(line);
        }
      }
      flushPara();
      flush();
      return parts.join('');
    })
    .join('');
}

type Attrs = {
  class?: string;
  html?: string;
  text?: string;
  title?: string;
  style?: string;
  type?: string;
  disabled?: boolean;
  dataset?: Record<string, string>;
  on?: Partial<Record<keyof HTMLElementEventMap, (e: Event) => void>>;
  [attr: string]: unknown;
};

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, children: (Node | string | null | undefined | false)[] = []): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') el.className = String(value);
    else if (key === 'html') el.innerHTML = String(value);
    else if (key === 'text') el.textContent = String(value);
    else if (key === 'dataset') Object.assign(el.dataset, value as Record<string, string>);
    else if (key === 'on') {
      for (const [evt, fn] of Object.entries(value as Record<string, (e: Event) => void>)) el.addEventListener(evt, fn);
    } else if (key === 'disabled') (el as HTMLButtonElement).disabled = Boolean(value);
    else el.setAttribute(key, String(value));
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    el.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return el;
}

/**
 * Efeito "máquina de escrever" preservando o HTML: cada caractere vira um <span> invisível
 * revelado aos poucos (o layout não "pula" enquanto o texto aparece).
 */
export function typewriter(el: HTMLElement, html: string, cps = 70, onTick?: (i: number) => void) {
  el.innerHTML = html;
  const spans: HTMLElement[] = [];
  const walk = (node: Node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const ch of child.textContent ?? '') {
          const s = document.createElement('span');
          s.textContent = ch;
          s.className = 'tw-hidden';
          spans.push(s);
          frag.append(s);
        }
        child.replaceWith(frag);
      } else walk(child);
    }
  };
  walk(el);
  let i = 0;
  let timer = 0;
  let resolveDone: () => void = () => {};
  const done = new Promise<void>((r) => (resolveDone = r));
  const ctl = {
    finished: false,
    done,
    finish() {
      if (ctl.finished) return;
      window.clearInterval(timer);
      for (; i < spans.length; i++) spans[i].className = '';
      ctl.finished = true;
      resolveDone();
    },
  };
  const step = Math.max(1, Math.round(cps / 60));
  timer = window.setInterval(() => {
    for (let k = 0; k < step && i < spans.length; k++, i++) {
      spans[i].className = '';
      onTick?.(i);
    }
    if (i >= spans.length) ctl.finish();
  }, 1000 / 60);
  if (!spans.length) ctl.finish();
  return ctl;
}

export function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function bar(value: number, cls = ''): HTMLElement {
  const outer = h('div', { class: `bar ${cls}` });
  const inner = h('div', { class: 'bar-fill', style: `width:${Math.max(0, Math.min(100, value * 100)).toFixed(1)}%` });
  outer.append(inner);
  return outer;
}
