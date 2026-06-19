import { Ring } from '@/components/atoms';

const CATS = [
  { k:'bq', l:'Business Quality',  e:'🏢' },
  { k:'mq', l:'Management Quality',e:'👔' },
  { k:'gv', l:'Growth Visibility', e:'📈' },
  { k:'val',l:'Valuation',         e:'💰' },
  { k:'ts', l:'Technical Setup',   e:'📊' },
];

export function ConvictionPanel({ stock, upd }) {
  const tot = Math.round((stock.sc.bq+stock.sc.mq+stock.sc.gv+stock.sc.val+stock.sc.ts)/5*10);
  const col = tot>=70?'#22c55e':tot>=50?'#f59e0b':tot>=25?'#3b82f6':'#94a3b8';
  const lbl = tot>=70?'High Conviction':tot>=50?'Moderate':tot>=15?'Low Conviction':'Not Scored';
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 flex items-center gap-4 bg-white border border-slate-200 shadow-sm">
        <Ring score={tot} sz={64}/>
        <div className="flex-1 min-w-0">
          <div className="text-xl font-black text-slate-800">{tot}<span className="text-sm text-slate-400 font-normal">/100</span></div>
          <div style={{ color:col }} className="text-xs font-bold mt-0.5">{lbl}</div>
          <div className="mt-2.5 space-y-1.5">
            {CATS.map(c => (
              <div key={c.k} className="flex items-center gap-2">
                <div className="text-[9px] text-slate-500 w-14 truncate font-medium">{c.l.split(' ')[0]}</div>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width:`${stock.sc[c.k]*10}%`, background:col, transition:'width 0.5s ease' }} className="h-full rounded-full"/>
                </div>
                <div className="text-[9px] text-slate-500 w-3 text-right font-bold">{stock.sc[c.k]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {CATS.map(c => {
          const v = stock.sc[c.k];
          const vc = v>=7?'#22c55e':v>=5?'#f59e0b':'#ef4444';
          return (
            <div key={c.k} className="rounded-2xl p-3 bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><span className="text-base">{c.e}</span><span className="text-[12px] text-slate-700 font-semibold">{c.l}</span></div>
                <span style={{ color:vc }} className="text-base font-black">{v}<span className="text-xs text-slate-400">/10</span></span>
              </div>
              <input type="range" min="0" max="10" value={v} onChange={e => upd({ sc:{...stock.sc,[c.k]:+e.target.value} })} className="w-full cursor-pointer accent-blue-500"/>
              <div className="flex justify-between text-[8px] text-slate-400 mt-0.5"><span>0 Poor</span><span>5 Average</span><span>10 Excellent</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
