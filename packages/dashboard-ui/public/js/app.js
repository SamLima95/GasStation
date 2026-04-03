// eslint-disable-next-line no-unused-vars
const App = (() => {
  const content = () => document.getElementById("content");
  const overlay = () => document.getElementById("login-overlay");
  const appEl = () => document.getElementById("app");

  let currentPage = null;

  const pages = {
    dashboard: Dashboard,
    health: Health,
  };

  function showLogin() {
    overlay().classList.remove("hidden");
    appEl().classList.add("hidden");
  }

  function hideLogin() {
    overlay().classList.add("hidden");
    appEl().classList.remove("hidden");
    updateUserInfo();
  }

  function updateUserInfo() {
    const user = Api.getUser();
    const el = document.getElementById("sidebar-user");
    if (user) {
      const initials = (user.name || user.email || "?").split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
      el.innerHTML = `
        <div class="sidebar-user-avatar">${initials}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${user.name || "Usuário"}</div>
          <div class="sidebar-user-email">${user.email || ""}</div>
        </div>`;
    } else {
      el.innerHTML = "";
    }
  }

  function navigate(hash) {
    // Unmount current page
    if (currentPage && pages[currentPage]?.unmount) {
      pages[currentPage].unmount();
    }

    const page = (hash || "#/dashboard").replace("#/", "") || "dashboard";
    currentPage = page;

    // Update sidebar active state
    document.querySelectorAll(".nav-item[data-page]").forEach((el) => {
      el.classList.toggle("active", el.dataset.page === page);
    });

    // Mount new page
    const c = content();
    if (pages[page]) {
      pages[page].mount(c);
    } else {
      c.innerHTML = `<div class="error-msg">Página não encontrada</div>`;
    }
  }

  function init() {
    Login.init();

    // Check auth
    if (!Api.getToken()) {
      showLogin();
    } else {
      hideLogin();
    }

    // Logout
    document.getElementById("logout-btn").addEventListener("click", () => {
      Api.clearToken();
      showLogin();
    });

    // Hash routing
    window.addEventListener("hashchange", () => {
      if (Api.getToken()) navigate(location.hash);
    });

    // Initial route
    if (Api.getToken()) {
      navigate(location.hash || "#/dashboard");
    }
  }

  // Boot
  document.addEventListener("DOMContentLoaded", init);

  return { showLogin, hideLogin, navigate };
})();
