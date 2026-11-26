# Remittix Earn

React 19 + Vite + TypeScript. `npm run dev` (or `npm run dev:live`, which also
pulls new commits), `npm run build` to typecheck and build.

## Pools

Every pool deposits from its own page (`src/earn/PoolPage.tsx`, reached from
its card). Remittix is fixed-term (terms, $RTX boost, early-exit rule, 72-hour
settlement); the rest are flexible (live APY set by the protocol, no term,
withdraw any time, 24-hour settlement). The page switches on `pool.terms`.

## Positions

`#/positions` (`src/earn/PositionsPage.tsx`). A deposit's status, accrual and
payout are pure functions in `src/earn/positions.ts`; Claim, Withdraw,
settlement and rollover live on `account`. The demo wallet starts with sample
positions in every state; token prices for the dollar totals are demo values.

Payout addresses (`src/earn/payouts.ts`, `PayoutsDialog.tsx`) are per coin and
network: added → under review → 24h cooldown → whitelisted, or rejected with a
reason. Review is not simulated: a new address stays under review. The demo
wallet starts with one address in each state.

## UI rules

- Empty states use the isometric illustrations in `src/earn/illustrations.tsx`
  (review them all at `#/illustrations`). Build new ones from its shapes (`box`,
  `disc`, `extrude`): ink lines, faces in the card greys, one flat accent face,
  halftone for shadow, the missing part dashed. No gradients. In dark the
  accent face is graphite, not a colour; light keeps the indigo.

- Colours come from RTX brand tokens (`--d-*` in `src/ui/ui.css`, `--en-*` in
  `src/earn/earn.css`). Reference screens are for content and behaviour only,
  never their colours.
- Selected or highlighted states (a chosen term, the wallet's $RTX tier, an
  active tab) use the dashboard pick: `--d-pick` fill with `--d-on-pick` text.
- No gradient borders, glows, lime-on-ink highlights or other decorative
  "premium" treatments on components.
- Warnings and notices reuse the RTX dashboard's payout-wallet notice
  (`.ref-warn`): an inset row, a round glyph disc in the down colour, the
  consequence in bold. No coloured side stripes, red washes or red-bordered
  boxes. A state that blocks the action outright (Region Not Supported) is
  the dashboard's empty state (`RegionBlock`), with the red kept to the art.
- Use `Notice` (`src/earn/Notice.tsx`) for any warning; it renders that style.
- Motion uses the `--m-*` durations and `--ease-*` curves (HANDOVER.md has the
  table): things arrive on `--ease-out`, leave on `--ease-in`, travel 4 to 8px,
  scale no lower than 0.96, and only `transform` and `opacity` move. Every new
  animation must end at once under reduced motion; script checks `still()`.
- A dialog, menu or confirmation that animates out goes in `<Presence>`, its
  element an `Exits` (or a `Dialog`, which handles it).
- A screen that loads gets a skeleton built from its own markup (`T`, `Bone`
  in `src/earn/Skeletons.tsx`), so its height matches the content.
- One focus ring per control. Where a wrapper or stand-in draws the ring (a
  field around its input, a card around its radio, a box for a hidden
  checkbox), the inner control draws none.

## Previewing states

- `?theme=light` or `?theme=dark` forces a theme.
- `?rtx=65000` sets the demo wallet's $RTX for the visit, to see each boost
  tier (0, 1,000, 10,000, 50,000, 100,000).
- `?positions=empty` shows the wallet with no positions, for the visit.
- `?region=blocked` shows Region Not Supported, standing in for the backend's
  jurisdiction check (`src/earn/region.ts`).
- `?latency=800` makes each screen wait that long for its data the first time,
  to see its skeleton; add `&fail` to see its error and Retry. The switch on
  `#/illustrations` turns the wait on and off.
- `#/illustrations` shows every illustration, with Replay for its entrance.
