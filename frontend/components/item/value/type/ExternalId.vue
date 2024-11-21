<template>
  <div>
    <span v-if="!isUserLogged">
      <a :href="valueToView.url" target="_blank">{{ valueToView.value }}</a>
    </span>
    <div v-else>
      <item-util-edit-text-field
        :save="editValue"
        :delete="deleteValue"
        :can-delete="canDelete"
        :value="valueToView_.value"
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
      required: true
    },
    delete: {
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
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    canDelete () {
      return this.type === 'claim'
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
