import { useEffect, useMemo, useState } from 'react';
import { loadIdeas, saveIdeas } from '../storage/ideasStorage';
import type { Idea, IdeaInput, IdeaStatus } from '../types/idea';
import { mockIdeas } from '../utils/mockIdeas';

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>(() => loadIdeas() ?? mockIdeas);

  useEffect(() => {
    saveIdeas(ideas);
  }, [ideas]);

  const sortedIdeas = useMemo(
    () => [...ideas].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [ideas],
  );

  function createIdea(input: IdeaInput) {
    const timestamp = new Date().toISOString();
    const idea: Idea = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setIdeas((current) => [idea, ...current]);
    return idea;
  }

  function updateIdea(id: string, input: IdeaInput) {
    const timestamp = new Date().toISOString();
    setIdeas((current) =>
      current.map((idea) => (idea.id === id ? { ...idea, ...input, updatedAt: timestamp } : idea)),
    );
  }

  function deleteIdea(id: string) {
    setIdeas((current) => current.filter((idea) => idea.id !== id));
  }

  function toggleFavorite(id: string) {
    const timestamp = new Date().toISOString();
    setIdeas((current) =>
      current.map((idea) =>
        idea.id === id ? { ...idea, favorite: !idea.favorite, updatedAt: timestamp } : idea,
      ),
    );
  }

  function updateStatus(id: string, status: IdeaStatus) {
    const timestamp = new Date().toISOString();
    setIdeas((current) =>
      current.map((idea) => (idea.id === id ? { ...idea, status, updatedAt: timestamp } : idea)),
    );
  }

  return { ideas: sortedIdeas, createIdea, updateIdea, deleteIdea, toggleFavorite, updateStatus };
}
