<template>
  <div>
    <v-tabs
      v-if="showResults"
      v-model="currentTab"
      height="20"
    >
      <v-tab value="results">
        {{ t('search.results.results') }} ({{ totalResults }})
      </v-tab>
    </v-tabs>
    <v-window
      v-if="showResults"
      v-model="currentTab"
    >
      <v-window-item value="results">
        <v-container v-if="totalResults == 0">
          <span>{{ t('search.results.not_found') }}</span>
        </v-container>
        <v-container v-if="totalResults > 0" class="container-max">
          <v-row dense>
            <v-col class="order-last order-sm-first" cols="10">
              <v-list v-model:selected="selectedItem" color="primary">
                <v-list-item
                  v-for="(result, index) in results"
                  :key="'r-' + index"
                  :value="result.item"
                  @click="goToItem(result.item)"
                >
                  <v-list-item-title>
                    {{ result.label }}&nbsp;&nbsp;&nbsp;<span class="text-caption">{{ result.pbids }}</span>
                  </v-list-item-title>
                  <v-list-item-subtitle class="my-item-subtitle">
                    {{ result.desc }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col>
              <v-container class="container-max">
                <v-row justify="end" dense>
                  <v-col class="text-right text-caption">
                    <span>{{ t('search.results.sort_by') }}</span>
                  </v-col>
                  <v-col cols="auto" class="sort-select-field">
                    <v-select
                      v-model="sortBy"
                      :items="sortItems"
                      item-title="text"
                      item-value="value"
                      class="text-body-2"
                      density="compact"
                      @update:model-value="changeSortByID"
                    />
                  </v-col>
                  <v-col cols="auto">
                    <v-icon
                      v-if="isSortByName && !isSortDescending"
                      density="compact"
                      @click="changeSortDescending"
                    >
                      mdi-sort-alphabetical-ascending
                    </v-icon>
                    <v-icon
                      v-if="isSortByName && isSortDescending"
                      density="compact"
                      @click="changeSortDescending"
                    >
                      mdi-sort-alphabetical-descending
                    </v-icon>
                    <v-icon
                      v-if="isSortByID && !isSortDescending"
                      density="compact"
                      @click="changeSortDescending"
                    >
                      mdi-sort-numeric-ascending
                    </v-icon>
                    <v-icon
                      v-if="isSortByID && isSortDescending"
                      density="compact"
                      @click="changeSortDescending"
                    >
                      mdi-sort-numeric-descending
                    </v-icon>
                    <v-icon
                      v-if="isSortByDate && !isSortDescending"
                      density="compact"
                      @click="changeSortDescending"
                    >
                      mdi-sort-calendar-ascending
                    </v-icon>
                    <v-icon
                      v-if="isSortByDate && isSortDescending"
                      density="compact"
                      @click="changeSortDescending"
                    >
                      mdi-sort-calendar-descending
                    </v-icon>
                  </v-col>
                </v-row>
                <v-row justify="end" dense>
                  <v-col class="text-right text-caption">
                    <a :href="config.sparqlBaseUrl + '/#' + encodeURI(sparqlQuery)" target="_blank">SPARQL</a>
                  </v-col>
                </v-row>
              </v-container>
            </v-col>
          </v-row>
        </v-container>
        <div class="text-center">
          <v-pagination
            v-if="showResults && totalResults > resultsPerPage"
            v-model="currentPage"
            :length="Math.ceil(totalResults / resultsPerPage)"
            :total-visible="5"
            @update:model-value="changePage"
          />
        </div>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { computed, onBeforeUpdate, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQueryStatusStore } from '~/stores/queryStatus'

defineProps({
  sparqlQuery: { type: String, default: null },
  results: { type: Array, default: null },
  totalResults: { type: Number, default: 0 },
  resultsPerPage: { type: Number, default: 0 },
  showResults: { type: Boolean, default: false }
})

const emit = defineEmits(['on-sort-by-id', 'on-sort-descending', 'on-pagination', 'go-to-item'])

const { t } = useI18n()
const config = useRuntimeConfig().public
const queryStatusStore = useQueryStatusStore()

const currentTab = ref('results')
const selectedItem = ref([])
const sortItems = [
  { text: t('search.results.sort_option.id'), value: 'id' },
  { text: t('search.results.sort_option.name'), value: 'name' },
  { text: t('search.results.sort_option.date'), value: 'date' }
]
const sortBy = ref(null)
const currentPage = ref(null)

const isSortDescending = computed(() => queryStatusStore.isSortDescending)
const isSortByID = computed(() => sortBy.value === 'id')
const isSortByName = computed(() => sortBy.value === 'name')
const isSortByDate = computed(() => sortBy.value === 'date')

onBeforeUpdate(() => {
  sortBy.value = queryStatusStore.sortBy
  currentPage.value = queryStatusStore.currentPage
})

function changePage (val) {
  queryStatusStore.setPage(val)
  emit('on-pagination', val)
}

function changeSortByID () {
  queryStatusStore.setSortBy(sortBy.value)
  emit('on-sort-by-id', isSortByID.value)
}

function changeSortDescending () {
  queryStatusStore.setSortDescending(!isSortDescending.value)
  emit('on-sort-descending', !isSortDescending.value)
}

function goToItem (id) {
  emit('go-to-item', id)
}
</script>

<style scoped>
.container-max {
  max-width: 100% !important;
  padding: 2px 0 0 0;
}
.sort-select-field {
  padding: 4px 0 0 0;
  width: 75px;
}
</style>
