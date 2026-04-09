# FlagBridge Admin Dashboard

The web interface for managing feature flags, plugins, projects, and environments in [FlagBridge](https://github.com/flagbridge/flagbridge).

Full documentation at [docs.flagbridge.io](https://docs.flagbridge.io).

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI primitives | Radix UI |
| Data fetching | TanStack Query v5 |
| Linting/formatting | Biome.js |
| i18n | next-intl (EN + PT-BR) |
| Deploy | Vercel |

## Route Structure

```
src/app/[locale]/
├── (marketing)/        # Landing page, /developers, /marketplace, /founders-circle
├── (admin)/            # Dashboard, projects, flags, plugins, settings, audit log
└── (developer)/        # Plugin SDK docs, API explorer, sandbox
```

## Features

- **Flag management** — create, edit, toggle, and configure targeting rules per environment
- **Project & environment management** — organize flags across multiple projects and environments
- **Plugin marketplace** — browse and install plugins built on the FlagBridge Plugin SDK
- **Audit log** — full history of flag changes and user actions
- **Pro feature gating** — `ProGate` component controls access to paid features
- **Internationalization** — full EN and PT-BR support via next-intl

### Pro Gating

Features behind the Pro plan are wrapped with `ProGate`. It reads from the internal `_flagbridge` project — if the flag is off, it renders an upgrade CTA instead of the protected content.

```tsx
<ProGate flag="pro.analytics">
  <AnalyticsDashboard />
</ProGate>
```

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm lint       # Run Biome.js check (biome check .)
```

## Conventions

- **Server Components by default** — add `"use client"` only when the component requires interactivity or browser APIs.
- **TanStack Query for all data fetching** — no raw `fetch` calls in components.
- **Radix UI for interactive primitives** — dialogs, dropdowns, tooltips, etc.
- **Tailwind only** — no CSS Modules or CSS-in-JS.
- **All strings via next-intl** — zero hardcoded user-facing text.
- **Every data component** handles loading, error, and empty states.
- **File naming** — `kebab-case` for files, `PascalCase` for components.

## License

Apache 2.0 — see [LICENSE](../flagbridge/LICENSE) in the main repository.
