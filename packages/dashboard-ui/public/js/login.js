// eslint-disable-next-line no-unused-vars
const Login = (() => {
  function init() {
    const form = document.getElementById("login-form");

    // Pre-fill email from last logged-in user
    const lastUser = Api.getUser();
    if (lastUser?.email) {
      document.getElementById("login-email").value = lastUser.email;
    }

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
