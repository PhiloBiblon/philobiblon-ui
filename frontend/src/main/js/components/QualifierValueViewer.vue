<template>
  <div class="qualifier-value">
    <value-viewer :value="valueToView" />
  </div>
</template>

<script>
export default {

  props: {
    value: {
      type: Object,
      default: null
    }
  },

  data () {
    return {
      valueToView: null
    }
  },

  async mounted () {
    this.valueToView = await this.$wikibase.getWbValue(this.property, this.value.datatype, this.value.datavalue.value, this.$i18n.locale)
  }
}
</script>

<style scoped>
.qualifier-value {
  font-size: 15px !important;
}
</style>
