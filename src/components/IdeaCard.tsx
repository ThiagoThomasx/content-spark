import { Archive, Copy, ExternalLink, Star } from 'lucide-react';
import { Badge } from './Badge';
import type { Idea } from '../types/idea';
import { PotentialScore } from './PotentialScore';
import { ideaTypeTone, statusTone } from '../utils/badges';
import { formatDate } from '../utils/date';

type IdeaCardProps = {
  idea: Idea;
  onOpen: (id: string) => void;
  onCopy?: (idea: Idea) => void;
  onToggleFavorite?: (id: string) => void;
  onArchive?: (id: string) => void;
  compact?: boolean;
};

export function IdeaCard({ idea, onOpen, onCopy, onToggleFavorite, onArchive, compact = false }: IdeaCardProps) {
  return (
    <article className="surface group flex h-full w-full flex-col rounded-lg p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-600/80">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <h3
          className="line-clamp-2 text-base font-semibold leading-snug text-white group-hover:text-orange-100 cursor-pointer"
          onClick={() => onOpen(idea.id)}
        >
          {idea.title || 'Sem título'}
        </h3>
        {idea.favorite ? <Star className="mt-0.5 shrink-0 fill-amber-300 text-amber-300" size={16} /> : null}
      </div>

      {/* Primary badges — only most relevant */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge tone={ideaTypeTone(idea.ideaType)}>{idea.ideaType}</Badge>
        <Badge tone={statusTone(idea.status)}>{idea.status}</Badge>
        <PotentialScore idea={idea} compact />
      </div>

      {/* Raw idea preview */}
      {!compact && idea.rawIdea ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{idea.rawIdea}</p>
      ) : null}

      {/* Secondary meta */}
      <div className="mt-auto">
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/60 pt-2.5 text-xs text-slate-600">
          <span className="truncate">{idea.channel} · {idea.type}</span>
          <span className="shrink-0">{formatDate(idea.updatedAt)}</span>
        </div>

        {/* Actions */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            className="btn btn-secondary px-2.5 text-xs"
            onClick={() => onOpen(idea.id)}
            title="Abrir ideia"
          >
            <ExternalLink size={14} /> Abrir
          </button>
          {onCopy ? (
            <button
              type="button"
              className="btn btn-ghost px-2.5 text-xs"
              onClick={() => onCopy(idea)}
              title="Copiar briefing"
            >
              <Copy size={14} /> Briefing
            </button>
          ) : null}
          {onToggleFavorite ? (
            <button
              type="button"
              className="btn btn-ghost px-2.5 text-xs"
              onClick={() => onToggleFavorite(idea.id)}
              title={idea.favorite ? 'Desfavoritar' : 'Favoritar'}
            >
              <Star size={14} className={idea.favorite ? 'fill-amber-300 text-amber-300' : ''} />
            </button>
          ) : null}
          {onArchive ? (
            <button
              type="button"
              className="btn btn-ghost px-2.5 text-xs text-slate-600 hover:text-slate-300"
              onClick={() => onArchive(idea.id)}
              disabled={idea.status === 'Arquivado'}
              title="Arquivar ideia"
            >
              <Archive size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
