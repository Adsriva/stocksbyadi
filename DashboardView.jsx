import { useState, useEffect, useMemo, useRef } from 'react';
import { TABS, TAB_FULL, SECTORS, CAPS } from '@/constants';
import { UNIVERSE } from '@/store/initialData';
import { uid } from '@/utils/formatters';

export function AddStockModal({ activeTab, stocks, onAdd, onClose }) {
  const [q, setQ]           = useState('');
  const [sel, setSel]       = useState(null);
  const [tab, setTab]       = useState(activeTab);
  const [sector, setSector] = useState('');
  const [subSector, setSubSector]   = useState('');
  const [showSub, setShowSub]       = useState(false);
  const [cap, setCap]       = useState('Small Cap');
  const iRef = useRef(null);
  useEffect(() => { iRef.current?.focus(); }, []);

  const known    = useMemo(() => new Set(Object.values(stocks).map(s => s.name)), [stocks]);
  const allSubs  = useMemo(() => [...new Set(Object.values(stocks).map(s => s.subSector).filter(Boolean))].sort(), [stocks]);
  const sugg     = useMemo(() => { const qq = q.toLowerCase(); return !q.trim() ? UNIVERSE.slice(0,10) : UNIVERSE.filter(x => x.n.toLowerCase().includes(qq)).slice(0,10); }, [q]);
  const subSugg  = useMemo(() => { const qq = subSector.toLowerCase(); return !subSector.trim() ? allSubs.slice(0,8) : allSubs.filter(x => x.toLowerCase().includes(qq)).slice(0,8); }, [subSector, allSubs]);

  const pick  = (u) => { setSel(u); setQ(u.n); setSector(u.s); };
  const doAdd = () => {
    const nm = sel ? sel.n : q.trim(); if (!nm) return;
    const sc = sector || sel?.s || SECTORS[0];
    onAdd(uid(), { id:uid(), name:nm, sector:sc, subSector:subSector.trim(), cap, src:[tab], st:'New Idea', notes:[], sc:{bq:0,mq:0,gv:0,val:0,ts:0}, arc:false, vd:null, news:null }, tab);
    onClose();
  };

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{background:'rgba(15,23,42,0.45)',backdropFilter:'blur(8px)'}} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden bg-white border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1px solid #f1f5f9',background:'linear-gradient(to right,#f8fafc,#fff)'}}>
          <h3 className="text-slate-800 font-bold text-sm">Add Stock Idea</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg leading-none transition-colors">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {/* Stock name */}
          <div className="relative">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">Stock Name</div>
            <input ref={iRef} value={q} onChange={e=>{setQ(e.target.value);setSel(null);}} placeholder="Search or enter stock name…"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
            {q && !sel && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl shadow-xl z-10 max-h-52 overflow-y-auto bg-white border border-slate-200">
                {sugg.length===0 && <div className="px-3 py-3 text-[11px] text-slate-400">Custom — will be added as entered</div>}
                {sugg.map(u=>(
                  <button key={u.n} onClick={()=>pick(u)} className="w-full text-left px-3 py-2.5 hover:bg-blue-50 flex items-center justify-between transition-colors">
                    <span className="text-sm text-slate-800 font-medium">{u.n}</span>
                    <div className="flex items-center gap-1.5">{known.has(u.n)&&<span className="text-[9px] text-emerald-600 font-semibold">✓ tracked</span>}<span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-[2px] rounded">{u.s}</span></div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Sector + SubSector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">Sector</div>
              <select value={sector} onChange={e=>setSector(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none cursor-pointer">
                <option value="">Select…</option>
                {SECTORS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="relative">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">Sub-Sector <span className="text-violet-400 normal-case tracking-normal font-normal">(custom)</span></div>
              <input value={subSector} onChange={e=>{setSubSector(e.target.value);setShowSub(true);}} onFocus={()=>setShowSub(true)} onBlur={()=>setTimeout(()=>setShowSub(false),150)} placeholder="e.g. EMS, API…"
                className="w-full bg-slate-50 border border-violet-200 rounded-2xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400"/>
              {showSub && subSugg.length>0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl shadow-xl z-20 max-h-36 overflow-y-auto bg-white border border-violet-100">
                  {subSugg.map(s=><button key={s} onMouseDown={()=>{setSubSector(s);setShowSub(false);}} className="w-full text-left px-3 py-2 text-[11px] text-slate-700 hover:bg-violet-50 transition-colors font-medium">{s}</button>)}
                </div>
              )}
            </div>
          </div>
          {/* Cap */}
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">Market Cap</div>
            <div className="grid grid-cols-4 gap-2">
              {CAPS.map(c=><button key={c} onClick={()=>setCap(c)} style={cap===c?{border:'2px solid #3b82f6',background:'#eff6ff',color:'#2563eb'}:{border:'1px solid #e2e8f0',color:'#94a3b8'}} className="text-[10px] px-1 py-1.5 rounded-xl transition-all font-medium">{c.replace(' Cap','')}</button>)}
            </div>
          </div>
          {/* Tab */}
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">Add to Watchlist</div>
            <div className="flex flex-wrap gap-1.5">
              {TABS.map(t=><button key={t} onClick={()=>setTab(t)} title={TAB_FULL[t]||t} style={tab===t?{border:'2px solid #3b82f6',background:'#eff6ff',color:'#2563eb'}:{border:'1px solid #e2e8f0',color:'#94a3b8'}} className="text-[10px] px-2.5 py-1 rounded-full transition-all font-mono font-medium">{t}</button>)}
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-slate-500 hover:text-slate-800 text-sm border border-slate-200 bg-slate-50 font-medium transition-colors">Cancel</button>
          <button onClick={doAdd} disabled={!q.trim()} style={q.trim()?{background:'linear-gradient(135deg,#3b82f6,#6366f1)'}:{}} className="flex-1 py-2.5 rounded-2xl disabled:bg-slate-200 disabled:opacity-50 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-200">Add to Notebook</button>
        </div>
      </div>
    </div>
  );
}
