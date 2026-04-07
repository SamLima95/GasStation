import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import {
  PageHeader,
  Tabs,
  Table,
  Badge,
  Button,
  Modal,
  Input,
  Select,
  Skeleton,
  EmptyState,
  type TableColumn,
} from '@/components/ui';
import {
  fetchMovimentacoes,
  createMovimentacao,
  fetchVasilhames,
  createVasilhame,
} from '@/services/estoque.api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/useToast';
import { formatNumber, formatDateTime } from '@/utils/format';
import type { Vasilhame, MovimentacaoEstoque } from '@/types';
import styles from './EstoquePage.module.css';

const TIPO_MOVIMENTACAO_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'SAIDA', label: 'Saida' },
  { value: 'RETORNO', label: 'Retorno' },
  { value: 'AVARIA', label: 'Avaria' },
];

export function EstoquePage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('movimentacoes');

  const { data: movimentacoes, loading: loadingMov, refetch: refetchMov } =
    useApiQuery<MovimentacaoEstoque[]>(fetchMovimentacoes, []);
  const { data: vasilhames, loading: loadingVas, refetch: refetchVas } =
    useApiQuery<Vasilhame[]>(fetchVasilhames, []);

  const [showMovModal, setShowMovModal] = useState(false);
  const [movVasilhameId, setMovVasilhameId] = useState('');
  const [movTipo, setMovTipo] = useState('');
  const [movQuantidade, setMovQuantidade] = useState('');
  const [movUnidadeId, setMovUnidadeId] = useState('');
  const [savingMov, setSavingMov] = useState(false);

  const [showVasModal, setShowVasModal] = useState(false);
  const [vasTipo, setVasTipo] = useState('');
  const [vasCapacidade, setVasCapacidade] = useState('');
  const [vasDescricao, setVasDescricao] = useState('');
  const [vasUnidadeId, setVasUnidadeId] = useState('');
  const [savingVas, setSavingVas] = useState(false);

  async function handleCreateMovimentacao() {
    if (!movVasilhameId.trim() || !movTipo || !movQuantidade.trim()) {
      toast.add('warning', 'Preencha todos os campos');
      return;
    }

    setSavingMov(true);
    try {
      await createMovimentacao({
        vasilhameId: movVasilhameId,
        tipoMovimentacao: movTipo as MovimentacaoEstoque['tipoMovimentacao'],
        quantidade: Number(movQuantidade),
        unidadeId: movUnidadeId,
      });
      toast.add('success', 'Movimentacao criada com sucesso');
      setShowMovModal(false);
      setMovVasilhameId('');
      setMovTipo('');
      setMovQuantidade('');
      setMovUnidadeId('');
      refetchMov();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao criar movimentacao');
    } finally {
      setSavingMov(false);
    }
  }

  async function handleCreateVasilhame() {
    if (!vasTipo.trim() || !vasCapacidade.trim()) {
      toast.add('warning', 'Preencha tipo e capacidade');
      return;
    }

    setSavingVas(true);
    try {
      await createVasilhame({
        tipo: vasTipo,
        capacidade: Number(vasCapacidade),
        descricao: vasDescricao,
        unidadeId: vasUnidadeId,
      });
      toast.add('success', 'Vasilhame criado com sucesso');
      setShowVasModal(false);
      setVasTipo('');
      setVasCapacidade('');
      setVasDescricao('');
      setVasUnidadeId('');
      refetchVas();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao criar vasilhame');
    } finally {
      setSavingVas(false);
    }
  }

  const movColumns: TableColumn<MovimentacaoEstoque>[] = [
    { key: 'vasilhameId', label: 'Vasilhame' },
    {
      key: 'tipoMovimentacao',
      label: 'Tipo',
      render: (item) => {
        const variantMap: Record<MovimentacaoEstoque['tipoMovimentacao'], 'success' | 'danger' | 'info' | 'warning'> = {
          ENTRADA: 'success',
          SAIDA: 'danger',
          RETORNO: 'info',
          AVARIA: 'warning',
        };
        return <Badge variant={variantMap[item.tipoMovimentacao]}>{item.tipoMovimentacao}</Badge>;
      },
    },
    {
      key: 'quantidade',
      label: 'Quantidade',
      render: (item) => formatNumber(item.quantidade),
    },
    {
      key: 'createdAt',
      label: 'Data',
      render: (item) => formatDateTime(item.createdAt),
    },
  ];

  const vasColumns: TableColumn<Vasilhame>[] = [
    { key: 'tipo', label: 'Tipo' },
    {
      key: 'capacidade',
      label: 'Capacidade',
      render: (item) => formatNumber(item.capacidade),
    },
    { key: 'descricao', label: 'Descricao' },
  ];

  const tabs = [
    { key: 'movimentacoes', label: 'Movimentacoes' },
    { key: 'vasilhames', label: 'Vasilhames' },
  ];

  return (
    <div className={styles.page}>
      <PageHeader
        title="Estoque"
        subtitle="Gestao de vasilhames e movimentacoes"
        actions={
          activeTab === 'movimentacoes' ? (
            <Button icon={Plus} onClick={() => setShowMovModal(true)}>
              Nova Movimentacao
            </Button>
          ) : (
            <Button icon={Plus} onClick={() => setShowVasModal(true)}>
              Novo Vasilhame
            </Button>
          )
        }
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'movimentacoes' && (
        <div className={styles.tabContent}>
          {loadingMov ? (
            <Skeleton variant="table-row" count={5} />
          ) : !movimentacoes || movimentacoes.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nenhuma movimentacao encontrada"
              description="Registre uma nova movimentacao de estoque"
              action={
                <Button icon={Plus} onClick={() => setShowMovModal(true)}>
                  Nova Movimentacao
                </Button>
              }
            />
          ) : (
            <Table columns={movColumns} data={movimentacoes} />
          )}
        </div>
      )}

      {activeTab === 'vasilhames' && (
        <div className={styles.tabContent}>
          {loadingVas ? (
            <Skeleton variant="table-row" count={5} />
          ) : !vasilhames || vasilhames.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nenhum vasilhame encontrado"
              description="Cadastre um novo vasilhame"
              action={
                <Button icon={Plus} onClick={() => setShowVasModal(true)}>
                  Novo Vasilhame
                </Button>
              }
            />
          ) : (
            <Table columns={vasColumns} data={vasilhames} />
          )}
        </div>
      )}

      <Modal
        open={showMovModal}
        onClose={() => setShowMovModal(false)}
        title="Nova Movimentacao"
        actions={
          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => setShowMovModal(false)}>
              Cancelar
            </Button>
            <Button loading={savingMov} onClick={handleCreateMovimentacao}>
              Salvar
            </Button>
          </div>
        }
      >
        <div className={styles.formFields}>
          <Input
            label="Vasilhame ID"
            value={movVasilhameId}
            onChange={(e) => setMovVasilhameId(e.target.value)}
            placeholder="ID do vasilhame"
          />
          <Select
            label="Tipo de Movimentacao"
            options={TIPO_MOVIMENTACAO_OPTIONS}
            value={movTipo}
            onChange={(e) => setMovTipo(e.target.value)}
          />
          <Input
            label="Quantidade"
            type="number"
            value={movQuantidade}
            onChange={(e) => setMovQuantidade(e.target.value)}
            placeholder="0"
          />
          <Input
            label="Unidade ID"
            value={movUnidadeId}
            onChange={(e) => setMovUnidadeId(e.target.value)}
            placeholder="ID da unidade"
          />
        </div>
      </Modal>

      <Modal
        open={showVasModal}
        onClose={() => setShowVasModal(false)}
        title="Novo Vasilhame"
        actions={
          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => setShowVasModal(false)}>
              Cancelar
            </Button>
            <Button loading={savingVas} onClick={handleCreateVasilhame}>
              Salvar
            </Button>
          </div>
        }
      >
        <div className={styles.formFields}>
          <Input
            label="Tipo"
            value={vasTipo}
            onChange={(e) => setVasTipo(e.target.value)}
            placeholder="Ex: P13, P45"
          />
          <Input
            label="Capacidade"
            type="number"
            value={vasCapacidade}
            onChange={(e) => setVasCapacidade(e.target.value)}
            placeholder="Em kg"
          />
          <Input
            label="Descricao"
            value={vasDescricao}
            onChange={(e) => setVasDescricao(e.target.value)}
            placeholder="Descricao do vasilhame"
          />
          <Input
            label="Unidade ID"
            value={vasUnidadeId}
            onChange={(e) => setVasUnidadeId(e.target.value)}
            placeholder="ID da unidade"
          />
        </div>
      </Modal>
    </div>
  );
}
