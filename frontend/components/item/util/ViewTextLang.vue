<template>
  <span v-if="value && value.value && contentView">
    <template v-if="value.pbid">
      <NuxtLink :to="getUrlFromPBID(value.item)">
        <span v-safe-html="contentView" :title="tooltip" />
      </NuxtLink>
    </template>
    <template v-else>
      <span v-safe-html="contentView" :title="tooltip" />
    </template>
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
    },
    tooltip: {
      type: String,
      default: null
    }
  },
  computed: {
    contentView () {
      return this.$sanitize(this.value.value)
    }
  },
  methods: {
    getUrlFromPBID (item) {
      return this.localePath('/item/' + item)
    }
  }
}
</script>
