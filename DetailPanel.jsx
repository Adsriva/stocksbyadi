import { useState, useMemo } from 'react';
import { uid, tdStr } from '@/utils/formatters';

export function NotesPanel({ stock, upd }) {
  const [txt, setTxt]       = useState('');
  const [editId, setEditId] = useState(null);
  const [editTxt, setEditTxt] = useState('');
  const [q, setQ]           = useState('');

  const sorted = useMemo(() => {
    const ns = [...stock.notes].sort((a,b) => (b.pin?1:0)-(a.pin?1:0));
    return q ? ns.filter(n => n.txt.toLowerCase().includes(q.toLowerCase())) : ns;
  }, [stock.notes, q]);

  const add = () => {
    if (!txt.trim()) return;
    upd({ notes:[{ id:uid(), date:tdStr(), txt:txt.trim(), pin:false }, ...stock.notes] });
    setTxt('');
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search notes…"
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400"/>
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <textarea value={txt} onChange={e => setTxt(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter' && e.ctrlKey) add(); }}
          placeholder="Add research note… (Ctrl+Enter to save)" rows={3}
          className="w-full bg-transparent px-3 pt-3 pb-1 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none resize-none"/>
        <div className="flex justify-between items-center px-3 pb-2.5 bg-slate-50/60">
          <span className="text-[9px] text-slate-400">{tdStr()}</span>
          <button onClick={add} disabled={!txt.trim()}
            className="text-[11px] bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white px-3 py-1 rounded-lg transition-colors font-medium">
            Add Note
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
        {sorted.length === 0 && <div className="text-center text-slate-400 text-xs py-8">No notes yet</div>}
        {sorted.map(n => (
          <div key={n.id} style={{ background:n.pin?'#fffbeb':'#fff', border:`1px solid ${n.pin?'#fcd34d':'#e2e8f0'}` }} className="rounded-2xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                {n.pin && <span className="text-amber-500 text-[10px]">📌</span>}
                <span className="text-[10px] text-slate-500 font-medium">{n.date}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <button onClick={() => upd({ notes:stock.notes.map(x => x.id===n.id?{...x,pin:!x.pin}:x) })} className="text-slate-400 hover:text-amber-500 transition-colors">{n.pin?'Unpin':'Pin'}</button>
                <button onClick={() => { setEditId(n.id); setEditTxt(n.txt); }} className="text-slate-400 hover:text-blue-600 transition-colors">Edit</button>
                <button onClick={() => upd({ notes:stock.notes.filter(x => x.id!==n.id) })} className="text-slate-400 hover:text-red-500 transition-colors">Del</button>
              </div>
            </div>
            {editId===n.id ? (
              <div className="space-y-2">
                <textarea value={editTxt} onChange={e => setEditTxt(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-[13px] text-slate-800 focus:outline-none resize-none"/>
                <div className="flex gap-2">
                  <button onClick={() => { upd({ notes:stock.notes.map(x => x.id===n.id?{...x,txt:editTxt}:x) }); setEditId(null); }} className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors">Save</button>
                  <button onClick={() => setEditId(null)} className="text-[11px] border border-slate-200 text-slate-500 hover:text-slate-800 px-3 py-1 rounded-lg transition-colors">Cancel</button>
                </div>
              </div>
            ) : <p className="text-[13px] text-slate-700 leading-relaxed">{n.txt}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
