<template>
  <v-menu
    v-model="isDatePickerActive"
    :close-on-content-click="false"
  >
    <template #activator="{ props: activatorProps }">
      <v-text-field
        v-model="currentText"
        :label="t('common.date')"
        class="date-input"
        density="compact"
        readonly
        v-bind="activatorProps"
        @focus="focus"
        @blur="blur"
      >
        <template #append-inner>
          <v-btn
            v-if="isEditable && currentText !== consolidatedText"
            variant="text"
            icon
            density="compact"
            class="action-btn"
            @click="edit"
          >
            <v-tooltip location="top">
              <template #activator="{ props: btnProps }">
                <v-icon v-bind="btnProps" color="#616161" size="22">
                  mdi-check
                </v-icon>
              </template>
              <span>{{ t("common.save") }}</span>
            </v-tooltip>
          </v-btn>
          <v-btn
            v-if="isEditable && currentText !== consolidatedText"
            variant="text"
            icon
            density="compact"
            class="action-btn"
            @click="restore"
          >
            <v-tooltip location="top">
              <template #activator="{ props: btnProps }">
                <v-icon v-bind="btnProps" color="#616161" size="22">
                  mdi-close
                </v-icon>
              </template>
              <span>{{ t("common.cancel") }}</span>
            </v-tooltip>
          </v-btn>
          <v-btn
            v-if="isEditable && focussed"
            variant="text"
            icon
            density="compact"
            class="action-btn"
            @click.stop="deleteValue"
          >
            <v-tooltip location="top">
              <template #activator="{ props: btnProps }">
                <v-icon v-bind="btnProps" color="#616161" size="22">
                  mdi-trash-can
                </v-icon>
              </template>
              <span>{{ t("common.remove") }}</span>
            </v-tooltip>
          </v-btn>
        </template>
      </v-text-field>
    </template>

    <v-date-picker
      v-model="pickerDate"
      :max="today"
      min="0001-01-01"
      hide-header
      show-adjacent-months
      @update:model-value="onDateSelect"
    />
  </v-menu>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  value: { type: String, default: null },
  save: { type: Function, default: null },
  delete: { type: Function, default: null },
  mode: { type: String, default: 'edit' }
})

const emit = defineEmits(['on-blur', 'new-value'])

const { $notification } = useNuxtApp()
const { t } = useI18n()

const currentText = ref(null)
const consolidatedText = ref(null)
const pickerDate = ref(null)
const focussed = ref(false)
const isDatePickerActive = ref(false)

const isEditable = computed(() => props.mode === 'edit')
const today = computed(() => new Date().toISOString().slice(0, 10))

watch(currentText, (newVal, oldVal) => {
  if (oldVal != null && newVal !== oldVal) {
    focussed.value = true
  }
  pickerDate.value = parseDate(newVal)
})

onMounted(() => {
  currentText.value = props.value
  consolidatedText.value = props.value
  pickerDate.value = parseDate(props.value)
})

function focus () {
  focussed.value = true
}

function blur () {
  focussed.value = false
  emit('on-blur', currentText.value)
}

function onDateSelect (newDate) {
  currentText.value = formatDate(newDate)
  isDatePickerActive.value = false
  focussed.value = false
  emit('new-value', currentText.value)
}

function formatDate (date) {
  if (!date) return null
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return null
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDate (text) {
  if (!text) return null
  // Detect ISO date-only strings (YYYY-MM-DD) and parse as local date
  const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/
  const match = text.match(isoDatePattern)
  if (match) {
    const year = parseInt(match[1], 10)
    const month = parseInt(match[2], 10) - 1 // months are 0-indexed
    const day = parseInt(match[3], 10)
    const d = new Date(year, month, day)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const d = new Date(text)
  return Number.isNaN(d.getTime()) ? null : d
}

async function edit () {
  try {
    focussed.value = false
    const response = await props.save(currentText.value, consolidatedText.value)
    if (response && response.success) {
      consolidatedText.value = currentText.value
      $notification.success(t('messages.success.updated'))
    } else {
      throw new Error(response.info || 'Update failed')
    }
  } catch (error) {
    console.error(error)
    const errorMessage = error.message.includes('modification-failed')
      ? t('messages.error.modification.failed')
      : t('messages.error.session.expired')
    $notification.error(errorMessage)
  }
}

function restore () {
  currentText.value = consolidatedText.value
  focussed.value = false
  emit('new-value', currentText.value)
}

async function deleteValue () {
  await props.delete()
    .then((response) => {
      if (response) {
        if (!response.success) {
          throw new Error(response.info)
        }
        $notification.success('Successfully deleted')
      }
    })
    .catch((error) => {
      if (error.message === 'query is undefined') {
        error = 'Error: Session expired.'
      }
      $notification.error(error)
    })
}
</script>

<style scoped>
.v-menu__content {
  min-width: 0 !important;
  width: 290px !important;
}

.date-input {
  width: 200px;
}

:deep(.v-field__input) {
  min-height: 28px !important;
  padding-bottom: 0 !important;
}

:deep(.v-input__details) {
  display: none;
}
</style>
