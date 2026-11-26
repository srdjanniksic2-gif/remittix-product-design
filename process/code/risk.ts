// Remittix Markets, src/terminal/risk.ts.
// One liquidation function for the order form, the confirm dialog, the positions table and the engine.

import type { Account, Side } from './account';

/** Maintenance margin rate: 0.5% of notional. */
export const MMR = 0.005;

/** A position, open or hypothetical (the one an order would leave behind). */
export type PositionLike = { pair: string; side: Side; size: number; entry: number; lev: number; margin: 'cross' | 'isolated' };

const upnl = (p: PositionLike, mark: number) => (mark - p.entry) * p.size * (p.side === 'long' ? 1 : -1);

/**
 * The mark at which `pos` is liquidated, or null when no price can liquidate
 * it. One function for the order form, the confirm dialog, the positions
 * table and the liquidation engine (`account.trigger`), so they never disagree.
 *
 * Isolated: the position's own margin (entry × size / lev) is all it has; it
 * goes when the loss eats that margin down to maintenance (MMR × size × liq).
 *
 * Cross: every cross position draws on one pool: the perps balance, less the
 * margin set aside for isolated positions, plus the cross positions'
 * unrealised PNL. Holding the other marks fixed, `pos` goes at the mark X
 * where that pool, with `pos` marked at X, falls to the maintenance of all
 * cross positions (this one at X). The account's own position on `pos.pair`,
 * if any, is what `pos` stands for, so it is left out of the rest.
 */
export function liqPrice(a: Account, markOf: Record<string, number>, pos: PositionLike): number | null {
  const s = pos.size, e = pos.entry;
  if (!(s > 0) || !(e > 0) || !(pos.lev > 0)) return null;
  const long = pos.side === 'long';
  let x: number;
  if (pos.margin === 'isolated') {
    // long: (e − X)s = e·s/lev − MMR·X·s  →  X = e(1 − 1/lev) / (1 − MMR); the short mirrors it.
    x = long ? (e * (1 - 1 / pos.lev)) / (1 - MMR) : (e * (1 + 1 / pos.lev)) / (1 + MMR);
  } else {
    let pool = a.perps, otherNotional = 0;
    for (const p of a.positions) {
      if (p.pair === pos.pair) continue;
      const mark = markOf[p.pair] ?? p.entry;
      // An isolated position's margin is ring-fenced: its loss stops there and its gain does not back cross.
      if (p.margin === 'isolated') { pool -= (p.entry * p.size) / p.lev; continue; }
      pool += upnl(p, mark);
      otherNotional += p.size * mark;
    }
    const maint = MMR * otherNotional;
    // long:  pool + (X − e)s = maint + MMR·s·X  →  X = (e·s + maint − pool) / (s(1 − MMR))
    // short: pool − (X − e)s = maint + MMR·s·X  →  X = (e·s + pool − maint) / (s(1 + MMR))
    x = long ? (e * s + maint - pool) / (s * (1 - MMR)) : (e * s + pool - maint) / (s * (1 + MMR));
  }
  // A long that would need a price at or below zero cannot be liquidated; nor can anything the maths cannot place.
  return Number.isFinite(x) && x > 0 ? x : null;
}

/** How far `liq` is from the mark, as a fraction of the mark (0.095 is 9.5%); null without a liquidation price. */
export const liqDistance = (liq: number | null, mark: number) => (liq === null || !(mark > 0) ? null : Math.abs(mark - liq) / mark);
