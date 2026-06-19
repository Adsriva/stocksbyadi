import { useState, useEffect, useMemo } from 'react';
import { TABS, TAB_FULL, SECTOR_COLORS } from '@/constants';
import { INIT_STOCKS, INIT_WL, INIT_WATCH } from '@/store/initialData';
import { uid } from '@/utils/formatters';
import { loadAppData, saveAppData } from '@/hooks/useStorage';
import { useDailyRefresh }    from '@/hooks/useDailyRefresh';
import { Sidebar }            from '@/components/layout/Sidebar';
import { DetailPanel }        from '@/components/panels/DetailPanel';
import { SectorGroup }        from '@/components/cards/SectorGroup';
import { DashboardView }      from '@/components/views/DashboardView';
import { ArchiveView }        from '@/components/views/ArchiveView';
import { AddStockModal }      from '@/components/modals/AddStockModal';
import { AddWatchModal }      from '@/components/modals/AddWatchModal';
import { GlobalSearch }       from '@/components/modals/GlobalSearch';

export default function App() {
  const [loaded, setLoaded]         = useState(false);
  const [stocks, setStocks]         = useState(INIT_STOCKS);
  const [wl, setWl]                 = useState(INIT_WL);
  const [watchItems, setWatchItems] = useState(INIT_WATCH);
  const [activeTab, setActiveTab]   = useState('Drvs');
  const [view, setView]             = useState('watchlist');
  const [selId, setSelId]           = useState(null);
  const [coll, setColl]             = useState({});
  const [sectFil, setSectFil]       = useState('All');
  const [showAdd, setShowAdd]       = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAddWatch, setShowAddWatch] = useState(false);
  const [sideCol, setSideCol]       = useState(false);
  const [mobMenu, setMobMenu]       = useState(false);

  // ── Persistence ─────────────────────────────────────────────
  useEffect(() => {
    loadAppData().then(d => {
      if (d) {
        if (d.stocks)     setStocks(d.stocks);
        if (d.wl)         setWl(d.wl);
        if (d.watchItems) setWatchItems(d.watchItems);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => saveAppData({ stocks, wl, watchItems }), 600);
    return () => clearTimeout(t);
  }, [stocks, wl, watchItems, loaded]);

  // ── Keyboard shortcut ────────────────────────────────────────
  useEffect(() => {
    const h = e => { if ((e.ctrlKey||e.metaKey) && e.key==='k') { e.preventDefault(); setShowSearch(true); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // ── Stock handlers ───────────────────────────────────────────
  const addStock  = (id, data, tab) => { setStocks(p=>({...p,[id]:data})); setWl(p=>({...p,[tab]:[...new Set([...(p[tab]||[]),id])]})); };
  const updStock  = (id, u)         => setStocks(p=>({...p,[id]:{...p[id],...u}}));
  const delStock  = (id)            => { setStocks(p=>{const n={...p};delete n[id];return n;}); setWl(p=>{const n={};TABS.forEach(t=>{n[t]=(p[t]||[]).filter(x=>x!==id);});return n;}); if(selId===id) setSelId(null); };
  const arcStock  = (id)            => { updStock(id,{arc:true}); if(selId===id) setSelId(null); };
  const restStock = (id)            => updStock(id,{arc:false});
  const moveStock = (id, toTab)     => { setWl(p=>{const n={};TABS.forEach(t=>{n[t]=(p[t]||[]).filter(x=>x!==id);});n[toTab]=[...(n[toTab]||[]),id];return n;}); updStock(id,{src:[toTab]}); setActiveTab(toTab); };
  const dupStock  = (id, toTab)     => { setWl(p=>({...p,[toTab]:[...new Set([...(p[toTab]||[]),id])]})); setStocks(p=>({...p,[id]:{...p[id],src:[...new Set([...p[id].src,toTab])]}})); };

  // ── Watch Radar ──────────────────────────────────────────────
  const addWatch  = (item) => setWatchItems(p=>[...p,item]);
  const rmWatch   = (id)   => setWatchItems(p=>p.filter(x=>x.id!==id));
  const clickWatch = (wi)  => {
    const found = Object.values(stocks).find(s=>s.name===wi.name&&!s.arc);
    if (found) { const t=TABS.find(t=>(wl[t]||[]).includes(found.id)); if(t){setActiveTab(t);navTo('watchlist');} setSelId(found.id); }
    setMobMenu(false);
  };

  // ── Daily AI Scan ────────────────────────────────────────────
  const { status: dailyStatus, progress: dailyProgress, lastRun, runNow } = useDailyRefresh({
    stocks, updateStock: updStock, setWatchItems,
  });

  // ── Navigation ───────────────────────────────────────────────
  const navTo  = (v) => { setView(v); if(v!=='watchlist') setSelId(null); };
  const tabSel = (t) => { setView('watchlist'); setActiveTab(t); setSectFil('All'); setSelId(null); setMobMenu(false); };

  // ── Derived ──────────────────────────────────────────────────
  const sel        = selId ? stocks[selId] : null;
  const tabStocks  = (wl[activeTab]||[]).filter(id=>stocks[id]&&!stocks[id].arc).map(id=>stocks[id]);
  const bySect     = useMemo(()=>{
    const filt = sectFil==='All' ? tabStocks : tabStocks.filter(s=>s.sector===sectFil);
    const g={};filt.forEach(s=>{if(!g[s.sector])g[s.sector]=[];g[s.sector].push(s);});return g;
  },[tabStocks,sectFil]);
  const sectOpts   = useMemo(()=>['All',...new Set(tabStocks.map(s=>s.sector))],[tabStocks]);

  if (!loaded) return (
    <div style={{background:'#f1f5f9'}} className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" style={{borderWidth:'3px'}}/>
        <div className="text-slate-400 text-xs font-medium">Loading notebook…</div>
      </div>
    </div>
  );

  const sideProps = { view, setView:navTo, onTabSel:tabSel, activeTab, stocks, wl, col:sideCol, setCol:setSideCol, watchItems, onRemoveWatch:rmWatch, onAddWatch:()=>setShowAddWatch(true), onWatchClick:clickWatch };

  return (
    <div style={{background:'#f1f5f9'}} className="h-screen overflow-hidden text-slate-800 flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex"><Sidebar {...sideProps}/></div>

      {/* Mobile sidebar overlay */}
      {mobMenu && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <Sidebar {...sideProps} col={false} setCol={()=>{}}/>
          <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={()=>setMobMenu(false)}/>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div style={{background:'#ffffff',borderBottom:'1px solid #e2e8f0',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}} className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0">
          <button onClick={()=>setMobMenu(true)} className="md:hidden text-slate-400 hover:text-slate-700 mr-1 text-lg leading-none transition-colors">☰</button>
          <div className="flex-1 min-w-0">
            {view==='watchlist'&&<div className="flex items-center gap-1.5 text-[12px]"><span className="text-slate-400">Notebook</span><span className="text-slate-300">/</span><span className="text-slate-800 font-bold font-mono">{activeTab}</span><span className="text-slate-300 mx-1">·</span><span className="text-slate-500">{TAB_FULL[activeTab]}</span><span className="text-slate-300 mx-1">·</span><span className="text-slate-400">{tabStocks.length} stocks</span></div>}
            {view==='dashboard'&&<div className="text-sm font-bold text-slate-800">Dashboard</div>}
            {view==='archive'&&<div className="text-sm font-bold text-slate-800">Archive</div>}
          </div>
          <button onClick={()=>setShowSearch(true)} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 text-[11px] transition-colors bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50">
            🔍<span className="hidden sm:inline font-medium">Search</span><span className="hidden sm:inline text-[9px] text-slate-400 bg-slate-200 px-1 py-[2px] rounded font-mono">⌘K</span>
          </button>
          {view==='watchlist'&&<button onClick={()=>setShowAdd(true)} style={{background:'linear-gradient(135deg,#3b82f6,#6366f1)',boxShadow:'0 2px 8px rgba(59,130,246,0.35)'}} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-[11px] font-bold hover:opacity-90 transition-opacity">+ Add Stock</button>}
        </div>

        {/* Expert tabs */}
        {view==='watchlist'&&(
          <div style={{background:'#ffffff',borderBottom:'1px solid #e2e8f0'}} className="flex items-center overflow-x-auto flex-shrink-0">
            {TABS.map((t,i)=>{ const cnt=(wl[t]||[]).filter(id=>stocks[id]&&!stocks[id].arc).length,act=activeTab===t; const cols=['#3b82f6','#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9','#f97316']; const c=cols[i%cols.length];
              return <button key={t} onClick={()=>tabSel(t)} title={TAB_FULL[t]||t} style={act?{borderBottom:`2px solid ${c}`,color:c,background:`${c}06`}:{borderBottom:'2px solid transparent',color:'#94a3b8'}} className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 text-[11px] font-bold transition-all hover:text-slate-600 font-mono">{t}<span style={act?{background:`${c}20`,color:c}:{background:'#f1f5f9',color:'#94a3b8'}} className="text-[9px] px-1.5 py-[2px] rounded-full font-bold">{cnt}</span></button>;
            })}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {view==='dashboard'&&<div className="p-4 md:p-6 pb-10"><DashboardView stocks={stocks} wl={wl} dailyStatus={dailyStatus} dailyProgress={dailyProgress} lastRun={lastRun} onRunScan={runNow}/></div>}
          {view==='archive'&&<div className="p-4 md:p-6 pb-10"><ArchiveView stocks={stocks} onRestore={restStock} onSel={id=>{setSelId(id);navTo('watchlist');}}/></div>}
          {view==='watchlist'&&(
            <div className="p-4 pb-10">
              {sectOpts.length>2&&(
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-0.5">
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest flex-shrink-0 font-semibold">Filter</span>
                  {sectOpts.map(s=><button key={s} onClick={()=>setSectFil(s)} style={sectFil===s?{border:'2px solid #3b82f6',background:'#eff6ff',color:'#2563eb'}:{border:'1px solid #e2e8f0',color:'#94a3b8',background:'#fff'}} className="flex-shrink-0 text-[10px] px-3 py-0.5 rounded-full transition-all font-medium">{s}</button>)}
                </div>
              )}
              {tabStocks.length===0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center text-3xl">📋</div>
                  <div className="text-slate-500 text-sm text-center">No stocks in <span className="text-blue-600 font-bold font-mono">{activeTab}</span></div>
                  <button onClick={()=>setShowAdd(true)} style={{background:'linear-gradient(135deg,#3b82f6,#6366f1)'}} className="text-sm text-white px-6 py-2.5 rounded-2xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-blue-200">+ Add First Stock</button>
                </div>
              ) : Object.entries(bySect).map(([sector,ss])=><SectorGroup key={sector} sector={sector} stocks={ss} onSelect={setSelId} selId={selId} collapsed={coll[sector]||false} onToggle={()=>setColl(p=>({...p,[sector]:!p[sector]}))}/>)}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {sel&&<><div className="fixed inset-0 z-40 sm:hidden bg-slate-900/40 backdrop-blur-sm" onClick={()=>setSelId(null)}/><DetailPanel stock={sel} onClose={()=>setSelId(null)} upd={u=>updStock(sel.id,u)} onMove={moveStock} onDup={dupStock} onArc={arcStock} onDel={delStock}/></>}

      {/* Modals */}
      {showAdd&&<AddStockModal activeTab={activeTab} stocks={stocks} onAdd={addStock} onClose={()=>setShowAdd(false)}/>}
      {showAddWatch&&<AddWatchModal onAdd={addWatch} onClose={()=>setShowAddWatch(false)}/>}
      {showSearch&&<GlobalSearch stocks={stocks} onClose={()=>setShowSearch(false)} onSel={id=>{setSelId(id);setShowSearch(false);const t=TABS.find(t=>(wl[t]||[]).includes(id));if(t){setActiveTab(t);navTo('watchlist');}}}/>}
    </div>
  );
}
