<template>
  <div class="qualifier-value">
    <value-viewer :claim="claim" :index="index" :value="value" type="qualifier" />
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
    },
    index: {
      type: Number,
    },
  }

}
</script>

<style scoped>
.qualifier-value {
  font-size: 15px !important;
}
</style>
