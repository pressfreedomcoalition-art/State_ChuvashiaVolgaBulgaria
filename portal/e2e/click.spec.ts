import { expect, test } from "@playwright/test";

test("login renders without JS errors (no white screen)", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByText(/Хар пÿрт|Личный кабинет/i)).toBeVisible({ timeout: 15_000 });
  expect(errors).toEqual([]);
});

test("login chrome has no email password", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /кошелёк|Connect|хар/i })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test("cabinet click tour", async ({ page }) => {
  await page.goto("/citizenship");
  await expect(page.getByRole("heading").first()).toBeVisible();
  await page.getByRole("link", { name: /Референдум|Referendums|Референдумсем/i }).first().click();
  await expect(page.getByRole("heading").first()).toBeVisible();
  await page.getByRole("link", { name: /Совет|Council|Канаш/i }).first().click();
  await expect(page.getByRole("heading").first()).toBeVisible();
  await page.getByRole("link", { name: /Казна|Treasury|Хапха/i }).first().click();
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.getByText(/Выплат|payouts|Уксана/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Вывести|Withdraw/i })).toHaveCount(0);
});

test("sandbox civic public", async ({ page }) => {
  await page.route("**/civic/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/v1/public")) {
      await route.fulfill({ json: { ok: true, name: "sandbox" } });
      return;
    }
    if (url.includes("/citizenship/count")) {
      await route.fulfill({ json: { ok: true, count: 1 } });
      return;
    }
    await route.fulfill({ status: 404, json: { ok: false, error: "miss" } });
  });
  await page.goto("/sandbox");
  await expect(page.getByTestId("sandbox-public")).toContainText("ok", { timeout: 15_000 });
  await expect(page.getByTestId("sandbox-count")).toContainText("1");
});

test("no petitions nav", async ({ page }) => {
  await page.goto("/citizenship");
  await expect(page.getByRole("link", { name: /Петици/i })).toHaveCount(0);
});
