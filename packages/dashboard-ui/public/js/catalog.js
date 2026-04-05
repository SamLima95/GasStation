// eslint-disable-next-line no-unused-vars
const Catalog = (() => {
  let items = [];

  function renderTable() {
    if (items.length === 0) {
      return `<div class="empty-state">Nenhum item cadastrado ainda.</div>`;
    }

    let rows = "";
    for (const item of items) {
      rows += `
        <tr>
          <td class="td-name">${item.name}</td>
          <td class="td-price">${Utils.formatCurrency(item.priceAmount / 100)}</td>
          <td class="td-currency">${item.priceCurrency}</td>
          <td class="td-date">${Utils.formatDate(item.createdAt)}</td>
        </tr>`;
    }

    return `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preco</th>
              <th>Moeda</th>
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
            <h2>Catalogo de Produtos</h2>
            <p>Gerencie os itens do catalogo</p>
          </div>
          <button class="btn-primary btn-add" id="btn-new-item">+ Novo Item</button>
        </div>
      </div>

      <div id="catalog-table">${renderTable()}</div>

      <!-- Modal -->
      <div class="modal-overlay hidden" id="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Novo Item</h3>
            <button class="modal-close" id="modal-close">&times;</button>
          </div>
          <form id="form-new-item">
            <div class="form-group">
              <label for="item-name">Nome</label>
              <input type="text" id="item-name" placeholder="Nome do produto" required>
            </div>
            <div class="form-row">
              <div class="form-group form-group-flex">
                <label for="item-price">Preco (R$)</label>
                <input type="number" id="item-price" placeholder="0,00" step="0.01" min="0" required>
              </div>
              <div class="form-group form-group-sm">
                <label for="item-currency">Moeda</label>
                <select id="item-currency">
                  <option value="BRL" selected>BRL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
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
    document.getElementById("form-new-item").reset();
    document.getElementById("form-error").classList.add("hidden");
  }

  async function fetchItems() {
    const res = await Api.apiFetch("/api/catalog");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || `Erro ${res.status}`);
    }
    return res.json();
  }

  async function createItem(data) {
    const res = await Api.apiFetch("/api/catalog", {
      method: "POST",
      body: data,
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || body.message || `Erro ${res.status}`);
    return body;
  }

  function bindEvents(container) {
    document.getElementById("btn-new-item").addEventListener("click", openModal);
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("btn-cancel").addEventListener("click", closeModal);

    // Close modal on overlay click
    document.getElementById("modal-overlay").addEventListener("click", (e) => {
      if (e.target.id === "modal-overlay") closeModal();
    });

    // Form submit
    document.getElementById("form-new-item").addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-error");
      const btnSave = document.getElementById("btn-save");

      const name = document.getElementById("item-name").value.trim();
      const priceStr = document.getElementById("item-price").value;
      const currency = document.getElementById("item-currency").value;

      if (!name) {
        errEl.textContent = "Nome e obrigatorio.";
        errEl.classList.remove("hidden");
        return;
      }

      const priceAmount = Math.round(parseFloat(priceStr) * 100);
      if (isNaN(priceAmount) || priceAmount < 0) {
        errEl.textContent = "Preco invalido.";
        errEl.classList.remove("hidden");
        return;
      }

      btnSave.disabled = true;
      btnSave.textContent = "Salvando...";
      errEl.classList.add("hidden");

      try {
        const newItem = await createItem({ name, priceAmount, priceCurrency: currency });
        items.unshift(newItem);
        document.getElementById("catalog-table").innerHTML = renderTable();
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
    container.innerHTML = `<div class="loading"><div class="spinner"></div>Carregando catalogo...</div>`;
    try {
      items = await fetchItems();
      container.innerHTML = renderPage();
      bindEvents(container);
    } catch (err) {
      container.innerHTML = `
        <div class="page-header"><h2>Catalogo de Produtos</h2></div>
        <div class="error-msg">${err.message}</div>`;
    }
  }

  function unmount() {}

  return { mount, unmount };
})();
