import { useMemo } from 'react';
import { TABS, TAB_FULL, STATUS_META, SECTOR_COLORS } from '@/constants';
import { Badge, Ring } from '@/components/atoms';

export function DashboardView({ stocks, wl, dailyStatus, dailyProgress, lastRun, onRunScan }) {
  const all = Object.values(stocks).filter(s => !s.arc);
  const arc = Object.values(stocks).filter(s =>  s.arc).length;
  const bySect = useMemo(()=>{ const m={}; all.forEach(s=>{m[s.sector]=(m[s.sector]||0)+1;}); return Object.entries(m).sort((a,b)=>b[1]-a[1]); },[all]);
  const bySrc  = useMemo(()=>{ const m={}; all.forEach(s=>s.src.forEach(x=>{const k=TAB_FULL[x]||x;m[k]=(m[k]||0)+1;})); return Object.entries(m).sort((a,b)=>b[1]-a[1]); },[all]);
  const bySt   = useMemo(()=>{ const m={}; all.forEach(s=>{m[s.st]=(m[s.st]||0)+1;}); return Object.entries(m).sort((a,b)=>b[1]-a[1]); },[all]);
  const hc     = all.filter(s => Object.values(s.sc).reduce((a,b)=>a+b,0)>25 || s.st==='High Conviction');
  const notes  = useMemo(()=>{ const ns=[]; all.forEach(s=>s.notes.forEach(n=>ns.push({...n,sn:s.name}))); return ns.sort((a,b)=>b.id.localeCompare(a.id)).slice(0,6); },[all]);

  const GRADS = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#22c55e,#10b981)','linear-gradient(135deg,#f59e0b,#f97316)','linear-gradient(135deg,#94a3b8,#64748b)'];
  const Stat  = ({l,v,e,gi}) => (
    <div style={{background:GRADS[gi||0]}} className="rounded-2xl p-4 flex items-center gap-3 shadow-lg text-white">
      <div className="text-2xl">{e}</div>
      <div><div className="text-2xl font-black">{v}</div><div className="text-[9px] uppercase tracking-wider mt-0.5 opacity-80">{l}</div></div>
    </div>
  );
  const Bar = ({label,count,max,col}) => (
    <div className="flex items-center gap-2">
      <div className="text-[11px] text-slate-600 w-36 truncate font-medium">{label}</div>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div style={{width:`${count/max*100}%`,background:col||'#3b82f6',transition:'width 0.8s ease'}} className="h-full rounded-full"/>
      </div>
      <div className="text-[10px] text-slate-500 w-4 text-right font-bold">{count}</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Daily scan status */}
      <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">📡 Daily AI Scan</div>
            {dailyStatus==='running' ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                <span className="text-sm text-slate-700 font-medium">Analysing {dailyProgress.done}/{dailyProgress.total} stocks…</span>
              </div>
            ) : dailyStatus==='done' ? (
              <span className="text-sm text-emerald-600 font-semibold">✓ Scan complete — Watch Radar updated with top 5</span>
            ) : (
              <span className="text-sm text-slate-500">{lastRun ? `Last run: ${new Date(parseInt(lastRun)).toLocaleString('en-IN')}` : 'Not yet run today'}</span>
            )}
          </div>
          <button onClick={onRunScan} disabled={dailyStatus==='running'} style={{background:dailyStatus==='running'?'#e2e8f0':'linear-gradient(135deg,#3b82f6,#6366f1)'}} className="text-white text-[11px] px-4 py-2 rounded-xl font-semibold disabled:text-slate-400 hover:opacity-90 transition-all shadow-md shadow-blue-200">
            {dailyStatus==='running'?'Running…':'Run Scan Now'}
          </button>
        </div>
        {dailyStatus==='running' && (
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div style={{width:`${dailyProgress.total?dailyProgress.done/dailyProgress.total*100:0}%`,background:'linear-gradient(to right,#3b82f6,#6366f1)',transition:'width 0.3s ease'}} className="h-full rounded-full"/>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat l="Total Ideas"    v={all.length}    e="📊" gi={0}/>
        <Stat l="High Conviction" v={hc.length}    e="⭐" gi={1}/>
        <Stat l="Sectors"        v={bySect.length} e="🏭" gi={2}/>
        <Stat l="Archived"       v={arc}           e="🗄️" gi={3}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3 font-bold">By Sector</div>
          <div className="space-y-2">{bySect.slice(0,8).map(([s,c])=><Bar key={s} label={s} count={c} max={bySect[0]?.[1]||1} col={SECTOR_COLORS[s]||'#3b82f6'}/>)}</div>
        </div>
        <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3 font-bold">By Expert</div>
          <div className="space-y-2">{bySrc.map(([s,c])=><Bar key={s} label={s} count={c} max={bySrc[0]?.[1]||1} col="#8b5cf6"/>)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3 font-bold">By Watch Status</div>
          <div className="space-y-2">{bySt.map(([st,c])=>{ const m=STATUS_META[st]||STATUS_META['New Idea']; return(<div key={st} className="flex items-center justify-between py-0.5"><div className="flex items-center gap-2"><div style={{background:m.c}} className="w-2 h-2 rounded-full"/><span className="text-[11px] text-slate-600 font-medium">{st}</span></div><span style={{color:m.c}} className="text-xs font-bold">{c}</span></div>);})}</div>
        </div>
        <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3 font-bold">⭐ High Conviction</div>
          <div className="space-y-2.5">{!hc.length&&<div className="text-[11px] text-slate-400">Score stocks to see ideas here</div>}{hc.map(s=>{const t=Math.round(Object.values(s.sc).reduce((a,b)=>a+b,0)/5*10);return(<div key={s.id} className="flex items-center justify-between py-1" style={{borderBottom:'1px solid #f8fafc'}}><div><div className="text-[12px] text-slate-800 font-bold">{s.name}</div><div className="text-[9px] text-slate-400">{s.sector}</div></div><div className="flex items-center gap-2"><Badge st={s.st} sm/>{t>0&&<Ring score={t} sz={26}/>}</div></div>);})}</div>
        </div>
      </div>

      {notes.length>0&&<div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
        <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3 font-bold">✎ Recent Notes</div>
        <div className="space-y-2">{notes.map(n=><div key={n.id} className="py-2" style={{borderBottom:'1px solid #f8fafc'}}><div className="flex items-center gap-2 mb-0.5"><span className="text-[11px] font-bold text-blue-600">{n.sn}</span><span className="text-[9px] text-slate-400">{n.date}</span></div><p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{n.txt}</p></div>)}</div>
      </div>}

      <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
        <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3 font-bold">Watchlist Overview</div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {TABS.map((t,i)=>{ const c=(wl[t]||[]).filter(id=>stocks[id]&&!stocks[id].arc).length; const g=['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9','#f97316'][i%8]; return(<div key={t} style={{background:`${g}12`,border:`1px solid ${g}30`}} className="text-center p-2.5 rounded-2xl" title={TAB_FULL[t]||t}><div style={{color:g}} className="text-base font-black">{c}</div><div className="text-[8px] text-slate-500 mt-0.5 truncate font-mono font-medium">{t}</div></div>);})}
        </div>
      </div>
    </div>
  );
}
