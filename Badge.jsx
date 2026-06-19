import { useState, useMemo } from 'react';
import { TABS, TAB_FULL, STATUSES } from '@/constants';
import { fp } from '@/utils/formatters';
import { useMarketData } from '@/hooks/useMarketData';
import { Badge } from '@/components/atoms';
import { MiniChart } from '@/components/atoms';
import { SubSectorEdit } from '@/components/layout/SubSectorEdit';
import { NotesPanel }     from './NotesPanel';
import { ConvictionPanel } from './ConvictionPanel';
import { VerdictPanel }   from './VerdictPanel';
import { NewsPanel }      from './NewsPanel';
import { MetricsPanel }   from './MetricsPanel';

const TABS_DEF = [
  { id:'notes', l:'Research',   e:'📝' },
  { id:'conv',  l:'Conviction', e:'🎯' },
  { id:'verd',  l:'Verdict',    e:'⚡' },
  { id:'news',  l:'News',       e:'📰' },
  { id:'mets',  l:'Metrics',    e:'📊' },
];

export function DetailPanel({ stock, onClose, upd, onMove, onDup, onArc, onDel }) {
  const [tab, setTab]       = useState('notes');
  const [showAct, setShowAct] = useState(false);
  const [showMov, setShowMov] = useState(false);
  const { data: px, loading: pxLoading } = useMarketData(stock.name);
  const pos = px ? px.chg >= 0 : true;

  return (
    <div style={{ background:'#ffffff', borderLeft:'2px solid #e2e8f0' }}
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] flex flex-col shadow-2xl">

      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3" style={{ borderBottom:'1px solid #f1f5f9', background:'linear-gradient(to bottom,#f8fafc,#fff)' }}>
        <div className="flex items-start gap-2 justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h2 className="text-slate-800 font-bold text-sm leading-tight">{stock.name}</h2>
              <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded uppercase tracking-wide font-medium flex-shrink-0">{stock.sector}</span>
              {stock.subSector && <span className="text-[9px] text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-[2px] rounded font-medium flex-shrink-0">{stock.subSector}</span>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge st={stock.st} sm/>
              <span className="text-[10px] text-slate-400">{stock.cap}</span>
              <div className="flex gap-1">{stock.src.map(s=><span key={s} title={TAB_FULL[s]||s} className="text-[8px] text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded font-mono cursor-default">{s}</span>)}</div>
            </div>
            <SubSectorEdit stock={stock} upd={upd}/>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <select value={stock.st} onChange={e=>upd({st:e.target.value})} className="text-[10px] bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer max-w-[108px]">
              {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <div className="relative">
              <button onClick={()=>setShowAct(!showAct)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xl leading-none transition-colors">⋮</button>
              {showAct && (
                <div style={{ background:'#fff', border:'1px solid #e2e8f0' }} className="absolute right-0 top-8 rounded-2xl shadow-xl z-20 py-1 overflow-hidden min-w-[10rem]">
                  <button onClick={()=>{setShowMov('move');setShowAct(false);}} className="w-full text-left px-3.5 py-2 text-[11px] text-slate-600 hover:bg-slate-50 transition-colors">Move to Tab</button>
                  <button onClick={()=>{setShowMov('dup');setShowAct(false);}} className="w-full text-left px-3.5 py-2 text-[11px] text-slate-600 hover:bg-slate-50 transition-colors">Duplicate to Tab</button>
                  <div style={{borderTop:'1px solid #f1f5f9'}} className="my-0.5"/>
                  <button onClick={()=>{onArc(stock.id);onClose();}} className="w-full text-left px-3.5 py-2 text-[11px] text-amber-600 hover:bg-amber-50 transition-colors">Archive</button>
                  <button onClick={()=>{onDel(stock.id);onClose();}} className="w-full text-left px-3.5 py-2 text-[11px] text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                </div>
              )}
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors text-sm">✕</button>
          </div>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          {pxLoading ? (
            <div className="flex items-center gap-2 animate-pulse"><div className="h-6 w-24 bg-slate-200 rounded-xl"/><div className="h-4 w-16 bg-slate-200 rounded-xl"/></div>
          ) : px ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-black text-slate-800 font-mono">{fp(px.px)}</span>
              <span className={`text-xs font-bold font-mono ${pos?'text-emerald-500':'text-red-500'}`}>{pos?'+':''}{px.chg.toFixed(2)}%</span>
              <span className="text-[7px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-[2px] rounded-full font-bold">● LIVE NSE</span>
            </div>
          ) : <span className="text-sm text-slate-400">Data unavailable</span>}
          {px && <div className="text-right text-[10px] text-slate-400 font-mono">52W: {fp(px.l52)} – {fp(px.h52)}</div>}
        </div>
        <div className="mt-2 h-12 bg-slate-50 rounded-xl overflow-hidden"><MiniChart name={stock.name} pos={pos}/></div>

        {/* Move/Dup picker */}
        {showMov && (
          <div className="mt-3 rounded-2xl p-3 bg-slate-50 border border-slate-200">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2 font-semibold">{showMov==='dup'?'Duplicate to:':'Move to:'}</div>
            <div className="flex flex-wrap gap-1.5">
              {TABS.map(t=><button key={t} onClick={()=>{showMov==='dup'?onDup(stock.id,t):onMove(stock.id,t);setShowMov(false);}} title={TAB_FULL[t]||t} className="text-[10px] px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-600 transition-colors font-mono">{t}</button>)}
            </div>
            <button onClick={()=>setShowMov(false)} className="text-[10px] text-slate-400 hover:text-slate-600 mt-1.5 block transition-colors">Cancel</button>
          </div>
        )}
      </div>

      {/* Tab strip */}
      <div className="flex flex-shrink-0 px-3 bg-slate-50/60" style={{ borderBottom:'1px solid #e2e8f0' }}>
        {TABS_DEF.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={tab===t.id?{borderBottom:'2px solid #3b82f6',color:'#2563eb'}:{borderBottom:'2px solid transparent',color:'#94a3b8'}}
            className="flex items-center gap-1 px-2.5 py-2.5 text-[11px] font-semibold transition-colors -mb-px hover:text-slate-600">
            <span>{t.e}</span><span className="hidden sm:inline">{t.l}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/40">
        {tab==='notes' && <NotesPanel     stock={stock} upd={upd}/>}
        {tab==='conv'  && <ConvictionPanel stock={stock} upd={upd}/>}
        {tab==='verd'  && <VerdictPanel   stock={stock} upd={upd}/>}
        {tab==='news'  && <NewsPanel      stock={stock} upd={upd}/>}
        {tab==='mets'  && <MetricsPanel   stock={stock}/>}
      </div>
    </div>
  );
}
