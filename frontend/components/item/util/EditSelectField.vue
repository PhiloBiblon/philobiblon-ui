<template>
  <v-autocomplete
    ref="autocomplete"
    v-model="currentText"
    :items="options"
    item-text="label"
    return-object
    required
    variant="outlined"
    @blur="blur"
    @focus="focus"
    @change="onchange"
    @update:search-input="$emit('input', $event)"
  >
    <template #append>
      <v-btn
        v-if="focussed"
        text
        icon
        @click.stop="edit"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
      <v-btn
        v-if="focussed && canDelete"
        text
        icon
        @click.stop="deleteValue"
      >
        <v-icon>mdi-trash-can</v-icon>
      </v-btn>
      <v-btn
        v-if="focussed"
        text
        icon
        @click.stop="restore"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: null
    },
    options: {
      type: Array,
      default: () => []
    },
    save: {
      type: Function,
      required: true
    },
    canDelete: {
      type: Boolean,
      default: false
    },
    delete: {
      type: Function,
      default: null
    }
  },
  data () {
    return {
      currentText: null,
      consolidatedText: null,
      consolidatedOptions: [],
      focussed: false
    }
  },
  computed: {
    commonAttrs () {
      return {
        dense: true
      }
    }
  },
  watch: {
    value (newValue, oldValue) {
      this.currentText = newValue
      if (!oldValue) {
        this.consolidatedText = this.currentText
      }
    }
  },
  mounted () {
    if (this.value) {
      this.currentText = this.value
    } else {
      this.currentText = { ...this.options[0] }
    }
    this.consolidatedText = { ...this.currentText }
    this.consolidatedOptions = JSON.parse(JSON.stringify(this.options))
  },
  methods: {
    onchange () {
      this.focussed = true
    },
    focus () {
      this.focussed = true
    },
    blur () {
      this.focussed = false
      this.restore()
    },
    async edit () {
      this.$refs.autocomplete.isMenuActive = false
      if (this.currentText && this.currentText.id !== this.consolidatedText.id) {
        await this.save(this.currentText, this.consolidatedText)
          .then((response) => {
            if (response) {
              if (!response.success) {
                throw new Error(response.info)
              }
              this.consolidatedText = this.currentText
              this.$notification.success(this.$i18n.t('messages.success.updated'))
              this.$refs.autocomplete?.blur()
            }
          })
          .catch((error) => {
            // workaround to avoid weird error if the session is expired
            // the first time that we want edit the wikibase
            if (error.message === 'query is undefined') {
              error = this.$i18n.t('messages.error.session.expired')
            }
            this.$notification.error(error)
          })
      } else if (!this.currentText) {
        this.$notification.error(this.$i18n.t('messages.error.inputs.fill'))
      }
    },

    restore () {
      this.currentText = this.consolidatedText
      this.consolidatedOptions = [this.currentText]
      this.$emit('update-options', this.consolidatedOptions)
      this.$refs.autocomplete.blur()
    },

    async deleteValue () {
      await this.delete()
        .then((response) => {
          if (response) {
            if (!response.success) {
              throw new Error(response.info)
            }
            this.$notification.success('Successfully deleted')
          }
        })
        .catch((error) => {
          if (error.message === 'query is undefined') {
            error = 'Error: Session expired.'
          }
          this.$notification.error(error)
        })
    }
  }
}
</script>
