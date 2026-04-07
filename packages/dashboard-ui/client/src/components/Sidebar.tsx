import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Wallet,
  Warehouse,
  Truck,
  ShieldCheck,
  Activity,
  Palette,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuthStore } from "@/state/auth.store";
import { useSidebarState } from "@/hooks/useSidebarState";
import styles from "./Sidebar.module.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/catalog", label: "Catalogo", icon: Package },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/pedidos", label: "Pedidos", icon: ShoppingCart },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/estoque", label: "Estoque", icon: Warehouse },
  { to: "/logistica", label: "Logistica", icon: Truck },
  { to: "/auditoria", label: "Auditoria", icon: ShieldCheck },
  { to: "/health", label: "Health", icon: Activity },
  { to: "/design-system", label: "Design System", icon: Palette },
];

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const { collapsed, toggle } = useSidebarState();

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className={styles.overlay}
          onClick={toggle}
          aria-hidden="true"
        />
      )}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
        aria-label="Menu principal"
      >
        <div className={styles.header}>
          {!collapsed && <span className={styles.logo}>GasStation</span>}
          <button
            className={styles.toggleBtn}
            onClick={toggle}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <button className={styles.navItem} onClick={logout} title="Sair">
            <LogOut size={20} />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
