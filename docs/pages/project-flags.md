# Project / Flag List

**Route:** `/[locale]/projects/[slug]`
**File:** `src/app/[locale]/(admin)/projects/[slug]/page.tsx`

## Purpose

Shows all feature flags for a project, scoped to the selected environment. Users switch between environments via tabs, toggle flags on/off, and create new flags or environments.

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/projects/{slug}/environments` | List environments for the project |
| `POST` | `/api/v1/projects/{slug}/environments` | Create a new environment |
| `GET` | `/api/v1/projects/{slug}/flags?environment={env}` | List flags in selected environment |
| `POST` | `/api/v1/projects/{slug}/flags` | Create a new flag |
| `PUT` | `/api/v1/projects/{slug}/flags/{key}/states/{env}` | Toggle flag enabled state (optimistic) |

## Component Tree

```
ProjectPage
├── TopBar (breadcrumbs: [Projects → /] > [slug])
├── [error]  AlertCircle + errorLoad message
├── [empty envs] Server icon + noEnvironments + Button "Create Environment"
└── [has envs]
    ├── Environment tab bar
    │   ├── <button> per env (active = bg-slate-700)
    │   └── <button> "+" → opens createEnvOpen dialog
    ├── Button "Create Flag" → opens CreateFlagDialog
    ├── [loading] Spinner
    └── FlagTable
        ├── FlagToggle (×n) — useToggleFlag(), optimistic
        └── [empty] noFlags message
├── CreateFlagDialog
│   └── useCreateFlag(slug) mutation
└── Dialog "Create Environment"
    └── useCreateEnvironment(slug) mutation
```

## State

| State | Source | Notes |
|-------|--------|-------|
| `environments` | `useEnvironments(slug)` | TanStack Query |
| `flags` | `useFlags(slug, selectedEnv)` | Disabled until `selectedEnv` is set |
| `isError` | `envsError \|\| flagsError` | Error banner shown on failure |
| `selectedEnv` | `activeEnv \|\| environments[0].slug` | Defaults to first env |
| `activeEnv` | `useState` | User-driven env selection |
| `createFlagOpen` | `useState` | Controls CreateFlagDialog |
| `createEnvOpen` | `useState` | Controls Create Environment dialog |
| `envName` | `useState` | Controlled input for new env name |

## Hooks Used

- `useEnvironments(slug)` — list query (`["environments", slug]`)
- `useCreateEnvironment(slug)` — mutation, invalidates `["environments", slug]`
- `useFlags(slug, env)` — list query (`["flags", slug, env]`), enabled when env is set
- `useToggleFlag(slug)` — mutation with optimistic update + rollback on error
- `useCreateFlag(slug)` — mutation, invalidates `["flags", slug, ...]`

## i18n Namespaces

- `flags` — keys: `createTitle`, `noFlags`, `noEnvironments`, `errorLoad`, `envCreated`, `envCreateError`
- `projects` — keys: `createEnvironment`, `envName`, `errorLoad`, `envCreated`, `envCreateError`
- `common` — keys: `create`, `cancel`, `loading`
