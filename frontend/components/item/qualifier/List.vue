<template>
  <div>
    <item-qualifier-value
      v-for="(qualifier, index) in values"
      :key="index + '-' + values.length"
      :claim="claim"
      :value="qualifier"
      @delete-qualifier="deleteQualifier($event)"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  claim: { type: Object, default: null },
  qualifiers: { type: Array, default: null }
})

const emit = defineEmits(['delete-qualifier'])

const values = ref([])

onMounted(() => {
  values.value = [...props.qualifiers]
})

function deleteQualifier (data) {
  const findIndex = values.value.findIndex(item => item.hash === data.hash)
  if (findIndex !== -1) {
    values.value.splice(findIndex, 1)
  }
  emit('delete-qualifier', data)
}
</script>
