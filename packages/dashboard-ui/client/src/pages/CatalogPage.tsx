import { useState } from 'react';
import { Plus, PackageSearch } from 'lucide-react';
import { PageHeader, Table, Modal, Input, Button, Skeleton, EmptyState } from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { fetchItems, createItem } from '@/services/catalog.api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate } from '@/utils/format';
import type { CatalogItem } from '@/types';
import styles from './CatalogPage.module.css';

const columns: TableColumn<CatalogItem>[] = [
  { key: 'name', label: 'Nome' },
  {
    key: 'priceAmount',
    label: 'Preco',
    render: (item) => formatCurrency(item.priceAmount),
  },
  {
    key: 'createdAt',
    label: 'Criado em',
    render: (item) => formatDate(item.createdAt),
  },
];

export function CatalogPage() {
  const toast = useToast();
  const { data, loading, refetch } = useApiQuery<CatalogItem[]>(fetchItems, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    priceAmount: '',
    priceCurrency: 'BRL',
  });

  function resetForm() {
    setForm({ name: '', priceAmount: '', priceCurrency: 'BRL' });
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.add('warning', 'Informe o nome do item');
      return;
    }

    const price = parseFloat(form.priceAmount);
    if (isNaN(price) || price <= 0) {
      toast.add('warning', 'Informe um preco valido');
      return;
    }

    setSaving(true);
    try {
      await createItem({
        name: form.name.trim(),
        priceAmount: price,
        priceCurrency: form.priceCurrency,
      });
      toast.add('success', 'Item criado com sucesso');
      setModalOpen(false);
      resetForm();
      refetch();
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao criar item');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Catalogo"
        subtitle="Itens disponiveis para venda"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Catalogo' },
        ]}
        actions={
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            Novo Item
          </Button>
        }
      />

      {loading && !data ? (
        <Skeleton variant="table-row" count={5} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Nenhum item cadastrado"
          description="Adicione o primeiro item ao catalogo."
          action={
            <Button icon={Plus} onClick={() => setModalOpen(true)}>
              Novo Item
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
        title="Novo Item"
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
            placeholder="Ex: Gas GLP 13kg"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Preco"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.priceAmount}
            onChange={(e) => setForm((f) => ({ ...f, priceAmount: e.target.value }))}
          />
          <Input
            label="Moeda"
            value={form.priceCurrency}
            onChange={(e) => setForm((f) => ({ ...f, priceCurrency: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
