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
        readonly
        v-bind="activatorProps"
        @focus="focus"
        @blur="blur"
      >
        <template #append>
          <v-btn
            v-if="isEditable && currentText !== consolidatedText"
            variant="text"
            icon
            @click="edit"
          >
            <v-tooltip location="top">
              <template #activator="{ props: btnProps }">
                <v-icon v-bind="btnProps">
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
            @click="restore"
          >
            <v-tooltip location="top">
              <template #activator="{ props: btnProps }">
                <v-icon v-bind="btnProps">
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
            @click.stop="deleteValue"
          >
            <v-tooltip location="top">
              <template #activator="{ props: btnProps }">
                <v-icon v-bind="btnProps">
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
      v-model="currentText"
      min="1000-01-01"
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
const focussed = ref(false)
const isDatePickerActive = ref(false)

const isEditable = computed(() => props.mode === 'edit')

watch(currentText, (newVal, oldVal) => {
  if (oldVal != null && newVal !== oldVal) {
    focussed.value = true
  }
})

onMounted(() => {
  currentText.value = props.value
  consolidatedText.value = props.value
})

function focus () {
  focussed.value = true
}

function blur () {
  focussed.value = false
  emit('on-blur', currentText.value)
}

function onDateSelect () {
  isDatePickerActive.value = false
  focussed.value = false
  emit('new-value', currentText.value)
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
  width: 165px;
}
</style>
