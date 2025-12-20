# Component Architecture

This document explains the component structure and patterns used in the PhiloBiblon UI frontend.

## Component Organization

```
components/
├── common/              # Reusable UI components
│   ├── Loader.vue      # Loading spinner
│   └── ErrorMessage.vue # Error display
├── item/               # Wikibase item components
│   ├── Base.vue        # Read-only item view
│   ├── Create.vue      # Item creation form
│   ├── claim/          # Claim/statement components
│   │   ├── Base.vue    # Claim display
│   │   ├── Create.vue  # Claim creation
│   │   ├── AddValue.vue # Add value to existing claim
│   │   └── Values.vue  # Display claim values
│   ├── qualifier/      # Qualifier components
│   │   └── Create.vue  # Qualifier creation
│   ├── reference/      # Reference components
│   │   ├── Base.vue    # Reference display
│   │   └── List.vue    # Reference list
│   ├── util/           # Utility components
│   │   ├── EditTextField.vue    # Editable text field
│   │   ├── EditSelectField.vue  # Editable dropdown
│   │   └── EditDateField.vue    # Editable date picker
│   └── value/          # Value type components
│       └── type/
│           ├── Url.vue         # URL value
│           ├── Date.vue        # Date value
│           ├── Entity.vue      # Wikibase item value
│           └── Text.vue        # String value
└── search/             # Search interface
    └── Filters.vue     # Dynamic search form
```

## Key Components

### item/Create.vue - Item Creation

The most complex component in the application. Handles creating new Wikibase items with automatic PBID generation and claim initialization.

#### Key Features

1. **Automatic PBID Generation**
   - Queries for the last item in the table
   - Increments the number
   - Pre-fills P476 (PBID) claim

```javascript
async mounted() {
  const lastItem = await this.$wikibase.getTableLastItem(this.database, this.table)
  const { num } = this.$wikibase.parsePBID(lastItem.pbid)
  const newNum = parseInt(num) + 1
  const newPBID = `${this.database} ${this.table} ${newNum}`
  
  // Create initial claims with PBID
  this.initialClaims = await this.generateInitialClaims(newPBID)
}
```

2. **Smart Default Values**
   - P131 (bibliography) automatically set based on database
   - P700 qualifier set to Q447226 (PhiloBiblon object)

```javascript
if (entity.id === 'P131') {
  const bibliographyMap = {
    BETA: 'Q254471',
    BITECA: 'Q256810',
    BITAGAP: 'Q256809'
  }
  const bibliographyId = bibliographyMap[this.database]
  
  const qualifiers = [{
    property: 'P700',
    datavalue: { value: { id: 'Q447226' } }
  }]
  
  claim = this.buildClaim(entity, qualifiers, { id: bibliographyId })
}
```

3. **Validation**
   - Label required
   - At least one claim required
   - PBID must be unique

```javascript
getCreateDisabledReason() {
  if (!this.label) {
    return this.$t('item.create.button.disabled.no_label')
  }
  if (this.claims.length === 0) {
    return this.$t('item.create.button.disabled.no_claims')
  }
  return null
}
```

4. **Creation Flow**

```javascript
async create() {
  const newItem = {
    labels: { ca: this.label },
    descriptions: { ca: this.description },
    claims: this.formatClaimsForWikibase(this.claims)
  }
  
  const result = await this.wbEdit.entity.create({
    type: 'item',
    ...newItem,
    ...this.$store.getters['auth/getRequestConfig']
  })
  
  this.$notification.success('Item created!')
  this.$router.push(`/item/${result.entity.id}`)
}
```

### item/Base.vue - Item Display

Displays a Wikibase item in read-only mode.

#### Structure

```vue
<template>
  <div>
    <h1>{{ label }}</h1>
    <p>{{ description }}</p>
    
    <!-- Claims -->
    <item-claim-base
      v-for="claim in orderedClaims"
      :key="claim.property"
      :claim="claim"
      :table="table"
    />
    
    <!-- References -->
    <item-reference-list :references="references" />
  </div>
</template>
```

#### Data Loading

```javascript
async mounted() {
  const entity = await this.$wikibase.getEntity(this.$route.params.id, 'ca')
  this.label = entity.labels.ca?.value
  this.description = entity.descriptions.ca?.value
  
  // Order claims according to UI config
  this.orderedClaims = await this.$wikibase.getOrderedClaims(
    this.table,
    entity.claims
  )
}
```

### item/claim/Create.vue - Claim Creation

Allows adding new claims to an item.

#### Property Selection

```vue
<v-autocomplete
  v-model="selectedProperty"
  :items="availableProperties"
  item-text="label"
  item-value="id"
  label="Select property"
/>
```

Properties are filtered based on:
1. Table type (from UI config)
2. Already existing claims (to avoid duplicates for single-value properties)

#### Value Input

The value input component changes based on property datatype:

```vue
<component
  :is="valueComponent"
  v-model="value"
  :property="selectedProperty"
/>
```

```javascript
computed: {
  valueComponent() {
    switch (this.selectedProperty.datatype) {
      case 'wikibase-item':
        return 'value-type-entity'
      case 'string':
        return 'value-type-text'
      case 'time':
        return 'value-type-date'
      case 'url':
        return 'value-type-url'
      default:
        return 'value-type-text'
    }
  }
}
```

### item/util/EditTextField.vue - Editable Field

A reusable component for inline editing of text values.

#### States

1. **Display Mode**: Shows value as plain text
2. **Edit Mode**: Shows input field with save/cancel/delete buttons

```vue
<template>
  <v-text-field
    v-if="focussed"
    v-model="currentText"
    @blur="blur"
    @focus="focus"
  >
    <template #append>
      <v-btn icon @click.stop="edit">
        <v-icon>mdi-check</v-icon>
      </v-btn>
      <v-btn icon @click.stop="restore">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-btn v-if="isRemovable" icon @click.stop="deleteValue">
        <v-icon>mdi-trash-can</v-icon>
      </v-btn>
    </template>
  </v-text-field>
  <span v-else @click="focus">{{ currentText }}</span>
</template>
```

#### Props

- `value`: Current value
- `save`: Function to call on save
- `delete`: Function to call on delete
- `mode`: 'edit' or 'view'

#### Event Handling

```javascript
methods: {
  async edit() {
    if (this.currentText !== this.consolidatedText) {
      await this.save(this.currentText, this.consolidatedText)
      this.consolidatedText = this.currentText
      this.$notification.success('Saved!')
    }
  },
  
  restore() {
    this.currentText = this.consolidatedText
    this.focussed = false
  },
  
  blur() {
    this.focussed = false
    this.restore()  // Revert changes if not saved
  }
}
```

### item/value/type/Url.vue - URL Value

Handles URL values with special validation for email addresses.

#### Email Detection

```javascript
methods: {
  isURL(str) {
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
    const emailRegex = /^mailto:[^\s]+@[^\s]+\.[^\s]+$/i
    return urlRegex.test(str) || emailRegex.test(str)
  },
  
  getUrlValue(newValue, oldValue) {
    const valid = this.isURL(newValue)
    const message = valid ? '' : this.$i18n.t('item.messages.invalid_url')
    
    return {
      validation: { valid, message },
      values: { newValue, oldValue }
    }
  }
}
```

### search/Filters.vue - Dynamic Search Form

Generates search forms dynamically based on table type and database.

#### Form Generation

```javascript
async mounted() {
  const formConfig = await import(`~/static/search/${this.table}.json`)
  this.formFields = formConfig.fields
  
  // Load saved form state
  const savedForm = this.$store.state.queryStatus.form
  if (savedForm) {
    this.form = savedForm
  }
}
```

#### Field Types

Different input types based on field configuration:

```vue
<template v-for="field in formFields">
  <!-- Text input -->
  <v-text-field
    v-if="field.type === 'text'"
    v-model="form[field.name]"
    :label="field.label"
  />
  
  <!-- Autocomplete (entity search) -->
  <v-autocomplete
    v-else-if="field.type === 'entity'"
    v-model="form[field.name]"
    :items="getAutocompleteOptions(field)"
    :search-input.sync="search[field.name]"
    @update:search-input="searchEntity(field, $event)"
  />
  
  <!-- Date range -->
  <v-row v-else-if="field.type === 'daterange'">
    <v-col>
      <v-text-field
        v-model="form[field.name].begin"
        type="number"
        label="From"
      />
    </v-col>
    <v-col>
      <v-text-field
        v-model="form[field.name].end"
        type="number"
        label="To"
      />
    </v-col>
  </v-row>
</template>
```

#### Search Execution

```javascript
async performSearch() {
  // Save form state
  this.$store.commit('queryStatus/setForm', this.form)
  
  // Generate SPARQL query
  const query = this.$wikibase.$query.generateSearchQuery(
    this.table,
    this.database,
    this.form
  )
  
  // Execute query
  const results = await this.$wikibase.runSparqlQuery(query, true, true)
  
  this.$emit('results', results)
  this.$store.commit('queryStatus/setShowResults', true)
}
```

## Component Communication Patterns

### 1. Props Down, Events Up

```vue
<!-- Parent -->
<child-component
  :value="parentValue"
  @update="handleUpdate"
/>

<!-- Child -->
<script>
export default {
  props: ['value'],
  methods: {
    onChange(newValue) {
      this.$emit('update', newValue)
    }
  }
}
</script>
```

### 2. Provide/Inject for Deep Hierarchies

```javascript
// Parent (item/Create.vue)
provide() {
  return {
    table: this.table,
    database: this.database
  }
}

// Deep child
inject: ['table', 'database']
```

### 3. Vuex for Global State

```javascript
// Any component
computed: {
  isLogged() {
    return this.$store.state.auth.isLogged
  }
}
```

## Styling Patterns

### Scoped Styles

```vue
<style scoped>
.component-specific-class {
  /* Only applies to this component */
}
</style>
```

### Vuetify Utility Classes

```vue
<v-row class="mt-4 mb-2">
  <v-col cols="12" md="6">
    <!-- Responsive grid -->
  </v-col>
</v-row>
```

### Dynamic Classes

```vue
<div :class="{ 'error-state': hasError, 'success-state': isValid }">
```

## Testing Considerations

### Component Testing

```javascript
import { mount } from '@vue/test-utils'
import EditTextField from '~/components/item/util/EditTextField.vue'

describe('EditTextField', () => {
  it('calls save function on edit', async () => {
    const saveMock = jest.fn()
    const wrapper = mount(EditTextField, {
      propsData: {
        value: 'initial',
        save: saveMock
      }
    })
    
    await wrapper.find('input').setValue('new value')
    await wrapper.find('[data-test="save-btn"]').trigger('click')
    
    expect(saveMock).toHaveBeenCalledWith('new value', 'initial')
  })
})
```

## Next Steps

- [Services](services.md) - Learn how components interact with services
- [State Management](state-management.md) - Understand Vuex integration
