// The problems inside #4471, counted the way the desk counts them (causes.ts): by tenant locale and booking form.
// Input: the unique reports merged into #4471 (uniqueById in causes.ts), and the tenant of each.
import type { Report, Tenant } from '#lib/kb/causes';

export const PROBLEMS = [
  { id: 'swap', title: 'Parser reads day-first dates month first (cause: parser)' },
  { id: 'form-hint', title: 'Booking-v3 form hint shows MM/DD to day-first tenants (cause: hint)' },
] as const;

export type ProblemId = (typeof PROBLEMS)[number]['id'];

// Does this locale write the day before the month? Same test as causes.ts.
function dayFirst(locale: string): boolean {
  const order = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date(Date.UTC(2026, 0, 2, 12)))
    .map((p) => p.type);
  return order.indexOf('day') < order.indexOf('month');
}

// Every report goes to exactly one problem.
export function classify(reports: Report[], tenantOf: (r: Report) => Tenant | undefined): Record<ProblemId, Report[]> {
  const out: Record<ProblemId, Report[]> = { swap: [], 'form-hint': [] };
  for (const r of reports) {
    const t = tenantOf(r);
    if (t && dayFirst(t.locale) && r.channel === 'form' && t.form === 'booking-v3') out['form-hint'].push(r);
    else out.swap.push(r);
  }
  return out;
}
