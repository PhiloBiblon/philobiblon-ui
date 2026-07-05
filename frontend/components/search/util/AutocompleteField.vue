<template>
  <v-autocomplete
    ref="autocompleteRef"
    v-model="internalValue"
    v-model:search="search"
    density="compact"
    v-bind="$attrs"
    :loading="loadingItems"
    :disabled="isDisabled"
    :no-data-text="checkNoDataText"
    :items="items"
    no-filter
    item-title="text"
    item-value="value"
    hide-select
    :menu-props="menuProps"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData || {}" />
    </template>
    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps" density="compact" :lines="item.value?.desc ? 'two' : 'one'">
        <template #title>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span class="ac-item-title" v-html="$sanitize(item.text)" />
        </template>
        <template #subtitle>
          <span class="my-item-subtitle">{{ truncateDesc(item.value?.desc) }}</span>
        </template>
      </v-list-item>
    </template>
    <template #message="{ message }">
      <v-tooltip content-class="hint-tooltip" location="bottom" open-delay="200">
        <template #activator="{ props: tooltipProps }">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-bind="tooltipProps" v-html="message && message.length < hintMaxWidth ? $sanitize(message) : $sanitize(message).substring(0, hintMaxWidth) + '...'" />
        </template>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="$sanitize(message)" />
      </v-tooltip>
    </template>
  </v-autocomplete>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  value: { type: [String, Object], default: null },
  name: { type: String, default: '' },
  table: { type: String, required: true },
  database: { type: String, required: true },
  bitagapGroup: { type: String, required: true },
  autocomplete: { type: Object, default: null },
  hintMaxWidth: { type: Number, default: 50 },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['reset-value'])

const { $sanitize, $wikibase } = useNuxtApp()
const { notifyError } = useNotifyError()
const { t, locale } = useI18n()
const config = useRuntimeConfig().public

// While the backend is materializing the query's results (indexLoading), re-fetch
// automatically every RETRY_DELAY_MILLIS, up to RETRY_MAX_ATTEMPTS per typed input.
const RETRY_DELAY_MILLIS = 4000
const RETRY_MAX_ATTEMPTS = 15

const autocompleteRef = ref(null)
const internalValue = ref(null)
const items = ref([])
const loadingItems = ref(false)
const indexLoading = ref(false)
const search = ref(null)
const allowFreeText = ref(false)
let searchTimeout = null
let retryTimeout = null
let retryCount = 0
const inputWidth = ref(0)

const menuProps = computed(() => ({
  contentClass: 'search-ac-dropdown',
  ...(inputWidth.value ? { maxWidth: inputWidth.value, minWidth: inputWidth.value } : {})
}))

onMounted(() => {
  const el = autocompleteRef.value?.$el
  if (el) {
    inputWidth.value = el.getBoundingClientRect().width || 0
  }
})

const checkNoDataText = computed(() => {
  if (indexLoading.value) {
    return t('search.form.common.index_loading')
  }
  return loadingItems.value ? t('common.loading') : t('common.no_data')
})
const isDisabled = computed(() => props.disabled)

if (props.value instanceof Object && Object.keys(props.value).length !== 0) {
  internalValue.value = props.value
  items.value = [{ text: props.value.label, value: props.value }]
}
allowFreeText.value = props.autocomplete?.allowFreeText

watch(() => props.value, (val) => {
  if (allowFreeText.value) {
    const regex = new RegExp(`${t('search.form.common.find_text')} "(.*?)"`)
    const match = val?.label?.match(regex)
    if (match && match[1]) {
      val.label = match[1]
      if (items.value[0]) {
        items.value[0].text = val.label
      }
    }
  }
  internalValue.value = val
  search.value = val ? val?.label : ''
})

watch(internalValue, (val) => {
  emit('reset-value', val)
})

watch(search, (val) => {
  clearTimeout(retryTimeout)
  retryCount = 0
  if (!val) {
    indexLoading.value = false
    const selected = internalValue.value
    items.value = selected ? [{ text: selected.label, value: selected }] : []
    return
  }
  if (props.value && val === props.value.label) {
    return
  }
  loadingItems.value = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchItems(val)
  }, 500)
})

watch(() => props.database, () => {
  items.value = []
})

function fetchItems (query) {
  const sparqlQuery = $wikibase.$query.filterQuery(props.autocomplete.query, props.database, props.bitagapGroup, props.table, locale.value)
  if (process.env.debug) {
    console.log(`run sparlql query:\n${sparqlQuery}`)
  }
  const hint = props.name ? `${props.table}.${props.name}` : props.table
  const body = `v=2&q=${encodeURIComponent(query)}&hint=${encodeURIComponent(hint)}&sparqlQuery=${encodeURIComponent(sparqlQuery)}`
  const options = {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }
  fetch(`${config.apiBaseUrl}/api/search`, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error from the cache server')
      }
      return response.json()
    })
    .then((data) => {
      if (data.indexLoading) {
        indexLoading.value = true
        items.value = []
        loadingItems.value = false
        scheduleRetry(query)
        return
      }
      indexLoading.value = false
      retryCount = 0
      const results = data.results
      if (allowFreeText.value) {
        const findTextLabel = `${t('search.form.common.find_text')} "${query}"`
        results.unshift({ text: findTextLabel, value: { label: findTextLabel, textString: query } })
      }
      items.value = results
      loadingItems.value = false
    })
    .catch((error) => {
      indexLoading.value = false
      notifyError(error)
      loadingItems.value = false
    })
}

function scheduleRetry (query) {
  clearTimeout(retryTimeout)
  if (retryCount >= RETRY_MAX_ATTEMPTS) {
    return
  }
  retryCount++
  retryTimeout = setTimeout(() => {
    // Only re-fetch if the user hasn't typed something else meanwhile.
    if (search.value === query) {
      fetchItems(query)
    }
  }, RETRY_DELAY_MILLIS)
}

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
  clearTimeout(retryTimeout)
})

function truncateDesc (desc) {
  if (!desc || desc.length <= 100) return desc
  return desc.substring(0, 100) + '...'
}
</script>

<style scoped>
:deep(.v-field--disabled .v-field__append-inner) {
  display: none;
}
.my-item-subtitle {
  font-weight: normal;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0px;
}
</style>
