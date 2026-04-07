import { test, expect } from "@playwright/test";

test.describe("Pedidos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem("lframework_token", "fake-token-for-e2e");
      localStorage.setItem(
        "lframework_user",
        JSON.stringify({ id: "1", name: "Admin", email: "admin@test.com", role: "admin" })
      );
    });
    await page.goto("/pedidos");
  });

  test("deve renderizar pagina de pedidos", async ({ page }) => {
    await expect(page.getByText(/pedidos/i).first()).toBeVisible();
  });

  test("deve ter botao de novo pedido", async ({ page }) => {
    await expect(page.getByRole("button", { name: /novo pedido/i })).toBeVisible();
  });

  test("deve abrir modal ao clicar em novo pedido", async ({ page }) => {
    await page.getByRole("button", { name: /novo pedido/i }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
