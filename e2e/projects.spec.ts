import { expect, test } from "@playwright/test";
import {
  MOCK_PROJECTS,
  mockAllAPIs,
  mockProjectsAPI,
  setAuthCookies,
} from "./helpers";

const DASHBOARD_URL = "/en";

test.describe("Projects", () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    // Navigate first to set cookies on the right origin
    await page.goto(DASHBOARD_URL);
    await setAuthCookies(page);
    await page.reload();
  });

  test("shows the dashboard heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("shows the Create Project button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Create Project" }),
    ).toBeVisible();
  });

  test("renders existing projects in a grid", async ({ page }) => {
    // MOCK_PROJECTS has one project: "My App"
    await expect(page.getByText("My App")).toBeVisible();
  });

  test("shows empty state when there are no projects", async ({ page }) => {
    // Override to return empty list
    await mockProjectsAPI(page, []);
    await page.reload();

    await expect(page.getByText("No projects yet")).toBeVisible();
  });

  test("opens Create Project dialog when button is clicked", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Create Project" }).click();

    // Dialog should appear with a Name field
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
  });

  test("creates a new project and shows it in the grid", async ({ page }) => {
    const newProject = {
      id: "proj-new",
      name: "E2E Test Project",
      slug: "e2e-test-project",
      created_by: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // After creation the list endpoint should return the new project too
    let created = false;
    await page.route("https://api.flagbridge.io/v1/projects", async (route) => {
      if (route.request().method() === "POST") {
        created = true;
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ data: newProject }),
        });
      }
      // GET: return original + new project once created
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: created ? [...MOCK_PROJECTS, newProject] : MOCK_PROJECTS,
        }),
      });
    });

    await page.reload();

    await page.getByRole("button", { name: "Create Project" }).click();
    await page.getByLabel("Name").fill("E2E Test Project");

    // Slug field should auto-populate or we fill it
    const slugInput = page.getByLabel("Slug");
    if (await slugInput.isVisible()) {
      await slugInput.fill("e2e-test-project");
    }

    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByText("E2E Test Project")).toBeVisible();
  });

  test("navigates to project detail page when project card is clicked", async ({
    page,
  }) => {
    // The project card should be a link to /projects/[slug]
    const projectCard = page.getByText("My App");
    await projectCard.click();

    await expect(page).toHaveURL(/\/projects\/my-app/);
  });
});
