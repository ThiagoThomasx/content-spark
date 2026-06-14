import { Save, Star } from 'lucide-react';
import type { FormEvent } from 'react';
import { channels, contentTypes, priorities, statuses, type Idea, type IdeaInput } from '../types/idea';
import { getPotentialCriteria, potentialCriteriaLabels } from '../utils/score';

const emptyIdea: IdeaInput = {
  title: '',
  rawIdea: '',
  type: 'Post',
  channel: 'LinkedIn',
  audience: '',
  hook: '',
  promise: '',
  notes: '',
  status: 'Ideia',
  priority: 'Media',
  tags: [],
  favorite: false,
  expectedImpact: 3,
  executionEase: 3,
  ideaClarity: 3,
  reusePotential: 3,
  urgency: 3,
};

type IdeaFormProps = {
  idea?: Idea;
  onSubmit: (input: IdeaInput) => void;
  submitLabel: string;
};

export function toIdeaInput(idea?: Idea): IdeaInput {
  if (!idea) return emptyIdea;
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = idea;
  return { ...emptyIdea, ...input, ...getPotentialCriteria(input) };
}

export function IdeaForm({ idea, onSubmit, submitLabel }: IdeaFormProps) {
  const initial = toIdeaInput(idea);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const tags = String(data.get('tags') ?? '')
      .split(',')
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter(Boolean);

    onSubmit({
      title: String(data.get('title') ?? '').trim(),
      rawIdea: String(data.get('rawIdea') ?? '').trim(),
      type: String(data.get('type')) as IdeaInput['type'],
      channel: String(data.get('channel')) as IdeaInput['channel'],
      audience: String(data.get('audience') ?? '').trim(),
      hook: String(data.get('hook') ?? '').trim(),
      promise: String(data.get('promise') ?? '').trim(),
      notes: String(data.get('notes') ?? '').trim(),
      status: String(data.get('status')) as IdeaInput['status'],
      priority: String(data.get('priority')) as IdeaInput['priority'],
      tags,
      favorite: data.get('favorite') === 'on',
      expectedImpact: Number(data.get('expectedImpact') ?? 3),
      executionEase: Number(data.get('executionEase') ?? 3),
      ideaClarity: Number(data.get('ideaClarity') ?? 3),
      reusePotential: Number(data.get('reusePotential') ?? 3),
      urgency: Number(data.get('urgency') ?? 3),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="surface rounded-lg p-4 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="grid gap-2 lg:col-span-2">
          <span className="label">Titulo</span>
          <input className="field" name="title" defaultValue={initial.title} placeholder="Ex: 5 sinais de que sua ideia virou pauta" required />
        </label>

        <label className="grid gap-2 lg:col-span-2">
          <span className="label">Ideia bruta</span>
          <textarea className="field min-h-32 resize-y" name="rawIdea" defaultValue={initial.rawIdea} placeholder="Cole aqui o pensamento cru, insight, referencia ou tese inicial." required />
        </label>

        <SelectField name="type" label="Tipo de conteudo" value={initial.type} options={contentTypes} />
        <SelectField name="channel" label="Canal" value={initial.channel} options={channels} />

        <label className="grid gap-2">
          <span className="label">Publico-alvo</span>
          <input className="field" name="audience" defaultValue={initial.audience} placeholder="Para quem isso existe?" />
        </label>
        <label className="grid gap-2">
          <span className="label">Gancho</span>
          <input className="field" name="hook" defaultValue={initial.hook} placeholder="A primeira frase que puxa atencao" />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="label">Promessa do conteudo</span>
          <input className="field" name="promise" defaultValue={initial.promise} placeholder="O que a pessoa leva depois de consumir?" />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="label">Notas</span>
          <textarea className="field min-h-28 resize-y" name="notes" defaultValue={initial.notes} placeholder="Referencias, exemplos, estrutura, pontos de atencao..." />
        </label>

        <SelectField name="status" label="Status" value={initial.status} options={statuses} />
        <SelectField name="priority" label="Prioridade" value={initial.priority} options={priorities} />

        <section className="rounded-lg border border-line bg-slate-950/35 p-4 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">Avaliacao de potencial</h2>
            <p className="mt-1 text-sm text-slate-400">Use 1 para baixo potencial e 5 para alto potencial.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {potentialCriteriaLabels.map((criterion) => (
              <RatingField
                key={criterion.key}
                name={criterion.key}
                label={criterion.label}
                value={initial[criterion.key] ?? 3}
              />
            ))}
          </div>
        </section>

        <label className="grid gap-2 lg:col-span-2">
          <span className="label">Tags</span>
          <input className="field" name="tags" defaultValue={initial.tags.join(', ')} placeholder="criacao, roteiro, produto" />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-200">
          <input className="h-4 w-4 accent-orange-500" type="checkbox" name="favorite" defaultChecked={initial.favorite} />
          <span className="inline-flex items-center gap-2"><Star size={18} /> Marcar como favorito</span>
        </label>
        <button type="submit" className="btn btn-primary">
          <Save size={18} /> {submitLabel}
        </button>
      </div>
    </form>
  );
}

function RatingField({ name, label, value }: { name: string; label: string; value: number }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="label">{label}</legend>
      <div className="grid grid-cols-5 gap-1.5 rounded-lg border border-line bg-slate-950/60 p-1.5">
        {[1, 2, 3, 4, 5].map((rating) => (
          <label key={rating} className="group cursor-pointer">
            <input className="peer sr-only" type="radio" name={name} value={rating} defaultChecked={value === rating} />
            <span className="grid min-h-9 place-items-center rounded-md border border-transparent text-sm font-bold text-slate-400 transition peer-checked:border-ember peer-checked:bg-orange-500/20 peer-checked:text-orange-50 group-hover:bg-slate-800">
              {rating}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SelectField<T extends readonly string[]>({ name, label, value, options }: { name: string; label: string; value: string; options: T }) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <select className="field" name={name} defaultValue={value}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
