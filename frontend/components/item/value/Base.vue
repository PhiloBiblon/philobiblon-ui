<template>
  <div v-if="valueToView">
    <component
      :is="`item-value-type-${valueToView.type}`"
      v-if="valueToView.type"
      :label="label"
      :type="type"
      :save="isEditable ? editValue : null"
      :delete="isEditable ? deleteValue : null"
      :mode="mode"
      :value-to-view="valueToView"
      @new-value="$emit('new-value', $event)"
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
    label: {
      type: String,
      default: null
    },
    value: {
      type: Object,
      default: null
    },
    type: {
      type: String,
      default: null
    },
    mode: {
      type: String,
      default: 'edit'
    }
  },
  data () {
    return {
      valueToView: null
    }
  },
  computed: {
    isEditable () {
      return this.mode === 'edit'
    }
  },
  async mounted () {
    this.valueToView = await this.$wikibase.getWbValue(
      this.value.property,
      this.value.datatype,
      this.value.datavalue?.value,
      this.$i18n.locale
    )
  },
  methods: {
    editValue (editableData) {
      if (!editableData.validation.valid ||
        (JSON.stringify(editableData.values.newValue) === JSON.stringify(editableData.values.oldValue))) {
        if (editableData.validation.message) {
          this.$notification.error(editableData.validation.message)
        }
        return new Promise((resolve, _reject) => {
          return resolve()
        })
      }

      if (this.type === 'claim') {
        return this.$wikibase.getWbEdit().claim.update({
          guid: this.claim.id,
          newValue: editableData.values.newValue
        },
        this.$store.getters['auth/getRequestConfig'])
      } else if (this.type === 'qualifier') {
        return this.$wikibase.getWbEdit().qualifier.update({
          guid: this.claim.id,
          property: this.value.property,
          oldValue: editableData.values.oldValue,
          newValue: editableData.values.newValue
        },
        this.$store.getters['auth/getRequestConfig'])
      } else {
        // eslint-disable-next-line no-console
        console.error(`Unknown type to edit: ${this.type}`)
      }
    },
    deleteValue () {
      if (this.type === 'claim') {
        const res = this.$wikibase.getWbEdit().claim.remove({
          guid: this.claim.id
        }, this.$store.getters['auth/getRequestConfig'])
        this.$emit('delete-claim', this.claim)
        return res
      } else {
        const res = this.$wikibase.getWbEdit().qualifier.remove({
          guid: this.claim.id,
          hash: this.value.hash
        }, this.$store.getters['auth/getRequestConfig'])
        this.$emit('delete-qualifier', this.value)
        return res
      }
    }
  }
}
</script>
