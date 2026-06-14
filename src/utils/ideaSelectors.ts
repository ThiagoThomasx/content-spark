import type { Idea } from '../types/idea';

const STALE_DAYS = 7;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function getExecutionIdeas(ideas: Idea[]) {
  return [...ideas]
    .filter((idea) => idea.status === 'Pronto para produzir' || idea.priority === 'Alta')
    .sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, 3);
}

export function getStaleIdeas(ideas: Idea[], referenceDate = new Date()) {
  const staleBefore = referenceDate.getTime() - STALE_DAYS * ONE_DAY_MS;

  return [...ideas]
    .filter((idea) => {
      const updatedAt = new Date(idea.updatedAt).getTime();
      return (idea.status === 'Ideia' || idea.status === 'Rascunho') && updatedAt < staleBefore;
    })
    .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
}

export function isFilteringActive(filters: {
  query: string;
  status: string;
  channel: string;
  type: string;
  priority: string;
  favoritesOnly: boolean;
}) {
  return (
    Boolean(filters.query.trim()) ||
    filters.status !== 'Todos' ||
    filters.channel !== 'Todos' ||
    filters.type !== 'Todos' ||
    filters.priority !== 'Todas' ||
    filters.favoritesOnly
  );
}
