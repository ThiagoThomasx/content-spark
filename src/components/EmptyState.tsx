import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
};

export function EmptyState({ icon: Icon, title, description, action, compact = false }: EmptyStateProps) {
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line/50 px-4 py-6 text-center">
        <Icon size={16} className="mb-2 text-slate-600" />
        <p className="text-xs font-medium text-slate-500">{title}</p>
        {description ? <p className="mt-0.5 text-xs text-slate-600">{description}</p> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    );
  }

  return (
    <div className="surface flex min-h-64 flex-col items-center justify-center rounded-lg px-6 py-10 text-center">
      <div className="mb-4 rounded-lg border border-line bg-slate-900 p-3 text-ember">
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
