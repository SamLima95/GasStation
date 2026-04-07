import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem("lframework_token", "fake-token-for-e2e");
      localStorage.setItem(
        "lframework_user",
        JSON.stringify({ id: "1", name: "Admin", email: "admin@test.com", role: "admin" })
      );
    });
  });

  test("deve navegar entre paginas via sidebar", async ({ page }) => {
    await page.goto("/dashboard");

    // Navigate to Catalogo
    await page.getByRole("link", { name: /catalogo/i }).click();
    await expect(page).toHaveURL(/\/catalog/);

    // Navigate to Clientes
    await page.getByRole("link", { name: /clientes/i }).click();
    await expect(page).toHaveURL(/\/clientes/);

    // Navigate to Pedidos
    await page.getByRole("link", { name: /pedidos/i }).click();
    await expect(page).toHaveURL(/\/pedidos/);
  });

  test("deve exibir breadcrumbs na pagina", async ({ page }) => {
    await page.goto("/catalog");

    await expect(page.getByText("Home")).toBeVisible();
    await expect(page.getByText("Catalogo")).toBeVisible();
  });

  test("deve ter sidebar com todas as rotas", async ({ page }) => {
    await page.goto("/dashboard");

    const links = [
      "Dashboard", "Catalogo", "Clientes", "Pedidos",
      "Financeiro", "Estoque", "Logistica", "Auditoria", "Health",
    ];

    for (const label of links) {
      await expect(page.getByRole("link", { name: new RegExp(label, "i") })).toBeVisible();
    }
  });

  test("deve ter botao de sair na sidebar", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("button", { name: /sair/i })).toBeVisible();
  });

  test("deve redirecionar para login ao clicar em sair", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: /sair/i }).click();

    await expect(page).toHaveURL(/\/login/);
  });
});
