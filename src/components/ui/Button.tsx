import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-accent hover:bg-accent-dim text-black font-semibold active:scale-95',
  ghost: 'bg-transparent hover:bg-bg-elevated text-white active:scale-95',
  danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold active:scale-95',
  outline: 'border border-bg-elevated hover:bg-bg-elevated text-white active:scale-95',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-3 text-base rounded-xl',
  lg: 'px-6 py-4 text-lg rounded-2xl',
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
