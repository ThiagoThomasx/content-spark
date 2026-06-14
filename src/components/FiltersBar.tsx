import { RotateCcw, Search, Star } from 'lucide-react';
import { channels, contentTypes, priorities, sortOptions, statuses, type Filters } from '../types/idea';

type FiltersBarProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
};

export function FiltersBar({ filters, onChange, onClear }: FiltersBarProps) {
  return (
    <div className="surface rounded-lg p-4">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(5,1fr)_auto_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            className="field pl-10"
            placeholder="Buscar por titulo, ideia, tags..."
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
          />
        </label>
        <select className="field" value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value as Filters['status'] })}>
          <option>Todos</option>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
        <select className="field" value={filters.channel} onChange={(event) => onChange({ ...filters, channel: event.target.value as Filters['channel'] })}>
          <option>Todos</option>
          {channels.map((channel) => <option key={channel}>{channel}</option>)}
        </select>
        <select className="field" value={filters.type} onChange={(event) => onChange({ ...filters, type: event.target.value as Filters['type'] })}>
          <option>Todos</option>
          {contentTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <select className="field" value={filters.priority} onChange={(event) => onChange({ ...filters, priority: event.target.value as Filters['priority'] })}>
          <option>Todas</option>
          {priorities.map((priority) => <option key={priority}>{priority}</option>)}
        </select>
        <select className="field" value={filters.sortBy} onChange={(event) => onChange({ ...filters, sortBy: event.target.value as Filters['sortBy'] })}>
          {sortOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
        <button
          type="button"
          className={`btn ${filters.favoritesOnly ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
          title="Filtrar favoritos"
        >
          <Star size={17} /> Favoritos
        </button>
        <button type="button" className="btn btn-ghost" onClick={onClear} title="Limpar filtros">
          <RotateCcw size={17} /> Limpar
        </button>
      </div>
    </div>
  );
}
