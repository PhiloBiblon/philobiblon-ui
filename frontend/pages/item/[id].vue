<template>
  <div class="item">
    <item-base v-if="itemId" :id="itemId" :database="database" :table="table" />
  </div>
</template>

<script>
export default {
  data () {
    return {
      database: null,
      table: null,
      itemId: null
    }
  },
  async created () {
    const paramId = this.$route.params.id
    if (this.$wikibase.getQItemPattern().test(paramId.toUpperCase())) {
      await this.setParametersFromQItem(paramId)
    } else if (this.$wikibase.getPBIDPattern().test(paramId)) {
      await this.setParametersFromPBID(paramId)
    } else {
      this.$notification.error(this.$i18n.t('item.messages.invalid_id'))
    }
  },
  methods: {
    async setParametersFromQItem (qItem) {
      this.database = this.$route.query.database
      this.table = this.$route.query.table

      const entity = await this.$wikibase.getEntity(qItem, this.$i18n.locale)
      const pbid = this.$wikibase.getPBID(entity, this.database, this.table)
      if (!pbid) {
        this.$notification.error(this.$i18n.t('item.messages.not_found'))
      } else {
        const parsedPBID = this.$wikibase.parsePBID(pbid)
        if (!this.database || this.database === 'ALL') {
          this.database = parsedPBID.group
        }
        if (!this.table) {
          this.table = parsedPBID.tableid
        }
        this.itemId = qItem.toUpperCase()
      }
    },
    async setParametersFromPBID (pbid) {
      const qItem = await this.$wikibase.getEntityFromPBID(pbid)
      if (qItem === null) {
        this.$notification.error(this.$i18n.t('item.messages.not_found'))
      } else {
        const parsedPBID = this.$wikibase.parsePBID(pbid)
        this.database = parsedPBID.group
        this.table = parsedPBID.tableid
        this.itemId = qItem
      }
    }
  }
}
</script>

<style scoped>
.item {
  width: 100% !important
}
</style>
