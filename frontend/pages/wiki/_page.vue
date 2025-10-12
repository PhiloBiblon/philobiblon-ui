<template>
  <v-container>
    <search-simple />
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div if="contentToView" v-html="contentToView" />
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      pageName: null,
      wikiPage: null,
      contentToView: null
    }
  },

  created () {
    this.pageName = this.$route.params.page
    this.wikiPage = this.getWikiPage(this.pageName)
  },

  async mounted () {
    this.$store.commit('breadcrumb/setItems', [
      {
        text: this.$i18n.t(this.removeLocalePrefix(this.pageName)),
        disabled: true
      }
    ])
    const html = await this.$wikibase.getWikibasePage(this.wikiPage)
      .then(data => this.contentPage(data))
    this.contentToView = this.prepareContent(html)
  },

  methods: {
    prepareContent (html) {
      return this.$sanitize(html)
        .replaceAll('<a href="#', '<a href="' + window.location.pathname + '#')
        .replaceAll('<a id=', '<a style="padding-top: 50px;" id=')
        .replaceAll('<blockquote>', '<blockquote style="padding-left: 50px;">')
    },
    getWikiPage (pageName) {
      let localePrefix = this.getLocalePrefix(pageName)
      if (localePrefix === null) {
        localePrefix = this.$i18n.locale
      } else {
        pageName = this.removeLocalePrefix(pageName)
      }
      return `${localePrefix}_${pageName}`
    },
    getLocalePrefix (page) {
      const regex = /^[a-z]{2}_/
      if (regex.test(page)) {
        return page.split('_')[0]
      }
      return null
    },
    removeLocalePrefix (page) {
      const regex = /^[a-z]{2}_/
      if (regex.test(page)) {
        page = page.split('_')[1]
      }
      return page
    },
    contentPage (data) {
      if (data.error) {
        return `Error rendering page '${this.wikiPage}': ${data.error.info}`
      } else {
        return this.parseLinks(data.parse.wikitext)
      }
    },

    parseLinks (content) {
      const LINK_RE = /\[\[([^\]|]*)\|([^\]]*)\]\]/g
      return content.replace(LINK_RE, (match, g1, g2) => this.parseLink(match, g1, g2))
    },

    parseLink (match, g1, g2) {
      let link = g1
      const text = g2 !== undefined ? g2 : g1
      if (link.startsWith('/') || link.startsWith('http')) {
        return `<a href='${link}'>${text}</a>`
      } else {
        link = `/wiki/${link}`
        return `<a href='.${this.localePath(link)}'>${text}</a>`
      }
    }
  }
}
</script>
