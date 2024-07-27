<template>
  <v-autocomplete
    v-bind="{ ...$attrs, ...commonAttrs }"
    :loading="loadingItems"
    :no-data-text="$t('common.no_data')"
    :items="items"
    :value-comparator="compareByLabel"
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
          <span v-on="on" v-html="message && message.length &lt; hintMaxWidth ? message : message.substring(0, hintMaxWidth) + '...'" />
        </template>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="message" />
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
    }
  },
  data () {
    return {
      items: [],
      loadingItems: false
    }
  },
  computed: {
    commonAttrs () {
      return {
        dense: true
      }
    }
  },
  created () {
    this.populateItemsAutocomplete()
  },
  methods: {
    populateItemsAutocomplete () {
      const resultFunction = (result) => { return { text: result.label, value: result } }
      if (this.autocomplete.query) {
        this.loadingItems = true
        this.$wikibase.runSparqlQuery(this.$wikibase.$query.filterQuery(this.autocomplete.query, this.table, this.$i18n.locale), false)
          .then((results) => {
            Object.entries(results).forEach(
              ([_, result]) => {
                this.items.push(resultFunction(result))
              }
            )
            this.loadingItems = false
          }
          )
      } else {
        // eslint-disable-next-line no-console
        console.error('No query defined for autocomplete')
      }
    },
    compareByLabel (selectedItem, item) {
      return selectedItem.label === item.label
    }
  }
}
</script>
