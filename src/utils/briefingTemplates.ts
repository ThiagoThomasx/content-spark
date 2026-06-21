import type { Idea, IdeaType } from '../types/idea';
import { calculatePotentialScore, classifyPotentialScore } from './score';

function v(value: string | undefined, fallback: string) {
  const t = value?.trim();
  return t || fallback;
}

function opt(label: string, value: string | undefined) {
  const t = value?.trim();
  return t ? `\n## ${label}\n${t}` : '';
}

function scoreBlock(idea: Idea) {
  const score = calculatePotentialScore(idea);
  const label = classifyPotentialScore(score);
  return `## Score\n${score}/25 — ${label}`;
}

// ── Conteúdo ──────────────────────────────────────────────────────────────
function conteudo(idea: Idea): string {
  return `# ${v(idea.title, '[definir título]')}

## Tipo de ideia
Conteúdo

## Status
${idea.status}

## Ideia bruta
${v(idea.rawIdea, '[descrever a ideia original]')}

## Público-alvo
${v(idea.audience, '[para quem é esse conteúdo?]')}

## Ângulo / Perspectiva única
${v(idea.angle, '[o que torna esse conteúdo diferente?]')}

## Promessa ao leitor/espectador
${v(idea.promise, '[o que a pessoa leva após consumir?]')}

## Gancho de abertura
${v(idea.hook, '[a primeira frase que prende atenção]')}${opt('Pontos-chave', idea.keyPoints)}

## Formato
${idea.type}

## Canal de publicação
${idea.channel}${opt('Referências e inspirações', idea.references)}

## Plano de execução
- Próxima ação: ${idea.nextAction?.trim() || '—'}
- Prioridade: ${idea.priority}
- Esforço: ${idea.effort || '—'}
- Prazo: ${idea.dueDate || '—'}${idea.checklist?.trim() ? `\n\n${idea.checklist.trim()}` : ''}

${scoreBlock(idea)}${opt('Notas', idea.notes)}
`;
}

// ── Projeto ────────────────────────────────────────────────────────────────
function projeto(idea: Idea): string {
  return `# ${v(idea.title, '[nome do projeto]')}

## Tipo de ideia
Projeto

## Status
${idea.status}

## Visão geral
${v(idea.rawIdea, '[descrever o projeto em uma ou duas frases]')}

## Problema que resolve
${v(idea.hook, '[qual dor ou oportunidade justifica esse projeto?]')}

## Proposta de valor / Objetivo
${v(idea.promise, '[o que será entregue ao final?]')}

## Público / Stakeholders
${v(idea.audience, '[quem é afetado ou beneficiado?]')}${opt('Ângulo / Diferencial', idea.angle)}${opt('Escopo e pontos-chave', idea.keyPoints)}${opt('Referências e benchmarks', idea.references)}

## Plano de execução
- Próxima ação: ${idea.nextAction?.trim() || '—'}
- Prioridade: ${idea.priority}
- Esforço: ${idea.effort || '—'}
- Prazo: ${idea.dueDate || '—'}${idea.checklist?.trim() ? `\n\n${idea.checklist.trim()}` : ''}

${scoreBlock(idea)}${opt('Notas', idea.notes)}
`;
}

// ── Feature ────────────────────────────────────────────────────────────────
function feature(idea: Idea): string {
  return `# ${v(idea.title, '[nome da feature]')}

## Tipo de ideia
Feature

## Status
${idea.status}

## Problema do usuário
${v(idea.rawIdea, '[qual problema ou fricção essa feature resolve?]')}

## Público / Persona afetada
${v(idea.audience, '[quem usa e se beneficia?]')}

## Solução proposta
${v(idea.promise, '[como a feature resolve o problema?]')}

## Motivação / Gatilho
${v(idea.hook, '[por que isso é urgente ou importante agora?]')}${opt('Ângulo técnico / produto', idea.angle)}${opt('Critérios de aceitação / pontos-chave', idea.keyPoints)}${opt('Referências e exemplos', idea.references)}

## Plano de execução
- Próxima ação: ${idea.nextAction?.trim() || '—'}
- Prioridade: ${idea.priority}
- Esforço: ${idea.effort || '—'}
- Prazo: ${idea.dueDate || '—'}${idea.checklist?.trim() ? `\n\n${idea.checklist.trim()}` : ''}

${scoreBlock(idea)}${opt('Notas', idea.notes)}
`;
}

// ── Produto ────────────────────────────────────────────────────────────────
function produto(idea: Idea): string {
  return `# ${v(idea.title, '[nome do produto]')}

## Tipo de ideia
Produto

## Status
${idea.status}

## Conceito
${v(idea.rawIdea, '[descrever o produto e sua essência]')}

## Público-alvo
${v(idea.audience, '[quem compra, usa ou se beneficia?]')}

## Proposta de valor
${v(idea.promise, '[por que este produto existe? o que entrega de único?]')}

## Diferencial / Posicionamento
${v(idea.angle, '[por que é melhor ou diferente das alternativas?]')}

## Problema central
${v(idea.hook, '[qual dor latente justifica a existência desse produto?]')}${opt('Funcionalidades / pontos-chave', idea.keyPoints)}${opt('Referências e concorrentes', idea.references)}

## Plano de execução
- Próxima ação: ${idea.nextAction?.trim() || '—'}
- Prioridade: ${idea.priority}
- Esforço: ${idea.effort || '—'}
- Prazo: ${idea.dueDate || '—'}${idea.checklist?.trim() ? `\n\n${idea.checklist.trim()}` : ''}

${scoreBlock(idea)}${opt('Notas', idea.notes)}
`;
}

// ── Campanha ───────────────────────────────────────────────────────────────
function campanha(idea: Idea): string {
  return `# ${v(idea.title, '[nome da campanha]')}

## Tipo de ideia
Campanha

## Status
${idea.status}

## Conceito da campanha
${v(idea.rawIdea, '[visão geral da campanha]')}

## Público / Segmento-alvo
${v(idea.audience, '[quem deve ser alcançado?]')}

## Mensagem central
${v(idea.promise, '[qual é a promessa ou proposta da campanha?]')}

## Gancho criativo / Conceito central
${v(idea.hook, '[a ideia criativa que une a campanha]')}${opt('Ângulo e tom de voz', idea.angle)}

## Canal principal
${idea.channel}${opt('Pontos-chave e execuções previstas', idea.keyPoints)}${opt('Referências e inspirações', idea.references)}

## Plano de execução
- Próxima ação: ${idea.nextAction?.trim() || '—'}
- Prioridade: ${idea.priority}
- Esforço: ${idea.effort || '—'}
- Prazo: ${idea.dueDate || '—'}${idea.checklist?.trim() ? `\n\n${idea.checklist.trim()}` : ''}

${scoreBlock(idea)}${opt('Notas', idea.notes)}
`;
}

// ── Estudo ─────────────────────────────────────────────────────────────────
function estudo(idea: Idea): string {
  return `# ${v(idea.title, '[título do estudo / pesquisa]')}

## Tipo de ideia
Estudo

## Status
${idea.status}

## Pergunta principal
${v(idea.rawIdea, '[qual questão esse estudo pretende responder?]')}

## Público interessado
${v(idea.audience, '[quem se beneficia desse aprendizado?]')}

## Hipótese inicial
${v(idea.hook, '[qual é a sua suposição antes de pesquisar?]')}

## Aprendizado esperado / Entrega
${v(idea.promise, '[o que você vai saber ou produzir ao final?]')}${opt('Ângulo / Abordagem', idea.angle)}${opt('Pontos-chave a investigar', idea.keyPoints)}${opt('Fontes e referências', idea.references)}

## Plano de execução
- Próxima ação: ${idea.nextAction?.trim() || '—'}
- Prioridade: ${idea.priority}
- Esforço: ${idea.effort || '—'}
- Prazo: ${idea.dueDate || '—'}${idea.checklist?.trim() ? `\n\n${idea.checklist.trim()}` : ''}

${scoreBlock(idea)}${opt('Notas', idea.notes)}
`;
}

// ── Pessoal ────────────────────────────────────────────────────────────────
function pessoal(idea: Idea): string {
  return `# ${v(idea.title, '[título pessoal]')}

## Tipo de ideia
Pessoal

## Status
${idea.status}

## Contexto / Reflexão
${v(idea.rawIdea, '[o que você está pensando ou sentindo sobre isso?]')}

## Motivação
${v(idea.hook, '[por que isso importa para você agora?]')}

## Objetivo pessoal
${v(idea.promise, '[o que você quer alcançar ou sentir?]')}${opt('Ângulo / Perspectiva', idea.angle)}${opt('Pontos a explorar', idea.keyPoints)}${opt('Referências', idea.references)}

## Próximos passos
- Próxima ação: ${idea.nextAction?.trim() || '—'}
- Prioridade: ${idea.priority}
- Esforço: ${idea.effort || '—'}
- Prazo: ${idea.dueDate || '—'}${idea.checklist?.trim() ? `\n\n${idea.checklist.trim()}` : ''}

${scoreBlock(idea)}${opt('Notas', idea.notes)}
`;
}

// ── Outro / Universal ──────────────────────────────────────────────────────
function universal(idea: Idea): string {
  return `# ${v(idea.title, '[definir título]')}

## Tipo de ideia
${idea.ideaType}

## Status
${idea.status}

## Ideia bruta
${v(idea.rawIdea, '[desenvolver contexto]')}

## Público / Usuário
${v(idea.audience, '[definir público-alvo]')}

## Promessa / Valor
${v(idea.promise, '[definir promessa]')}${opt('Ângulo principal', idea.angle)}

## Gancho
${v(idea.hook, '[criar gancho forte]')}${opt('Pontos-chave', idea.keyPoints)}

## Formato
${idea.type}

## Canal
${idea.channel}${opt('Referências', idea.references)}

## Plano de execução
- Próxima ação: ${idea.nextAction?.trim() || '—'}
- Prioridade: ${idea.priority}
- Esforço: ${idea.effort || '—'}
- Prazo: ${idea.dueDate || '—'}${idea.checklist?.trim() ? `\n\n${idea.checklist.trim()}` : ''}

${scoreBlock(idea)}${opt('Notas', idea.notes)}
`;
}

const templateMap: Record<IdeaType, (idea: Idea) => string> = {
  'Conteúdo': conteudo,
  'Projeto': projeto,
  'Feature': feature,
  'Produto': produto,
  'Campanha': campanha,
  'Estudo': estudo,
  'Pessoal': pessoal,
  'Outro': universal,
};

export function generateBriefingByType(idea: Idea): string {
  const fn = templateMap[idea.ideaType] ?? universal;
  return fn(idea);
}

// Field labels/placeholders adapted per idea type for the form UI
export type BriefingFieldConfig = {
  audienceLabel: string;
  audiencePlaceholder: string;
  hookLabel: string;
  hookPlaceholder: string;
  promiseLabel: string;
  promisePlaceholder: string;
  angleLabel: string;
  anglePlaceholder: string;
  keyPointsLabel: string;
  keyPointsPlaceholder: string;
  referencesLabel: string;
  referencesSectionTitle: string;
  templateBadge: string;
};

export const briefingFieldConfigs: Record<IdeaType, BriefingFieldConfig> = {
  'Conteúdo': {
    audienceLabel: 'Público-alvo',
    audiencePlaceholder: 'Para quem é esse conteúdo?',
    hookLabel: 'Gancho de abertura',
    hookPlaceholder: 'A primeira frase que prende atenção',
    promiseLabel: 'Promessa ao leitor/espectador',
    promisePlaceholder: 'O que a pessoa leva após consumir?',
    angleLabel: 'Ângulo / Perspectiva única',
    anglePlaceholder: 'O que torna esse conteúdo diferente?',
    keyPointsLabel: 'Pontos-chave',
    keyPointsPlaceholder: 'Os principais pontos que o conteúdo deve cobrir',
    referencesLabel: 'Referências e inspirações',
    referencesSectionTitle: 'Referências',
    templateBadge: 'Template: Conteúdo',
  },
  'Projeto': {
    audienceLabel: 'Público / Stakeholders',
    audiencePlaceholder: 'Quem é afetado ou beneficiado?',
    hookLabel: 'Problema que resolve',
    hookPlaceholder: 'Qual dor ou oportunidade justifica esse projeto?',
    promiseLabel: 'Proposta de valor / Objetivo',
    promisePlaceholder: 'O que será entregue ao final?',
    angleLabel: 'Ângulo / Diferencial',
    anglePlaceholder: 'O que diferencia esse projeto?',
    keyPointsLabel: 'Escopo e pontos-chave',
    keyPointsPlaceholder: 'O que está dentro e fora do escopo?',
    referencesLabel: 'Referências e benchmarks',
    referencesSectionTitle: 'Referências',
    templateBadge: 'Template: Projeto',
  },
  'Feature': {
    audienceLabel: 'Público / Persona afetada',
    audiencePlaceholder: 'Quem usa e se beneficia?',
    hookLabel: 'Motivação / Gatilho',
    hookPlaceholder: 'Por que isso é urgente ou importante agora?',
    promiseLabel: 'Solução proposta',
    promisePlaceholder: 'Como a feature resolve o problema?',
    angleLabel: 'Ângulo técnico / produto',
    anglePlaceholder: 'Abordagem técnica ou de produto',
    keyPointsLabel: 'Critérios de aceitação',
    keyPointsPlaceholder: 'O que define que a feature está pronta?',
    referencesLabel: 'Referências e exemplos',
    referencesSectionTitle: 'Referências',
    templateBadge: 'Template: Feature',
  },
  'Produto': {
    audienceLabel: 'Público-alvo',
    audiencePlaceholder: 'Quem compra, usa ou se beneficia?',
    hookLabel: 'Problema central',
    hookPlaceholder: 'Qual dor latente justifica a existência desse produto?',
    promiseLabel: 'Proposta de valor',
    promisePlaceholder: 'Por que este produto existe? O que entrega de único?',
    angleLabel: 'Diferencial / Posicionamento',
    anglePlaceholder: 'Por que é melhor ou diferente das alternativas?',
    keyPointsLabel: 'Funcionalidades / pontos-chave',
    keyPointsPlaceholder: 'Principais funcionalidades ou características',
    referencesLabel: 'Referências e concorrentes',
    referencesSectionTitle: 'Concorrentes',
    templateBadge: 'Template: Produto',
  },
  'Campanha': {
    audienceLabel: 'Público / Segmento-alvo',
    audiencePlaceholder: 'Quem deve ser alcançado?',
    hookLabel: 'Gancho criativo / Conceito central',
    hookPlaceholder: 'A ideia criativa que une a campanha',
    promiseLabel: 'Mensagem central',
    promisePlaceholder: 'Qual é a promessa ou proposta da campanha?',
    angleLabel: 'Ângulo e tom de voz',
    anglePlaceholder: 'Tom, estilo e abordagem criativa',
    keyPointsLabel: 'Execuções previstas',
    keyPointsPlaceholder: 'Quais peças e formatos a campanha inclui?',
    referencesLabel: 'Referências e inspirações',
    referencesSectionTitle: 'Referências',
    templateBadge: 'Template: Campanha',
  },
  'Estudo': {
    audienceLabel: 'Público interessado',
    audiencePlaceholder: 'Quem se beneficia desse aprendizado?',
    hookLabel: 'Hipótese inicial',
    hookPlaceholder: 'Qual é a sua suposição antes de pesquisar?',
    promiseLabel: 'Aprendizado esperado / Entrega',
    promisePlaceholder: 'O que você vai saber ou produzir ao final?',
    angleLabel: 'Ângulo / Abordagem',
    anglePlaceholder: 'Como você vai conduzir a pesquisa?',
    keyPointsLabel: 'Pontos-chave a investigar',
    keyPointsPlaceholder: 'Quais aspectos precisam ser pesquisados?',
    referencesLabel: 'Fontes e referências',
    referencesSectionTitle: 'Fontes',
    templateBadge: 'Template: Estudo',
  },
  'Pessoal': {
    audienceLabel: 'Contexto / Para quem',
    audiencePlaceholder: 'É para você ou envolve outras pessoas?',
    hookLabel: 'Motivação',
    hookPlaceholder: 'Por que isso importa para você agora?',
    promiseLabel: 'Objetivo pessoal',
    promisePlaceholder: 'O que você quer alcançar ou sentir?',
    angleLabel: 'Ângulo / Perspectiva',
    anglePlaceholder: 'Como você está enxergando isso?',
    keyPointsLabel: 'Pontos a explorar',
    keyPointsPlaceholder: 'O que você quer pensar ou explorar?',
    referencesLabel: 'Referências',
    referencesSectionTitle: 'Referências',
    templateBadge: 'Template: Pessoal',
  },
  'Outro': {
    audienceLabel: 'Público / Usuário',
    audiencePlaceholder: 'Para quem isso existe?',
    hookLabel: 'Gancho',
    hookPlaceholder: 'A primeira frase que puxa atenção',
    promiseLabel: 'Promessa / Valor',
    promisePlaceholder: 'O que a pessoa leva depois de consumir?',
    angleLabel: 'Ângulo principal',
    anglePlaceholder: 'O diferencial ou perspectiva única',
    keyPointsLabel: 'Pontos-chave',
    keyPointsPlaceholder: 'Os principais pontos que a ideia deve cobrir',
    referencesLabel: 'Referências',
    referencesSectionTitle: 'Referências',
    templateBadge: 'Template: Universal',
  },
};
