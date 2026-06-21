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

function reasonTone(reason: ReviewReason): string {
  if (reason === 'Parada há 7+ dias' || reason === 'Ainda como ideia inicial') {
    return 'inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300';
  }
  return 'inline-flex items-center gap-1 rounded-full border border-slate-600/50 bg-slate-800/60 px-2 py-0.5 text-xs font-medium text-slate-400';
}

export function ReviewMode({ ideas, onClose, onKeep, onImprove, onProduce, onArchive }: Props) {
  const queue = getIdeasNeedingReview(ideas);
  const [index, setIndex] = useState(0);
  const [lastAction, setLastAction] = useState<ReviewAction | null>(null);

  const current = queue[index] ?? null;
  const total = queue.length;

  function advance() {
    setLastAction(null);
    // If there are more ideas after current index, stay; queue will shrink
    // Re-derive after action: index may now be out of bounds
    setIndex((prev) => {
      // After an archive/keep, the queue re-renders. If prev >= new length, clamp.
      return prev;
    });
  }

  function handleKeep() {
    if (!current) return;
    onKeep(current.id);
    setLastAction('kept');
    // Move to next after short delay
    window.setTimeout(() => {
      setLastAction(null);
      setIndex((prev) => prev + 1);
    }, 900);
  }

  function handleArchive() {
    if (!current) return;
    onArchive(current.id);
    setLastAction('archived');
    window.setTimeout(() => {
      setLastAction(null);
      // Don't increment — the archived idea leaves the queue so current index points to next
    }, 900);
  }

  function handleImprove() {
    if (!current) return;
    onImprove(current.id);
    onClose();
  }

  function handleProduce() {
    if (!current) return;
    onProduce(current);
    onClose();
  }

  // Derive live queue to get updated current idea after keeps/archives
  const liveQueue = getIdeasNeedingReview(ideas);
  const liveIndex = Math.min(index, liveQueue.length - 1);
  const liveIdea = liveQueue[liveIndex] ?? null;
  const liveTotal = liveQueue.length;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-xl flex-col rounded-xl border border-line bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">Revisão de ideias</h2>
            {liveTotal > 0 && (
              <p className="mt-0.5 text-xs text-slate-400">
                {liveIndex + 1} de {liveTotal}
              </p>
            )}
          </div>
          <button
            type="button"
            className="btn btn-ghost p-1.5 text-slate-400 hover:text-white"
            onClick={onClose}
            aria-label="Fechar revisão"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {liveIdea ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Feedback flash */}
              {lastAction && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  <CheckCircle2 size={15} />
                  {lastAction === 'kept' ? 'Ideia mantida.' : 'Ideia arquivada.'}
                </div>
              )}

              {/* Title + badges */}
              <h3 className="mb-3 text-lg font-bold leading-snug text-white">
                {liveIdea.title || 'Sem título'}
              </h3>

              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                {liveIdea.ideaType && (
                  <Badge tone={ideaTypeTone(liveIdea.ideaType)}>{liveIdea.ideaType}</Badge>
                )}
                <Badge tone={statusTone(liveIdea.status)}>{liveIdea.status}</Badge>
                {calculatePotentialScore(liveIdea) > 10 && (
                  <span className="text-xs font-semibold text-ember">
                    Score {calculatePotentialScore(liveIdea)}/25
                  </span>
                )}
              </div>

              {/* Review reasons */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {getReviewReasons(liveIdea).map((reason) => (
                  <span key={reason} className={reasonTone(reason)}>
                    <AlertCircle size={11} /> {reason}
                  </span>
                ))}
              </div>

              {/* Raw idea */}
              {liveIdea.rawIdea && (
                <div className="mb-3 rounded-lg border border-line bg-slate-950/60 px-3 py-2">
                  <p className="mb-1 text-xs font-medium text-slate-400">Ideia bruta</p>
                  <p className="line-clamp-4 text-sm leading-relaxed text-slate-200">{liveIdea.rawIdea}</p>
                </div>
              )}

              {/* Next action */}
              {liveIdea.nextAction && (
                <div className="mb-3 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2">
                  <p className="mb-0.5 text-xs font-medium text-orange-300">Próxima ação</p>
                  <p className="text-sm text-orange-100">{liveIdea.nextAction}</p>
                </div>
              )}

              {/* Last updated */}
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Clock3 size={11} />
                Atualizada em {formatDate(liveIdea.updatedAt ?? liveIdea.createdAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="border-t border-line px-5 py-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  onClick={handleKeep}
                  disabled={lastAction !== null}
                >
                  <CheckCircle2 size={15} /> Manter
                </button>
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  onClick={handleImprove}
                >
                  <Pencil size={15} /> Melhorar
                </button>
                <button
                  type="button"
                  className="btn btn-primary text-xs"
                  onClick={handleProduce}
                >
                  <Play size={15} /> Produzir
                </button>
                <button
                  type="button"
                  className="btn btn-ghost text-xs text-slate-400 hover:text-red-300"
                  onClick={handleArchive}
                  disabled={lastAction !== null}
                >
                  <Archive size={15} /> Arquivar
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-4 px-5 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Tudo em ordem.</p>
              <p className="mt-1 text-sm text-slate-400">
                Seu backlog não tem ideias paradas ou incompletas no momento.
              </p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <ArrowRight size={16} /> Voltar ao dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
