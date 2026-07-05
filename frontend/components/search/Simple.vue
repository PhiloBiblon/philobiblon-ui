<template>
  <div class="search-container" :class="{'welcome-container': isWelcome}">
    <v-autocomplete
      v-model:search="search"
      rounded
      variant="solo"
      density="compact"
      :items="displayItems"
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
      :custom-filter="() => true"
      :item-props="item => item.desc ? { subtitle: item.desc } : {}"
      @update:model-value="onItemSelected"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { GLOBAL_SEARCH_VARS } from '~/service/query.templates'

const { $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const { notifyError } = useNotifyError()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

const DEBOUNCE_MS = 300

const items = ref([])
const search = ref('')
const loading = ref(false)
const indexLoading = ref(false)
const debouncing = ref(false)
let debounceTimer = null
let lastRequestId = 0

const LABEL_MAX_DISPLAY = 80
const DESC_MAX_DISPLAY = 100

const isWelcome = computed(() => route.path.includes('Welcome'))

const displayItems = computed(() => {
  if (!search.value || search.value.length < 2 || loading.value || debouncing.value) {
    return []
  }
  if (items.value.length === 0) {
    const msg = indexLoading.value ? t('wiki.search.index_loading') : t('wiki.search.no_results')
    return [{ id: null, title: msg, disabled: true }]
  }
  return items.value
})

watch(search, (val) => {
  clearTimeout(debounceTimer)
  if (!val) {
    debouncing.value = false
    return
  }
  debouncing.value = true
  debounceTimer = setTimeout(() => searchItems(val), DEBOUNCE_MS)
})

async function searchItems (query) {
  debouncing.value = false
  if (query.length < 2) {
    items.value = []
    indexLoading.value = false
    return
  }

  const requestId = ++lastRequestId
  loading.value = true

  try {
    const res = await $wikibase.cachedSearch(
      $wikibase.$query.globalSearchQuery(locale.value),
      query,
      { searchVars: GLOBAL_SEARCH_VARS, hint: `global.${locale.value}`, limit: 20 }
    )
    if (requestId !== lastRequestId) return
    indexLoading.value = res.indexLoading
    items.value = res.indexLoading ? [] : customizeSearchData(res.results)
  } catch (error) {
    if (requestId === lastRequestId) notifyError(error)
  } finally {
    if (requestId === lastRequestId) loading.value = false
  }
}

function customizeSearchData (res) {
  return res.map(item => ({
    id: item.value.pbid,
    title: item.text.length > LABEL_MAX_DISPLAY
      ? item.text.substring(0, LABEL_MAX_DISPLAY) + '…'
      : item.text,
    desc: item.value.desc
      ? (item.value.desc.length > DESC_MAX_DISPLAY ? item.value.desc.substring(0, DESC_MAX_DISPLAY) + '…' : item.value.desc)
      : null
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

:deep(.v-autocomplete__menu-icon) {
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

:deep(.item-subtitle) {
  font-weight: normal;
  font-size: 0.8rem;
  color: #666;
}
</style>
