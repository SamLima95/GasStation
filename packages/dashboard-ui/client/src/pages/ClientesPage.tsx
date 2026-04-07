import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { PageHeader, Table, Modal, Input, Button, Skeleton, EmptyState } from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { fetchClientes, createCliente } from '@/services/clientes.api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/utils/format';
import type { Cliente } from '@/types';
import styles from './ClientesPage.module.css';

const columns: TableColumn<Cliente>[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'documento', label: 'Documento' },
  { key: 'telefone', label: 'Telefone' },
  {
    key: 'limiteCredito',
    label: 'Limite de Credito',
    render: (item) => formatCurrency(item.limiteCredito),
  },
  {
    key: 'saldoDevedor',
    label: 'Saldo Devedor',
    render: (item) => formatCurrency(item.saldoDevedor),
  },
];

interface ClienteForm {
  nome: string;
  documento: string;
  telefone: string;
  email: string;
  limiteCredito: string;
}

const emptyForm: ClienteForm = {
  nome: '',
  documento: '',
  telefone: '',
  email: '',
  limiteCredito: '',
};

export function ClientesPage() {
  const toast = useToast();
  const { data, loading, refetch } = useApiQuery<Cliente[]>(fetchClientes, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ClienteForm>({ ...emptyForm });

  function resetForm() {
    setForm({ ...emptyForm });
  }

  async function handleSave() {
    if (!form.nome.trim()) {
      toast.add('warning', 'Informe o nome do cliente');
      return;
    }
    if (!form.documento.trim()) {
      toast.add('warning', 'Informe o documento do cliente');
      return;
    }

    const limite = parseFloat(form.limiteCredito);

    setSaving(true);
    try {
      await createCliente({
        nome: form.nome.trim(),
        documento: form.documento.trim(),
        telefone: form.telefone.trim(),
        email: form.email.trim(),
        limiteCredito: isNaN(limite) ? 0 : limite,
        saldoDevedor: 0,
        unidadeId: '',
      });
      toast.add('success', 'Cliente criado com sucesso');
      setModalOpen(false);
      resetForm();
      refetch();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao criar cliente');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Clientes"
        subtitle="Gerenciamento de clientes"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Clientes' },
        ]}
        actions={
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            Novo Cliente
          </Button>
        }
      />

      {loading && !data ? (
        <Skeleton variant="table-row" count={5} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          description="Adicione o primeiro cliente."
          action={
            <Button icon={Plus} onClick={() => setModalOpen(true)}>
              Novo Cliente
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
        title="Novo Cliente"
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
          <Input
            label="Nome"
            placeholder="Nome completo"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          />
          <Input
            label="Documento"
            placeholder="CPF ou CNPJ"
            value={form.documento}
            onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))}
          />
          <div className={styles.formRow}>
            <Input
              label="Telefone"
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <Input
            label="Limite de Credito"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.limiteCredito}
            onChange={(e) => setForm((f) => ({ ...f, limiteCredito: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
