# CLAUDE.md — FlagBridge Admin Dashboard

> Copiar pra: flagbridge/admin/CLAUDE.md

## O que é

Admin Dashboard do FlagBridge — gerenciamento de flags, plugins, integrations, marketplace.

## Stack

Next.js (App Router, SEMPRE versão mais recente), TypeScript strict, Biome.js (NÃO ESLint), next-intl (EN + PT-BR), TanStack Query v5, Radix UI, Tailwind CSS.
Deploy: **Vercel**. Analytics: GA4 via GTM.

## Routes

```
src/app/[locale]/
├── (marketing)/    # Landing, /developers, /marketplace, /founders-circle
├── (admin)/        # Dashboard, projects, flags, plugins, settings, audit
└── (developer)/    # Plugin SDK docs, API explorer, sandbox
```

## Pro Gating

```tsx
<ProGate flag="pro.analytics">
  <AnalyticsDashboard />
</ProGate>
```
Lê do projeto interno _flagbridge. Se off → CTA de upgrade.

## Convenções

- Biome.js: `npx biome check`
- Server Components default, "use client" só com interatividade
- TanStack Query pra TODOS os API calls (zero fetch raw)
- Radix UI pra primitivos interativos
- Tailwind only (sem CSS modules, sem styled-components)
- Toda string via next-intl (zero hardcoded)
- Todo componente data: loading + error + empty states
- Files: kebab-case. Components: PascalCase.

## NÃO faça

- Não use ESLint — Biome.js only
- Não adicione CSS modules ou styled-components
- Não hardcode strings — use next-intl
- Não bypass ProGate pra features Pro
