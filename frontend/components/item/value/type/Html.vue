<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span v-html="valueToView.value" />
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    isUserLogged: {
      type: Boolean,
      default: false
    },
    valueToView: {
      type: Object,
      default: null
    },
    save: {
      type: Function,
      required: true
    }
  }
}
</script>
