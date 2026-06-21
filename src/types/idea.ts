export const ideaTypes = ['Conteúdo', 'Projeto', 'Feature', 'Campanha', 'Estudo', 'Produto', 'Pessoal', 'Outro'] as const;
export const contentTypes = ['Post', 'Video', 'Thread', 'Review', 'Roteiro', 'Produto', 'Outro'] as const;
export const channels = ['LinkedIn', 'TikTok', 'YouTube', 'X/Twitter', 'Blog', 'Letterboxd', 'Instagram', 'Outro'] as const;
export const statuses = ['Ideia', 'Rascunho', 'Pronto para produzir', 'Publicado', 'Arquivado'] as const;
export const priorities = ['Baixa', 'Media', 'Alta'] as const;
export const efforts = ['Baixo', 'Médio', 'Alto'] as const;
export const sortOptions = ['Mais recentes', 'Maior score', 'Menor score', 'Maior prioridade', 'Data de atualizacao'] as const;

export type IdeaType = (typeof ideaTypes)[number];
export type ContentType = (typeof contentTypes)[number];
export type Channel = (typeof channels)[number];
export type IdeaStatus = (typeof statuses)[number];
export type Priority = (typeof priorities)[number];
export type Effort = (typeof efforts)[number];
export type SortOption = (typeof sortOptions)[number];

export type PotentialCriteria = {
  expectedImpact?: number;
  executionEase?: number;
  ideaClarity?: number;
  reusePotential?: number;
  urgency?: number;
};

export type Idea = PotentialCriteria & {
  id: string;
  title: string;
  rawIdea: string;
  ideaType: IdeaType;
  type: ContentType;
  channel: Channel;
  audience: string;
  hook: string;
  promise: string;
  notes: string;
  status: IdeaStatus;
  priority: Priority;
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  // Brief fields
  angle?: string;
  keyPoints?: string;
  references?: string;
  // Execution fields
  nextAction?: string;
  effort?: Effort;
  dueDate?: string;
  checklist?: string;
  briefingTemplate?: string;
};

export type IdeaInput = Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>;

export type Filters = {
  query: string;
  status: 'Todos' | IdeaStatus;
  channel: 'Todos' | Channel;
  type: 'Todos' | ContentType;
  ideaType: 'Todos' | IdeaType;
  priority: 'Todas' | Priority;
  sortBy: SortOption;
  favoritesOnly: boolean;
};
