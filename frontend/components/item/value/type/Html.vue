<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span v-if="!isUserLogged" v-html="contentView" />
  <item-util-edit-quill-field v-else :save="editValue" :value="valueToView_.value" />
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    valueToView: {
      type: Object,
      default: null
    },
    save: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      valueToView_: { ...this.valueToView }
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    contentView () {
      return this.$sanitize(this.valueToView.value)
    }
  },
  methods: {
    async editValue (value) {
      try {
        return await this.$wikibase.updateDiscussionPage(this.valueToView.title, value)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error editing page:', error)
      }
    }
  }
}
</script>
