<template>
  <v-textarea
    ref="myTextField"
    v-model="currentText"
    v-bind="{ ...$attrs, ...commonAttrs }"
    v-on="$listeners"
    auto-grow
    rows="1"
    dense
    hide-details
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
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on">
              mdi-check
            </v-icon>
          </template>
          <span>{{ $t("common.save") }}</span>
        </v-tooltip>
      </v-btn>
      <v-btn
        v-if="focussed"
        text
        icon
        @click.stop="restore"
      >
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on">
              mdi-close
            </v-icon>
          </template>
          <span>{{ $t("common.cancel") }}</span>
        </v-tooltip>
      </v-btn>
      <v-btn
        v-if="focussed && isEditable"
        text
        icon
        @click.stop="deleteValue"
      >
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on">
              mdi-trash-can
            </v-icon>
          </template>
          <span>{{ $t("common.remove") }}</span>
        </v-tooltip>
      </v-btn>
    </template>
  </v-textarea>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
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
      this.$emit('on-blur', this.currentText)
    },

    focus () {
      this.focussed = true
      this.resizeTextarea()
    },

    handleInput (value) {
      this.$emit('new-value', this.currentText)
      this.resizeTextarea()
    },
    resizeTextarea () {
      this.$nextTick(() => {
        const textarea = this.$refs.myTextField?.$el?.querySelector('textarea')
        if (textarea) {
          textarea.style.height = 'auto'
          textarea.style.height = textarea.scrollHeight + 'px'
        }
      })
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
      this.$emit('new-value', this.currentText)
      this.$nextTick(() => this.resizeTextarea())
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
