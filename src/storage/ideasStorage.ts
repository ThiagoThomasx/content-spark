import type { Idea } from '../types/idea';

export const IDEAS_STORAGE_KEY = 'content-spark:ideas';

function normalizeIdea(raw: unknown): Idea {
  const r = raw as Record<string, unknown>;
  return {
    ...r,
    ideaType: r.ideaType ?? 'Conteúdo',
    tags: Array.isArray(r.tags) ? r.tags : [],
  } as Idea;
}

export function loadIdeas(): Idea[] | null {
  try {
    const value = localStorage.getItem(IDEAS_STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(normalizeIdea) : null;
  } catch {
    return null;
  }
}

export function saveIdeas(ideas: Idea[]) {
  localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
}
