<template>
  <div>
    <template v-if="!isUserLogged">
      {{ valueToView.value }} <sup>{{ valueToView.calendar }}</sup>
    </template>
    <template v-else>
      <item-util-edit-text-field :save="editValue" type="date" :value="valueToView_.value" />
    </template>
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
      valueToView_: { ...this.valueToView }
    }
  },
  methods: {
    editValue (newValue) {
      return this.save(this.getTimeValue(newValue))
    },
    getTimeValue (value) {
      return {
        validation: {
          valid: true
        },
        values: {
          oldValue: this.valueToView.value,
          newValue: {
            ...this.valueToView_.datavalue.value,
            time: this.formatDate(value)
          }
        }
      }
    },
    formatDate (dateString) {
      const date = new Date(dateString)
      const isoYear = date.getUTCFullYear()
      const isoMonth = ('0' + (date.getUTCMonth() + 1)).slice(-2)
      const isoDay = ('0' + date.getUTCDate()).slice(-2)

      return `+${isoYear}-${isoMonth}-${isoDay}T00:00:00Z`
    }
  }
}
</script>
