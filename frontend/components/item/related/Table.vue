<template>
  <v-container v-if="items.length" class="mt-2">
    <div class="text-grey">
      {{ t(references.label) }} : {{ totalResults }} {{ t('common.items') }}
    </div>
    <div v-if="references.sortable" class="d-flex align-center mt-1 mb-1">
      <span class="text-caption text-grey mr-2">{{ t('item.related.sort_by') }}</span>
      <v-select
        v-model="sortBy"
        :items="sortOptions"
        density="compact"
        variant="underlined"
        hide-details
        style="max-width: 130px"
        @update:model-value="onSortChange"
      />
      <v-btn
        icon
        size="small"
        variant="text"
        class="ml-1"
        @click="toggleSortDir"
      >
        <v-icon>{{ sortIcon }}</v-icon>
      </v-btn>
    </div>
    <item-related-ritem
      v-for="(value, index) in items"
      :key="`related-item-${index}-${value.item}`"
      :table="table"
      :item-id="itemId"
      :index="index + ((currentPage - 1) * resultsPerPage)"
      :value="value"
      class="mt-2"
    />
    <div class="text-center">
      <v-pagination
        v-if="totalResults > resultsPerPage"
        v-model="currentPage"
        :length="Math.ceil(totalResults / resultsPerPage)"
        :total-visible="3"
        density="compact"
        @update:model-value="changePage"
      />
    </div>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  itemId: { type: String, default: null },
  table: { type: String, required: true },
  references: { type: Object, default: null }
})

const emit = defineEmits(['has-related-table'])

const { $wikibase } = useNuxtApp()
const { t, locale } = useI18n()

const items = ref([])
const currentPage = ref(1)
const totalResults = ref(0)
const resultsPerPage = 10
const sortBy = ref(props.references.sortable ? 'date' : 'id')
const sortDesc = ref(!!props.references.sortable)

const sortOptions = computed(() => [
  { title: t('item.related.sort_option.date'), value: 'date' },
  { title: t('item.related.sort_option.name'), value: 'name' },
  { title: t('item.related.sort_option.id'), value: 'id' }
])

const sortIcon = computed(() => {
  if (sortBy.value === 'date') return sortDesc.value ? 'mdi-sort-calendar-descending' : 'mdi-sort-calendar-ascending'
  if (sortBy.value === 'name') return sortDesc.value ? 'mdi-sort-alphabetical-descending' : 'mdi-sort-alphabetical-ascending'
  return sortDesc.value ? 'mdi-sort-numeric-descending' : 'mdi-sort-numeric-ascending'
})

onMounted(async () => {
  if (props.itemId) {
    count()
    items.value = await fetchItems()
    emit('has-related-table', items.value.length > 0)
  }
})

function count () {
  $wikibase.runSparqlQuery($wikibase.$query.getRelatedItemsCount(props.itemId, props.references.refTables), true)
    .then((res) => {
      const raw = res.length === 0 ? null : res[0]
      const parsed = typeof raw === 'object' ? parseInt(raw?.total ?? '', 10) : parseInt(raw ?? '', 10)
      totalResults.value = Number.isNaN(parsed) ? 0 : parsed
    })
    .catch((error) => { console.error('Error loading related items count:', error) })
}

function fetchItems () {
  const dir = sortDesc.value ? 'desc' : 'asc'
  return $wikibase.getRelatedItems(
    props.itemId, props.references.refTables, currentPage.value, resultsPerPage,
    sortBy.value, dir, locale.value
  )
}

async function changePage () {
  items.value = await fetchItems()
}

async function onSortChange () {
  currentPage.value = 1
  items.value = await fetchItems()
}

async function toggleSortDir () {
  sortDesc.value = !sortDesc.value
  currentPage.value = 1
  items.value = await fetchItems()
}
</script>
