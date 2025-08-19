<template>
  <v-autocomplete
    v-bind="{ ...$attrs, ...commonAttrs }"
    v-model="internalValue"
    :loading="loadingItems"
    :disabled="isDisabled"
    :no-data-text="checkNoDataText"
    :items="items"
    :search-input.sync="search"
    :filter="removeDiacriticsFilter"
    hide-select
    v-on="$listeners"
  >
    <template v-for="(_, scopedSlotName) in $scopedSlots" #[scopedSlotName]="slotData">
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
    <template #message="{ message }">
      <v-tooltip max-width="40%" bottom open-delay="200">
        <template #activator="{ on }">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-on="on" v-html="message && message.length &lt; hintMaxWidth ? $sanitize(message) : $sanitize(message).substring(0, hintMaxWidth) + '...'" />
        </template>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="$sanitize(message)" />
      </v-tooltip>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Object],
      default: null
    },
    table: {
      type: String,
      required: true
    },
    autocomplete: {
      type: Object,
      default: null
    },
    hintMaxWidth: {
      type: Number,
      default: 50
    },
    disabled: {
      type: Boolean
    }
  },
  data () {
    return {
      internalValue: null,
      items: [],
      loadingItems: false,
      search: null,
      searchTimeout: null,
      allowFreeText: false
    }
  },
  computed: {
    commonAttrs () {
      return {
        dense: true
      }
    },
    checkNoDataText () {
      return this.loadingItems ? this.$t('common.loading') : this.$t('common.no_data')
    },
    isDisabled () {
      return this.disabled
    }
  },
  watch: {
    value (val) {
      if (this.allowFreeText) {
        const regex = new RegExp(`${this.$t('common.search.find_text')} "(.*?)"`)
        const match = val?.label?.match(regex)
        if (match && match[1]) {
          val.label = match[1]
          this.items[0].text = val.label
        }
      }
      this.internalValue = val
      this.search = val ? val?.label : ''
    },
    internalValue (val) {
      this.$emit('reset-value', val)
    },
    search (val) {
      if (!val) {
        this.items = []
        return
      }
      if (this.value && val === this.value.label) {
        return
      }
      if (val === '-') {
        val = ''
      }
      this.loadingItems = true
      clearTimeout(this.searchTimeout)
      // Delay to avoid continuous requests when user is writing
      this.searchTimeout = setTimeout(() => {
        this.fetchItems(val)
      }, 500)
    }
  },
  created () {
    if (this.value instanceof Object && Object.keys(this.value).length !== 0) {
      this.internalValue = this.value
      this.items = [{ text: this.value.label, value: this.value }]
    }
    this.allowFreeText = this.autocomplete.allowFreeText
  },
  methods: {
    fetchItems (query) {
      const sparqlQuery = this.$wikibase.$query.filterQuery(this.autocomplete.query, this.table, this.$i18n.locale)
      if (process.env.debug) {
        // eslint-disable-next-line no-console
        console.log(`run sparlql query:\n${sparqlQuery}`)
      }
      const body = `q=${encodeURIComponent(query)}&sparqlQuery=${encodeURIComponent(sparqlQuery)}`
      const options = {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
      fetch(`${this.$config.apiBaseUrl}/api/search`, options)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error from the cache server')
          }
          return response.json()
        })
        .then((data) => {
          if (this.allowFreeText) {
            const findTextLabel = `${this.$t('common.search.find_text')} "${query}"`
            data.unshift({ text: findTextLabel, value: { label: findTextLabel, textString: query } })
          }
          this.items = data
          this.loadingItems = false
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error loading items:', error)
          this.$notification.error(error)
          this.loadingItems = false
        })
    },
    removeDiacriticsFilter (item, queryText, itemText) {
      const normalize = str =>
        str
          .normalize('NFD')
          .replace(/[\u0300-\u036F]/g, '')
          .toLowerCase()
      return normalize(itemText || item).includes(normalize(queryText)) || queryText === '-'
    }
  }
}
</script>
