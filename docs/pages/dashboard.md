# Dashboard

**Route:** `/[locale]/` (admin layout)
**File:** `src/app/[locale]/(admin)/page.tsx`

## Purpose

Entry point for authenticated users. Lists all projects as cards. From here users create new projects and navigate into a project's flag manager.

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/projects` | Fetch all projects |
| `POST` | `/api/v1/projects` | Create a new project |

## Component Tree

```
DashboardPage
├── TopBar (breadcrumbs: [Dashboard])
├── Button "Create Project" → opens CreateProjectDialog
├── [loading] Spinner
├── [error]  AlertCircle + errorLoad message
├── [empty]  FolderOpen icon + emptyTitle/emptyDescription + Button
├── [data]   Grid
│   └── ProjectCard (×n)
│       └── Link → /projects/[slug]
└── CreateProjectDialog
    └── useCreateProject() mutation
```

## State

| State | Source | Notes |
|-------|--------|-------|
| `projects` | `useProjects()` | TanStack Query, stale 30s |
| `isLoading` | `useProjects()` | Spinner while fetching |
| `isError` | `useProjects()` | Error banner if fetch fails |
| `dialogOpen` | `useState` | Controls CreateProjectDialog |

## Hooks Used

- `useProjects()` — list query (`["projects"]`)
- `useCreateProject()` — mutation, invalidates `["projects"]` on success

## i18n Namespace

`dashboard` — keys: `title`, `createProject`, `emptyTitle`, `emptyDescription`, `flagCount`, `errorLoad`
