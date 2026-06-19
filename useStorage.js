import { useState, useEffect } from 'react';

export function SubSectorEdit({ stock, upd }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(stock.subSector || '');
  useEffect(() => { setEditing(false); setVal(stock.subSector || ''); }, [stock.id, stock.subSector]);
  if (!editing) return (
    <button onClick={() => { setVal(stock.subSector||''); setEditing(true); }} className="mt-1.5 flex items-center gap-1 group">
      <span className="text-[9px] text-slate-400 group-hover:text-violet-500 transition-colors">
        {stock.subSector ? `✏ ${stock.subSector}` : '+ Add Sub-Sector'}
      </span>
    </button>
  );
  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <input autoFocus value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if(e.key==='Enter'){upd({subSector:val.trim()});setEditing(false);} if(e.key==='Escape') setEditing(false); }}
        placeholder="e.g. EMS, API, T&D…"
        className="flex-1 text-[11px] bg-violet-50 border border-violet-200 rounded-lg px-2 py-1 text-violet-700 placeholder-violet-300 focus:outline-none focus:border-violet-400"/>
      <button onClick={() => { upd({subSector:val.trim()}); setEditing(false); }} className="text-[9px] bg-violet-500 hover:bg-violet-600 text-white px-2 py-1 rounded-lg font-medium transition-colors">Save</button>
      <button onClick={() => setEditing(false)} className="text-[9px] text-slate-400 hover:text-slate-600 transition-colors">✕</button>
    </div>
  );
}
