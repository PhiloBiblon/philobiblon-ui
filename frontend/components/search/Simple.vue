<template>
  <div class="search-container" :class="{'welcome-container': isWelcome}">
    <v-autocomplete
      v-model:search="search"
      rounded
      variant="solo"
      density="compact"
      :items="items"
      item-value="id"
      item-title="title"
      class="search-bar"
      :class="{welcome: isWelcome}"
      style="max-width: 350px;"
      :loading="loading"
      color="primary"
      prepend-inner-icon="mdi-magnify"
      :placeholder="t('wiki.search.placeholder')"
      hide-no-data
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

.search-bar {
  width: 100%;
}

:deep(.search-bar .v-input__details) {
  display: none;
}

:deep(.search-bar .v-field) {
  border: 1px solid #dcdcdc;
  transition: border-color 0.3s, box-shadow 0.3s;
}

:deep(.search-bar .v-field:hover),
:deep(.search-bar .v-field--focused) {
  border-color: #b71c1c;
  box-shadow: 0 1px 6px rgba(183, 28, 28, 0.28);
}

:deep(.search-bar .v-field--focused .v-icon) {
  color: #b71c1c;
}

:deep(.search-bar .v-field__overlay) {
  display: none;
}
</style>
