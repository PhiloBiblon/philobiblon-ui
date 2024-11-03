<template>
  <v-container class="mt-2">
    <div class="grey--text">
      {{ $t(`item.related.${table}.${relatedTable}.count`) }}: {{ items.length }}
    </div>
    <item-related-value
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
    table: {
      type: String,
      default: null
    },
    relatedTable: {
      type: String,
      default: null
    },
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>
