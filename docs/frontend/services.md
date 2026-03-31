# Services Layer

The services layer encapsulates business logic and API communication, keeping components clean and focused on presentation.

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
constructor(app, store) {
  // Initialize wikibase-sdk
  this.wbk = require('wikibase-sdk')({
    instance: app.$config.wikibaseApiUrl,
    sparqlEndpoint: app.$config.sparqlEndpoint
  })
  
  // Initialize wikibase-edit (points to backend proxy)
  this.wbEdit = require('wikibase-edit')({
    instance: app.$config.apiBaseUrl
  })
}
```

**Key Point**: `wikibase-edit` is configured to use the **backend** (`apiBaseUrl`), not Wikibase directly. This ensures all edits go through the OAuth proxy.

### Core Methods

#### `getEntity(id, lang)`
Fetches a single Wikibase entity by ID.

```javascript
const entity = await this.$wikibase.getEntity('Q123', 'ca')
// Returns: { id: 'Q123', labels: {...}, claims: {...}, ... }
```

#### `getEntities(ids, lang)`
Fetches multiple entities in one request.

```javascript
const entities = await this.$wikibase.getEntities(['Q123', 'Q456'], 'ca')
// Returns: { Q123: {...}, Q456: {...} }
```

#### `runSparqlQuery(query, minimize, useBackendCache, useInternalCache)`
Executes a SPARQL query with caching options.

**Parameters**:
- `query`: SPARQL query string
- `minimize`: Simplify results (remove verbose RDF structure)
- `useBackendCache`: Use backend Caffeine cache
- `useInternalCache`: Use frontend Vuex cache

```javascript
const results = await this.$wikibase.runSparqlQuery(
  'SELECT ?item WHERE { ?item wdt:P31 wd:Q5 }',
  true,  // minimize
  true,  // backend cache
  false  // internal cache (disabled when backend cache is on)
)
```

**Caching Strategy**:
1. If `useInternalCache` is true, check Vuex `queryCache`
2. If miss, execute query
3. Store result in cache with hash key
4. Return results

#### `getOrderedClaims(table, claims)`
Sorts claims according to UI configuration from Wikibase wiki pages.

```javascript
const orderedClaims = await this.$wikibase.getOrderedClaims('manid', entity.claims)
// Returns: [
//   { property: 'P476', values: [...], hasQualifiers: true },
//   { property: 'P11', values: [...], hasQualifiers: false },
//   ...
// ]
```

This reads from the `Ui_SortedProperties` wiki page which defines the display order for each table type.

#### `getControlledVocabularyConfig(table, bibliography)`
Fetches autocomplete configuration for controlled vocabulary fields.

```javascript
const config = await this.$wikibase.getControlledVocabularyConfig('manid', 'BETA')
// Returns: {
//   P297: {  // City property
//     default_value: 'Q456',
//     query: 'SELECT ?item WHERE { ... }'
//   }
// }
```

Used by autocomplete components to:
1. Set default values
2. Generate SPARQL queries for dropdown options

### Value Formatting

#### `getWbValue(property, datatype, datavalue, lang)`
Converts raw Wikibase datavalues into display-ready objects.

**Handles multiple datatypes**:

```javascript
// Wikibase item
{ 
  value: 'Barcelona',
  type: 'entity',
  item: 'Q1492',
  pbid: 'BETA geoid 1234'  // if PhiloBiblon entity
}

// External ID
{
  value: 'VIAF123456',
  url: 'https://viaf.org/viaf/123456',
  type: 'external-id'
}

// Time
{
  value: '1450-01-15',
  calendar: 'Julian',
  type: 'time'
}

// Monolingual text
{
  value: 'Text in Catalan',
  language: 'ca',
  type: 'text-lang'
}
```

### PhiloBiblon-Specific Logic

#### `isEntityFromPB(entity)`
Checks if an entity is a PhiloBiblon entity (has a PBID).

```javascript
if (this.$wikibase.isEntityFromPB(entity)) {
  // Show link to item page
}
```

#### `getPBID(entity, database, table)`
Extracts the PhiloBiblon ID from an entity.

```javascript
const pbid = this.$wikibase.getPBID(entity, 'BETA', 'manid')
// Returns: 'BETA manid 1234'
```

#### `parsePBID(pbid)`
Parses a PBID string into components.

```javascript
const { group, tableid, num } = this.$wikibase.parsePBID('BETA manid 1234')
// group: 'BETA'
// tableid: 'manid'
// num: '1234'
```

### Configuration Management

The service reads UI configuration from special Wikibase wiki pages:

- **`Ui_SortedProperties`**: Defines claim display order
- **`Ui_SortedProperties_NewItem`**: Defines claim order for new items
- **`Ui_ControlledVocabulary`**: Defines autocomplete behavior

These are parsed and cached for performance.

## QueryService

Generates complex SPARQL queries for the search interface.

### Initialization

```javascript
constructor(store, config) {
  this.$store = store
  this.$config = config
}
```

### Key Methods

#### `addPrefixes(query)`
Prepends SPARQL prefixes from backend configuration.

```javascript
const fullQuery = this.$query.addPrefixes(`
  SELECT ?item WHERE { ?item wdt:P31 wd:Q5 }
`)
```

#### Table-Specific Filter Generators

Each table type has a dedicated filter method:

- `addInstitutionFilters(form)` - For `insid` (institutions)
- `addWorkFilters(form)` - For `texid` (works)
- `addPersonFilters(form)` - For `bioid` (people)
- `addLibraryFilters(form)` - For `libid` (libraries)
- `addReferenceFilters(form)` - For `bibid` (references)

**Example**:

```javascript
const filters = this.$query.addWorkFilters({
  input: {
    author: { value: { target_item: 'Q789' } },
    language: { value: { target_item: 'Q150' } },
    date_composition: { value: { begin: '1400', end: '1500' } }
  }
})
```

Generates:

```sparql
?item wdt:P21 wd:Q789 .
?item wdt:P18 wd:Q150 .
?item p:P412 ?date_of_creation .
OPTIONAL { ?item wdt:P412 ?begin_date }
FILTER(?begin_date >= '1400-01-01T00:00:00Z'^^xsd:dateTime)
...
```

#### `generateFilterByWords(form, filterField, filterValues)`
Creates full-text search filters with diacritic normalization.

```javascript
const filter = this.$query.generateFilterByWords(
  form,
  'label',
  ['barcelona', 'catalunya']
)
// Returns: (contains(replace(..., 'barcelona')) && contains(replace(..., 'catalunya')))
```

#### `normalize(str)`
Removes diacritics for search matching.

```javascript
this.$query.normalize('Català')  // Returns: 'catala'
```

### BITAGAP Group Filters

Special logic for BITAGAP database to filter by "Cartas" vs "Original" groups:

```javascript
generateBitagapGroupWorkFilters(bitagapGroup) {
  if (bitagapGroup === 'CARTAS') {
    return 'FILTER(CONTAINS(STR(?labelSubjectItem), "[Cartas de]"))'
  } else if (bitagapGroup === 'ORIG') {
    return 'FILTER(!CONTAINS(STR(?labelSubjectItem), "[Cartas de]"))'
  }
}
```

## OAuthService

Handles the OAuth 1.0a authentication flow with the backend.

### Methods

#### `initiateLogin()`
Starts the OAuth flow.

```javascript
async initiateLogin() {
  const { token, authorizationUrl } = await this.$axios.$get('/api/oauth/request-token')
  window.location.href = authorizationUrl
}
```

#### `completeLogin(oauthToken, oauthVerifier)`
Completes the OAuth flow after user approval.

```javascript
async completeLogin(oauthToken, oauthVerifier) {
  const accessToken = await this.$axios.$get('/api/oauth/access-token', {
    params: { oauth_token: oauthToken, oauth_verifier: oauthVerifier }
  })
  
  const username = await this.$axios.$get('/api/oauth/username', {
    params: {
      oauth_token: accessToken.token,
      oauth_tokensecret: accessToken.tokenSecret
    }
  })
  
  this.$store.commit('auth/login', { username, accessToken })
}
```

## NotificationService

Provides a consistent interface for user notifications.

### Methods

#### `success(message)`
Shows a success toast.

```javascript
this.$notification.success('Item saved successfully!')
```

#### `error(error)`
Shows an error toast with smart error parsing.

```javascript
try {
  await this.$wikibase.saveClaim(claim)
} catch (error) {
  this.$notification.error(error)
  // Automatically handles:
  // - 401 errors -> "Authentication error"
  // - Server error responses -> extracts error.response.data.message
  // - Network errors -> displays error message
}
```

#### `info(message)`
Shows an informational toast.

```javascript
this.$notification.info('Loading data...')
```

### Error Handling Logic

```javascript
error(error) {
  if (error.response) {
    if (error.response.status === 401) {
      error = 'Authentication error'
    } else if (error.response.data?.message) {
      error = error.response.data.message
    }
  }
  console.error(error)
  this.$toast.error(error, { duration: 5000, icon: 'error' })
}
```

## Service Injection Pattern

Services are injected globally via Nuxt plugins:

```javascript
// plugins/wikibase.js
export default ({ $axios, store }, inject) => {
  inject('wikibase', new WikibaseService($axios, store))
}
```

Usage in components:

```javascript
export default {
  async mounted() {
    const entity = await this.$wikibase.getEntity('Q123', 'ca')
  }
}
```

## Best Practices

### 1. Always Use Services, Not Direct Axios

```javascript
// ❌ Bad
const response = await this.$axios.get('/api/wikibase/entities?ids=Q123')

// ✅ Good
const entity = await this.$wikibase.getEntity('Q123', 'ca')
```

### 2. Leverage Caching

```javascript
// For frequently accessed data, use backend cache
const results = await this.$wikibase.runSparqlQuery(query, true, true)

// For one-time queries, skip caching
const results = await this.$wikibase.runSparqlQuery(query, true, false, false)
```

### 3. Handle Errors Consistently

```javascript
try {
  await this.$wikibase.saveClaim(claim)
  this.$notification.success('Saved!')
} catch (error) {
  this.$notification.error(error)  // Let the service handle formatting
}
```

## Next Steps

- [Components](components.md) - See how components use these services
- [State Management](state-management.md) - Understand how services interact with Vuex
