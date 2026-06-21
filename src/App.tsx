import { useMemo, useState } from 'react';
import type { ElementType, FormEvent, ReactNode } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Columns3,
  Copy,
  FilePlus2,
  Flame,
  LayoutDashboard,
  Library,
  Plus,
  Sparkles,
  Star,
  Zap,
  Play,
  Archive,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { EmptyState } from './components/EmptyState';
import { FiltersBar } from './components/FiltersBar';
import { IdeaCard } from './components/IdeaCard';
import { IdeaDetail } from './components/IdeaDetail';
import { IdeaForm } from './components/IdeaForm';
import { defaultPipelineFilters, PipelineView, type PipelineFilters } from './components/PipelineView';
import { PotentialScore } from './components/PotentialScore';
import { ProductionMode } from './components/ProductionMode';
import { ReviewMode } from './components/ReviewMode';
import { useIdeas } from './hooks/useIdeas';
import { ideaTypes, statuses, type Filters, type Idea, type IdeaInput, type IdeaStatus, type IdeaType } from './types/idea';
import { generateBriefing } from './utils/briefing';
import { copyText } from './utils/clipboard';
import { formatDate } from './utils/date';
import { priorityTone, statusTone, ideaTypeTone } from './utils/badges';
import { getActionQueueIdeas, getStaleIdeas, getStalledReason, isFilteringActive, type StalledReason } from './utils/ideaSelectors';
import { getBacklogHealth, getBacklogHealthLabel, getIdeasNeedingReview, needsReview } from './utils/reviewQueue';
import { Badge } from './components/Badge';
import { calculatePotentialScore, compareByPriority, getPotentialScoreDetails, getTopPotentialIdeas } from './utils/score';

type View = 'dashboard' | 'library' | 'pipeline' | 'new' | 'detail';

const defaultFilters: Filters = {
  query: '',
  status: 'Todos',
  channel: 'Todos',
  type: 'Todos',
  ideaType: 'Todos',
  priority: 'Todas',
  sortBy: 'Mais recentes',
  favoritesOnly: false,
  needsReviewOnly: false,
};

function App() {
  const { ideas, createIdea, updateIdea, deleteIdea, toggleFavorite, updateStatus } = useIdeas();
  const [view, setView] = useState<View>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [pipelineFilters, setPipelineFilters] = useState<PipelineFilters>(defaultPipelineFilters);
  const [toast, setToast] = useState<string | null>(null);
  const [productionIdea, setProductionIdea] = useState<Idea | null>(null);
  const [reviewModeOpen, setReviewModeOpen] = useState(false);

  const selectedIdea = ideas.find((idea) => idea.id === selectedId) ?? null;

  const stats = useMemo(
    () => ({
      total: ideas.length,
      ready: ideas.filter((idea) => idea.status === 'Pronto para produzir').length,
      stale: getStaleIdeas(ideas).length,
      favorites: ideas.filter((idea) => idea.favorite).length,
    }),
    [ideas],
  );

  const filteredIdeas = useMemo(() => {
    const query = filters.query.trim().toLocaleLowerCase('pt-BR');
    const filtered = ideas.filter((idea) => {
      const searchable = [
        idea.title,
        idea.rawIdea,
        idea.audience,
        idea.hook,
        idea.promise,
        idea.notes,
        idea.tags.join(' '),
      ].join(' ').toLocaleLowerCase('pt-BR');

      return (
        (!query || searchable.includes(query)) &&
        (filters.status === 'Todos' || idea.status === filters.status) &&
        (filters.channel === 'Todos' || idea.channel === filters.channel) &&
        (filters.type === 'Todos' || idea.type === filters.type) &&
        (filters.ideaType === 'Todos' || idea.ideaType === filters.ideaType) &&
        (filters.priority === 'Todas' || idea.priority === filters.priority) &&
        (!filters.favoritesOnly || idea.favorite) &&
        (!filters.needsReviewOnly || needsReview(idea))
      );
    });

    return filtered.sort((a, b) => {
      if (filters.sortBy === 'Maior score') return calculatePotentialScore(b) - calculatePotentialScore(a);
      if (filters.sortBy === 'Menor score') return calculatePotentialScore(a) - calculatePotentialScore(b);
      if (filters.sortBy === 'Maior prioridade') return compareByPriority(a, b);
      if (filters.sortBy === 'Data de atualizacao') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filters, ideas]);

  function showToast(message: string, duration = 2200) {
    setToast(message);
    window.setTimeout(() => setToast(null), duration);
  }

  function openIdea(id: string) {
    setSelectedId(id);
    setView('detail');
  }

  function openProduction(idea: Idea) {
    setProductionIdea(idea);
  }

  function handleCreate(input: IdeaInput) {
    const idea = createIdea(input);
    showToast('Ideia criada com sucesso.');
    openIdea(idea.id);
  }

  function handleQuickCapture(rawIdea: string, ideaType: IdeaType) {
    const firstLine = rawIdea.split('\n')[0].trim();
    const title = firstLine.length > 80 ? firstLine.slice(0, 77).trimEnd() + '...' : firstLine || rawIdea.slice(0, 80);
    createIdea({
      title,
      rawIdea,
      ideaType,
      type: 'Post',
      channel: 'Outro',
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
    });
    showToast('Ideia capturada. Abra na Biblioteca para detalhar.');
  }

  function handleUpdate(input: IdeaInput) {
    if (!selectedIdea) return;
    updateIdea(selectedIdea.id, input);
    showToast('Alterações salvas.');
  }

  function handleDelete(idea: Idea) {
    const confirmed = window.confirm(`Excluir a ideia "${idea.title}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;
    deleteIdea(idea.id);
    showToast('Ideia excluída.');
    setSelectedId(null);
    setView('library');
  }

  function handleArchive(id: string) {
    updateStatus(id, 'Arquivado');
    showToast('Ideia arquivada.');
  }

  function handleMoveReady(id: string) {
    updateStatus(id, 'Pronto para produzir');
    showToast('Ideia movida para pronta.');
  }

  function handleToggleFavorite(id: string) {
    toggleFavorite(id);
    showToast('Favorito atualizado.', 1800);
  }

  function handleStatusChange(id: string, status: IdeaStatus) {
    updateStatus(id, status);
    showToast(`Status atualizado para ${status}.`);
    // Keep productionIdea in sync
    if (productionIdea?.id === id) {
      setProductionIdea((prev) => prev ? { ...prev, status } : null);
    }
  }

  function handleKeepIdea(id: string) {
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return;
    // Re-save with current content to bump updatedAt
    const { id: _id, createdAt: _c, updatedAt: _u, ...input } = idea;
    updateIdea(id, input as IdeaInput);
  }

  async function handleCopy(idea: Idea) {
    try {
      await copyText(generateBriefing(idea));
      showToast('Briefing copiado para a área de transferência.');
    } catch {
      showToast('Não consegui copiar automaticamente. Abra a ideia e tente novamente.', 2600);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-ink/88 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <button type="button" className="flex w-fit items-center gap-3 text-left" onClick={() => setView('dashboard')}>
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-ember text-white shadow-lg shadow-orange-950/40">
              <Sparkles size={24} />
            </span>
            <span>
              <span className="block text-xl font-bold text-white">Content Spark</span>
              <span className="block text-sm text-slate-400">Ideias brutas em briefings, conteúdos e projetos</span>
            </span>
          </button>

          <nav className="flex flex-wrap gap-2">
            <NavButton active={view === 'dashboard'} icon={LayoutDashboard} label="Dashboard" onClick={() => setView('dashboard')} />
            <NavButton active={view === 'library'} icon={Library} label="Biblioteca" onClick={() => setView('library')} />
            <NavButton active={view === 'pipeline'} icon={Columns3} label="Pipeline" onClick={() => setView('pipeline')} />
            <button type="button" className="btn btn-primary" onClick={() => setView('new')}>
              <Plus size={18} /> Nova ideia
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {view === 'dashboard' ? (
          <Dashboard
            stats={stats}
            ideas={ideas}
            onCreate={() => setView('new')}
            onOpen={openIdea}
            onCopy={handleCopy}
            onMoveReady={handleMoveReady}
            onQuickCapture={handleQuickCapture}
            onProduce={openProduction}
            onArchive={handleArchive}
            onStatusChange={handleStatusChange}
            onOpenReview={() => setReviewModeOpen(true)}
          />
        ) : null}

        {view === 'library' ? (
          <LibraryView
            ideas={filteredIdeas}
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={() => setFilters(defaultFilters)}
            onOpen={openIdea}
            onCopy={handleCopy}
            onToggleFavorite={handleToggleFavorite}
            onArchive={handleArchive}
            onCreate={() => setView('new')}
          />
        ) : null}

        {view === 'pipeline' ? (
          <PipelineView
            ideas={ideas}
            filters={pipelineFilters}
            onFiltersChange={setPipelineFilters}
            onClearFilters={() => setPipelineFilters(defaultPipelineFilters)}
            onOpen={openIdea}
            onCopy={handleCopy}
            onToggleFavorite={handleToggleFavorite}
            onArchive={handleArchive}
            onStatusChange={handleStatusChange}
          />
        ) : null}

        {view === 'new' ? (
          <section>
            <PageTitle title="Nova ideia" description="Capture o material bruto e já deixe a pauta pronta para evoluir." />
            <IdeaForm onSubmit={handleCreate} submitLabel="Criar ideia" />
          </section>
        ) : null}

        {view === 'detail' && selectedIdea ? (
          <IdeaDetail
            key={selectedIdea.id}
            idea={selectedIdea}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => setView('library')}
            onShowToast={showToast}
          />
        ) : null}
      </main>

      {toast ? (
        <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-emerald-400/30 bg-slate-950 px-4 py-3 text-sm font-semibold text-emerald-100 shadow-glow">
          {toast}
        </div>
      ) : null}

      {productionIdea ? (
        <ProductionMode
          idea={productionIdea}
          onClose={() => setProductionIdea(null)}
          onOpen={(id) => {
            setProductionIdea(null);
            openIdea(id);
          }}
          onStatusChange={handleStatusChange}
          onArchive={handleArchive}
          onShowToast={showToast}
        />
      ) : null}

      {reviewModeOpen ? (
        <ReviewMode
          ideas={ideas}
          onClose={() => setReviewModeOpen(false)}
          onKeep={handleKeepIdea}
          onImprove={(id) => {
            setReviewModeOpen(false);
            openIdea(id);
          }}
          onProduce={(idea) => {
            setReviewModeOpen(false);
            openProduction(idea);
          }}
          onArchive={handleArchive}
        />
      ) : null}
    </div>
  );
}

function Dashboard({
  stats,
  ideas,
  onCreate,
  onOpen,
  onCopy,
  onMoveReady,
  onQuickCapture,
  onProduce,
  onArchive,
  onStatusChange,
  onOpenReview,
}: {
  stats: Record<string, number>;
  ideas: Idea[];
  onCreate: () => void;
  onOpen: (id: string) => void;
  onCopy: (idea: Idea) => void;
  onMoveReady: (id: string) => void;
  onQuickCapture: (rawIdea: string, ideaType: IdeaType) => void;
  onProduce: (idea: Idea) => void;
  onArchive: (id: string) => void;
  onStatusChange: (id: string, status: IdeaStatus) => void;
  onOpenReview: () => void;
}) {
  const actionQueue = getActionQueueIdeas(ideas);
  const staleIdeas = getStaleIdeas(ideas);
  const topPotentialIdeas = getTopPotentialIdeas(ideas);
  const reviewCount = getIdeasNeedingReview(ideas).length;
  const health = getBacklogHealth(ideas);

  return (
    <section className="grid gap-5">
      {/* Quick Capture */}
      <QuickCapture onCapture={onQuickCapture} onCreate={onCreate} />

      {/* Action metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total de ideias" value={stats.total} />
        <StatCard icon={Flame} label="Prontas para produzir" value={stats.ready} highlight />
        <StatCard icon={Clock3} label="Ideias paradas" value={stats.stale} />
        <StatCard icon={Star} label="Favoritas" value={stats.favorites} />
      </div>

      {/* Backlog Health */}
      {ideas.length ? (
        <BacklogHealthCard health={health} reviewCount={reviewCount} onOpenReview={onOpenReview} />
      ) : null}

      {/* Pipeline summary */}
      {ideas.length ? <PipelineSummary ideas={ideas} /> : null}

      {/* Action Queue + Stalled Ideas */}
      {ideas.length ? (
        <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <DashboardPanel
            title="Para produzir agora"
            description="Favoritas, prioridade alta, score 19+ ou com próxima ação definida."
          >
            {actionQueue.length ? (
              <div className="grid gap-3">
                {actionQueue.map((idea) => (
                  <ActionQueueItem
                    key={idea.id}
                    idea={idea}
                    onOpen={onOpen}
                    onCopy={onCopy}
                    onProduce={onProduce}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Flame}
                title="Nada urgente na mesa."
                description="Marque uma ideia como pronta, favorita ou adicione uma próxima ação para ela aparecer aqui."
              />
            )}
          </DashboardPanel>

          <DashboardPanel title="Ideias paradas" description="Sem atualização há 7+ dias — revisite antes que percam contexto.">
            {staleIdeas.length ? (
              <div className="grid gap-3">
                {staleIdeas.slice(0, 4).map((idea) => (
                  <StaleItem
                    key={idea.id}
                    idea={idea}
                    reason={getStalledReason(idea)}
                    onOpen={onOpen}
                    onArchive={onArchive}
                  />
                ))}
                {staleIdeas.length > 4 && (
                  <p className="text-xs text-slate-500 text-center">
                    +{staleIdeas.length - 4} mais na Biblioteca
                  </p>
                )}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="Nenhuma ideia encalhada."
                description="Seu backlog recente está saudável."
              />
            )}
          </DashboardPanel>
        </div>
      ) : null}

      {/* Top potencial */}
      {ideas.length ? (
        <DashboardPanel title="Top ideias por potencial" description="Ideias ativas com maior score — priorize a próxima produção.">
          {topPotentialIdeas.length ? (
            <div className="grid gap-3">
              {topPotentialIdeas.map((idea) => (
                <TopPotentialItem key={idea.id} idea={idea} onOpen={onOpen} onCopy={onCopy} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Flame}
              title="Nenhuma ideia ativa para ranquear"
              description="Crie ou desarquive ideias para montar seu ranking de potencial."
            />
          )}
        </DashboardPanel>
      ) : null}
    </section>
  );
}

function QuickCapture({ onCapture, onCreate }: { onCapture: (rawIdea: string, ideaType: IdeaType) => void; onCreate: () => void }) {
  const [text, setText] = useState('');
  const [ideaType, setIdeaType] = useState<IdeaType>('Conteúdo');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onCapture(trimmed, ideaType);
    setText('');
  }

  return (
    <div className="surface rounded-lg p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-ember" />
          <span className="text-sm font-semibold text-slate-200">Captura rápida</span>
        </div>
        <button type="button" className="btn btn-ghost text-xs" onClick={onCreate}>
          <FilePlus2 size={15} /> Ideia completa
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-3">
        <textarea
          className="field min-h-[4.5rem] resize-none"
          placeholder="O que surgiu na sua mente?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            className="field sm:w-52"
            value={ideaType}
            onChange={(e) => setIdeaType(e.target.value as IdeaType)}
          >
            {ideaTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
          <button type="submit" className="btn btn-primary" disabled={!text.trim()}>
            <FilePlus2 size={18} /> Salvar ideia
          </button>
        </div>
      </form>
    </div>
  );
}

function PipelineSummary({ ideas }: { ideas: Idea[] }) {
  const counts = statuses.map((status) => ({
    status,
    count: ideas.filter((idea) => idea.status === status).length,
  }));

  return (
    <DashboardPanel title="Distribuição no pipeline" description="Volume de ideias por etapa de produção.">
      <div className="grid gap-3 md:grid-cols-5">
        {counts.map(({ status, count }) => (
          <div
            key={status}
            className={`rounded-lg border p-3 ${
              status === 'Pronto para produzir'
                ? 'border-orange-300/50 bg-orange-500/15'
                : 'border-line bg-slate-950/55'
            }`}
          >
            <Badge tone={statusTone(status)}>{status}</Badge>
            <p className="mt-3 text-2xl font-bold text-white">{count}</p>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}

function LibraryView({
  ideas,
  filters,
  onFiltersChange,
  onClearFilters,
  onOpen,
  onCopy,
  onToggleFavorite,
  onArchive,
  onCreate,
}: {
  ideas: Idea[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
  onOpen: (id: string) => void;
  onCopy: (idea: Idea) => void;
  onToggleFavorite: (id: string) => void;
  onArchive: (id: string) => void;
  onCreate: () => void;
}) {
  const hasActiveFilters = isFilteringActive(filters);

  return (
    <section className="grid gap-5">
      <PageTitle title="Biblioteca de ideias" description="Busque, filtre e abra qualquer ideia para editar ou copiar o briefing." />
      <FiltersBar filters={filters} onChange={onFiltersChange} onClear={onClearFilters} />
      {ideas.length ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onOpen={onOpen}
              onCopy={onCopy}
              onToggleFavorite={onToggleFavorite}
              onArchive={onArchive}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Library}
          title={hasActiveFilters ? 'Nenhuma ideia bate com esses filtros' : 'Biblioteca pronta para receber ideias'}
          description={
            hasActiveFilters
              ? 'Tente ampliar a busca, remover algum filtro ou limpar tudo para reencontrar suas pautas.'
              : 'Quando você criar ideias, elas aparecem aqui com atalhos para briefing, favorito e arquivamento.'
          }
          action={
            hasActiveFilters ? (
              <button className="btn btn-secondary" onClick={onClearFilters}>Limpar filtros</button>
            ) : (
              <button className="btn btn-primary" onClick={onCreate}><Plus size={18} /> Criar ideia</button>
            )
          }
        />
      )}
    </section>
  );
}

function DashboardPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="surface rounded-lg p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ActionQueueItem({
  idea,
  onOpen,
  onCopy,
  onProduce,
}: {
  idea: Idea;
  onOpen: (id: string) => void;
  onCopy: (idea: Idea) => void;
  onProduce: (idea: Idea) => void;
}) {
  const score = calculatePotentialScore(idea);

  return (
    <article className="rounded-lg border border-line bg-slate-950/55 p-3">
      <div className="mb-2 flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-semibold text-white">{idea.title || 'Sem título'}</h3>
        </div>
        {idea.favorite && <Star size={14} className="shrink-0 fill-amber-400 text-amber-400 mt-0.5" />}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge tone={ideaTypeTone(idea.ideaType ?? 'Outro')}>{idea.ideaType ?? 'Outro'}</Badge>
        <Badge tone={statusTone(idea.status)}>{idea.status}</Badge>
        <Badge tone={priorityTone(idea.priority)}>{idea.priority}</Badge>
        <PotentialScore idea={idea} compact />
        {score >= 19 && (
          <span className="text-xs font-semibold text-ember">{score}/25</span>
        )}
      </div>

      {idea.nextAction && (
        <p className="mb-2 truncate text-xs text-slate-400">
          <span className="font-medium text-slate-300">Próxima:</span> {idea.nextAction}
        </p>
      )}

      {idea.updatedAt && (
        <p className="mb-2 text-xs text-slate-500 flex items-center gap-1">
          <Clock3 size={11} /> {formatDate(idea.updatedAt)}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" className="btn btn-ghost px-2.5 text-xs" onClick={() => onOpen(idea.id)}>
          <ArrowRight size={14} /> Abrir
        </button>
        <button type="button" className="btn btn-secondary px-2.5 text-xs" onClick={() => onCopy(idea)}>
          <Copy size={14} /> Copiar briefing
        </button>
        <button type="button" className="btn btn-primary px-2.5 text-xs" onClick={() => onProduce(idea)}>
          <Play size={14} /> Produzir agora
        </button>
      </div>
    </article>
  );
}

function TopPotentialItem({ idea, onOpen, onCopy }: { idea: Idea; onOpen: (id: string) => void; onCopy: (idea: Idea) => void }) {
  const details = getPotentialScoreDetails(idea);

  return (
    <article className="rounded-lg border border-line bg-slate-950/55 p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-semibold text-white">{idea.title || 'Sem título'}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="channel">{idea.channel}</Badge>
            <Badge tone="type">{idea.type}</Badge>
            <PotentialScore idea={idea} compact />
            <span className="text-xs font-semibold text-slate-400">{details.classification}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button type="button" className="btn btn-secondary px-2.5" onClick={() => onOpen(idea.id)}>
            <ArrowRight size={16} /> Abrir
          </button>
          <button type="button" className="btn btn-primary px-2.5" onClick={() => onCopy(idea)}>
            <Copy size={16} /> Copiar
          </button>
        </div>
      </div>
    </article>
  );
}

function StaleItem({
  idea,
  reason,
  onOpen,
  onArchive,
}: {
  idea: Idea;
  reason: StalledReason;
  onOpen: (id: string) => void;
  onArchive: (id: string) => void;
}) {
  return (
    <article className="rounded-lg border border-line bg-slate-950/55 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-semibold text-white">{idea.title || 'Sem título'}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(idea.status)}>{idea.status}</Badge>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300">
              <AlertCircle size={11} /> {reason}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Clock3 size={11} /> {formatDate(idea.updatedAt ?? idea.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="btn btn-secondary px-2.5 text-xs" onClick={() => onOpen(idea.id)}>
            <ArrowRight size={14} /> Abrir
          </button>
          <button type="button" className="btn btn-ghost px-2.5 text-xs text-slate-500" onClick={() => onArchive(idea.id)}>
            <Archive size={13} /> Arquivar
          </button>
        </div>
      </div>
    </article>
  );
}

function PageTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight = false }: { icon: ElementType; label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`surface rounded-lg p-4 ${highlight && value > 0 ? 'border-ember/40' : ''}`}>
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-slate-900 ${highlight ? 'text-ember' : 'text-slate-400'}`}>
        <Icon size={20} />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function BacklogHealthCard({
  health,
  reviewCount,
  onOpenReview,
}: {
  health: number;
  reviewCount: number;
  onOpenReview: () => void;
}) {
  const label = getBacklogHealthLabel(health);
  const color =
    health >= 80
      ? 'text-emerald-400'
      : health >= 60
        ? 'text-amber-400'
        : 'text-red-400';
  const borderColor =
    health >= 80
      ? 'border-emerald-500/20'
      : health >= 60
        ? 'border-amber-500/20'
        : 'border-red-500/20';

  return (
    <div className={`surface rounded-lg border ${borderColor} p-4`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-slate-900">
            <ShieldCheck size={20} className={color} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Saúde do backlog</p>
            <p className={`text-xs font-medium ${color}`}>{label}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`text-2xl font-bold ${color}`}>{health}%</p>
            <p className="text-xs text-slate-400">
              {reviewCount > 0 ? `${reviewCount} precisam de revisão` : 'Nenhuma ideia precisa de revisão'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary shrink-0 text-xs"
            onClick={onOpenReview}
          >
            <RefreshCw size={14} /> Revisar ideias
          </button>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: ElementType; label: string; onClick: () => void }) {
  return (
    <button type="button" className={`btn ${active ? 'btn-secondary border-ember/70 text-orange-100' : 'btn-ghost'}`} onClick={onClick}>
      <Icon size={18} /> {label}
    </button>
  );
}

export default App;
