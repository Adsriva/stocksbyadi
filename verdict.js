/**
 * useDailyRefresh
 * ─────────────────────────────────────────────────────────────
 * Runs ONCE every 24 hours automatically on app load.
 * Steps:
 *   1. Check when the last daily scan was run (from storage)
 *   2. If >24h ago → trigger full analysis on all active stocks
 *   3. For each stock: call Claude Verdict + Claude News
 *   4. Score every stock (conviction + verdict + news + EMA proximity)
 *   5. Pick top 5 → auto-update Watch Radar with tag + reason note
 *   6. Save lastDailyRun timestamp to storage
 *
 * The auto-added Watch Radar items are flagged `autoAdded: true`
 * so they can be refreshed/replaced each day without touching
 * manually-added items.
 */

import { useState, useEffect, useCallback } from 'react';
import { generateVerdict, MOCK_VERDICT } from '@/api/claude/verdict';
import { fetchStockNews }                 from '@/api/claude/news';
import { fetchYahoo }                     from '@/api/yahoo/finance';
import { scoreStock, getWatchTags, generateRadarNote } from '@/utils/scorer';
import { uid, tdStr }                     from '@/utils/formatters';

const DAILY_KEY    = 'sinDailyRun';
const TWENTY_FOUR  = 24 * 60 * 60 * 1000;
const DELAY_MS     = 2500; // delay between stocks to avoid rate-limits

/** Sleep helper */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/** Run verdict + news for one stock, return enriched result */
async function analyseStock(stock) {
  let verdict = stock.vd || null;
  let news    = stock.news || null;
  let marketData = null;

  try { marketData = await fetchYahoo(stock.name); } catch {}
  await sleep(DELAY_MS);

  try {
    verdict = await generateVerdict(stock);
  } catch {
    // Use mock if API unavailable
    verdict = { ...MOCK_VERDICT, ts: tdStr(), aiGenerated: false };
  }
  await sleep(DELAY_MS);

  try {
    news = await fetchStockNews(stock);
    news.aiGenerated = true;
  } catch {
    news = stock.news || null;
  }

  return { stock, verdict, news, marketData };
}

export function useDailyRefresh({ stocks, updateStock, setWatchItems }) {
  const [status, setStatus]   = useState('idle');   // idle | running | done | error
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [lastRun, setLastRun]   = useState(null);

  /** Force-run — callable from UI button */
  const runNow = useCallback(async () => {
    const active = Object.values(stocks).filter(s => !s.arc);
    if (!active.length) return;

    setStatus('running');
    setProgress({ done: 0, total: active.length });

    const results = [];

    for (let i = 0; i < active.length; i++) {
      const stock  = active[i];
      try {
        const result = await analyseStock(stock);
        results.push(result);

        // Persist verdict + news back to stock immediately
        updateStock(stock.id, {
          vd:   { ...result.verdict, ts: tdStr(), aiGenerated: result.verdict?.aiGenerated ?? false },
          news: result.news ? { ...result.news, fetchedAt: tdStr() } : stock.news,
        });
      } catch (e) {
        console.error('[DailyRefresh] failed for', stock.name, e);
        results.push({ stock, verdict: stock.vd, news: stock.news, marketData: null });
      }

      setProgress({ done: i + 1, total: active.length });
    }

    // ── Score & rank ────────────────────────────────────────
    const ranked = results
      .map(r => ({
        ...r,
        score: scoreStock(r.stock, r.verdict, r.news, r.marketData),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // ── Build new Watch Radar items (top 5) ─────────────────
    const newItems = ranked.map(r => ({
      id:        uid(),
      name:      r.stock.name,
      sector:    r.stock.sector,
      tags:      getWatchTags(r.stock, r.verdict, r.news, r.marketData),
      note:      generateRadarNote(r.stock, r.verdict, r.news, r.score),
      autoAdded: true,
      addedDate: tdStr(),
    }));

    // Replace auto-added items, keep manual ones
    setWatchItems(prev => [
      ...prev.filter(w => !w.autoAdded),
      ...newItems,
    ]);

    // ── Save last-run timestamp ─────────────────────────────
    const now = Date.now().toString();
    setLastRun(now);
    if (window.storage) {
      try { await window.storage.set(DAILY_KEY, now); } catch {}
    }

    setStatus('done');
  }, [stocks, updateStock, setWatchItems]);

  /** Auto-trigger on mount if >24h since last run */
  useEffect(() => {
    const check = async () => {
      let last = null;
      if (window.storage) {
        try {
          const r = await window.storage.get(DAILY_KEY);
          if (r?.value) last = parseInt(r.value, 10);
        } catch {}
      }
      setLastRun(last ? last.toString() : null);
      const shouldRun = !last || (Date.now() - last > TWENTY_FOUR);
      if (shouldRun) {
        // Small delay to let UI settle before heavy API calls
        setTimeout(() => runNow(), 3000);
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  return { status, progress, lastRun, runNow };
}
