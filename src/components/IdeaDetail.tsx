import { useState } from 'react';
import type { ReactNode } from 'react';
import { Archive, ChevronDown, ChevronUp, Copy, Save, Star, Trash2, Undo2 } from 'lucide-react';
import {
  channels,
  contentTypes,
  efforts,
  ideaTypes,
  priorities,
  statuses,
  type Channel,
  type ContentType,
  type Effort,
  type Idea,
  type IdeaInput,
  type IdeaStatus,
  type IdeaType,
  type Priority,
} from '../types/idea';
import { Badge } from './Badge';
import { OutputFormatsPanel } from './OutputFormatsPanel';
import { ideaTypeTone, statusTone } from '../utils/badges';
import { formatDate } from '../utils/date';
import { classifyPotentialScore, calculatePotentialScore, potentialCriteriaLabels } from '../utils/score';
import { copyText } from '../utils/clipboard';
import { generateBriefing } from '../utils/briefing';
import { briefingFieldConfigs } from '../utils/briefingTemplates';

type FormState = {
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
  tagsInput: string;
  favorite: boolean;
  expectedImpact: number;
  executionEase: number;
  ideaClarity: number;
  reusePotential: number;
  urgency: number;
  angle: string;
  keyPoints: string;
  references: string;
  nextAction: string;
  effort: Effort | '';
  dueDate: string;
  checklist: string;
};

function ideaToFormState(idea: Idea): FormState {
  return {
    title: idea.title,
    rawIdea: idea.rawIdea,
    ideaType: idea.ideaType,
    type: idea.type,
    channel: idea.channel,
    audience: idea.audience,
    hook: idea.hook,
    promise: idea.promise,
    notes: idea.notes,
    status: idea.status,
    priority: idea.priority,
    tagsInput: idea.tags.join(', '),
    favorite: idea.favorite,
    expectedImpact: idea.expectedImpact ?? 3,
    executionEase: idea.executionEase ?? 3,
    ideaClarity: idea.ideaClarity ?? 3,
    reusePotential: idea.reusePotential ?? 3,
    urgency: idea.urgency ?? 3,
    angle: idea.angle ?? '',
    keyPoints: idea.keyPoints ?? '',
    references: idea.references ?? '',
    nextAction: idea.nextAction ?? '',
    effort: idea.effort ?? '',
    dueDate: idea.dueDate ?? '',
    checklist: idea.checklist ?? '',
  };
}

function formStateToIdeaInput(state: FormState): IdeaInput {
  const tags = state.tagsInput
    .split(',')
    .map((t) => t.trim().replace(/^#/, ''))
    .filter(Boolean);
  return {
    title: state.title.trim(),
    rawIdea: state.rawIdea.trim(),
    ideaType: state.ideaType,
    type: state.type,
    channel: state.channel,
    audience: state.audience.trim(),
    hook: state.hook.trim(),
    promise: state.promise.trim(),
    notes: state.notes.trim(),
    status: state.status,
    priority: state.priority,
    tags,
    favorite: state.favorite,
    expectedImpact: state.expectedImpact,
    executionEase: state.executionEase,
    ideaClarity: state.ideaClarity,
    reusePotential: state.reusePotential,
    urgency: state.urgency,
    angle: state.angle.trim(),
    keyPoints: state.keyPoints.trim(),
    references: state.references.trim(),
    nextAction: state.nextAction.trim(),
    effort: state.effort || undefined,
    dueDate: state.dueDate,
    checklist: state.checklist.trim(),
  };
}

type IdeaDetailProps = {
  idea: Idea;
  onUpdate: (input: IdeaInput) => void;
  onDelete: (idea: Idea) => void;
  onArchive: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onBack: () => void;
  onShowToast: (message: string) => void;
};

export function IdeaDetail({
  idea,
  onUpdate,
  onDelete,
  onArchive,
  onToggleFavorite,
  onBack,
  onShowToast,
}: IdeaDetailProps) {
  const [form, setForm] = useState<FormState>(() => ideaToFormState(idea));
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [saved, setSaved] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onUpdate(formStateToIdeaInput(form));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  async function handleCopyBrief() {
    const input = formStateToIdeaInput(form);
    const previewIdea: Idea = { ...idea, ...input };
    try {
      await copyText(generateBriefing(previewIdea));
      setCopyState('copied');
      onShowToast('Briefing copiado.');
      window.setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      onShowToast('Não foi possível copiar. Tente novamente.');
    }
  }

  const score = calculatePotentialScore({
    expectedImpact: form.expectedImpact,
    executionEase: form.executionEase,
    ideaClarity: form.ideaClarity,
    reusePotential: form.reusePotential,
    urgency: form.urgency,
  });
  const scoreLabel = classifyPotentialScore(score);

  const previewIdea: Idea = { ...idea, ...formStateToIdeaInput(form) };
  const fieldConfig = briefingFieldConfigs[form.ideaType];

  return (
    <section className="grid gap-4 pb-24">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" className="btn btn-ghost w-fit" onClick={onBack}>
          <Undo2 size={16} /> Voltar
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-ghost px-3 text-sm"
            onClick={() => {
              onToggleFavorite(idea.id);
              set('favorite', !form.favorite);
            }}
            aria-pressed={form.favorite}
          >
            <Star size={16} className={form.favorite ? 'fill-amber-300 text-amber-300' : ''} />
            <span className="hidden sm:inline">{form.favorite ? 'Salvo' : 'Favoritar'}</span>
          </button>
          <button type="button" className="btn btn-secondary px-3 text-sm" onClick={handleCopyBrief}>
            <Copy size={16} />
            {copyState === 'copied' ? 'Copiado' : 'Copiar briefing'}
          </button>
          <button
            type="button"
            className="btn btn-ghost px-3 text-sm text-slate-500"
            onClick={() => { onArchive(idea.id); onBack(); }}
          >
            <Archive size={16} />
            <span className="hidden sm:inline">Arquivar</span>
          </button>
          <button
            type="button"
            className="btn btn-danger px-3 text-sm"
            onClick={() => onDelete(idea)}
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Excluir</span>
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="surface rounded-xl p-4 sm:p-5">
        <input
          className="mb-3 w-full bg-transparent text-2xl font-bold text-white placeholder-slate-600 outline-none sm:text-3xl"
          placeholder="Título da ideia"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          aria-label="Título da ideia"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={ideaTypeTone(form.ideaType)}>{form.ideaType}</Badge>
          <Badge tone={statusTone(form.status)}>{form.status}</Badge>
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${
              score >= 19
                ? 'border-orange-400/40 bg-orange-500/15 text-orange-200'
                : 'border-line/60 bg-slate-900/60 text-slate-400'
            }`}
          >
            {score}/25 — {scoreLabel}
          </span>
          <span className="text-xs text-slate-600">
            Criada {formatDate(idea.createdAt)} · Atualizada {formatDate(idea.updatedAt)}
          </span>
        </div>
      </div>

      {/* Ideia bruta */}
      <SectionCard title="Ideia bruta" helper="O pensamento original antes de virar briefing.">
        <label className="grid gap-2 lg:col-span-2">
          <span className="label">Texto da ideia</span>
          <textarea
            className="field min-h-32 resize-y"
            value={form.rawIdea}
            onChange={(e) => set('rawIdea', e.target.value)}
            placeholder="Cole o pensamento cru, insight, referência ou tese inicial."
          />
        </label>
        <SelectControl
          label="Categoria"
          value={form.ideaType}
          options={ideaTypes}
          onChange={(v) => set('ideaType', v as IdeaType)}
        />
        <label className="grid gap-2">
          <span className="label">Tags</span>
          <input
            className="field"
            value={form.tagsInput}
            onChange={(e) => set('tagsInput', e.target.value)}
            placeholder="criacao, roteiro, produto"
          />
        </label>
      </SectionCard>

      {/* Briefing estruturado */}
      <CollapsibleSection
        title="Briefing estruturado"
        helper="Desenvolva a ideia em componentes acionáveis."
        badge={fieldConfig.templateBadge}
      >
        <label className="grid gap-2">
          <span className="label">{fieldConfig.audienceLabel}</span>
          <input
            className="field"
            value={form.audience}
            onChange={(e) => set('audience', e.target.value)}
            placeholder={fieldConfig.audiencePlaceholder}
          />
        </label>
        <label className="grid gap-2">
          <span className="label">{fieldConfig.angleLabel}</span>
          <input
            className="field"
            value={form.angle}
            onChange={(e) => set('angle', e.target.value)}
            placeholder={fieldConfig.anglePlaceholder}
          />
        </label>
        <label className="grid gap-2">
          <span className="label">{fieldConfig.promiseLabel}</span>
          <input
            className="field"
            value={form.promise}
            onChange={(e) => set('promise', e.target.value)}
            placeholder={fieldConfig.promisePlaceholder}
          />
        </label>
        <label className="grid gap-2">
          <span className="label">{fieldConfig.hookLabel}</span>
          <input
            className="field"
            value={form.hook}
            onChange={(e) => set('hook', e.target.value)}
            placeholder={fieldConfig.hookPlaceholder}
          />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="label">{fieldConfig.keyPointsLabel}</span>
          <textarea
            className="field min-h-24 resize-y"
            value={form.keyPoints}
            onChange={(e) => set('keyPoints', e.target.value)}
            placeholder={fieldConfig.keyPointsPlaceholder}
          />
        </label>
        <SelectControl
          label="Formato"
          value={form.type}
          options={contentTypes}
          onChange={(v) => set('type', v as ContentType)}
        />
        <SelectControl
          label="Canal"
          value={form.channel}
          options={channels}
          onChange={(v) => set('channel', v as Channel)}
        />
        <label className="grid gap-2 lg:col-span-2">
          <span className="label">{fieldConfig.referencesLabel}</span>
          <textarea
            className="field min-h-20 resize-y"
            value={form.references}
            onChange={(e) => set('references', e.target.value)}
            placeholder="Links, exemplos, inspirações"
          />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="label">Notas</span>
          <textarea
            className="field min-h-20 resize-y"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Observações adicionais, contexto, pontos de atenção"
          />
        </label>
      </CollapsibleSection>

      {/* Plano de execução */}
      <CollapsibleSection title="Plano de execução" helper="Defina o próximo passo e o esforço necessário.">
        <label className="grid gap-2 lg:col-span-2">
          <span className="label">Próxima ação</span>
          <input
            className="field"
            value={form.nextAction}
            onChange={(e) => set('nextAction', e.target.value)}
            placeholder="O que precisa acontecer para avançar?"
          />
        </label>
        <SelectControl
          label="Status"
          value={form.status}
          options={statuses}
          onChange={(v) => set('status', v as IdeaStatus)}
        />
        <SelectControl
          label="Prioridade"
          value={form.priority}
          options={priorities}
          onChange={(v) => set('priority', v as Priority)}
        />
        <label className="grid gap-2">
          <span className="label">Esforço</span>
          <select
            className="field"
            value={form.effort}
            onChange={(e) => set('effort', e.target.value as Effort | '')}
          >
            <option value="">Não definido</option>
            {efforts.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="label">Prazo</span>
          <input
            className="field"
            type="date"
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
          />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="label">Checklist / passos</span>
          <textarea
            className="field min-h-24 resize-y"
            value={form.checklist}
            onChange={(e) => set('checklist', e.target.value)}
            placeholder={'- Passo 1\n- Passo 2\n- Passo 3'}
          />
        </label>
      </CollapsibleSection>

      {/* Score de potencial */}
      <CollapsibleSection title="Score de potencial" helper="Avalie o potencial da ideia de 1 a 5 em cada critério.">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
          {potentialCriteriaLabels.map(({ key, label }) => (
            <RatingControl
              key={key}
              label={label}
              value={form[key] as number}
              onChange={(v) => set(key as keyof FormState, v)}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 rounded-lg border border-line/60 bg-slate-950/50 p-4 lg:col-span-2">
          <div className="text-3xl font-bold text-white">
            {score}
            <span className="text-sm font-normal text-slate-500">/25</span>
          </div>
          <div>
            <p className={`font-semibold ${score >= 19 ? 'text-orange-300' : score >= 11 ? 'text-slate-200' : 'text-slate-400'}`}>
              {scoreLabel}
            </p>
            <p className="text-xs text-slate-500">Score de potencial</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Output formats */}
      <OutputFormatsPanel idea={previewIdea} />

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line/60 bg-ink/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <p className="text-xs text-slate-500 hidden sm:block">
            Última atualização: {formatDate(idea.updatedAt)}
          </p>
          <div className="flex gap-2 ml-auto">
            <button type="button" className="btn btn-secondary px-3 text-sm" onClick={handleCopyBrief}>
              <Copy size={15} />
              <span className="hidden sm:inline">{copyState === 'copied' ? 'Copiado' : 'Copiar briefing'}</span>
            </button>
            <button
              type="button"
              className={`btn px-4 text-sm ${saved ? 'btn-secondary border-emerald-500/40 text-emerald-300' : 'btn-primary'}`}
              onClick={handleSave}
            >
              <Save size={15} />
              {saved ? 'Salvo!' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section card (always open) ───────────────────────────────── */
function SectionCard({ title, helper, badge, children }: { title: string; helper: string; badge?: string; children: ReactNode }) {
  return (
    <div className="surface rounded-xl p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{helper}</p>
        </div>
        {badge && (
          <span className="inline-flex items-center rounded-md border border-slate-700/60 bg-slate-900 px-2 py-0.5 text-xs font-medium text-slate-400">
            {badge}
          </span>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </div>
  );
}

/* ─── Collapsible section card ───────────────────────────────────── */
function CollapsibleSection({ title, helper, badge, children }: { title: string; helper: string; badge?: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="surface rounded-xl overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-4 sm:p-5 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{helper}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge && (
            <span className="inline-flex items-center rounded-md border border-slate-700/60 bg-slate-900 px-2 py-0.5 text-xs font-medium text-slate-400">
              {badge}
            </span>
          )}
          {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-line/60 p-4 sm:p-5 pt-4">
          <div className="grid gap-4 lg:grid-cols-2">{children}</div>
        </div>
      )}
    </div>
  );
}

/* ─── Form helpers ───────────────────────────────────────────────── */

function SelectControl<T extends readonly string[]>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: T;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

function RatingControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-2">
      <span className="label">{label}</span>
      <div className="grid grid-cols-5 gap-1 rounded-lg border border-line/60 bg-slate-950/60 p-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`grid min-h-9 place-items-center rounded-md border text-sm font-bold transition ${
              value === rating
                ? 'border-ember/60 bg-orange-500/20 text-orange-100'
                : 'border-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );
}
