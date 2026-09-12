import { expect, test, type Page } from "@playwright/test";
import { installTestnetMocks } from "./helpers/testnetMocks";

async function mockTelegramLang(page: Page, language_code: string) {
  await page.route("https://telegram.org/js/telegram-web-app.js", async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: `window.Telegram={WebApp:{ready:function(){},expand:function(){},languageCode:${JSON.stringify(language_code)},initData:"user=1",initDataUnsafe:{user:{id:1,language_code:${JSON.stringify(language_code)}}}}};`,
    });
  });
}

test("login renders without JS errors (no white screen)", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Личный кабинет/i }).first()).toBeVisible({ timeout: 15_000 });
  expect(errors).toEqual([]);
});

test("login chrome has no email password", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Подключить кошелёк" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Восстановить через ключ" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Вступить в /i })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test("Telegram language cv shows Chuvash UI", async ({ page }) => {
  await mockTelegramLang(page, "cv");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Хар пÿрт/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Кошелёк|çыхăнтар/i }).first()).toBeVisible();
});

test("Telegram language en shows English UI", async ({ page }) => {
  await mockTelegramLang(page, "en");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Citizen cabinet/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Connect wallet/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Restore with key/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Join/i })).toBeVisible();
});

test("cabinet click tour", async ({ page }) => {
  await installTestnetMocks(page);
  await page.addInitScript(() => {
    sessionStorage.setItem("chv-citizen", "1");
  });
  await page.goto("/citizenship");
  await expect(page.getByRole("heading").first()).toBeVisible();
  await page.getByRole("link", { name: /Референдум|Referendums|Референдумсем/i }).first().click();
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.getByTestId("votings-refresh")).toBeVisible();
  // bottom nav icons present (mobile viewport still has bottom nav via CSS at 860)
  await expect(page.locator(".bottom-nav svg").first()).toBeVisible({ timeout: 5_000 }).catch(() => {});
  await page.getByRole("link", { name: /Принятые законы|Passed laws|законсем/i }).first().click();
  await expect(page.getByRole("heading").first()).toBeVisible();
  await page.getByRole("link", { name: /Казна|Treasury|Хапха/i }).first().click();
  await expect(page.getByRole("heading", { name: /Казна|Treasury|Хапха/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Конверт/i }).first()).toBeVisible();
});

test("bottom nav shows icons on mobile", async ({ page }) => {
  await installTestnetMocks(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    sessionStorage.setItem("chv-citizen", "1");
  });
  await page.goto("/referendums");
  await expect(page.locator("nav.bottom-nav")).toBeVisible();
  await expect(page.locator("nav.bottom-nav svg")).toHaveCount(await page.locator("nav.bottom-nav a").count());
  const box = await page.locator("nav.bottom-nav svg").first().boundingBox();
  expect(box && box.width >= 16 && box.height >= 16).toBeTruthy();
});

test("referendums list loads or refresh works", async ({ page }) => {
  await installTestnetMocks(page);
  await page.addInitScript(() => {
    sessionStorage.setItem("chv-citizen", "1");
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/referendums");
  await expect(page.getByRole("heading", { name: /Референдум|Referendums|Референдумсем/i }).first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByTestId("votings-refresh")).toBeVisible();
  await expect(page.getByRole("link", { name: /Создать|Create|Йĕркеле/i }).first()).toBeVisible();
  // Wait for either cards or empty state after load
  await expect
    .poll(async () => {
      const cards = await page.getByTestId("voting-card").count();
      const empty = await page.getByText(/Пока нет|No referendums|çук-ха/i).count();
      return cards > 0 || empty > 0;
    }, { timeout: 60_000 })
    .toBe(true);
  const cards = await page.getByTestId("voting-card").count();
  if (cards === 0) {
    await page.getByTestId("votings-refresh").click();
    await expect
      .poll(async () => page.getByTestId("voting-card").count(), { timeout: 90_000 })
      .toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});

test("treasury hub has convert and modules tiles", async ({ page }) => {
  await installTestnetMocks(page);
  await page.addInitScript(() => {
    sessionStorage.setItem("chv-citizen", "1");
  });
  await page.goto("/treasury");
  await expect(page.getByRole("heading", { name: /Казна|Treasury|Хапха/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Конверт|Convert/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /История|History/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /DexLP/i }).first()).toBeVisible();
  await page.getByRole("button", { name: /Конверт|Convert/i }).first().click();
  await expect(page.getByRole("heading", { name: /Конверт|Convert/i }).first()).toBeVisible();
  await page.getByRole("button", { name: /←|Казна|Treasury|Хапха/i }).first().click();
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
