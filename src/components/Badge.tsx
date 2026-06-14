import type { ReactNode } from 'react';

export type BadgeTone = 'type' | 'channel' | 'idea' | 'draft' | 'ready' | 'published' | 'archived' | 'low' | 'medium' | 'high' | 'muted';

const tones: Record<BadgeTone, string> = {
  type: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
  channel: 'border-violet-300/25 bg-violet-300/10 text-violet-100',
  idea: 'border-sky-300/25 bg-sky-300/10 text-sky-100',
  draft: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
  ready: 'border-orange-300/35 bg-orange-400/15 text-orange-100',
  published: 'border-emerald-300/35 bg-emerald-400/12 text-emerald-100',
  archived: 'border-slate-500/30 bg-slate-700/30 text-slate-300',
  low: 'border-slate-500/30 bg-slate-700/30 text-slate-300',
  medium: 'border-blue-300/25 bg-blue-300/10 text-blue-100',
  high: 'border-orange-300/60 bg-orange-500/25 text-orange-50 shadow-[0_0_18px_rgba(249,115,22,0.22)]',
  muted: 'border-slate-500/30 bg-slate-700/35 text-slate-300',
};

export function Badge({ children, tone = 'type' }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
