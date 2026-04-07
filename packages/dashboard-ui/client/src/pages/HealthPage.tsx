import { Activity, Server, Wifi, WifiOff } from 'lucide-react';
import { PageHeader, Badge, Card, Skeleton, EmptyState } from '@/components/ui';
import { fetchHealthCheck } from '@/services/health.api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useInterval } from '@/hooks/useInterval';
import type { ServiceHealth } from '@/types';
import styles from './HealthPage.module.css';

export function HealthPage() {
  const { data, loading, refetch } = useApiQuery<ServiceHealth[]>(fetchHealthCheck, []);

  useInterval(refetch, 10_000);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Health dos Servicos"
        subtitle="Monitoramento em tempo real (atualiza a cada 10s)"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Health' },
        ]}
      />

      {loading && !data ? (
        <div className={styles.grid}>
          <Skeleton variant="card" count={6} />
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Server}
          title="Nenhum servico encontrado"
          description="Nao foi possivel obter informacoes dos servicos."
        />
      ) : (
        <div className={styles.grid}>
          {data.map((service) => (
            <Card key={service.key} className={
              service.status === 'ok' ? styles.cardOk : styles.cardDown
            }>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div className={styles.serviceName}>
                    {service.status === 'ok' ? (
                      <Wifi size={18} className={styles.iconOk} />
                    ) : (
                      <WifiOff size={18} className={styles.iconDown} />
                    )}
                    <span className={styles.name}>{service.name}</span>
                  </div>
                  <Badge variant={service.status === 'ok' ? 'success' : 'danger'}>
                    {service.status === 'ok' ? 'Online' : 'Offline'}
                  </Badge>
                </div>

                <div className={styles.details}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>URL</span>
                    <span className={styles.detailValue}>{service.url}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <Activity size={14} className={styles.detailIcon} />
                    <span className={styles.detailLabel}>Tempo de resposta</span>
                    <span className={styles.responseTime}>
                      {service.responseTimeMs}ms
                    </span>
                  </div>
                  {service.detail && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Detalhe</span>
                      <span className={styles.detailValue}>{service.detail}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
