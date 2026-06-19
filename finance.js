import { useState, useEffect } from 'react';
import { fetchYahoo } from '@/api/yahoo/finance';
// TO SWITCH TO ANGEL ONE: import { fetchMarketData as fetchYahoo } from '@/api/angelone/market';

export function useMarketData(stockName) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    fetchYahoo(stockName).then(d => {
      if (!cancelled) { setData(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [stockName]);

  return { data, loading };
}
