<template>
  <div class="qualifier-value">
    <item-value-base
      :deletable="!!value?.hash"
      :claim="claim"
      :value="value"
      type="qualifier"
      @create-qualifier="$emit('create-qualifier', $event)"
      @delete-qualifier="$emit('delete-qualifier', $event)"
    />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: null
    },
    claim: {
      type: Object,
      default: null
    }
  }
}
</script>

<style scoped>
.qualifier-value {
  font-size: 15px !important;
}
</style>
