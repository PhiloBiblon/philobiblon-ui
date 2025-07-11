<template>
  <span v-if="value && value.value && contentView">
    <template v-if="value.pbid">
      <NuxtLink :to="getUrlFromPBID(value.item)">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span :title="tooltip" v-html="contentView" />
      </NuxtLink>
    </template>
    <template v-else-if="value.item">
      <a
        :href="getUrlForWikibase(value.item)"
        target="_blank"
        rel="noopener noreferrer"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span :title="tooltip" v-html="contentView" />
      </a>
    </template>
    <template v-else>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span :title="tooltip" v-html="contentView" />
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
    },
    getUrlForWikibase (item) {
      return this.$wikibase.getQItemUrl(item)
    }
  }
}
</script>
