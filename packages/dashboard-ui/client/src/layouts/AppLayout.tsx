import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ToastContainer } from "@/components/ui/Toast";
import { useSidebarState } from "@/hooks/useSidebarState";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  const { collapsed } = useSidebarState();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={`${styles.main} ${collapsed ? styles.collapsed : ""}`}>
        <TopBar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
