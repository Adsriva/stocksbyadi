import { useMarketData } from '@/hooks/useMarketData';
import { fp, fvol }       from '@/utils/formatters';

export function MetricsPanel({ stock }) {
  const { data: px, loading } = useMarketData(stock.name);

  if (loading) return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"/>
      {[...Array(10)].map((_,i) => (
        <div key={i} className="flex justify-between px-4 py-2.5 rounded-xl bg-slate-50">
          <div className="h-3 bg-slate-200 rounded w-24"/>
          <div className="h-3 bg-slate-200 rounded w-20"/>
        </div>
      ))}
    </div>
  );

  if (!px) return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="text-3xl opacity-40">📡</div>
      <div className="text-slate-500 text-sm font-medium">Market data unavailable</div>
      <div className="text-slate-400 text-xs text-center px-6">Yahoo Finance may be temporarily unavailable for this symbol.</div>
    </div>
  );

  const pct52 = px.h52>px.l52 ? Math.max(0,Math.min(100,((px.px-px.l52)/(px.h52-px.l52)*100))) : 50;
  const rows = [
    ['Last Traded Price', fp(px.px),   null],
    ['Day Change',        `${px.chg>0?'+':''}${px.chg.toFixed(2)}%`, px.chg>0?'#22c55e':'#ef4444'],
    ['Day High',          fp(px.dayH), '#22c55e'],
    ['Day Low',           fp(px.dayL), '#ef4444'],
    ['Volume (Today)',    fvol(px.vol), null],
    ['Volume (Prev Day)', fvol(px.pvol), null],
    ['SMA 10',            fp(px.s10),  '#3b82f6'],
    ['SMA 20',            fp(px.s20),  '#6366f1'],
    ['EMA 10',            fp(px.e10),  '#f59e0b'],
    ['EMA 20',            fp(px.e20),  '#f97316'],
    ['52-Week High',      fp(px.h52),  '#22c55e'],
    ['52-Week Low',       fp(px.l52),  '#ef4444'],
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"/>
        <span>Live data from Yahoo Finance · <span className="font-mono">{px.sym}</span></span>
      </div>
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
        {rows.map(([k, v, c], i) => (
          <div key={k} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom:'1px solid #f8fafc', background:i%2===0?'#fafafa':'#fff' }}>
            <span className="text-xs text-slate-500 font-medium">{k}</span>
            <span style={{ color:c||'#1e293b' }} className="text-xs font-bold font-mono">{v||'—'}</span>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-3 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">52-Week Range</div>
          <div className="text-[9px] text-amber-600 font-bold">{pct52.toFixed(1)}% from low</div>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div style={{ width:`${pct52}%`, background:'linear-gradient(to right,#ef4444,#f59e0b,#22c55e)' }} className="h-full rounded-full transition-all duration-700"/>
        </div>
        <div className="flex justify-between text-[9px]">
          <span className="text-slate-400 font-mono">{fp(px.l52)}</span>
          <span className="text-slate-500 font-mono">{fp(px.px)}</span>
          <span className="text-slate-400 font-mono">{fp(px.h52)}</span>
        </div>
      </div>
      {(px.e10 || px.e20) && (
        <div className="rounded-2xl p-3 bg-white border border-slate-200 shadow-sm">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mb-2.5">EMA Proximity</div>
          {[['EMA 10', px.e10], ['EMA 20', px.e20]].map(([label, ema]) => ema ? (
            <div key={label} className="flex items-center justify-between mb-1.5 last:mb-0">
              <span className="text-[11px] text-slate-600 font-medium">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">{fp(ema)}</span>
                <span style={{ color:px.px>=ema?'#22c55e':'#ef4444' }} className="text-[10px] font-bold">
                  {px.px>=ema?'▲ Above':'▼ Below'} ({Math.abs(((px.px-ema)/ema)*100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  );
}
