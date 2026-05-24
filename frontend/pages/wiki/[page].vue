<template>
  <v-container>
    <search-simple />
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="contentToView" v-html="contentToView" />
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBreadcrumbStore } from '~/stores/breadcrumb'

const { $wikibase, $sanitize } = useNuxtApp()
const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const breadcrumbStore = useBreadcrumbStore()
const baseURL = useRuntimeConfig().app.baseURL.replace(/\/$/, '')

const pageName = route.params.page
const wikiPage = getWikiPage(pageName)
const contentToView = ref(null)

onMounted(async () => {
  breadcrumbStore.setItems([
    { title: t(removeLocalePrefix(pageName)), disabled: true }
  ])
  const html = await $wikibase.getWikibasePage(wikiPage).then(contentPage)
  contentToView.value = prepareContent(html)
})

function prepareContent (html) {
  return $sanitize(html)
    .replaceAll('<a href="#', '<a href="' + window.location.pathname + '#')
    .replaceAll('<blockquote>', '<blockquote style="padding-left: 50px;">')
    .replace(/href="(?!https?:|\/|#|mailto:)([^"]+)"/g, (_, path) => {
      const hasLocale = ['en', 'ca', 'es', 'gl', 'pt'].some(l => path.startsWith(l + '/'))
      return hasLocale ? `href="${baseURL}/${path}"` : `href="${baseURL}/${locale.value}/${path}"`
    })
}

function getWikiPage (page) {
  let localePrefix = getLocalePrefix(page)
  if (localePrefix === null) {
    localePrefix = locale.value
  } else {
    page = removeLocalePrefix(page)
  }
  return `${localePrefix}_${page}`
}

function getLocalePrefix (page) {
  const regex = /^[a-z]{2}_/
  if (regex.test(page)) {
    return page.split('_')[0]
  }
  return null
}

function removeLocalePrefix (page) {
  const regex = /^[a-z]{2}_/
  if (regex.test(page)) {
    page = page.split('_')[1]
  }
  return page
}

function contentPage (data) {
  if (data.error) {
    return `Error rendering page '${wikiPage}': ${data.error.info}`
  } else {
    return parseLinks(data.parse.wikitext)
  }
}

function parseLinks (content) {
  const EXTERNAL_LINK_RE = /\[(https?:\/\/[^\s\]]+)(?:\s([^\]]*))?\]/g
  const INTERNAL_LINK_RE = /\[\[([^\]|]*)\|([^\]]*)\]\]/g
  return content
    .replace(EXTERNAL_LINK_RE, (match, url, text) => `<a href='${url}' target='_blank' rel='noopener noreferrer'>${text || url}</a>`)
    .replace(INTERNAL_LINK_RE, (match, g1, g2) => parseInternalLink(g1, g2))
}

function parseInternalLink (link, text) {
  if (!link.startsWith('/')) {
    link = `/wiki/${link}`
  }
  return `<a href='${baseURL}${localePath(link)}'>${text || link}</a>`
}
</script>

<style scoped>
:deep([id]) {
  scroll-margin-top: 64px;
}
</style>
