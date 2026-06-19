import { Badge } from '@/components/atoms';
export function ArchiveView({ stocks, onRestore, onSel }) {
  const arc = Object.values(stocks).filter(s => s.arc);
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shadow-sm">🗄️</div>
        <div><div className="text-slate-800 font-bold">Archive</div><div className="text-slate-400 text-xs">{arc.length} archived stock{arc.length!==1?'s':''}</div></div>
      </div>
      {arc.length===0 ? <div className="text-center text-slate-400 py-16 text-sm">No archived stocks</div> : (
        <div className="space-y-2">
          {arc.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div><div className="text-sm text-slate-800 font-semibold">{s.name}</div><div className="text-[10px] text-slate-400">{s.sector}{s.subSector?` › ${s.subSector}`:''} · {s.cap}</div></div>
                <Badge st={s.st} sm/>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>onSel(s.id)} className="text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium">View</button>
                <button onClick={()=>onRestore(s.id)} className="text-[11px] px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-semibold transition-colors">Restore</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
