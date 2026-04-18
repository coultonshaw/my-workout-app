import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-4 ${elevated ? 'bg-bg-elevated' : 'bg-bg-surface'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
