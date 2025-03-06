<template>
  <div class="reference-value">
    <item-value-base
      :claim="claim"
      :value="value"
      type="reference"
      :reference="reference"
      @create-reference="$emit('create-reference', $event)"
      @delete-reference="$emit('delete-reference', $event)"
    />
  </div>
</template>

<script>
export default {
  props: {
    claim: {
      type: Object,
      required: true
    },
    reference: {
      type: Object,
      required: true
    },
    value: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.reference-value {
  font-size: 15px !important;
}
</style>
