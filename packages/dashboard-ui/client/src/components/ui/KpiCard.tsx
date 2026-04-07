import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
import styles from './KpiCard.module.css';

export interface KpiCardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  trend?: 'up' | 'down';
  action?: { label: string; href: string };
}

export function KpiCard({
  label,
  value,
  variant = 'default',
  trend,
  action,
}: KpiCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <div className={styles.valueRow}>
        <p className={clsx(styles.value, styles[variant])}>{value}</p>
        {trend && (
          <span
            className={clsx(styles.trend, trend === 'up' ? styles.trendUp : styles.trendDown)}
            aria-label={trend === 'up' ? 'Tendencia de alta' : 'Tendencia de queda'}
          >
            {trend === 'up' ? (
              <TrendingUp size={20} aria-hidden="true" />
            ) : (
              <TrendingDown size={20} aria-hidden="true" />
            )}
          </span>
        )}
      </div>
      {action && (
        <a href={action.href} className={styles.action}>
          {action.label}
        </a>
      )}
    </div>
  );
}
