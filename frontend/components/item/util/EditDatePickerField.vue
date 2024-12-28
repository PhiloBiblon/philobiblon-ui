<template>
  <v-menu v-model="isDatePickerActive" offset-y :close-on-content-click="false">
    <template #activator="{ on, attrs }">
      <v-text-field
        v-model="currentText"
        class="date-input"
        readonly
        v-bind="attrs"
        v-on="on"
        @focus="focus"
      >
        <template #append>
          <v-btn v-if="focussed && currentText !== consolidatedText" text icon @click="edit">
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn v-if="focussed && currentText !== consolidatedText" text icon @click="restore">
            <v-icon>mdi-close</v-icon>
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
      required: true
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
  watch: {
    currentText (newVal, oldVal) {
      if (newVal !== oldVal) {
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
    onDateSelect () {
      this.isDatePickerActive = false
    },
    async edit () {
      try {
        const response = await this.save(this.currentText, this.consolidatedText)
        if (response && response.success) {
          this.consolidatedText = this.currentText
          this.$notification.success(this.$i18n.t('messages.success.updated'))
        } else {
          throw new Error(response.info || 'Update failed')
        }
      } catch (error) {
        const errorMessage = error.message.includes('modification-failed')
          ? this.$i18n.t('messages.error.modification.failed')
          : this.$i18n.t('messages.error.session.expired')
        this.$notification.error(errorMessage)
      }
    },
    restore () {
      this.currentText = this.consolidatedText
      this.focussed = false
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
