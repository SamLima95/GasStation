import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import clsx from 'clsx';
import { useToast, type ToastType } from '../../hooks/useToast';
import styles from './Toast.module.css';

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function ToastContainer() {
  const toasts = useToast((s) => s.toasts);
  const remove = useToast((s) => s.remove);

  return (
    <div className={styles.container} aria-live="polite" aria-label="Notificacoes">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <ToastItem
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            icon={Icon}
            onClose={remove}
          />
        );
      })}
    </div>
  );
}

interface ToastItemProps {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  icon: typeof CheckCircle;
  onClose: (id: string) => void;
}

function ToastItem({ id, type, message, duration, icon: Icon, onClose }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div className={clsx(styles.toast, styles[type])} role="alert">
      <Icon size={18} className={styles.icon} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={() => onClose(id)}
        aria-label="Fechar notificacao"
      >
        <X size={14} />
      </button>
    </div>
  );
}
