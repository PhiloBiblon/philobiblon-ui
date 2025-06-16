<template>
  <div>
    <span v-if="!isUserLogged">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="contentView" />
    </span>
    <div v-else>
      <item-util-edit-text-field
        :label="label"
        :value="valueToView_.value"
        :save="editValue"
        :delete="!deletable ? null : deleteValue"
        :mode="mode"
        @on-blur="$emit('on-blur', $event)"
        @new-value="$emit('new-value', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      default: null
    },
    valueToView: {
      type: Object,
      default: null
    },
    type: {
      type: String,
      required: true
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
    },
    contentView () {
      return this.$sanitize(this.valueToView.value)
    }
  },
  methods: {
    editValue (newValue, oldValue) {
      return this.save(this.getStringValue(newValue, oldValue))
    },
    deleteValue () {
      return this.delete()
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
