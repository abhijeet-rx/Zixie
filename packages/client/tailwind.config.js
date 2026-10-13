/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      display: ['Instrument Serif', 'serif'],
      sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono:    ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
    },
    extend: {
      colors: {
        z: {
          bg:            'var(--z-bg)',
          'surface-1':   'var(--z-surface-1)',
          'surface-2':   'var(--z-surface-2)',
          'surface-3':   'var(--z-surface-3)',
          'surface-inset': 'var(--z-surface-inset)',
          border:        'var(--z-border)',
          'border-strong': 'var(--z-border-strong)',
          'border-subtle': 'var(--z-border-subtle)',
          'text-primary':  'var(--z-text-primary)',
          'text-secondary':'var(--z-text-secondary)',
          'text-muted':    'var(--z-text-muted)',
          'text-inverse':  'var(--z-text-inverse)',
          accent:          'var(--z-accent)',
          'accent-hover':  'var(--z-accent-hover)',
          'accent-subtle': 'var(--z-accent-subtle)',
          'accent-text':   'var(--z-accent-text)',
          clear:           'var(--z-clear)',
          'clear-subtle':  'var(--z-clear-subtle)',
          'clear-text':    'var(--z-clear-text)',
          review:          'var(--z-review)',
          'review-subtle': 'var(--z-review-subtle)',
          'review-text':   'var(--z-review-text)',
          flagged:         'var(--z-flagged)',
          'flagged-subtle':'var(--z-flagged-subtle)',
          'flagged-text':  'var(--z-flagged-text)',
        },
      },
      fontSize: {
        'xs':   ['0.6875rem', { lineHeight: '1rem' }],
        'sm':   ['0.8125rem', { lineHeight: '1.25rem' }],
        'base': ['0.9375rem', { lineHeight: '1.5rem' }],
        'lg':   ['1.125rem',  { lineHeight: '1.625rem' }],
        'xl':   ['1.375rem',  { lineHeight: '1.75rem' }],
        '2xl':  ['1.75rem',   { lineHeight: '2.125rem' }],
        '3xl':  ['2.25rem',   { lineHeight: '2.625rem' }],
        '4xl':  ['2.875rem',  { lineHeight: '3.25rem' }],
        '5xl':  ['3.75rem',   { lineHeight: '4rem' }],
      },
      boxShadow: {
        'z-sm':  'var(--z-shadow-sm)',
        'z-md':  'var(--z-shadow-md)',
        'z-lg':  'var(--z-shadow-lg)',
      },
      transitionTimingFunction: {
        'z-out':    'var(--ease-out)',
        'z-in-out': 'var(--ease-in-out)',
        'z-spring': 'var(--ease-spring)',
      },
      transitionDuration: {
        'z-fast':   '120ms',
        'z-base':   '200ms',
        'z-slow':   '400ms',
        'z-slower': '600ms',
      },
      borderColor: {
        DEFAULT: 'var(--z-border)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scan-line': {
          from: { transform: 'translateX(-100%)' },
          to:   { transform: 'translateX(100%)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in':      'fade-in 0.5s var(--ease-out) forwards',
        'fade-in-up':   'fade-in-up 0.6s var(--ease-out) forwards',
        'scan-line':    'scan-line 2s var(--ease-in-out) infinite',
        'pulse-subtle': 'pulse-subtle 2s var(--ease-in-out) infinite',
      },
    },
  },
  plugins: [],
}
