<template>
  <v-container>
    <search-simple />
    <div v-if="contentToView" v-safe-html="contentToView" />
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
    this.pageName = this.removeLocalePrefix(this.$route.params.page)
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
    const html = await this.$wikibase.wbFetcher(wikiApiUrl)
      .then(data => this.contentPage(data))
    this.contentToView = this.$sanitize(html)

    this.$nextTick(() => {
      this.addScrollBehavior()
    })
  },

  methods: {
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
      // eslint-disable-next-line no-useless-escape
      const LINK_RE = /\[\[([^\|]*)\|?(.*)?\]\]/g
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
    },

    addScrollBehavior () {
      const header = document.querySelector('#header')
      const headerHeight = header ? header.offsetHeight : 0
      const anchorLinks = document.querySelectorAll('a[href^="#"]')
      anchorLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
          event.preventDefault()
          const targetId = this.getTargetId(link)
          const targetElement = this.getTargetElement(targetId)
          if (targetId === 'top') {
            this.scrollTo(0)
          } else if (targetElement) {
            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset
            const offsetPosition = elementPosition - headerHeight - 80
            this.scrollTo(offsetPosition)
          }
        })
      })
    },

    getTargetId (link) {
      return link.getAttribute('href').substring(1)
    },

    getTargetElement (targetId) {
      return document.querySelector(`a[name="${targetId}"]`) || document.getElementById(targetId)
    },

    scrollTo (top = 0, behavior = 'smooth') {
      window.scrollTo({
        top,
        behavior
      })
    }
  }
}
</script>
