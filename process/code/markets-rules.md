# Remittix Markets

React 19 + Vite + TypeScript. `npm run dev` (or `npm run dev:sync`, which also
pulls new commits), `npm run build` to typecheck and build. `HANDOVER.md` is the
map of the code; the preview switches are at its top.

## Motion and loading rules

- Motion uses the `--m-*` durations and `--ease-*` curves (HANDOVER.md has the
  table; `MOTION` and `EASE` in `src/ui/motion.ts` for script). Things arrive
  on `--ease-out` and leave on `--ease-in`, travel 4 to 8px, and only
  `transform` and `opacity` move. A surface (menu, card, dialog) scales no
  lower than 0.96; a small icon landing (`.pop-in`) pops from 0.6 on
  `--ease-spring` (the page change moves
  by `top` so a fixed dialog opened at once stays put).
- Every new animation must end at once under reduced motion. CSS gets it from
  the global rule; script checks `still()` and goes straight to the end.
- A dialog or menu that animates out goes in `<Presence>`, its element an
  `Exits` (or a `Dialog`, which handles it).
- Live figures (prices, the book, PnL) never count. They flash the way they
  moved, without a fill behind the text. Totals count only after the trader's
  own action (`TweenOn` with `after`) or when they have just loaded (`from`).
- A region that loads uses `useRegion` (`src/terminal/Loading.tsx`): `region`
  on its card, `part` on what holds data, a `<Busy>` line, `<LoadError>` on
  failure. A figure inside a part is a `.num` (or `.skel-t`) so it masks as
  skeleton. Check it with `?latency=800` and `&fail`: nothing may move when
  the data lands.
- Empty states use the drawings in `src/ui/EmptyState.tsx` on a 64 grid at a
  1.6px stroke, the missing part dashed; wrap a new one in `Drawn` with
  `stroke(n)` and `part(n)` so it draws in.

## UI rules

- Colours come from the RTX tokens (`--d-*` in `src/ui/ui.css`); green and red
  are for direction only.
- Text keeps 4.5:1 against what is behind it in both themes, including on a
  pinned or selected row and during a flash.
- One focus ring per control; 44px tap areas on phones go on `::before`
  (`::after` is the `.tip` tooltip), see `src/terminal/a11y.css`.
- No Figma changes for motion or loading: the file shows screens at rest.
