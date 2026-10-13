import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '../../lib/cn';

interface ScoreGaugeProps {
  /** Score from 0 to 1 */
  score: number;
  /** Size in pixels */
  size?: number;
  /** Label below the score */
  label?: string;
  /** Custom class */
  className?: string;
}

/**
 * Circular arc gauge with animated count-up for AI probability and similarity scores.
 * Uses SVG with stroke-dasharray for the arc.
 */
export function ScoreGauge({ score, size = 80, label, className }: ScoreGaugeProps) {
  const percent = Math.round(score * 100);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  // Animated count-up
  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 800;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * percent);
      setDisplayValue(start);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [isInView, percent]);

  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - (isInView ? score : 0));

  // Color based on score
  const getColor = () => {
    if (score >= 0.7) return 'var(--z-flagged)';
    if (score >= 0.4) return 'var(--z-review)';
    return 'var(--z-clear)';
  };

  return (
    <div ref={ref} className={cn('inline-flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="meter"
          aria-label={`Score: ${percent}%`}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--z-border)"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: isInView ? dashOffset : circumference }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        {/* Center number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono font-bold tabular-nums"
            style={{
              fontSize: size * 0.28,
              color: getColor(),
            }}
          >
            {displayValue}
          </span>
        </div>
      </div>
      {label && (
        <span className="z-label text-center">{label}</span>
      )}
    </div>
  );
}
