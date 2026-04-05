// eslint-disable-next-line no-unused-vars
const Login = (() => {
  function init() {
    const form = document.getElementById("login-form");

    // Pre-fill email from last logged-in user
    const lastUser = Api.getUser();
    if (lastUser?.email) {
      document.getElementById("login-email").value = lastUser.email;
    }

    const demoBtn = document.getElementById("demo-btn");
    const DEMO_EMAIL = "admin@gasstation.com";
    const DEMO_PASS = "Admin123!";
    const DEMO_NAME = "Admin Demo";

    demoBtn.addEventListener("click", async () => {
      const errorEl = document.getElementById("login-error");
      errorEl.classList.add("hidden");
      demoBtn.disabled = true;
      demoBtn.textContent = "Entrando...";
      try {
        // Tenta login primeiro; se falhar, registra e faz login
        try {
          await Api.login(DEMO_EMAIL, DEMO_PASS);
        } catch {
          await Api.register(DEMO_NAME, DEMO_EMAIL, DEMO_PASS);
        }
        App.hideLogin();
        App.navigate(location.hash || "#/dashboard");
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("hidden");
      } finally {
        demoBtn.disabled = false;
        demoBtn.textContent = "Entrar com conta demo";
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      const errorEl = document.getElementById("login-error");
      const btn = document.getElementById("login-btn");

      errorEl.classList.add("hidden");
      btn.disabled = true;
      btn.textContent = "Entrando...";

      try {
        await Api.login(email, password);
        App.hideLogin();
        App.navigate(location.hash || "#/dashboard");
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("hidden");
      } finally {
        btn.disabled = false;
        btn.textContent = "Entrar";
      }
    });
  }

  return { init };
})();
