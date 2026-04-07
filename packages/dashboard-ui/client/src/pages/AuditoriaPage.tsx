import { useState, useCallback } from 'react';
import { FileSearch } from 'lucide-react';
import {
  PageHeader,
  Table,
  Modal,
  Input,
  FilterBar,
  Skeleton,
  EmptyState,
  type TableColumn,
} from '@/components/ui';
import { fetchAuditLogs } from '@/services/auditoria.api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { formatDateTime } from '@/utils/format';
import type { AuditLog, AuditFilter } from '@/types';
import styles from './AuditoriaPage.module.css';

export function AuditoriaPage() {
  const [filter, setFilter] = useState<AuditFilter>({});
  const [appliedFilter, setAppliedFilter] = useState<AuditFilter>({});
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetcher = useCallback(() => fetchAuditLogs(appliedFilter), [appliedFilter]);
  const { data: logs, loading } = useApiQuery<AuditLog[]>(fetcher, [appliedFilter]);

  function handleApply() {
    setAppliedFilter({ ...filter });
  }

  function handleClear() {
    setFilter({});
    setAppliedFilter({});
  }

  const columns: TableColumn<AuditLog>[] = [
    { key: 'servico', label: 'Servico' },
    { key: 'entidade', label: 'Entidade' },
    { key: 'acao', label: 'Acao' },
    { key: 'usuarioId', label: 'Usuario' },
    { key: 'unidadeId', label: 'Unidade' },
    {
      key: 'createdAt',
      label: 'Data',
      render: (item) => formatDateTime(item.createdAt),
    },
  ];

  return (
    <div className={styles.page}>
      <PageHeader
        title="Auditoria"
        subtitle="Logs de auditoria do sistema"
      />

      <FilterBar onApply={handleApply} onClear={handleClear}>
        <Input
          label="Servico"
          value={filter.servico ?? ''}
          onChange={(e) => setFilter((prev) => ({ ...prev, servico: e.target.value }))}
          placeholder="Ex: financeiro-service"
        />
        <Input
          label="Entidade"
          value={filter.entidade ?? ''}
          onChange={(e) => setFilter((prev) => ({ ...prev, entidade: e.target.value }))}
          placeholder="Ex: Caixa"
        />
        <Input
          label="Acao"
          value={filter.acao ?? ''}
          onChange={(e) => setFilter((prev) => ({ ...prev, acao: e.target.value }))}
          placeholder="Ex: CREATE"
        />
        <Input
          label="Data Inicio"
          type="date"
          value={filter.dataInicio ?? ''}
          onChange={(e) => setFilter((prev) => ({ ...prev, dataInicio: e.target.value }))}
        />
        <Input
          label="Data Fim"
          type="date"
          value={filter.dataFim ?? ''}
          onChange={(e) => setFilter((prev) => ({ ...prev, dataFim: e.target.value }))}
        />
      </FilterBar>

      {loading ? (
        <Skeleton variant="table-row" count={8} />
      ) : !logs || logs.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="Nenhum log encontrado"
          description="Ajuste os filtros para encontrar registros de auditoria"
        />
      ) : (
        <Table
          columns={columns}
          data={logs}
          onRowClick={(item) => setSelectedLog(item)}
        />
      )}

      <Modal
        open={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="Detalhes do Log"
        size="lg"
      >
        {selectedLog && (
          <div className={styles.jsonContent}>
            {JSON.stringify(selectedLog.dados, null, 2)}
          </div>
        )}
      </Modal>
    </div>
  );
}
