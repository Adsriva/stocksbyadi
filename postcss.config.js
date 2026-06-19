import { TAB_FULL } from '@/constants';

const MOCK_VERDICT = {
  verdict: 'Research Further', confidence: 64,
  bullish:   ['Government capex remains robust','Strong order book visibility','PE re-rating potential'],
  bearish:   ['Elevated valuations','High working capital intensity'],
  risks:     ['Budget reallocation risk','Margin pressure from input costs'],
  triggers:  ['Order inflow beat','EBITDA margin expansion','52W high breakout'],
  questions: ['L1 pipeline size?','Working capital outlook?','FY26 guidance?'],
};

/**
 * Generate an AI research verdict for a stock.
 * Returns structured JSON with verdict, confidence, bullish/bearish factors etc.
 */
export async function generateVerdict(stock) {
  const scoresTxt = stock.sc.bq > 0
    ? `BizQuality=${stock.sc.bq} Mgmt=${stock.sc.mq} Growth=${stock.sc.gv} Val=${stock.sc.val} Tech=${stock.sc.ts} (all /10)`
    : 'Not scored yet';
  const notesTxt = stock.notes.length
    ? stock.notes.map(n => `[${n.date}] ${n.txt}`).join('\n')
    : 'No notes';
  const srcFull = stock.src.map(s => TAB_FULL[s] || s).join(', ');

  const prompt = `You are a senior Indian equity research analyst.
Analyze this stock idea and return ONLY valid JSON — no markdown, no preamble.

Stock: ${stock.name} | Sector: ${stock.sector}${stock.subSector ? ' > ' + stock.subSector : ''} | Cap: ${stock.cap}
Status: ${stock.st} | Sources: ${srcFull}
Scores: ${scoresTxt}
Notes:\n${notesTxt}

Return ONLY this JSON shape:
{"verdict":"Research Further","confidence":65,"bullish":["pt1","pt2","pt3","pt4"],"bearish":["pt1","pt2","pt3"],"risks":["r1","r2","r3"],"triggers":["t1","t2","t3"],"questions":["q1","q2","q3"]}

verdict must be one of: "Strong Buy Candidate","Research Further","Watch Closely","Wait For Better Entry","Avoid For Now","Rejected"
confidence: integer 30–95. Be specific to Indian market context.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error('API ' + res.status);
  const d = await res.json();
  const txt = d.content.map(x => x.type === 'text' ? x.text : '').join('')
    .replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(txt);
}

export { MOCK_VERDICT };
