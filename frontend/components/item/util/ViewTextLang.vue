<template>
  <span v-if="value && value.value">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span v-html="value.value" />
    <sup v-if="value.showLanguage || (value.language && value.language != $i18n.locale)">{{ value.language }}</sup>
  </span>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: Object,
      default: null
    }
  }
}
</script>
