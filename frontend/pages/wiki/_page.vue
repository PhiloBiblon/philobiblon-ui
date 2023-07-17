<template>
  <v-container>
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
    this.wikiPage = `${this.$i18n.locale}_${this.pageName}`
  },

  async mounted () {
    this.$store.commit('breadcrumb/setItems', [
      {
        text: this.$i18n.t(this.pageName),
        disabled: true
      }
    ])
    const wikiApiUrl = `${this.$config.wikibaseApiUrl}?action=parse&page=${this.wikiPage}&prop=wikitext&formatversion=2&format=json&origin=*`
    this.contentToView = await fetch(wikiApiUrl)
      .then(response => response.json())
      .then(data => this.contentPage(data))
  },

  methods: {
    contentPage (data) {
      if (data.error) {
        return `Error rendering page '${this.wikiPage}': ${data.error.info}`
      } else {
        return this.parseLinks(data.parse.wikitext)
      }
    },

    parseLinks (content) {
      // eslint-disable-next-line no-useless-escape
      const LINK_RE = /\[\[([^\|]*)\|?(.*)?\]\]/g
      return content.replace(LINK_RE, (match, g1, g2) => this.parseLink(match, g1, g2))
    },

    parseLink (match, g1, g2) {
      let link = g1
      if (!link.startsWith('/') || !link.startsWith('http')) {
        link = '/wiki/' + link
      }
      const text = g2 !== undefined ? g2 : g1
      return `<a href='${this.localePath(link)}'>${text}</a>`
    }
  }
}
</script>
