<template>
  <div v-if="!loading">
    <template v-if="!isUserLogged">
      <item-util-view-text-lang :value="valueToView" :tooltip="valueToView.item" />
    </template>
    <template v-else>
      <item-util-edit-select-field
        v-if="isItemWithCustomOptions"
        :label="label"
        :value="selectedOption"
        :save="editValue"
        :options="options"
        :delete="deleteValue"
        :mode="mode"
        @on-blur="$emit('on-blur', $event)"
        @new-value="$emit('new-value', $event)"
      />
      <item-util-edit-select-field
        v-else
        :label="label"
        :save="editValue"
        :options="options"
        :delete="deleteValue"
        :mode="mode"
        :filter="acceptAll"
        @update-options="options = $event"
        @input="oninput($event)"
        @on-blur="$emit('on-blur', $event)"
        @new-value="$emit('new-value', $event)"
      />
    </template>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      default: null
    },
    valueToView: {
      type: Object,
      default: null
    },
    save: {
      type: Function,
      default: null
    },
    delete: {
      type: Function,
      default: null
    },
    mode: {
      type: String,
      default: 'edit'
    }
  },
  data () {
    return {
      selectedOption: null,
      options: [],
      valueToView_: { ...this.valueToView },
      property_autocomplete: {},
      loading: true
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    isItemWithCustomOptions () {
      return this.property_autocomplete && this.valueToView.property in this.property_autocomplete
    },
    isEditable () {
      return this.mode === 'edit'
    }
  },
  async created () {
    if (this.isUserLogged) {
      this.property_autocomplete = await this.$wikibase.getControlledVocabularyConfig(this.$store.state.breadcrumb.table, this.$store.state.breadcrumb.database)
      this.setOptionsAutocomplete()
    }
    this.loading = false
  },
  methods: {
    editValue (newValue, oldValue) {
      return this.save(this.getWikiBaseEntityIdValue(newValue, oldValue))
    },
    deleteValue () {
      return this.delete()
    },
    getWikiBaseEntityIdValue (newValue, oldValue) {
      return {
        validation: {
          valid: true
        },
        values: {
          newValue: newValue.id,
          oldValue: oldValue.id
        }
      }
    },
    oninput (e) {
      if (e) { this.handleSearchChange(e) }
    },
    async handleSearchChange (value) {
      if (value) {
        const search = await this.$wikibase.searchEntityByName(value, this.$i18n.locale, this.$i18n.locale)
        if (search && search.length) { this.options = search }
      }
    },
    buildFullQuery (sparqlQuery) {
      return this.$wikibase.$query.addPrefixes(`
        SELECT ?item ?itemLabel ?itemDescription 
          (CONCAT(?itemLabel, IF(BOUND(?pbid), CONCAT(" [", ?pbid, "]"), ""), " (", ?qid, ")") AS ?extendedLabel) 
        WHERE {
          {
            ${sparqlQuery}
          }
          OPTIONAL { ?item wdt:P476 ?pbid }
          BIND(STRAFTER(STR(?item), "${this.$config.wikibaseBaseUrl}/entity/") AS ?qid)
          SERVICE wikibase:label { bd:serviceParam wikibase:language "${this.$i18n.locale},en". }
        }
      `)
    },
    getDefaultValue (currentValue, defaultValue) {
      if (currentValue) {
        return currentValue
      } else if (defaultValue) {
        this.$emit('new-value', defaultValue)
        return defaultValue
      } else {
        return null
      }
    },
    setOptionsAutocomplete () {
      if (this.isItemWithCustomOptions) {
        const autocomplete = this.property_autocomplete[this.valueToView.property]
        const fullSparqlQuery = this.buildFullQuery(autocomplete.query)
        this.$wikibase.runSparqlQuery(fullSparqlQuery, true)
          .then((results) => {
            Object.entries(results).forEach(
              ([_, result]) => {
                this.options.push({
                  id: result.item.value,
                  label: result.item.label
                })
              })
            this.selectedOption = this.getDefaultValue(this.valueToView.item, autocomplete.default)
          })
      } else {
        this.options = [{
          id: this.valueToView.item,
          label: this.valueToView.value
        }]
        this.selectedOption = this.getDefaultValue(this.valueToView.item, null)
      }
    },
    acceptAll (item, queryText, itemText) {
      // We accept all the items because they are already filtered
      return true
    }
  }
}
</script>
