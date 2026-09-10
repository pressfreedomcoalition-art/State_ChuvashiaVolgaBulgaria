/**
 * Click flows with civic/cache mocks (no mainnet chain = “testnet” substitute).
 *
 * Inventory covered:
 * A. Citizenship — pay / docs / lang / wallet path UIs + claim actions (pay/docs/wallet)
 * B. Voting — list → detail → cast / finalize; create → auto-launch
 * C. Deputy — council list + become candidate → on-chain profile publish
 */
import { expect, test } from "@playwright/test";
import { enableE2eSession, E2E_OPT_NO, E2E_OPT_YES, E2E_VOTING, installTestnetMocks } from "./helpers/testnetMocks";

test.describe("citizenship flows (testnet mocks)", () => {
  test.beforeEach(async ({ page }) => {
    await installTestnetMocks(page);
    await enableE2eSession(page, { citizen: false, wallet: true, vault: true, presentation: true });
  });

  test("all citizenship paths are clickable", async ({ page }) => {
    await page.goto("/citizenship");
    await expect(page.getByTestId("cit-path-pay")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("cit-path-docs")).toBeVisible();
    await expect(page.getByTestId("cit-path-lang")).toBeVisible();
    await expect(page.getByTestId("cit-path-wallet")).toBeVisible();

    await page.getByTestId("cit-path-pay").click();
    await expect(page.getByTestId("cit-pay-submit")).toBeVisible();
    await page.getByRole("button", { name: /Назад|Back|Каялла/i }).click();

    await page.getByTestId("cit-path-docs").click();
    await expect(page.getByTestId("cit-docs-submit")).toBeVisible();
    await page.getByRole("button", { name: /Назад|Back|Каялла/i }).click();

    await page.getByTestId("cit-path-lang").click();
    await expect(page.getByText(/Путь поручителей|endorser path|Поручитель çулĕ/i)).toBeVisible();
    await page.getByRole("button", { name: /Назад|Back|Каялла/i }).click();

    await page.getByTestId("cit-path-wallet").click();
    await expect(page.getByTestId("cit-wallet-submit")).toBeVisible();
  });

  test("claim citizenship via pay path", async ({ page }) => {
    await page.goto("/citizenship");
    await page.getByTestId("cit-path-pay").click({ timeout: 20_000 });
    await page.getByTestId("cit-pay-submit").click();
    await expect(page).toHaveURL(/referendums/, { timeout: 20_000 });
  });

  test("claim citizenship via wallet/NFT path", async ({ page }) => {
    await page.goto("/citizenship");
    await page.getByTestId("cit-path-wallet").click({ timeout: 20_000 });
    await page.getByTestId("cit-wallet-submit").click();
    await expect(page).toHaveURL(/referendums/, { timeout: 20_000 });
  });

  test("claim citizenship via docs path", async ({ page }) => {
    await page.goto("/citizenship");
    await page.getByTestId("cit-path-docs").click({ timeout: 20_000 });
    // No PII form — Sumsub collects identity; mock claim-docs grants citizen immediately.
    await expect(page.getByTestId("cit-docs-submit")).toBeVisible();
    await page.getByTestId("cit-docs-submit").click();
    await expect(page).toHaveURL(/referendums/, { timeout: 20_000 });
  });
});

test.describe("voting flows (testnet mocks)", () => {
  test.beforeEach(async ({ page }) => {
    await installTestnetMocks(page);
    await enableE2eSession(page, { citizen: true, wallet: true, vault: true, presentation: true });
  });

  test("list shows mock voting and opens detail", async ({ page }) => {
    await page.goto("/referendums");
    await expect(page.getByTestId("voting-card").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("voting-card")).toHaveCount(2);
    await page.getByTestId("voting-card").filter({ hasText: "E2E референдум" }).getByRole("link").first().click();
    await expect(page).toHaveURL(new RegExp(E2E_VOTING));
    await expect(page.getByTestId("vote-option").first()).toBeVisible();
  });

  test("cast civic vote", async ({ page }) => {
    await page.goto(`/referendums/${encodeURIComponent(E2E_VOTING)}`);
    await expect(page.getByTestId("vote-option").first()).toBeVisible({ timeout: 20_000 });
    await page.getByTestId("vote-option").first().click();
    await expect(page.getByText(/голос учтён|vote is counted|Сас шутланнă/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("vote-bars")).toBeVisible();
  });

  test("finalize voting when awaiting finalize", async ({ page }) => {
    await page.route(/\/(cache|civic)\//, async (route) => {
      const url = new URL(route.request().url());
      const key = url.searchParams.get("key") || "";
      if (key.startsWith("votingState:") || key.startsWith("votingMeta:")) {
        await route.fulfill({
          json: {
            ok: true,
            at: Date.now(),
            value: {
              status: "active",
              awaitingFinalize: true,
              title: "E2E референдум",
              options: [
                { address: E2E_OPT_YES, title: "За", votes: 2 },
                { address: E2E_OPT_NO, title: "Против", votes: 1 },
              ],
            },
          },
        });
        return;
      }
      await route.fallback();
    });
    await page.goto(`/referendums/${encodeURIComponent(E2E_VOTING)}`);
    await expect(page.getByTestId("voting-finalize")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("vote-option")).toHaveCount(0);
    await page.getByTestId("voting-finalize").click();
    await expect(page.getByText(/Итог отправлен/i)).toBeVisible({ timeout: 10_000 });
  });

  test("create decision referendum and auto-launch", async ({ page }) => {
    await page.goto("/referendums/new");
    await expect(page.getByTestId("create-vtype-0")).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("create-vtype-0").click();
    await page.getByPlaceholder("Тема референдума").fill("E2E решение");
    // decision opts: default form should have За/Против fields — fill title is enough for vtype 0
    await page.getByTestId("create-voting-submit").click();
    await expect(page).toHaveURL(/launch=1/, { timeout: 15_000 });
    await expect(page.getByText(/Запущено/i)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("deputy nomination flow (testnet mocks)", () => {
  test.beforeEach(async ({ page }) => {
    await installTestnetMocks(page);
    await enableE2eSession(page, { citizen: true, wallet: true, vault: true, presentation: true });
  });

  test("council shows deputies and become-candidate opens nominate form", async ({ page }) => {
    await page.goto("/council");
    await expect(page.getByText("Депутат E2E")).toBeVisible({ timeout: 20_000 });
    await page.getByTestId("become-candidate").click();
    await expect(page).toHaveURL(/council\/nominate/);
    await expect(page.getByTestId("nominate-title")).toBeVisible();
    await expect(page.getByTestId("candidate-name")).toBeVisible();
  });

  test("nominate publishes deputy profile (e2e short-circuit)", async ({ page }) => {
    await page.goto("/council");
    await page.getByTestId("become-candidate").click({ timeout: 20_000 });
    await page.getByTestId("candidate-name").fill("Кандидат E2E");
    await page.getByTestId("candidate-bio").click();
    await page.keyboard.type("Программа E2E");
    await page.getByTestId("candidate-risk-ack").check();
    await page.getByTestId("candidate-continue").click();
    await expect(page.getByText("Кандидат E2E")).toBeVisible();
    await page.getByTestId("candidate-publish").click();
    await expect(page).toHaveURL(/\/council$/, { timeout: 15_000 });
  });
});

test.describe("public browse (guest)", () => {
  test.beforeEach(async ({ page }) => {
    await installTestnetMocks(page);
    await enableE2eSession(page, { citizen: false, wallet: false, vault: false, presentation: false });
  });

  test("laws leaders apps without citizen", async ({ page }) => {
    await page.goto("/laws");
    await expect(page.getByRole("heading", { name: /Принятые законы|Passed laws|законсем/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("law-card")).toBeVisible();

    await page.goto("/leaders");
    await expect(page.getByTestId("leader-card")).toBeVisible({ timeout: 15_000 });

    await page.goto("/apps");
    await expect(page.getByTestId("hub-app").first()).toBeVisible({ timeout: 15_000 });
  });
});
