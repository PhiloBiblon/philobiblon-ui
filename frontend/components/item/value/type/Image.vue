<template>
  <div>
    <div v-if="!isUserLogged">
      <a :href="valueToView.descriptionurl" target="_blank">
        <v-img width="300" :src="valueToView.url" />
      </a>
    </div>
    <item-util-edit-text-field
      v-else
      :key="consolidatedUrl"
      :value="consolidatedUrl"
      :save="editValue"
      :delete="deleteValue"
      :mode="mode"
      @on-blur="emit('on-blur', $event)"
      @new-value="emit('new-value', $event)"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
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
const authStore = useAuthStore()

const consolidatedUrl = ref(null)
const isUserLogged = computed(() => authStore.isLogged)

onMounted(() => {
  consolidatedUrl.value = getFileNameFromURL(props.valueToView.url)
})

function editValue (newValue, oldValue) {
  return props.save(getWikiBaseImageValue(newValue, oldValue))
    .then(result => result)
    .catch((error) => {
      $notification.error(error)
    })
}

function getWikiBaseImageValue (newValue, oldValue) {
  return {
    validation: { valid: true },
    values: { newValue, oldValue }
  }
}

function getFileNameFromURL (url) {
  return url.substring(url.lastIndexOf('/') + 1)
}

function deleteValue () {
  return props.delete()
}
</script>
