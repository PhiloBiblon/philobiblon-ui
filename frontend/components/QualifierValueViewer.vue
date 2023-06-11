<template>
  <div class="qualifier-value">
    <value-viewer :value="value" />
  </div>
</template>

<script>
export default {

  props: {
    value: {
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
