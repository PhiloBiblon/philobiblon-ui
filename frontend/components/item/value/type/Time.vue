<template>
  <div>
    <template v-if="!isUserLogged">
      {{ valueToView.value }} <sup>{{ valueToView.calendar }}</sup>
    </template>
    <template v-else>
      <div style="display: inline-flex; flex-direction: column; align-items: flex-start;">
        <item-util-edit-date-picker-field
          :value="valueToView_.value"
          :mode="mode"
          :use-calendar="useCalendar"
          class="ma-0 pa-0"
          :save="editValue"
          :delete="deleteValue"
          @new-value="newDateValue"
          @on-blur="onDateTextBlur"
        />
        <v-select
          v-model="valueToView_.calendar"
          :label="t('common.calendar')"
          :items="['Gregorian', 'Julian']"
          class="ma-0 pa-0 mt-2"
          density="compact"
          style="width: 90px"
          @update:model-value="onChangeCalendarType"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  valueToView: { type: Object, default: null },
  save: { type: Function, default: null },
  delete: { type: Function, default: null },
  mode: { type: String, default: 'edit' },
  parentPropertyId: { type: String, default: null }
})

const emit = defineEmits(['on-blur', 'new-value'])

const { $notification } = useNuxtApp()
const { t } = useI18n()
const authStore = useAuthStore()

const valueToView_ = reactive({ ...props.valueToView })
const isUserLogged = computed(() => authStore.isLogged)
const isEditable = computed(() => props.mode === 'edit')

// Calendar popup only for P106 (Date) when qualifier of P799 (Dataset status)
const useCalendar = computed(() =>
  props.valueToView?.property === 'P106' && props.parentPropertyId === 'P799'
)

function newDateValue (value) {
  valueToView_.value = value
  emit('new-value', getTimeNewValue(valueToView_.value))
  emit('on-blur', getTimeNewValue(valueToView_.value))
}

function onDateTextBlur (value) {
  if (!value) return
  valueToView_.value = value
  const timeNewValue = getTimeNewValue(value)
  emit('on-blur', timeNewValue)
  emit('new-value', timeNewValue)
}

function onChangeCalendarType (newCalendar) {
  valueToView_.calendar = newCalendar
  if (isEditable.value) {
    props.save(getTimeValue(valueToView_.value, valueToView_.value))
      .then((response) => {
        if (response) {
          if (!response.success) {
            throw new Error(response.info)
          }
          $notification.success(t('messages.success.updated'))
        }
      })
  }
  emit('new-value', getTimeNewValue(valueToView_.value))
}

function editValue (newValue, oldValue) {
  valueToView_.value = newValue
  return props.save(getTimeValue(newValue, oldValue))
}

function deleteValue () {
  return props.delete()
}

function getTimeValue (newValue, oldValue) {
  return {
    validation: { valid: true },
    values: {
      oldValue,
      newValue: getTimeNewValue(newValue)
    }
  }
}

function getTimeNewValue (value) {
  const { time, precision } = toWikibaseTime(value)
  return {
    time,
    precision,
    calendar: valueToView_.calendar.toLowerCase()
  }
}

/**
 * Converts a partial date string to Wikibase time format with the correct precision.
 * Supported input formats: YYYY, YYYY-MM, YYYY-MM-DD, MM-DD, DD
 * MM must be 01-12; DD must be 01-31.
 */
function toWikibaseTime (input) {
  if (!input) return { time: null, precision: null }

  // YYYY-MM-DD — full date, precision day (11)
  const fullMatch = input.match(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
  if (fullMatch) {
    return {
      time: `+${fullMatch[1]}-${fullMatch[2]}-${fullMatch[3]}T00:00:00Z`,
      precision: 11
    }
  }

  // YYYY-MM — precision month (10)
  const yearMonthMatch = input.match(/^(\d{4})-(0[1-9]|1[0-2])$/)
  if (yearMonthMatch) {
    return {
      time: `+${yearMonthMatch[1]}-${yearMonthMatch[2]}-01T00:00:00Z`,
      precision: 10
    }
  }

  // YYYY — year only, precision year (9)
  const yearMatch = input.match(/^(\d{4})$/)
  if (yearMatch) {
    return {
      time: `+${yearMatch[1]}-01-01T00:00:00Z`,
      precision: 9
    }
  }

  // MM-DD — month and day without year, precision day (11).
  // Year defaults to +0000 which is valid ISO 8601 (= 1 BCE in proleptic Gregorian).
  const monthDayMatch = input.match(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
  if (monthDayMatch) {
    return {
      time: `+0000-${monthDayMatch[1]}-${monthDayMatch[2]}T00:00:00Z`,
      precision: 11
    }
  }

  // DD — day only, precision day (11), year and month default to +0000/01.
  const dayMatch = input.match(/^(0[1-9]|[12]\d|3[01])$/)
  if (dayMatch) {
    return {
      time: `+0000-01-${dayMatch[1]}T00:00:00Z`,
      precision: 11
    }
  }

  // Unrecognized format — return null rather than producing a malformed Wikibase time string.
  return { time: null, precision: null }
}
</script>

<style scoped>
:deep(.v-list-item__title) {
  font-size: 12px;
}
:deep(.v-select__selection) {
  font-size: 12px;
}
:deep(.v-input__details) {
  display: none;
}
:deep(.v-field__input) {
  min-height: 28px !important;
  padding-bottom: 0 !important;
}
</style>
