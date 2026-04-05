// eslint-disable-next-line no-unused-vars
const Financeiro = (() => {
  let caixas = [];
  let contas = [];
  let activeTab = "caixas";

  const statusCaixaLabels = { ABERTO: "Aberto", FECHADO: "Fechado" };
  const statusCaixaClass = { ABERTO: "info", FECHADO: "warning" };

  const statusContaLabels = {
    PENDENTE: "Pendente",
    PAGO_PARCIAL: "Parcial",
    PAGO: "Pago",
    VENCIDO: "Vencido",
  };
  const statusContaClass = {
    PENDENTE: "warning",
    PAGO_PARCIAL: "info",
    PAGO: "info",
    VENCIDO: "danger",
  };

  // ── Caixas ──

  function renderCaixasTable() {
    if (caixas.length === 0) {
      return `<div class="empty-state">Nenhum caixa registrado ainda.</div>`;
    }
    let rows = "";
    for (const c of caixas) {
      const cls = statusCaixaClass[c.status] || "";
      rows += `
        <tr>
          <td>${c.unidadeId}</td>
          <td><span class="badge badge-${cls}">${statusCaixaLabels[c.status] || c.status}</span></td>
          <td class="td-price">${Utils.formatCurrency(c.saldoInicial)}</td>
          <td class="${c.saldoFinal != null ? "td-price" : "td-date"}">${c.saldoFinal != null ? Utils.formatCurrency(c.saldoFinal) : "—"}</td>
          <td class="td-date">${Utils.formatDate(c.dataAbertura)}</td>
          <td>
            ${c.status === "ABERTO" ? `<button class="btn-sm btn-confirm" data-id="${c.id}" data-action="close-caixa">Fechar</button>` : ""}
          </td>
        </tr>`;
    }
    return `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Unidade</th><th>Status</th><th>Saldo Inicial</th><th>Saldo Final</th><th>Abertura</th><th>Acoes</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function caixasAbertasOptions() {
    return caixas
      .filter((c) => c.status === "ABERTO")
      .map((c) => `<option value="${c.id}">${c.unidadeId} — ${Utils.formatCurrency(c.saldoInicial)}</option>`)
      .join("");
  }

  // ── Contas a Receber ──

  function renderContasTable() {
    if (contas.length === 0) {
      return `<div class="empty-state">Nenhuma conta a receber registrada ainda.</div>`;
    }
    let rows = "";
    for (const ct of contas) {
      const cls = statusContaClass[ct.status] || "";
      rows += `
        <tr>
          <td>${ct.clienteId.substring(0, 8)}...</td>
          <td><span class="badge badge-${cls}">${statusContaLabels[ct.status] || ct.status}</span></td>
          <td class="td-price">${Utils.formatCurrency(ct.valorOriginal)}</td>
          <td class="td-warning">${Utils.formatCurrency(ct.valorAberto)}</td>
          <td class="td-date">${Utils.formatDate(ct.vencimento)}</td>
          <td>
            ${ct.status !== "PAGO" ? `<button class="btn-sm btn-confirm" data-id="${ct.id}" data-action="pay-conta">Pagar</button>` : ""}
          </td>
        </tr>`;
    }
    return `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Cliente</th><th>Status</th><th>Valor Original</th><th>Valor Aberto</th><th>Vencimento</th><th>Acoes</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  // ── Page ──

  function renderPage() {
    const isCaixaTab = activeTab === "caixas";
    return `
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <h2>Financeiro</h2>
            <p>Controle de caixas e contas a receber</p>
          </div>
          <button class="btn-primary btn-add" id="btn-new-entry">
            + ${isCaixaTab ? "Abrir Caixa" : "Nova Conta"}
          </button>
        </div>
      </div>

      <div class="tabs-bar">
        <button class="tab-btn ${isCaixaTab ? "active" : ""}" data-tab="caixas">Caixas</button>
        <button class="tab-btn ${!isCaixaTab ? "active" : ""}" data-tab="contas">Contas a Receber</button>
      </div>

      <div id="tab-content">
        ${isCaixaTab ? renderCaixasTable() : renderContasTable()}
      </div>

      <!-- Modal Abrir Caixa -->
      <div class="modal-overlay hidden" id="modal-caixa">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Abrir Caixa</h3>
            <button class="modal-close" id="modal-caixa-close">&times;</button>
          </div>
          <form id="form-caixa">
            <div class="form-group">
              <label for="caixa-unidade">Unidade ID</label>
              <input type="text" id="caixa-unidade" placeholder="unidade-01" required>
            </div>
            <div class="form-group">
              <label for="caixa-saldo">Saldo Inicial (R$)</label>
              <input type="number" id="caixa-saldo" step="0.01" min="0" value="0" required>
            </div>
            <p id="form-caixa-error" class="login-error hidden"></p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="btn-caixa-cancel">Cancelar</button>
              <button type="submit" class="btn-primary" id="btn-caixa-save">Abrir</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Nova Conta -->
      <div class="modal-overlay hidden" id="modal-conta">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Nova Conta a Receber</h3>
            <button class="modal-close" id="modal-conta-close">&times;</button>
          </div>
          <form id="form-conta">
            <div class="form-row">
              <div class="form-group form-group-flex">
                <label for="conta-pedido">Pedido ID</label>
                <input type="text" id="conta-pedido" placeholder="ID do pedido" required>
              </div>
              <div class="form-group form-group-flex">
                <label for="conta-cliente">Cliente ID</label>
                <input type="text" id="conta-cliente" placeholder="ID do cliente" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-flex">
                <label for="conta-valor">Valor Original (R$)</label>
                <input type="number" id="conta-valor" step="0.01" min="0.01" placeholder="0,00" required>
              </div>
              <div class="form-group form-group-flex">
                <label for="conta-vencimento">Vencimento</label>
                <input type="datetime-local" id="conta-vencimento" required>
              </div>
            </div>
            <p id="form-conta-error" class="login-error hidden"></p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="btn-conta-cancel">Cancelar</button>
              <button type="submit" class="btn-primary" id="btn-conta-save">Criar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Pagamento -->
      <div class="modal-overlay hidden" id="modal-pay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Registrar Pagamento</h3>
            <button class="modal-close" id="modal-pay-close">&times;</button>
          </div>
          <form id="form-pay">
            <input type="hidden" id="pay-conta-id">
            <div class="form-group">
              <label for="pay-caixa">Caixa</label>
              <select id="pay-caixa" required>
                <option value="">Selecione um caixa aberto</option>
                ${caixasAbertasOptions()}
              </select>
            </div>
            <div class="form-group">
              <label for="pay-valor">Valor do Pagamento (R$)</label>
              <input type="number" id="pay-valor" step="0.01" min="0.01" placeholder="0,00" required>
            </div>
            <p id="form-pay-error" class="login-error hidden"></p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="btn-pay-cancel">Cancelar</button>
              <button type="submit" class="btn-primary" id="btn-pay-save">Pagar</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // ── API ──

  async function fetchCaixas() {
    const res = await Api.apiFetch("/api/caixas");
    if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || b.message || `Erro ${res.status}`); }
    return res.json();
  }

  async function fetchContas() {
    const res = await Api.apiFetch("/api/contas-a-receber");
    if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || b.message || `Erro ${res.status}`); }
    return res.json();
  }

  async function openCaixa(data) {
    const res = await Api.apiFetch("/api/caixas", { method: "POST", body: data });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || body.message || `Erro ${res.status}`);
    return body;
  }

  async function closeCaixa(id) {
    const res = await Api.apiFetch(`/api/caixas/${id}/close`, { method: "PATCH" });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || body.message || `Erro ${res.status}`);
    return body;
  }

  async function createConta(data) {
    const res = await Api.apiFetch("/api/contas-a-receber", { method: "POST", body: data });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || body.message || `Erro ${res.status}`);
    return body;
  }

  async function paymentConta(id, data) {
    const res = await Api.apiFetch(`/api/contas-a-receber/${id}/payment`, { method: "POST", body: data });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || body.message || `Erro ${res.status}`);
    return body;
  }

  // ── Helpers ──

  function closeModal(id) { document.getElementById(id).classList.add("hidden"); }
  function openModal(id) { document.getElementById(id).classList.remove("hidden"); }

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
    document.getElementById("btn-new-entry").addEventListener("click", () => {
      if (activeTab === "caixas") {
        openModal("modal-caixa");
      } else {
        openModal("modal-conta");
      }
    });

    // ── Caixa modal ──
    document.getElementById("modal-caixa-close").addEventListener("click", () => closeModal("modal-caixa"));
    document.getElementById("btn-caixa-cancel").addEventListener("click", () => closeModal("modal-caixa"));
    document.getElementById("modal-caixa").addEventListener("click", (e) => {
      if (e.target.id === "modal-caixa") closeModal("modal-caixa");
    });

    document.getElementById("form-caixa").addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-caixa-error");
      const btn = document.getElementById("btn-caixa-save");
      const unidadeId = document.getElementById("caixa-unidade").value.trim();
      const saldoInicial = parseFloat(document.getElementById("caixa-saldo").value);

      if (!unidadeId) { errEl.textContent = "Informe a unidade."; errEl.classList.remove("hidden"); return; }

      btn.disabled = true; btn.textContent = "Abrindo..."; errEl.classList.add("hidden");
      try {
        const novo = await openCaixa({ unidadeId, saldoInicial });
        caixas.unshift(novo);
        document.getElementById("tab-content").innerHTML = renderCaixasTable();
        closeModal("modal-caixa");
        document.getElementById("form-caixa").reset();
      } catch (err) {
        errEl.textContent = err.message; errEl.classList.remove("hidden");
      } finally {
        btn.disabled = false; btn.textContent = "Abrir";
      }
    });

    // ── Conta modal ──
    document.getElementById("modal-conta-close").addEventListener("click", () => closeModal("modal-conta"));
    document.getElementById("btn-conta-cancel").addEventListener("click", () => closeModal("modal-conta"));
    document.getElementById("modal-conta").addEventListener("click", (e) => {
      if (e.target.id === "modal-conta") closeModal("modal-conta");
    });

    document.getElementById("form-conta").addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-conta-error");
      const btn = document.getElementById("btn-conta-save");
      const pedidoId = document.getElementById("conta-pedido").value.trim();
      const clienteId = document.getElementById("conta-cliente").value.trim();
      const valorOriginal = parseFloat(document.getElementById("conta-valor").value);
      const vencimentoRaw = document.getElementById("conta-vencimento").value;

      if (!pedidoId || !clienteId || !vencimentoRaw) {
        errEl.textContent = "Preencha todos os campos."; errEl.classList.remove("hidden"); return;
      }

      btn.disabled = true; btn.textContent = "Criando..."; errEl.classList.add("hidden");
      try {
        const novo = await createConta({
          pedidoId, clienteId, valorOriginal,
          vencimento: new Date(vencimentoRaw).toISOString(),
        });
        contas.unshift(novo);
        document.getElementById("tab-content").innerHTML = renderContasTable();
        closeModal("modal-conta");
        document.getElementById("form-conta").reset();
      } catch (err) {
        errEl.textContent = err.message; errEl.classList.remove("hidden");
      } finally {
        btn.disabled = false; btn.textContent = "Criar";
      }
    });

    // ── Payment modal ──
    document.getElementById("modal-pay-close").addEventListener("click", () => closeModal("modal-pay"));
    document.getElementById("btn-pay-cancel").addEventListener("click", () => closeModal("modal-pay"));
    document.getElementById("modal-pay").addEventListener("click", (e) => {
      if (e.target.id === "modal-pay") closeModal("modal-pay");
    });

    document.getElementById("form-pay").addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-pay-error");
      const btn = document.getElementById("btn-pay-save");
      const contaId = document.getElementById("pay-conta-id").value;
      const caixaId = document.getElementById("pay-caixa").value;
      const valor = parseFloat(document.getElementById("pay-valor").value);

      if (!caixaId) { errEl.textContent = "Selecione um caixa."; errEl.classList.remove("hidden"); return; }

      btn.disabled = true; btn.textContent = "Pagando..."; errEl.classList.add("hidden");
      try {
        const updated = await paymentConta(contaId, { valor, caixaId });
        const idx = contas.findIndex((ct) => ct.id === contaId);
        if (idx >= 0) contas[idx] = updated;
        document.getElementById("tab-content").innerHTML = renderContasTable();
        closeModal("modal-pay");
        document.getElementById("form-pay").reset();
      } catch (err) {
        errEl.textContent = err.message; errEl.classList.remove("hidden");
      } finally {
        btn.disabled = false; btn.textContent = "Pagar";
      }
    });

    // ── Table actions (delegated) ──
    document.getElementById("tab-content").addEventListener("click", async (e) => {
      const btn = e.target;
      if (!btn.classList.contains("btn-confirm")) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === "close-caixa") {
        btn.disabled = true; btn.textContent = "Fechando...";
        try {
          const updated = await closeCaixa(id);
          const idx = caixas.findIndex((c) => c.id === id);
          if (idx >= 0) caixas[idx] = updated;
          document.getElementById("tab-content").innerHTML = renderCaixasTable();
        } catch (err) {
          alert(err.message);
          btn.disabled = false; btn.textContent = "Fechar";
        }
      } else if (action === "pay-conta") {
        const openCaixas = caixas.filter((c) => c.status === "ABERTO");
        if (openCaixas.length === 0) {
          alert("Abra um caixa antes de registrar pagamentos.");
          return;
        }
        document.getElementById("pay-conta-id").value = id;
        const conta = contas.find((ct) => ct.id === id);
        if (conta) document.getElementById("pay-valor").value = conta.valorAberto;
        openModal("modal-pay");
      }
    });
  }

  async function mount(container) {
    container.innerHTML = `<div class="loading"><div class="spinner"></div>Carregando financeiro...</div>`;
    try {
      [caixas, contas] = await Promise.all([fetchCaixas(), fetchContas()]);
      container.innerHTML = renderPage();
      bindEvents(container);
    } catch (err) {
      container.innerHTML = `
        <div class="page-header"><h2>Financeiro</h2></div>
        <div class="error-msg">${err.message}</div>`;
    }
  }

  function unmount() {}

  return { mount, unmount };
})();
