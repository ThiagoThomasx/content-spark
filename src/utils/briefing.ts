import type { Idea } from '../types/idea';
import { generateBriefingByType } from './briefingTemplates';

export function generateBriefing(idea: Idea) {
  return generateBriefingByType(idea);
}
