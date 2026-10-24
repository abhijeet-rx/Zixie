import React from 'react';

export const SiteFooter: React.FC = () => (
  <footer
    aria-label="Site footer"
    style={{
      width: '100%',
      minHeight: 64,
      marginTop: 'auto',
      padding: 'var(--space-4) 0 var(--space-2)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 'var(--space-3) var(--space-5)',
      color: 'var(--text-secondary)',
      fontSize: 'var(--text-xs)',
    }}
  >
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span>Made with</span>
      <span role="img" aria-label="love">❤️</span>
      <span>by <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Abhijeet Singh</strong></span>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
      <a
        href="https://github.com/abhijeet-rx"
        target="_blank"
        rel="noreferrer"
        aria-label="Abhijeet Singh on GitHub"
        title="GitHub · @abhijeet-rx"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
        }}
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.04c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.64-1.24-1.64-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.47-.28-5.06-1.24-5.06-5.5 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3.01 0 4.27-2.6 5.21-5.08 5.49.4.35.75 1.02.75 2.07V22c0 .29.2.64.77.53A11.1 11.1 0 0 0 12 .9Z" />
        </svg>
        <span>@abhijeet-rx</span>
      </a>
      <span style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} Zixie</span>
    </div>
  </footer>
);
