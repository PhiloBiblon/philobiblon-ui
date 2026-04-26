<template>
  <v-text-field
    ref="myTextField"
    v-model="currentText"
    :type="type"
    density="compact"
    v-bind="$attrs"
    @blur="blur"
    @focus="focus"
    @update:model-value="handleInput"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData || {}" />
    </template>
    <template #append-inner>
      <v-btn
        v-if="focussed && isEditable"
        variant="text"
        icon
        density="compact"
        class="action-btn"
        @click.stop="edit"
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
        v-if="focussed"
        variant="text"
        icon
        density="compact"
        class="action-btn"
        @click.stop="restore"
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
        v-if="focussed && isEditable"
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

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  value: { type: String, default: null },
  type: { type: String, default: 'text' },
  save: { type: Function, default: null },
  delete: { type: Function, default: null },
  mode: { type: String, default: 'edit' }
})

const emit = defineEmits(['on-blur', 'new-value'])

const { $notification } = useNuxtApp()
const { t } = useI18n()

const myTextField = ref(null)
const currentText = ref(null)
const consolidatedText = ref(null)
const focussed = ref(false)

const isEditable = computed(() => props.mode === 'edit')

onMounted(() => {
  currentText.value = props.value
  consolidatedText.value = props.value
})

function blur () {
  focussed.value = false
  if (isEditable.value) {
    restore()
  }
  emit('on-blur', currentText.value)
}

function focus () {
  focussed.value = true
}

function handleInput () {
  emit('new-value', currentText.value)
}

async function edit () {
  if (isEditable.value) {
    await props.save(currentText.value, consolidatedText.value)
      .then((response) => {
        if (response) {
          if (!response.success) {
            throw new Error(response.info)
          }
          consolidatedText.value = currentText.value
          $notification.success(t('messages.success.updated'))
        }
      })
      .catch((error) => {
        if (error.message === 'query is undefined') {
          error = t('messages.error.session.expired')
        }

        if (error.message.includes('modification-failed')) {
          error = t('messages.error.modification.failed')
        }

        $notification.error(error)
      })
  }
  myTextField.value?.blur?.()
}

function restore () {
  currentText.value = consolidatedText.value
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
:deep(.v-field__input) {
  min-height: 28px !important;
  padding-bottom: 0 !important;
}

:deep(.v-input__details) {
  display: none;
}
</style>
