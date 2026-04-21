<template>
  <div class="search-container" :class="{'welcome-container': isWelcome}">
    <v-autocomplete
      v-model:search="search"
      rounded
      :items="items"
      item-value="id"
      item-title="title"
      class="search-bar"
      :class="{welcome: isWelcome}"
      style="max-width: 450px;"
      :loading="loading"
      prepend-inner-icon="mdi-magnify"
      :placeholder="t('wiki.search.placeholder')"
      append-inner-icon="mdi-microphone"
      @update:model-value="onItemSelected"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

const items = ref([])
const search = ref('')
const loading = ref(false)

const isWelcome = computed(() => route.path.includes('Welcome'))

watch(search, (val) => {
  if (val) {
    searchItems(val)
  }
})

async function searchItems (query) {
  if (query.length < 2) {
    items.value = []
    return
  }

  loading.value = true

  try {
    const sparqlQuery = $wikibase.$query.allItemsQuery(query, locale.value)
    const res = await $wikibase.runSparqlQuery(sparqlQuery)
    items.value = customizeSearchData(res)
  } catch (error) {
     
    console.error('Error fetching items:', error)
  } finally {
    loading.value = false
  }
}

function customizeSearchData (res) {
  return res.map(item => ({
    id: item.pbid,
    title: item.label
  }))
}

function onItemSelected (id) {
  if (id) {
    router.push(localePath(`/item/${id}`))
  }
}
</script>

<style scoped>
.search-container {
  display: flex;
  background-color: white;
}

.search-container:not(.welcome-container) {
  justify-content: end;
  align-items: start;
}

.search-container.welcome-container {
  align-items: center;
  justify-content: center;
}

:deep(.search-bar .v-text-field__details) {
  display: none;
}

:deep(.search-bar:not(.welcome) .v-input__slot) {
  padding-top: unset!important;
  margin: unset;
}

.search-bar {
  width: 100%;
  padding-top: unset;
}

:deep(.v-application .v-autocomplete__content.v-menu__content) {
  width: 598px!important;
}

:deep(.v-autocomplete .v-input__control) {
  background-color: white !important;
  border: 1px solid #dcdcdc !important;
  border-radius: 24px !important;
  transition: border-color 0.3s, box-shadow 0.3s;
}

:deep(.v-autocomplete .v-input__append-inner),
:deep(.v-autocomplete .v-input__prepend-inner) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.v-autocomplete .v-input__append-inner .v-icon),
:deep(.v-autocomplete .v-input__prepend-inner .v-icon) {
  color: rgba(0, 0, 0, 0.54);
}

:deep(.v-autocomplete .v-input__control .v-input__slot) {
  padding-top: 10px;
  border-radius: 24px;
}

:deep(.v-autocomplete .v-input__control:hover),
:deep(.v-autocomplete .v-input__control:focus-within) {
  border-color: #4285f4 !important;
  box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28) !important;
}

:deep(.v-autocomplete .v-list-item__title) {
  color: black;
}
</style>
