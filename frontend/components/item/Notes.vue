<template>
  <div class="notes">
    <div v-if="loadingContent">
      {{ $t('common.loading' ) }}
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span v-else-if="!isUserLogged" v-html="contentView" />
    <item-util-edit-quill-field v-else :save="editValue" :value="content?.value" />
  </div>
</template>

<script>

export default {
  props: {
    itemId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      content: null,
      loadingContent: false
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    contentView () {
      return this.$sanitize(this.content?.value)
    }
  },
  async mounted () {
    this.loadingContent = true
    this.content = await this.$wikibase.getDiscussionPage(this.itemId)
    this.$emit('has-notes', !!this.content?.value)
    if (this.content?.value) {
      this.content.value = this.convertWikiLinksToHtml(this.content.value)
    }
    this.loadingContent = false
  },
  methods: {
    async editValue (value) {
      try {
        value = this.convertHtmlLinksToWiki(value)
        const response = await this.$wikibase.updateDiscussionPage(this.itemId, value)
        if (response.status === 200) {
          const data = await response.json()
          if (data.edit?.result === 'Success') {
            this.content.value = value
            this.$notification.success(this.$t('messages.success.updated'))
          } else {
            this.$notification.error(`Error editing notes page: ${data.error?.info}`)
          }
        } else {
          this.$notification.error(`HTTP error editing notes: ${response.status}`)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error editing notes:', error)
        this.$notification.error(`Error editing notes: ${error}`)
      }
    },
    convertWikiLinksToHtml (content) {
      // convert external links
      content = content.replace(/\[(https?:\/\/[^\s\]]+)(?:\s([^\]]+))?\]/g, (match, url, label) => {
        label = label || url
        label = label.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        return `<a href="${url}" target="_blank">${label}</a>`
      })
      // convert internal links
      content = content.replace(/\[\[(.+?)\]\]/g, (match, inner) => {
        let [target, label] = inner.split('|')
        label = label || target

        label = label.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')

        target = target.trim()
        let url = target
        if (target.startsWith('Item:')) {
          target = target.replace(/^Item:/, '')
          url = this.$wikibase.getQItemUrl(target)
        }

        return `<a href="${url}" target="_blank">${label}</a>`
      })

      return content
    },
    convertHtmlLinksToWiki (content) {
      return content.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, (match, href, text) => {
        const cleanHref = href.trim()
        const cleanText = text.trim()

        const wikibasePrefix = this.$config.wikibaseBaseUrl + '/wiki/'
        const isInternal = cleanHref.startsWith(wikibasePrefix)

        if (isInternal) {
          // convert internal links
          const internalTarget = cleanHref.slice(wikibasePrefix.length)
          if (internalTarget === cleanText) {
            return `[[${internalTarget}]]`
          } else {
            return `[[${internalTarget}|${cleanText}]]`
          }
        } else {
          // convert external links
          /* eslint-disable-next-line no-lonely-if */
          if (cleanHref === cleanText) {
            return `[${cleanHref}]`
          } else {
            return `[${cleanHref} ${cleanText}]`
          }
        }
      })
    }
  }
}

</script>

<style scoped>
.notes {
  background-color: rgb(247, 245, 245);
}

.notes {
  overflow: visible;
  padding-left: 1.5em;
}

.notes ul,
.notes ol {
  list-style-position: inside;
  padding-left: 0;
  margin-left: 0;
}

.notes li {
  margin-bottom: 0.5em;
}
</style>
