// eslint-disable-next-line no-unused-vars
const Logistica = (() => {
  let rotas = [];
  let entregas = [];
  let entregadores = [];
  let veiculos = [];
  let activeTab = "rotas";

  const statusRotaLabels = { PLANEJADA: "Planejada", EM_ANDAMENTO: "Em Andamento", FINALIZADA: "Finalizada", CANCELADA: "Cancelada" };
  const statusRotaClass = { PLANEJADA: "info", EM_ANDAMENTO: "warning", FINALIZADA: "info", CANCELADA: "danger" };

  const statusEntregaLabels = { PENDENTE: "Pendente", EM_TRANSITO: "Em Transito", ENTREGUE: "Entregue", FALHA: "Falha" };
  const statusEntregaClass = { PENDENTE: "warning", EM_TRANSITO: "info", ENTREGUE: "info", FALHA: "danger" };

  // ── Tables ──

  function renderRotasTable() {
    if (rotas.length === 0) return `<div class="empty-state">Nenhuma rota cadastrada.</div>`;
    let rows = "";
    for (const r of rotas) {
      const ent = entregadores.find((e) => e.id === r.entregadorId);
      const vei = veiculos.find((v) => v.id === r.veiculoId);
      const cls = statusRotaClass[r.status] || "";
      rows += `<tr>
        <td class="td-name">${ent ? ent.nome : r.entregadorId.substring(0, 8) + "..."}</td>
        <td>${vei ? vei.placa + " — " + vei.modelo : r.veiculoId.substring(0, 8) + "..."}</td>
        <td><span class="badge badge-${cls}">${statusRotaLabels[r.status] || r.status}</span></td>
        <td class="td-date">${Utils.formatDate(r.dataRota)}</td>
        <td>${r.unidadeId}</td>
      </tr>`;
    }
    return `<div class="table-wrapper"><table class="data-table">
      <thead><tr><th>Entregador</th><th>Veiculo</th><th>Status</th><th>Data</th><th>Unidade</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  function renderEntregasTable() {
    if (entregas.length === 0) return `<div class="empty-state">Nenhuma entrega cadastrada.</div>`;
    let rows = "";
    for (const e of entregas) {
      const cls = statusEntregaClass[e.status] || "";
      rows += `<tr>
        <td>${e.pedidoId.substring(0, 8)}...</td>
        <td><span class="badge badge-${cls}">${statusEntregaLabels[e.status] || e.status}</span></td>
        <td class="td-date">${e.dataConfirmacao ? Utils.formatDate(e.dataConfirmacao) : "—"}</td>
        <td>
          ${e.status === "PENDENTE" ? `<button class="btn-sm btn-confirm" data-id="${e.id}" data-action="assign">Atribuir</button>` : ""}
          ${e.status === "EM_TRANSITO" ? `<button class="btn-sm btn-confirm" data-id="${e.id}" data-action="confirm-entrega">Confirmar</button>` : ""}
        </td>
      </tr>`;
    }
    return `<div class="table-wrapper"><table class="data-table">
      <thead><tr><th>Pedido</th><th>Status</th><th>Confirmacao</th><th>Acoes</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  function renderEntregadoresTable() {
    if (entregadores.length === 0) return `<div class="empty-state">Nenhum entregador cadastrado.</div>`;
    let rows = "";
    for (const e of entregadores) {
      rows += `<tr>
        <td class="td-name">${e.nome}</td>
        <td>${e.documento}</td>
        <td><span class="badge badge-${e.ativo ? "info" : "danger"}">${e.ativo ? "Ativo" : "Inativo"}</span></td>
        <td>${e.unidadeId}</td>
      </tr>`;
    }
    return `<div class="table-wrapper"><table class="data-table">
      <thead><tr><th>Nome</th><th>Documento</th><th>Status</th><th>Unidade</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  function renderVeiculosTable() {
    if (veiculos.length === 0) return `<div class="empty-state">Nenhum veiculo cadastrado.</div>`;
    let rows = "";
    for (const v of veiculos) {
      rows += `<tr>
        <td class="td-name">${v.placa}</td>
        <td>${v.modelo}</td>
        <td><span class="badge badge-${v.ativo ? "info" : "danger"}">${v.ativo ? "Ativo" : "Inativo"}</span></td>
        <td>${v.unidadeId}</td>
      </tr>`;
    }
    return `<div class="table-wrapper"><table class="data-table">
      <thead><tr><th>Placa</th><th>Modelo</th><th>Status</th><th>Unidade</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  const tabContentFn = {
    rotas: renderRotasTable,
    entregas: renderEntregasTable,
    entregadores: renderEntregadoresTable,
    veiculos: renderVeiculosTable,
  };

  const btnLabels = {
    rotas: "+ Nova Rota",
    entregas: "",
    entregadores: "+ Novo Entregador",
    veiculos: "+ Novo Veiculo",
  };

  function entregadorOptions() {
    return entregadores.filter((e) => e.ativo).map((e) => `<option value="${e.id}">${e.nome}</option>`).join("");
  }
  function veiculoOptions() {
    return veiculos.filter((v) => v.ativo).map((v) => `<option value="${v.id}">${v.placa} — ${v.modelo}</option>`).join("");
  }
  function rotaOptions() {
    return rotas.filter((r) => r.status === "PLANEJADA" || r.status === "EM_ANDAMENTO").map((r) => {
      const ent = entregadores.find((e) => e.id === r.entregadorId);
      return `<option value="${r.id}">${ent ? ent.nome : "Rota"} — ${Utils.formatDate(r.dataRota)}</option>`;
    }).join("");
  }

  // ── Page ──

  function renderPage() {
    const tabs = ["rotas", "entregas", "entregadores", "veiculos"];
    const tabNames = { rotas: "Rotas", entregas: "Entregas", entregadores: "Entregadores", veiculos: "Veiculos" };
    const tabBtns = tabs.map((t) => `<button class="tab-btn ${activeTab === t ? "active" : ""}" data-tab="${t}">${tabNames[t]}</button>`).join("");
    const label = btnLabels[activeTab];

    return `
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <h2>Logistica</h2>
            <p>Rotas, entregas, entregadores e veiculos</p>
          </div>
          ${label ? `<button class="btn-primary btn-add" id="btn-new-entry">${label}</button>` : ""}
        </div>
      </div>

      <div class="tabs-bar">${tabBtns}</div>
      <div id="tab-content">${tabContentFn[activeTab]()}</div>

      <!-- Modal Rota -->
      <div class="modal-overlay hidden" id="modal-rota">
        <div class="modal-card">
          <div class="modal-header"><h3>Nova Rota</h3><button class="modal-close" id="modal-rota-close">&times;</button></div>
          <form id="form-rota">
            <div class="form-row">
              <div class="form-group form-group-flex">
                <label for="rota-entregador">Entregador</label>
                <select id="rota-entregador" required><option value="">Selecione</option>${entregadorOptions()}</select>
              </div>
              <div class="form-group form-group-flex">
                <label for="rota-veiculo">Veiculo</label>
                <select id="rota-veiculo" required><option value="">Selecione</option>${veiculoOptions()}</select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-flex">
                <label for="rota-data">Data da Rota</label>
                <input type="datetime-local" id="rota-data" required>
              </div>
              <div class="form-group form-group-flex">
                <label for="rota-unidade">Unidade ID</label>
                <input type="text" id="rota-unidade" placeholder="unidade-01" required>
              </div>
            </div>
            <p id="form-rota-error" class="login-error hidden"></p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="btn-rota-cancel">Cancelar</button>
              <button type="submit" class="btn-primary" id="btn-rota-save">Criar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Entregador -->
      <div class="modal-overlay hidden" id="modal-entregador">
        <div class="modal-card">
          <div class="modal-header"><h3>Novo Entregador</h3><button class="modal-close" id="modal-entregador-close">&times;</button></div>
          <form id="form-entregador">
            <div class="form-group"><label for="ent-nome">Nome</label><input type="text" id="ent-nome" placeholder="Nome completo" required></div>
            <div class="form-row">
              <div class="form-group form-group-flex"><label for="ent-doc">Documento</label><input type="text" id="ent-doc" placeholder="CPF" required></div>
              <div class="form-group form-group-flex"><label for="ent-unidade">Unidade ID</label><input type="text" id="ent-unidade" placeholder="unidade-01" required></div>
            </div>
            <p id="form-entregador-error" class="login-error hidden"></p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="btn-entregador-cancel">Cancelar</button>
              <button type="submit" class="btn-primary" id="btn-entregador-save">Salvar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Veiculo -->
      <div class="modal-overlay hidden" id="modal-veiculo">
        <div class="modal-card">
          <div class="modal-header"><h3>Novo Veiculo</h3><button class="modal-close" id="modal-veiculo-close">&times;</button></div>
          <form id="form-veiculo">
            <div class="form-row">
              <div class="form-group form-group-flex"><label for="vei-placa">Placa</label><input type="text" id="vei-placa" placeholder="ABC-1234" required></div>
              <div class="form-group form-group-flex"><label for="vei-modelo">Modelo</label><input type="text" id="vei-modelo" placeholder="Fiat Fiorino" required></div>
            </div>
            <div class="form-group"><label for="vei-unidade">Unidade ID</label><input type="text" id="vei-unidade" placeholder="unidade-01" required></div>
            <p id="form-veiculo-error" class="login-error hidden"></p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="btn-veiculo-cancel">Cancelar</button>
              <button type="submit" class="btn-primary" id="btn-veiculo-save">Salvar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Assign -->
      <div class="modal-overlay hidden" id="modal-assign">
        <div class="modal-card">
          <div class="modal-header"><h3>Atribuir a Rota</h3><button class="modal-close" id="modal-assign-close">&times;</button></div>
          <form id="form-assign">
            <input type="hidden" id="assign-entrega-id">
            <div class="form-group">
              <label for="assign-rota">Rota</label>
              <select id="assign-rota" required><option value="">Selecione</option>${rotaOptions()}</select>
            </div>
            <p id="form-assign-error" class="login-error hidden"></p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="btn-assign-cancel">Cancelar</button>
              <button type="submit" class="btn-primary" id="btn-assign-save">Atribuir</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // ── API ──

  async function apiFetch(path) {
    const res = await Api.apiFetch(path);
    if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || b.message || `Erro ${res.status}`); }
    return res.json();
  }

  async function apiPost(path, data) {
    const res = await Api.apiFetch(path, { method: "POST", body: data });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || body.message || `Erro ${res.status}`);
    return body;
  }

  async function apiPatch(path, data) {
    const res = await Api.apiFetch(path, { method: "PATCH", body: data || {} });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || body.message || `Erro ${res.status}`);
    return body;
  }

  // ── Helpers ──

  function closeModal(id) { document.getElementById(id).classList.add("hidden"); }
  function openModal(id) { document.getElementById(id).classList.remove("hidden"); }

  function setupModal(modalId, closeId, cancelId, formId, submitFn) {
    document.getElementById(closeId).addEventListener("click", () => closeModal(modalId));
    document.getElementById(cancelId).addEventListener("click", () => closeModal(modalId));
    document.getElementById(modalId).addEventListener("click", (e) => { if (e.target.id === modalId) closeModal(modalId); });
    document.getElementById(formId).addEventListener("submit", submitFn);
  }

  // ── Events ──

  function bindEvents(container) {
    // Tabs
    container.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
        container.innerHTML = renderPage();
        bindEvents(container);
      });
    });

    // New entry
    const btnNew = document.getElementById("btn-new-entry");
    if (btnNew) {
      btnNew.addEventListener("click", () => {
        if (activeTab === "rotas") openModal("modal-rota");
        else if (activeTab === "entregadores") openModal("modal-entregador");
        else if (activeTab === "veiculos") openModal("modal-veiculo");
      });
    }

    // ── Rota ──
    setupModal("modal-rota", "modal-rota-close", "btn-rota-cancel", "form-rota", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-rota-error");
      const btn = document.getElementById("btn-rota-save");
      const entregadorId = document.getElementById("rota-entregador").value;
      const veiculoId = document.getElementById("rota-veiculo").value;
      const dataRaw = document.getElementById("rota-data").value;
      const unidadeId = document.getElementById("rota-unidade").value.trim();
      if (!entregadorId || !veiculoId || !dataRaw || !unidadeId) { errEl.textContent = "Preencha todos os campos."; errEl.classList.remove("hidden"); return; }
      btn.disabled = true; btn.textContent = "Criando..."; errEl.classList.add("hidden");
      try {
        const novo = await apiPost("/api/rotas", { entregadorId, veiculoId, dataRota: new Date(dataRaw).toISOString(), unidadeId });
        rotas.unshift(novo);
        document.getElementById("tab-content").innerHTML = renderRotasTable();
        closeModal("modal-rota"); document.getElementById("form-rota").reset();
      } catch (err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
      finally { btn.disabled = false; btn.textContent = "Criar"; }
    });

    // ── Entregador ──
    setupModal("modal-entregador", "modal-entregador-close", "btn-entregador-cancel", "form-entregador", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-entregador-error");
      const btn = document.getElementById("btn-entregador-save");
      const nome = document.getElementById("ent-nome").value.trim();
      const documento = document.getElementById("ent-doc").value.trim();
      const unidadeId = document.getElementById("ent-unidade").value.trim();
      if (!nome || !documento || !unidadeId) { errEl.textContent = "Preencha todos os campos."; errEl.classList.remove("hidden"); return; }
      btn.disabled = true; btn.textContent = "Salvando..."; errEl.classList.add("hidden");
      try {
        const novo = await apiPost("/api/entregadores", { nome, documento, unidadeId });
        entregadores.unshift(novo);
        document.getElementById("tab-content").innerHTML = renderEntregadoresTable();
        closeModal("modal-entregador"); document.getElementById("form-entregador").reset();
      } catch (err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
      finally { btn.disabled = false; btn.textContent = "Salvar"; }
    });

    // ── Veiculo ──
    setupModal("modal-veiculo", "modal-veiculo-close", "btn-veiculo-cancel", "form-veiculo", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-veiculo-error");
      const btn = document.getElementById("btn-veiculo-save");
      const placa = document.getElementById("vei-placa").value.trim();
      const modelo = document.getElementById("vei-modelo").value.trim();
      const unidadeId = document.getElementById("vei-unidade").value.trim();
      if (!placa || !modelo || !unidadeId) { errEl.textContent = "Preencha todos os campos."; errEl.classList.remove("hidden"); return; }
      btn.disabled = true; btn.textContent = "Salvando..."; errEl.classList.add("hidden");
      try {
        const novo = await apiPost("/api/veiculos", { placa, modelo, unidadeId });
        veiculos.unshift(novo);
        document.getElementById("tab-content").innerHTML = renderVeiculosTable();
        closeModal("modal-veiculo"); document.getElementById("form-veiculo").reset();
      } catch (err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
      finally { btn.disabled = false; btn.textContent = "Salvar"; }
    });

    // ── Assign ──
    setupModal("modal-assign", "modal-assign-close", "btn-assign-cancel", "form-assign", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-assign-error");
      const btn = document.getElementById("btn-assign-save");
      const entregaId = document.getElementById("assign-entrega-id").value;
      const rotaId = document.getElementById("assign-rota").value;
      if (!rotaId) { errEl.textContent = "Selecione uma rota."; errEl.classList.remove("hidden"); return; }
      btn.disabled = true; btn.textContent = "Atribuindo..."; errEl.classList.add("hidden");
      try {
        const updated = await apiPatch(`/api/entregas/${entregaId}/assign`, { rotaId });
        const idx = entregas.findIndex((en) => en.id === entregaId);
        if (idx >= 0) entregas[idx] = updated;
        document.getElementById("tab-content").innerHTML = renderEntregasTable();
        closeModal("modal-assign"); document.getElementById("form-assign").reset();
      } catch (err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
      finally { btn.disabled = false; btn.textContent = "Atribuir"; }
    });

    // ── Table actions (delegated) ──
    document.getElementById("tab-content").addEventListener("click", async (e) => {
      const btn = e.target;
      if (!btn.classList.contains("btn-confirm")) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === "assign") {
        document.getElementById("assign-entrega-id").value = id;
        openModal("modal-assign");
      } else if (action === "confirm-entrega") {
        btn.disabled = true; btn.textContent = "Confirmando...";
        try {
          const updated = await apiPatch(`/api/entregas/${id}/confirm`);
          const idx = entregas.findIndex((en) => en.id === id);
          if (idx >= 0) entregas[idx] = updated;
          document.getElementById("tab-content").innerHTML = renderEntregasTable();
        } catch (err) { alert(err.message); btn.disabled = false; btn.textContent = "Confirmar"; }
      }
    });
  }

  async function mount(container) {
    container.innerHTML = `<div class="loading"><div class="spinner"></div>Carregando logistica...</div>`;
    try {
      [rotas, entregas, entregadores, veiculos] = await Promise.all([
        apiFetch("/api/rotas"), apiFetch("/api/entregas"),
        apiFetch("/api/entregadores"), apiFetch("/api/veiculos"),
      ]);
      container.innerHTML = renderPage();
      bindEvents(container);
    } catch (err) {
      container.innerHTML = `<div class="page-header"><h2>Logistica</h2></div><div class="error-msg">${err.message}</div>`;
    }
  }

  function unmount() {}
  return { mount, unmount };
})();
