// eslint-disable-next-line no-unused-vars
const Auditoria = (() => {
  let logs = [];

  function renderTable() {
    if (logs.length === 0) {
      return `<div class="empty-state">Nenhum registro de auditoria encontrado.</div>`;
    }
    let rows = "";
    for (const l of logs) {
      rows += `<tr>
        <td><span class="badge badge-info">${l.servico}</span></td>
        <td>${l.entidade}</td>
        <td class="td-name">${l.acao}</td>
        <td>${l.usuarioId || "—"}</td>
        <td>${l.unidadeId || "—"}</td>
        <td class="td-date">${Utils.formatDate(l.occurredAt)}</td>
        <td>
          ${l.detalhes ? `<button class="btn-sm btn-detail" data-id="${l.id}">Ver</button>` : "—"}
        </td>
      </tr>`;
    }
    return `<div class="table-wrapper"><table class="data-table">
      <thead><tr><th>Servico</th><th>Entidade</th><th>Acao</th><th>Usuario</th><th>Unidade</th><th>Data</th><th>Detalhes</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  function renderPage() {
    return `
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <h2>Auditoria</h2>
            <p>Logs de auditoria do sistema</p>
          </div>
          <button class="btn-primary btn-add" id="btn-filter-toggle">Filtros</button>
        </div>
      </div>

      <div class="filters-bar hidden" id="filters-bar">
        <div class="filter-group">
          <label>Servico</label>
          <input type="text" id="f-servico" placeholder="Opcional">
        </div>
        <div class="filter-group">
          <label>Entidade</label>
          <input type="text" id="f-entidade" placeholder="Opcional">
        </div>
        <div class="filter-group">
          <label>Acao</label>
          <input type="text" id="f-acao" placeholder="Opcional">
        </div>
        <div class="filter-group">
          <label>Usuario ID</label>
          <input type="text" id="f-usuario" placeholder="Opcional">
        </div>
        <div class="filter-group">
          <label>Unidade ID</label>
          <input type="text" id="f-unidade" placeholder="Opcional">
        </div>
        <div class="filter-group">
          <label>Data Inicio</label>
          <input type="date" id="f-inicio">
        </div>
        <div class="filter-group">
          <label>Data Fim</label>
          <input type="date" id="f-fim">
        </div>
        <button class="btn-filter" id="btn-apply-filter">Filtrar</button>
      </div>

      <div id="audit-table">${renderTable()}</div>

      <!-- Modal Detalhes -->
      <div class="modal-overlay hidden" id="modal-detail">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Detalhes do Evento</h3>
            <button class="modal-close" id="modal-detail-close">&times;</button>
          </div>
          <pre class="detail-pre" id="detail-content"></pre>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" id="btn-detail-close">Fechar</button>
          </div>
        </div>
      </div>
    `;
  }

  async function fetchLogs(params) {
    const qs = new URLSearchParams();
    if (params?.servico) qs.set("servico", params.servico);
    if (params?.entidade) qs.set("entidade", params.entidade);
    if (params?.acao) qs.set("acao", params.acao);
    if (params?.usuarioId) qs.set("usuarioId", params.usuarioId);
    if (params?.unidadeId) qs.set("unidadeId", params.unidadeId);
    if (params?.dataInicio) qs.set("dataInicio", params.dataInicio);
    if (params?.dataFim) qs.set("dataFim", params.dataFim);
    const qsStr = qs.toString();
    const res = await Api.apiFetch(`/api/auditoria${qsStr ? `?${qsStr}` : ""}`);
    if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || b.message || `Erro ${res.status}`); }
    return res.json();
  }

  function getFilters() {
    return {
      servico: document.getElementById("f-servico")?.value?.trim() || undefined,
      entidade: document.getElementById("f-entidade")?.value?.trim() || undefined,
      acao: document.getElementById("f-acao")?.value?.trim() || undefined,
      usuarioId: document.getElementById("f-usuario")?.value?.trim() || undefined,
      unidadeId: document.getElementById("f-unidade")?.value?.trim() || undefined,
      dataInicio: document.getElementById("f-inicio")?.value || undefined,
      dataFim: document.getElementById("f-fim")?.value || undefined,
    };
  }

  function bindEvents(container) {
    // Toggle filters
    document.getElementById("btn-filter-toggle").addEventListener("click", () => {
      document.getElementById("filters-bar").classList.toggle("hidden");
    });

    // Apply filters
    document.getElementById("btn-apply-filter").addEventListener("click", async () => {
      const tableEl = document.getElementById("audit-table");
      tableEl.innerHTML = `<div class="loading"><div class="spinner"></div>Filtrando...</div>`;
      try {
        logs = await fetchLogs(getFilters());
        tableEl.innerHTML = renderTable();
        bindTableEvents();
      } catch (err) {
        tableEl.innerHTML = `<div class="error-msg">${err.message}</div>`;
      }
    });

    // Detail modal
    document.getElementById("modal-detail-close").addEventListener("click", () => {
      document.getElementById("modal-detail").classList.add("hidden");
    });
    document.getElementById("btn-detail-close").addEventListener("click", () => {
      document.getElementById("modal-detail").classList.add("hidden");
    });
    document.getElementById("modal-detail").addEventListener("click", (e) => {
      if (e.target.id === "modal-detail") document.getElementById("modal-detail").classList.add("hidden");
    });

    bindTableEvents();
  }

  function bindTableEvents() {
    document.getElementById("audit-table").addEventListener("click", (e) => {
      if (!e.target.classList.contains("btn-detail")) return;
      const id = e.target.dataset.id;
      const log = logs.find((l) => l.id === id);
      if (!log || !log.detalhes) return;
      document.getElementById("detail-content").textContent = JSON.stringify(log.detalhes, null, 2);
      document.getElementById("modal-detail").classList.remove("hidden");
    });
  }

  async function mount(container) {
    container.innerHTML = `<div class="loading"><div class="spinner"></div>Carregando auditoria...</div>`;
    try {
      logs = await fetchLogs();
      container.innerHTML = renderPage();
      bindEvents(container);
    } catch (err) {
      container.innerHTML = `<div class="page-header"><h2>Auditoria</h2></div><div class="error-msg">${err.message}</div>`;
    }
  }

  function unmount() {}
  return { mount, unmount };
})();
