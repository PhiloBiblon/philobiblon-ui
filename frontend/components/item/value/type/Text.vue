<template>
  <div>
    <span v-if="!isUserLogged">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="contentView" />
    </span>
    <div v-else>
      <item-util-edit-text-field
        :label="label"
        :value="valueToView_.value"
        :save="editValue"
        :delete="deleteValue"
        :mode="mode"
        @on-blur="emit('on-blur', $event)"
        @new-value="emit('new-value', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  label: { type: String, default: null },
  valueToView: { type: Object, default: null },
  type: { type: String, required: true },
  save: { type: Function, default: null },
  delete: { type: Function, default: null },
  mode: { type: String, default: 'edit' }
})

const emit = defineEmits(['on-blur', 'new-value'])

const { $sanitize } = useNuxtApp()
const authStore = useAuthStore()

const valueToView_ = reactive({ ...props.valueToView })
const isUserLogged = computed(() => authStore.isLogged)
const contentView = computed(() => $sanitize(props.valueToView.value))

function editValue (newValue, oldValue) {
  return props.save(getStringValue(newValue, oldValue))
}

function deleteValue () {
  return props.delete()
}

function getStringValue (newValue, oldValue) {
  return {
    validation: { valid: true },
    values: { newValue, oldValue }
  }
}
</script>
