import type { Idea } from '../types/idea';

export type OutputFormat =
  | 'briefingCompleto'
  | 'linkedinPost'
  | 'videoScript'
  | 'xThread'
  | 'aiPrompt'
  | 'productionChecklist';

type IdeaText = {
  title: string;
  rawIdea: string;
  type: string;
  channel: string;
  audience: string;
  hook: string;
  promise: string;
  notes: string;
  status: string;
  priority: string;
  tags: string;
  context: string;
  cta: string;
};

const PLACEHOLDERS = {
  title: '[definir titulo]',
  rawIdea: '[desenvolver contexto]',
  audience: '[definir publico-alvo]',
  hook: '[criar gancho forte]',
  promise: '[definir promessa]',
  notes: '[adicionar notas de desenvolvimento]',
  tags: '[definir tags]',
  context: '[desenvolver contexto]',
  development: '[desenvolvimento em blocos curtos]',
  conclusion: '[conclusao/reflexao]',
  cta: '[CTA leve]',
  tension: '[problema ou tensao]',
  learning: '[aprendizado ou conclusao]',
};

function valueOrPlaceholder(value: string | undefined, placeholder: string) {
  const normalized = value?.trim();
  return normalized ? normalized : placeholder;
}

function normalizeIdea(idea: Idea): IdeaText {
  const title = valueOrPlaceholder(idea.title, PLACEHOLDERS.title);
  const rawIdea = valueOrPlaceholder(idea.rawIdea, PLACEHOLDERS.rawIdea);

  return {
    title,
    rawIdea,
    type: idea.type,
    channel: idea.channel,
    audience: valueOrPlaceholder(idea.audience, PLACEHOLDERS.audience),
    hook: valueOrPlaceholder(idea.hook, PLACEHOLDERS.hook),
    promise: valueOrPlaceholder(idea.promise, PLACEHOLDERS.promise),
    notes: valueOrPlaceholder(idea.notes, PLACEHOLDERS.notes),
    status: idea.status,
    priority: idea.priority,
    tags: idea.tags.length ? idea.tags.map((tag) => `#${tag}`).join(' ') : PLACEHOLDERS.tags,
    context: rawIdea,
    cta: PLACEHOLDERS.cta,
  };
}

function briefingCompleto(idea: Idea) {
  const text = normalizeIdea(idea);

  return `# ${text.title}

## Ideia central
${text.rawIdea}

## Tipo de conteudo
${text.type}

## Canal
${text.channel}

## Publico-alvo
${text.audience}

## Gancho
${text.hook}

## Promessa
${text.promise}

## Notas de desenvolvimento
${text.notes}

## Tags
${text.tags}

## Status
${text.status}
`;
}

function linkedinPost(idea: Idea) {
  const text = normalizeIdea(idea);

  return `${text.hook}

${text.context}

${PLACEHOLDERS.development}

${PLACEHOLDERS.conclusion}

${text.cta}
`;
}

function videoScript(idea: Idea) {
  const text = normalizeIdea(idea);

  return `Titulo:
${text.title}

Abertura:
${text.hook}

Contexto:
${text.rawIdea}

Desenvolvimento:
- Ponto 1
- Ponto 2
- Ponto 3

Fechamento:
${text.promise}

CTA:
${text.cta}
`;
}

function xThread(idea: Idea) {
  const text = normalizeIdea(idea);

  return `Tweet 1:
${text.hook}

Tweet 2:
${text.context}

Tweet 3:
${PLACEHOLDERS.tension}

Tweet 4:
${PLACEHOLDERS.development}

Tweet 5:
${PLACEHOLDERS.learning}

Tweet 6:
${text.cta}
`;
}

function aiPrompt(idea: Idea) {
  const text = normalizeIdea(idea);

  return `Quero transformar a seguinte ideia em um conteudo mais forte.

Contexto da ideia:
${text.title}

${text.rawIdea}

Canal:
${text.channel}

Tipo de conteudo:
${text.type}

Publico-alvo:
${text.audience}

Gancho inicial:
${text.hook}

Promessa:
${text.promise}

Notas adicionais:
${text.notes}

Tarefa:
Crie uma versao mais forte desse conteudo, mantendo minha ideia central, melhorando clareza, estrutura, profundidade e impacto. Nao invente dados especificos. Quando faltar informacao, sinalize como sugestao.

Entregue:
1. Uma versao refinada
2. Uma versao mais curta
3. 3 opcoes de gancho
4. 3 opcoes de CTA
5. Pontos que precisam de mais pesquisa
`;
}

function productionChecklist(idea: Idea) {
  const text = normalizeIdea(idea);

  return `Antes de produzir:
- [ ] A ideia central esta clara?
- [ ] O publico-alvo esta definido?
- [ ] O gancho esta forte?
- [ ] A promessa esta objetiva?
- [ ] Existe um exemplo ou historia para sustentar?
- [ ] O CTA esta claro?
- [ ] O formato escolhido combina com o canal?
- [ ] O conteudo pode ser reaproveitado em outro canal?

Dados da ideia:
- Titulo: ${text.title}
- Canal: ${text.channel}
- Tipo: ${text.type}
- Prioridade: ${text.priority}
- Tags: ${text.tags}
`;
}

export const outputTemplates: Record<OutputFormat, (idea: Idea) => string> = {
  briefingCompleto,
  linkedinPost,
  videoScript,
  xThread,
  aiPrompt,
  productionChecklist,
};

export function generateOutput(idea: Idea, format: OutputFormat) {
  return outputTemplates[format](idea);
}

export function generateAllOutputs(idea: Idea) {
  return {
    briefingCompleto: briefingCompleto(idea),
    linkedinPost: linkedinPost(idea),
    videoScript: videoScript(idea),
    xThread: xThread(idea),
    aiPrompt: aiPrompt(idea),
    productionChecklist: productionChecklist(idea),
  };
}
