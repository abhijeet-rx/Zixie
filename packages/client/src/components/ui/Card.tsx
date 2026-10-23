import { cn } from '../../lib/cn';

export interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ className, children }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg bg-white dark:bg-z-surface-2 border border-z-border p-4 shadow-z-sm',
        className,
      )}
    >
      {children}
    </div>
  );
};
