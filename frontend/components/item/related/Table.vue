<template>
  <v-container v-if="items.length" class="mt-2">
    <div class="grey--text">
      {{ $t(references.label) }} : {{ totalResults }} {{ $t('common.items') }}
    </div>
    <item-related-ritem
      v-for="(value, index) in items"
      :key="'related-item-' + index"
      :table="table"
      :index="index + ((currentPage -1) * resultsPerPage)"
      :value="value"
      class="mt-2"
    />
    <div class="text-center">
      <v-pagination
        v-if="totalResults > resultsPerPage"
        v-model="currentPage"
        :length="Math.ceil(totalResults / resultsPerPage)"
        :total-visible="5"
        circle
        @input="changePage"
      />
    </div>
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
    references: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      items: [],
      currentPage: 1,
      totalResults: 0,
      resultsPerPage: 10
    }
  },
  async mounted () {
    if (this.itemId) {
      this.count()
      this.items = await this.$wikibase.getRelatedItems(this.itemId, this.references.refTables, this.currentPage, this.resultsPerPage)
    }
  },
  methods: {
    count () {
      this.$wikibase.runSparqlQuery(this.$wikibase.$query.getRelatedItemsCount(this.itemId, this.references.refTables), true)
        .then((results) => { this.totalResults = results[0] })
    },
    async changePage () {
      this.items = await this.$wikibase.getRelatedItems(this.itemId, this.references.refTables, this.currentPage, this.resultsPerPage)
    }
  }
}
</script>
