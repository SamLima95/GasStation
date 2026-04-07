import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock, Package, Truck, X } from "lucide-react";
import { useNotificationStore } from "@/state/notifications.store";
import styles from "./NotificationPanel.module.css";

const iconMap: Record<string, typeof AlertTriangle> = {
  danger: AlertTriangle,
  warning: Clock,
  stock: Package,
  logistics: Truck,
};

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className={styles.panel} ref={ref} role="region" aria-label="Notificacoes">
      <div className={styles.header}>
        <span className={styles.title}>Notificacoes</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
          <X size={16} />
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className={styles.empty}>Nenhuma notificacao</div>
      ) : (
        <ul className={styles.list}>
          {notifications.map((n) => {
            const Icon = iconMap[n.type] ?? AlertTriangle;
            return (
              <li
                key={n.id}
                className={`${styles.item} ${n.read ? styles.read : ""}`}
              >
                <Icon size={16} className={styles[n.severity]} />
                <div className={styles.content}>
                  <span className={styles.message}>{n.message}</span>
                  {n.action && (
                    <Link
                      to={n.action}
                      className={styles.link}
                      onClick={() => {
                        markRead(n.id);
                        onClose();
                      }}
                    >
                      Ver detalhes
                    </Link>
                  )}
                </div>
                {!n.read && (
                  <button
                    className={styles.markBtn}
                    onClick={() => markRead(n.id)}
                    aria-label="Marcar como lida"
                  >
                    <span className={styles.dot} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
