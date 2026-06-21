import { useState } from 'react';
import { Archive, ArrowRight, Check, CheckCircle2, Copy, X } from 'lucide-react';
import type { Idea, IdeaStatus } from '../types/idea';
import { Badge } from './Badge';
import { ideaTypeTone, statusTone } from '../utils/badges';
import { calculatePotentialScore, classifyPotentialScore } from '../utils/score';
import { generateBriefing } from '../utils/briefing';
import { copyText } from '../utils/clipboard';

type ProductionModeProps = {
  idea: Idea;
  onClose: () => void;
  onOpen: (id: string) => void;
  onStatusChange: (id: string, status: IdeaStatus) => void;
  onArchive: (id: string) => void;
  onShowToast: (message: string) => void;
};

export function ProductionMode({ idea, onClose, onOpen, onStatusChange, onArchive, onShowToast }: ProductionModeProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const score = calculatePotentialScore(idea);
  const scoreLabel = classifyPotentialScore(score);
  const briefingText = generateBriefing(idea);

  async function handleCopy() {
    try {
      await copyText(briefingText);
      setCopyState('copied');
      onShowToast('Briefing copiado.');
      window.setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      onShowToast('Não foi possível copiar. Tente novamente.');
    }
  }

  function handleStatusChange(status: IdeaStatus) {
    onStatusChange(idea.id, status);
    onShowToast(`Status atualizado para ${status}.`);
    if (status === 'Publicado' || status === 'Arquivado') onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Modo de produção: ${idea.title}`}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl bg-slate-900 shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-line/60 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone={ideaTypeTone(idea.ideaType ?? 'Outro')}>{idea.ideaType ?? 'Outro'}</Badge>
              <Badge tone={statusTone(idea.status)}>{idea.status}</Badge>
              <span className={`text-xs font-semibold ${score >= 19 ? 'text-ember' : 'text-slate-500'}`}>
                {score}/25 · {scoreLabel}
              </span>
            </div>
            <h2 className="text-lg font-bold leading-tight text-white">{idea.title || 'Sem título'}</h2>
          </div>
          <button type="button" className="btn btn-ghost shrink-0 p-2" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="grid gap-4">
            {/* Next action — highlighted */}
            {idea.nextAction && (
              <div className="flex items-start gap-3 rounded-lg border border-ember/25 bg-ember/10 px-4 py-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ember/20 text-ember">
                  <ArrowRight size={12} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ember/80 mb-0.5">Próxima ação</p>
                  <p className="text-sm text-white">{idea.nextAction}</p>
                </div>
              </div>
            )}

            {idea.rawIdea && (
              <Section label="Ideia bruta">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-300">{idea.rawIdea}</p>
              </Section>
            )}

            {idea.keyPoints && (
              <Section label="Pontos-chave">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-300">{idea.keyPoints}</p>
              </Section>
            )}

            {idea.checklist && (
              <Section label="Checklist">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-300">{idea.checklist}</p>
              </Section>
            )}

            {idea.notes && (
              <Section label="Notas">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-300">{idea.notes}</p>
              </Section>
            )}

            <Section label="Briefing gerado">
              <pre className="overflow-x-auto rounded-lg border border-line/50 bg-slate-950/70 px-4 py-3 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                {briefingText}
              </pre>
            </Section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line/60 px-4 py-4 sm:px-5">
          {/* Primary actions */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button type="button" className="btn btn-primary flex-1 sm:flex-none" onClick={handleCopy}>
              {copyState === 'copied' ? (
                <><Check size={15} /> Copiado</>
              ) : (
                <><Copy size={15} /> Copiar briefing</>
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary flex-1 sm:flex-none"
              onClick={() => { onClose(); onOpen(idea.id); }}
            >
              <ArrowRight size={15} /> Editar ideia
            </button>
          </div>

          {/* Status change — secondary row */}
          <div className="flex flex-wrap gap-1.5">
            <p className="w-full text-xs text-slate-600 mb-1">Atualizar status:</p>
            <StatusBtn label="Rascunho" onClick={() => handleStatusChange('Rascunho')} />
            <StatusBtn label="Pronta" onClick={() => handleStatusChange('Pronto para produzir')} />
            <StatusBtn label="Publicada" className="text-emerald-400" onClick={() => handleStatusChange('Publicado')}>
              <CheckCircle2 size={13} />
            </StatusBtn>
            <button
              type="button"
              className="btn btn-ghost px-2.5 text-xs text-slate-600 hover:text-slate-400"
              onClick={() => { onArchive(idea.id); onClose(); }}
            >
              <Archive size={13} /> Arquivar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      {children}
    </div>
  );
}

function StatusBtn({
  label,
  onClick,
  className = '',
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" className={`btn btn-ghost px-2.5 text-xs ${className}`} onClick={onClick}>
      {children}
      {label}
    </button>
  );
}
