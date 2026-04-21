<template>
  <v-autocomplete
    v-model="internalValue"
    v-model:search="search"
    density="compact"
    v-bind="$attrs"
    :loading="loadingItems"
    :disabled="isDisabled"
    :no-data-text="checkNoDataText"
    :items="items"
    :filter="acceptAll"
    hide-select
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData || {}" />
    </template>
    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps">
        <template #title>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="item.raw.text" />
        </template>
        <template #subtitle>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span class="my-item-subtitle" v-html="item.raw.value.desc" />
        </template>
      </v-list-item>
    </template>
    <template #message="{ message }">
      <v-tooltip max-width="40%" location="bottom" open-delay="200">
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
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  value: { type: [String, Object], default: null },
  table: { type: String, required: true },
  database: { type: String, required: true },
  bitagapGroup: { type: String, required: true },
  autocomplete: { type: Object, default: null },
  hintMaxWidth: { type: Number, default: 50 },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['reset-value'])

const { $notification, $sanitize, $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const config = useRuntimeConfig().public

const internalValue = ref(null)
const items = ref([])
const loadingItems = ref(false)
const search = ref(null)
const allowFreeText = ref(false)
let searchTimeout = null

const checkNoDataText = computed(() => loadingItems.value ? t('common.loading') : t('common.no_data'))
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
  if (!val) {
    items.value = []
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
  const body = `q=${encodeURIComponent(query)}&sparqlQuery=${encodeURIComponent(sparqlQuery)}`
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
      if (allowFreeText.value) {
        const findTextLabel = `${t('search.form.common.find_text')} "${query}"`
        data.unshift({ text: findTextLabel, value: { label: findTextLabel, textString: query } })
      }
      items.value = data
      loadingItems.value = false
    })
    .catch((error) => {
      console.error('Error loading items:', error)
      $notification.error(error)
      loadingItems.value = false
    })
}

function acceptAll () {
  return true
}
</script>

<style scoped>
.my-item-subtitle {
  font-weight: normal;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0px;
}
</style>
