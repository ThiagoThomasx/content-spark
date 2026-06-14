import { Gauge } from 'lucide-react';
import type { Idea, PotentialCriteria } from '../types/idea';
import { getPotentialScoreDetails } from '../utils/score';

type PotentialScoreProps = {
  idea: Idea | PotentialCriteria;
  compact?: boolean;
};

export function PotentialScore({ idea, compact = false }: PotentialScoreProps) {
  const details = getPotentialScoreDetails(idea);
  const highScore = details.score >= 21;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${
        highScore
          ? 'border-orange-300/60 bg-orange-500/20 text-orange-50 shadow-[0_0_18px_rgba(249,115,22,0.22)]'
          : 'border-line bg-slate-900/80 text-slate-200'
      }`}
      title={`Score de potencial: ${details.classification}`}
    >
      <Gauge size={compact ? 15 : 17} className={highScore ? 'text-orange-200' : 'text-ember'} />
      <span className={compact ? 'text-xs font-bold' : 'text-sm font-bold'}>
        {details.score}/{details.maxScore}
      </span>
      {!compact ? <span className="text-xs font-semibold text-slate-300">{details.classification}</span> : null}
    </div>
  );
}
