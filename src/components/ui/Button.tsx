import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary:
    'bg-gradient-to-br from-accent-bright via-accent to-accent-dim text-black font-semibold tracking-wide shadow-gold active:scale-[0.97] hover:shadow-gold-lg',
  ghost: 'bg-transparent hover:bg-bg-elevated text-white/80 hover:text-white active:scale-[0.97]',
  danger: 'bg-red-900/60 hover:bg-red-800/60 border border-red-500/30 text-red-300 font-medium active:scale-[0.97]',
  outline:
    'border border-white/[0.08] hover:border-accent/30 hover:bg-bg-elevated text-white/70 hover:text-white active:scale-[0.97]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-3 text-sm rounded-xl',
  lg: 'px-6 py-4 text-base rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center gap-2 transition-all duration-150
          ${variants[variant]} ${sizes[size]}
          ${disabled ? 'opacity-40 pointer-events-none' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
