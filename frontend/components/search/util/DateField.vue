<template>
  <div>
    <div class="flex-container">
      <v-menu v-model="activeBegin" offset-y :close-on-content-click="false">
        <template #activator="{ on, attrs }">
          <v-text-field
            :value="beginValue"
            class="date-input"
            :disabled="disabled"
            :label="label + '. ' + $t('common.from')"
            dense
            placeholder="YYYY-MM-DD"
            v-bind="attrs"
            :append-icon="'mdi-calendar'"
            v-on="on"
            @click:append="activeBegin = true"
            @focus="showHint"
            @blur="hideHint"
            @change="validateBeginDate"
          />
        </template>
        <v-date-picker
          v-model="beginValueForPicker"
          :max="today"
          min="0001-01-01"
          @input="onBeginDateSelect"
          @change="validateBeginDate"
        />
      </v-menu>
      <v-menu v-model="activeEnd" offset-y :close-on-content-click="false">
        <template #activator="{ on, attrs }">
          <v-text-field
            :value="endValue"
            class="date-input"
            :disabled="disabled"
            :label="$t('common.to')"
            dense
            placeholder="YYYY-MM-DD"
            v-bind="attrs"
            :append-icon="'mdi-calendar'"
            v-on="on"
            @click:append="activeEnd = true"
            @focus="showHint"
            @blur="hideHint"
            @change="validateEndDate"
          />
        </template>
        <v-date-picker
          v-model="endValueForPicker"
          :max="today"
          min="0001-01-01"
          @input="onEndDateSelect"
          @change="validateEndDate"
        />
      </v-menu>
    </div>
    <div v-if="isHintVisible" class="message-container">
      <v-tooltip max-width="40%" bottom light open-delay="200">
        <template #activator="{ on }">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span class="text-caption hint" v-on="on" v-html="hint && hint.length &lt; hintMaxWidth ? $sanitize(hint) : ($sanitize(hint).substring(0, hintMaxWidth) + '...')" />
        </template>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="$sanitize(hint)" />
      </v-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: Object,
      default: null
    },
    hint: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    hintMaxWidth: {
      type: Number,
      default: 50
    }
  },
  data () {
    return {
      activeEnd: false,
      activeBegin: false,
      beginValue: null,
      endValue: null,
      isHintVisible: false,
      beginValueForPicker: null,
      endValueForPicker: null
    }
  },
  computed: {
    commonAttrs () {
      return {
        dense: true
      }
    },
    today () {
      return new Date().toISOString().slice(0, 10)
    }
  },

  watch: {
    value (newVal, _) {
      this.beginValue = newVal?.begin || null
      this.endValue = newVal?.end || null
    },
    beginValue (val) {
      this.beginValueForPicker = /^\d{4}-\d{2}-\d{2}$/.test(val) ? val : null
    },
    endValue (val) {
      this.endValueForPicker = /^\d{4}-\d{2}-\d{2}$/.test(val) ? val : null
    }
  },

  mounted () {
    this.beginValue = this.value.begin
    this.endValue = this.value.end
  },

  methods: {
    validateBeginDate (date) {
      const validated = this.validateDate(date)
      this.beginValue = validated

      if (/^\d{4}-\d{2}-\d{2}$/.test(validated)) {
        this.$set(this, 'beginValue', validated)
      } else {
        this.$set(this, 'beginValue', validated)
      }

      this.$emit('update-begin-date', validated)
    },
    validateEndDate (date) {
      const validated = this.validateDate(date)
      this.endValue = validated

      if (/^\d{4}-\d{2}-\d{2}$/.test(validated)) {
        this.$set(this, 'endValue', validated)
      } else {
        this.$set(this, 'endValue', validated)
      }

      this.$emit('update-end-date', validated)
    },
    validateDate (date) {
      if (!date) {
        return null
      }

      const DATE_REGEX = /^(\d{1,4}(-\d{1,2}){0,2}|\d{1,2}-\d{1,2})$/

      if (!DATE_REGEX.test(date)) {
        this.$notification.error(this.$t('search.form.common.date.error.invalid_date'))
        return null
      }

      const parts = date.split('-').map(Number)
      const currentYear = new Date().getFullYear()

      for (let i = 0; i < parts.length; i++) {
        const num = parts[i]
        if (num < 1) {
          this.$notification.error(this.$t('search.form.common.date.error.invalid_day'))
          return null
        }

        if (i === 0 && parts.length === 1) {
          if (num > currentYear && num > 31) {
            this.$notification.error(this.$t('search.form.common.date.error.invalid_year'))
            return null
          }
        }

        if (i === 1 || i === 2) {
          if (num > 31) {
            this.$notification.error(this.$t('search.form.common.date.error.invalid_day'))
            return null
          }
        }

        if (i === 0 && parts.length === 3 && num > currentYear) {
          this.$notification.error(this.$t('search.form.common.date.error.invalid_year'))
          return null
        }
      }

      return date
    },
    onBeginDateSelect () {
      this.activeBegin = false
    },
    onEndDateSelect () {
      this.activeEnd = false
    },
    showHint () {
      this.isHintVisible = true
    },
    hideHint () {
      this.isHintVisible = false
    }
  }
}
</script>

<style scoped>
.flex-container {
  display: flex;
  gap: 16px;
}

.message-container {
  display: flex;
  align-items: center;
  margin: 0;
}

::v-deep .v-input__control .v-text-field__details {
  height: 0px !important;
  min-height: 0px !important;
}

.hint {
  color: rgba(0, 0, 0, 0.6);
}

.v-menu__content {
  min-width: 0 !important;
  width: 290px !important;
}

.date-input {
  width: 165px;
}
</style>
