<template>
  <div class="content">
    <query-search
      ref="qs"
      :table="table"
      :form="form"
      :waiting-results="waitingResults"
      @on-search="countAndSearch"
      @back-search="clearResults"
      @clear-search="clearResults"
    />
    <query-results
      ref="qr"
      :sparql-query="sparqlQuery"
      :results="results"
      :total-results="totalResults"
      :results-per-page="resultsPerPage"
      :show-results="showResults"
      @on-sort-by-id="search"
      @on-sort-descending="search"
      @on-pagination="search"
    />
    <div v-if="waitingResults" class="text-center">
      <v-progress-circular
        size="50"
        width="5"
        indeterminate
        color="primary"
      />
    </div>
  </div>
</template>

<script>
export default {

  props: {
    table: {
      type: String,
      default: null
    },
    formDefinition: {
      type: Object,
      default: null
    },
    breadcrumbItems: {
      type: Array,
      default: null
    }
  },

  data () {
    return {
      form: null,
      showResults: false,
      waitingResults: false,
      sparqlQuery: null,
      resultsPerPage: 50,
      results: [],
      totalResults: 0
    }
  },

  created () {
    if (this.$store.state.queryStatus.currentTable !== this.table) {
      this.$store.commit('queryStatus/resetStatus', this.table)
    }
    const form = this.$store.state.queryStatus.form
    if (form) {
      this.form = form
    } else {
      this.form = this.formDefinition
    }
    if (this.$store.state.queryStatus.showResults === true) {
      this.countAndSearch()
    }
  },

  mounted () {
    this.$store.commit('breadcrumb/setItems', this.breadcrumbItems)
  },

  methods: {
    countAndSearch () {
      this.waitingResults = true
      this.$store.commit('queryStatus/setForm', JSON.parse(JSON.stringify(this.form)))
      this.count()
      this.search()
    },

    count () {
      this.$wikibase.runSparqlQuery(this.$wikibase.$query.countQuery(this.table, this.form), true)
        .then((results) => { this.totalResults = results[0] })
    },

    search () {
      this.waitingResults = true
      this.sparqlQuery = this.$wikibase.$query.itemsQuery(this.table, this.form, this.$i18n.locale, this.resultsPerPage)
      this.results = []
      this.$wikibase.runSparqlQuery(this.sparqlQuery)
        .then((results) => {
          Object.entries(results).forEach(
            ([key, result]) => this.results.push(result)
          )
          this.waitingResults = false
          this.showResults = true
        })
        .catch((err) => {
          this.waitingResults = false
          this.$refs.qs.back()
          this.$notification.error(err)
        })
    },

    clearResults () {
      this.showResults = false
      this.waitingResults = false
      this.$store.commit('queryStatus/setShowResults', this.showResults)
      this.$store.commit('queryStatus/setPage', 1)
      this.$store.commit('queryStatus/setSortBy', 'name')
      this.$store.commit('queryStatus/setSortDescending', false)
    }
  }
}
</script>
