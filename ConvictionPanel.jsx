import { useState, useEffect, useMemo, useRef } from 'react';
import { WATCH_TAGS } from '@/constants';
import { UNIVERSE } from '@/store/initialData';
import { uid } from '@/utils/formatters';

export function AddWatchModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [tags, setTags] = useState([]);
  const [note, setNote] = useState('');
  const [sel, setSel]   = useState(null);
  const iRef = useRef(null);
  useEffect(() => { iRef.current?.focus(); }, []);
  const sugg = useMemo(() => { const q = name.toLowerCase(); return !name.trim() ? UNIVERSE.slice(0,8) : UNIVERSE.filter(x => x.n.toLowerCase().includes(q)).slice(0,8); }, [name]);
  const toggle = (id) => setTags(t => t.includes(id) ? t.filter(x=>x!==id) : [...t, id]);
  const doAdd = () => {
    const nm = sel?.n || name.trim(); if (!nm) return;
    onAdd({ id:uid(), name:nm, sector:sel?.s||'', tags, note:note.trim(), autoAdded:false });
    onClose();
  };
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{background:'rgba(15,23,42,0.45)',backdropFilter:'blur(8px)'}} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden bg-white border border-slate-200">
        <div className="px-5 py-4" style={{borderBottom:'1px solid #f1f5f9',background:'linear-gradient(to right,#f0f9ff,#fff)'}}>
          <div className="flex items-center justify-between">
            <div><h3 className="text-slate-800 font-bold text-sm">Add to Watch Radar</h3><div className="text-[10px] text-slate-400 mt-0.5">Track stocks near EMAs or upcoming events</div></div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg leading-none transition-colors">✕</button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="relative">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">Stock Name</div>
            <input ref={iRef} value={name} onChange={e=>{setName(e.target.value);setSel(null);}} placeholder="Search stock name…" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400"/>
            {name && !sel && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl shadow-xl z-10 max-h-44 overflow-y-auto bg-white border border-slate-200">
                {sugg.map(u=><button key={u.n} onClick={()=>{setSel(u);setName(u.n);}} className="w-full text-left px-3 py-2.5 hover:bg-blue-50 flex items-center justify-between transition-colors"><span className="text-sm text-slate-800">{u.n}</span><span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-[2px] rounded">{u.s}</span></button>)}
              </div>
            )}
          </div>
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2 font-semibold">Watch Reason</div>
            <div className="grid grid-cols-2 gap-2">
              {WATCH_TAGS.map(t=><button key={t.id} onClick={()=>toggle(t.id)} style={tags.includes(t.id)?{border:`2px solid ${t.col}`,background:t.bg,color:t.col}:{border:'1px solid #e2e8f0',color:'#94a3b8'}} className="text-[10px] px-2.5 py-2 rounded-2xl transition-all flex items-center gap-1.5 font-semibold"><span>{t.icon}</span><span>{t.label}</span></button>)}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">Quick Note</div>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Setup or event notes…" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400"/>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-slate-500 text-sm border border-slate-200 bg-slate-50 font-medium transition-colors hover:text-slate-800">Cancel</button>
          <button onClick={doAdd} disabled={!name.trim()} style={name.trim()?{background:'linear-gradient(135deg,#3b82f6,#6366f1)'}:{}} className="flex-1 py-2.5 rounded-2xl disabled:bg-slate-200 disabled:opacity-50 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-200">Add to Radar</button>
        </div>
      </div>
    </div>
  );
}
