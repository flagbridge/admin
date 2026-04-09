import { expect, test } from "@playwright/test";
import {
  MOCK_ENVIRONMENTS,
  MOCK_FLAGS,
  mockAllAPIs,
  setAuthCookies,
} from "./helpers";
import type { Flag, FlagState } from "../src/lib/types";

const PROJECT_PAGE = "/en/projects/my-app";

test.describe("Feature Flags", () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto(PROJECT_PAGE);
    await setAuthCookies(page);
    await page.reload();
  });

  test("shows environment tabs", async ({ page }) => {
    for (const env of MOCK_ENVIRONMENTS) {
      await expect(page.getByRole("button", { name: env.name })).toBeVisible();
    }
  });

  test("shows the Create Flag button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Create Flag" }),
    ).toBeVisible();
  });

  test("renders existing flags in the table", async ({ page }) => {
    await expect(page.getByText("dark-mode")).toBeVisible();
  });

  test("shows empty state when there are no flags", async ({ page }) => {
    await page.route(
      "https://api.flagbridge.io/v1/projects/*/flags**",
      async (route) => {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [] }),
        });
      },
    );
    await page.reload();

    await expect(page.getByText("No flags in this environment.")).toBeVisible();
  });

  test("opens Create Flag dialog when button is clicked", async ({ page }) => {
    await page.getByRole("button", { name: "Create Flag" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByLabel("Key")).toBeVisible();
  });

  test("creates a new flag and shows it in the table", async ({ page }) => {
    const newFlag: Flag & { state?: FlagState } = {
      id: "flag-new",
      key: "new-feature",
      name: "new-feature",
      type: "boolean",
      default_value: false,
      tags: [],
      project_id: "proj-1",
      created_by: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let flagCreated = false;
    await page.route(
      "https://api.flagbridge.io/v1/projects/*/flags",
      async (route) => {
        if (route.request().method() === "POST") {
          flagCreated = true;
          return route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({ data: newFlag }),
          });
        }
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: flagCreated ? [...MOCK_FLAGS, newFlag] : MOCK_FLAGS,
          }),
        });
      },
    );

    await page.reload();

    await page.getByRole("button", { name: "Create Flag" }).click();
    await page.getByLabel("Key").fill("new-feature");

    // Select boolean type if a type selector is present
    const booleanOption = page.getByText("Boolean");
    if (await booleanOption.isVisible()) {
      await booleanOption.click();
    }

    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByText("new-feature")).toBeVisible();
  });

  test("toggles a flag from disabled to enabled", async ({ page }) => {
    let toggleCalled = false;
    let enabledValue = false;

    await page.route(
      "https://api.flagbridge.io/v1/projects/*/flags/*/states/*",
      async (route) => {
        const body = await route.request().postDataJSON();
        toggleCalled = true;
        enabledValue = body.enabled;
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              id: "state-1",
              flag_id: "flag-1",
              environment_id: "env-1",
              enabled: body.enabled,
              updated_at: new Date().toISOString(),
            },
          }),
        });
      },
    );

    // Find and click the toggle for "dark-mode" (currently disabled = false)
    const flagRow = page.locator("tr", { hasText: "dark-mode" });
    const toggle = flagRow.locator("button[role='switch'], input[type='checkbox']").first();
    await toggle.click();

    expect(toggleCalled).toBe(true);
    expect(enabledValue).toBe(true);
  });

  test("toggles a flag from enabled to disabled", async ({ page }) => {
    // Start with flag enabled
    await page.route(
      "https://api.flagbridge.io/v1/projects/*/flags**",
      async (route) => {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [
              {
                ...MOCK_FLAGS[0],
                state: {
                  ...MOCK_FLAGS[0].state,
                  enabled: true,
                },
              },
            ],
          }),
        });
      },
    );

    let enabledValue = true;
    await page.route(
      "https://api.flagbridge.io/v1/projects/*/flags/*/states/*",
      async (route) => {
        const body = await route.request().postDataJSON();
        enabledValue = body.enabled;
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              id: "state-1",
              flag_id: "flag-1",
              environment_id: "env-1",
              enabled: body.enabled,
              updated_at: new Date().toISOString(),
            },
          }),
        });
      },
    );

    await page.reload();

    const flagRow = page.locator("tr", { hasText: "dark-mode" });
    const toggle = flagRow.locator("button[role='switch'], input[type='checkbox']").first();
    await toggle.click();

    expect(enabledValue).toBe(false);
  });

  test("navigates to flag detail page when flag key is clicked", async ({
    page,
  }) => {
    const flagLink = page.getByRole("link", { name: "dark-mode" });
    if (await flagLink.isVisible()) {
      await flagLink.click();
      await expect(page).toHaveURL(/\/flags\/dark-mode/);
    } else {
      // Some UIs use a table row click instead of a link
      const flagRow = page.locator("tr", { hasText: "dark-mode" });
      await flagRow.getByText("dark-mode").click();
      await expect(page).toHaveURL(/\/flags\/dark-mode/);
    }
  });

  test("switches between environment tabs and keeps flag list scoped to selected env", async ({
    page,
  }) => {
    let requestedEnv = "";
    await page.route(
      "https://api.flagbridge.io/v1/projects/*/flags**",
      async (route) => {
        const url = new URL(route.request().url());
        requestedEnv = url.searchParams.get("environment") ?? "";
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: MOCK_FLAGS }),
        });
      },
    );

    await page.reload();

    await page.getByRole("button", { name: "staging" }).click();

    // The hook should have made a request with environment=staging
    expect(requestedEnv).toBe("staging");
  });
});
