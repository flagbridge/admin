@AGENTS.md

# CLAUDE.md — FlagBridge Admin Dashboard

## What This Is

The FlagBridge Admin Dashboard — a Next.js 16 app for managing feature flags, plugins, integrations, and the marketplace.

- **Live:** https://admin.flagbridge.io
- **Repo:** https://github.com/flagbridge/admin
- **API:** Go REST API on Fly.io

## Tech Stack

| Layer          | Tech                     |
|----------------|--------------------------|
| Framework      | Next.js 16 (App Router)  |
| Linting        | Biome.js (NOT ESLint)    |
| i18n           | next-intl (EN + PT-BR)   |
| Data fetching  | TanStack Query v5        |
| UI primitives  | Radix UI                 |
| Styling        | Tailwind CSS             |
| Deploy         | Cloudflare Pages via `npx wrangler pages deploy` |
| Analytics      | GA4 via GTM (pageview + scroll depth) |

## Route Structure

```
src/app/[locale]/
├── (marketing)/         # Landing page, /developers, /marketplace (public)
├── (admin)/             # Authenticated admin pages
│   ├── dashboard/       # Overview cards, activity feed, health metrics (Pro)
│   ├── projects/        # Project list + CRUD
│   │   └── [id]/
│   │       ├── flags/           # Flag list, detail, targeting rules
│   │       │   └── [key]/
│   │       │       ├── product-card/  # (Pro) hypothesis, success metrics
│   │       │       └── metrics/       # (Pro) adoption, error rate
│   │       ├── environments/    # Per-project env config
│   │       ├── audit/           # Immutable audit log viewer
│   │       ├── webhooks/        # Webhook management + delivery logs
│   │       └── integrations/    # (Pro) Mixpanel, Customer.io, etc.
│   ├── plugins/         # Installed plugins + marketplace browser
│   └── settings/        # Account, API keys, license, billing
└── (developer)/         # Plugin SDK docs, API explorer, sandbox
```

## Admin Pages Detail

### Dashboard
- Overview cards: total flags, active, stale, flags by status
- Activity feed: recent changes, deploys, plugin installs
- Health metrics (Pro): evaluation volume, error rates, SDK connections
- Tech debt score (Pro): stale flags, ownerless flags, missing product cards

### Flag Manager
- List: filterable by project, environment, status, tags, owner
- Detail: toggle, visual targeting rule editor, environment comparison
- Product Card tab (Pro): hypothesis, success metrics, go/no-go criteria, decision history
- Metrics tab (Pro): adoption chart, error rate, latency impact, variant breakdown
- Lifecycle tab (Pro): creation-to-archival timeline, cleanup reminders, code refs

### Plugin Manager
- Installed: toggle on/off, config panel, health status
- Marketplace browser: search, category filter, one-click install
- Dev mode: sandbox, logs, hot-reload

### Settings
- Team: invites, roles (Admin, Editor, Viewer)
- API keys: create, rotate, revoke — per environment
- Integrations: Slack, Linear, Jira, GitHub, GitLab webhooks
- Billing (Pro/SaaS): plan management, invoices, usage

### Audit Log
- Full history: every flag change, toggle, user action, plugin install
- Filterable: by user, action type, date range, entity
- Diff viewer (Pro): side-by-side state comparison

## Pro Gating

```tsx
<ProGate flag="pro.analytics">
  <AnalyticsDashboard />
</ProGate>
```

Reads from `_flagbridge` internal project. If off or trial expired → renders Pro upgrade CTA.

## Conventions

- Biome.js for formatting/linting: `npx biome check`
- Server components by default; `"use client"` only when needed
- TanStack Query for ALL API calls — no raw fetch in components
- Radix UI for interactive primitives
- Tailwind only — no CSS modules, no styled-components
- Files: kebab-case. Components: PascalCase.
- All strings via next-intl message keys — never hardcoded
- Every data component needs loading, error, and empty states

## Priorities

1. Engineering docs: 1 doc per admin page (purpose, API consumed, component tree)
2. i18n audit: ensure full next-intl coverage
3. Error states: loading/error/empty for every data component

## Do NOT

- Use ESLint — Biome.js only
- Add CSS modules or styled-components
- Deploy via Git push — Wrangler CLI only
- Hardcode strings — use next-intl
- Bypass ProGate for Pro features
