<template>
  <div class="content">
    <search-filters
      ref="qs"
      :table="table"
      :form="form"
      :waiting-results="waitingResults"
      @on-search="countAndSearch"
      @back-search="clearResults"
      @clear-search="clearResults"
    />
    <search-results
      ref="qr"
      :sparql-query="sparqlQuery"
      :results="results"
      :total-results="totalResults"
      :results-per-page="resultsPerPage"
      :show-results="showResults && !waitingResults"
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
      waitingCount: false,
      waitingItems: false,
      sparqlQuery: null,
      resultsPerPage: 50,
      results: [],
      totalResults: 0
    }
  },

  computed: {
    waitingResults () {
      return this.waitingItems || this.waitingCount
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
    this.$store.commit('breadcrumb/setClass', 'large-font-breadcrumb')
  },

  destroyed () {
    this.$store.commit('breadcrumb/setClass', '')
  },

  methods: {
    countAndSearch () {
      this.$store.commit('queryStatus/setForm', JSON.parse(JSON.stringify(this.form)))
      this.count()
      this.search()
    },

    count () {
      this.waitingCount = true
      this.$wikibase.runSparqlQuery(this.$wikibase.$query.countQuery(this.table, this.form, this.$i18n.locale), true)
        .then((results) => {
          this.totalResults = results[0]
          this.waitingCount = false
        })
        .catch((err) => {
          this.waitingCount = false
          this.$notification.error(err)
        })
    },

    search () {
      this.waitingItems = true
      this.sparqlQuery = this.$wikibase.$query.itemsQuery(this.table, this.form, this.$i18n.locale, this.resultsPerPage)
      this.results = []
      this.$wikibase.runSparqlQuery(this.sparqlQuery)
        .then((results) => {
          Object.entries(results).forEach(
            ([key, result]) => this.results.push(result)
          )
          this.waitingItems = false
          this.showResults = true
        })
        .catch((err) => {
          this.waitingItems = false
          this.$refs.qs.back()
          this.$notification.error(err)
        })
    },

    clearResults () {
      this.showResults = false
      this.waitingCount = false
      this.waitingItems = false
      this.$store.commit('queryStatus/setShowResults', this.showResults)
      this.$store.commit('queryStatus/setPage', 1)
      this.$store.commit('queryStatus/setSortBy', 'name')
      this.$store.commit('queryStatus/setSortDescending', false)
    }
  }
}
</script>
