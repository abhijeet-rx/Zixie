import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-z-base ease-z-out',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--z-accent)]',
          'disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          // Size variants
          size === 'sm' && 'text-xs px-3 py-1.5',
          size === 'md' && 'text-sm px-4 py-2',
          size === 'lg' && 'text-base px-6 py-2.5',
          // Style variants
          variant === 'primary' && [
            'bg-z-accent text-white hover:bg-z-accent-hover',
            'shadow-z-sm',
          ],
          variant === 'secondary' && [
            'bg-z-surface-2 text-z-text-primary border border-z-border',
            'hover:bg-z-surface-3 hover:border-z-border-strong',
          ],
          variant === 'ghost' && [
            'text-z-text-secondary hover:text-z-text-primary hover:bg-[var(--z-hover-overlay)]',
          ],
          variant === 'danger' && [
            'bg-z-flagged-subtle text-z-flagged-text border border-z-flagged/20',
            'hover:bg-z-flagged/20',
          ],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
