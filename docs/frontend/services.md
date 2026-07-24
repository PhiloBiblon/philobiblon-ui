# Services Layer

The services layer encapsulates business logic and API communication, keeping components clean and focused on presentation. Services live in `service/` and are injected as Nuxt plugins.

## Overview

| Service | File | Purpose |
|---------|------|---------|
| WikibaseService | `wikibase.service.js` | Core data layer for Wikibase operations |
| QueryService | `query.service.js` | SPARQL query generation |
| OAuthService | `oauth.service.js` | OAuth authentication flow |
| NotificationService | `notification.service.js` | User notifications |

## WikibaseService

The primary service for all Wikibase-related operations.

### Initialization

```javascript
export class WikibaseService {
  constructor({ config, $notification }) {
    this.$config = config
    this.wbk = WBK({
      instance: config.wikibaseApiUrl,
      sparqlEndpoint: config.sparqlEndpoint
    })
    this.wbEdit = wbEdit({
      instance: config.apiBaseUrl   // writes go through the backend OAuth proxy
    })
    this.$query = new QueryService({ config })
    this.$oauth = new OAuthService({ config })
    this.$notification = $notification
    this.sparqlBackendEndpoint = this.joinUrl(config.apiBaseUrl, 'api/sparql/query')
  }
}
```

**Key point**: `wikibase-edit` is configured with `config.apiBaseUrl` (the backend), not the Wikibase instance directly. All writes go through the backend OAuth proxy.

### Core Methods

#### `getEntity(id, lang)`
Fetches a single Wikibase entity.

```javascript
const entity = await $wikibase.getEntity('Q123', 'ca')
```

#### `getEntities(ids, lang)`
Fetches multiple entities in one request.

```javascript
const entities = await $wikibase.getEntities(['Q123', 'Q456'], 'ca')
```

#### `runSparqlQuery(query, minimize, useBackendCache, useInternalCache)`
Executes a SPARQL query with optional caching.

- `minimize` — simplify RDF result structure
- `useBackendCache` — use backend Caffeine cache (24h TTL)
- `useInternalCache` — use frontend Pinia queryCache (2-min TTL)

```javascript
const results = await $wikibase.runSparqlQuery(query, true, true, false)
```

#### `getOrderedClaims(table, claims)`
Sorts claims according to the `Ui_SortedProperties` wiki page configuration.

#### `getClaimsOrderForNewItem(table)` / `getNewItemFieldRules(table)`
Both read the `Ui_SortedProperties_NewItem` wiki page (parsed by `parseSortedPropertiesConfig`).
`getClaimsOrderForNewItem` returns which claims/qualifiers to pre-fill for a new item of `table`,
and in what order. `getNewItemFieldRules` returns that table's validation/behaviour rules:
`{ required, notRemovable, hidden, groups, qualifierHidden }`, driven by modifiers on the same
wiki page (`* Pxxx required`, `* Pxxx not-removable`, `* Pxxx hidden`, `:: qualifier Pxxx hidden`,
`:: required-group:<name> Pxxx,Pyyy`). Both fail soft — an empty ruleset / `null` order and a
logged error — when the page or table isn't configured, so `frontend/components/item/Create.vue`
never needs a per-table `if` branch for this.

#### `getControlledVocabularyConfig(table, bibliography)`
Fetches autocomplete configuration from `Ui_ControlledVocabulary` wiki page. A row's `property`
column may be a plain `Pxxx` (default value / autocomplete query for that claim) or a composite
`Pxxx.Pyyy` (default value for qualifier `Pyyy` of claim `Pxxx`).

### Value Formatting

`getWbValue(property, datatype, datavalue, lang)` converts raw Wikibase datavalues to display objects:

```javascript
// wikibase-item   → { value, type: 'entity', item, pbid }
// external-id     → { value, url, type: 'external-id' }
// time            → { value, calendar, type: 'time' }
// monolingualtext → { value, language, type: 'text-lang' }
```

### PhiloBiblon-Specific Logic

```javascript
$wikibase.isEntityFromPB(entity)           // has a PBID?
$wikibase.getPBID(entity, 'BETA', 'manid') // → 'BETA manid 1234'
$wikibase.parsePBID('BETA manid 1234')     // → { group, tableid, num }
```

## QueryService

Generates SPARQL queries for the search interface. Accessed via `$wikibase.$query`.

### Key Methods

- `addPrefixes(query)` — prepends SPARQL prefixes from backend config
- Table-specific filter generators: `addInstitutionFilters`, `addWorkFilters`, `addPersonFilters`, `addLibraryFilters`, `addReferenceFilters`
- `generateFilterByWords(form, field, values)` — full-text filter with diacritic normalization
- `normalize(str)` — strips diacritics for search matching

## OAuthService

Handles the OAuth 1.0a authentication flow. Accessed via `$wikibase.$oauth`.

### Methods

#### `step1()`
Starts the OAuth flow (redirects to Wikibase authorization page).

#### `step2(oauthToken, oauthVerifier)`
Completes the flow after user approval and stores the access token.

#### `autoLoginByCookie()`
Attempts to restore a session from the `oauth` cookie on page load (called from `default.vue` layout `onMounted`).

## NotificationService

Wraps `@kyvg/vue3-notification` for consistent toast messages.

### Methods

```javascript
$notification.success('Item saved!')
$notification.error(error)   // smart error formatting
$notification.info('Loading...')
```

The `error` method handles common cases:
- `session-expired` error code → triggers logout (via `useNotifyError` composable)
- `maxlag` → "Wikibase is slow, try again"
- Network/timeout errors → "Wikibase unreachable"
- Generic errors → extracts `error.body.error.info`

For richer error handling (i18n messages, automatic logout), use the `useNotifyError` composable instead of `$notification.error` directly:

```javascript
const { notifyError } = useNotifyError()
try {
  await $wikibase.saveClaim(claim)
} catch (error) {
  notifyError(error)
}
```

## Service Injection Pattern

Services are injected via Nuxt plugins and accessed with `useNuxtApp()`:

```javascript
// plugins/03.wikibase.client.js
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public
  return {
    provide: {
      wikibase: new WikibaseService({ config, $notification: nuxtApp.$notification })
    }
  }
})
```

Usage in components (`<script setup>`):

```javascript
const { $wikibase, $notification, $sanitize } = useNuxtApp()
```

## Best Practices

### Always Use Services, Not Direct Fetch

```javascript
// ❌ Bad
const response = await fetch(`${config.apiBaseUrl}/api/wikibase/entities?ids=Q123`)

// ✅ Good
const entity = await $wikibase.getEntity('Q123', 'ca')
```

### Use useNotifyError for User-Visible Errors

```javascript
const { notifyError } = useNotifyError()
try {
  await $wikibase.saveClaim(claim)
  $notification.success(t('messages.saved'))
} catch (error) {
  notifyError(error)
}
```

### Leverage Caching

```javascript
// Backend cache for shared/slow queries
const results = await $wikibase.runSparqlQuery(query, true, true, false)

// Skip all caching for one-off queries
const results = await $wikibase.runSparqlQuery(query, true, false, false)
```

## Next Steps

- [Components](components.md) — How components use these services
- [State Management](state-management.md) — How services interact with Pinia stores
