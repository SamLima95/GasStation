import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  FileText,
  AlertTriangle,
  AlertCircle,
  Info,
  BarChart3,
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Ticket,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  Wrench,
  Wallet,
  Lock,
  Unlock,
  CreditCard,
  FileWarning,
  Route,
  Map,
  Navigation,
  Flag,
  Truck,
  Package,
  PackageCheck,
} from 'lucide-react';
import { PageHeader, FilterBar, KpiCard, Card, Input, Skeleton, Button } from '@/components/ui';
import { fetchDashboard, exportCsv, exportPdf } from '@/services/dashboard.api';
import { downloadBlob } from '@/utils/export';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useInterval } from '@/hooks/useInterval';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatNumber } from '@/utils/format';
import type { DashboardData, DashboardFilter } from '@/types';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<DashboardFilter>({});
  const [appliedFilter, setAppliedFilter] = useState<DashboardFilter>({});

  const fetcher = useCallback(() => fetchDashboard(appliedFilter), [appliedFilter]);
  const { data, loading, refetch } = useApiQuery<DashboardData>(
    fetcher,
    [appliedFilter],
  );

  useInterval(refetch, 60_000);

  function handleApply() {
    setAppliedFilter({ ...filter });
  }

  function handleClear() {
    setFilter({});
    setAppliedFilter({});
  }

  async function handleExportCsv() {
    try {
      const res = await exportCsv(appliedFilter);
      const blob = await (res as any).blob?.() ?? res;
      downloadBlob('dashboard.csv', blob as Blob, 'text/csv');
      toast.add('success', 'CSV exportado com sucesso');
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao exportar CSV');
    }
  }

  async function handleExportPdf() {
    try {
      const res = await exportPdf(appliedFilter);
      const blob = await (res as any).blob?.() ?? res;
      downloadBlob('dashboard.pdf', blob as Blob, 'application/pdf');
      toast.add('success', 'PDF exportado com sucesso');
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao exportar PDF');
    }
  }

  const alerts: Array<{
    type: 'danger' | 'warning' | 'info';
    icon: typeof AlertTriangle;
    message: string;
    link: string;
  }> = [];

  if (data) {
    if (data.financeiro.contasVencidas > 0) {
      alerts.push({
        type: 'danger',
        icon: AlertCircle,
        message: `${data.financeiro.contasVencidas} contas vencidas`,
        link: '/financeiro',
      });
    }
    if (data.financeiro.caixasAbertos > 0) {
      alerts.push({
        type: 'warning',
        icon: AlertTriangle,
        message: `${data.financeiro.caixasAbertos} caixas abertos`,
        link: '/financeiro',
      });
    }
    if (data.estoque.avarias > 0) {
      alerts.push({
        type: 'warning',
        icon: Wrench,
        message: `${data.estoque.avarias} avarias registradas`,
        link: '/estoque',
      });
    }
    if (data.logistica.entregasPendentes > 5) {
      alerts.push({
        type: 'info',
        icon: Info,
        message: `${data.logistica.entregasPendentes} entregas pendentes`,
        link: '/logistica',
      });
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Dashboard"
        subtitle="Visao geral do sistema"
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <div className={styles.exportActions}>
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCsv}>
              CSV
            </Button>
            <Button variant="secondary" size="sm" icon={FileText} onClick={handleExportPdf}>
              PDF
            </Button>
          </div>
        }
      />

      <FilterBar onApply={handleApply} onClear={handleClear}>
        <Input
          label="Unidade ID"
          placeholder="Ex: unidade-01"
          value={filter.unidadeId ?? ''}
          onChange={(e) => setFilter((f) => ({ ...f, unidadeId: e.target.value }))}
        />
        <Input
          label="Data inicio"
          type="date"
          value={filter.dataInicio ?? ''}
          onChange={(e) => setFilter((f) => ({ ...f, dataInicio: e.target.value }))}
        />
        <Input
          label="Data fim"
          type="date"
          value={filter.dataFim ?? ''}
          onChange={(e) => setFilter((f) => ({ ...f, dataFim: e.target.value }))}
        />
      </FilterBar>

      {loading && !data ? (
        <div className={styles.kpiGrid}>
          <Skeleton variant="card" count={6} />
        </div>
      ) : data ? (
        <>
          {alerts.length > 0 && (
            <div className={styles.alerts}>
              {alerts.map((alert, idx) => (
                <Link
                  key={idx}
                  to={alert.link}
                  className={`${styles.alertCard} ${styles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}
                >
                  <alert.icon size={18} />
                  <span>{alert.message}</span>
                </Link>
              ))}
            </div>
          )}

          <Card title="Resumo de Pedidos">
            <div className={styles.kpiGrid}>
              <KpiCard label="Total de Pedidos" value={formatNumber(data.resumo.totalPedidos)} />
              <KpiCard label="Confirmados" value={formatNumber(data.resumo.pedidosConfirmados)} variant="success" />
              <KpiCard label="Pendentes" value={formatNumber(data.resumo.pedidosPendentes)} variant="warning" />
              <KpiCard label="Cancelados" value={formatNumber(data.resumo.pedidosCancelados)} variant="danger" />
              <KpiCard label="Faturamento" value={formatCurrency(data.resumo.faturamentoTotal)} variant="success" />
              <KpiCard label="Ticket Medio" value={formatCurrency(data.resumo.ticketMedio)} />
            </div>
          </Card>

          <Card title="Estoque">
            <div className={styles.kpiGrid}>
              <KpiCard label="Total Movimentacoes" value={formatNumber(data.estoque.totalMovimentacoes)} />
              <KpiCard label="Entradas" value={formatNumber(data.estoque.entradas)} variant="success" />
              <KpiCard label="Saidas" value={formatNumber(data.estoque.saidas)} variant="warning" />
              <KpiCard label="Retornos" value={formatNumber(data.estoque.retornos)} />
              <KpiCard
                label="Avarias"
                value={formatNumber(data.estoque.avarias)}
                variant={data.estoque.avarias > 0 ? 'danger' : 'default'}
              />
            </div>
          </Card>

          <Card title="Financeiro">
            <div className={styles.kpiGrid}>
              <KpiCard label="Caixas Abertos" value={formatNumber(data.financeiro.caixasAbertos)} variant="warning" />
              <KpiCard label="Caixas Fechados" value={formatNumber(data.financeiro.caixasFechados)} variant="success" />
              <KpiCard label="Contas Pendentes" value={formatNumber(data.financeiro.contasPendentes)} variant="warning" />
              <KpiCard label="Contas Pagas" value={formatNumber(data.financeiro.contasPagas)} variant="success" />
              <KpiCard
                label="Contas Vencidas"
                value={formatNumber(data.financeiro.contasVencidas)}
                variant={data.financeiro.contasVencidas > 0 ? 'danger' : 'default'}
              />
              <KpiCard label="Valor Total Aberto" value={formatCurrency(data.financeiro.valorTotalAberto)} />
            </div>
          </Card>

          <Card title="Logistica">
            <div className={styles.kpiGrid}>
              <KpiCard label="Total de Rotas" value={formatNumber(data.logistica.totalRotas)} />
              <KpiCard label="Rotas Planejadas" value={formatNumber(data.logistica.rotasPlanejadas)} />
              <KpiCard label="Rotas em Andamento" value={formatNumber(data.logistica.rotasEmAndamento)} variant="warning" />
              <KpiCard label="Rotas Finalizadas" value={formatNumber(data.logistica.rotasFinalizadas)} variant="success" />
              <KpiCard label="Total Entregas" value={formatNumber(data.logistica.totalEntregas)} />
              <KpiCard label="Entregas Realizadas" value={formatNumber(data.logistica.entregasEntregues)} variant="success" />
              <KpiCard
                label="Entregas Pendentes"
                value={formatNumber(data.logistica.entregasPendentes)}
                variant={data.logistica.entregasPendentes > 5 ? 'danger' : 'warning'}
              />
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
