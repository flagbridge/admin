# Login

**Route:** `/[locale]/login`
**File:** `src/app/[locale]/(auth)/login/page.tsx`

## Purpose

Unauthenticated entry point. Accepts email and password, exchanges them for a session cookie (`fb_token`), and redirects to the dashboard. Middleware guards all admin routes and redirects unauthenticated users here.

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/v1/auth/login` | Authenticate user, set `fb_token` cookie |

## Component Tree

```
LoginPage
└── <form> onSubmit → POST /v1/auth/login
    ├── Logo (public/logo.svg or logo-dark.png)
    ├── Input "Email" (type=email, required)
    ├── Input "Password" (type=password, required)
    ├── [error] <p> errorInvalid (401) or errorGeneric (other)
    └── Button "Sign In" (disabled + spinner during loading)
```

## State

| State | Source | Notes |
|-------|--------|-------|
| `loading` | `useState` | Disables submit button during request |
| `error` | `useState<string \| null>` | Displays inline error below the form |

## Auth Flow

1. Submit form → `POST /v1/auth/login`
2. On 200: server sets `fb_token` cookie → `router.push("/")` (dashboard)
3. On 401: display `login.errorInvalid`
4. On other error: display `login.errorGeneric`

## i18n Namespace

`login` — keys: `title`, `email`, `password`, `errorInvalid`, `errorGeneric`
`common` — keys: `signIn`, `loading`
