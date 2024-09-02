<template>
  <span v-html="contentView" />
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
  },
  computed: {
    contentView() {
      return this.$sanitize(this.valueToView.value);
    }
  }
}
</script>
