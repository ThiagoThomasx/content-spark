import { useState } from 'react';
import type { ReactNode } from 'react';
import { Archive, Copy, Save, Star, Trash2, Undo2 } from 'lucide-react';
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

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onUpdate(formStateToIdeaInput(form));
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

  return (
    <section className="grid gap-5">
      {/* Top bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button type="button" className="btn btn-ghost w-fit" onClick={onBack}>
          <Undo2 size={17} /> Voltar
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              onToggleFavorite(idea.id);
              set('favorite', !form.favorite);
            }}
          >
            <Star size={18} className={form.favorite ? 'fill-amber-300 text-amber-300' : ''} />
            {form.favorite ? 'Desfavoritar' : 'Favoritar'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCopyBrief}>
            <Copy size={18} />
            {copyState === 'copied' ? 'Briefing copiado' : 'Copiar briefing'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              onArchive(idea.id);
              onBack();
            }}
          >
            <Archive size={18} /> Arquivar
          </button>
          <button
            type="button"
            className="btn border border-rose-500/40 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
            onClick={() => onDelete(idea)}
          >
            <Trash2 size={18} /> Excluir
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="surface rounded-lg p-4 sm:p-6">
        <input
          className="mb-4 w-full bg-transparent text-2xl font-bold text-white placeholder-slate-600 outline-none sm:text-3xl"
          placeholder="Título da ideia"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={ideaTypeTone(form.ideaType)}>{form.ideaType}</Badge>
          <Badge tone={statusTone(form.status)}>{form.status}</Badge>
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold ${
              score >= 19
                ? 'border-orange-300/60 bg-orange-500/20 text-orange-50'
                : 'border-line bg-slate-900/80 text-slate-200'
            }`}
          >
            {score}/25 — {scoreLabel}
          </span>
          <span className="text-xs text-slate-500">
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
            placeholder="Cole aqui o pensamento cru, insight, referência ou tese inicial."
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
      <SectionCard title="Briefing estruturado" helper="Desenvolva a ideia em componentes acionáveis.">
        <label className="grid gap-2">
          <span className="label">Público / Usuário</span>
          <input
            className="field"
            value={form.audience}
            onChange={(e) => set('audience', e.target.value)}
            placeholder="Para quem isso existe?"
          />
        </label>
        <label className="grid gap-2">
          <span className="label">Ângulo principal</span>
          <input
            className="field"
            value={form.angle}
            onChange={(e) => set('angle', e.target.value)}
            placeholder="O diferencial ou perspectiva única"
          />
        </label>
        <label className="grid gap-2">
          <span className="label">Promessa / Valor</span>
          <input
            className="field"
            value={form.promise}
            onChange={(e) => set('promise', e.target.value)}
            placeholder="O que a pessoa leva depois de consumir?"
          />
        </label>
        <label className="grid gap-2">
          <span className="label">Gancho</span>
          <input
            className="field"
            value={form.hook}
            onChange={(e) => set('hook', e.target.value)}
            placeholder="A primeira frase que puxa atenção"
          />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="label">Pontos-chave</span>
          <textarea
            className="field min-h-24 resize-y"
            value={form.keyPoints}
            onChange={(e) => set('keyPoints', e.target.value)}
            placeholder="Os principais pontos que a ideia deve cobrir"
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
          <span className="label">Referências</span>
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
      </SectionCard>

      {/* Plano de execução */}
      <SectionCard title="Plano de execução" helper="Defina o próximo passo e o esforço necessário.">
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
      </SectionCard>

      {/* Score de potencial */}
      <SectionCard title="Score de potencial" helper="Avalie o potencial da ideia de 1 a 5 em cada critério.">
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
        <div className="lg:col-span-2 flex items-center gap-4 rounded-lg border border-line bg-slate-950/50 p-4">
          <div className="text-3xl font-bold text-white">
            {score}
            <span className="text-base font-normal text-slate-500">/25</span>
          </div>
          <div>
            <p
              className={`font-semibold ${
                score >= 19 ? 'text-orange-300' : score >= 11 ? 'text-slate-200' : 'text-slate-400'
              }`}
            >
              {scoreLabel}
            </p>
            <p className="text-xs text-slate-500">Score de potencial</p>
          </div>
        </div>
      </SectionCard>

      {/* Output formats */}
      <OutputFormatsPanel idea={previewIdea} />

      {/* Save */}
      <div className="flex justify-end border-t border-line pt-4">
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          <Save size={18} /> Salvar alterações
        </button>
      </div>
    </section>
  );
}

function SectionCard({ title, helper, children }: { title: string; helper: string; children: ReactNode }) {
  return (
    <div className="surface rounded-lg p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{helper}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </div>
  );
}

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
      <div className="grid grid-cols-5 gap-1.5 rounded-lg border border-line bg-slate-950/60 p-1.5">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`grid min-h-9 place-items-center rounded-md border text-sm font-bold transition ${
              value === rating
                ? 'border-ember bg-orange-500/20 text-orange-50'
                : 'border-transparent text-slate-400 hover:bg-slate-800'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );
}
