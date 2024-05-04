<template>
  <div>
    <span v-if="!isUserLogged">
      {{ valueToView.value.amount }} <item-util-view-text-lang :value="unitLabel" />
    </span>
    <div v-else>
      <!-- not implemented -->>
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    isUserLogged: {
      type: Boolean,
      default: false
    },
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
      valueToView_: { ...this.valueToView },
      unitLabel: null
    }
  },
  async mounted () {
    await this.$wikibase
      .getEntity(this.extractItemNumber(this.valueToView.value.unit), this.$i18n.locale)
      .then((entity) => {
        this.unitLabel = this.$wikibase.getValueByLang(
          entity.labels,
          this.$i18n.locale
        )
      })
  },
  methods: {
    extractItemNumber (url) {
      return url.substring(url.lastIndexOf('/') + 1)
    },
    editValue (newValue, oldValue) {
      return this.save(this.getStringValue(newValue, oldValue))
    },
    getStringValue (newValue, oldValue) {
      return {
        validation: {
          valid: true
        },
        values: {
          newValue,
          oldValue
        }
      }
    }
  }
}
</script>
