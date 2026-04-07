import { useState } from 'react';
import { Inbox } from 'lucide-react';
import {
  PageHeader,
  Button,
  Badge,
  Card,
  Input,
  Select,
  Table,
  Modal,
  Tabs,
  KpiCard,
  Skeleton,
  EmptyState,
  type TableColumn,
} from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import styles from './DesignSystemPage.module.css';

interface SampleRow {
  id: string;
  nome: string;
  status: string;
  valor: string;
  [key: string]: unknown;
}

const COLORS: { label: string; value: string }[] = [
  { label: 'Primary', value: 'var(--color-primary)' },
  { label: 'Primary Hover', value: 'var(--color-primary-hover)' },
  { label: 'BG Body', value: 'var(--color-bg-body)' },
  { label: 'BG Surface', value: 'var(--color-bg-surface)' },
  { label: 'BG Elevated', value: 'var(--color-bg-elevated)' },
  { label: 'Text', value: 'var(--color-text)' },
  { label: 'Text Secondary', value: 'var(--color-text-secondary)' },
  { label: 'Text Muted', value: 'var(--color-text-muted)' },
  { label: 'Success', value: 'var(--color-success)' },
  { label: 'Danger', value: 'var(--color-danger)' },
  { label: 'Warning', value: 'var(--color-warning)' },
  { label: 'Info', value: 'var(--color-info)' },
  { label: 'Border', value: 'var(--color-border)' },
];

const SAMPLE_TABLE_DATA: SampleRow[] = [
  { id: '1', nome: 'Item Alpha', status: 'Ativo', valor: 'R$ 100,00' },
  { id: '2', nome: 'Item Beta', status: 'Inativo', valor: 'R$ 250,00' },
  { id: '3', nome: 'Item Gamma', status: 'Ativo', valor: 'R$ 75,50' },
];

const SAMPLE_COLUMNS: TableColumn<SampleRow>[] = [
  { key: 'id', label: 'ID' },
  { key: 'nome', label: 'Nome' },
  { key: 'status', label: 'Status' },
  { key: 'valor', label: 'Valor' },
];

export function DesignSystemPage() {
  const toast = useToast();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoTab, setDemoTab] = useState('tab1');
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('opt1');

  return (
    <div className={styles.page}>
      <PageHeader title="Design System" subtitle="Guia completo de componentes" />

      {/* 1. Colors */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Colors</h2>
        <div className={styles.row}>
          {COLORS.map((c) => (
            <div key={c.label} className={styles.colorSwatch}>
              <div className={styles.swatchBox} style={{ background: c.value }} />
              <span className={styles.swatchLabel}>{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Typography</h2>
        <div className={styles.typoItem}>
          <span className={styles.typoLabel}>xs</span>
          <span className={styles.typoXs}>The quick brown fox jumps over the lazy dog</span>
        </div>
        <div className={styles.typoItem}>
          <span className={styles.typoLabel}>sm</span>
          <span className={styles.typoSm}>The quick brown fox jumps over the lazy dog</span>
        </div>
        <div className={styles.typoItem}>
          <span className={styles.typoLabel}>base</span>
          <span className={styles.typoBase}>The quick brown fox jumps over the lazy dog</span>
        </div>
        <div className={styles.typoItem}>
          <span className={styles.typoLabel}>lg</span>
          <span className={styles.typoLg}>The quick brown fox jumps over the lazy dog</span>
        </div>
        <div className={styles.typoItem}>
          <span className={styles.typoLabel}>xl</span>
          <span className={styles.typoXl}>The quick brown fox jumps over the lazy dog</span>
        </div>
        <div className={styles.typoItem}>
          <span className={styles.typoLabel}>2xl</span>
          <span className={styles.typo2xl}>The quick brown fox jumps over the lazy dog</span>
        </div>
        <div className={styles.typoItem}>
          <span className={styles.typoLabel}>3xl</span>
          <span className={styles.typo3xl}>The quick brown fox jumps over the lazy dog</span>
        </div>
      </section>

      {/* 3. Buttons */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Buttons</h2>
        <div className={styles.row}>
          <Button variant="primary" size="sm">Primary SM</Button>
          <Button variant="primary" size="md">Primary MD</Button>
          <Button variant="primary" size="lg">Primary LG</Button>
        </div>
        <div className={styles.row}>
          <Button variant="secondary" size="sm">Secondary SM</Button>
          <Button variant="secondary" size="md">Secondary MD</Button>
          <Button variant="secondary" size="lg">Secondary LG</Button>
        </div>
        <div className={styles.row}>
          <Button variant="ghost" size="sm">Ghost SM</Button>
          <Button variant="ghost" size="md">Ghost MD</Button>
          <Button variant="ghost" size="lg">Ghost LG</Button>
        </div>
        <div className={styles.row}>
          <Button variant="danger" size="sm">Danger SM</Button>
          <Button variant="danger" size="md">Danger MD</Button>
          <Button variant="danger" size="lg">Danger LG</Button>
        </div>
        <div className={styles.row}>
          <Button variant="primary" loading>Loading</Button>
        </div>
      </section>

      {/* 4. Badges */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Badges</h2>
        <div className={styles.row}>
          <Badge variant="info">Info</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
      </section>

      {/* 5. Cards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cards</h2>
        <div className={styles.cardDemo}>
          <Card title="Titulo do Card" subtitle="Subtitulo descritivo">
            <p style={{ color: 'var(--color-text-secondary)', padding: 'var(--space-4)' }}>
              Conteudo do card com texto de exemplo para demonstrar o layout.
            </p>
          </Card>
        </div>
      </section>

      {/* 6. Inputs */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Inputs</h2>
        <div className={styles.inputRow}>
          <div className={styles.inputItem}>
            <Input
              label="Input padrao"
              placeholder="Digite algo..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <div className={styles.inputItem}>
            <Input
              label="Input com erro"
              placeholder="Campo obrigatorio"
              error="Este campo e obrigatorio"
              value=""
              onChange={() => {}}
            />
          </div>
          <div className={styles.inputItem}>
            <Select
              label="Select"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              options={[
                { value: 'opt1', label: 'Opcao 1' },
                { value: 'opt2', label: 'Opcao 2' },
                { value: 'opt3', label: 'Opcao 3' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 7. Table */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Table</h2>
        <Table columns={SAMPLE_COLUMNS} data={SAMPLE_TABLE_DATA} />
      </section>

      {/* 8. Modal */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Modal</h2>
        <Button onClick={() => setDemoModalOpen(true)}>Abrir Modal</Button>
        <Modal
          open={demoModalOpen}
          onClose={() => setDemoModalOpen(false)}
          title="Modal de Demonstracao"
          actions={
            <Button onClick={() => setDemoModalOpen(false)}>Fechar</Button>
          }
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Este e um modal de demonstracao do design system. Ele suporta tamanhos sm, md e lg, alem de acoes no rodape.
          </p>
        </Modal>
      </section>

      {/* 9. Tabs */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tabs</h2>
        <div className={styles.tabDemo}>
          <Tabs
            tabs={[
              { key: 'tab1', label: 'Primeira' },
              { key: 'tab2', label: 'Segunda' },
              { key: 'tab3', label: 'Terceira' },
            ]}
            active={demoTab}
            onChange={setDemoTab}
          />
          <Card>
            <p style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
              Conteudo da aba: <strong>{demoTab}</strong>
            </p>
          </Card>
        </div>
      </section>

      {/* 10. KPI Cards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>KPI Cards</h2>
        <div className={styles.kpiRow}>
          <KpiCard label="Receita Total" value="R$ 45.200" variant="success" trend="up" />
          <KpiCard label="Despesas" value="R$ 12.800" variant="danger" trend="down" />
          <KpiCard label="Pedidos Pendentes" value="23" variant="warning" />
          <KpiCard label="Entregas Hoje" value="8" variant="default" />
        </div>
      </section>

      {/* 11. Skeleton */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Skeleton</h2>
        <div className={styles.skeletonRow}>
          <Skeleton variant="text" count={3} />
          <Skeleton variant="card" />
          <Skeleton variant="table-row" count={2} />
        </div>
      </section>

      {/* 12. Empty State */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Empty State</h2>
        <EmptyState
          icon={Inbox}
          title="Nenhum item encontrado"
          description="Tente ajustar os filtros ou criar um novo registro."
          action={<Button variant="primary">Criar Novo</Button>}
        />
      </section>

      {/* 13. Toast */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Toast</h2>
        <div className={styles.row}>
          <Button variant="primary" onClick={() => toast.add('success', 'Operacao realizada com sucesso!')}>
            Toast Success
          </Button>
          <Button variant="danger" onClick={() => toast.add('error', 'Ocorreu um erro inesperado.')}>
            Toast Error
          </Button>
          <Button variant="secondary" onClick={() => toast.add('warning', 'Atencao: verifique os dados.')}>
            Toast Warning
          </Button>
          <Button variant="ghost" onClick={() => toast.add('info', 'Informacao importante para voce.')}>
            Toast Info
          </Button>
        </div>
      </section>
    </div>
  );
}
