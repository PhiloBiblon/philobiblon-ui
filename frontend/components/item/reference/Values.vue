<template>
  <div>
    <item-reference-value
      v-for="(value, index) in values"
      :key="index + '-' + values.length"
      :claim="claim"
      :value="value"
      :reference="reference"
      @create-reference="emit('create-reference', $event)"
      @delete-reference="emit('delete-reference', $event)"
    />
  </div>
</template>

<script setup>
defineProps({
  claim: { type: Object, required: true },
  reference: { type: Object, required: true },
  values: { type: Array, required: true }
})

const emit = defineEmits(['create-reference', 'delete-reference'])
</script>
