import { useState } from 'react';
import { AlertCircle, Archive, ArrowRight, CheckCircle2, Clock3, Pencil, Play, X } from 'lucide-react';
import type { Idea } from '../types/idea';
import { Badge } from './Badge';
import { statusTone, ideaTypeTone } from '../utils/badges';
import { calculatePotentialScore } from '../utils/score';
import { formatDate } from '../utils/date';
import { getIdeasNeedingReview, getReviewReasons, type ReviewReason } from '../utils/reviewQueue';

type ReviewAction = 'kept' | 'archived';

interface Props {
  ideas: Idea[];
  onClose: () => void;
  onKeep: (id: string) => void;
  onImprove: (id: string) => void;
  onProduce: (idea: Idea) => void;
  onArchive: (id: string) => void;
}

function reasonClassName(reason: ReviewReason): string {
  if (reason === 'Parada há 7+ dias' || reason === 'Ainda como ideia inicial') {
    return 'inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300';
  }
  return 'inline-flex items-center gap-1 rounded-full border border-slate-700/50 bg-slate-800/60 px-2 py-0.5 text-xs font-medium text-slate-400';
}

export function ReviewMode({ ideas, onClose, onKeep, onImprove, onProduce, onArchive }: Props) {
  const [index, setIndex] = useState(0);
  const [lastAction, setLastAction] = useState<ReviewAction | null>(null);

  function handleKeep() {
    if (!liveIdea) return;
    onKeep(liveIdea.id);
    setLastAction('kept');
    window.setTimeout(() => {
      setLastAction(null);
      setIndex((prev) => prev + 1);
    }, 800);
  }

  function handleArchive() {
    if (!liveIdea) return;
    onArchive(liveIdea.id);
    setLastAction('archived');
    window.setTimeout(() => {
      setLastAction(null);
    }, 800);
  }

  function handleImprove() {
    if (!liveIdea) return;
    onImprove(liveIdea.id);
    onClose();
  }

  function handleProduce() {
    if (!liveIdea) return;
    onProduce(liveIdea);
    onClose();
  }

  const liveQueue = getIdeasNeedingReview(ideas);
  const liveIndex = Math.min(index, liveQueue.length - 1);
  const liveIdea = liveQueue[liveIndex] ?? null;
  const liveTotal = liveQueue.length;
  const progress = liveTotal > 0 ? ((liveIndex) / liveTotal) * 100 : 100;
  const score = liveIdea ? calculatePotentialScore(liveIdea) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Revisão de ideias"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
    >
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl border border-line/60 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Progress bar */}
        {liveTotal > 0 && (
          <div className="h-0.5 w-full bg-slate-800">
            <div
              className="h-full bg-ember transition-all duration-500"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Revisão de ideias</h2>
            {liveTotal > 0 && (
              <p className="mt-0.5 text-xs text-slate-500">
                {liveIndex + 1} de {liveTotal}
              </p>
            )}
          </div>
          <button
            type="button"
            className="btn btn-ghost p-2 text-slate-500 hover:text-white"
            onClick={onClose}
            aria-label="Fechar revisão"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {liveIdea ? (
          <>
            <div className="border-t border-line/40 overflow-y-auto px-5 py-4" style={{ maxHeight: '60dvh' }}>
              {/* Feedback flash */}
              {lastAction && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  <CheckCircle2 size={14} />
                  {lastAction === 'kept' ? 'Ideia mantida.' : 'Ideia arquivada.'}
                </div>
              )}

              {/* Title */}
              <h3 className="mb-2.5 text-lg font-bold leading-snug text-white">
                {liveIdea.title || 'Sem título'}
              </h3>

              {/* Badges */}
              <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                {liveIdea.ideaType && (
                  <Badge tone={ideaTypeTone(liveIdea.ideaType)}>{liveIdea.ideaType}</Badge>
                )}
                <Badge tone={statusTone(liveIdea.status)}>{liveIdea.status}</Badge>
                {score > 10 && (
                  <span className="text-xs font-semibold text-ember">{score}/25</span>
                )}
              </div>

              {/* Review reasons */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {getReviewReasons(liveIdea).map((reason) => (
                  <span key={reason} className={reasonClassName(reason)}>
                    <AlertCircle size={10} /> {reason}
                  </span>
                ))}
              </div>

              {/* Raw idea */}
              {liveIdea.rawIdea && (
                <div className="mb-3 rounded-lg border border-line/50 bg-slate-950/60 px-3 py-2.5">
                  <p className="mb-1 text-xs font-medium text-slate-500">Ideia bruta</p>
                  <p className="line-clamp-4 text-sm leading-relaxed text-slate-200">{liveIdea.rawIdea}</p>
                </div>
              )}

              {/* Next action */}
              {liveIdea.nextAction && (
                <div className="mb-3 rounded-lg border border-ember/20 bg-ember/10 px-3 py-2.5">
                  <p className="mb-0.5 text-xs font-medium text-ember/70">Próxima ação</p>
                  <p className="text-sm text-orange-100">{liveIdea.nextAction}</p>
                </div>
              )}

              {/* Last updated */}
              <p className="flex items-center gap-1 text-xs text-slate-600">
                <Clock3 size={10} />
                Atualizada em {formatDate(liveIdea.updatedAt ?? liveIdea.createdAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="border-t border-line/60 px-5 py-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  onClick={handleKeep}
                  disabled={lastAction !== null}
                >
                  <CheckCircle2 size={14} /> Manter
                </button>
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  onClick={handleImprove}
                >
                  <Pencil size={14} /> Melhorar
                </button>
                <button
                  type="button"
                  className="btn btn-primary text-xs"
                  onClick={handleProduce}
                >
                  <Play size={14} /> Produzir
                </button>
                <button
                  type="button"
                  className="btn btn-ghost text-xs text-slate-500 hover:text-red-300"
                  onClick={handleArchive}
                  disabled={lastAction !== null}
                >
                  <Archive size={14} /> Arquivar
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state — all reviewed */
          <div className="flex flex-col items-center gap-4 px-5 py-14 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-base font-bold text-white">Tudo em ordem.</p>
              <p className="mt-1 text-sm text-slate-400">
                Nenhuma ideia parada ou incompleta no momento.
              </p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <ArrowRight size={15} /> Voltar ao dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
