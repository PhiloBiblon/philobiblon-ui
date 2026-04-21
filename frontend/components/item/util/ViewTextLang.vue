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
    <sup v-if="value.showLanguage || (value.language && value.language != locale)">{{ value.language }}</sup>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  value: { type: Object, default: null },
  tooltip: { type: String, default: null }
})

const { $sanitize, $wikibase } = useNuxtApp()
const { locale } = useI18n()
const localePath = useLocalePath()

const contentView = computed(() => $sanitize(props.value.value))

function getUrlFromPBID (item) {
  return localePath('/item/' + item)
}

function getUrlForWikibase (item) {
  return $wikibase.getQItemUrl(item)
}
</script>
