# 04 Design to code

The Remittix front ends were designed in Figma and built with Claude Code, by Filip under my product and creative direction. What made that work was the written rules each app follows. They turn the design principles into checks the code has to pass, so the build cannot drift from the design.

Each app is React 19, Vite and TypeScript, deployed on Vercel, with demo data in one module per area so a real API replaces a file, not a component.

## The written rules

Every app carries a short rules file that both people and AI coding assistants read before working on it. Two of them are here in full:

- [`code/earn-rules.md`](code/earn-rules.md): pools, positions, payout addresses, colors, warnings, motion, skeletons and focus.
- [`code/markets-rules.md`](code/markets-rules.md): motion, live figures, loading regions, contrast and tap areas.

A few lines that show how design decisions become rules:

> - Colours come from the RTX tokens. Reference screens are for content and behaviour only, never their colours.
> - Live figures (prices, the book, PnL) never count. They flash the way they moved, without a fill behind the text.
> - Text keeps 4.5:1 against what is behind it in both themes, including on a pinned or selected row and during a flash.
> - A screen that loads gets a skeleton built from its own markup, so its height matches the content.
> - No Figma changes for motion or loading: the file shows screens at rest.

## Code excerpts

### One liquidation price, everywhere

A trader sees a liquidation price in the order form, in the confirm dialog and in the positions table. If those three ever disagree, the product loses trust. So there is one function, and all of them call it, together with the engine that actually liquidates.

```ts
/**
 * The mark at which `pos` is liquidated, or null when no price can liquidate
 * it. One function for the order form, the confirm dialog, the positions
 * table and the liquidation engine (`account.trigger`), so they never disagree.
 */
export function liqPrice(a: Account, markOf: Record<string, number>, pos: PositionLike): number | null {
```

Full file: [`code/risk.ts`](code/risk.ts)

### The last look before an order

The confirm dialog shows every figure the order will be sent with (market, leverage, amount, order value, margin required, estimated fees), then the position the order leaves behind, with its liquidation price. If it is asking because the order is risky, it says why first.

```tsx
{o.reasons.length > 0 && <p className="cf__why" role="note"><b>Confirming because:</b> {o.reasons.join(' · ')}</p>}
...
<div><dt>Margin Required</dt><dd className="num">{fmt(o.required, 2)} {o.quote}</dd></div>
<div><dt>Est. Fees</dt><dd className="num">~{fmt(o.fee, 2)} {o.quote} ({fmt(o.feeRate, 4)}% {o.taker ? 'taker' : 'maker'})</dd></div>
...
{r && <div><dt>Liquidation Price</dt><dd className="num">{o.liq !== null ? `${fmt(o.liq, o.dp)} ${o.quote}` : 'N/A'}</dd></div>}
```

Full excerpt: [`code/ConfirmOrder.excerpt.tsx`](code/ConfirmOrder.excerpt.tsx)

### Five position states as one function

The five states from [02](02-flows.md) are not decided by each screen. They come from one pure function of the deposit and the time, so the positions list, the position page and the summary always agree.

```ts
export type Status = 'locked' | 'unlocked' | 'matured' | 'pending' | 'closed';

export function statusOf(d: Deposit, now: number): Status {
  if (d.closedAt) return 'closed';
  if (d.withdrawAt) return 'pending';
  if (!d.term) return 'unlocked';
  return now >= maturityOf(d)! ? 'matured' : 'locked';
}
```

Full excerpt: [`code/positions.excerpt.ts`](code/positions.excerpt.ts)

## Checking states without a backend

Every app can be put into any state from the address bar, so design review covers more than the happy path: `?theme=light`, `?positions=empty`, `?region=blocked`, `?account=new`, and `?latency=800&fail` to see each skeleton and each error with Retry.

Back to the [overview](../README.md)
