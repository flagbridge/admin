# API Keys

**Route:** `/[locale]/api-keys`
**File:** `src/app/[locale]/(admin)/api-keys/page.tsx`

## Purpose

Manage API keys used to authenticate SDK and management API requests. Keys are scoped (`evaluation`, `management`, `full`) and optionally tied to a specific project. Created keys are shown only once — users must copy the raw key immediately after creation.

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/v1/api-keys` | List all API keys |
| `POST` | `/v1/api-keys` | Create a new API key |
| `DELETE` | `/v1/api-keys/{id}` | Revoke an API key |

## Component Tree

```
APIKeysPage
├── TopBar (breadcrumbs: [API Keys])
├── Button "Create API Key" → opens CreateAPIKeyDialog
├── [loading] Spinner
├── [error]  AlertCircle + errorLoad message
└── [data]   APIKeyTable
    ├── Columns: name / key prefix / scope badge / created / last used
    ├── Scope Badge (evaluation=blue / management=warning / full=success)
    └── [empty] "No API keys yet" message
└── CreateAPIKeyDialog
    ├── View 1: Form
    │   ├── Input "Name"
    │   ├── Select "Scope" (evaluation / management / full)
    │   ├── Select "Project" (optional, lists projects)
    │   └── Button "Create" → useCreateAPIKey() mutation
    └── View 2: Key display (shown once after creation)
        ├── Warning banner (keyWarning)
        ├── Key value input (read-only)
        └── Button "Copy"
```

## State

| State | Source | Notes |
|-------|--------|-------|
| `keys` | `useAPIKeys()` | TanStack Query, stale 30s |
| `isLoading` | `useAPIKeys()` | Spinner while fetching |
| `isError` | `useAPIKeys()` | Error banner if fetch fails |
| `dialogOpen` | `useState` | Controls CreateAPIKeyDialog |

## Hooks Used

- `useAPIKeys()` — list query (`["api-keys"]`)
- `useCreateAPIKey()` — mutation, invalidates `["api-keys"]` on success, returns raw key
- `useDeleteAPIKey()` — mutation, invalidates `["api-keys"]` on success

## i18n Namespace

`apiKeys` — keys: `title`, `name`, `keyPrefix`, `scope`, `createdAt`, `lastUsed`, `never`, `createTitle`, `createDescription`, `scopeEvaluation`, `scopeManagement`, `scopeFull`, `project`, `keyWarning`, `yourKey`, `errorLoad`
