// The four problems inside #4471. Pages explain them; this file is what counts them.
// Input: the unique reports merged into #4471 (uniqueById in causes.ts), and the tenant of each.
import type { Report, Tenant } from '#lib/kb/causes';

export const PROBLEMS = [
  { id: 'swap', title: 'Day and month swapped by the shared parser' },
  { id: 'form-hint', title: 'Booking-v3 form hint shows MM/DD to day-first tenants' },
  { id: 'one-day', title: 'Dates one day off, not swapped' },
  { id: 'invite-before', title: 'Invite arrives before the booking exists' },
] as const;

export type ProblemId = (typeof PROBLEMS)[number]['id'];

// Read by hand from the bodies: a one-day shift (or the same meeting on two days across time zones)
// has no pattern a parser can tell from a swap. R-41236 is not a shift at all.
const ONE_DAY = new Set(['R-41202', 'R-41209', 'R-41344', 'R-41620']);
const INVITE_BEFORE = new Set(['R-41236']);

// Does this locale write the day before the month? Same test as causes.ts.
function dayFirst(locale: string): boolean {
  const order = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date(Date.UTC(2026, 0, 2, 12)))
    .map((p) => p.type);
  return order.indexOf('day') < order.indexOf('month');
}

// Each report goes to exactly one problem. The rest of the day-first reports are the swap.
export function classify(reports: Report[], tenantOf: (r: Report) => Tenant | undefined): Record<ProblemId, Report[]> {
  const out: Record<ProblemId, Report[]> = { swap: [], 'form-hint': [], 'one-day': [], 'invite-before': [] };
  for (const r of reports) {
    const t = tenantOf(r);
    if (INVITE_BEFORE.has(r.id)) out['invite-before'].push(r);
    else if (ONE_DAY.has(r.id)) out['one-day'].push(r);
    else if (t && dayFirst(t.locale) && r.channel === 'form' && t.form === 'booking-v3') out['form-hint'].push(r);
    else out.swap.push(r);
  }
  return out;
}
