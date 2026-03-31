# Flag Detail

**Route:** `/[locale]/projects/[slug]/flags/[key]`
**File:** `src/app/[locale]/(admin)/projects/[slug]/flags/[key]/page.tsx`

## Purpose

Shows the full detail of a single feature flag: metadata (key, type, description, creation date), per-environment toggle, and targeting rules (conditions that override the default value for specific user segments).

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/v1/projects/{slug}/flags/{key}` | Fetch flag with nested states and rules |
| `GET` | `/v1/projects/{slug}/environments` | List environments for tab bar |
| `PUT` | `/v1/projects/{slug}/flags/{key}/states/{env}` | Toggle flag enabled state per environment |
| `POST` | `/v1/projects/{slug}/flags/{key}/rules` | Create a targeting rule |
| `DELETE` | `/v1/projects/{slug}/flags/{key}/rules/{id}` | Delete a targeting rule |

## Component Tree

```
FlagDetailPage
├── [loading] TopBar (partial breadcrumbs) + Spinner
├── [error/not found] TopBar + AlertCircle + errorLoad message
└── [data]
    ├── TopBar (breadcrumbs: [Projects → /] > [slug → /projects/slug] > [key])
    ├── Flag header
    │   ├── <h1> flag.key (mono font)
    │   ├── Badge (type: boolean=blue / string=warning / number=success)
    │   ├── <p> flag.description (if present)
    │   └── Calendar icon + createdAt date
    ├── Environment tab bar (only if environments exist)
    │   └── <button> per env
    ├── Toggle card
    │   └── FlagToggle — useToggleFlagState(), toast on error
    └── TargetingRules
        ├── Rule list (×n)
        │   └── Delete button — useDeleteRule(), toast on success/error
        └── Add Rule form
            ├── Dynamic condition fields (attribute / operator / value)
            ├── "Add Condition" button
            ├── Result value input
            └── "Save Rule" button — useCreateRule(), toast on success/error
```

## State

| State | Source | Notes |
|-------|--------|-------|
| `flag` | `useFlag(slug, key)` | Includes `.states` and `.rules` keyed by env slug |
| `environments` | `useEnvironments(slug)` | For tab bar |
| `isLoading` | `useFlag()` | Full-page spinner |
| `isError` | `useFlag()` | Error / not-found screen |
| `selectedEnv` | `activeEnv \|\| environments[0].slug` | Defaults to first env |
| `activeEnv` | `useState` | User-driven env selection |
| `currentState` | `flag.states[selectedEnv]` | Enabled boolean for selected env |
| `currentRules` | `flag.rules[selectedEnv]` | Rules array for selected env |

## Hooks Used

- `useFlag(slug, key)` — detail query (`["flag", slug, key]`)
- `useEnvironments(slug)` — list query (`["environments", slug]`)
- `useToggleFlagState(slug, key)` — mutation, invalidates `["flag", slug, key]`
- `useCreateRule(slug, key)` — mutation, invalidates `["flag", slug, key]`
- `useDeleteRule(slug, key)` — mutation, invalidates `["flag", slug, key]`

## i18n Namespaces

- `flags` — keys: `enabled`, `createdAt`, `errorLoad`, `toggleError`, `ruleAdded`, `ruleAddError`, `ruleDeleted`, `ruleDeleteError`
- `targeting` — keys: `title`, `addRule`, `attribute`, `operator`, `value`, `result`, `addCondition`, `saveRule`, `noRules`, `operators.*`
- `nav` — keys: `projects`
