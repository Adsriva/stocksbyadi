import { useMemo } from 'react';
import { TAB_FULL } from '@/constants';
import { fp, fvol } from '@/utils/formatters';
import { useMarketData } from '@/hooks/useMarketData';
import { Badge, Ring, MiniChart } from '@/components/atoms';

function Skeleton({ w = 'w-16' }) {
  return <div className={`h-3 ${w} bg-slate-200 rounded animate-pulse`}/>;
}

export function StockCard({ stock, onSelect, selected }) {
  const { data: px, loading } = useMarketData(stock.name);
  const pos      = px ? px.chg >= 0 : true;
  const tot      = Math.round((stock.sc.bq+stock.sc.mq+stock.sc.gv+stock.sc.val+stock.sc.ts)/5*10);
  const hasScore = stock.sc.bq > 0;
  const isHC     = stock.st === 'High Conviction';

  return (
    <div onClick={() => onSelect(stock.id)} style={{
      background:'#ffffff',
      border:`2px solid ${selected?'#3b82f6':isHC?'#22c55e':'#e2e8f0'}`,
      boxShadow: selected?'0 4px 20px rgba(59,130,246,0.18)':isHC?'0 4px 20px rgba(34,197,94,0.12)':'0 1px 6px rgba(0,0,0,0.06)',
    }} className="rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden select-none">

      {/* Header */}
      <div className="px-3.5 pt-3 pb-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-bold text-[13px] text-slate-800 leading-tight truncate">{stock.name}</div>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded uppercase tracking-wide font-medium">{stock.sector}</span>
              {stock.subSector && <span className="text-[9px] text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-[2px] rounded font-medium">{stock.subSector}</span>}
              <span className="text-[9px] text-slate-400">{stock.cap}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0 min-w-[70px]">
            {loading ? (
              <div className="space-y-1.5 flex flex-col items-end"><Skeleton w="w-20"/><Skeleton w="w-14"/></div>
            ) : px ? (
              <>
                <div className="text-[13px] font-bold text-slate-800 font-mono">{fp(px.px)}</div>
                <div className={`text-[11px] font-bold font-mono ${pos?'text-emerald-500':'text-red-500'}`}>{pos?'+':''}{px.chg.toFixed(2)}%</div>
              </>
            ) : (
              <div className="text-[10px] text-slate-400 text-right leading-tight">No data<br/><span className="text-[8px]">NSE</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-0.5 relative bg-slate-50/60">
        {!loading && px && (
          <div className={`absolute top-1 right-3 text-[8px] font-bold tracking-wider ${pos?'text-emerald-500':'text-red-500'}`}>{pos?'▲':'▼'} Day</div>
        )}
        <MiniChart name={stock.name} pos={pos}/>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-3 bg-slate-50/80" style={{ borderTop:'1px solid #f1f5f9' }}>
        {[['Vol', loading?null:px?fvol(px.vol):'—'],
          ['52W H', loading?null:px?fp(px.h52):'—'],
          ['52W L', loading?null:px?fp(px.l52):'—'],
        ].map(([k, v], i) => (
          <div key={k} className="px-3 py-2" style={i<2?{borderRight:'1px solid #f1f5f9'}:{}}>
            <div className="text-[8px] text-slate-400 uppercase tracking-widest font-medium">{k}</div>
            {v === null
              ? <div className="h-2.5 w-10 bg-slate-200 rounded animate-pulse mt-1"/>
              : <div className="text-[10px] text-slate-700 font-mono font-semibold mt-0.5 truncate">{v}</div>}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 flex items-center justify-between gap-1" style={{ borderTop:'1px solid #f1f5f9' }}>
        <div className="flex items-center gap-1.5">
          <Badge st={stock.st} sm/>
          {hasScore && <Ring score={tot} sz={26}/>}
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {stock.src.map(s => (
            <span key={s} title={TAB_FULL[s]||s} className="text-[8px] text-slate-400 bg-slate-100 px-1.5 py-[2px] rounded font-mono cursor-default">{s}</span>
          ))}
          {stock.notes.length > 0 && <span className="text-[9px] text-slate-400">✎{stock.notes.length}</span>}
          {px?.live && <span className="text-[7px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-[1px] rounded-full font-bold ml-0.5">LIVE</span>}
        </div>
      </div>
    </div>
  );
}
