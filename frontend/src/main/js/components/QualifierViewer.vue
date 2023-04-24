<template>
  <v-col class="qualifier" cols="3">
    <span class="text-subtitle-2 grey--text">{{ propertyLabel }}</span>
    <qualifier-value-viewer
      v-for="(value, index) in values"
      :key="keyValue+'-'+index"
      :value="value"
      :key_value="keyValue+'-'+index"
    />
  </v-col>
</template>

<script>
export default {

  props: {
    keyValue: {
      type: String,
      default: null
    },
    property: {
      type: String,
      default: null
    },
    values: {
      type: Array,
      default: null
    }
  },

  data () {
    return {
      propertyLabel: null
    }
  },

  async mounted () {
    await this.$wikibase.getEntity(this.property, this.$i18n.locale).then((entity) => {
      this.propertyLabel = this.$wikibase.getValueByLang(entity.labels, this.$i18n.locale)
    })
  }
}
</script>

<style scoped>
.qualifier {
  padding-top: 5px;
  padding-left: 50px;
}
</style>
