import { useState, useMemo } from 'react';
import { Plus, ShoppingCart, CheckCircle, Trash2 } from 'lucide-react';
import {
  PageHeader,
  Table,
  Modal,
  Input,
  Select,
  Button,
  Badge,
  Skeleton,
  EmptyState,
} from '@/components/ui';
import type { TableColumn, SelectOption } from '@/components/ui';
import { fetchPedidos, createPedido, confirmPedido } from '@/services/pedidos.api';
import { fetchClientes } from '@/services/clientes.api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type { Pedido, Cliente } from '@/types';
import styles from './PedidosPage.module.css';

const STATUS_VARIANT: Record<Pedido['status'], 'warning' | 'info' | 'success' | 'danger'> = {
  PENDENTE: 'warning',
  CONFIRMADO: 'info',
  ENTREGUE: 'success',
  CANCELADO: 'danger',
};

const PAGAMENTO_OPTIONS: SelectOption[] = [
  { value: '', label: 'Selecione...' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'PIX', label: 'PIX' },
  { value: 'CARTAO', label: 'Cartao' },
  { value: 'FIADO', label: 'Fiado' },
];

interface ItemRow {
  vasilhameId: string;
  quantidade: string;
  precoUnitario: string;
}

const emptyItem: ItemRow = { vasilhameId: '', quantidade: '1', precoUnitario: '' };

export function PedidosPage() {
  const toast = useToast();
  const { data, loading, refetch } = useApiQuery<Pedido[]>(fetchPedidos, []);
  const { data: clientes } = useApiQuery<Cliente[]>(fetchClientes, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const [clienteId, setClienteId] = useState('');
  const [tipoPagamento, setTipoPagamento] = useState('');
  const [itens, setItens] = useState<ItemRow[]>([{ ...emptyItem }]);

  const clienteOptions: SelectOption[] = useMemo(() => {
    const opts: SelectOption[] = [{ value: '', label: 'Selecione um cliente...' }];
    if (clientes) {
      clientes.forEach((c) =>
        opts.push({ value: c.id, label: `${c.nome} (${c.documento})` }),
      );
    }
    return opts;
  }, [clientes]);

  const total = useMemo(() => {
    return itens.reduce((sum, item) => {
      const qty = parseFloat(item.quantidade) || 0;
      const price = parseFloat(item.precoUnitario) || 0;
      return sum + qty * price;
    }, 0);
  }, [itens]);

  function resetForm() {
    setClienteId('');
    setTipoPagamento('');
    setItens([{ ...emptyItem }]);
  }

  function updateItem(index: number, field: keyof ItemRow, value: string) {
    setItens((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addItem() {
    setItens((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    if (itens.length <= 1) return;
    setItens((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!clienteId) {
      toast.add('warning', 'Selecione um cliente');
      return;
    }
    if (!tipoPagamento) {
      toast.add('warning', 'Selecione o tipo de pagamento');
      return;
    }

    const parsedItens = itens.map((item) => ({
      id: '',
      vasilhameId: item.vasilhameId.trim(),
      quantidade: parseInt(item.quantidade, 10) || 0,
      precoUnitario: parseFloat(item.precoUnitario) || 0,
    }));

    const hasInvalid = parsedItens.some(
      (it) => !it.vasilhameId || it.quantidade <= 0 || it.precoUnitario <= 0,
    );
    if (hasInvalid) {
      toast.add('warning', 'Preencha todos os campos dos itens corretamente');
      return;
    }

    setSaving(true);
    try {
      await createPedido({
        clienteId,
        unidadeId: '',
        status: 'PENDENTE',
        tipoPagamento,
        valorTotal: total,
        itens: parsedItens,
      });
      toast.add('success', 'Pedido criado com sucesso');
      setModalOpen(false);
      resetForm();
      refetch();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao criar pedido');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirm(id: string) {
    setConfirmingId(id);
    try {
      await confirmPedido(id);
      toast.add('success', 'Pedido confirmado');
      refetch();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao confirmar pedido');
    } finally {
      setConfirmingId(null);
    }
  }

  const columns: TableColumn<Pedido>[] = [
    { key: 'clienteId', label: 'Cliente ID' },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge variant={STATUS_VARIANT[item.status]}>{item.status}</Badge>
      ),
    },
    { key: 'tipoPagamento', label: 'Pagamento' },
    {
      key: 'valorTotal',
      label: 'Valor Total',
      render: (item) => formatCurrency(item.valorTotal),
    },
    {
      key: 'dataPedido',
      label: 'Data do Pedido',
      render: (item) => formatDateTime(item.dataPedido),
    },
    {
      key: '_actions',
      label: 'Acoes',
      render: (item) =>
        item.status === 'PENDENTE' ? (
          <Button
            variant="secondary"
            size="sm"
            icon={CheckCircle}
            loading={confirmingId === item.id}
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm(item.id);
            }}
          >
            Confirmar
          </Button>
        ) : null,
    },
  ];

  return (
    <div className={styles.page}>
      <PageHeader
        title="Pedidos"
        subtitle="Gerenciamento de pedidos"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Pedidos' },
        ]}
        actions={
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            Novo Pedido
          </Button>
        }
      />

      {loading && !data ? (
        <Skeleton variant="table-row" count={5} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhum pedido encontrado"
          description="Crie o primeiro pedido."
          action={
            <Button icon={Plus} onClick={() => setModalOpen(true)}>
              Novo Pedido
            </Button>
          }
        />
      ) : (
        <Table columns={columns} data={data} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title="Novo Pedido"
        size="lg"
        actions={
          <>
            <Button variant="ghost" onClick={() => { setModalOpen(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={handleSave}>
              Salvar
            </Button>
          </>
        }
      >
        <div className={styles.formFields}>
          <Select
            label="Cliente"
            options={clienteOptions}
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          />

          <Select
            label="Tipo de Pagamento"
            options={PAGAMENTO_OPTIONS}
            value={tipoPagamento}
            onChange={(e) => setTipoPagamento(e.target.value)}
          />

          <div className={styles.itensSection}>
            <h4 className={styles.itensSectionTitle}>Itens do Pedido</h4>

            {itens.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <Input
                  label="Vasilhame ID"
                  placeholder="ID do vasilhame"
                  value={item.vasilhameId}
                  onChange={(e) => updateItem(idx, 'vasilhameId', e.target.value)}
                />
                <Input
                  label="Quantidade"
                  type="number"
                  min="1"
                  value={item.quantidade}
                  onChange={(e) => updateItem(idx, 'quantidade', e.target.value)}
                />
                <Input
                  label="Preco Unitario"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={item.precoUnitario}
                  onChange={(e) => updateItem(idx, 'precoUnitario', e.target.value)}
                />
                {itens.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeItemBtn}
                    onClick={() => removeItem(idx)}
                    aria-label="Remover item"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}

            <Button variant="ghost" size="sm" icon={Plus} onClick={addItem}>
              Adicionar item
            </Button>
          </div>

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.totalValue}>{formatCurrency(total)}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
