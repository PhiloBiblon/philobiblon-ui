# Component Architecture

This document explains the component structure and patterns used in the PhiloBiblon UI frontend.

## Component Organization

```
components/
├── common/              # Reusable UI components
├── create/              # Item creation form components
├── item/                # Wikibase item display/edit components
│   ├── Base.vue         # Read-only item view
│   ├── Claims.vue       # Claims list
│   ├── Create.vue       # Item creation form (wrapper)
│   ├── Notes.vue        # Notes section
│   ├── claim/           # Claim/statement components
│   ├── qualifier/       # Qualifier components
│   ├── reference/       # Reference components
│   ├── related/         # Related items components
│   ├── util/            # Utility components (editable fields)
│   └── value/           # Value type components (URL, Date, Entity, etc.)
├── search/              # Search interface
│   ├── Base.vue
│   ├── Filters.vue      # Dynamic search form
│   ├── Results.vue      # Results table
│   └── Simple.vue       # Simple search input
├── LanguagesMenu.vue    # Language switcher
└── PhiloFooter.vue      # Footer
```

All components are **auto-imported** by Nuxt — no explicit `import` needed in `<script setup>`.

## Component Style — Script Setup

All components use `<script setup>` (Composition API). There is no `this` context. Vue lifecycle hooks, reactivity, and utilities are imported from `vue` or used via Nuxt auto-imports.

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({ value: String, table: String })
const emit = defineEmits(['update'])

const { t } = useI18n()
const { $wikibase } = useNuxtApp()
const authStore = useAuthStore()
const localValue = ref(props.value)

onMounted(async () => { ... })
</script>
```

## Key Components

### item/Base.vue — Item Display

Displays a Wikibase item in read-only (or edit) mode.

#### Data Loading

```javascript
const route = useRoute()
const entity = ref(null)

onMounted(async () => {
  entity.value = await $wikibase.getEntity(route.params.id, 'ca')
  orderedClaims.value = await $wikibase.getOrderedClaims(table, entity.value.claims)
})
```

### item/Create.vue — Item Creation

Handles creating new Wikibase items with automatic PBID generation and claim initialization.

#### Key Features

1. **Automatic PBID Generation** — queries for the last item in the table, increments, pre-fills P476
2. **Smart Default Values** — P131 (bibliography) auto-set based on database; P700 qualifier defaults to Q447226
3. **Validation** — label required, at least one claim required
4. **Creation Flow** — calls `wbEdit.entity.create` with OAuth credentials from `useAuthStore().requestConfig`

### item/claim/Create.vue — Claim Creation

Allows adding new claims to an item. Property selection is filtered by table type and existing claims.

The value input component is selected dynamically based on property datatype:

```javascript
const valueComponent = computed(() => {
  switch (selectedProperty.value?.datatype) {
    case 'wikibase-item': return 'ItemValueTypeEntity'
    case 'string':        return 'ItemValueTypeText'
    case 'time':          return 'ItemValueTypeDate'
    case 'url':           return 'ItemValueTypeUrl'
    default:              return 'ItemValueTypeText'
  }
})
```

### item/util/EditTextField.vue — Inline Editing

A reusable component for inline editing of text values. Switches between display and edit mode.

Props: `value`, `save` (async function), `delete` (function), `mode`

```vue
<ItemUtilEditTextField
  :value="currentValue"
  :save="async (newVal) => { await $wikibase.saveLabel(newVal) }"
  :delete="() => { ... }"
  mode="edit"
/>
```

### search/Filters.vue — Dynamic Search Form

Generates search forms dynamically from per-table JSON config. Persists form state in `useQueryStatusStore`.

### search/Results.vue — Search Results

Displays SPARQL query results in a paginated table. Pagination and sort state are persisted in `useQueryStatusStore`.

### LanguagesMenu.vue — Language Switcher

Switches the active i18n locale and persists the choice in the `language` cookie.

## Component Communication Patterns

### 1. Props Down, Events Up

```vue
<!-- Parent -->
<ItemClaimBase
  :claim="claim"
  :table="table"
  @claim-updated="handleUpdate"
/>

<!-- Child (script setup) -->
const props = defineProps({ claim: Object, table: String })
const emit = defineEmits(['claim-updated'])

function onSave(newValue) {
  emit('claim-updated', newValue)
}
```

### 2. Provide/Inject for Deep Hierarchies

```javascript
// Ancestor component
provide('table', table)
provide('database', database)

// Deep descendant
const table = inject('table')
const database = inject('database')
```

### 3. Pinia for Global State

```javascript
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()

// Reactive in template automatically
if (authStore.isLogged) { ... }
```

## Vuetify 4 Patterns

### Key API changes from Vuetify 2/3

- `v-model:search-input` (v2) → `v-model:search` (v4) on autocomplete
- `:item-text` / `:item-value` props (v2) → `:item-title` / `:item-value` (v4)
- `append` slot slot → `append-inner` for inside the input, `append` for outside
- `useDisplay()` composable for breakpoints:

```javascript
import { useDisplay } from 'vuetify'
const { mdAndDown } = useDisplay()
```

### Global Defaults

Component variant defaults are configured centrally in `nuxt.config.ts`:

```typescript
vuetify: {
  vuetifyOptions: {
    defaults: {
      VTextField: { variant: 'underlined', color: 'primary' },
      VAutocomplete: { variant: 'underlined', color: 'primary' },
      ...
    }
  }
}
```

This means individual `<v-text-field>` components don't need `:variant` or `:color` unless overriding the default.

### Styling

```vue
<style scoped>
/* Component-local styles */
.my-class { ... }

/* Reach into child component styles */
:deep(.v-list-item--active) { color: white; }
</style>
```

Vuetify utility classes work as before:

```vue
<v-row class="mt-4 mb-2">
  <v-col cols="12" md="6">...</v-col>
</v-row>
```

## Next Steps

- [Services](services.md) — How components use services
- [State Management](state-management.md) — How components use Pinia stores
