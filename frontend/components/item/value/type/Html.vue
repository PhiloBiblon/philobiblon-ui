<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span v-html="valueToView.value" />
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    valueToView: {
      type: Object,
      default: null
    }
  }
}
</script>
