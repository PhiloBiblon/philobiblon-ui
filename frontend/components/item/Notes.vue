<template>
  <div class="notes">
    <div v-if="!content">
      {{ $t('common.loading' ) }}
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span v-else-if="!isUserLogged" v-html="contentView" />
    <item-util-edit-quill-field v-else :save="editValue" :value="content.value" />
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
      content: null
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
    this.content = await this.$wikibase.getDiscussionPage(this.itemId)
  },
  methods: {
    async editValue (value) {
      try {
        const response = await this.$wikibase.updateDiscussionPage(this.content.title, value)
        console.log(response)
        if (response.status === 200) {
          this.content.value = value
          this.$notification.success(this.$t('messages.success.updated'))
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error editing page:', error)
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
