<template>
  <a
    :href="valueToView.descriptionurl"
    target="_blank"
  ><v-img
    width="300"
    :src="valueToView.url"
  /></a>
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
