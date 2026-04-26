<template>
  <div v-if="!loading">
    <template v-if="!isUserLogged">
      <item-util-view-text-lang :value="valueToView" :tooltip="valueToView.item" />
    </template>
    <template v-else>
      <item-util-edit-select-field
        v-if="isItemWithCustomOptions"
        :label="label"
        :value="selectedOption"
        :save="editValue"
        :options="options"
        :delete="deleteValue"
        :mode="mode"
        @on-blur="emit('on-blur', $event)"
        @new-value="emit('new-value', $event)"
      />
      <item-util-edit-select-field
        v-else
        :label="label"
        :save="editValue"
        :options="options"
        :delete="deleteValue"
        :mode="mode"
        :filter="acceptAll"
        @update-options="options = $event"
        @input="oninput($event)"
        @on-blur="emit('on-blur', $event)"
        @new-value="emit('new-value', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'
import { useBreadcrumbStore } from '~/stores/breadcrumb'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  label: { type: String, default: null },
  valueToView: { type: Object, default: null },
  save: { type: Function, default: null },
  delete: { type: Function, default: null },
  mode: { type: String, default: 'edit' }
})

const emit = defineEmits(['on-blur', 'new-value'])

const { $wikibase } = useNuxtApp()
const { locale } = useI18n()
const config = useRuntimeConfig().public
const authStore = useAuthStore()
const breadcrumbStore = useBreadcrumbStore()

const selectedOption = ref(null)
const options = ref([])
const propertyAutocomplete = ref({})
const loading = ref(true)

const isUserLogged = computed(() => authStore.isLogged)
const isItemWithCustomOptions = computed(
  () => propertyAutocomplete.value && props.valueToView.property in propertyAutocomplete.value
)

onMounted(async () => {
  if (isUserLogged.value) {
    propertyAutocomplete.value = await $wikibase.getControlledVocabularyConfig(
      breadcrumbStore.table,
      breadcrumbStore.database
    )
    await setOptionsAutocomplete()
  }
  loading.value = false
})

function editValue (newValue, oldValue) {
  return props.save(getWikiBaseEntityIdValue(newValue, oldValue))
}

function deleteValue () {
  return props.delete()
}

function getWikiBaseEntityIdValue (newValue, oldValue) {
  return {
    validation: { valid: true },
    values: { newValue: newValue.id, oldValue: oldValue.id }
  }
}

function oninput (e) {
  if (e) { handleSearchChange(e) }
}

async function handleSearchChange (value) {
  if (value) {
    const search = await $wikibase.searchEntityByName(value, locale.value, locale.value)
    if (search && search.length) { options.value = search }
  }
}

function buildFullQuery (sparqlQuery) {
  return $wikibase.$query.addPrefixes(`
    SELECT ?item ?itemLabel ?itemDescription
      (CONCAT(?itemLabel, IF(BOUND(?pbid), CONCAT(" [", ?pbid, "]"), ""), " (", ?qid, ")") AS ?extendedLabel)
    WHERE {
      {
        ${sparqlQuery}
      }
      OPTIONAL { ?item wdt:P476 ?pbid }
      BIND(STRAFTER(STR(?item), "${config.wikibaseBaseUrl}/entity/") AS ?qid)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${locale.value},en". }
    }
  `)
}

function getDefaultValue (currentValue, defaultValue) {
  if (currentValue) {
    return currentValue
  } else if (defaultValue) {
    emit('new-value', defaultValue)
    return defaultValue
  } else {
    return null
  }
}

function setOptionsAutocomplete () {
  if (isItemWithCustomOptions.value) {
    const autocomplete = propertyAutocomplete.value[props.valueToView.property]
    const fullSparqlQuery = buildFullQuery(autocomplete.query)
    return $wikibase.runSparqlQuery(fullSparqlQuery, true)
      .then((results) => {
        Object.values(results).forEach((result) => {
          options.value.push({
            id: extractQid(result.item.value),
            label: result.item.label
          })
        })
        const defaultValue = props.valueToView.useDefault === false ? null : autocomplete.default_value
        const currentId = getDefaultValue(props.valueToView.item, defaultValue)
        selectedOption.value = options.value.find(o => o.id === currentId) || currentId
      })
  } else {
    options.value = [{
      id: props.valueToView.item,
      label: props.valueToView.value
    }]
    const currentId = getDefaultValue(props.valueToView.item, null)
    selectedOption.value = options.value.find(o => o.id === currentId) || currentId
    return Promise.resolve()
  }
}

function extractQid (uri) {
  if (!uri) return uri
  return uri.substring(uri.lastIndexOf('/') + 1)
}

function acceptAll () {
  return true
}
</script>
