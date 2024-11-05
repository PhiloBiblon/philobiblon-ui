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
    this.contentToView = await this.$wikibase.wbFetcher(wikiApiUrl)
      .then(data => this.contentPage(data))

    this.scrollToHashAndAddScrollBehavior()
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
      const LINK_RE = /\[\[\s*([^\|\]]+)\s*(?:\|\s*([^\]]+)\s*)?\]\]/gm
      return content.replace(LINK_RE, (match, linkTarget, displayText) => this.parseLink(linkTarget, displayText))
    },

    parseLink (linkTarget, displayText) {
      const [langPart, ...pageParts] = linkTarget.split('_')
      const lang = langPart.toLowerCase()
      const page = pageParts.join('_')
      const text = displayText || linkTarget

      return lang !== 'en' ? `<a href='/${lang}/wiki/${page}'>${text}</a>` : `<a href='/wiki/${page}'>${text}</a>`
    },
    scrollToHashAndAddScrollBehavior () {
      this.$nextTick(() => {
        const header = document.querySelector('.v-app-bar--fixed')
        const headerHeight = header ? header.offsetHeight : 0

        const hash = this.$route.hash
        if (hash) {
          const element = document.querySelector(hash)
          if (element) {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
            this.scrollTo(elementPosition - headerHeight)
          }
        }

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
              const offsetPosition = elementPosition - headerHeight
              this.scrollTo(offsetPosition)
            }
          })
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
