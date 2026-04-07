import { create } from "zustand";
import type { DashboardData } from "../types/dashboard";

export interface Notification {
  id: string;
  message: string;
  type: string;
  severity: "danger" | "warning" | "info";
  read: boolean;
  action?: string;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  setFromDashboard: (data: DashboardData) => void;
  markRead: (id: string) => void;
}

let notifCounter = 0;

function makeNotif(
  message: string,
  type: string,
  severity: "danger" | "warning" | "info",
  action?: string
): Notification {
  return {
    id: `notif-${++notifCounter}`,
    message,
    type,
    severity,
    read: false,
    action,
    createdAt: new Date().toISOString(),
  };
}

export const useNotificationStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setFromDashboard: (data: DashboardData) => {
    const notifs: Notification[] = [];

    if (data.financeiro.contasVencidas > 0) {
      notifs.push(
        makeNotif(
          `${data.financeiro.contasVencidas} conta(s) vencida(s)`,
          "danger",
          "danger",
          "/financeiro"
        )
      );
    }

    if (data.financeiro.caixasAbertos > 0) {
      notifs.push(
        makeNotif(
          `${data.financeiro.caixasAbertos} caixa(s) aberto(s)`,
          "warning",
          "warning",
          "/financeiro"
        )
      );
    }

    if (data.estoque.avarias > 0) {
      notifs.push(
        makeNotif(
          `${data.estoque.avarias} avaria(s) registrada(s)`,
          "stock",
          "warning",
          "/estoque"
        )
      );
    }

    if (data.logistica.entregasPendentes > 5) {
      notifs.push(
        makeNotif(
          `${data.logistica.entregasPendentes} entregas pendentes`,
          "logistics",
          "info",
          "/logistica"
        )
      );
    }

    if (data.resumo.pedidosPendentes > 0) {
      notifs.push(
        makeNotif(
          `${data.resumo.pedidosPendentes} pedido(s) aguardando confirmacao`,
          "warning",
          "info",
          "/pedidos"
        )
      );
    }

    const readMsgs = new Set(
      get()
        .notifications.filter((n) => n.read)
        .map((n) => n.message)
    );
    for (const n of notifs) {
      if (readMsgs.has(n.message)) n.read = true;
    }

    set({
      notifications: notifs,
      unreadCount: notifs.filter((n) => !n.read).length,
    });
  },

  markRead: (id: string) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  },
}));
