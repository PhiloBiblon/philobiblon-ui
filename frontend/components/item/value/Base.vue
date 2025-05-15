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
      :deletable="deletable"
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
    reference: {
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
    deletable: {
      type: Boolean,
      default: true
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
    async editValue (editableData) {
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
        if (!this.value.hash) {
          const res = await this.$wikibase.getWbEdit().qualifier.add({
            guid: this.claim.id,
            value: editableData.values.newValue,
            property: this.value.property
          }, this.$store.getters['auth/getRequestConfig'])
          this.$emit('create-qualifier', res.claim.qualifiers[this.value.property])
          return res
        } else {
          return this.$wikibase.getWbEdit().qualifier.update({
            guid: this.claim.id,
            property: this.value.property,
            oldValue: editableData.values.oldValue,
            newValue: editableData.values.newValue
          }, this.$store.getters['auth/getRequestConfig'])
        }
      } else if (this.type === 'reference') {
        const snaks = Object.entries(this.reference.snaks).reduce((acc, [key, values]) => {
          acc[key] = values.map(v => v.hash === this.value.hash ? editableData.values.newValue : v.datavalue.value.id ?? v.datavalue.value)
          return acc
        }, {})

        return this.setReference(snaks)
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
      } else if (this.type === 'reference') {
        const snaks = Object.entries(this.reference.snaks).reduce((acc, [key, values]) => {
          const filteredValues = values.filter(v => v.hash !== this.value.hash)
          if (filteredValues.length > 0) {
            acc[key] = filteredValues.map(v => v.datavalue.value.id ?? v.datavalue.value)
          }
          return acc
        }, {})

        if (!Object.keys(snaks).length) {
          return this.removeReference()
        } else {
          return this.setReference(snaks)
        }
      } else {
        const res = this.$wikibase.getWbEdit().qualifier.remove({
          guid: this.claim.id,
          hash: this.value.hash
        }, this.$store.getters['auth/getRequestConfig'])
        this.$emit('delete-qualifier', this.value)
        return res
      }
    },
    setReference (snaks) {
      return this.$wikibase.getWbEdit().reference.set({
        snaks,
        guid: this.claim.id,
        hash: this.reference.hash,
        property: this.value.property
      }, this.$store.getters['auth/getRequestConfig']).then((res) => {
        this.$emit('create-reference', res)
        return res
      })
    },
    removeReference () {
      return this.$wikibase.getWbEdit().reference.remove({
        guid: this.claim.id,
        hash: this.reference.hash
      }, this.$store.getters['auth/getRequestConfig']).then((res) => {
        this.$emit('delete-reference', this.reference)
        return res
      })
    }
  }
}
</script>
