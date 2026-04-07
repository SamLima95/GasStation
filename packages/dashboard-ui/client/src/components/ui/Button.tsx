import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon: Icon,
      children,
      disabled,
      className,
      ...rest
    },
    ref,
  ) => {
    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

    return (
      <button
        ref={ref}
        className={clsx(styles.button, styles[variant], styles[size], className)}
        disabled={disabled || loading}
        aria-disabled={disabled || loading || undefined}
        {...rest}
      >
        {loading ? (
          <Loader2 size={iconSize} className={styles.spinner} aria-hidden="true" />
        ) : Icon ? (
          <Icon size={iconSize} aria-hidden="true" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
