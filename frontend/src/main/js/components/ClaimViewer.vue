<template>
  <v-container class="claim">
    <v-row dense>
      <v-subheader class="text-h6 grey--text">
        {{ propertyLabel }}
      </v-subheader>
    </v-row>
    <v-divider />
    <claim-value-viewer
      v-for="(value, index) in claim.values"
      :key="'c-'+claim.property+'-'+index"
      :value="value"
      :key_value="'c-'+claim.property+'-'+index"
    />
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
    await this.$wikibase.getEntity(this.claim.property, this.$i18n.locale).then((entity) => {
      this.propertyLabel = this.$wikibase.getValueByLang(entity.labels, this.$i18n.locale)
    })
  }
}
</script>

<style scoped>
.claim {
  padding-left: 0
}
</style>
