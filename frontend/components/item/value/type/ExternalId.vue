<template>
  <div>
    <span v-if="!isUserLogged">
      <a :href="valueToView.url" target="_blank">{{ valueToView.value }}</a>
    </span>
    <div v-else>
      <item-util-edit-text-field
        :value="valueToView_.value"
        :save="editValue"
        :delete="deleteValue"
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
