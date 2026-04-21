<template>
  <div>
    <template v-if="!isUserLogged">
      <a
        v-if="isImage"
        :href="imageLink"
        target="_blank"
      >
        <v-img
          width="300"
          :src="imageLink"
        />
      </a>
      <a
        v-if="isImage === false"
        :href="valueToView.value"
        target="_blank"
      >
        {{ valueToView.value }}
      </a>
      <v-icon
        v-if="!isImage"
      >
        mdi-link
      </v-icon>
    </template>
    <template v-else>
      <item-util-edit-text-field
        :value="valueToView_.value"
        :save="editValue"
        :delete="deleteValue"
        :mode="mode"
        @new-value="newValue"
        @on-blur="emit('on-blur', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  valueToView: { type: Object, default: null },
  type: { type: String, required: true },
  save: { type: Function, default: null },
  delete: { type: Function, default: null },
  mode: { type: String, default: 'edit' }
})

const emit = defineEmits(['on-blur', 'new-value'])

const { $notification } = useNuxtApp()
const { t } = useI18n()
const authStore = useAuthStore()

const isImage = ref(false)
const imageLink = ref(null)
const valueToView_ = reactive({ ...props.valueToView })
const isUserLogged = computed(() => authStore.isLogged)

onMounted(() => {
  isImageUrl(props.valueToView.value).then((result) => {
    isImage.value = result
    if (result) {
      imageLink.value = props.valueToView.value
    }
  })
})

function newValue (value) {
  const valid = isURL(value)
  if (!valid) {
    $notification.error(t('item.messages.invalid_url'))
    value = ''
  }
  emit('new-value', value)
}

function editValue (nv, ov) {
  return props.save(getUrlValue(nv, ov))
}

function deleteValue () {
  return props.delete()
}

function getUrlValue (nv, ov) {
  const valid = isURL(nv)
  const message = valid ? '' : t('item.messages.invalid_url')
  return {
    validation: { valid, message },
    values: { newValue: nv, oldValue: ov }
  }
}

function isURL (str) {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
  return urlRegex.test(str)
}

function isImageUrl (url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}
</script>
