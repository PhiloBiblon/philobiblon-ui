<template>
  <div>
    <span v-if="!isUserLogged">
      {{ valueToView.value.amount }} <item-util-view-text-lang :value="unitLabel" />
    </span>
    <div v-else>
      <v-container>
        <v-row dense class="justify-start">
          <v-col dense class="flex-shrink-1">
            <item-util-edit-text-field
              :label="t('common.amount')"
              :value="valueToView_.value.amount"
              :save="editAmount"
              :delete="deleteValue"
              :mode="mode"
              style="width: 200px"
              class="ma-0 pa-0"
              @new-value="newDateValue"
              @on-blur="emit('on-blur', $event)"
            />
            <item-util-edit-select-field
              :label="t('common.unit')"
              :value="selectedUnit"
              :save="editUnit"
              :options="unitOptions"
              :mode="mode"
              :filter="acceptAll"
              style="width: 200px"
              @update-options="unitOptions = $event"
              @input="oninput($event)"
              @new-value="newUnitValue"
              @on-blur="emit('on-blur', $event)"
            />
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  valueToView: { type: Object, default: null },
  save: { type: Function, default: null },
  delete: { type: Function, default: null },
  mode: { type: String, default: 'edit' }
})

const emit = defineEmits(['on-blur', 'new-value'])

const { $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const authStore = useAuthStore()

const valueToView_ = reactive(getInitialValue())
const newValue_ = reactive({ amount: null, unit: null })
const unitItemId = ref(null)
const unitLabel = ref(null)
const selectedUnit = ref('')
const unitOptions = ref([])

const isUserLogged = computed(() => authStore.isLogged)
const isEditable = computed(() => props.mode === 'edit')

onMounted(async () => {
  if (valueToView_?.value?.unit) {
    unitItemId.value = extractItemNumber(valueToView_.value.unit)
    if (unitItemId.value !== '1') {
      const entity = await $wikibase.getEntity(unitItemId.value, locale.value)
      unitLabel.value = $wikibase.getValueByLang(entity.labels, locale.value)
      setUnitOptions()
    }
  }
})

function getInitialValue () {
  const initialValue = { ...props.valueToView }
  if (!initialValue.value) {
    initialValue.value = { amount: '', unit: '' }
  }
  return initialValue
}

function newDateValue (value) {
  newValue_.amount = value
  emit('new-value', newValue_)
}

function newUnitValue (value) {
  newValue_.unit = value.concepturi
  emit('new-value', newValue_)
}

function extractItemNumber (url) {
  return url.substring(url.lastIndexOf('/') + 1)
}

function editUnit (newUnit) {
  const oldUnit = valueToView_.value.unit
  valueToView_.value.unit = newUnit.concepturi
  return props.save(getQuantityValue(valueToView_.value, { amount: valueToView_.value.amount, unit: oldUnit }))
}

function editAmount (newAmount, oldValue) {
  valueToView_.value.amount = newAmount
  return props.save(getQuantityValue(valueToView_.value, oldValue))
}

function getQuantityValue (newValue, oldValue) {
  return {
    validation: { valid: true },
    values: { oldValue, newValue }
  }
}

function oninput (e) {
  if (e) { handleSearchChange(e) }
}

async function handleSearchChange (value) {
  if (value) {
    const search = await $wikibase.searchEntityByName(value, locale.value, locale.value)
    if (search && search.length) { unitOptions.value = search }
  }
}

function setUnitOptions () {
  unitOptions.value = [{
    id: unitItemId.value,
    label: unitLabel.value.value
  }]
  selectedUnit.value = unitItemId.value
}

function deleteValue () {
  return props.delete()
}

function acceptAll () {
  return true
}
</script>
