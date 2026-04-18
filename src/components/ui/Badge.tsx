import type { Recommendation } from '@/types';

interface BadgeProps {
  type: Recommendation | 'pb';
  label?: string;
  className?: string;
}

const config: Record<string, { bg: string; text: string; icon: string }> = {
  increase: { bg: 'bg-status-increase/20', text: 'text-status-increase', icon: '↑' },
  decrease: { bg: 'bg-status-decrease/20', text: 'text-red-400', icon: '↓' },
  keep: { bg: 'bg-status-keep/20', text: 'text-accent', icon: '→' },
  pending: { bg: 'bg-bg-elevated', text: 'text-gray-500', icon: '…' },
  pb: { bg: 'bg-accent/20', text: 'text-accent', icon: '🏆' },
};

const defaultLabels: Record<string, string> = {
  increase: 'Increase weight',
  decrease: 'Decrease weight',
  keep: 'Keep weight',
  pending: 'In progress',
  pb: 'Personal best',
};

export function Badge({ type, label, className = '' }: BadgeProps) {
  const c = config[type] ?? config.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text} ${className}`}
    >
      <span>{c.icon}</span>
      <span>{label ?? defaultLabels[type]}</span>
    </span>
  );
}
