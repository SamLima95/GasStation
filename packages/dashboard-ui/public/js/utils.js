/* global Intl */
// eslint-disable-next-line no-unused-vars
const Utils = (() => {
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const num = new Intl.NumberFormat("pt-BR");
  const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return {
    formatCurrency: (v) => brl.format(v ?? 0),
    formatNumber: (v) => num.format(v ?? 0),
    formatDate: (iso) => iso ? dateFmt.format(new Date(iso)) : "—",
    el(tag, attrs, children) {
      const e = document.createElement(tag);
      if (attrs) Object.entries(attrs).forEach(([k, v]) => {
        if (k === "className") e.className = v;
        else if (k === "textContent") e.textContent = v;
        else if (k === "innerHTML") e.innerHTML = v;
        else e.setAttribute(k, v);
      });
      if (children) {
        if (typeof children === "string") e.innerHTML = children;
        else if (Array.isArray(children)) children.forEach((c) => c && e.appendChild(c));
        else e.appendChild(children);
      }
      return e;
    },
  };
})();
