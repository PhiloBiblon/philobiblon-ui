<template>
  <div>
    <span v-if="!isUserLogged">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="valueToView.value" />
    </span>
    <div v-else>
      <item-util-edit-text-field
        :save="editValue"
        :value="valueToView_.value"
        :delete="deleteValue"
        :can-delete="canDelete"
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
