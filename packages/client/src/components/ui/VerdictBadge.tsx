import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { VerdictType } from '../../types/zixie';
import { RiskPulse } from '../motion/primitives';

export const VerdictBadge: React.FC<{ verdict: VerdictType }> = ({ verdict }) => {
  if (verdict === 'COLLUSION_DETECTED') {
    return (
      <RiskPulse>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: '2px var(--space-2)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            color: 'var(--risk-collusion)',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-control)',
          }}
        >
          <ShieldAlert size={12} aria-hidden="true" />
          COLLUSION_DETECTED
        </span>
      </RiskPulse>
    );
  }

  if (verdict === 'SUSPICIOUS') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          padding: '2px var(--space-2)',
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          color: 'var(--risk-suspicious)',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-control)',
        }}
      >
        <AlertTriangle size={12} aria-hidden="true" />
        SUSPICIOUS
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: '2px var(--space-2)',
        fontSize: 'var(--text-xs)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        color: 'var(--risk-clear)',
        backgroundColor: 'rgba(34, 197, 94, 0.12)',
        border: '1px solid rgba(34, 197, 94, 0.35)',
        borderRadius: 'var(--radius-control)',
      }}
    >
      <CheckCircle2 size={12} aria-hidden="true" />
      CLEAR
    </span>
  );
};
