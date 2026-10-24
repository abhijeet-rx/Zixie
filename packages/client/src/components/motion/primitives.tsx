import React, { useEffect, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  animate,
  HTMLMotionProps,
} from 'framer-motion';

/**
 * 1. FadeUp — every page mount
 */
export const FadeUp: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  );
};

/**
 * 2. StaggerContainer & StaggerItem — for lists and card grids
 */
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: reduced ? 1 : 0 },
        visible: {
          opacity: 1,
          transition: reduced
            ? { duration: 0 }
            : { staggerChildren: 0.06, delayChildren: 0.1 },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: reduced
            ? { duration: 0 }
            : { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 3. ScaleIn — for modals, drawers, popovers
 */
export const ScaleIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 4. SlideInRight — for detail drawers/panels
 */
export const SlideInRight: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? { x: 0, opacity: 1 } : { x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={reduced ? { opacity: 0 } : { x: 40, opacity: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  );
};

/**
 * 5. CountUp — KPI metric numbers on Overview (0 to final over 0.8s on mount)
 */
export const CountUp: React.FC<{
  value: number;
  decimals?: number;
  suffix?: string;
}> = ({ value, decimals = 0, suffix = '' }) => {
  const reduced = useReducedMotion();
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState<string>(() =>
    reduced ? value.toFixed(decimals) : (0).toFixed(decimals)
  );

  useEffect(() => {
    if (reduced) {
      setDisplay(value.toFixed(decimals));
      return;
    }
    motionVal.set(0);
    const controls = animate(motionVal, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplay(latest.toFixed(decimals));
      },
    });
    return () => controls.stop();
  }, [value, decimals, reduced, motionVal]);

  return (
    <span className="mono">
      {display}
      {suffix}
    </span>
  );
};

/**
 * 6. MatrixCellHover — for similarity matrix cells
 */
export const MatrixCellHover: React.FC<
  HTMLMotionProps<'button'> & { children: React.ReactNode }
> = ({ children, ...rest }) => {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      whileHover={reduced ? undefined : { scale: 1.15, zIndex: 10 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={reduced ? { duration: 0 } : { duration: 0.12 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

/**
 * 7. RiskPulse — ONLY for COLLUSION_DETECTED verdict badges
 */
export const RiskPulse: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reduced = useReducedMotion();
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {!reduced && (
        <motion.span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: 'var(--radius-control)',
            border: '2px solid var(--risk-collusion)',
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.6, 0], scale: [1, 1.08] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      {children}
    </span>
  );
};

/**
 * 8. PageTransition — wraps every route inside AnimatePresence
 */
export const PageTransition: React.FC<{
  children: React.ReactNode;
  routeKey: string;
}> = ({ children, routeKey }) => {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        style={{ height: '100%', width: '100%' }}
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 0.15, ease: [0.16, 1, 0.3, 1] }
        }
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Reusable interactive motion button/surface ensuring no bare click handlers exist without motion
 */
export const MotionButton: React.FC<HTMLMotionProps<'button'>> = ({
  children,
  ...props
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.button
      whileHover={reduced ? undefined : { scale: 1.01 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={reduced ? { duration: 0 } : { duration: 0.12 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};
