<template>
  <div>
    <span v-if="!isUserLogged">
      <span v-html="contentView" />
    </span>
    <div v-else>
      <item-util-edit-text-field :save="editValue" :value="valueToView_.value" />
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
      valueToView_: { ...this.valueToView }
    }
  },
  computed: {
    contentView() {
      return this.$sanitize(this.valueToView.value);
    }
  },
  methods: {
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
