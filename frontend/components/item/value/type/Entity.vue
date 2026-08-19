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
        :custom-filter="matchesEntitySearch"
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
        :custom-filter="acceptAll"
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

const DEBOUNCE_MS = 300

const selectedOption = ref(null)
const options = ref([])
const propertyAutocomplete = ref({})
const loading = ref(true)
let debounceTimer = null
let lastRequestId = 0

const isUserLogged = computed(() => authStore.isLogged)
const propertyKey = computed(() => {
  const p = props.valueToView?.property
  return (p && typeof p === 'object') ? p.id : p
})

const isItemWithCustomOptions = computed(
  () => propertyAutocomplete.value && propertyKey.value in propertyAutocomplete.value
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
  clearTimeout(debounceTimer)
  if (!e) { return }
  debounceTimer = setTimeout(() => handleSearchChange(e), DEBOUNCE_MS)
}

// Guarded by a request-sequence check after each await so a stale response
// (e.g. from an earlier, shorter search prefix) can't overwrite the result
// of a more recent keystroke once it resolves out of order.
async function handleSearchChange (value) {
  if (!value) { return }
  const requestId = ++lastRequestId
  const directMatch = await resolveEntityFromSearchTerm(value)
  if (requestId !== lastRequestId) { return }
  if (directMatch) {
    options.value = [directMatch]
    return
  }
  const search = await $wikibase.searchEntityByName(value, locale.value, locale.value)
  if (requestId !== lastRequestId) { return }
  if (search && search.length) { options.value = search }
}

// Q# and PB ID (e.g. "BETA bioid 1345") aren't things Wikibase's own label
// search understands, so resolve them directly instead of searching by label.
async function resolveEntityFromSearchTerm (term) {
  const value = term?.trim()
  if (!value) { return null }
  try {
    let qid = null
    if ($wikibase.getQItemPattern().test(value.toUpperCase())) {
      qid = value.toUpperCase()
    } else if ($wikibase.getPBIDPattern().test(value)) {
      qid = await $wikibase.getEntityFromPBID(value)
    } else {
      return null
    }
    if (!qid) { return null }
    const entity = await $wikibase.getEntity(qid, locale.value)
    if (!entity || entity.missing !== undefined) { return null }
    const label = $wikibase.getValueByLang(entity.labels, locale.value)
    return { id: qid, label: label?.value ?? qid }
  } catch (error) {
    console.error(error)
    return null
  }
}

function matchesEntitySearch (itemTitle, queryText, item) {
  if (!queryText) { return true }
  const search = queryText.toString().toLocaleLowerCase()
  const raw = item?.raw ?? {}
  return [itemTitle, raw.id, raw.pbid]
    .filter(Boolean)
    .some(value => value.toString().toLocaleLowerCase().includes(search))
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
  }
  return defaultValue || null
}

function setOptionsAutocomplete () {
  if (isItemWithCustomOptions.value) {
    const autocomplete = propertyAutocomplete.value[propertyKey.value]
    const fullSparqlQuery = buildFullQuery(autocomplete.query)
    return $wikibase.runSparqlQuery(fullSparqlQuery, true)
      // Autocomplete options are a best-effort enhancement: the SPARQL endpoint can
      // fail transiently (e.g. read-after-write lag right after creating an item),
      // and that must not surface an alarming error toast. Degrade to no options.
      .catch((error) => { console.error(error); return [] })
      .then((results) => {
        Object.values(results).forEach((result) => {
          // A row missing the ?item binding (e.g. an incomplete SPARQL result for
          // some Instance-of values, see #393) must be skipped instead of throwing.
          if (!result?.item?.value) {
            return
          }
          options.value.push({
            id: extractQid(result.item.value),
            label: result.item.label,
            pbid: result.pbid ?? null
          })
        })
        const defaultValue = props.valueToView.useDefault === false ? null : autocomplete.default_value
        const currentId = getDefaultValue(props.valueToView.item, defaultValue)
        let foundOption = options.value.find(o => o.id === currentId)
        if (!foundOption && currentId && props.valueToView.item) {
          foundOption = { id: props.valueToView.item, label: props.valueToView.value }
          options.value.push(foundOption)
        }
        selectedOption.value = foundOption || null
        // currentId came from defaultValue (no existing item value): propagate an
        // {id, label} object, not the raw QID, so consumers reading
        // claim.value.datavalue.value.id (e.g. manid's MS:/Ed.: label prefix) see it.
        // Fall back to a bare { id } even if the SPARQL-fetched options don't
        // include it yet (e.g. transient endpoint lag, see #393): the claim must
        // still carry a non-null, id-shaped value so required-field validation
        // and submission aren't blocked by a slow autocomplete load.
        if (!props.valueToView.item && currentId) {
          emit('new-value', foundOption || { id: currentId })
        }
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
