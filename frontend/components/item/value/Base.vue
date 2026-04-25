<template>
  <div v-if="valueToView">
    <component
      :is="typeComponentMap[valueToView.type]"
      v-if="valueToView.type"
      :label="label"
      :type="type"
      :save="isEditable ? editValue : null"
      :delete="isEditable ? deleteValue : null"
      :mode="mode"
      :value-to-view="valueToView"
      @on-blur="emit('on-blur', $event)"
      @new-value="emit('new-value', $event)"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'
import TypeText from '~/components/item/value/type/Text.vue'
import TypeEntity from '~/components/item/value/type/Entity.vue'
import TypeExternalId from '~/components/item/value/type/ExternalId.vue'
import TypeImage from '~/components/item/value/type/Image.vue'
import TypeQuantity from '~/components/item/value/type/Quantity.vue'
import TypeTextLang from '~/components/item/value/type/TextLang.vue'
import TypeTime from '~/components/item/value/type/Time.vue'
import TypeUrl from '~/components/item/value/type/Url.vue'

const typeComponentMap = {
  'text': TypeText,
  'entity': TypeEntity,
  'external-id': TypeExternalId,
  'image': TypeImage,
  'quantity': TypeQuantity,
  'text-lang': TypeTextLang,
  'time': TypeTime,
  'url': TypeUrl
}

const props = defineProps({
  claim: { type: Object, default: null },
  reference: { type: Object, default: null },
  label: { type: String, default: null },
  value: { type: Object, default: null },
  type: { type: String, default: null },
  mode: { type: String, default: 'edit' }
})

const emit = defineEmits(['on-blur', 'new-value', 'delete-claim', 'delete-qualifier', 'create-reference', 'delete-reference'])

const { $notification, $wikibase } = useNuxtApp()
const { locale } = useI18n()
const authStore = useAuthStore()

const valueToView = ref(null)
const isEditable = computed(() => props.mode === 'edit')

onMounted(async () => {
  const result = await $wikibase.getWbValue(
    props.value.property,
    props.value.datatype,
    props.value.datavalue?.value,
    locale.value
  )
  if (result) {
    result.useDefault = props.value.datavalue?.default !== false
  }
  valueToView.value = result
})

function editValue (editableData) {
  if (!editableData.validation.valid ||
    (JSON.stringify(editableData.values.newValue) === JSON.stringify(editableData.values.oldValue))) {
    if (editableData.validation.message) {
      $notification.error(editableData.validation.message)
    }
    return Promise.resolve()
  }

  if (props.type === 'claim') {
    return $wikibase.getWbEdit().claim.update({
      guid: props.claim.id,
      newValue: editableData.values.newValue
    }, authStore.requestConfig)
  } else if (props.type === 'qualifier') {
    return $wikibase.getWbEdit().qualifier.update({
      guid: props.claim.id,
      property: props.value.property,
      oldValue: editableData.values.oldValue,
      newValue: editableData.values.newValue
    }, authStore.requestConfig)
  } else if (props.type === 'reference') {
    const snaks = Object.entries(props.reference.snaks).reduce((acc, [key, values]) => {
      acc[key] = values.map(v => v.hash === props.value.hash ? editableData.values.newValue : v.datavalue.value.id ?? v.datavalue.value)
      return acc
    }, {})

    return setReference(snaks)
  } else {
    console.error(`Unknown type to edit: ${props.type}`)
  }
}

function deleteValue () {
  if (props.type === 'claim') {
    const res = $wikibase.getWbEdit().claim.remove({
      guid: props.claim.id
    }, authStore.requestConfig)
    emit('delete-claim', props.claim)
    return res
  } else if (props.type === 'reference') {
    const snaks = Object.entries(props.reference.snaks).reduce((acc, [key, values]) => {
      const filteredValues = values.filter(v => v.hash !== props.value.hash)
      if (filteredValues.length > 0) {
        acc[key] = filteredValues.map(v => v.datavalue.value.id ?? v.datavalue.value)
      }
      return acc
    }, {})

    if (!Object.keys(snaks).length) {
      return removeReference()
    } else {
      return setReference(snaks)
    }
  } else {
    const res = $wikibase.getWbEdit().qualifier.remove({
      guid: props.claim.id,
      hash: props.value.hash
    }, authStore.requestConfig)
    emit('delete-qualifier', props.value)
    return res
  }
}

function setReference (snaks) {
  return $wikibase.getWbEdit().reference.set({
    snaks,
    guid: props.claim.id,
    hash: props.reference.hash,
    property: props.value.property
  }, authStore.requestConfig).then((res) => {
    emit('create-reference', res)
    return res
  })
}

function removeReference () {
  return $wikibase.getWbEdit().reference.remove({
    guid: props.claim.id,
    hash: props.reference.hash
  }, authStore.requestConfig).then((res) => {
    emit('delete-reference', props.reference)
    return res
  })
}
</script>
