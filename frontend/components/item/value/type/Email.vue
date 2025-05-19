<template>
  <div>
    <template v-if="!isUserLogged">
      <a :href="`${valueToView.value}`">
        {{ valueToView_.value }}
      </a>
    </template>
    <template v-else>
      <item-util-edit-text-field
        :value="valueToView_.value"
        :save="editValue"
        :delete="!deletable ? null : deleteValue"
        :mode="mode"
        @new-value="newValue"
      />
    </template>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    valueToView: {
      type: Object,
      default: null
    },
    save: {
      type: Function,
      default: null
    },
    delete: {
      type: Function,
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
      valueToView_: { ...this.valueToView }
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    }
  },
  methods: {
    newValue (value) {
      value = value.replace(/^mailto:/i, '')
      const valid = this.isEmail(value)
      if (!valid) {
        value = ''
      }
      this.$emit('new-value', value)
    },
    editValue (newValue, oldValue) {
      return this.save(this.getEmailValue(newValue, oldValue))
    },
    deleteValue () {
      return this.delete()
    },
    getEmailValue (newValue, oldValue) {
      newValue = newValue.replace(/^mailto:/i, '')
      const valid = this.isEmail(newValue)
      const message = valid ? '' : this.$i18n.t('item.messages.invalid_email')
      newValue = `mailto:${newValue}`
      return {
        validation: {
          valid,
          message
        },
        values: {
          newValue,
          oldValue
        }
      }
    },
    isEmail (str) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(str)
    }
  }
}
</script>
