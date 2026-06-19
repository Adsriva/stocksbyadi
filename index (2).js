export function Ring({ score, sz = 40 }) {
  const r = (sz - 7) / 2, circ = 2 * Math.PI * r;
  const col = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : score >= 25 ? '#3b82f6' : '#cbd5e1';
  return (
    <div style={{ width:sz, height:sz }} className="relative flex items-center justify-center flex-shrink-0">
      <svg width={sz} height={sz} className="absolute inset-0 -rotate-90">
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={3.5}/>
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={col} strokeWidth={3.5}
          strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 0.6s ease' }}/>
      </svg>
      <span style={{ color:col, fontSize:sz<35?'9px':'11px' }} className="font-bold">{score}</span>
    </div>
  );
}
