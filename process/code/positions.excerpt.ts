// Excerpt from Remittix Earn, src/earn/positions.ts.
// A deposit's status and payout are pure functions of the deposit and the time.

/**
 * What a deposit is worth over time: its status, the interest it has accrued,
 * what a withdrawal pays out (the early-exit rule included), and the summary
 * across all of a wallet's positions. Pure functions of a deposit and `now`.
 */
import type { Deposit } from './account';
import { POOLS, marketOf, type TokenId } from './pools';

export const DAY = 86_400_000;
export const HOUR = 3_600_000;

export type Status = 'locked' | 'unlocked' | 'matured' | 'pending' | 'closed';

/** DEMO: a reference price per token for the dollar totals. The backend supplies live ones. */
export const PRICE: Record<TokenId, number> = { USDC: 1, USDT: 1, USDS: 1, ETH: 2_600, wBTC: 64_000 };

export const poolOf = (d: Deposit) => POOLS.find((p) => p.id === d.pool)!;
export const maturityOf = (d: Deposit) => (d.term ? d.t + d.term * DAY : null);
/** How long a withdrawal takes to settle: 72 hours from a fixed pool, 24 from a flexible one. */
export const settleOf = (d: Deposit) => (d.term ? 72 : 24) * HOUR;

export function statusOf(d: Deposit, now: number): Status {
  if (d.closedAt) return 'closed';
  if (d.withdrawAt) return 'pending';
  if (!d.term) return 'unlocked';
  return now >= maturityOf(d)! ? 'matured' : 'locked';
}

