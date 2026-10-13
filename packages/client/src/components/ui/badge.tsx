import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'clear' | 'review' | 'flagged' | 'accent' | 'muted';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'z-evidence-tag whitespace-nowrap',
        variant === 'default' && 'bg-z-surface-2 text-z-text-secondary border-z-border',
        variant === 'clear'   && 'bg-z-clear-subtle text-z-clear-text border-[var(--z-clear)]/20',
        variant === 'review'  && 'bg-z-review-subtle text-z-review-text border-[var(--z-review)]/20',
        variant === 'flagged' && 'bg-z-flagged-subtle text-z-flagged-text border-[var(--z-flagged)]/20',
        variant === 'accent'  && 'bg-z-accent-subtle text-z-accent-text border-[var(--z-accent)]/20',
        variant === 'muted'   && 'bg-z-surface-1 text-z-text-muted border-z-border-subtle',
        className
      )}
      {...props}
    />
  );
}
