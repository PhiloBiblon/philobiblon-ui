<template>
  <v-container v-if="items.length" class="mt-2">
    <div class="grey--text">
      {{ $t(`item.related.${table}.${relatedTable}.${property}.header`) }} ( {{ $t('item.related.by') }} <item-util-view-text-lang :value="relatedPropertyLabel" />) : {{ items.length }}
    </div>
    <item-related-ritem
      v-for="(value, index) in items"
      :key="'related-item-' + index"
      :table="table"
      :related-table="relatedTable"
      :index="index"
      :value="value"
      class="mt-2"
    />
  </v-container>
</template>

<script>
export default {
  props: {
    itemId: {
      type: String,
      default: null
    },
    table: {
      type: String,
      default: null
    },
    relatedTable: {
      type: String,
      default: null
    },
    property: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      items: [],
      relatedPropertyLabel: {}
    }
  },
  async mounted () {
    if (this.itemId) {
      this.items = await this.$wikibase.getRelatedItems(this.itemId, this.relatedTable, this.property)
      if (this.items && this.items.length > 0) {
        this.relatedPropertyLabel = await this.$wikibase.getEntityLabel(this.property, this.$i18n.locale)
      }
    }
  }
}
</script>
