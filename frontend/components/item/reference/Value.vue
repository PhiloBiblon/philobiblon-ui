<template>
  <div class="reference-value">
    <item-value-base
      :database="database"
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
    database: {
      type: String,
      default: null
    },
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
