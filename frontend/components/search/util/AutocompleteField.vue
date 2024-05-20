<template>
  <v-autocomplete v-bind="{ ...$attrs, ...commonAttrs }" :no-data-text="$t('common.loading')" :items="items" v-on="$listeners">
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
      items: []
    }
  },
  computed: {
    commonAttrs () {
      return {
        dense: true
      }
    }
  },
  mounted () {
    this.populateItemsAutocomplete()
  },
  methods: {
    populateItemsAutocomplete () {
      const resultFunction = (result) => { return { text: result.label, value: { item: result.item, property: result.property } } }
      if (this.autocomplete.query) {
        this.$wikibase.runSparqlQuery(this.$wikibase.$query.filterQuery(this.autocomplete.query, this.table, this.$i18n.locale), true)
          .then((results) => {
            Object.entries(results).forEach(
              ([_, result]) => {
                this.items.push(resultFunction(result))
              }
            )
          }
          )
      } else {
        // eslint-disable-next-line no-console
        console.error('No query defined for autocomplete')
      }
    }
  }
}
</script>
