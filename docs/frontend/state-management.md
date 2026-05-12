# State Management (Pinia)

The frontend uses **Pinia** for centralized state management, replacing Vuex from the Nuxt 2 version. All stores live in `stores/` and use the Composition API style (`defineStore` with a setup function).

## Store Modules Overview

| Module | File | Purpose | Key State |
|--------|------|---------|-----------|
| `useAuthStore` | `auth.js` | User authentication | `isLogged`, `username`, `accessToken` |
| `useQueryStatusStore` | `queryStatus.js` | Search form state | `currentTable`, `form`, `currentPage` |
| `useBreadcrumbStore` | `breadcrumb.js` | Navigation breadcrumbs | `items`, `database`, `table` |
| `useItemCacheStore` | `itemCache.js` | Entity caching | `cache` (key-value map) |
| `useQueryCacheStore` | `queryCache.js` | SPARQL result caching | `cache` (with TTL) |

## auth.js — Authentication State

### Purpose
Manages user session including login status and OAuth tokens.

### State

```javascript
const isLogged = ref(false)
const username = ref(null)
const accessToken = ref(null)  // { token, tokenSecret }
```

### Actions

```javascript
authStore.login({ username: 'john.doe', accessToken: { token: '...', tokenSecret: '...' } })
authStore.logout()
```

### Computed Properties

```javascript
authStore.requestConfig   // { credentials: { oauth: { token: '...' } } }
authStore.authHeaders     // { Authorization: 'OAuth oauth_token="...", ...' }
```

### Usage Example

```javascript
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Check login status
if (authStore.isLogged) { ... }

// Get username in template
const username = computed(() => authStore.username || '')

// Logout
authStore.logout()
```

## queryStatus.js — Search State

### Purpose
Persists search form state so users can navigate away and return without losing filters or results.

### State

```javascript
const currentTable = ref(null)     // e.g. 'manid', 'texid'
const showResults = ref(false)
const currentPage = ref(1)
const sortBy = ref('name')
const isSortDescending = ref(false)
const form = ref(null)             // the search form values
```

### Actions

```javascript
queryStatusStore.setShowResults(true)
queryStatusStore.setPage(2)
queryStatusStore.setSortBy('date')
queryStatusStore.setSortDescending(true)
queryStatusStore.setForm({ input: { simple_search: { value: { textString: 'manuscript' } } } })
queryStatusStore.resetStatus('manid')  // clears all state for a new table
```

### Usage Example

```javascript
import { useQueryStatusStore } from '~/stores/queryStatus'

const queryStatusStore = useQueryStatusStore()

async function performSearch() {
  queryStatusStore.setForm(form.value)
  queryStatusStore.setShowResults(true)
  // execute search...
}
```

## breadcrumb.js — Navigation State

### Purpose
Manages the breadcrumb trail shown in the main layout.

### State

```javascript
const items = ref([])    // breadcrumb entries [{ title, to }]
const cssClass = ref('')
const database = ref('')
const table = ref('')
```

### Actions

```javascript
breadcrumbStore.addItem({ title: 'Manuscripts', to: '/search/manid/query' })
breadcrumbStore.setItems([...])
breadcrumbStore.setDatabase('BETA')
breadcrumbStore.setTable('manid')
breadcrumbStore.resetItems()
```

## itemCache.js — Entity Caching

### Purpose
Client-side cache for Wikibase entities to avoid redundant API calls.

### State

```javascript
const cache = reactive({})  // { 'Q123': { id, labels, claims, ... } }
```

### Actions

```javascript
itemCacheStore.addEntry({ key: 'Q123', value: entityData })
```

### Usage Pattern

```javascript
import { useItemCacheStore } from '~/stores/itemCache'

const itemCacheStore = useItemCacheStore()

let entity = itemCacheStore.cache['Q123']
if (!entity) {
  entity = await $wikibase.getEntities(['Q123'])
  itemCacheStore.addEntry({ key: 'Q123', value: entity })
}
```

## queryCache.js — SPARQL Result Caching

### Purpose
Caches SPARQL query results with automatic expiration (2-minute TTL, 100-entry max).

### Configuration

```javascript
const CACHE_MAX_ENTRIES = 100
const CACHE_EXPIRATION_MILLIS = 120000  // 2 minutes
```

### State

```javascript
const cache = reactive({})
// key: hash of the SPARQL query
// value: { time: Date, value: results }
```

### Actions

```javascript
queryCacheStore.addEntry({ key: queryHash, value: sparqlResults })
queryCacheStore.clearCache()  // removes entries older than 2 minutes
```

`clearCache()` is called automatically every 3 seconds by the `03.wikibase.client.js` plugin.

## Accessing Stores in Components

Stores are imported directly — no `this.$store` needed:

```javascript
import { useAuthStore } from '~/stores/auth'
import { useBreadcrumbStore } from '~/stores/breadcrumb'

const authStore = useAuthStore()
const breadcrumbStore = useBreadcrumbStore()

// Read reactive state
console.log(authStore.isLogged)

// Call actions
authStore.login({ username, accessToken })
```

State is reactive: using store properties directly in templates or `computed()` will trigger re-renders on change.

## Migrating from Vuex

If you're coming from the Nuxt 2 / Vuex version:

| Vuex pattern | Pinia equivalent |
|---|---|
| `this.$store.state.auth.isLogged` | `authStore.isLogged` |
| `this.$store.commit('auth/login', data)` | `authStore.login(data)` |
| `this.$store.getters['auth/requestConfig']` | `authStore.requestConfig` |
| `this.$store.dispatch('queryCache/clearCache')` | `queryCacheStore.clearCache()` |

## Debugging State

Use the **Vue DevTools** browser extension (Pinia tab) to:
- Inspect current store state
- View action history
- Patch state directly for testing

## Next Steps

- [Services](services.md) — How services interact with stores
- [Components](components.md) — How components consume stores
