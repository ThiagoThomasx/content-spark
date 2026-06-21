import type { BadgeTone } from '../components/Badge';
import type { IdeaStatus, IdeaType, Priority } from '../types/idea';

export function statusTone(status: IdeaStatus): BadgeTone {
  const tones: Record<IdeaStatus, BadgeTone> = {
    Ideia: 'idea',
    Rascunho: 'draft',
    'Pronto para produzir': 'ready',
    Publicado: 'published',
    Arquivado: 'archived',
  };
  return tones[status];
}

export function priorityTone(priority: Priority): BadgeTone {
  const tones: Record<Priority, BadgeTone> = {
    Baixa: 'low',
    Media: 'medium',
    Alta: 'high',
  };
  return tones[priority];
}

export function ideaTypeTone(_ideaType: IdeaType): BadgeTone {
  return 'category';
}
