import { STATUS_META } from '@/constants';
export function Badge({ st, sm }) {
  const m = STATUS_META[st] || STATUS_META['New Idea'];
  return (
    <span style={{ color:m.c, background:m.bg, border:`1px solid ${m.c}30` }}
      className={`inline-block rounded-full font-semibold whitespace-nowrap ${sm?'text-[9px] px-1.5 py-[2px]':'text-[11px] px-2 py-[3px]'}`}>
      {st}
    </span>
  );
}
