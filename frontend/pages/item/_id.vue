<template>
  <div class="item">
    <item-base v-if="itemId" :id="itemId" />
  </div>
</template>

<script>
export default {
  data () {
    return {
      itemId: null
    }
  },

  async created () {
    const paramId = this.$route.params.id
    if (this.$wikibase.getQItemPattern().test(paramId.toUpperCase())) {
      this.itemId = paramId.toUpperCase()
    } else if (this.$wikibase.getPBIDPattern().test(paramId)) {
      this.itemId = await this.$wikibase.getEntityFromPBID(paramId)
      if (this.itemId === null) {
        this.$notification.error(this.$i18n.t('item.messages.not_found'))
      }
    } else {
      this.$notification.error(this.$i18n.t('item.messages.invalid_id'))
    }
  }
}
</script>

<style scoped>
.item {
  width: 100% !important
}
</style>
