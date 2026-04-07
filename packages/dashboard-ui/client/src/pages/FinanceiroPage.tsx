import { useState } from 'react';
import { DollarSign, Plus } from 'lucide-react';
import {
  PageHeader,
  Tabs,
  Table,
  Badge,
  Button,
  Modal,
  Input,
  Skeleton,
  EmptyState,
  type TableColumn,
} from '@/components/ui';
import { fetchCaixas, openCaixa, closeCaixa, fetchContas, pagarConta } from '@/services/financeiro.api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import type { Caixa, ContaAReceber } from '@/types';
import styles from './FinanceiroPage.module.css';

export function FinanceiroPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('caixas');

  const { data: caixas, loading: loadingCaixas, refetch: refetchCaixas } = useApiQuery<Caixa[]>(fetchCaixas, []);
  const { data: contas, loading: loadingContas, refetch: refetchContas } = useApiQuery<ContaAReceber[]>(fetchContas, []);

  const [showCaixaModal, setShowCaixaModal] = useState(false);
  const [caixaUnidadeId, setCaixaUnidadeId] = useState('');
  const [caixaSaldoInicial, setCaixaSaldoInicial] = useState('');
  const [savingCaixa, setSavingCaixa] = useState(false);

  const [closingId, setClosingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  async function handleOpenCaixa() {
    if (!caixaUnidadeId.trim() || !caixaSaldoInicial.trim()) {
      toast.add('warning', 'Preencha todos os campos');
      return;
    }

    setSavingCaixa(true);
    try {
      await openCaixa({ unidadeId: caixaUnidadeId, saldoInicial: Number(caixaSaldoInicial) });
      toast.add('success', 'Caixa aberto com sucesso');
      setShowCaixaModal(false);
      setCaixaUnidadeId('');
      setCaixaSaldoInicial('');
      refetchCaixas();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao abrir caixa');
    } finally {
      setSavingCaixa(false);
    }
  }

  async function handleCloseCaixa(id: string) {
    setClosingId(id);
    try {
      await closeCaixa(id);
      toast.add('success', 'Caixa fechado com sucesso');
      refetchCaixas();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao fechar caixa');
    } finally {
      setClosingId(null);
    }
  }

  async function handlePagarConta(id: string) {
    setPayingId(id);
    try {
      await pagarConta(id, { valorPago: 0 });
      toast.add('success', 'Pagamento registrado com sucesso');
      refetchContas();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao registrar pagamento');
    } finally {
      setPayingId(null);
    }
  }

  const caixaColumns: TableColumn<Caixa>[] = [
    { key: 'unidadeId', label: 'Unidade' },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'ABERTO' ? 'success' : 'neutral'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'dataAbertura',
      label: 'Abertura',
      render: (item) => formatDateTime(item.dataAbertura),
    },
    {
      key: 'dataFechamento',
      label: 'Fechamento',
      render: (item) => (item.dataFechamento ? formatDateTime(item.dataFechamento) : '-'),
    },
    {
      key: 'saldoInicial',
      label: 'Saldo Inicial',
      render: (item) => formatCurrency(item.saldoInicial),
    },
    {
      key: 'acoes',
      label: 'Acoes',
      render: (item) =>
        item.status === 'ABERTO' ? (
          <Button
            variant="danger"
            size="sm"
            loading={closingId === item.id}
            onClick={(e) => {
              e.stopPropagation();
              handleCloseCaixa(item.id);
            }}
          >
            Fechar
          </Button>
        ) : null,
    },
  ];

  const contaColumns: TableColumn<ContaAReceber>[] = [
    { key: 'clienteId', label: 'Cliente' },
    { key: 'pedidoId', label: 'Pedido' },
    {
      key: 'status',
      label: 'Status',
      render: (item) => {
        const variantMap: Record<ContaAReceber['status'], 'warning' | 'success' | 'danger'> = {
          PENDENTE: 'warning',
          PAGO: 'success',
          VENCIDO: 'danger',
        };
        return <Badge variant={variantMap[item.status]}>{item.status}</Badge>;
      },
    },
    {
      key: 'valorAberto',
      label: 'Valor Aberto',
      render: (item) => formatCurrency(item.valorAberto),
    },
    {
      key: 'vencimento',
      label: 'Vencimento',
      render: (item) => formatDate(item.vencimento),
    },
    {
      key: 'acoes',
      label: 'Acoes',
      render: (item) =>
        item.status === 'PENDENTE' ? (
          <Button
            variant="primary"
            size="sm"
            loading={payingId === item.id}
            onClick={(e) => {
              e.stopPropagation();
              handlePagarConta(item.id);
            }}
          >
            Pagar
          </Button>
        ) : null,
    },
  ];

  const tabs = [
    { key: 'caixas', label: 'Caixas' },
    { key: 'contas', label: 'Contas a Receber' },
  ];

  return (
    <div className={styles.page}>
      <PageHeader
        title="Financeiro"
        subtitle="Gestao de caixas e contas a receber"
        actions={
          activeTab === 'caixas' ? (
            <Button icon={Plus} onClick={() => setShowCaixaModal(true)}>
              Abrir Caixa
            </Button>
          ) : undefined
        }
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'caixas' && (
        <div className={styles.tabContent}>
          {loadingCaixas ? (
            <Skeleton variant="table-row" count={5} />
          ) : !caixas || caixas.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Nenhum caixa encontrado"
              description="Abra um novo caixa para comecar"
              action={
                <Button icon={Plus} onClick={() => setShowCaixaModal(true)}>
                  Abrir Caixa
                </Button>
              }
            />
          ) : (
            <Table columns={caixaColumns} data={caixas} />
          )}
        </div>
      )}

      {activeTab === 'contas' && (
        <div className={styles.tabContent}>
          {loadingContas ? (
            <Skeleton variant="table-row" count={5} />
          ) : !contas || contas.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Nenhuma conta encontrada"
              description="Nao ha contas a receber registradas"
            />
          ) : (
            <Table columns={contaColumns} data={contas} />
          )}
        </div>
      )}

      <Modal
        open={showCaixaModal}
        onClose={() => setShowCaixaModal(false)}
        title="Abrir Caixa"
        actions={
          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => setShowCaixaModal(false)}>
              Cancelar
            </Button>
            <Button loading={savingCaixa} onClick={handleOpenCaixa}>
              Abrir
            </Button>
          </div>
        }
      >
        <div className={styles.formFields}>
          <Input
            label="Unidade ID"
            value={caixaUnidadeId}
            onChange={(e) => setCaixaUnidadeId(e.target.value)}
            placeholder="ID da unidade"
          />
          <Input
            label="Saldo Inicial"
            type="number"
            value={caixaSaldoInicial}
            onChange={(e) => setCaixaSaldoInicial(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </Modal>
    </div>
  );
}
