import { Check, Copy, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Idea } from '../types/idea';
import { copyText } from '../utils/clipboard';
import { generateOutput, type OutputFormat } from '../utils/outputTemplates';

const outputOptions: Array<{ value: OutputFormat; label: string; description: string }> = [
  {
    value: 'briefingCompleto',
    label: 'Briefing completo',
    description: 'Estrutura geral para alinhar a execucao.',
  },
  {
    value: 'linkedinPost',
    label: 'Post para LinkedIn',
    description: 'Base em blocos curtos para post reflexivo.',
  },
  {
    value: 'videoScript',
    label: 'Roteiro curto para video',
    description: 'Abertura, contexto, desenvolvimento e CTA.',
  },
  {
    value: 'xThread',
    label: 'Thread para X/Twitter',
    description: 'Sequencia inicial em seis tweets.',
  },
  {
    value: 'aiPrompt',
    label: 'Prompt para ChatGPT/Claude',
    description: 'Prompt copiavel para trabalhar fora do app.',
  },
  {
    value: 'productionChecklist',
    label: 'Checklist de producao',
    description: 'Lista de revisao antes de gravar ou publicar.',
  },
];

export function OutputFormatsPanel({ idea }: { idea: Idea }) {
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('briefingCompleto');
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'copied' | 'error'>('idle');

  const selectedOption = outputOptions.find((option) => option.value === selectedFormat) ?? outputOptions[0];
  const preview = useMemo(() => generateOutput(idea, selectedFormat), [idea, selectedFormat]);

  async function handleCopy() {
    try {
      await copyText(preview);
      setCopyFeedback('copied');
      window.setTimeout(() => setCopyFeedback('idle'), 1800);
    } catch {
      setCopyFeedback('error');
      window.setTimeout(() => setCopyFeedback('idle'), 2400);
    }
  }

  return (
    <section className="surface mt-6 rounded-lg p-4 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-slate-900 text-ember">
            <FileText size={20} />
          </div>
          <h2 className="text-xl font-semibold text-white">Formatos de saida</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Escolha um formato, revise o preview e copie o texto pronto para continuar a producao.
          </p>
        </div>
        <button type="button" className="btn btn-primary min-h-10 w-full sm:w-fit" onClick={handleCopy}>
          {copyFeedback === 'copied' ? <Check size={18} /> : <Copy size={18} />}
          {copyFeedback === 'copied' ? 'Copiado!' : 'Copiar formato selecionado'}
        </button>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[21rem_1fr]">
        <div className="min-w-0">
          <label className="grid gap-2 xl:hidden">
            <span className="label">Formato</span>
            <select
              className="field"
              value={selectedFormat}
              onChange={(event) => setSelectedFormat(event.target.value as OutputFormat)}
            >
              {outputOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2 xl:mt-0 xl:grid xl:overflow-visible xl:pb-0">
            {outputOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`min-h-16 w-56 shrink-0 snap-start rounded-lg border px-3 py-3 text-left transition xl:w-auto ${
                  selectedFormat === option.value
                    ? 'border-ember bg-orange-500/12 text-white'
                    : 'border-line bg-slate-950/45 text-slate-300 hover:border-slate-500 hover:bg-slate-900'
                }`}
                onClick={() => setSelectedFormat(option.value)}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg border border-line bg-slate-950/70">
          <div className="flex flex-col gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">{selectedOption.label}</h3>
              <p className="mt-1 text-xs text-slate-500">{selectedOption.description}</p>
            </div>
            {copyFeedback === 'copied' ? <span className="text-sm font-semibold text-emerald-300">Copiado!</span> : null}
            {copyFeedback === 'error' ? <span className="text-sm font-semibold text-rose-300">Nao foi possivel copiar.</span> : null}
          </div>
          <pre className="min-h-80 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-6 text-slate-200 sm:p-5 sm:text-sm">
            {preview}
          </pre>
        </div>
      </div>
    </section>
  );
}
