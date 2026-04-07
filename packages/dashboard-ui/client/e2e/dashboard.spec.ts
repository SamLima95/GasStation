import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Simular autenticacao via localStorage
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem("lframework_token", "fake-token-for-e2e");
      localStorage.setItem(
        "lframework_user",
        JSON.stringify({ id: "1", name: "Admin", email: "admin@test.com", role: "admin" })
      );
    });
    await page.goto("/dashboard");
  });

  test("deve renderizar pagina de dashboard", async ({ page }) => {
    await expect(page.getByText(/dashboard/i).first()).toBeVisible();
  });

  test("deve exibir filtros", async ({ page }) => {
    await expect(page.getByText(/aplicar|filtro/i).first()).toBeVisible();
  });

  test("deve ter botoes de exportacao", async ({ page }) => {
    await expect(page.getByRole("button", { name: /csv/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /pdf/i })).toBeVisible();
  });
});
