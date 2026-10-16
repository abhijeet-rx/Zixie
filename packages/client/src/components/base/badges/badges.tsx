import React from 'react';

interface BadgeWithDotProps {
  color?: 'success' | 'gray' | 'primary' | 'warning' | 'error';
  type?: 'modern' | 'pill-color' | 'pill-outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function BadgeWithDot({
  color = 'success',
  size = 'sm',
  children,
  className = '',
}: BadgeWithDotProps) {
  const colorStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dot-bg-emerald-500',
    gray: 'bg-slate-50 text-slate-700 border-slate-200 dot-bg-slate-500',
    primary: 'bg-blue-50 text-blue-700 border-blue-200 dot-bg-blue-600',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dot-bg-amber-500',
    error: 'bg-red-50 text-red-700 border-red-200 dot-bg-red-500',
  }[color];

  const dotColors = {
    success: 'bg-emerald-500',
    gray: 'bg-slate-400',
    primary: 'bg-blue-600',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  }[color];

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs ${colorStyles} ${sizeStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors} animate-pulse shrink-0`} />
      <span>{children}</span>
    </span>
  );
}
