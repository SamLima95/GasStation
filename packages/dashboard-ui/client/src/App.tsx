import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { ClientesPage } from "@/pages/ClientesPage";
import { PedidosPage } from "@/pages/PedidosPage";
import { FinanceiroPage } from "@/pages/FinanceiroPage";
import { EstoquePage } from "@/pages/EstoquePage";
import { LogisticaPage } from "@/pages/LogisticaPage";
import { AuditoriaPage } from "@/pages/AuditoriaPage";
import { HealthPage } from "@/pages/HealthPage";
import { DesignSystemPage } from "@/pages/DesignSystemPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/pedidos" element={<PedidosPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
            <Route path="/estoque" element={<EstoquePage />} />
            <Route path="/logistica" element={<LogisticaPage />} />
            <Route path="/auditoria" element={<AuditoriaPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/design-system" element={<DesignSystemPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
