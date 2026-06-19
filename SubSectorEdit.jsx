import { useState } from 'react';
import { generateVerdict, MOCK_VERDICT } from '@/api/claude/verdict';
import { tdStr } from '@/utils/formatters';

const VD_COL = { 'Strong Buy Candidate':'#22c55e','Research Further':'#3b82f6','Watch Closely':'#f59e0b','Wait For Better Entry':'#8b5cf6','Avoid For Now':'#f97316','Rejected':'#ef4444' };

function VSection({ title, items, col }) {
  return (
    <div className="rounded-2xl p-3 bg-white border border-slate-200 shadow-sm">
      <div style={{ color:col }} className="text-[9px] font-bold uppercase tracking-widest mb-2.5">{title}</div>
      <ul className="space-y-1.5">
        {(items||[]).map((it,i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] text-slate-600 leading-relaxed">
            <span style={{ background:col }} className="mt-[6px] w-1.5 h-1.5 rounded-full flex-shrink-0"/>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VerdictPanel({ stock, upd }) {
  const [loading, setLoading]   = useState(false);
  const [vd, setVd]             = useState(stock.vd);
  const [apiStatus, setApiStatus] = useState(null);
  const choices = ['Strong Buy Candidate','Research Further','Watch Closely','Wait For Better Entry','Avoid For Now'];

  const gen = async () => {
    setLoading(true); setApiStatus(null);
    try {
      const res = await generateVerdict(stock);
      const v   = { ...res, ts:tdStr(), aiGenerated:true };
      setVd(v); upd({ vd:v }); setApiStatus('ai');
    } catch {
      const v = { ...MOCK_VERDICT, verdict:choices[Math.floor(Math.random()*choices.length)], confidence:52+Math.floor(Math.random()*35), ts:tdStr(), aiGenerated:false };
      setVd(v); upd({ vd:v }); setApiStatus('mock');
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-14 h-14 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100"/>
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"/>
        <span className="text-xl">⚡</span>
      </div>
      <div className="text-slate-700 text-sm font-semibold">Claude is analysing {stock.name}…</div>
    </div>
  );

  if (!vd) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-200">⚡</div>
      <div className="text-slate-800 font-bold text-sm">No Verdict Yet</div>
      <div className="text-slate-500 text-xs text-center px-6 leading-relaxed">
        Click below to have Claude AI generate a verdict for <span className="text-blue-600 font-semibold">{stock.name}</span>
      </div>
      <button onClick={gen} style={{ background:'linear-gradient(135deg,#3b82f6,#6366f1)' }} className="text-white text-sm px-6 py-2.5 rounded-2xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-200">
        ⚡ Generate AI Verdict
      </button>
    </div>
  );

  const vc = VD_COL[vd.verdict] || '#6366f1';
  return (
    <div className="space-y-3">
      <div style={{ border:`2px solid ${vc}30`, background:`${vc}08` }} className="rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-medium">Research Verdict</div>
            {vd.aiGenerated && <span className="text-[8px] text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-[1px] rounded-full font-semibold">✦ Claude AI</span>}
          </div>
          <div style={{ color:vc }} className="text-base font-bold">{vd.verdict}</div>
          <div className="text-[9px] text-slate-400 mt-1.5">Generated: {vd.ts}</div>
        </div>
        <div className="text-right">
          <div style={{ color:vc }} className="text-3xl font-black font-mono">{vd.confidence}%</div>
          <div className="text-[9px] text-slate-500 font-medium">Confidence</div>
        </div>
      </div>
      {apiStatus==='mock' && <div className="flex items-center gap-2 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2"><span>⚠</span><span>Demo data — API unavailable.</span></div>}
      <VSection title="✅ Bullish Factors"     items={vd.bullish}   col="#22c55e"/>
      <VSection title="⚠️ Bearish Factors"    items={vd.bearish}   col="#ef4444"/>
      <VSection title="🔴 Key Risks"          items={vd.risks}     col="#f97316"/>
      <VSection title="👀 Triggers to Monitor" items={vd.triggers}  col="#0ea5e9"/>
      <VSection title="❓ Research Questions"  items={vd.questions} col="#8b5cf6"/>
      <button onClick={gen} className="w-full text-xs text-slate-400 hover:text-blue-600 py-2 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-colors">
        ⚡ Regenerate with Claude AI
      </button>
    </div>
  );
}
