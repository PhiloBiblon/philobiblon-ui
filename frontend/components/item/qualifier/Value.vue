<template>
  <div class="qualifier-value">
    <item-value-base :database="database" :claim="claim" :value="value" type="qualifier" @delete-qualifier="$emit('delete-qualifier', $event)" />
  </div>
</template>

<script>
export default {
  props: {
    database: {
      type: String,
      default: null
    },
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
