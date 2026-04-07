import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("deve exibir formulario de login", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /gasstation/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });

  test("deve redirecionar para login quando nao autenticado", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login/);
  });

  test("deve exibir botao de conta demo", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("button", { name: /demo/i })).toBeVisible();
  });

  test("deve exibir erro com credenciais invalidas", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("wrong@test.com");
    await page.getByLabel(/senha/i).fill("wrong123");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText(/erro|falha|invalid/i)).toBeVisible({ timeout: 5000 });
  });
});
