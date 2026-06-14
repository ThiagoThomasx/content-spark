import { Archive, Calendar, Copy, ExternalLink, Star } from 'lucide-react';
import { Badge } from './Badge';
import type { Idea } from '../types/idea';
import { PotentialScore } from './PotentialScore';
import { priorityTone, statusTone } from '../utils/badges';
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
    <article className="surface group flex h-full w-full flex-col rounded-lg p-4 text-left transition hover:-translate-y-0.5 hover:border-ember/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-white group-hover:text-orange-100">
            {idea.title || 'Sem titulo'}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="type">{idea.type}</Badge>
            <Badge tone="channel">{idea.channel}</Badge>
            <Badge tone={statusTone(idea.status)}>{idea.status}</Badge>
            <Badge tone={priorityTone(idea.priority)}>{idea.priority}</Badge>
            <PotentialScore idea={idea} compact />
          </div>
        </div>
        {idea.favorite ? <Star className="shrink-0 fill-amber-300 text-amber-300" size={20} /> : null}
      </div>

      {!compact ? (
        <>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{idea.rawIdea || 'Sem ideia bruta registrada.'}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {idea.tags.length ? idea.tags.map((tag) => <Badge key={tag} tone="muted">#{tag}</Badge>) : <Badge tone="muted">sem tags</Badge>}
          </div>
        </>
      ) : null}

      <div className="mt-4 grid gap-1 border-t border-line pt-3 text-xs text-slate-500 sm:grid-cols-2">
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={14} /> Criada: {formatDate(idea.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1.5 sm:justify-end">
          Atualizada: {formatDate(idea.updatedAt)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
        <button type="button" className="btn btn-secondary px-2.5" onClick={() => onOpen(idea.id)} title="Abrir ideia">
          <ExternalLink size={16} /> Abrir
        </button>
        {onCopy ? (
          <button type="button" className="btn btn-secondary px-2.5" onClick={() => onCopy(idea)} title="Copiar briefing">
            <Copy size={16} /> Copiar
          </button>
        ) : null}
        {onToggleFavorite ? (
          <button type="button" className="btn btn-secondary px-2.5" onClick={() => onToggleFavorite(idea.id)} title={idea.favorite ? 'Desfavoritar' : 'Favoritar'}>
            <Star size={16} className={idea.favorite ? 'fill-amber-300 text-amber-300' : ''} /> {idea.favorite ? 'Salvo' : 'Favorito'}
          </button>
        ) : null}
        {onArchive ? (
          <button
            type="button"
            className="btn btn-secondary px-2.5"
            onClick={() => onArchive(idea.id)}
            disabled={idea.status === 'Arquivado'}
            title="Arquivar ideia"
          >
            <Archive size={16} /> Arquivar
          </button>
        ) : null}
      </div>
    </article>
  );
}
