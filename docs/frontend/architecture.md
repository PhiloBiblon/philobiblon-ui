# Frontend Architecture

This document explains the architecture and structure of the PhiloBiblon UI frontend application.

## Technology Stack

- **Nuxt.js 2.18.1**: Vue.js framework with SPA mode
- **Vue 2**: Progressive JavaScript framework
- **Vuetify**: Material Design component framework
- **Axios**: HTTP client for API requests
- **Vuex**: State management pattern + library

## Application Mode

The frontend runs in **SPA (Single Page Application)** mode with **client-side rendering (CSR)**. This means:

- All rendering happens in the browser
- Initial page load downloads the full JavaScript bundle
- Navigation is handled client-side (no page reloads)
- SEO is not a primary concern (internal tool)

## Directory Structure

```
frontend/
├── components/         # Vue components
│   ├── common/         # Shared UI components
│   ├── item/           # Wikibase item components
│   │   ├── claim/      # Claim/statement components
│   │   ├── qualifier/  # Qualifier components
│   │   ├── reference/  # Reference components
│   │   ├── util/       # Utility components (editable fields)
│   │   └── value/      # Value type components (URL, Date, etc.)
│   └── search/         # Search interface components
├── lang/               # i18n translation files
├── layouts/            # Nuxt layout components
├── pages/              # Route pages (auto-routing)
├── plugins/            # Nuxt plugins
├── service/            # Business logic and API services
├── static/             # Static assets
└── store/              # Vuex store modules
```

## Plugin System

Nuxt plugins are used to inject functionality globally. Located in `plugins/`:

### `config.js`
Fetches backend configuration and makes it available as `$config`:

```javascript
export default async ({ $axios }, inject) => {
  const config = await $axios.$get('/api/config')
  inject('config', config)
}
```

Usage in components: `this.$config.wikibaseBaseUrl`

### `wikibase.js`
Injects the Wikibase service:

```javascript
import WikibaseService from '~/service/wikibase.service'

export default ({ $axios, store }, inject) => {
  inject('wikibase', new WikibaseService($axios, store))
}
```

Usage: `this.$wikibase.getEntities(['Q123'])`

### `notification.js`
Injects the notification service:

```javascript
import { NotificationService } from '~/service/notification.service'

export default ({ $toast }, inject) => {
  inject('notification', new NotificationService($toast))
}
```

Usage: `this.$notification.success('Item saved!')`

### `dompurify.js`
Sanitizes HTML to prevent XSS attacks when rendering user content.

### `language.js`
Sets up i18n (internationalization) with Catalan as the default language.

### `version-check.js`
Checks if the frontend version matches the backend version to prompt users to refresh.

## Routing

Nuxt automatically generates routes from the `pages/` directory:

| File | Route | Purpose |
|------|-------|---------|
| `pages/index.vue` | `/` | Home page |
| `pages/item/_id.vue` | `/item/:id` | View/edit item (e.g., `/item/Q123`) |
| `pages/search/index.vue` | `/search` | Advanced search interface |
| `pages/login.vue` | `/login` | OAuth login page |

### Dynamic Routes

The `_id.vue` syntax creates a dynamic route. Access the parameter via:

```javascript
this.$route.params.id  // e.g., "Q123"
```

## Component Communication

### Props Down, Events Up

Standard Vue pattern:

```vue
<!-- Parent -->
<EditTextField 
  :value="currentValue"
  @new-value="handleNewValue"
/>

<!-- Child emits -->
this.$emit('new-value', newValue)
```

### Vuex for Global State

For data needed across multiple components:

```javascript
// Set state
this.$store.commit('auth/login', { username, accessToken })

// Read state
this.$store.state.auth.isLogged
```

## API Communication

All API calls go through Axios, configured in `nuxt.config.js`:

```javascript
axios: {
  baseURL: process.env.API_BASE_URL || 'http://localhost:8080'
}
```

### Service Layer Pattern

Instead of calling `$axios` directly in components, use service classes:

```javascript
// In component
const entities = await this.$wikibase.getEntities(['Q123'])

// In service (wikibase.service.js)
async getEntities(ids) {
  const response = await this.$axios.get('/api/wikibase/entities', {
    params: { ids: ids.join('|') }
  })
  return response.data
}
```

This provides:
- Centralized API logic
- Easier testing
- Consistent error handling

## Error Handling

### Global Error Handler

Axios interceptors catch errors:

```javascript
this.$axios.onError((error) => {
  if (error.response?.status === 401) {
    this.$notification.error('Session expired')
    this.$router.push('/login')
  }
})
```

### Component-Level

```javascript
try {
  await this.$wikibase.saveClaim(claim)
  this.$notification.success('Saved!')
} catch (error) {
  this.$notification.error(error)
}
```

## Build Process

### Development Build

```bash
yarn dev
```

- Webpack dev server with HMR
- Source maps enabled
- No minification
- Fast rebuild times

### Production Build

```bash
yarn build
```

- Code minification
- Tree shaking (removes unused code)
- CSS extraction
- Optimized chunks
- Gzip compression

## Performance Considerations

### Code Splitting

Nuxt automatically splits code by route. Each page is a separate chunk loaded on demand.

### Client-Side Caching

- **Vuex stores**: `itemCache` and `queryCache` reduce API calls
- **Browser cache**: Static assets cached via HTTP headers

### Lazy Loading

Components can be lazy-loaded:

```javascript
components: {
  HeavyComponent: () => import('~/components/HeavyComponent.vue')
}
```

## Next Steps

- [State Management](state-management.md) - Deep dive into Vuex stores
- [Services](services.md) - API and business logic layer
- [Components](components.md) - Component architecture patterns
