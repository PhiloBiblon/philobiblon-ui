<template>
  <div>
    <div class="flex-container">
      <v-menu v-model="activeBegin" :close-on-content-click="false">
        <template #activator="{ props: activatorProps }">
          <v-text-field
            :model-value="beginValue"
            class="date-input"
            :disabled="disabled"
            :label="label + '. ' + t('common.from')"
            density="compact"
            placeholder="YYYY-MM-DD"
            v-bind="activatorProps"
            append-inner-icon="mdi-calendar"
            @click:append-inner.stop="activeBegin = true"
            @focus="showHint"
            @blur="hideHint"
            @change="validateBeginDate($event.target.value)"
          />
        </template>
        <v-date-picker
          v-model="beginValue"
          :max="today"
          min="0001-01-01"
          @update:model-value="onBeginDateSelect"
        />
      </v-menu>
      <v-menu v-model="activeEnd" :close-on-content-click="false">
        <template #activator="{ props: activatorProps }">
          <v-text-field
            :model-value="endValue"
            class="date-input"
            :disabled="disabled"
            :label="t('common.to')"
            density="compact"
            placeholder="YYYY-MM-DD"
            v-bind="activatorProps"
            append-inner-icon="mdi-calendar"
            @click:append-inner.stop="activeEnd = true"
            @focus="showHint"
            @blur="hideHint"
            @change="validateEndDate($event.target.value)"
          />
        </template>
        <v-date-picker
          v-model="endValue"
          :max="today"
          min="0001-01-01"
          @update:model-value="onEndDateSelect"
        />
      </v-menu>
    </div>
    <div v-if="isHintVisible" class="message-container">
      <v-tooltip max-width="40%" location="bottom" open-delay="200">
        <template #activator="{ props: tooltipProps }">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span class="text-caption hint" v-bind="tooltipProps" v-html="hint && hint.length < hintMaxWidth ? $sanitize(hint) : ($sanitize(hint).substring(0, hintMaxWidth) + '...')" />
        </template>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="$sanitize(hint)" />
      </v-tooltip>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  label: { type: String, default: '' },
  value: { type: Object, default: null },
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  hintMaxWidth: { type: Number, default: 50 }
})

const emit = defineEmits(['update-begin-date', 'update-end-date'])

const { $notification, $sanitize } = useNuxtApp()
const { t } = useI18n()

const activeEnd = ref(false)
const activeBegin = ref(false)
const beginValue = ref(null)
const endValue = ref(null)
const isHintVisible = ref(false)

const today = computed(() => new Date().toISOString().slice(0, 10))

watch(() => props.value, (newVal) => {
  beginValue.value = newVal?.begin || null
  endValue.value = newVal?.end || null
})

onMounted(() => {
  beginValue.value = props.value?.begin
  endValue.value = props.value?.end
})

function validateBeginDate (date) {
  beginValue.value = validateDate(date)
  emit('update-begin-date', beginValue.value)
}

function validateEndDate (date) {
  endValue.value = validateDate(date)
  emit('update-end-date', endValue.value)
}

function validateDate (date) {
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
  if (!date) {
    return null
  } else if (!DATE_REGEX.test(date)) {
    $notification.error(t('search.form.common.date.error.invalid_date'))
    return null
  } else {
    const parsed = new Date(`${date}T00:00:00Z`)
    const year = parseInt(date.substring(0, 4), 10)
    if (isNaN(parsed.getTime()) || year > 2125) {
      $notification.error(t('search.form.common.date.error.invalid_year'))
      return null
    }
    return date
  }
}

function dateToIso (date) {
  if (!date) return null
  if (date instanceof Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return date
}

function onBeginDateSelect () {
  activeBegin.value = false
  beginValue.value = dateToIso(beginValue.value)
  validateBeginDate(beginValue.value)
}

function onEndDateSelect () {
  activeEnd.value = false
  endValue.value = dateToIso(endValue.value)
  validateEndDate(endValue.value)
}

function showHint () {
  isHintVisible.value = true
}

function hideHint () {
  isHintVisible.value = false
}
</script>

<style scoped>
.flex-container {
  display: flex;
  gap: 16px;
}

.message-container {
  display: flex;
  align-items: center;
  margin: 0;
}

:deep(.v-input__control .v-text-field__details) {
  height: 0px !important;
  min-height: 0px !important;
}

.hint {
  color: rgba(0, 0, 0, 0.6);
}

.v-menu__content {
  min-width: 0 !important;
  width: 290px !important;
}

.date-input {
  width: 165px;
}
</style>
