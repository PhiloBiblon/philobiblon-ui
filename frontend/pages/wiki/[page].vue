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

const pageName = route.params.page
const wikiPage = getWikiPage(pageName)
const contentToView = ref(null)

onMounted(async () => {
  breadcrumbStore.setItems([
    { text: t(removeLocalePrefix(pageName)), disabled: true }
  ])
  const html = await $wikibase.getWikibasePage(wikiPage).then(contentPage)
  contentToView.value = prepareContent(html)
})

function prepareContent (html) {
  return $sanitize(html)
    .replaceAll('<a href="#', '<a href="' + window.location.pathname + '#')
    .replaceAll('<a id=', '<a style="padding-top: 50px;" id=')
    .replaceAll('<blockquote>', '<blockquote style="padding-left: 50px;">')
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
  const LINK_RE = /\[\[([^\]|]*)\|([^\]]*)\]\]/g
  return content.replace(LINK_RE, (match, g1, g2) => parseLink(match, g1, g2))
}

function parseLink (match, g1, g2) {
  let link = g1
  const text = g2 !== undefined ? g2 : g1
  if (link.startsWith('/') || link.startsWith('http')) {
    return `<a href='${link}'>${text}</a>`
  } else {
    link = `/wiki/${link}`
    return `<a href='.${localePath(link)}'>${text}</a>`
  }
}
</script>
