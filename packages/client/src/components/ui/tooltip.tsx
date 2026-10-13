import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delayDuration?: number;
}

export function Tooltip({ content, children, side = 'top', className, delayDuration = 200 }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={cn(
              'z-50 px-3 py-1.5 text-xs font-sans',
              'bg-z-surface-2 text-z-text-primary border border-z-border',
              'shadow-z-md',
              'animate-fade-in',
              className
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-[var(--z-surface-2)]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
