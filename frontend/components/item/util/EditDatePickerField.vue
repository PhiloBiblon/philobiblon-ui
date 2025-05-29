<template>
  <v-menu
    v-model="isDatePickerActive"
    offset-y
    :close-on-content-click="false"
  >
    <template #activator="{ on, attrs }">
      <v-text-field
        v-model="currentText"
        :label="$t('common.date')"
        class="date-input"
        readonly
        v-bind="attrs"
        v-on="on"
        @focus="focus"
        @blur="blur"
      >
        <template #append>
          <v-btn
            v-if="isEditable && currentText !== consolidatedText"
            text
            icon
            @click="edit"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn
            v-if="isEditable && currentText !== consolidatedText"
            text
            icon
            @click="restore"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-btn
            v-if="isEditable && focussed"
            text
            icon
            @click.stop="deleteValue"
          >
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </template>

    <v-date-picker
      v-model="currentText"
      min="1000-01-01"
      @input="onDateSelect"
    />
  </v-menu>
</template>

<script>
export default {
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
      focussed: false,
      isDatePickerActive: false
    }
  },
  computed: {
    isEditable () {
      return this.mode === 'edit'
    }
  },
  watch: {
    currentText (newVal, oldVal) {
      if (oldVal != null && newVal !== oldVal) {
        this.focussed = true
      }
    }
  },
  mounted () {
    this.currentText = this.value
    this.consolidatedText = this.value
  },
  methods: {
    focus () {
      this.focussed = true
    },
    blur () {
      this.focussed = false
      this.$emit('on-blur', this.currentText)
    },
    onDateSelect () {
      this.isDatePickerActive = false
      this.focussed = false
      this.$emit('new-value', this.currentText)
    },
    async edit () {
      try {
        this.focussed = false
        const response = await this.save(this.currentText, this.consolidatedText)
        if (response && response.success) {
          this.consolidatedText = this.currentText
          this.$notification.success(this.$i18n.t('messages.success.updated'))
        } else {
          throw new Error(response.info || 'Update failed')
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        const errorMessage = error.message.includes('modification-failed')
          ? this.$i18n.t('messages.error.modification.failed')
          : this.$i18n.t('messages.error.session.expired')
        this.$notification.error(errorMessage)
      }
    },
    restore () {
      this.currentText = this.consolidatedText
      this.focussed = false
      this.$emit('new-value', this.currentText)
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

<style scoped>
.v-menu__content {
  min-width: 0 !important;
  width: 290px !important;
}

.date-input {
  width: 165px;
}
</style>
