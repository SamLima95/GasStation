import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Badge.module.css';

export interface BadgeProps {
  variant: 'info' | 'warning' | 'danger' | 'success' | 'neutral';
  children: ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={clsx(styles.badge, styles[variant])} role="status">
      {children}
    </span>
  );
}
