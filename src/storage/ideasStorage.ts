import type { Idea } from '../types/idea';

export const IDEAS_STORAGE_KEY = 'content-spark:ideas';

export function loadIdeas(): Idea[] | null {
  try {
    const value = localStorage.getItem(IDEAS_STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveIdeas(ideas: Idea[]) {
  localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
}
