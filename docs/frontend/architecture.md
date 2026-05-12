# Frontend Architecture

This document explains the architecture and structure of the PhiloBiblon UI frontend application.

## Technology Stack

- **Nuxt 3**: Vue.js framework with SPA mode (SSR disabled)
- **Vue 3**: Progressive JavaScript framework (Composition API)
- **Vuetify 4**: Material Design component framework (`vuetify-nuxt-module`)
- **Pinia**: State management library (replaces Vuex)
- **Vue I18n 11 / @nuxtjs/i18n 10**: Internationalization
- **@kyvg/vue3-notification**: Toast notifications (replaces vue-toastification)
- **Yarn 4 (Berry)**: Package manager
- **Vite**: Build tool (replaces Webpack)
- **TypeScript**: Used in config files (`nuxt.config.ts`, `i18n.config.ts`)

## Application Mode

The frontend runs in **SPA (Single Page Application)** mode with **client-side rendering (CSR)**:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,
  ...
})
```

## Directory Structure

```
frontend/
├── app.vue              # Root component (mounts NuxtLayout + NuxtPage)
├── assets/              # Processed assets (CSS, SCSS variables)
│   ├── css/main.css
│   └── variables.scss   # Vuetify SCSS overrides
├── components/          # Vue components (auto-imported by Nuxt)
│   ├── common/          # Shared UI components
│   ├── create/          # Item creation components
│   ├── item/            # Wikibase item display/edit components
│   │   ├── claim/       # Claim/statement components
│   │   ├── qualifier/   # Qualifier components
│   │   ├── reference/   # Reference components
│   │   ├── related/     # Related items components
│   │   ├── util/        # Utility components (editable fields)
│   │   └── value/       # Value type components (URL, Date, Entity, etc.)
│   ├── search/          # Search interface components
│   ├── LanguagesMenu.vue
│   └── PhiloFooter.vue
├── composables/         # Auto-imported Vue composables
│   └── useNotifyError.js
├── i18n.config.ts       # Vue I18n configuration
├── lang/                # Translation files (en, ca, es, gl, pt)
├── layouts/             # Nuxt layout components
│   └── default.vue      # Main layout with navigation drawer + app bar
├── nuxt.config.ts       # Main Nuxt configuration
├── pages/               # File-based routing (auto-routing)
│   ├── index.vue
│   ├── item/
│   │   ├── [id].vue           # View/edit item
│   │   └── [table]/create.vue # Create new item
│   ├── oauth_callback.vue
│   ├── privacy-policy.vue
│   ├── search/<type>/query.vue # Per-type search pages
│   └── wiki/[page].vue         # Wiki page viewer
├── plugins/             # Nuxt plugins (client-side only, numbered for order)
│   ├── 00.vuetify-i18n.client.js
│   ├── 01.config.client.js
│   ├── 02.notification.client.js
│   ├── 03.wikibase.client.js
│   ├── dompurify.client.js
│   └── version-check.client.js
├── public/              # Static assets served as-is (was `static/` in Nuxt 2)
├── service/             # Business logic and API services
└── stores/              # Pinia store modules (was `store/` in Nuxt 2)
```

## Plugin System

Plugins use Nuxt 3's `defineNuxtPlugin` API and the `.client.js` suffix to run client-side only. They are loaded in filename order (numbered prefix).

### `01.config.client.js`
Fetches backend configuration and merges it into `useRuntimeConfig().public`:

```javascript
export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const response = await fetch(`${config.public.apiBaseUrl}/api/config`)
  const data = await response.json()
  Object.entries(data).forEach(([key, value]) => {
    config.public[key] = value
  })
})
```

Config values are accessible anywhere via `useRuntimeConfig().public`.

### `02.notification.client.js`
Registers `@kyvg/vue3-notification` and injects the `$notification` service:

```javascript
import Notifications, { useNotification } from '@kyvg/vue3-notification'
import { NotificationService } from '~/service/notification.service'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Notifications)
  const { notify } = useNotification()
  return { provide: { notification: new NotificationService(notify) } }
})
```

Usage in components: `const { $notification } = useNuxtApp()`

### `03.wikibase.client.js`
Injects the `$wikibase` service and starts the query cache cleanup interval:

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public
  const wikibaseService = new WikibaseService({ config, $notification: nuxtApp.$notification })
  setInterval(() => useQueryCacheStore().clearCache(), 3000)
  return { provide: { wikibase: wikibaseService } }
})
```

Usage: `const { $wikibase } = useNuxtApp()`

### `00.vuetify-i18n.client.js`
Merges Vuetify's own locale messages into Vue I18n so Vuetify components render translated strings.

### `dompurify.client.js`
Provides `$sanitize` to safely render HTML content.

### `version-check.client.js`
Forces a page reload when the deployed version changes (detected via `localStorage`).

## Routing

Nuxt 3 uses bracket syntax for dynamic routes:

| File | Route | Purpose |
|------|-------|---------|
| `pages/index.vue` | `/` (redirects to locale prefix) | Home |
| `pages/item/[id].vue` | `/item/:id` | View/edit item |
| `pages/item/[table]/create.vue` | `/item/:table/create` | Create new item |
| `pages/search/<type>/query.vue` | `/search/<type>/query` | Search by type |
| `pages/wiki/[page].vue` | `/wiki/:page` | Wiki page viewer |
| `pages/oauth_callback.vue` | `/oauth_callback` | OAuth callback |

All routes are prefixed with the active locale (e.g. `/en/item/Q123`, `/ca/search/manid/query`) via the `'prefix'` i18n strategy.

Access route parameters in components:

```javascript
const route = useRoute()
const id = route.params.id       // e.g. "Q123"
const table = route.params.table // e.g. "manid"
```

## Component Style — Composition API

All components use `<script setup>` (Composition API). There is no `this` context.

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const { $wikibase } = useNuxtApp()
const authStore = useAuthStore()
const route = useRoute()

const entity = ref(null)

onMounted(async () => {
  entity.value = await $wikibase.getEntity(route.params.id, 'ca')
})
</script>
```

## Composables

Reusable logic is extracted into composables in `composables/` (auto-imported by Nuxt):

### `useNotifyError`
Centralised error handling with friendly i18n messages and automatic logout on session expiry:

```javascript
const { notifyError } = useNotifyError()
try {
  await $wikibase.saveClaim(claim)
} catch (error) {
  notifyError(error)
}
```

## State Management

Vuex has been replaced by **Pinia**. Stores are in `stores/` and use the Composition API style. See [State Management](state-management.md) for details.

## API Communication

Direct Axios usage has been replaced by native `fetch` in plugins. In service classes, fetch is used directly:

```javascript
const response = await fetch(`${config.apiBaseUrl}/api/config`)
const data = await response.json()
```

Runtime configuration (instead of `process.env` in components):

```javascript
const config = useRuntimeConfig().public
config.wikibaseBaseUrl
config.apiBaseUrl
```

## i18n

Configured via `@nuxtjs/i18n` module with `'prefix'` strategy. All routes get a locale prefix. Locale detection uses a `language` cookie.

```javascript
// In components
const { t, locale } = useI18n()
const localePath = useLocalePath()

// Navigate to localized route
router.push(localePath('/search/manid/query'))
```

Configuration is split between `nuxt.config.ts` (module config) and `i18n.config.ts` (Vue I18n options, `legacy: false` for Composition API).

## Build Process

The build tool is **Vite** (Nuxt 3 default), replacing Webpack.

### Development

```bash
yarn dev
# Starts Vite dev server with HMR at http://localhost:3000
# API_BASE_URL is hardcoded to https://philobiblon.cog.berkeley.edu/ui-local/
```

### Production

```bash
yarn build    # Produces .output/ directory
yarn preview  # Preview the production build locally
```

## Next Steps

- [State Management](state-management.md) - Deep dive into Pinia stores
- [Services](services.md) - API and business logic layer
- [Components](components.md) - Component architecture patterns
