# State Management (Vuex)

The frontend uses Vuex for centralized state management. Each store module handles a specific domain of the application state.

## Store Modules Overview

| Module | Purpose | Key State |
|--------|---------|-----------|
| `auth` | User authentication | `isLogged`, `username`, `accessToken` |
| `queryStatus` | Search form state | `currentTable`, `form`, `currentPage` |
| `breadcrumb` | Navigation breadcrumbs | `items`, `database`, `table` |
| `itemCache` | Entity caching | `cache` (key-value map) |
| `queryCache` | SPARQL result caching | `cache` (with TTL) |

## auth.js - Authentication State

### Purpose
Manages user session state including login status and OAuth tokens.

### State

```javascript
{
  isLogged: false,      // Boolean: is user authenticated?
  username: null,       // String: logged-in username
  accessToken: null     // Object: { token, tokenSecret }
}
```

### Mutations

#### `login(state, { username, accessToken })`
Sets the user as logged in with credentials.

```javascript
this.$store.commit('auth/login', {
  username: 'john.doe',
  accessToken: {
    token: 'abc123...',
    tokenSecret: 'xyz789...'
  }
})
```

#### `logout(state)`
Clears all authentication data.

```javascript
this.$store.commit('auth/logout')
```

### Getters

#### `getAuthHeaders(state)`
Generates the OAuth 1.0 Authorization header for API requests.

```javascript
const headers = this.$store.getters['auth/getAuthHeaders']
// Returns: { Authorization: 'OAuth oauth_token="...", oauth_token_secret="..."' }
```

This is used by the backend proxy to sign requests to Wikibase.

#### `getRequestConfig(state)`
Returns configuration for `wikibase-edit` library.

```javascript
const config = this.$store.getters['auth/getRequestConfig']
// Used when calling wikibase-edit functions
```

### Usage Example

```javascript
// Login flow (in OAuth callback page)
export default {
  async mounted() {
    const { oauth_token, oauth_verifier } = this.$route.query
    
    const accessToken = await this.$axios.$get('/api/oauth/access-token', {
      params: { oauth_token, oauth_verifier }
    })
    
    const username = await this.$axios.$get('/api/oauth/username', {
      params: {
        oauth_token: accessToken.token,
        oauth_tokensecret: accessToken.tokenSecret
      }
    })
    
    this.$store.commit('auth/login', { username, accessToken })
    this.$router.push('/')
  }
}
```

## queryStatus.js - Search State

### Purpose
Persists the state of the search interface so users can navigate away and return without losing their filters or results.

### State

```javascript
{
  currentTable: null,     // String: e.g., 'manid', 'texid'
  showResults: null,      // Boolean: are results visible?
  currentPage: 1,         // Number: pagination
  sortBy: 'name',         // String: sort field
  isSortDescending: false,// Boolean: sort direction
  form: null              // Object: the search form values
}
```

### Mutations

#### `setShowResults(state, showResults)`
Toggles result visibility.

#### `setPage(state, page)`
Updates current page for pagination.

#### `setSortBy(state, sortBy)`
Changes the sort field.

#### `setSortDescending(state, isSortDescending)`
Changes sort direction.

#### `setForm(state, form)`
Stores the entire search form state.

```javascript
this.$store.commit('queryStatus/setForm', {
  input: {
    simple_search: { value: { textString: 'manuscript' } },
    city: { value: { target_item: 'Q456' } }
  }
})
```

#### `resetStatus(state, table)`
Resets all search state for a new table.

```javascript
this.$store.commit('queryStatus/resetStatus', 'manid')
```

### Usage Example

```javascript
// In search component
export default {
  computed: {
    searchForm() {
      return this.$store.state.queryStatus.form
    }
  },
  methods: {
    async performSearch() {
      // Save form state
      this.$store.commit('queryStatus/setForm', this.form)
      this.$store.commit('queryStatus/setShowResults', true)
      
      // Execute search...
    }
  }
}
```

## breadcrumb.js - Navigation State

### Purpose
Manages the breadcrumb trail for navigation context.

### State

```javascript
{
  items: [],        // Array: breadcrumb items
  class: '',        // String: CSS class for styling
  database: '',     // String: current database (BETA, BITECA, BITAGAP)
  table: ''         // String: current table (manid, texid, etc.)
}
```

### Mutations

#### `addItem(state, item)`
Adds a breadcrumb item.

```javascript
this.$store.commit('breadcrumb/addItem', {
  text: 'Manuscripts',
  to: '/search?table=manid'
})
```

#### `setItems(state, items)`
Replaces all breadcrumbs.

#### `setDatabase(state, database)`
Sets the current database context.

#### `setTable(state, table)`
Sets the current table context.

#### `resetItems(state)`
Clears all breadcrumbs.

## itemCache.js - Entity Caching

### Purpose
Client-side cache for Wikibase entities to avoid redundant API calls.

### State

```javascript
{
  cache: {}  // Object: { 'Q123': { id: 'Q123', labels: {...}, ... } }
}
```

### Mutations

#### `addEntry(state, { key, value })`
Caches an entity.

```javascript
this.$store.commit('itemCache/addEntry', {
  key: 'Q123',
  value: entityData
})
```

### Usage Pattern

```javascript
// Check cache before fetching
let entity = this.$store.state.itemCache.cache['Q123']

if (!entity) {
  entity = await this.$wikibase.getEntities(['Q123'])
  this.$store.commit('itemCache/addEntry', {
    key: 'Q123',
    value: entity
  })
}
```

## queryCache.js - SPARQL Result Caching

### Purpose
Caches SPARQL query results with automatic expiration to improve performance.

### Configuration

```javascript
const CACHE_MAX_ENTRIES = 100          // Max cached queries
const CACHE_EXPIRATION_MILLIS = 120000 // 2 minutes TTL
```

### State

```javascript
{
  cache: {
    // key: query hash
    // value: { time: Date, value: results }
  }
}
```

### Mutations

#### `addEntry(state, { key, value })`
Caches query results with timestamp. Automatically evicts oldest entry if cache is full.

```javascript
this.$store.commit('queryCache/addEntry', {
  key: hashOfQuery,
  value: sparqlResults
})
```

### Actions

#### `clearCache({ state })`
Removes expired entries (older than 2 minutes).

```javascript
this.$store.dispatch('queryCache/clearCache')
```

This is called periodically to prevent memory bloat.

### Cache Eviction Strategy

1. **Size-based**: When cache reaches 100 entries, oldest entry is removed
2. **Time-based**: Entries older than 2 minutes are removed by `clearCache` action

### Usage Example

```javascript
// In query service
const cacheKey = this.hashQuery(sparqlQuery)
let results = this.$store.state.queryCache.cache[cacheKey]?.value

if (!results) {
  results = await this.$axios.$post('/api/sparql/query', { query: sparqlQuery })
  this.$store.commit('queryCache/addEntry', { key: cacheKey, value: results })
}
```

## Best Practices

### 1. Use Mutations for State Changes

Never mutate state directly:

```javascript
// ❌ Bad
this.$store.state.auth.isLogged = true

// ✅ Good
this.$store.commit('auth/login', { username, accessToken })
```

### 2. Use Getters for Computed State

For derived data, use getters instead of computing in components:

```javascript
// In store
getters: {
  isAuthenticated(state) {
    return state.isLogged && state.accessToken !== null
  }
}

// In component
computed: {
  canEdit() {
    return this.$store.getters['auth/isAuthenticated']
  }
}
```

### 3. Namespace Your Commits

Always use the module namespace:

```javascript
this.$store.commit('auth/login', data)  // ✅
this.$store.commit('login', data)       // ❌ Won't work
```

## Debugging State

### Vue DevTools

Use the Vue DevTools browser extension to:
- Inspect current state
- View mutation history
- Time-travel debug (replay mutations)

### Console Access

In development, access store from console:

```javascript
$nuxt.$store.state.auth
$nuxt.$store.commit('auth/logout')
```

## Next Steps

- [Services](services.md) - Learn how services interact with stores
- [Components](components.md) - See how components use Vuex
