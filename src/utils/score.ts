import type { Idea, PotentialCriteria, Priority } from '../types/idea';

export const DEFAULT_CRITERIA_VALUE = 3;
export const SCORE_MAX = 25;

export const potentialCriteriaLabels: Array<{ key: keyof PotentialCriteria; label: string }> = [
  { key: 'expectedImpact', label: 'Impacto esperado' },
  { key: 'executionEase', label: 'Facilidade de execucao' },
  { key: 'ideaClarity', label: 'Clareza da ideia' },
  { key: 'reusePotential', label: 'Potencial de reaproveitamento' },
  { key: 'urgency', label: 'Urgencia' },
];

const priorityRank: Record<Priority, number> = {
  Baixa: 1,
  Media: 2,
  Alta: 3,
};

export function normalizeCriteriaValue(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return DEFAULT_CRITERIA_VALUE;
  return Math.min(5, Math.max(1, Math.round(numberValue)));
}

export function getPotentialCriteria(idea: PotentialCriteria): Required<PotentialCriteria> {
  return {
    expectedImpact: normalizeCriteriaValue(idea.expectedImpact),
    executionEase: normalizeCriteriaValue(idea.executionEase),
    ideaClarity: normalizeCriteriaValue(idea.ideaClarity),
    reusePotential: normalizeCriteriaValue(idea.reusePotential),
    urgency: normalizeCriteriaValue(idea.urgency),
  };
}

export function calculatePotentialScore(idea: PotentialCriteria) {
  const criteria = getPotentialCriteria(idea);
  return Object.values(criteria).reduce((total, value) => total + value, 0);
}

export function classifyPotentialScore(score: number) {
  if (score >= 21) return 'Prioridade maxima';
  if (score >= 16) return 'Boa aposta';
  if (score >= 11) return 'Media prioridade';
  return 'Baixa prioridade';
}

export function getPotentialScoreDetails(idea: PotentialCriteria) {
  const score = calculatePotentialScore(idea);
  return {
    score,
    maxScore: SCORE_MAX,
    classification: classifyPotentialScore(score),
    criteria: getPotentialCriteria(idea),
  };
}

export function getTopPotentialIdeas(ideas: Idea[], limit = 5) {
  return [...ideas]
    .filter((idea) => idea.status !== 'Arquivado')
    .sort((a, b) => {
      const scoreDifference = calculatePotentialScore(b) - calculatePotentialScore(a);
      if (scoreDifference !== 0) return scoreDifference;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, limit);
}

export function compareByPriority(a: Idea, b: Idea) {
  const priorityDifference = priorityRank[b.priority] - priorityRank[a.priority];
  if (priorityDifference !== 0) return priorityDifference;
  return calculatePotentialScore(b) - calculatePotentialScore(a);
}
