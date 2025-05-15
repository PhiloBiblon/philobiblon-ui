<template>
  <v-text-field
    ref="myTextField"
    v-model="currentText"
    :type="type"
    v-bind="{ ...$attrs, ...commonAttrs }"
    v-on="$listeners"
    @blur="blur"
    @focus="focus"
    @input="handleInput"
  >
    <template v-for="(_, scopedSlotName) in $scopedSlots" #[scopedSlotName]="slotData">
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
    <template #append>
      <v-btn
        v-if="focussed && isEditable"
        text
        icon
        @click.stop="edit"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
      <v-btn
        v-if="focussed"
        text
        icon
        @click.stop="restore"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-btn
        v-if="focussed && isEditable"
        text
        icon
        :disabled="!deletable"
        @click.stop="deleteValue"
      >
        <v-icon>mdi-trash-can</v-icon>
      </v-btn>
    </template>
  </v-text-field>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: 'text'
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
      currentText: null,
      consolidatedText: null,
      focussed: false
    }
  },
  computed: {
    commonAttrs () {
      return {
        dense: true
      }
    },
    isEditable () {
      return this.mode === 'edit'
    }
  },
  mounted () {
    this.currentText = this.value
    this.consolidatedText = this.value
  },
  methods: {
    blur () {
      this.focussed = false
      if (this.isEditable) {
        this.restore()
      }
    },

    focus () {
      this.focussed = true
    },

    handleInput (value) {
      this.$emit('new-value', this.currentText)
    },

    async edit () {
      if (this.isEditable) {
        await this.save(this.currentText, this.consolidatedText)
          .then((response) => {
            if (response) {
              if (!response.success) {
                throw new Error(response.info)
              }
              this.consolidatedText = this.currentText
              this.$notification.success(this.$i18n.t('messages.success.updated'))
            }
          })
          .catch((error) => {
            // workaround to avoid weird error if the session is expired
            // the first time that we want edit the wikibase
            if (error.message === 'query is undefined') {
              error = this.$i18n.t('messages.error.session.expired')
            }

            if (error.message.includes('modification-failed')) {
              error = this.$i18n.t('messages.error.modification.failed')
            }

            this.$notification.error(error)
          })
      }
      this.$refs.myTextField?.blur()
    },

    restore () {
      this.currentText = this.consolidatedText
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
