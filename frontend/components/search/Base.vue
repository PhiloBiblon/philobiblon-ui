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
      :subject="searchedSubject"
      :database="activeDatabase"
      :show-results="showResults && !waitingResults"
      @on-sort-by-id="search"
      @on-sort-descending="search"
      @on-pagination="search"
      @go-to-item="goToItem"
    />
    <div v-if="waitingResults" class="spinner-container">
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

const { $wikibase } = useNuxtApp()
const { locale } = useI18n()
const { notifyError } = useNotifyError()
const router = useRouter()
const localePath = useLocalePath()
const breadcrumbStore = useBreadcrumbStore()
const queryStatusStore = useQueryStatusStore()

const form = ref(null)
const showResults = ref(false)
const waitingCount = ref(false)
const waitingItems = ref(false)
const sparqlQuery = ref(null)
const resultsPerPage = 50
const results = ref([])
const totalResults = ref(0)
const searchedSubject = ref(null)
const qs = ref(null)
let searchErrorShown = false

const waitingResults = computed(() => waitingItems.value || waitingCount.value)
const activeDatabase = computed(() => form.value?.input?.group?.value || 'ALL')

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
  searchErrorShown = false
  queryStatusStore.setForm(JSON.parse(JSON.stringify(form.value)))
  captureSearchedSubject()
  count()
  search()
}

// Capture the subject selected for the executed query so the results can link
// back to its subid item page (where the back pointers list every record with
// that heading). subid table stores the id under `item`; other tables under
// `target_item`.
function captureSearchedSubject () {
  const subjectValue = form.value?.input?.subject?.value
  const qid = subjectValue?.target_item || subjectValue?.item
  searchedSubject.value = qid ? { label: subjectValue.label, qid } : null
}

function count () {
  waitingCount.value = true
  $wikibase.runSparqlQuery($wikibase.$query.countQuery(props.table, form.value, locale.value), true)
    .then((res) => {
      const raw = res[0]
      const parsed = typeof raw === 'object' ? parseInt(raw?.count ?? '', 10) : parseInt(raw ?? '', 10)
      totalResults.value = Number.isNaN(parsed) ? 0 : parsed
      waitingCount.value = false
    })
    .catch((err) => {
      waitingCount.value = false
      if (!searchErrorShown) {
        searchErrorShown = true
        notifyError(err)
      } else {
        console.error(err)
      }
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
      if (!searchErrorShown) {
        searchErrorShown = true
        notifyError(err)
      } else {
        console.error(err)
      }
    })
}

function clearResults () {
  showResults.value = false
  waitingCount.value = false
  waitingItems.value = false
  searchedSubject.value = null
  queryStatusStore.setShowResults(showResults.value)
  queryStatusStore.setPage(1)
  queryStatusStore.setSortBy('name')
  queryStatusStore.setSortDescending(false)
}

function onDatabaseChange (_newDatabase) {
  // Database is now tracked in form.input.group.value
}

function goToItem (id) {
  router.push(
    localePath({
      path: '/item/' + id,
      query: {
        database: activeDatabase.value,
        table: props.table
      }
    })
  )
}
</script>

<style scoped>
.content {
  min-height: 820px;
}
.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>
