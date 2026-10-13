import { cn } from '../../lib/cn';
import type { RiskLevel } from '../../lib/types';
import { riskLabel } from '../../lib/utils';
import { AlertTriangle, CheckCircle, Eye } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  showIcon?: boolean;
}

export function RiskBadge({ level, className, showIcon = true }: RiskBadgeProps) {
  const label = riskLabel(level);

  return (
    <span
      className={cn(
        'z-evidence-tag',
        level === 'HIGH' && 'bg-z-flagged-subtle text-z-flagged-text border-[var(--z-flagged)]/20',
        level === 'MEDIUM' && 'bg-z-review-subtle text-z-review-text border-[var(--z-review)]/20',
        level === 'LOW' && 'bg-z-clear-subtle text-z-clear-text border-[var(--z-clear)]/20',
        className
      )}
      role="status"
      aria-label={`Risk level: ${label}`}
    >
      {showIcon && (
        <>
          {level === 'HIGH' && <AlertTriangle className="w-3 h-3" aria-hidden="true" />}
          {level === 'MEDIUM' && <Eye className="w-3 h-3" aria-hidden="true" />}
          {level === 'LOW' && <CheckCircle className="w-3 h-3" aria-hidden="true" />}
        </>
      )}
      <span>{label}</span>
    </span>
  );
}
