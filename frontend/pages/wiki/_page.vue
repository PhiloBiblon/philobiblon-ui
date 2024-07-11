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
    this.contentToView = await this.$wikibase.wbFetcher(wikiApiUrl)
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

<style scoped>
::v-deep .content {
  .data {
    margin-bottom: 10px;
    width: 60%;
    border: 1px solid #e5c992;
    font-weight: normal;
    font-size: 100%;
    color: #000000;

    td {
      border: 1px solid #e5c992;
      padding-left: 3px;
      font-size: 85%;
      color: #000000;
    }
  }

   blockquote {
    margin-left: 24px !important;

  }
}
</style>
