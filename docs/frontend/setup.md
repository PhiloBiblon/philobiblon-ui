# Frontend Setup Guide

This guide will help you set up the PhiloBiblon UI frontend for local development.

## Prerequisites

- **Node.js**: v18 or later (v20 LTS recommended)
- **Yarn**: v4 (Berry) — managed via `packageManager` field in `package.json`
- **Git**: For version control

Yarn 4 is declared in `package.json` as `"packageManager": "yarn@4.x.x"`. Enable it with Corepack:

```bash
corepack enable
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/PhiloBiblon/philobiblon-ui.git
cd philobiblon-ui/frontend
```

### 2. Install Dependencies

```bash
yarn install
```

After installation, `nuxt prepare` runs automatically (`postinstall` script) to generate Nuxt type definitions.

## Configuration

### Environment Variables

The frontend uses `API_BASE_URL` to know where the backend API is located. This is a **Vite build argument** baked into the SPA at build time, not a runtime variable.

**For the staging backend (default for `yarn dev`):**
The dev script in `package.json` already sets this:
```bash
API_BASE_URL=https://philobiblon.cog.berkeley.edu/ui-local/ nuxt dev
```

**For a local backend:**
```bash
API_BASE_URL=http://localhost:8080/ yarn dev
```

The full list of environment variables is in the root [AGENTS.md](../../AGENTS.md#key-environment-variables).

### Runtime Configuration

Configuration is managed through `nuxt.config.ts` via `runtimeConfig.public`. After the app starts, `01.config.client.js` fetches additional config from the backend (`GET /api/config`) and merges it in.

### Nuxt Configuration

The main configuration file is `nuxt.config.ts`. Key settings:

- **`ssr: false`** — Client-side rendering only (SPA mode)
- **`app.baseURL`** — Configured from `BASE_URL` env var (e.g. `/ui-fg/`)
- **`modules`** — `@pinia/nuxt`, `@nuxtjs/i18n`, `vuetify-nuxt-module`, `@nuxt/eslint`
- **`vuetify`** — Theme, global component defaults, locale messages
- **`i18n`** — Locale files, `'prefix'` strategy, cookie-based detection

## Running the Development Server

```bash
yarn dev
```

The application will be available at `http://localhost:3000`.

### Development Features

- **Hot Module Replacement (HMR)**: Vite-powered instant updates on file save
- **ESLint**: Code quality checks (run `yarn lint`)
- **Auto-imports**: Components, composables, and Nuxt/Vue utilities are imported automatically

## Building for Production

```bash
yarn build
```

Produces the `.output/` directory with a Node.js server and static assets.

```bash
yarn preview
```

Serves the production build locally for testing.

## Common Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Start Vite dev server with HMR |
| `yarn build` | Build for production |
| `yarn preview` | Preview the production build |
| `yarn generate` | Generate a fully static site |
| `yarn lint` | Run ESLint |
| `yarn postinstall` | Regenerate Nuxt types (runs automatically after `yarn install`) |

## Troubleshooting

### Port Already in Use

```bash
PORT=3001 yarn dev
```

### Module Not Found / Type Errors

Clear Nuxt's generated files and reinstall:

```bash
rm -rf node_modules .nuxt .output
yarn install
```

### API Connection Issues

1. Verify `API_BASE_URL` is set and points to a running backend
2. Check the browser console — the config plugin logs errors if `API_BASE_URL` is missing
3. Confirm CORS is configured on the backend for your local origin

### Yarn 4 Not Recognised

Make sure Corepack is enabled and active:

```bash
corepack enable
corepack prepare yarn@4 --activate
```

## Next Steps

- Read the [Architecture Guide](architecture.md) to understand the project structure
- Review [State Management](state-management.md) to learn about Pinia stores
- Explore [Components](components.md) for UI component patterns
