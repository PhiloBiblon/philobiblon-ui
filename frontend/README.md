# frontend

Nuxt 3 SPA (SSR disabled) — Vue 3 + Vuetify 3 + Pinia + vue-i18n 10.

## Setup

```bash
yarn install
```

Requires Node 22+ and Yarn 4 with `nodeLinker: node-modules` (already configured in `.yarnrc.yml`).

## Development

```bash
# Dev server (uses staging backend at philobiblon.cog.berkeley.edu/ui-dev/)
yarn dev

# Lint
yarn lint
```

The dev script sets `API_BASE_URL` to the staging backend automatically.

## Production build

```bash
# Generate static output → .output/public/
yarn generate

# Preview the static output locally
yarn preview
```

Output goes to `.output/public/` (served by nginx in the Docker image).

## Docker

```bash
# Build image (pass BASE_URL and API_BASE_URL as build args)
docker build \
  --build-arg BASE_URL=/ \
  --build-arg API_BASE_URL=https://your-backend/ \
  -t philobiblon-frontend .
```

Both `BASE_URL` and `API_BASE_URL` are baked into the SPA at build time — setting them at runtime has no effect.

## Directory structure

| Directory | Purpose |
|---|---|
| `assets/` | SCSS variables, global CSS |
| `components/` | Vue 3 components (auto-imported) |
| `layouts/` | App shell (`default.vue`) and error page |
| `pages/` | File-based routing — `[param]` syntax for dynamic segments |
| `plugins/` | Nuxt plugins (client-only, run before app mount) |
| `public/` | Static assets served at `/` (flags, logos, favicons) |
| `service/` | Plain JS service classes injected via plugins |
| `stores/` | Pinia stores (auth, breadcrumb, itemCache, queryCache, queryStatus) |
| `lang/` | i18n locale files (en, ca, es, gl, pt) |

## Environment variables

Set at Docker build time via `ARG`:

| Variable | Description |
|---|---|
| `BASE_URL` | Router base path (e.g. `/ui-fg/`) |
| `API_BASE_URL` | Backend base URL |

Runtime config (read from the backend's `/api/config` endpoint):
`wikibaseBaseUrl`, `wikibaseApiUrl`, `sparqlEndpoint`, `sparqlQueryPrefix`.

## i18n

Five locales: `en`, `ca`, `es`, `gl`, `pt`. Strategy `prefix` — URLs are `/en/…`, `/ca/…`, etc.
Active locale stored in a `language` cookie. All user-facing strings must appear in all five `lang/*.js` files.
