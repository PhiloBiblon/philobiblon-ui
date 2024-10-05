<template>
  <v-container class="claim">
    <v-row dense>
      <v-subheader class="claim-header grey--text">
        <item-util-view-text-lang :value="propertyLabel" :tooltip="claim.property" />
      </v-subheader>
    </v-row>
    <v-container class="claim-values">
      <item-claim-values :claim="claim" />
    </v-container>
  </v-container>
</template>

<script>
export default {
  props: {
    claim: {
      type: Object,
      default: null
    }
  },

  data () {
    return {
      propertyLabel: null
    }
  },

  async mounted () {
    await this.$wikibase
      .getEntity(this.claim.property, this.$i18n.locale)
      .then((entity) => {
        this.propertyLabel = this.$wikibase.getValueByLang(
          entity.labels,
          this.$i18n.locale
        )
      })
  }
}
</script>

<style scoped>
.claim {
  padding: 0;
}
.claim-header {
  font-size: 16px;
}
.claim-values {
  padding: 0;
  background-color: rgb(247, 245, 245);
}
</style>
