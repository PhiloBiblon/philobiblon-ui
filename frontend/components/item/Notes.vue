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
    this.loadingContent = false
  },
  methods: {
    async editValue (value) {
      try {
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
