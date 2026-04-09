import { expect, test } from "@playwright/test";
import {
  MOCK_API_KEYS,
  MOCK_PROJECTS,
  mockAllAPIs,
  setAuthCookies,
} from "./helpers";
import type { APIKey, APIKeyCreateResponse } from "../src/lib/types";

const API_KEYS_URL = "/en/api-keys";

test.describe("API Keys", () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto(API_KEYS_URL);
    await setAuthCookies(page);
    await page.reload();
  });

  test("shows the API Keys heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "API Keys" }),
    ).toBeVisible();
  });

  test("shows the Create API Key button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Create API Key" }),
    ).toBeVisible();
  });

  test("renders existing API keys in the table", async ({ page }) => {
    await expect(page.getByText("Production Key")).toBeVisible();
    await expect(page.getByText("fb_live_abc")).toBeVisible();
  });

  test("shows the key scope in the table", async ({ page }) => {
    await expect(page.getByText("Evaluation")).toBeVisible();
  });

  test("shows empty state when there are no API keys", async ({ page }) => {
    await page.route("https://api.flagbridge.io/v1/api-keys", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [] }),
        });
      }
    });
    await page.reload();

    await expect(page.getByText("No API keys yet.")).toBeVisible();
  });

  test("shows error state when API request fails", async ({ page }) => {
    await page.route("https://api.flagbridge.io/v1/api-keys", async (route) => {
      return route.fulfill({ status: 500 });
    });
    await page.reload();

    await expect(page.getByText("Failed to load API keys.")).toBeVisible();
  });

  test("opens Create API Key dialog when button is clicked", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Create API Key" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
  });

  test("creates a new API key and shows the one-time key value", async ({
    page,
  }) => {
    const createdKey: APIKeyCreateResponse = {
      id: "key-new",
      name: "CI Deploy Key",
      key_prefix: "fb_live_new",
      scope: "management",
      project_id: "proj-1",
      created_by: "user-1",
      created_at: new Date().toISOString(),
      key: "fb_live_newXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    };

    let keyCreated = false;
    await page.route("https://api.flagbridge.io/v1/api-keys", async (route) => {
      if (route.request().method() === "POST") {
        keyCreated = true;
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ data: createdKey }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: keyCreated
            ? [
                ...MOCK_API_KEYS,
                {
                  id: "key-new",
                  name: "CI Deploy Key",
                  key_prefix: "fb_live_new",
                  scope: "management",
                  project_id: "proj-1",
                  created_by: "user-1",
                  last_used_at: null,
                  expires_at: null,
                  created_at: new Date().toISOString(),
                } satisfies APIKey,
              ]
            : MOCK_API_KEYS,
        }),
      });
    });

    await page.reload();

    await page.getByRole("button", { name: "Create API Key" }).click();
    await page.getByLabel("Name").fill("CI Deploy Key");

    // Select project if there is a project selector
    const projectSelect = page.getByLabel("Project");
    if (await projectSelect.isVisible()) {
      await projectSelect.selectOption({ label: MOCK_PROJECTS[0].name });
    }

    // Select scope if visible
    const managementOption = page.getByText("Management");
    if (await managementOption.isVisible()) {
      await managementOption.click();
    }

    await page.getByRole("button", { name: "Create" }).click();

    // The UI should show the one-time key after creation
    await expect(page.getByText("This key will only be shown once")).toBeVisible();
    await expect(
      page.getByText("fb_live_newXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"),
    ).toBeVisible();
  });

  test("new API key appears in table after creation dialog is closed", async ({
    page,
  }) => {
    const newKey: APIKey = {
      id: "key-new",
      name: "CI Deploy Key",
      key_prefix: "fb_live_new",
      scope: "management",
      project_id: "proj-1",
      created_by: "user-1",
      last_used_at: null,
      expires_at: null,
      created_at: new Date().toISOString(),
    };

    let keyCreated = false;
    await page.route("https://api.flagbridge.io/v1/api-keys", async (route) => {
      if (route.request().method() === "POST") {
        keyCreated = true;
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              ...newKey,
              key: "fb_live_newXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            },
          }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: keyCreated ? [...MOCK_API_KEYS, newKey] : MOCK_API_KEYS,
        }),
      });
    });

    await page.reload();

    await page.getByRole("button", { name: "Create API Key" }).click();
    await page.getByLabel("Name").fill("CI Deploy Key");
    await page.getByRole("button", { name: "Create" }).click();

    // Close the dialog (copy the key first if there's a "Done" / close button)
    const closeButton = page
      .getByRole("button", { name: /done|close|dismiss/i })
      .first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await page.keyboard.press("Escape");
    }

    await expect(page.getByText("CI Deploy Key")).toBeVisible();
  });

  test("deletes an API key and removes it from the table", async ({ page }) => {
    let keyDeleted = false;

    await page.route(
      "https://api.flagbridge.io/v1/api-keys/key-1",
      async (route) => {
        if (route.request().method() === "DELETE") {
          keyDeleted = true;
          return route.fulfill({ status: 204 });
        }
      },
    );

    await page.route("https://api.flagbridge.io/v1/api-keys", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: keyDeleted ? [] : MOCK_API_KEYS }),
        });
      }
    });

    await page.reload();

    // Find the delete action for "Production Key"
    const keyRow = page.locator("tr", { hasText: "Production Key" });

    // Try a dropdown menu or inline delete button
    const actionsButton = keyRow.getByRole("button", { name: /actions|more|delete/i }).first();
    if (await actionsButton.isVisible()) {
      await actionsButton.click();
    }

    const deleteMenuItem = page.getByRole("menuitem", { name: /delete/i });
    if (await deleteMenuItem.isVisible()) {
      await deleteMenuItem.click();
    } else {
      // Fallback: directly click a delete button in the row
      await keyRow.getByRole("button", { name: /delete/i }).click();
    }

    // Confirm the deletion if a confirmation dialog appears
    const confirmBtn = page.getByRole("button", { name: "Delete" }).last();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    expect(keyDeleted).toBe(true);
    await expect(page.getByText("Production Key")).not.toBeVisible();
  });

  test("shows 'Never' when a key has never been used", async ({ page }) => {
    await expect(page.getByText("Never")).toBeVisible();
  });
});
