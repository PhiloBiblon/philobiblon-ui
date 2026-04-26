<template>
  <v-autocomplete
    ref="autocomplete"
    v-model="currentText"
    :items="options"
    item-value="id"
    item-title="label"
    return-object
    required
    variant="underlined"
    density="compact"
    v-bind="$attrs"
    @blur="blur"
    @focus="focus"
    @update:model-value="onchange"
    @update:search="emit('input', $event)"
  >
    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps" :title="item.raw.label">
        <template v-if="item.raw.description" #subtitle>
          <span class="item-description">{{ item.raw.description }}</span>
        </template>
      </v-list-item>
    </template>
    <template #append-inner>
      <v-btn
        v-if="isEditable && focussed"
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
        v-if="isRemovable && focussed"
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
  </v-autocomplete>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  value: { type: String, default: null },
  options: { type: Array, default: () => [] },
  save: { type: Function, default: null },
  delete: { type: Function, default: null },
  mode: { type: String, default: 'edit' }
})

const emit = defineEmits(['on-blur', 'new-value', 'input', 'update-options'])

const { $notification } = useNuxtApp()
const { t } = useI18n()

const autocomplete = ref(null)
const currentText = ref(null)
const consolidatedText = ref(null)
const consolidatedOptions = ref([])
const focussed = ref(false)

const isEditable = computed(() => props.mode === 'edit')
const isRemovable = computed(() => isEditable.value && !!props.delete)

watch(() => props.value, (newValue, oldValue) => {
  currentText.value = newValue
  if (!oldValue) {
    consolidatedText.value = currentText.value
  }
})

onMounted(() => {
  if (props.value) {
    currentText.value = props.value
  } else if (props.options && props.options.length > 0) {
    currentText.value = { ...props.options[0] }
  } else {
    currentText.value = null
  }
  consolidatedText.value = currentText.value ? { ...currentText.value } : null
  consolidatedOptions.value = JSON.parse(JSON.stringify(props.options))
})

function onchange () {
  focussed.value = true
  emit('new-value', currentText.value)
}

function focus () {
  focussed.value = true
}

function blur () {
  focussed.value = false
  if (isEditable.value) {
    restore()
  }
  emit('on-blur', currentText.value)
}

async function edit () {
  if (currentText.value && currentText.value.id !== consolidatedText.value.id) {
    await props.save(currentText.value, consolidatedText.value)
      .then((response) => {
        if (response) {
          if (!response.success) {
            throw new Error(response.info)
          }
          consolidatedText.value = currentText.value
          $notification.success(t('messages.success.updated'))
          autocomplete.value?.blur?.()
        }
      })
      .catch((error) => {
        if (error.message === 'query is undefined') {
          error = t('messages.error.session.expired')
        }
        $notification.error(error)
      })
  } else if (!currentText.value) {
    $notification.error(t('messages.error.inputs.fill'))
  }
}

function restore () {
  currentText.value = consolidatedText.value
  consolidatedOptions.value = [currentText.value]
  emit('update-options', consolidatedOptions.value)
  autocomplete.value?.blur?.()
}

async function deleteValue () {
  await props.delete()
    .then((response) => {
      if (response) {
        if (!response.success) {
          throw new Error(response.info)
        }
        $notification.success(t('messages.success.deleted'))
      }
    })
    .catch((error) => {
      if (error.message === 'query is undefined') {
        error = t('messages.error.session.expired')
      }
      $notification.error(error)
    })
}
</script>

<style scoped>
.item-description {
  font-weight: normal;
  font-size: 0.8rem;
  color: #666;
  margin-top: 2px;
}

:deep(.v-input__details) {
  display: none;
}

:deep(.v-field__input) {
  min-height: 28px !important;
  padding-bottom: 0 !important;
}
</style>
