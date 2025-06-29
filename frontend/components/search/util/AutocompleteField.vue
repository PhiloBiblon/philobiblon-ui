<template>
  <v-autocomplete
    v-bind="{ ...$attrs, ...commonAttrs }"
    :loading="loadingItems"
    :disabled="isDisabled"
    :no-data-text="checkNoDataText"
    :items="items"
    :search-input.sync="search"
    hide-select
    hide-no-data
    v-on="$listeners"
    @blur="validateSelection"
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
      items: [],
      loadingItems: false,
      search: null,
      searchTimeout: null
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
    search (val) {
      if (!val) {
        this.items = []
        return
      }
      if (this.value && val === this.value.text) {
        return
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
    // if (!this.items || this.items.length === 0) {
    //   if (this.value) {
    //     this.items.push({ text: this.value.label, value: this.value })
    //   }
    // }
  },
  methods: {
    fetchItems (query) {
      const sparqlQuery = this.$wikibase.$query.filterQuery(this.autocomplete.query, this.table, this.$i18n.locale)
      const body = `q=${encodeURIComponent(query)}&sparqlQuery=${encodeURIComponent(sparqlQuery)}`
      const options = {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
      fetch(`${this.$config.apiBaseUrl}/api/search`, options)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error from the server')
          }
          return response.json()
        })
        .then((data) => {
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
    validateSelection () {
      const match = this.items.find(item => item.text === this.search)
      if (!match) {
        this.$emit('reset-value')
      }
    }
  }
}
</script>
