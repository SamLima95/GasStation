// eslint-disable-next-line no-unused-vars
const Dashboard = (() => {
  let refreshTimer = null;

  function kpiCard(label, value, cssClass) {
    return `
      <div class="kpi-card">
        <div class="kpi-label">${label}</div>
        <div class="kpi-value ${cssClass || ""}">${value}</div>
      </div>`;
  }

  function renderData(data) {
    const r = data.resumo;
    const e = data.estoque;
    const f = data.financeiro;
    const l = data.logistica;

    return `
      <div class="page-header">
        <h2>Dashboard</h2>
        <p>Visão geral dos KPIs do sistema</p>
      </div>

      <div class="filters-bar">
        <div class="filter-group">
          <label>Unidade ID</label>
          <input type="text" id="filter-unidade" placeholder="Opcional">
        </div>
        <div class="filter-group">
          <label>Data Início</label>
          <input type="date" id="filter-inicio">
        </div>
        <div class="filter-group">
          <label>Data Fim</label>
          <input type="date" id="filter-fim">
        </div>
        <button class="btn-filter" id="btn-apply-filter">Filtrar</button>
      </div>

      <div class="kpi-section">
        <div class="kpi-section-title">Pedidos</div>
        <div class="kpi-grid">
          ${kpiCard("Total", Utils.formatNumber(r.totalPedidos))}
          ${kpiCard("Confirmados", Utils.formatNumber(r.pedidosConfirmados), "info")}
          ${kpiCard("Pendentes", Utils.formatNumber(r.pedidosPendentes), "warning")}
          ${kpiCard("Cancelados", Utils.formatNumber(r.pedidosCancelados), "danger")}
          ${kpiCard("Faturamento", Utils.formatCurrency(r.faturamentoTotal), "currency")}
          ${kpiCard("Ticket Médio", Utils.formatCurrency(r.ticketMedio), "currency")}
        </div>
      </div>

      <div class="kpi-section">
        <div class="kpi-section-title">Estoque</div>
        <div class="kpi-grid">
          ${kpiCard("Movimentações", Utils.formatNumber(e.totalMovimentacoes))}
          ${kpiCard("Entradas", Utils.formatNumber(e.entradas), "info")}
          ${kpiCard("Saídas", Utils.formatNumber(e.saidas), "warning")}
          ${kpiCard("Retornos", Utils.formatNumber(e.retornos))}
          ${kpiCard("Avarias", Utils.formatNumber(e.avarias), "danger")}
        </div>
      </div>

      <div class="kpi-section">
        <div class="kpi-section-title">Financeiro</div>
        <div class="kpi-grid">
          ${kpiCard("Caixas Abertos", Utils.formatNumber(f.caixasAbertos), "info")}
          ${kpiCard("Caixas Fechados", Utils.formatNumber(f.caixasFechados))}
          ${kpiCard("Contas Pendentes", Utils.formatNumber(f.contasPendentes), "warning")}
          ${kpiCard("Contas Pagas", Utils.formatNumber(f.contasPagas), "info")}
          ${kpiCard("Contas Vencidas", Utils.formatNumber(f.contasVencidas), "danger")}
          ${kpiCard("Valor Total Aberto", Utils.formatCurrency(f.valorTotalAberto), "currency")}
        </div>
      </div>

      <div class="kpi-section">
        <div class="kpi-section-title">Logística</div>
        <div class="kpi-grid">
          ${kpiCard("Total Rotas", Utils.formatNumber(l.totalRotas))}
          ${kpiCard("Planejadas", Utils.formatNumber(l.rotasPlanejadas), "info")}
          ${kpiCard("Em Andamento", Utils.formatNumber(l.rotasEmAndamento), "warning")}
          ${kpiCard("Finalizadas", Utils.formatNumber(l.rotasFinalizadas), "info")}
          ${kpiCard("Total Entregas", Utils.formatNumber(l.totalEntregas))}
          ${kpiCard("Entregues", Utils.formatNumber(l.entregasEntregues), "info")}
          ${kpiCard("Pendentes", Utils.formatNumber(l.entregasPendentes), "warning")}
        </div>
      </div>

      <div class="timestamp">Gerado em: ${Utils.formatDate(data.geradoEm)}</div>
    `;
  }

  async function fetchDashboard(params) {
    const qs = new URLSearchParams();
    if (params?.unidadeId) qs.set("unidadeId", params.unidadeId);
    if (params?.dataInicio) qs.set("dataInicio", params.dataInicio);
    if (params?.dataFim) qs.set("dataFim", params.dataFim);
    const qsStr = qs.toString();
    const res = await Api.apiFetch(`/api/dashboard${qsStr ? `?${qsStr}` : ""}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || `Erro ${res.status}`);
    }
    return res.json();
  }

  async function render(container, params) {
    container.innerHTML = `<div class="loading"><div class="spinner"></div>Carregando dashboard...</div>`;
    try {
      const data = await fetchDashboard(params);
      container.innerHTML = renderData(data);
      // Bind filter button
      document.getElementById("btn-apply-filter")?.addEventListener("click", () => {
        const p = {
          unidadeId: document.getElementById("filter-unidade")?.value?.trim() || undefined,
          dataInicio: document.getElementById("filter-inicio")?.value || undefined,
          dataFim: document.getElementById("filter-fim")?.value || undefined,
        };
        render(container, p);
      });
    } catch (err) {
      container.innerHTML = `
        <div class="page-header"><h2>Dashboard</h2></div>
        <div class="error-msg">${err.message}</div>`;
    }
  }

  function mount(container) {
    render(container);
    refreshTimer = setInterval(() => render(container), 60000);
  }

  function unmount() {
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  }

  return { mount, unmount };
})();
