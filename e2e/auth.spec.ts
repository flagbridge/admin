import { expect, test } from "@playwright/test";
import { mockAllAPIs, mockLogin } from "./helpers";

// The login page lives at /en/login (next-intl locale prefix)
const LOGIN_URL = "/en/login";
const DASHBOARD_URL = "/en";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
    await mockAllAPIs(page);
  });

  test("shows the FlagBridge login form", async ({ page }) => {
    await page.goto(LOGIN_URL);

    await expect(page.getByRole("heading", { name: "FlagBridge" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("shows the Admin badge on the login page", async ({ page }) => {
    await page.goto(LOGIN_URL);

    await expect(page.getByText("Admin")).toBeVisible();
  });

  test("redirects to dashboard after successful login", async ({ page }) => {
    await page.goto(LOGIN_URL);

    await page.getByLabel("Email").fill("admin@flagbridge.io");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.waitForURL(`**${DASHBOARD_URL}`);
    await expect(page).toHaveURL(new RegExp(DASHBOARD_URL));
  });

  test("shows error message on invalid credentials", async ({ page }) => {
    await page.goto(LOGIN_URL);

    await page.getByLabel("Email").fill("admin@flagbridge.io");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("disables Sign In button while loading", async ({ page }) => {
    // Intercept login and hold the response so the loading state stays visible long enough
    await page.route("https://api.flagbridge.io/v1/auth/login", async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            token: "mock-jwt-token",
            user: {
              id: "user-1",
              email: "admin@flagbridge.io",
              name: "Admin",
              role: "admin",
            },
          },
        }),
      });
    });

    await page.goto(LOGIN_URL);
    await page.getByLabel("Email").fill("admin@flagbridge.io");
    await page.getByLabel("Password").fill("password123");

    const submitBtn = page.getByRole("button", { name: /Sign In|Loading/ });
    await submitBtn.click();

    await expect(page.getByRole("button", { name: "Loading..." })).toBeDisabled();
  });

  test("requires email and password fields", async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Try to submit with empty fields — HTML5 validation should prevent submission
    await page.getByRole("button", { name: "Sign In" }).click();

    // The page should still be on login (no navigation happened)
    await expect(page).toHaveURL(new RegExp(LOGIN_URL));
  });
});
