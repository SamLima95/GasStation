import { useState } from 'react';
import { Truck, Plus } from 'lucide-react';
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
import {
  fetchRotas,
  createRota,
  fetchEntregas,
  assignEntrega,
  confirmEntrega,
  fetchEntregadores,
  createEntregador,
  fetchVeiculos,
  createVeiculo,
} from '@/services/logistica.api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/utils/format';
import type { Rota, Entrega, Entregador, Veiculo } from '@/types';
import styles from './LogisticaPage.module.css';

export function LogisticaPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('rotas');

  const { data: rotas, loading: loadingRotas, refetch: refetchRotas } =
    useApiQuery<Rota[]>(fetchRotas, []);
  const { data: entregas, loading: loadingEntregas, refetch: refetchEntregas } =
    useApiQuery<Entrega[]>(fetchEntregas, []);
  const { data: entregadores, loading: loadingEntregadores, refetch: refetchEntregadores } =
    useApiQuery<Entregador[]>(fetchEntregadores, []);
  const { data: veiculos, loading: loadingVeiculos, refetch: refetchVeiculos } =
    useApiQuery<Veiculo[]>(fetchVeiculos, []);

  // Rota modal
  const [showRotaModal, setShowRotaModal] = useState(false);
  const [rotaEntregadorId, setRotaEntregadorId] = useState('');
  const [rotaData, setRotaData] = useState('');
  const [rotaUnidadeId, setRotaUnidadeId] = useState('');
  const [savingRota, setSavingRota] = useState(false);

  // Assign entrega modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEntregaId, setAssignEntregaId] = useState('');
  const [assignRotaId, setAssignRotaId] = useState('');
  const [savingAssign, setSavingAssign] = useState(false);

  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Entregador modal
  const [showEntregadorModal, setShowEntregadorModal] = useState(false);
  const [entregadorNome, setEntregadorNome] = useState('');
  const [entregadorTelefone, setEntregadorTelefone] = useState('');
  const [entregadorUnidadeId, setEntregadorUnidadeId] = useState('');
  const [savingEntregador, setSavingEntregador] = useState(false);

  // Veiculo modal
  const [showVeiculoModal, setShowVeiculoModal] = useState(false);
  const [veiculoPlaca, setVeiculoPlaca] = useState('');
  const [veiculoModelo, setVeiculoModelo] = useState('');
  const [veiculoUnidadeId, setVeiculoUnidadeId] = useState('');
  const [savingVeiculo, setSavingVeiculo] = useState(false);

  async function handleCreateRota() {
    if (!rotaEntregadorId.trim() || !rotaData.trim()) {
      toast.add('warning', 'Preencha todos os campos');
      return;
    }

    setSavingRota(true);
    try {
      await createRota({
        entregadorId: rotaEntregadorId,
        data: rotaData,
        unidadeId: rotaUnidadeId,
        status: 'PLANEJADA',
      });
      toast.add('success', 'Rota criada com sucesso');
      setShowRotaModal(false);
      setRotaEntregadorId('');
      setRotaData('');
      setRotaUnidadeId('');
      refetchRotas();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao criar rota');
    } finally {
      setSavingRota(false);
    }
  }

  async function handleAssignEntrega() {
    if (!assignRotaId.trim()) {
      toast.add('warning', 'Informe o ID da rota');
      return;
    }

    setSavingAssign(true);
    try {
      await assignEntrega(assignEntregaId, assignRotaId);
      toast.add('success', 'Entrega atribuida com sucesso');
      setShowAssignModal(false);
      setAssignEntregaId('');
      setAssignRotaId('');
      refetchEntregas();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao atribuir entrega');
    } finally {
      setSavingAssign(false);
    }
  }

  async function handleConfirmEntrega(id: string) {
    setConfirmingId(id);
    try {
      await confirmEntrega(id);
      toast.add('success', 'Entrega confirmada com sucesso');
      refetchEntregas();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao confirmar entrega');
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleCreateEntregador() {
    if (!entregadorNome.trim() || !entregadorTelefone.trim()) {
      toast.add('warning', 'Preencha nome e telefone');
      return;
    }

    setSavingEntregador(true);
    try {
      await createEntregador({
        nome: entregadorNome,
        telefone: entregadorTelefone,
        unidadeId: entregadorUnidadeId,
        status: 'ATIVO',
      });
      toast.add('success', 'Entregador cadastrado com sucesso');
      setShowEntregadorModal(false);
      setEntregadorNome('');
      setEntregadorTelefone('');
      setEntregadorUnidadeId('');
      refetchEntregadores();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao cadastrar entregador');
    } finally {
      setSavingEntregador(false);
    }
  }

  async function handleCreateVeiculo() {
    if (!veiculoPlaca.trim() || !veiculoModelo.trim()) {
      toast.add('warning', 'Preencha placa e modelo');
      return;
    }

    setSavingVeiculo(true);
    try {
      await createVeiculo({
        placa: veiculoPlaca,
        modelo: veiculoModelo,
        unidadeId: veiculoUnidadeId,
        status: 'DISPONIVEL',
      });
      toast.add('success', 'Veiculo cadastrado com sucesso');
      setShowVeiculoModal(false);
      setVeiculoPlaca('');
      setVeiculoModelo('');
      setVeiculoUnidadeId('');
      refetchVeiculos();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao cadastrar veiculo');
    } finally {
      setSavingVeiculo(false);
    }
  }

  function openAssignModal(entregaId: string) {
    setAssignEntregaId(entregaId);
    setAssignRotaId('');
    setShowAssignModal(true);
  }

  const rotaStatusVariant: Record<Rota['status'], 'info' | 'warning' | 'success'> = {
    PLANEJADA: 'info',
    EM_ANDAMENTO: 'warning',
    FINALIZADA: 'success',
  };

  const entregaStatusVariant: Record<Entrega['status'], 'warning' | 'info' | 'success'> = {
    PENDENTE: 'warning',
    EM_ROTA: 'info',
    ENTREGUE: 'success',
  };

  const rotaColumns: TableColumn<Rota>[] = [
    { key: 'entregadorId', label: 'Entregador' },
    {
      key: 'status',
      label: 'Status',
      render: (item) => <Badge variant={rotaStatusVariant[item.status]}>{item.status}</Badge>,
    },
    {
      key: 'data',
      label: 'Data',
      render: (item) => formatDate(item.data),
    },
  ];

  const entregaColumns: TableColumn<Entrega>[] = [
    { key: 'pedidoId', label: 'Pedido' },
    { key: 'rotaId', label: 'Rota' },
    {
      key: 'status',
      label: 'Status',
      render: (item) => <Badge variant={entregaStatusVariant[item.status]}>{item.status}</Badge>,
    },
    {
      key: 'acoes',
      label: 'Acoes',
      render: (item) => (
        <div className={styles.actionCell}>
          {item.status === 'PENDENTE' && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openAssignModal(item.id);
              }}
            >
              Atribuir
            </Button>
          )}
          {item.status === 'EM_ROTA' && (
            <Button
              variant="secondary"
              size="sm"
              loading={confirmingId === item.id}
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmEntrega(item.id);
              }}
            >
              Confirmar
            </Button>
          )}
        </div>
      ),
    },
  ];

  const entregadorColumns: TableColumn<Entregador>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'status', label: 'Status' },
  ];

  const veiculoColumns: TableColumn<Veiculo>[] = [
    { key: 'placa', label: 'Placa' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'status', label: 'Status' },
  ];

  const tabs = [
    { key: 'rotas', label: 'Rotas' },
    { key: 'entregas', label: 'Entregas' },
    { key: 'entregadores', label: 'Entregadores' },
    { key: 'veiculos', label: 'Veiculos' },
  ];

  function getHeaderAction() {
    switch (activeTab) {
      case 'rotas':
        return (
          <Button icon={Plus} onClick={() => setShowRotaModal(true)}>
            Nova Rota
          </Button>
        );
      case 'entregadores':
        return (
          <Button icon={Plus} onClick={() => setShowEntregadorModal(true)}>
            Novo Entregador
          </Button>
        );
      case 'veiculos':
        return (
          <Button icon={Plus} onClick={() => setShowVeiculoModal(true)}>
            Novo Veiculo
          </Button>
        );
      default:
        return undefined;
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Logistica"
        subtitle="Gestao de rotas, entregas, entregadores e veiculos"
        actions={getHeaderAction()}
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'rotas' && (
        <div className={styles.tabContent}>
          {loadingRotas ? (
            <Skeleton variant="table-row" count={5} />
          ) : !rotas || rotas.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="Nenhuma rota encontrada"
              description="Crie uma nova rota para comecar"
              action={
                <Button icon={Plus} onClick={() => setShowRotaModal(true)}>
                  Nova Rota
                </Button>
              }
            />
          ) : (
            <Table columns={rotaColumns} data={rotas} />
          )}
        </div>
      )}

      {activeTab === 'entregas' && (
        <div className={styles.tabContent}>
          {loadingEntregas ? (
            <Skeleton variant="table-row" count={5} />
          ) : !entregas || entregas.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="Nenhuma entrega encontrada"
              description="Nao ha entregas registradas"
            />
          ) : (
            <Table columns={entregaColumns} data={entregas} />
          )}
        </div>
      )}

      {activeTab === 'entregadores' && (
        <div className={styles.tabContent}>
          {loadingEntregadores ? (
            <Skeleton variant="table-row" count={5} />
          ) : !entregadores || entregadores.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="Nenhum entregador encontrado"
              description="Cadastre um novo entregador"
              action={
                <Button icon={Plus} onClick={() => setShowEntregadorModal(true)}>
                  Novo Entregador
                </Button>
              }
            />
          ) : (
            <Table columns={entregadorColumns} data={entregadores} />
          )}
        </div>
      )}

      {activeTab === 'veiculos' && (
        <div className={styles.tabContent}>
          {loadingVeiculos ? (
            <Skeleton variant="table-row" count={5} />
          ) : !veiculos || veiculos.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="Nenhum veiculo encontrado"
              description="Cadastre um novo veiculo"
              action={
                <Button icon={Plus} onClick={() => setShowVeiculoModal(true)}>
                  Novo Veiculo
                </Button>
              }
            />
          ) : (
            <Table columns={veiculoColumns} data={veiculos} />
          )}
        </div>
      )}

      {/* Rota Modal */}
      <Modal
        open={showRotaModal}
        onClose={() => setShowRotaModal(false)}
        title="Nova Rota"
        actions={
          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => setShowRotaModal(false)}>
              Cancelar
            </Button>
            <Button loading={savingRota} onClick={handleCreateRota}>
              Salvar
            </Button>
          </div>
        }
      >
        <div className={styles.formFields}>
          <Input
            label="Entregador ID"
            value={rotaEntregadorId}
            onChange={(e) => setRotaEntregadorId(e.target.value)}
            placeholder="ID do entregador"
          />
          <Input
            label="Data"
            type="date"
            value={rotaData}
            onChange={(e) => setRotaData(e.target.value)}
          />
          <Input
            label="Unidade ID"
            value={rotaUnidadeId}
            onChange={(e) => setRotaUnidadeId(e.target.value)}
            placeholder="ID da unidade"
          />
        </div>
      </Modal>

      {/* Assign Entrega Modal */}
      <Modal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Atribuir Entrega a Rota"
        size="sm"
        actions={
          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => setShowAssignModal(false)}>
              Cancelar
            </Button>
            <Button loading={savingAssign} onClick={handleAssignEntrega}>
              Atribuir
            </Button>
          </div>
        }
      >
        <div className={styles.formFields}>
          <Input
            label="Rota ID"
            value={assignRotaId}
            onChange={(e) => setAssignRotaId(e.target.value)}
            placeholder="ID da rota"
          />
        </div>
      </Modal>

      {/* Entregador Modal */}
      <Modal
        open={showEntregadorModal}
        onClose={() => setShowEntregadorModal(false)}
        title="Novo Entregador"
        actions={
          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => setShowEntregadorModal(false)}>
              Cancelar
            </Button>
            <Button loading={savingEntregador} onClick={handleCreateEntregador}>
              Salvar
            </Button>
          </div>
        }
      >
        <div className={styles.formFields}>
          <Input
            label="Nome"
            value={entregadorNome}
            onChange={(e) => setEntregadorNome(e.target.value)}
            placeholder="Nome do entregador"
          />
          <Input
            label="Telefone"
            value={entregadorTelefone}
            onChange={(e) => setEntregadorTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
          <Input
            label="Unidade ID"
            value={entregadorUnidadeId}
            onChange={(e) => setEntregadorUnidadeId(e.target.value)}
            placeholder="ID da unidade"
          />
        </div>
      </Modal>

      {/* Veiculo Modal */}
      <Modal
        open={showVeiculoModal}
        onClose={() => setShowVeiculoModal(false)}
        title="Novo Veiculo"
        actions={
          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => setShowVeiculoModal(false)}>
              Cancelar
            </Button>
            <Button loading={savingVeiculo} onClick={handleCreateVeiculo}>
              Salvar
            </Button>
          </div>
        }
      >
        <div className={styles.formFields}>
          <Input
            label="Placa"
            value={veiculoPlaca}
            onChange={(e) => setVeiculoPlaca(e.target.value)}
            placeholder="ABC-1234"
          />
          <Input
            label="Modelo"
            value={veiculoModelo}
            onChange={(e) => setVeiculoModelo(e.target.value)}
            placeholder="Modelo do veiculo"
          />
          <Input
            label="Unidade ID"
            value={veiculoUnidadeId}
            onChange={(e) => setVeiculoUnidadeId(e.target.value)}
            placeholder="ID da unidade"
          />
        </div>
      </Modal>
    </div>
  );
}
