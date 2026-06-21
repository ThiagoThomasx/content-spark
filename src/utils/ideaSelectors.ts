import type { Idea } from '../types/idea';
import { calculatePotentialScore } from './score';

const STALE_DAYS = 7;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isActive(idea: Idea) {
  return idea.status !== 'Publicado' && idea.status !== 'Arquivado';
}

export type StalledReason = 'Sem próxima ação' | 'Sem score' | 'Sem template' | 'Sem atualização há 7 dias';

export function getStalledReason(idea: Idea, referenceDate = new Date()): StalledReason {
  const staleBefore = referenceDate.getTime() - STALE_DAYS * ONE_DAY_MS;
  const updatedAt = new Date(idea.updatedAt ?? idea.createdAt).getTime();
  if (updatedAt < staleBefore) return 'Sem atualização há 7 dias';
  if (!idea.nextAction?.trim()) return 'Sem próxima ação';
  if (calculatePotentialScore(idea) <= 10) return 'Sem score';
  if (!idea.briefingTemplate) return 'Sem template';
  return 'Sem próxima ação';
}

export function getActionQueueIdeas(ideas: Idea[]): Idea[] {
  const priorityOrder: Record<string, number> = { Alta: 0, Media: 1, Baixa: 2 };

  return [...ideas]
    .filter(
      (idea) =>
        isActive(idea) &&
        (idea.status === 'Pronto para produzir' ||
          idea.priority === 'Alta' ||
          calculatePotentialScore(idea) >= 19 ||
          idea.favorite === true ||
          Boolean(idea.nextAction?.trim())),
    )
    .sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      const pa = priorityOrder[a.priority] ?? 1;
      const pb = priorityOrder[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      const sa = calculatePotentialScore(a);
      const sb = calculatePotentialScore(b);
      if (sa !== sb) return sb - sa;
      const na = Boolean(a.nextAction?.trim());
      const nb = Boolean(b.nextAction?.trim());
      if (na !== nb) return na ? -1 : 1;
      return new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime();
    })
    .slice(0, 5);
}

// Kept for backward compat
export function getExecutionIdeas(ideas: Idea[]) {
  return getActionQueueIdeas(ideas);
}

export function getStaleIdeas(ideas: Idea[], referenceDate = new Date()) {
  const staleBefore = referenceDate.getTime() - STALE_DAYS * ONE_DAY_MS;

  return [...ideas]
    .filter((idea) => {
      if (!isActive(idea)) return false;
      const updatedAt = new Date(idea.updatedAt ?? idea.createdAt).getTime();
      return updatedAt < staleBefore;
    })
    .sort((a, b) => new Date(a.updatedAt ?? a.createdAt).getTime() - new Date(b.updatedAt ?? b.createdAt).getTime());
}

export function isFilteringActive(filters: {
  query: string;
  status: string;
  channel: string;
  type: string;
  ideaType?: string;
  priority: string;
  favoritesOnly: boolean;
}) {
  return (
    Boolean(filters.query.trim()) ||
    filters.status !== 'Todos' ||
    filters.channel !== 'Todos' ||
    filters.type !== 'Todos' ||
    (filters.ideaType != null && filters.ideaType !== 'Todos') ||
    filters.priority !== 'Todas' ||
    filters.favoritesOnly
  );
}
