// eslint-disable-next-line no-unused-vars
const Pedidos = (() => {
  let pedidos = [];
  let clientesList = [];
  let itemCount = 1;

  const statusLabels = {
    PENDENTE: "Pendente",
    CONFIRMADO: "Confirmado",
    ENTREGUE: "Entregue",
    CANCELADO: "Cancelado",
  };

  const statusClass = {
    PENDENTE: "warning",
    CONFIRMADO: "info",
    ENTREGUE: "info",
    CANCELADO: "danger",
  };

  const pagamentoLabels = {
    A_VISTA: "A Vista",
    FIADO: "Fiado",
    CARTAO: "Cartao",
    PIX: "PIX",
  };

  function renderTable() {
    if (pedidos.length === 0) {
      return `<div class="empty-state">Nenhum pedido cadastrado ainda.</div>`;
    }

    let rows = "";
    for (const p of pedidos) {
      const cliente = clientesList.find((c) => c.id === p.clienteId);
      const cls = statusClass[p.status] || "";
      rows += `
        <tr>
          <td class="td-name">${cliente ? cliente.nome : p.clienteId.substring(0, 8) + "..."}</td>
          <td><span class="badge badge-${cls}">${statusLabels[p.status] || p.status}</span></td>
          <td>${pagamentoLabels[p.tipoPagamento] || p.tipoPagamento}</td>
          <td class="td-price">${Utils.formatCurrency(p.valorTotal)}</td>
          <td class="td-date">${Utils.formatDate(p.dataPedido)}</td>
          <td>
            ${p.status === "PENDENTE" ? `<button class="btn-sm btn-confirm" data-id="${p.id}">Confirmar</button>` : ""}
          </td>
        </tr>`;
    }

    return `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Valor Total</th>
              <th>Data</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function clienteOptions() {
    return clientesList.map((c) => `<option value="${c.id}">${c.nome} (${c.documento})</option>`).join("");
  }

  function itemRow(index) {
    return `
      <div class="item-row" data-index="${index}">
        <div class="form-group form-group-flex">
          <label>Produto ID</label>
          <input type="text" class="item-vasilhame" placeholder="ID do vasilhame" required>
        </div>
        <div class="form-group form-group-sm">
          <label>Qtd</label>
          <input type="number" class="item-qtd" placeholder="1" min="1" value="1" required>
        </div>
        <div class="form-group form-group-sm">
          <label>Preco Unit. (R$)</label>
          <input type="number" class="item-preco" placeholder="0,00" step="0.01" min="0.01" required>
        </div>
        ${index > 0 ? `<button type="button" class="btn-remove-item" data-index="${index}">&times;</button>` : ""}
      </div>`;
  }

  function renderPage() {
    return `
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <h2>Pedidos</h2>
            <p>Gerencie os pedidos do sistema</p>
          </div>
          <button class="btn-primary btn-add" id="btn-new-pedido">+ Novo Pedido</button>
        </div>
      </div>

      <div id="pedidos-table">${renderTable()}</div>

      <!-- Modal -->
      <div class="modal-overlay hidden" id="modal-overlay">
        <div class="modal-card modal-lg">
          <div class="modal-header">
            <h3>Novo Pedido</h3>
            <button class="modal-close" id="modal-close">&times;</button>
          </div>
          <form id="form-new-pedido">
            <div class="form-row">
              <div class="form-group form-group-flex">
                <label for="pedido-cliente">Cliente</label>
                <select id="pedido-cliente" required>
                  <option value="">Selecione um cliente</option>
                  ${clienteOptions()}
                </select>
              </div>
              <div class="form-group form-group-sm">
                <label for="pedido-pagamento">Pagamento</label>
                <select id="pedido-pagamento" required>
                  <option value="A_VISTA">A Vista</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO">Cartao</option>
                  <option value="FIADO">Fiado</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-flex">
                <label for="pedido-unidade">Unidade ID</label>
                <input type="text" id="pedido-unidade" placeholder="unidade-01" required>
              </div>
              <div class="form-group form-group-flex">
                <label for="pedido-entrega">Data de Entrega (opcional)</label>
                <input type="datetime-local" id="pedido-entrega">
              </div>
            </div>

            <div class="items-section">
              <div class="items-header">
                <span class="items-title">Itens do Pedido</span>
                <button type="button" class="btn-sm btn-add-item" id="btn-add-item">+ Item</button>
              </div>
              <div id="items-list">${itemRow(0)}</div>
            </div>

            <p id="form-error" class="login-error hidden"></p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-primary" id="btn-save">Criar Pedido</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function openModal() {
    itemCount = 1;
    document.getElementById("modal-overlay").classList.remove("hidden");
  }

  function closeModal() {
    document.getElementById("modal-overlay").classList.add("hidden");
    document.getElementById("form-new-pedido").reset();
    document.getElementById("items-list").innerHTML = itemRow(0);
    document.getElementById("form-error").classList.add("hidden");
    itemCount = 1;
  }

  async function fetchPedidos() {
    const res = await Api.apiFetch("/api/pedidos");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || `Erro ${res.status}`);
    }
    return res.json();
  }

  async function fetchClientes() {
    const res = await Api.apiFetch("/api/clientes");
    if (!res.ok) return [];
    return res.json();
  }

  async function createPedido(data) {
    const res = await Api.apiFetch("/api/pedidos", {
      method: "POST",
      body: data,
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || body.message || `Erro ${res.status}`);
    return body;
  }

  async function confirmPedido(id) {
    const res = await Api.apiFetch(`/api/pedidos/${id}/confirm`, {
      method: "PATCH",
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || body.message || `Erro ${res.status}`);
    return body;
  }

  function collectItens() {
    const rows = document.querySelectorAll(".item-row");
    const itens = [];
    for (const row of rows) {
      const vasilhameId = row.querySelector(".item-vasilhame").value.trim();
      const quantidade = parseInt(row.querySelector(".item-qtd").value, 10);
      const precoUnitario = parseFloat(row.querySelector(".item-preco").value);
      if (!vasilhameId || isNaN(quantidade) || isNaN(precoUnitario)) return null;
      itens.push({ vasilhameId, quantidade, precoUnitario });
    }
    return itens;
  }

  function bindEvents(container) {
    document.getElementById("btn-new-pedido").addEventListener("click", openModal);
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("btn-cancel").addEventListener("click", closeModal);

    document.getElementById("modal-overlay").addEventListener("click", (e) => {
      if (e.target.id === "modal-overlay") closeModal();
    });

    // Add item row
    document.getElementById("btn-add-item").addEventListener("click", () => {
      const list = document.getElementById("items-list");
      list.insertAdjacentHTML("beforeend", itemRow(itemCount++));
    });

    // Remove item row (delegated)
    document.getElementById("items-list").addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-remove-item")) {
        e.target.closest(".item-row").remove();
      }
    });

    // Confirm button (delegated)
    document.getElementById("pedidos-table").addEventListener("click", async (e) => {
      if (!e.target.classList.contains("btn-confirm")) return;
      const id = e.target.dataset.id;
      e.target.disabled = true;
      e.target.textContent = "Confirmando...";
      try {
        const updated = await confirmPedido(id);
        const idx = pedidos.findIndex((p) => p.id === id);
        if (idx >= 0) pedidos[idx] = updated;
        document.getElementById("pedidos-table").innerHTML = renderTable();
      } catch (err) {
        alert(err.message);
        e.target.disabled = false;
        e.target.textContent = "Confirmar";
      }
    });

    // Form submit
    document.getElementById("form-new-pedido").addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-error");
      const btnSave = document.getElementById("btn-save");

      const clienteId = document.getElementById("pedido-cliente").value;
      const tipoPagamento = document.getElementById("pedido-pagamento").value;
      const unidadeId = document.getElementById("pedido-unidade").value.trim();
      const dataEntregaRaw = document.getElementById("pedido-entrega").value;
      const itens = collectItens();

      if (!clienteId) {
        errEl.textContent = "Selecione um cliente.";
        errEl.classList.remove("hidden");
        return;
      }
      if (!unidadeId) {
        errEl.textContent = "Informe a unidade.";
        errEl.classList.remove("hidden");
        return;
      }
      if (!itens || itens.length === 0) {
        errEl.textContent = "Adicione ao menos um item valido.";
        errEl.classList.remove("hidden");
        return;
      }

      const payload = {
        clienteId,
        unidadeId,
        tipoPagamento,
        itens,
        dataEntregaPrevista: dataEntregaRaw ? new Date(dataEntregaRaw).toISOString() : null,
      };

      btnSave.disabled = true;
      btnSave.textContent = "Criando...";
      errEl.classList.add("hidden");

      try {
        const newPedido = await createPedido(payload);
        pedidos.unshift(newPedido);
        document.getElementById("pedidos-table").innerHTML = renderTable();
        closeModal();
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove("hidden");
      } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Criar Pedido";
      }
    });
  }

  async function mount(container) {
    container.innerHTML = `<div class="loading"><div class="spinner"></div>Carregando pedidos...</div>`;
    try {
      [pedidos, clientesList] = await Promise.all([fetchPedidos(), fetchClientes()]);
      container.innerHTML = renderPage();
      bindEvents(container);
    } catch (err) {
      container.innerHTML = `
        <div class="page-header"><h2>Pedidos</h2></div>
        <div class="error-msg">${err.message}</div>`;
    }
  }

  function unmount() {}

  return { mount, unmount };
})();
