import type { ReactNode } from 'react';
import { Button } from './Button';
import styles from './FilterBar.module.css';

export interface FilterBarProps {
  children: ReactNode;
  onApply: () => void;
  onClear: () => void;
}

export function FilterBar({ children, onApply, onClear }: FilterBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.filters}>{children}</div>
      <div className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpar
        </Button>
        <Button variant="primary" size="sm" onClick={onApply}>
          Aplicar
        </Button>
      </div>
    </div>
  );
}
