<template>
  <div>
    <span class="text-subtitle-2 grey--text">
      <item-util-view-text-lang :value="propertyLabel" :tooltip="property" />
    </span>
    <item-qualifier-value
      v-for="(value, index) in values"
      :key="keyValue + '-' + index"
      :value="value"
      :claim="claim"
      :key_value="keyValue + '-' + index"
    />
  </div>
</template>

<script>
export default {
  props: {
    claim: {
      type: Object,
      default: null
    },
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
    await this.$wikibase
      .getEntity(this.property, this.$i18n.locale)
      .then((entity) => {
        this.propertyLabel = this.$wikibase.getValueByLang(
          entity.labels,
          this.$i18n.locale
        )
      })
  }
}
</script>
