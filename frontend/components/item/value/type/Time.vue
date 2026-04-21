<template>
  <div>
    <template v-if="!isUserLogged">
      {{ valueToView.value }} <sup>{{ valueToView.calendar }}</sup>
    </template>
    <template v-else>
      <v-container>
        <v-row dense class="justify-start">
          <v-col dense class="flex-shrink-1">
            <item-util-edit-date-picker-field
              :value="valueToView_.value"
              :mode="mode"
              style="width: 200px"
              class="ma-0 pa-0"
              :save="editValue"
              :delete="deleteValue"
              @new-value="newDateValue"
            />
            <v-select
              v-model="valueToView_.calendar"
              :label="t('common.calendar')"
              :items="['Gregorian', 'Julian']"
              class="ma-0 pa-0"
              style="width: 100px"
              @update:model-value="onChangeCalendarType"
            />
          </v-col>
        </v-row>
      </v-container>
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
  mode: { type: String, default: 'edit' }
})

const emit = defineEmits(['on-blur', 'new-value'])

const { $notification } = useNuxtApp()
const { t } = useI18n()
const authStore = useAuthStore()

const valueToView_ = reactive({ ...props.valueToView })
const isUserLogged = computed(() => authStore.isLogged)
const isEditable = computed(() => props.mode === 'edit')

function newDateValue (value) {
  valueToView_.value = value
  emit('new-value', getTimeNewValue(valueToView_.value))
  emit('on-blur', getTimeNewValue(valueToView_.value))
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
  return {
    time: formatDate(value),
    calendar: valueToView_.calendar.toLowerCase()
  }
}

function formatDate (dateString) {
  const date = new Date(dateString)
  const isoYear = date.getUTCFullYear()
  const isoMonth = ('0' + (date.getUTCMonth() + 1)).slice(-2)
  const isoDay = ('0' + date.getUTCDate()).slice(-2)

  return `+${isoYear}-${isoMonth}-${isoDay}T00:00:00Z`
}
</script>

<style scoped>
:deep(.v-list-item__title) {
  font-size: 12px;
}
:deep(.v-select__selection) {
  font-size: 12px;
}
</style>
