import { SECTOR_COLORS } from '@/constants';
import { StockCard } from './StockCard';

export function SectorGroup({ sector, stocks, onSelect, selId, collapsed, onToggle }) {
  const col = SECTOR_COLORS[sector] || '#94a3b8';
  return (
    <div className="mb-5">
      <button onClick={onToggle} className="flex items-center gap-2 w-full text-left mb-3 group">
        <span className="text-slate-300 text-[9px] group-hover:text-slate-500 transition-colors select-none">{collapsed?'▶':'▼'}</span>
        <div style={{ background:col }} className="w-2.5 h-2.5 rounded-full flex-shrink-0"/>
        <span style={{ color:col }} className="text-[11px] font-bold uppercase tracking-widest group-hover:opacity-75 transition-opacity">{sector}</span>
        <span style={{ background:col }} className="text-[9px] text-white font-bold px-2 py-[2px] rounded-full">{stocks.length}</span>
        <div className="flex-1 h-px" style={{ background:`linear-gradient(to right,${col}30,transparent)` }}/>
      </button>
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {stocks.map(s => <StockCard key={s.id} stock={s} onSelect={onSelect} selected={selId===s.id}/>)}
        </div>
      )}
    </div>
  );
}
