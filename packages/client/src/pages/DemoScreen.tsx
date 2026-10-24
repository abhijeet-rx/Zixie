import React from 'react';
import { Info } from 'lucide-react';
import { FadeUp } from '../components/motion/primitives';

export const DemoScreen: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => {
  return (
    <FadeUp style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Required Demo Disclosure Banner */}
      <div
        role="note"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <Info size={16} color="var(--accent)" />
        <span>This feature is in development. Data shown is for illustration only.</span>
      </div>

      <div className="zixie-card" style={{ padding: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{description}</p>
      </div>
    </FadeUp>
  );
};
