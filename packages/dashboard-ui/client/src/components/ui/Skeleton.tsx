import clsx from 'clsx';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  variant: 'text' | 'card' | 'table-row';
  count?: number;
}

const variantMap: Record<SkeletonProps['variant'], string> = {
  text: styles.text,
  card: styles.card,
  'table-row': styles.tableRow,
};

export function Skeleton({ variant, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={clsx(styles.skeleton, variantMap[variant])}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
