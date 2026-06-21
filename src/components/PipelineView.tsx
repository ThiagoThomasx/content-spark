import { Archive, Copy, ExternalLink, RotateCcw, Search, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from './Badge';
import { EmptyState } from './EmptyState';
import { PotentialScore } from './PotentialScore';
import {
  channels,
  contentTypes,
  ideaTypes,
  priorities,
  statuses,
  type Channel,
  type ContentType,
  type Idea,
  type IdeaStatus,
  type IdeaType,
  type Priority,
} from '../types/idea';
import { ideaTypeTone, priorityTone, statusTone } from '../utils/badges';
import { formatDate } from '../utils/date';

type PipelineFilters = {
  query: string;
  channel: 'Todos' | Channel;
  type: 'Todos' | ContentType;
  ideaType: 'Todos' | IdeaType;
  priority: 'Todas' | Priority;
  favoritesOnly: boolean;
};

const defaultPipelineFilters: PipelineFilters = {
  query: '',
  channel: 'Todos',
  type: 'Todos',
  ideaType: 'Todos',
  priority: 'Todas',
  favoritesOnly: false,
};

const emptyMessages: Record<IdeaStatus, string> = {
  Ideia: 'Nenhuma ideia aqui ainda.',
  Rascunho: 'Nada em desenvolvimento ainda.',
  'Pronto para produzir': 'Mova ideias para cá quando estiverem prontas.',
  Publicado: 'Quando publicar, mova para cá.',
  Arquivado: 'Ideias fora do foco ficam guardadas aqui.',
};

type PipelineViewProps = {
  ideas: Idea[];
  filters: PipelineFilters;
  onFiltersChange: (filters: PipelineFilters) => void;
  onClearFilters: () => void;
  onOpen: (id: string) => void;
  onCopy: (idea: Idea) => void;
  onToggleFavorite: (id: string) => void;
  onArchive: (id: string) => void;
  onStatusChange: (id: string, status: IdeaStatus) => void;
};

export { defaultPipelineFilters };
export type { PipelineFilters };

export function PipelineView({
  ideas,
  filters,
  onFiltersChange,
  onClearFilters,
  onOpen,
  onCopy,
  onToggleFavorite,
  onArchive,
  onStatusChange,
}: PipelineViewProps) {
  const filteredIdeas = filterPipelineIdeas(ideas, filters);

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Pipeline</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Acompanhe cada ideia por estágio de produção e mova o status sem sair do quadro.
        </p>
      </div>

      <PipelineFiltersBar filters={filters} onChange={onFiltersChange} onClear={onClearFilters} />

      <div className="overflow-x-auto pb-3">
        <div className="grid min-w-[72rem] auto-cols-[minmax(17rem,1fr)] grid-flow-col gap-4 lg:min-w-0 lg:grid-cols-5 lg:grid-flow-row">
          {statuses.map((status) => {
            const statusIdeas = filteredIdeas.filter((idea) => idea.status === status);
            return (
              <PipelineColumn key={status} status={status} ideas={statusIdeas}>
                {statusIdeas.length ? (
                  statusIdeas.map((idea) => (
                    <PipelineCard
                      key={idea.id}
                      idea={idea}
                      onOpen={onOpen}
                      onCopy={onCopy}
                      onToggleFavorite={onToggleFavorite}
                      onArchive={onArchive}
                      onStatusChange={onStatusChange}
                    />
                  ))
                ) : (
                  <EmptyState icon={Archive} title="Coluna vazia" description={emptyMessages[status]} compact />
                )}
              </PipelineColumn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PipelineFiltersBar({
  filters,
  onChange,
  onClear,
}: {
  filters: PipelineFilters;
  onChange: (filters: PipelineFilters) => void;
  onClear: () => void;
}) {
  return (
    <div className="surface rounded-lg p-4">
      <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(4,1fr)_auto_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            className="field pl-10"
            placeholder="Buscar no pipeline..."
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
          />
        </label>
        <select className="field" value={filters.ideaType} onChange={(event) => onChange({ ...filters, ideaType: event.target.value as PipelineFilters['ideaType'] })}>
          <option>Todos</option>
          {ideaTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="field" value={filters.channel} onChange={(event) => onChange({ ...filters, channel: event.target.value as PipelineFilters['channel'] })}>
          <option>Todos</option>
          {channels.map((channel) => <option key={channel}>{channel}</option>)}
        </select>
        <select className="field" value={filters.type} onChange={(event) => onChange({ ...filters, type: event.target.value as PipelineFilters['type'] })}>
          <option>Todos</option>
          {contentTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <select className="field" value={filters.priority} onChange={(event) => onChange({ ...filters, priority: event.target.value as PipelineFilters['priority'] })}>
          <option>Todas</option>
          {priorities.map((priority) => <option key={priority}>{priority}</option>)}
        </select>
        <button
          type="button"
          className={`btn ${filters.favoritesOnly ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
        >
          <Star size={17} /> Favoritos
        </button>
        <button type="button" className="btn btn-ghost" onClick={onClear}>
          <RotateCcw size={17} /> Limpar
        </button>
      </div>
    </div>
  );
}

function PipelineColumn({ status, ideas, children }: { status: IdeaStatus; ideas: Idea[]; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-slate-950/35">
      <div className="sticky top-0 z-10 border-b border-line bg-slate-950/90 p-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <Badge tone={statusTone(status)}>{status}</Badge>
          <span className="rounded-md border border-line bg-slate-900 px-2 py-1 text-xs font-bold text-slate-300">
            {ideas.length}
          </span>
        </div>
      </div>
      <div className="grid gap-3 p-3">{children}</div>
    </section>
  );
}

function PipelineCard({
  idea,
  onOpen,
  onCopy,
  onToggleFavorite,
  onArchive,
  onStatusChange,
}: {
  idea: Idea;
  onOpen: (id: string) => void;
  onCopy: (idea: Idea) => void;
  onToggleFavorite: (id: string) => void;
  onArchive: (id: string) => void;
  onStatusChange: (id: string, status: IdeaStatus) => void;
}) {
  return (
    <article className="rounded-lg border border-line bg-slate-950/75 p-3 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-white">{idea.title || 'Sem titulo'}</h3>
        {idea.favorite ? <Star className="shrink-0 fill-amber-300 text-amber-300" size={17} /> : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone={ideaTypeTone(idea.ideaType)}>{idea.ideaType}</Badge>
        <Badge tone="channel">{idea.channel}</Badge>
        <Badge tone="type">{idea.type}</Badge>
        <Badge tone={priorityTone(idea.priority)}>{idea.priority}</Badge>
        <PotentialScore idea={idea} compact />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {idea.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} tone="muted">#{tag}</Badge>
        ))}
        {!idea.tags.length ? <Badge tone="muted">sem tags</Badge> : null}
      </div>

      <p className="mt-3 text-xs text-slate-500">Atualizada: {formatDate(idea.updatedAt)}</p>

      <label className="mt-3 grid gap-1.5">
        <span className="label">Status</span>
        <select className="field py-2 text-xs" value={idea.status} onChange={(event) => onStatusChange(idea.id, event.target.value as IdeaStatus)}>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </label>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" className="btn btn-secondary px-2.5" onClick={() => onOpen(idea.id)}>
          <ExternalLink size={15} /> Abrir
        </button>
        <button type="button" className="btn btn-secondary px-2.5" onClick={() => onCopy(idea)}>
          <Copy size={15} /> Copiar
        </button>
        <button type="button" className="btn btn-secondary px-2.5" onClick={() => onToggleFavorite(idea.id)}>
          <Star size={15} className={idea.favorite ? 'fill-amber-300 text-amber-300' : ''} /> {idea.favorite ? 'Salvo' : 'Favorito'}
        </button>
        <button type="button" className="btn btn-secondary px-2.5" onClick={() => onArchive(idea.id)} disabled={idea.status === 'Arquivado'}>
          <Archive size={15} /> Arquivar
        </button>
      </div>
    </article>
  );
}

function filterPipelineIdeas(ideas: Idea[], filters: PipelineFilters) {
  const query = filters.query.trim().toLocaleLowerCase('pt-BR');

  return ideas.filter((idea) => {
    const searchable = [
      idea.title,
      idea.rawIdea,
      idea.audience,
      idea.hook,
      idea.promise,
      idea.notes,
      idea.tags.join(' '),
    ].join(' ').toLocaleLowerCase('pt-BR');

    return (
      (!query || searchable.includes(query)) &&
      (filters.channel === 'Todos' || idea.channel === filters.channel) &&
      (filters.type === 'Todos' || idea.type === filters.type) &&
      (filters.ideaType === 'Todos' || idea.ideaType === filters.ideaType) &&
      (filters.priority === 'Todas' || idea.priority === filters.priority) &&
      (!filters.favoritesOnly || idea.favorite)
    );
  });
}
