import type { Idea } from '../types/idea';
import { calculatePotentialScore } from './score';

const STALE_DAYS = 7;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type ReviewReason =
  | 'Sem próxima ação'
  | 'Sem score'
  | 'Sem template'
  | 'Parada há 7+ dias'
  | 'Ainda como ideia inicial';

function isReviewable(idea: Idea) {
  return idea.status !== 'Publicado' && idea.status !== 'Arquivado';
}

function isStale(idea: Idea, refDate = new Date()) {
  const staleBefore = refDate.getTime() - STALE_DAYS * ONE_DAY_MS;
  const updatedAt = new Date(idea.updatedAt ?? idea.createdAt).getTime();
  return updatedAt < staleBefore;
}

function isStuckAsIdeia(idea: Idea, refDate = new Date()) {
  if (idea.status !== 'Ideia') return false;
  const staleBefore = refDate.getTime() - STALE_DAYS * ONE_DAY_MS;
  const createdAt = new Date(idea.createdAt).getTime();
  return createdAt < staleBefore;
}

export function getReviewReasons(idea: Idea, refDate = new Date()): ReviewReason[] {
  const reasons: ReviewReason[] = [];
  if (!idea.nextAction?.trim()) reasons.push('Sem próxima ação');
  if (calculatePotentialScore(idea) <= 10) reasons.push('Sem score');
  if (!idea.briefingTemplate) reasons.push('Sem template');
  if (isStale(idea, refDate)) reasons.push('Parada há 7+ dias');
  if (isStuckAsIdeia(idea, refDate)) reasons.push('Ainda como ideia inicial');
  return reasons;
}

export function needsReview(idea: Idea, refDate = new Date()): boolean {
  if (!isReviewable(idea)) return false;
  return getReviewReasons(idea, refDate).length > 0;
}

export function getIdeasNeedingReview(ideas: Idea[], refDate = new Date()): Idea[] {
  return [...ideas]
    .filter((idea) => needsReview(idea, refDate))
    .sort((a, b) => {
      // Oldest updatedAt first
      const tA = new Date(a.updatedAt ?? a.createdAt).getTime();
      const tB = new Date(b.updatedAt ?? b.createdAt).getTime();
      if (tA !== tB) return tA - tB;
      // Missing nextAction
      const naA = !a.nextAction?.trim() ? 0 : 1;
      const naB = !b.nextAction?.trim() ? 0 : 1;
      if (naA !== naB) return naA - naB;
      // Missing score
      const sA = calculatePotentialScore(a) <= 10 ? 0 : 1;
      const sB = calculatePotentialScore(b) <= 10 ? 0 : 1;
      if (sA !== sB) return sA - sB;
      // Missing template
      const tpA = !a.briefingTemplate ? 0 : 1;
      const tpB = !b.briefingTemplate ? 0 : 1;
      if (tpA !== tpB) return tpA - tpB;
      // Status Ideia
      const stA = a.status === 'Ideia' ? 0 : 1;
      const stB = b.status === 'Ideia' ? 0 : 1;
      return stA - stB;
    });
}

export function getBacklogHealth(ideas: Idea[], refDate = new Date()): number {
  const active = ideas.filter(isReviewable);
  if (active.length === 0) return 100;

  let score = 100;

  // -5 per idea without nextAction, cap 25
  const noAction = active.filter((i) => !i.nextAction?.trim()).length;
  score -= Math.min(noAction * 5, 25);

  // -5 per idea without score/potential (score <= 10 means unconfigured)
  const noScore = active.filter((i) => calculatePotentialScore(i) <= 10).length;
  score -= Math.min(noScore * 5, 20);

  // -5 per idea stalled 7+ days, cap 25
  const stale = active.filter((i) => isStale(i, refDate)).length;
  score -= Math.min(stale * 5, 25);

  // -3 per idea still "Ideia" for 7+ days, cap 15
  const stuckIdeia = active.filter((i) => isStuckAsIdeia(i, refDate)).length;
  score -= Math.min(stuckIdeia * 3, 15);

  // -2 per idea without briefingTemplate, cap 10
  const noTemplate = active.filter((i) => !i.briefingTemplate).length;
  score -= Math.min(noTemplate * 2, 10);

  return Math.max(0, Math.min(100, score));
}

export function getBacklogHealthLabel(health: number): string {
  if (health >= 80) return 'Backlog saudável';
  if (health >= 60) return 'Atenção moderada';
  return 'Backlog precisa de revisão';
}
