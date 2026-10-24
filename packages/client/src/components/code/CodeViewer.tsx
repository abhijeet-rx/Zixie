import React, { useEffect, useState } from 'react';
import type { ThemedToken } from 'shiki';
import { Check, Copy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MotionButton } from '../motion/primitives';

export interface HighlightRange {
  startLine: number;
  endLine: number;
}

interface CodeViewerProps {
  code: string;
  language: string;
  highlightedRanges?: HighlightRange[];
  maxHeight?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language,
  highlightedRanges = [],
  maxHeight = '540px',
}) => {
  const { theme } = useApp();
  const [tokenLines, setTokenLines] = useState<ThemedToken[][] | null>(null);
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const lines = code.split(/\r?\n/);

  useEffect(() => {
    let active = true;
    const shikiTheme = theme === 'dark' ? 'github-dark-default' : 'github-light-default';

    import('shiki')
      .then(({ codeToTokens }) => codeToTokens(code, {
        lang: (language as any) || 'typescript',
        theme: shikiTheme,
      }))
      .then((res) => {
        if (active) setTokenLines(res.tokens);
      })
      .catch(() => {
        if (active) setTokenLines(null);
      });

    return () => {
      active = false;
    };
  }, [code, language, theme]);

  const isLineHighlighted = (lineNumber: number): boolean =>
    highlightedRanges.some(
      (range) => lineNumber >= range.startLine && lineNumber <= range.endLine
    );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="zixie-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-base)',
        overflow: 'hidden',
      }}
    >
      {hovered && (
        <MotionButton
          type="button"
          onClick={handleCopy}
          aria-label="Copy source code"
          className="zixie-button"
          style={{
            position: 'absolute',
            top: 'var(--space-2)',
            right: 'var(--space-2)',
            zIndex: 5,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-2)',
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
          }}
        >
          {copied ? <Check size={12} color="var(--risk-clear)" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </MotionButton>
      )}

      <div
        style={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight,
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-code)',
          lineHeight: 1.5,
        }}
      >
        <div style={{ minWidth: 'max-content', padding: 'var(--space-2) 0' }}>
          {lines.map((rawLine, idx) => {
            const lineNum = idx + 1;
            const matched = isLineHighlighted(lineNum);
            const tokens = tokenLines ? tokenLines[idx] : null;

            return (
              <div
                key={lineNum}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  paddingRight: 'var(--space-4)',
                  borderLeft: matched
                    ? '3px solid var(--risk-suspicious)'
                    : '3px solid transparent',
                  backgroundColor: matched
                    ? 'rgba(245, 158, 11, 0.08)'
                    : 'transparent',
                }}
              >
                <span
                  style={{
                    width: 48,
                    flexShrink: 0,
                    userSelect: 'none',
                    textAlign: 'right',
                    paddingRight: 'var(--space-3)',
                    color: matched ? 'var(--risk-suspicious)' : 'var(--text-muted)',
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  {lineNum}
                </span>
                <span style={{ whiteSpace: 'pre' }}>
                  {tokens
                    ? tokens.map((t, tIdx) => (
                        <span key={tIdx} style={{ color: t.color }}>
                          {t.content}
                        </span>
                      ))
                    : rawLine || ' '}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


