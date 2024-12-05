<template>
  <div>
    <template v-if="!isUserLogged">
      <item-util-view-text-lang :value="valueToView" :tooltip="valueToView.item" />
    </template>
    <template v-else>
      <item-util-edit-select-field
        v-if="isItemWithCustomOptions"
        :value="selectedOption"
        :save="editValue"
        :options="options"
        :delete="deleteValue"
        :can-delete="true"
      />
      <item-util-edit-select-field
        v-else
        :save="editValue"
        :options="options"
        :delete="deleteValue"
        :can-delete="true"
        @update-options="options = $event"
        @input="oninput($event)"
      />
    </template>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    valueToView: {
      type: Object,
      default: null
    },
    type: {
      type: String,
      required: true
    },
    save: {
      type: Function,
      required: true
    },
    delete: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      selectedOption: null,
      options: [],
      valueToView_: { ...this.valueToView },
      property_autocomplete: {
        P799: {
          sparqlQuery: `SELECT ?item ?itemLabel WHERE { VALUES ?item { wd:Q5 wd:Q14 wd:Q15 } SERVICE wikibase:label { bd:serviceParam wikibase:language "${this.$i18n.locale},en,es". } }`
        }
      }
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    isItemWithCustomOptions () {
      return this.valueToView.property in this.property_autocomplete
    }
  },
  created () {
    this.setOptionsAutocomplete()
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
    setOptionsAutocomplete () {
      if (this.isItemWithCustomOptions) {
        const autocomplete = this.property_autocomplete[this.valueToView.property]
        const sparqlQuery = this.$wikibase.$query.addPrefixes(autocomplete.sparqlQuery)
        this.$wikibase.runSparqlQuery(sparqlQuery, true)
          .then((results) => {
            Object.entries(results).forEach(
              ([_, result]) => {
                this.options.push({
                  id: result.item.value,
                  label: result.item.label
                })
              })
            this.selectedOption = this.valueToView.value
          })
      } else {
        this.options = [{
          id: this.valueToView.item,
          label: this.valueToView.value
        }]
        this.selectedOption = this.valueToView.item
      }
    }
  }
}
</script>
