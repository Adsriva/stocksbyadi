import { useState } from 'react';
import { fetchStockNews } from '@/api/claude/news';
import { tdStr } from '@/utils/formatters';

const NEWS_CATS = {
  'Corporate Action':{ col:'#6366f1', bg:'rgba(99,102,241,0.09)',  icon:'🏢' },
  'Results':         { col:'#f59e0b', bg:'rgba(245,158,11,0.09)',  icon:'📋' },
  'Order Win':       { col:'#22c55e', bg:'rgba(34,197,94,0.09)',   icon:'🏆' },
  'Management':      { col:'#3b82f6', bg:'rgba(59,130,246,0.09)',  icon:'👔' },
  'Sector News':     { col:'#8b5cf6', bg:'rgba(139,92,246,0.09)',  icon:'🏭' },
  'Analyst':         { col:'#0ea5e9', bg:'rgba(14,165,233,0.09)',  icon:'🔍' },
  'General':         { col:'#94a3b8', bg:'rgba(148,163,184,0.09)', icon:'📰' },
};
const IMP_COL = { Positive:'#22c55e', Neutral:'#94a3b8', Negative:'#ef4444' };
const SENT_COL = { Positive:'#22c55e', Neutral:'#f59e0b', Negative:'#ef4444' };

export function NewsPanel({ stock, upd }) {
  const [loading, setLoading]   = useState(false);
  const [news, setNews]         = useState(stock.news || null);
  const [expanded, setExpanded] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  const fetch_ = async () => {
    setLoading(true); setApiStatus(null);
    try {
      const res = await fetchStockNews(stock);
      const n   = { ...res, aiGenerated:true };
      setNews(n); upd({ news:n }); setApiStatus('ai');
    } catch {
      setApiStatus('error');
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-14 h-14 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-sky-100"/>
        <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"/>
        <span className="text-xl">📰</span>
      </div>
      <div className="text-slate-700 text-sm font-semibold">Fetching latest news…</div>
      <div className="text-slate-400 text-xs text-center px-8">Claude is searching the web for <span className="font-medium text-slate-600">{stock.name}</span></div>
    </div>
  );

  if (!news) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-sky-200">📰</div>
      <div className="text-slate-800 font-bold text-sm">No News Fetched Yet</div>
      {apiStatus==='error' && <div className="text-[10px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">Claude API unavailable — try again later</div>}
      <div className="text-slate-400 text-xs text-center px-6 leading-relaxed">Claude will search the web for recent news, filings &amp; analyst updates</div>
      <button onClick={fetch_} style={{ background:'linear-gradient(135deg,#0ea5e9,#3b82f6)' }} className="text-white text-sm px-6 py-2.5 rounded-2xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-sky-200">
        📡 Fetch Latest News
      </button>
    </div>
  );

  const sc = SENT_COL[news.sentiment] || '#94a3b8';
  return (
    <div className="space-y-3">
      <div style={{ border:`2px solid ${sc}30`, background:`${sc}06` }} className="rounded-2xl p-3.5 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Latest Developments</div>
              {news.aiGenerated && <span className="text-[8px] text-sky-600 bg-sky-50 border border-sky-200 px-1.5 py-[1px] rounded-full font-semibold">✦ Live Search</span>}
            </div>
            <div className="text-[12px] text-slate-700 font-medium leading-snug">{news.headline}</div>
          </div>
          <div className="flex-shrink-0 text-right">
            <span style={{ color:sc, background:`${sc}15`, border:`1px solid ${sc}40` }} className="text-[9px] px-2 py-[3px] rounded-full font-bold">{news.sentiment}</span>
            <div className="text-[8px] text-slate-400 mt-1">{news.fetchedAt}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {news.items?.map((item, i) => {
          const cat    = NEWS_CATS[item.category] || NEWS_CATS['General'];
          const isOpen = expanded === i;
          return (
            <div key={i} onClick={() => setExpanded(isOpen?null:i)}
              style={{ border:`1px solid ${isOpen?cat.col+'50':'#e2e8f0'}`, background:isOpen?cat.bg:'#fff' }}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all shadow-sm hover:shadow-md">
              <div className="px-3.5 py-2.5 flex items-start gap-2.5">
                <div style={{ background:cat.bg, border:`1px solid ${cat.col}30` }} className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-sm mt-0.5">{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="text-[12px] text-slate-800 font-semibold leading-tight flex-1">{item.title}</div>
                    <span style={{ color:IMP_COL[item.impact] }} className="text-[10px] font-bold flex-shrink-0 ml-1">{item.impact==='Positive'?'↑':item.impact==='Negative'?'↓':'→'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span style={{ color:cat.col, background:cat.bg }} className="text-[8px] px-1.5 py-[1px] rounded-full font-semibold">{item.category}</span>
                    <span className="text-[9px] text-slate-400">{item.date}</span>
                    <span className="text-[9px] text-slate-400 truncate">· {item.source}</span>
                  </div>
                </div>
              </div>
              {isOpen && <div style={{ borderTop:`1px solid ${cat.col}20` }} className="px-3.5 py-2.5"><p className="text-[12px] text-slate-600 leading-relaxed">{item.summary}</p></div>}
            </div>
          );
        })}
      </div>

      {news.catalysts?.length > 0 && (
        <div className="rounded-2xl p-3 bg-emerald-50 border border-emerald-200">
          <div className="text-[9px] text-emerald-700 font-bold uppercase tracking-widest mb-2">🚀 Upcoming Catalysts</div>
          <ul className="space-y-1.5">{news.catalysts.map((c,i)=><li key={i} className="flex items-start gap-2 text-[11px] text-emerald-800"><span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"/>{c}</li>)}</ul>
        </div>
      )}
      {news.riskEvents?.length > 0 && (
        <div className="rounded-2xl p-3 bg-red-50 border border-red-200">
          <div className="text-[9px] text-red-600 font-bold uppercase tracking-widest mb-2">⚠ Risk Events</div>
          <ul className="space-y-1.5">{news.riskEvents.map((r,i)=><li key={i} className="flex items-start gap-2 text-[11px] text-red-700"><span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"/>{r}</li>)}</ul>
        </div>
      )}
      <button onClick={fetch_} className="w-full text-xs text-slate-400 hover:text-sky-600 py-2 rounded-2xl border border-slate-200 bg-white hover:border-sky-200 transition-colors">📡 Refresh News</button>
    </div>
  );
}
