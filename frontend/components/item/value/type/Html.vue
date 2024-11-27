<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span v-html="contentView" />
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
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
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    contentView () {
      return this.$sanitize(this.valueToView.value)
    }
  }
}
</script>
