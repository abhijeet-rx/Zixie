import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { MotionButton } from '../motion/primitives';

export const EmptyStateView: React.FC<{
  icon: React.ReactNode;
  heading: string;
  subtext: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon, heading, subtext, actionLabel, onAction }) => (
  <div
    className="zixie-card"
    style={{
      padding: 'var(--space-12)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 'var(--space-3)',
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
      }}
    >
      {icon}
    </div>
    <h2 style={{ fontSize: 'var(--text-base)' }}>{heading}</h2>
    <p
      style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        maxWidth: 440,
      }}
    >
      {subtext}
    </p>
    {actionLabel && onAction && (
      <MotionButton
        type="button"
        onClick={onAction}
        className="zixie-button"
        style={{
          marginTop: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--accent)',
          borderColor: 'var(--accent)',
          color: '#FAFAFA',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {actionLabel}
      </MotionButton>
    )}
  </div>
);

export const ErrorStateView: React.FC<{
  message: string;
  onRetry: () => void;
}> = ({ message, onRetry }) => (
  <div
    className="zixie-card"
    role="alert"
    style={{
      padding: 'var(--space-8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 'var(--space-3)',
      borderColor: 'rgba(239, 68, 68, 0.4)',
    }}
  >
    <AlertCircle size={24} color="var(--risk-collusion)" />
    <h2 style={{ fontSize: 'var(--text-base)' }}>Failed to load workspace data</h2>
    <p
      className="mono"
      style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
        maxWidth: 480,
      }}
    >
      {message}
    </p>
    <MotionButton
      type="button"
      onClick={onRetry}
      className="zixie-button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-4)',
        backgroundColor: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
      }}
    >
      <RefreshCw size={14} />
      Retry request
    </MotionButton>
  </div>
);
