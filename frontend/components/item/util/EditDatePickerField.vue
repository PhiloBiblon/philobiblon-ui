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
        :placeholder="datePlaceholder"
        :hint="dateHint"
        persistent-hint
        v-bind="attrs"
        @focus="focus"
        @blur="handleBlur"
        @keyup.enter="handleManualInput"
        @click:append-outer="isDatePickerActive = true"
        v-on="on"
      >
        <template #append-outer>
          <v-icon small @click="isDatePickerActive = true">
            mdi-calendar
          </v-icon>
        </template>
        <template #append>
          <v-btn
            v-if="isEditable && currentText !== consolidatedText"
            text
            icon
            @click="edit"
          >
            <v-tooltip top>
              <template #activator="{ btnOn, btnAttrs }">
                <v-icon v-bind="btnAttrs" v-on="btnOn">
                  mdi-check
                </v-icon>
              </template>
              <span>{{ $t("common.save") }}</span>
            </v-tooltip>
          </v-btn>
          <v-btn
            v-if="isEditable && currentText !== consolidatedText"
            text
            icon
            @click="restore"
          >
            <v-tooltip top>
              <template #activator="{ btnOn, btnAttrs }">
                <v-icon v-bind="btnAttrs" v-on="btnOn">
                  mdi-close
                </v-icon>
              </template>
              <span>{{ $t("common.cancel") }}</span>
            </v-tooltip>
          </v-btn>
          <v-btn
            v-if="isEditable && focussed"
            text
            icon
            @click.stop="deleteValue"
          >
            <v-tooltip top>
              <template #activator="{ btnOn, btnAttrs }">
                <v-icon v-bind="btnAttrs" v-on="btnOn">
                  mdi-trash-can
                </v-icon>
              </template>
              <span>{{ $t("common.remove") }}</span>
            </v-tooltip>
          </v-btn>
        </template>
      </v-text-field>
    </template>

    <v-date-picker
      v-model="pickerDate"
      min="1000-01-01"
      :picker-date.sync="pickerViewDate"
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
      isDatePickerActive: false,
      pickerDate: null,
      pickerViewDate: '1400-01' // Default view to historical period
    }
  },
  computed: {
    isEditable () {
      return this.mode === 'edit'
    },
    datePlaceholder () {
      return 'YYYY, YYYY-MM, or YYYY-MM-DD'
    },
    dateHint () {
      return 'Enter year, year-month, or full date'
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
    // Set picker view date based on existing value or default to 1400
    if (this.value) {
      const year = this.extractYear(this.value)
      if (year) {
        this.pickerViewDate = `${year}-01`
        this.pickerDate = this.value
      }
    }
  },
  methods: {
    focus () {
      this.focussed = true
    },
    handleBlur () {
      this.focussed = false
      // Validate and normalize the input on blur
      if (this.currentText) {
        const normalized = this.normalizeDate(this.currentText)
        if (normalized) {
          this.currentText = normalized
        }
      }
      this.$emit('on-blur', this.currentText)
    },
    handleManualInput () {
      // Validate and normalize the input
      if (this.currentText) {
        const normalized = this.normalizeDate(this.currentText)
        if (normalized) {
          this.currentText = normalized
          this.$emit('new-value', this.currentText)
        } else {
          this.$notification.error('Invalid date format. Use YYYY, YYYY-MM, or YYYY-MM-DD')
        }
      }
    },
    normalizeDate (input) {
      if (!input) {
        return null
      }
      const trimmed = input.trim()

      // Full date: YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed
      }

      // Year-Month: YYYY-MM
      if (/^\d{4}-\d{2}$/.test(trimmed)) {
        return trimmed
      }

      // Year only: YYYY
      if (/^\d{4}$/.test(trimmed)) {
        return trimmed
      }

      // Try to parse various formats
      // Year only without leading zeros
      if (/^\d{1,4}$/.test(trimmed)) {
        const year = parseInt(trimmed, 10)
        if (year >= 1 && year <= 9999) {
          return String(year).padStart(4, '0')
        }
      }

      return null
    },
    extractYear (dateStr) {
      if (!dateStr) {
        return null
      }
      const match = dateStr.match(/^(\d{4})/)
      return match ? match[1] : null
    },
    onDateSelect () {
      this.isDatePickerActive = false
      this.focussed = false
      // Sync picker date to text field
      this.currentText = this.pickerDate
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
  width: 220px;
}

.date-input ::v-deep .v-text-field__details {
  margin-bottom: 0;
}

.date-input ::v-deep .v-messages {
  font-size: 10px;
}
</style>
