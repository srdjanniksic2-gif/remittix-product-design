// Excerpt from Remittix Markets, src/terminal/ConfirmOrder.tsx: the last look before an order is sent.

/** The last look before an order is sent: every figure it will be sent with, the position it leaves, and why it asks. */
export function ConfirmOrder({ order: o, onConfirm, onClose }: { order: Pending; onConfirm: () => void; onClose: () => void }) {
  const [skip, setSkipBox] = useState(false);
  const buy = o.side === 'long';
  const approx = o.type === 'Market' || o.type === 'Stop Market' || o.type === 'TWAP' ? '~' : '';
  const confirm = () => { if (skip) setSkipped('order', true); onConfirm(); };
  const r = o.result;
  return (
    <Dialog title={`Confirm ${o.type} ${buy ? 'Buy / Long' : 'Sell / Short'}`} lede={what(o)} onClose={onClose} focus=".of__submit">
      {o.reasons.length > 0 && <p className="cf__why" role="note"><b>Confirming because:</b> {o.reasons.join(' · ')}</p>}
      <dl className="cf__rows">
        <div><dt>Market</dt><dd>{o.market}</dd></div>
        <div><dt>Leverage</dt><dd className="num">{o.lev}x ({o.margin === 'cross' ? 'Cross' : 'Isolated'})</dd></div>
        <div><dt>Amount</dt><dd className="num">{fmt(o.size, o.sp)} {o.base}</dd></div>
        {o.trigger !== undefined && <div><dt>Trigger Price</dt><dd className="num">{fmt(o.trigger, o.dp)} {o.quote}</dd></div>}
        {o.limit !== undefined && <div><dt>{o.type === 'Scale' ? 'Start Price' : 'Limit Price'}</dt><dd className="num">{fmt(o.limit, o.dp)} {o.quote}</dd></div>}
        {o.scale && <div><dt>End Price</dt><dd className="num">{fmt(o.scale.end, o.dp)} {o.quote}</dd></div>}
        {o.scale && <div><dt>Orders</dt><dd className="num">{o.scale.count}</dd></div>}
        {o.type === 'Limit' && o.tif && o.tif !== 'GTC' && <div><dt>Time in Force</dt><dd>{o.tif === 'ALO' ? 'Post only' : 'Immediate or cancel'}</dd></div>}
        {o.minutes !== undefined && <div><dt>Duration</dt><dd className="num">{o.minutes} min</dd></div>}
        <div><dt>Order Value</dt><dd className="num">{approx}{fmt(o.value, 2)} {o.quote}</dd></div>
        <div><dt>Margin Required</dt><dd className="num">{fmt(o.required, 2)} {o.quote}</dd></div>
        <div><dt>Est. Fees</dt><dd className="num">~{fmt(o.fee, 2)} {o.quote} ({fmt(o.feeRate, 4)}% {o.taker ? 'taker' : 'maker'})</dd></div>
        {o.reduceOnly && <div><dt>Reduce Only</dt><dd>Yes</dd></div>}
        {o.tp !== undefined && <div><dt>Take Profit</dt><dd className="num">{fmt(o.tp, o.dp)} {o.quote}</dd></div>}
        {o.sl !== undefined && <div><dt>Stop Loss</dt><dd className="num">{fmt(o.sl, o.dp)} {o.quote}</dd></div>}
      </dl>
      <section className="cf__result" aria-label="Resulting position">
        <p className="of__result-head"><span>Resulting position</span><span className="of__tag" data-action={o.action}>{o.action}</span></p>
        <dl className="cf__rows">
          <div><dt>Position</dt><dd className="num">{r ? <span className={r.side === 'long' ? 'is-up' : 'is-down'}>{fmt(r.size, o.sp)} {o.base} {r.side === 'long' ? 'Long' : 'Short'}</span> : 'None, closed'}</dd></div>
          {r && <div><dt>Avg. Entry</dt><dd className="num">{fmt(r.entry, o.dp)} {o.quote}</dd></div>}
          {r && <div><dt>Liquidation Price</dt><dd className="num">{o.liq !== null ? `${fmt(o.liq, o.dp)} ${o.quote}` : 'N/A'}</dd></div>}
          {o.pnl !== undefined && <div><dt>Est. PNL</dt><dd className={`num ${o.pnl >= 0 ? 'is-up' : 'is-down'}`}>{signed(Math.abs(o.pnl) < 0.005 ? 0 : o.pnl, 2)} {o.quote}</dd></div>}
        </dl>
      </section>
      {o.warnings.map((w) => <p key={w} className="of__warn">{w}</p>)}
      {o.skipOn ? (
        <p className="pnote">Confirmations are off, but orders like this one always ask.</p>
