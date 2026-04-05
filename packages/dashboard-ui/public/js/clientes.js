// eslint-disable-next-line no-unused-vars
const Clientes = (() => {
  let clientes = [];

  function statusCredito(c) {
    const pct = c.limiteCredito > 0 ? (c.saldoDevedor / c.limiteCredito) * 100 : 0;
    if (pct >= 90) return "danger";
    if (pct >= 60) return "warning";
    return "info";
  }

  function renderTable() {
    if (clientes.length === 0) {
      return `<div class="empty-state">Nenhum cliente cadastrado ainda.</div>`;
    }

    let rows = "";
    for (const c of clientes) {
      const cls = statusCredito(c);
      rows += `
        <tr>
          <td class="td-name">${c.nome}</td>
          <td>${c.documento}</td>
          <td class="td-price">${Utils.formatCurrency(c.limiteCredito)}</td>
          <td class="td-${cls}">${Utils.formatCurrency(c.saldoDevedor)}</td>
          <td>${c.unidadeId}</td>
          <td class="td-date">${Utils.formatDate(c.createdAt)}</td>
        </tr>`;
    }

    return `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Documento</th>
              <th>Limite de Credito</th>
              <th>Saldo Devedor</th>
              <th>Unidade</th>
              <th>Criado em</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function renderPage() {
    return `
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <h2>Clientes</h2>
            <p>Gerencie os clientes cadastrados</p>
          </div>
          <button class="btn-primary btn-add" id="btn-new-cliente">+ Novo Cliente</button>
        </div>
      </div>

      <div id="clientes-table">${renderTable()}</div>

      <!-- Modal -->
      <div class="modal-overlay hidden" id="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Novo Cliente</h3>
            <button class="modal-close" id="modal-close">&times;</button>
          </div>
          <form id="form-new-cliente">
            <div class="form-group">
              <label for="cliente-nome">Nome</label>
              <input type="text" id="cliente-nome" placeholder="Nome do cliente" required>
            </div>
            <div class="form-group">
              <label for="cliente-documento">Documento (CPF/CNPJ)</label>
              <input type="text" id="cliente-documento" placeholder="000.000.000-00" required>
            </div>
            <div class="form-row">
              <div class="form-group form-group-flex">
                <label for="cliente-limite">Limite de Credito (R$)</label>
                <input type="number" id="cliente-limite" placeholder="0,00" step="0.01" min="0" required>
              </div>
              <div class="form-group form-group-flex">
                <label for="cliente-unidade">Unidade ID</label>
                <input type="text" id="cliente-unidade" placeholder="unidade-01" required>
              </div>
            </div>
            <p id="form-error" class="login-error hidden"></p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-primary" id="btn-save">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function openModal() {
    document.getElementById("modal-overlay").classList.remove("hidden");
  }

  function closeModal() {
    document.getElementById("modal-overlay").classList.add("hidden");
    document.getElementById("form-new-cliente").reset();
    document.getElementById("form-error").classList.add("hidden");
  }

  async function fetchClientes() {
    const res = await Api.apiFetch("/api/clientes");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || `Erro ${res.status}`);
    }
    return res.json();
  }

  async function createCliente(data) {
    const res = await Api.apiFetch("/api/clientes", {
      method: "POST",
      body: data,
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || body.message || `Erro ${res.status}`);
    return body;
  }

  function bindEvents() {
    document.getElementById("btn-new-cliente").addEventListener("click", openModal);
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("btn-cancel").addEventListener("click", closeModal);

    document.getElementById("modal-overlay").addEventListener("click", (e) => {
      if (e.target.id === "modal-overlay") closeModal();
    });

    document.getElementById("form-new-cliente").addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-error");
      const btnSave = document.getElementById("btn-save");

      const nome = document.getElementById("cliente-nome").value.trim();
      const documento = document.getElementById("cliente-documento").value.trim();
      const limiteCredito = parseFloat(document.getElementById("cliente-limite").value);
      const unidadeId = document.getElementById("cliente-unidade").value.trim();

      if (!nome || !documento || !unidadeId) {
        errEl.textContent = "Preencha todos os campos obrigatorios.";
        errEl.classList.remove("hidden");
        return;
      }

      if (isNaN(limiteCredito) || limiteCredito < 0) {
        errEl.textContent = "Limite de credito invalido.";
        errEl.classList.remove("hidden");
        return;
      }

      btnSave.disabled = true;
      btnSave.textContent = "Salvando...";
      errEl.classList.add("hidden");

      try {
        const newCliente = await createCliente({ nome, documento, limiteCredito, unidadeId });
        clientes.unshift(newCliente);
        document.getElementById("clientes-table").innerHTML = renderTable();
        closeModal();
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove("hidden");
      } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Salvar";
      }
    });
  }

  async function mount(container) {
    container.innerHTML = `<div class="loading"><div class="spinner"></div>Carregando clientes...</div>`;
    try {
      clientes = await fetchClientes();
      container.innerHTML = renderPage();
      bindEvents();
    } catch (err) {
      container.innerHTML = `
        <div class="page-header"><h2>Clientes</h2></div>
        <div class="error-msg">${err.message}</div>`;
    }
  }

  function unmount() {}

  return { mount, unmount };
})();
