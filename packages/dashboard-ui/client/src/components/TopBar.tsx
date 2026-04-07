import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { SearchInput } from "./ui/SearchInput";
import { Breadcrumbs } from "./ui/Breadcrumbs";
import { NotificationPanel } from "./NotificationPanel";
import { useNotificationStore } from "@/state/notifications.store";
import { useAuthStore } from "@/state/auth.store";
import { useSidebarState } from "@/hooks/useSidebarState";
import styles from "./TopBar.module.css";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/catalog": "Catalogo",
  "/clientes": "Clientes",
  "/pedidos": "Pedidos",
  "/financeiro": "Financeiro",
  "/estoque": "Estoque",
  "/logistica": "Logistica",
  "/auditoria": "Auditoria",
  "/health": "Health",
  "/design-system": "Design System",
};

export function TopBar({ onSearch }: { onSearch?: (q: string) => void }) {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const user = useAuthStore((s) => s.user);
  const { toggle } = useSidebarState();

  const pageLabel = routeLabels[location.pathname] ?? "";
  const breadcrumbs: Array<{ label: string; href?: string }> = [
    { label: "Home", href: "/dashboard" },
  ];
  if (pageLabel) breadcrumbs.push({ label: pageLabel });

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={toggle} aria-label="Menu">
          <Menu size={20} />
        </button>
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className={styles.right}>
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Buscar..."
        />

        <div className={styles.notifWrapper}>
          <button
            className={styles.iconBtn}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`Notificacoes${unreadCount > 0 ? `, ${unreadCount} nao lidas` : ""}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {user && (
          <div className={styles.avatar} title={user.name}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
