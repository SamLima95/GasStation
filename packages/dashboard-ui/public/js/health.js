// eslint-disable-next-line no-unused-vars
const Health = (() => {
  let refreshTimer = null;
  const history = {}; // key -> bool[]

  function renderCards(services) {
    const ok = services.filter((s) => s.status === "ok").length;
    const total = services.length;
    const pct = total > 0 ? Math.round((ok / total) * 100) : 0;

    let html = `
      <div class="page-header">
        <h2>Health Monitor</h2>
        <p>Status em tempo real dos microserviços</p>
      </div>

      <div class="health-summary">
        <div>
          <div class="health-summary-count">${ok}/${total}</div>
          <div class="health-summary-label">serviços saudáveis</div>
        </div>
        <div class="health-bar">
          <div class="health-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>

      <div class="health-grid">`;

    for (const svc of services) {
      const isOk = svc.status === "ok";

      // Track history (last 30 checks)
      if (!history[svc.key]) history[svc.key] = [];
      history[svc.key].push(isOk);
      if (history[svc.key].length > 30) history[svc.key].shift();

      const historyDots = history[svc.key].map((h) =>
        `<span style="display:inline-block;width:6px;height:16px;border-radius:2px;margin-right:2px;background:${h ? "var(--green)" : "var(--red)"}"></span>`
      ).join("");

      html += `
        <div class="health-card ${isOk ? "" : "down"}">
          <div class="status-dot ${svc.status}"></div>
          <div class="health-info">
            <div class="health-name">${svc.name}</div>
            <div class="health-url">${svc.url}</div>
            <div style="margin-top:8px;display:flex;align-items:end;gap:1px">${historyDots}</div>
          </div>
          <div class="health-meta">
            <div class="health-time">${svc.responseTimeMs}<span class="health-time-unit">ms</span></div>
            <div class="health-status-label ${svc.status}">${isOk ? "Online" : "Offline"}</div>
          </div>
        </div>`;
    }

    html += `</div>
      <div class="timestamp">Última verificação: ${Utils.formatDate(new Date().toISOString())} &mdash; atualiza a cada 10s</div>`;

    return html;
  }

  async function refresh(container) {
    try {
      const res = await Api.apiFetch("/api/health-check");
      const data = await res.json();
      container.innerHTML = renderCards(data);
    } catch (err) {
      container.innerHTML = `
        <div class="page-header"><h2>Health Monitor</h2></div>
        <div class="error-msg">${err.message}</div>`;
    }
  }

  function mount(container) {
    container.innerHTML = `<div class="loading"><div class="spinner"></div>Verificando serviços...</div>`;
    refresh(container);
    refreshTimer = setInterval(() => refresh(container), 10000);
  }

  function unmount() {
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  }

  return { mount, unmount };
})();
