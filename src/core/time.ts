/** Utilidades de data no fuso local do jogador. */

export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Diferença em dias de calendário entre duas chaves YYYY-MM-DD (b - a). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const ta = Date.UTC(ay, am - 1, ad);
  const tb = Date.UTC(by, bm - 1, bd);
  return Math.round((tb - ta) / 86_400_000);
}

/** "agora", "em 10 min", "em 5 h", "amanhã", "em 3 dias"... */
export function formatUntil(target: Date, now: Date = new Date()): string {
  const ms = target.getTime() - now.getTime();
  if (ms <= 60_000) return 'agora';
  const min = Math.round(ms / 60_000);
  if (min < 60) return `em ${min} min`;
  const hours = Math.round(ms / 3_600_000);
  const days = daysBetween(dayKey(now), dayKey(target));
  if (days <= 0) return `em ${hours} h`;
  if (days === 1) return 'amanhã';
  if (days < 30) return `em ${days} dias`;
  const months = Math.round(days / 30);
  return months <= 1 ? 'em 1 mês' : `em ${months} meses`;
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
