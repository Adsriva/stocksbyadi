import { useState } from 'react';
import { TABS, TAB_FULL, WATCH_TAGS } from '@/constants';

export function Sidebar({ view, setView, onTabSel, activeTab, stocks, wl, col, setCol, watchItems, onRemoveWatch, onAddWatch, onWatchClick }) {
  const [wrExpand, setWrExpand] = useState(true);
  const allCnt = Object.values(stocks).filter(s => !s.arc).length;
  const arcCnt = Object.values(stocks).filter(s =>  s.arc).length;
  const NAV = [
    { id:'dashboard', l:'Dashboard', e:'◈' },
    { id:'watchlist', l:'Watchlist', e:'◉' },
    { id:'archive',   l:'Archive',   e:'⊟', badge:arcCnt },
  ];
  return (
    <div style={{ background:'#ffffff', borderRight:'2px solid #e2e8f0' }}
      className={`${col?'w-[52px]':'w-56'} flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden shadow-sm`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3.5 py-4 flex-shrink-0" style={{ borderBottom:'1px solid #f1f5f9', background:'linear-gradient(to right,#f0f9ff,#fff)' }}>
        <div style={{ background:'linear-gradient(135deg,#3b82f6,#6366f1)' }} className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
          <span className="text-white text-xs font-black">N</span>
        </div>
        {!col && <div className="flex-1 min-w-0"><div className="text-[11px] font-bold text-slate-800 leading-tight">Stock Idea</div><div className="text-[8px] text-slate-400 tracking-widest uppercase">Notebook</div></div>}
        <button onClick={() => setCol(!col)} className="text-slate-400 hover:text-slate-700 text-sm flex-shrink-0 transition-colors">{col?'›':'‹'}</button>
      </div>
      {/* Nav */}
      <nav className="p-2 space-y-0.5 flex-shrink-0">
        {NAV.map(x => (
          <button key={x.id} onClick={() => setView(x.id)}
            className={`w-full flex items-center ${col?'justify-center px-1.5':'gap-2.5 px-2.5'} py-2 rounded-xl transition-all`}
            style={view===x.id?{background:'linear-gradient(135deg,#eff6ff,#eef2ff)',color:'#2563eb',boxShadow:'0 1px 4px rgba(59,130,246,0.15)'}:{color:'#94a3b8'}}>
            <span className="text-sm flex-shrink-0">{x.e}</span>
            {!col && <><span className="text-[12px] font-semibold flex-1">{x.l}</span>{(x.badge||0)>0&&<span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-[2px] rounded-full font-medium">{x.badge}</span>}</>}
          </button>
        ))}
      </nav>
      {!col && (
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {/* Experts */}
          <div className="text-[8px] text-slate-400 uppercase tracking-widest px-2.5 pt-4 pb-1.5 font-bold">Experts</div>
          {TABS.map((t, i) => {
            const cnt = (wl[t]||[]).filter(id => stocks[id]&&!stocks[id].arc).length;
            const act = view==='watchlist' && activeTab===t;
            const cols=['#3b82f6','#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9','#f97316'];
            const c = cols[i % cols.length];
            return (
              <button key={t} onClick={() => onTabSel(t)} title={TAB_FULL[t]||t}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
                style={act?{background:`${c}12`,color:c,border:`1px solid ${c}25`}:{color:'#94a3b8'}}>
                <div style={{ background:act?c:'#e2e8f0' }} className="w-1.5 h-1.5 rounded-full flex-shrink-0"/>
                <span className="text-[11px] flex-1 text-left font-mono font-medium">{t}</span>
                <span className={`text-[9px] font-bold ${act?'':'text-slate-400'}`}>{cnt}</span>
              </button>
            );
          })}
          {/* Watch Radar */}
          <div className="mt-3 pt-3" style={{ borderTop:'1px solid #f1f5f9' }}>
            <div className="flex items-center justify-between px-2.5 mb-2">
              <button onClick={() => setWrExpand(!wrExpand)} className="flex items-center gap-1.5 flex-1">
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ background:'linear-gradient(to right,#6366f1,#0ea5e9)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>📡 Watch Radar</span>
                <span className="text-[8px] text-slate-400 ml-0.5">{wrExpand?'▼':'▶'}</span>
                <span className="text-[8px] text-slate-400 ml-auto bg-slate-100 px-1.5 py-[1px] rounded-full">{watchItems.length}</span>
              </button>
              <button onClick={onAddWatch} className="w-5 h-5 rounded-lg flex items-center justify-center text-white text-xs font-bold ml-1.5 transition-all hover:scale-105" style={{ background:'linear-gradient(135deg,#3b82f6,#6366f1)' }}>+</button>
            </div>
            {wrExpand && (
              <div className="space-y-1.5">
                {watchItems.length===0 && <div className="text-center text-slate-400 text-[9px] py-3">No stocks on radar.<br/>Click + or wait for daily scan.</div>}
                {watchItems.map(wi => {
                  const wt = WATCH_TAGS.filter(t => wi.tags.includes(t.id));
                  return (
                    <div key={wi.id} onClick={() => onWatchClick(wi)}
                      className="px-2.5 py-2 rounded-2xl cursor-pointer hover:shadow-sm transition-all group bg-white border border-slate-200 hover:border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] text-slate-700 font-semibold truncate flex-1 leading-tight">{wi.name}</div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {wi.autoAdded && <span className="text-[7px] text-blue-500 font-bold">AUTO</span>}
                          <button onClick={e => { e.stopPropagation(); onRemoveWatch(wi.id); }} className="text-[10px] text-slate-300 hover:text-red-500 transition-colors ml-0.5">×</button>
                        </div>
                      </div>
                      {wt.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {wt.map(t => <span key={t.id} style={{ color:t.col, background:t.bg, border:`1px solid ${t.col}30` }} className="text-[8px] px-1.5 py-[2px] rounded-full font-semibold">{t.icon} {t.label}</span>)}
                        </div>
                      )}
                      {wi.note && <div className="text-[9px] text-slate-400 mt-1 truncate">{wi.note}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {!col && (
        <div className="p-3 flex-shrink-0 bg-slate-50" style={{ borderTop:'1px solid #f1f5f9' }}>
          <div className="text-[9px] text-slate-400 font-medium">{allCnt} ideas · {arcCnt} archived</div>
        </div>
      )}
    </div>
  );
}
