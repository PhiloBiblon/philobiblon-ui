<template>
  <v-menu
    v-model="isDatePickerActive"
    :close-on-content-click="false"
    :disabled="!useCalendar"
  >
    <template #activator="{ props: activatorProps }">
      <v-text-field
        v-model="currentText"
        :label="t('common.date')"
        class="date-input"
        density="compact"
        :readonly="useCalendar"
        :placeholder="useCalendar ? '' : t('common.date_placeholder')"
        :error-messages="validationError ? [validationError] : []"
        v-bind="useCalendar ? activatorProps : {}"
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
      v-if="useCalendar"
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
  mode: { type: String, default: 'edit' },
  useCalendar: { type: Boolean, default: false }
})

const emit = defineEmits(['on-blur', 'new-value'])

const { $notification } = useNuxtApp()
const { t } = useI18n()
const { notifyError } = useNotifyError()

const currentText = ref(null)
const consolidatedText = ref(null)
const pickerDate = ref(null)
const focussed = ref(false)
const isDatePickerActive = ref(false)
const validationError = ref(null)

const isEditable = computed(() => props.mode === 'edit')
const today = computed(() => new Date().toISOString().slice(0, 10))

// Accepted partial date patterns (MM: 01-12, DD: 01-31)
const PARTIAL_DATE_REGEXES = [
  /^\d{4}$/,
  /^\d{4}-(0[1-9]|1[0-2])$/,
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  /^(0[1-9]|[12]\d|3[01])$/
]

watch(currentText, (newVal, oldVal) => {
  if (oldVal != null && newVal !== oldVal) {
    focussed.value = true
  }
  if (props.useCalendar) {
    pickerDate.value = parseDate(newVal)
  }
  // Clear stale error while user is typing
  if (!props.useCalendar && validationError.value) {
    validationError.value = null
  }
})

onMounted(() => {
  // Only the calendar-based qualifier (P106 Date of P799 Dataset status)
  // defaults to today's date, since the user normally wants the creation date.
  // Every other date field stays empty so the gray placeholder
  // (YYYY, YYYY-MM-DD, …) is shown for manual partial-date entry.
  const shouldDefaultToToday = props.mode === 'creation' && props.value === null && props.useCalendar
  const initialValue = shouldDefaultToToday ? today.value : props.value
  currentText.value = initialValue
  consolidatedText.value = initialValue
  if (props.useCalendar) {
    pickerDate.value = parseDate(initialValue)
  }
  if (shouldDefaultToToday) {
    emit('new-value', initialValue)
  }
})

function focus () {
  focussed.value = true
}

function blur () {
  focussed.value = false
  if (!props.useCalendar) {
    const error = validatePartialDate(currentText.value)
    if (error) {
      validationError.value = error
      $notification.error(error)
      return
    }
    validationError.value = null
  }
  emit('on-blur', currentText.value)
}

function validatePartialDate (text) {
  if (!text) return null
  if (!PARTIAL_DATE_REGEXES.some(r => r.test(text))) {
    return t('common.date_format_error')
  }
  // For patterns that start with a 4-digit year, validate the year range
  const yearMatch = text.match(/^(\d{4})/)
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10)
    if (year > 2125) {
      return t('search.form.common.date.error.invalid_year')
    }
  }
  return null
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
  const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/
  const match = text.match(isoDatePattern)
  if (match) {
    const year = parseInt(match[1], 10)
    const month = parseInt(match[2], 10) - 1
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
    // Validate before saving in text mode
    if (!props.useCalendar) {
      const error = validatePartialDate(currentText.value)
      if (error) {
        validationError.value = error
        $notification.error(error)
        return
      }
    }
    const response = await props.save(currentText.value, consolidatedText.value)
    if (response && response.success) {
      consolidatedText.value = currentText.value
      $notification.success(t('messages.success.updated'))
    } else {
      throw new Error(response.info || 'Update failed')
    }
  } catch (error) {
    notifyError(error)
  }
}

function restore () {
  currentText.value = consolidatedText.value
  validationError.value = null
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
      notifyError(error)
    })
}
</script>

<style scoped>
.v-menu__content {
  min-width: 0 !important;
  width: 290px !important;
}

.date-input {
  width: 140px;
}

:deep(.v-field__input) {
  min-height: 28px !important;
  padding-bottom: 0 !important;
}

:deep(.v-input__details) {
  display: none;
}

:deep(.v-input--error .v-input__details) {
  display: block;
}
</style>
