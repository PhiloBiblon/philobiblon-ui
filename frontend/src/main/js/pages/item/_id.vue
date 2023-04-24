<template>
  <div class="item">
    <item-viewer v-if="itemId" :id="itemId" />
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
    if (this.$wikibase.getQItemPattern().test(paramId)) {
      this.itemId = paramId
    } else if (this.$wikibase.getPBIDPattern().test(paramId)) {
      this.itemId = await this.$wikibase.getEntityFromPBID(paramId)
      if (this.itemId === null) {
        this.$notification.error(this.$i18n.t('item.not_found'))
      }
    } else {
      this.$notification.error(this.$i18n.t('item.invalid_id'))
    }
  }
}
</script>

<style scoped>
.item {
  width: 100% !important
}
</style>
