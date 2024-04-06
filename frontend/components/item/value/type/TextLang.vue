<template>
  <div>
    <template v-if="!isUserLogged">
      <item-util-view-text-lang :value="valueToView" />
    </template>
    <template v-else>
      <v-select
        v-model="valueToView_.language"
        :label="$t('common.language')"
        :items="['ca', 'es', 'en', 'gl', 'pt']"
        @change="editLanguage"
      />
      <item-util-edit-text-field :save="editValue" :value="valueToView_.value" />
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
    editLanguage (newLanguage) {
      this.valueToView_.language = newLanguage
      this.save(this.getMonolingualTextValue(this.valueToView_.value))
        .then((response) => {
          if (response) {
            if (!response.success) {
              throw new Error(response.info)
            }
            this.$notification.success('Successfully updated')
          }
        })
    },
    editValue (newValue, oldValue) {
      return this.save(this.getMonolingualTextValue(newValue, oldValue))
    },
    getMonolingualTextValue (newValue, oldValue) {
      return {
        validation: {
          valid: true
        },
        values: {
          oldValue,
          newValue: {
            text: newValue,
            language: this.valueToView_.language
          }
        }
      }
    }
  }
}
</script>
