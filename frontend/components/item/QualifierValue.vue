<template>
  <div class="qualifier-value">
    <item-value-base :claim="claim" :value="value" type="qualifier" />
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
