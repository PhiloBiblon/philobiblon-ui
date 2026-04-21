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
      @database-change="onDatabaseChange"
    />
    <search-results
      ref="qr"
      :table="table"
      :sparql-query="sparqlQuery"
      :results="results"
      :total-results="totalResults"
      :results-per-page="resultsPerPage"
      :show-results="showResults && !waitingResults"
      @on-sort-by-id="search"
      @on-sort-descending="search"
      @on-pagination="search"
      @go-to-item="goToItem"
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

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBreadcrumbStore } from '~/stores/breadcrumb'
import { useQueryStatusStore } from '~/stores/queryStatus'

const props = defineProps({
  table: { type: String, default: null },
  formDefinition: { type: Object, default: null },
  breadcrumbItems: { type: Array, default: null }
})

const { $notification, $wikibase } = useNuxtApp()
const { locale } = useI18n()
const router = useRouter()
const localePath = useLocalePath()
const breadcrumbStore = useBreadcrumbStore()
const queryStatusStore = useQueryStatusStore()

const database = ref(null)
const form = ref(null)
const showResults = ref(false)
const waitingCount = ref(false)
const waitingItems = ref(false)
const sparqlQuery = ref(null)
const resultsPerPage = 50
const results = ref([])
const totalResults = ref(0)
const qs = ref(null)

const waitingResults = computed(() => waitingItems.value || waitingCount.value)

if (queryStatusStore.currentTable !== props.table) {
  queryStatusStore.resetStatus(props.table)
}
const storedForm = queryStatusStore.form
if (storedForm) {
  form.value = storedForm
} else {
  form.value = props.formDefinition
}
if (queryStatusStore.showResults === true) {
  countAndSearch()
}

onMounted(() => {
  breadcrumbStore.setItems(props.breadcrumbItems)
  breadcrumbStore.setClass('large-font-breadcrumb')
})

onBeforeUnmount(() => {
  breadcrumbStore.setClass('')
})

function countAndSearch () {
  queryStatusStore.setForm(JSON.parse(JSON.stringify(form.value)))
  count()
  search()
}

function count () {
  waitingCount.value = true
  $wikibase.runSparqlQuery($wikibase.$query.countQuery(props.table, form.value, locale.value), true)
    .then((res) => {
      totalResults.value = res[0]
      waitingCount.value = false
    })
    .catch((err) => {
      waitingCount.value = false
      $notification.error(err)
    })
}

function search () {
  waitingItems.value = true
  sparqlQuery.value = $wikibase.$query.itemsQuery(props.table, form.value, locale.value, resultsPerPage)
  results.value = []
  $wikibase.runSparqlQuery(sparqlQuery.value)
    .then((res) => {
      Object.entries(res).forEach(
        ([, result]) => results.value.push(result)
      )
      waitingItems.value = false
      showResults.value = true
    })
    .catch((err) => {
      waitingItems.value = false
      qs.value?.back()
      $notification.error(err)
    })
}

function clearResults () {
  showResults.value = false
  waitingCount.value = false
  waitingItems.value = false
  queryStatusStore.setShowResults(showResults.value)
  queryStatusStore.setPage(1)
  queryStatusStore.setSortBy('name')
  queryStatusStore.setSortDescending(false)
}

function onDatabaseChange (newDatabase) {
  database.value = newDatabase
}

function goToItem (id) {
  router.push(
    localePath({
      path: '/item/' + id,
      query: {
        database: database.value,
        table: props.table
      }
    })
  )
}
</script>
