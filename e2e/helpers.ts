import type { Page, Route } from "@playwright/test";
import type {
  APIKey,
  APIKeyCreateResponse,
  Environment,
  Flag,
  FlagState,
  Project,
} from "../src/lib/types";

// ---------------------------------------------------------------------------
// Test fixture data
// ---------------------------------------------------------------------------

export const ADMIN_USER = {
  id: "user-1",
  email: "admin@flagbridge.io",
  name: "Admin User",
  role: "admin",
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "My App",
    slug: "my-app",
    description: "Main application",
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const MOCK_ENVIRONMENTS: Environment[] = [
  {
    id: "env-1",
    name: "production",
    slug: "production",
    project_id: "proj-1",
    sort_order: 0,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "env-2",
    name: "staging",
    slug: "staging",
    project_id: "proj-1",
    sort_order: 1,
    created_at: "2024-01-01T00:00:00Z",
  },
];

export const MOCK_FLAGS: (Flag & { state?: FlagState })[] = [
  {
    id: "flag-1",
    key: "dark-mode",
    name: "Dark Mode",
    type: "boolean",
    description: "Enable dark mode UI",
    default_value: false,
    tags: [],
    project_id: "proj-1",
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    state: {
      id: "state-1",
      flag_id: "flag-1",
      environment_id: "env-1",
      enabled: false,
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
];

export const MOCK_API_KEYS: APIKey[] = [
  {
    id: "key-1",
    name: "Production Key",
    key_prefix: "fb_live_abc",
    scope: "evaluation",
    project_id: "proj-1",
    created_by: "user-1",
    last_used_at: null,
    expires_at: null,
    created_at: "2024-01-01T00:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Cookie helpers — simulate an authenticated session
// ---------------------------------------------------------------------------

/**
 * Sets the auth cookies that the app reads via document.cookie.
 * Must be called after page.goto() on the target origin.
 */
export async function setAuthCookies(page: Page): Promise<void> {
  await page.context().addCookies([
    {
      name: "fb_token",
      value: "mock-jwt-token",
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
    {
      name: "fb_user",
      value: encodeURIComponent(JSON.stringify(ADMIN_USER)),
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}

// ---------------------------------------------------------------------------
// API mock helpers — intercept the external API at https://api.flagbridge.io
// ---------------------------------------------------------------------------

const API_BASE = "https://api.flagbridge.io";

type JsonBody = Record<string, unknown> | unknown[];

function apiReply(route: Route, body: JsonBody, status = 200): Promise<void> {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({ data: body }),
  });
}

/** Intercept login so tests don't need a real backend. */
export async function mockLogin(page: Page): Promise<void> {
  await page.route(`${API_BASE}/v1/auth/login`, async (route) => {
    const body = await route.request().postDataJSON();
    if (
      body.email === "admin@flagbridge.io" &&
      body.password === "password123"
    ) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { token: "mock-jwt-token", user: ADMIN_USER },
        }),
      });
    }
    return route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: { code: "unauthorized", message: "Invalid credentials" } }),
    });
  });
}

/** Intercept all project-related API calls. */
export async function mockProjectsAPI(
  page: Page,
  projects: Project[] = MOCK_PROJECTS,
): Promise<void> {
  // List projects
  await page.route(`${API_BASE}/v1/projects`, async (route) => {
    if (route.request().method() === "GET") {
      return apiReply(route, projects);
    }
    if (route.request().method() === "POST") {
      const body = await route.request().postDataJSON();
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: body.name,
        slug: body.slug,
        created_by: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return apiReply(route, newProject, 201);
    }
  });

  // Single project PATCH / DELETE
  await page.route(`${API_BASE}/v1/projects/**`, async (route) => {
    if (route.request().method() === "DELETE") {
      return route.fulfill({ status: 204 });
    }
    if (route.request().method() === "PATCH") {
      return apiReply(route, projects[0]);
    }
  });
}

/** Intercept all environments-related API calls. */
export async function mockEnvironmentsAPI(
  page: Page,
  environments: Environment[] = MOCK_ENVIRONMENTS,
): Promise<void> {
  await page.route(`${API_BASE}/v1/projects/*/environments`, async (route) => {
    if (route.request().method() === "GET") {
      return apiReply(route, environments);
    }
    if (route.request().method() === "POST") {
      const body = await route.request().postDataJSON();
      const newEnv: Environment = {
        id: `env-${Date.now()}`,
        name: body.name,
        slug: body.slug,
        project_id: "proj-1",
        sort_order: environments.length,
        created_at: new Date().toISOString(),
      };
      return apiReply(route, newEnv, 201);
    }
  });
}

/** Intercept all flags-related API calls. */
export async function mockFlagsAPI(
  page: Page,
  flags: (Flag & { state?: FlagState })[] = MOCK_FLAGS,
): Promise<void> {
  // List flags (with optional ?environment= query param)
  await page.route(`${API_BASE}/v1/projects/*/flags`, async (route) => {
    if (route.request().method() === "GET") {
      return apiReply(route, flags);
    }
    if (route.request().method() === "POST") {
      const body = await route.request().postDataJSON();
      const newFlag: Flag = {
        id: `flag-${Date.now()}`,
        key: body.key,
        name: body.key,
        type: body.type,
        description: body.description,
        default_value: false,
        tags: [],
        project_id: "proj-1",
        created_by: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return apiReply(route, newFlag, 201);
    }
  });

  // Toggle flag state: PUT /v1/projects/*/flags/*/states/*
  await page.route(
    `${API_BASE}/v1/projects/*/flags/*/states/*`,
    async (route) => {
      const body = await route.request().postDataJSON();
      const state: FlagState = {
        id: "state-1",
        flag_id: "flag-1",
        environment_id: "env-1",
        enabled: body.enabled,
        updated_at: new Date().toISOString(),
      };
      return apiReply(route, state);
    },
  );

  // Individual flag GET / PATCH / DELETE
  await page.route(`${API_BASE}/v1/projects/*/flags/*`, async (route) => {
    if (route.request().method() === "GET") {
      return apiReply(route, flags[0] ?? {});
    }
    if (route.request().method() === "PATCH") {
      return apiReply(route, flags[0] ?? {});
    }
    if (route.request().method() === "DELETE") {
      return route.fulfill({ status: 204 });
    }
  });
}

/** Intercept all API-keys API calls. */
export async function mockAPIKeysAPI(
  page: Page,
  keys: APIKey[] = MOCK_API_KEYS,
): Promise<void> {
  await page.route(`${API_BASE}/v1/api-keys`, async (route) => {
    if (route.request().method() === "GET") {
      return apiReply(route, keys);
    }
    if (route.request().method() === "POST") {
      const body = await route.request().postDataJSON();
      const created: APIKeyCreateResponse = {
        id: `key-${Date.now()}`,
        name: body.name,
        key_prefix: "fb_live_new",
        scope: body.scope,
        project_id: body.project_id,
        created_by: "user-1",
        created_at: new Date().toISOString(),
        key: "fb_live_newXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      };
      return apiReply(route, created, 201);
    }
  });

  await page.route(`${API_BASE}/v1/api-keys/*`, async (route) => {
    if (route.request().method() === "DELETE") {
      return route.fulfill({ status: 204 });
    }
  });
}

/** Convenience: set up all API mocks at once for pages that need the full stack. */
export async function mockAllAPIs(page: Page): Promise<void> {
  await mockProjectsAPI(page);
  await mockEnvironmentsAPI(page);
  await mockFlagsAPI(page);
  await mockAPIKeysAPI(page);
}
