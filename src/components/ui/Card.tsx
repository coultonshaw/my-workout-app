import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  gold?: boolean;
}

export function Card({ elevated = false, gold = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl p-4
        ${elevated ? 'bg-bg-elevated' : 'bg-bg-surface'}
        ${gold
          ? 'border border-accent/20 shadow-gold-sm'
          : 'border border-white/[0.04]'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
