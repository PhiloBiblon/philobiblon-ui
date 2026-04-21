<template>
  <div>
    <template v-if="!isUserLogged">
      <item-util-view-text-lang :value="valueToView" />
    </template>
    <template v-else>
      <v-container>
        <v-row dense class="justify-start">
          <v-col dense class="flex-shrink-1">
            <item-util-edit-text-field
              :label="label"
              :value="valueToView_.value"
              :save="editValue"
              :delete="deleteValue"
              :mode="mode"
              @new-value="newTextValue"
              @on-blur="emit('on-blur', $event)"
            />
            <v-select
              v-model="valueToView_.language"
              item-title="title"
              item-value="value"
              :items="languages"
              :label="t('common.language')"
              class="ma-0 pa-0"
              style="width: 100px"
              @update:model-value="onChangeLanguage"
            />
          </v-col>
        </v-row>
      </v-container>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  label: { type: String, default: null },
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
const consolidatedLanguage = ref(props.valueToView.language)
const languages = [
  { title: 'English', value: 'en' },
  { title: 'Español', value: 'es' },
  { title: 'Português', value: 'pt' },
  { title: 'Català', value: 'ca' },
  { title: 'Galego', value: 'gl' },
  { title: '-', value: 'und' }
]

const isUserLogged = computed(() => authStore.isLogged)
const isEditable = computed(() => props.mode === 'edit')

function newTextValue (value) {
  valueToView_.value = value
  emit('new-value', getMonolingualTextNewValue(valueToView_.value))
}

function onChangeLanguage () {
  if (isEditable.value) {
    props.save(getMonolingualTextValue(valueToView_.value, valueToView_.value))
      .then((response) => {
        if (response) {
          if (!response.success) {
            throw new Error(response.info)
          }
          consolidatedLanguage.value = valueToView_.language
          $notification.success(t('messages.success.updated'))
        }
      })
  }
  emit('new-value', getMonolingualTextNewValue(valueToView_.value))
}

function editValue (newValue, oldValue) {
  valueToView_.value = newValue
  return props.save(getMonolingualTextValue(newValue, oldValue))
}

function getMonolingualTextValue (newValue, oldValue) {
  return {
    validation: { valid: true },
    values: {
      oldValue: {
        text: oldValue,
        language: consolidatedLanguage.value
      },
      newValue: getMonolingualTextNewValue(newValue)
    }
  }
}

function getMonolingualTextNewValue (value) {
  return {
    text: value,
    language: valueToView_.language
  }
}

function deleteValue () {
  return props.delete()
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
