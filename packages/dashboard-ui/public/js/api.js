// eslint-disable-next-line no-unused-vars
const Api = (() => {
  const TOKEN_KEY = "lframework_token";
  const USER_KEY = "lframework_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  }

  function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = { ...options.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }
    const res = await fetch(path, { ...options, headers });
    if (res.status === 401) {
      clearToken();
      // eslint-disable-next-line no-undef
      if (typeof App !== "undefined" && App.showLogin) App.showLogin();
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    return res;
  }

  async function login(email, password) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || "Falha no login");
    setToken(data.accessToken);
    if (data.user) setUser(data.user);
    return data;
  }

  return { getToken, setToken, clearToken, getUser, setUser, apiFetch, login };
})();
