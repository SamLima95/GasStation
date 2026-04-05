// eslint-disable-next-line no-unused-vars
const Estoque = (() => {
  let vasilhames = [];
  let movimentacoes = [];
  let activeTab = "movimentacoes";

  const tipoLabels = {
    ENTRADA: "Entrada",
    SAIDA: "Saida",
    RETORNO: "Retorno",
    AVARIA: "Avaria",
    AJUSTE: "Ajuste",
  };

  const tipoClass = {
    ENTRADA: "info",
    SAIDA: "warning",
    RETORNO: "info",
    AVARIA: "danger",
    AJUSTE: "warning",
  };

  // ── Vasilhames ──

  function renderVasilhamesTable() {
    if (vasilhames.length === 0) {
      return `<div class="empty-state">Nenhum vasilhame cadastrado ainda.</div>`;
    }
    let rows = "";
    for (const v of vasilhames) {
      rows += `
        <tr>
          <td class="td-name">${v.tipo}</td>
          <td>${v.descricao}</td>
          <td>${v.capacidade}</td>
          <td class="td-date">${Utils.formatDate(v.createdAt)}</td>
        </tr>`;
    }
    return `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Tipo</th><th>Descricao</th><th>Capacidade</th><th>Criado em</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function vasilhameOptions() {
    return vasilhames.map((v) => `<option value="${v.id}">${v.tipo} (${v.capacidade}kg)</option>`).join("");
  }

  // ── Movimentacoes ──

  function renderMovimentacoesTable() {
    if (movimentacoes.length === 0) {
      return `<div class="empty-state">Nenhuma movimentacao registrada ainda.</div>`;
    }
    let rows = "";
    for (const m of movimentacoes) {
      const vas = vasilhames.find((v) => v.id === m.vasilhameId);
      const cls = tipoClass[m.tipoMovimentacao] || "";
      rows += `
        <tr>
          <td><span class="badge badge-${cls}">${tipoLabels[m.tipoMovimentacao] || m.tipoMovimentacao}</span></td>
          <td class="td-name">${vas ? vas.tipo : m.vasilhameId.substring(0, 8) + "..."}</td>
          <td>${m.quantidade}</td>
          <td>${m.unidadeId}</td>
          <td class="td-date">${Utils.formatDate(m.dataHora)}</td>
        </tr>`;
    }
    return `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Tipo</th><th>Vasilhame</th><th>Quantidade</th><th>Unidade</th><th>Data/Hora</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  // ── Page ──

  function renderPage() {
    const isMovTab = activeTab === "movimentacoes";
    return `
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <h2>Estoque</h2>
            <p>Vasilhames e movimentacoes de estoque</p>
          </div>
          <button class="btn-primary btn-add" id="btn-new-entry">
            + ${isMovTab ? "Nova Movimentacao" : "Novo Vasilhame"}
          </button>
        </div>
      </div>

      <div class="tabs-bar">
        <button class="tab-btn ${isMovTab ? "active" : ""}" data-tab="movimentacoes">Movimentacoes</button>
        <button class="tab-btn ${!isMovTab ? "active" : ""}" data-tab="vasilhames">Vasilhames</button>
      </div>

      <div id="tab-content">
        ${isMovTab ? renderMovimentacoesTable() : renderVasilhamesTable()}
      </div>

      <!-- Modal Movimentacao -->
      <div class="modal-overlay hidden" id="modal-mov">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Nova Movimentacao</h3>
            <button class="modal-close" id="modal-mov-close">&times;</button>
          </div>
          <form id="form-mov">
            <div class="form-row">
              <div class="form-group form-group-flex">
                <label for="mov-vasilhame">Vasilhame</label>
                <select id="mov-vasilhame" required>
                  <option value="">Selecione</option>
                  ${vasilhameOptions()}
                </select>
              </div>
              <div class="form-group form-group-sm">
                <label for="mov-tipo">Tipo</label>
                <select id="mov-tipo" required>
                  <option value="ENTRADA">Entrada</option>
                  <option value="SAIDA">Saida</option>
                  <option value="RETORNO">Retorno</option>
                  <option value="AVARIA">Avaria</option>
                  <option value="AJUSTE">Ajuste</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-flex">
                <label for="mov-qtd">Quantidade</label>
                <input type="number" id="mov-qtd" min="1" value="1" required>
              </div>
              <div class="form-group form-group-flex">
                <label for="mov-unidade">Unidade ID</label>
                <input type="text" id="mov-unidade" placeholder="unidade-01" required>
              </div>
            </div>
            <div class="form-group">
              <label for="mov-usuario">Usuario ID</label>
              <input type="text" id="mov-usuario" placeholder="ID do usuario" required>
            </div>
            <p id="form-mov-error" class="login-error hidden"></p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="btn-mov-cancel">Cancelar</button>
              <button type="submit" class="btn-primary" id="btn-mov-save">Registrar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Vasilhame -->
      <div class="modal-overlay hidden" id="modal-vas">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Novo Vasilhame</h3>
            <button class="modal-close" id="modal-vas-close">&times;</button>
          </div>
          <form id="form-vas">
            <div class="form-group">
              <label for="vas-tipo">Tipo</label>
              <input type="text" id="vas-tipo" placeholder="P13, P20, P45..." required>
            </div>
            <div class="form-group">
              <label for="vas-descricao">Descricao</label>
              <input type="text" id="vas-descricao" placeholder="Botijao de gas 13kg" required>
            </div>
            <div class="form-group">
              <label for="vas-capacidade">Capacidade (kg)</label>
              <input type="number" id="vas-capacidade" step="0.1" min="0.1" placeholder="13" required>
            </div>
            <p id="form-vas-error" class="login-error hidden"></p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="btn-vas-cancel">Cancelar</button>
              <button type="submit" class="btn-primary" id="btn-vas-save">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // ── API ──

  async function fetchVasilhames() {
    const res = await Api.apiFetch("/api/vasilhames");
    if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || b.message || `Erro ${res.status}`); }
    return res.json();
  }

  async function fetchMovimentacoes() {
    const res = await Api.apiFetch("/api/movimentacoes");
    if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || b.message || `Erro ${res.status}`); }
    return res.json();
  }

  async function createVasilhame(data) {
    const res = await Api.apiFetch("/api/vasilhames", { method: "POST", body: data });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || body.message || `Erro ${res.status}`);
    return body;
  }

  async function createMovimentacao(data) {
    const res = await Api.apiFetch("/api/movimentacoes", { method: "POST", body: data });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || body.message || `Erro ${res.status}`);
    return body;
  }

  // ── Modals ──

  function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
  }

  function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
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

    // New entry button
    document.getElementById("btn-new-entry").addEventListener("click", () => {
      if (activeTab === "movimentacoes") {
        if (vasilhames.length === 0) {
          alert("Cadastre um vasilhame antes de registrar movimentacoes.");
          return;
        }
        openModal("modal-mov");
      } else {
        openModal("modal-vas");
      }
    });

    // ── Movimentacao modal ──
    document.getElementById("modal-mov-close").addEventListener("click", () => closeModal("modal-mov"));
    document.getElementById("btn-mov-cancel").addEventListener("click", () => closeModal("modal-mov"));
    document.getElementById("modal-mov").addEventListener("click", (e) => {
      if (e.target.id === "modal-mov") closeModal("modal-mov");
    });

    document.getElementById("form-mov").addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-mov-error");
      const btn = document.getElementById("btn-mov-save");

      const vasilhameId = document.getElementById("mov-vasilhame").value;
      const tipoMovimentacao = document.getElementById("mov-tipo").value;
      const quantidade = parseInt(document.getElementById("mov-qtd").value, 10);
      const unidadeId = document.getElementById("mov-unidade").value.trim();
      const usuarioId = document.getElementById("mov-usuario").value.trim();

      if (!vasilhameId || !unidadeId || !usuarioId) {
        errEl.textContent = "Preencha todos os campos.";
        errEl.classList.remove("hidden");
        return;
      }

      btn.disabled = true;
      btn.textContent = "Registrando...";
      errEl.classList.add("hidden");

      try {
        const novo = await createMovimentacao({ vasilhameId, tipoMovimentacao, quantidade, unidadeId, usuarioId });
        movimentacoes.unshift(novo);
        document.getElementById("tab-content").innerHTML = renderMovimentacoesTable();
        closeModal("modal-mov");
        document.getElementById("form-mov").reset();
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove("hidden");
      } finally {
        btn.disabled = false;
        btn.textContent = "Registrar";
      }
    });

    // ── Vasilhame modal ──
    document.getElementById("modal-vas-close").addEventListener("click", () => closeModal("modal-vas"));
    document.getElementById("btn-vas-cancel").addEventListener("click", () => closeModal("modal-vas"));
    document.getElementById("modal-vas").addEventListener("click", (e) => {
      if (e.target.id === "modal-vas") closeModal("modal-vas");
    });

    document.getElementById("form-vas").addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("form-vas-error");
      const btn = document.getElementById("btn-vas-save");

      const tipo = document.getElementById("vas-tipo").value.trim();
      const descricao = document.getElementById("vas-descricao").value.trim();
      const capacidade = parseFloat(document.getElementById("vas-capacidade").value);

      if (!tipo || !descricao) {
        errEl.textContent = "Preencha todos os campos.";
        errEl.classList.remove("hidden");
        return;
      }

      btn.disabled = true;
      btn.textContent = "Salvando...";
      errEl.classList.add("hidden");

      try {
        const novo = await createVasilhame({ tipo, descricao, capacidade });
        vasilhames.unshift(novo);
        document.getElementById("tab-content").innerHTML = renderVasilhamesTable();
        closeModal("modal-vas");
        document.getElementById("form-vas").reset();
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove("hidden");
      } finally {
        btn.disabled = false;
        btn.textContent = "Salvar";
      }
    });
  }

  async function mount(container) {
    container.innerHTML = `<div class="loading"><div class="spinner"></div>Carregando estoque...</div>`;
    try {
      [vasilhames, movimentacoes] = await Promise.all([fetchVasilhames(), fetchMovimentacoes()]);
      container.innerHTML = renderPage();
      bindEvents(container);
    } catch (err) {
      container.innerHTML = `
        <div class="page-header"><h2>Estoque</h2></div>
        <div class="error-msg">${err.message}</div>`;
    }
  }

  function unmount() {}

  return { mount, unmount };
})();
