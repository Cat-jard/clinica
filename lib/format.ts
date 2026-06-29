/** Format ISO date to DD/MM/YYYY (Peruvian format) */
export function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Format 24h time string HH:MM */
export function formatTime(time: string): string {
  return time ?? '';
}

/** Today as YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Calculate age from ISO date */
export function calcAge(dob: string): number {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}
