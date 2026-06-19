import { useState, useEffect, useMemo, useRef } from 'react';
import { TAB_FULL } from '@/constants';
import { Badge } from '@/components/atoms';

export function GlobalSearch({ stocks, onClose, onSel }) {
  const [q, setQ] = useState('');
  const iRef = useRef(null);
  useEffect(() => { iRef.current?.focus(); }, []);
  useEffect(() => { const h = e => { if (e.key==='Escape') onClose(); }; window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h); }, [onClose]);
  const res = useMemo(() => {
    if (!q.trim()) return [];
    const qq = q.toLowerCase();
    return Object.values(stocks).filter(s => !s.arc && (
      s.name.toLowerCase().includes(qq) || s.sector.toLowerCase().includes(qq) ||
      (s.subSector||'').toLowerCase().includes(qq) || s.st.toLowerCase().includes(qq) ||
      s.src.some(x => x.toLowerCase().includes(qq)||(TAB_FULL[x]||'').toLowerCase().includes(qq)) ||
      s.notes.some(n => n.txt.toLowerCase().includes(qq))
    ));
  }, [q, stocks]);
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{background:'rgba(15,23,42,0.45)',backdropFilter:'blur(10px)'}} className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden bg-white border border-slate-200">
        <div className="flex items-center gap-3 px-4 py-3.5" style={{borderBottom:'1px solid #f1f5f9',background:'#f8fafc'}}>
          <span className="text-slate-400 text-sm">🔍</span>
          <input ref={iRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search stocks, notes, sub-sectors, sources…" className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"/>
          <button onClick={onClose} className="text-[9px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded font-mono hover:bg-slate-300 transition-colors">ESC</button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto">
          {!q && <div className="p-6 text-center text-slate-400 text-xs">Search stocks · notes · sub-sectors · sectors · sources</div>}
          {q && res.length===0 && <div className="p-6 text-center text-slate-400 text-xs">No results found</div>}
          {res.map(s => {
            const mn = q && s.notes.find(n => n.txt.toLowerCase().includes(q.toLowerCase()));
            return (
              <button key={s.id} onClick={()=>onSel(s.id)} className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors" style={{borderBottom:'1px solid #f8fafc'}}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-800 font-semibold">{s.name}</span>
                    <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-[2px] rounded">{s.sector}</span>
                    {s.subSector && <span className="text-[9px] text-violet-500 bg-violet-50 px-1.5 py-[2px] rounded">{s.subSector}</span>}
                  </div>
                  <Badge st={s.st} sm/>
                </div>
                <div className="flex items-center gap-2">{s.src.map(x=><span key={x} title={TAB_FULL[x]||x} className="text-[9px] text-slate-400 font-mono">{x}</span>)}{s.notes.length>0&&<span className="text-[9px] text-slate-400">✎{s.notes.length}</span>}</div>
                {mn && <div className="mt-1 text-[10px] text-slate-500 italic truncate">"{mn.txt.slice(0,90)}…"</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
