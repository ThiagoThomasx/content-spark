import type { Idea } from '../types/idea';
import { generateOutput } from './outputTemplates';

export function generateBriefing(idea: Idea) {
  return generateOutput(idea, 'briefingCompleto');
}
