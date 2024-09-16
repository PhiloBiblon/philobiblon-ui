<template>
  <div>
    <div class="flex-container">
      <v-text-field
        v-model="beginValue"
        dense
        :label="label + '. ' + $t('common.from')"
        type="date"
        :disabled="disabled"
        @focus="showHint"
        @blur="hideHint"
        @change="beginDate"
      />
      <v-text-field
        v-model="endValue"
        dense
        :label="$t('common.to')"
        type="date"
        :disabled="disabled"
        @focus="showHint"
        @blur="hideHint"
        @change="endDate"
      />
    </div>
    <div v-if="isHintVisible" class="message-container">
      <v-tooltip max-width="40%" bottom ligth open-delay="200">
        <template #activator="{ on }">
          <span
            v-safe-html="hint && hint.length < hintMaxWidth ? $sanitize(hint) : `${$sanitize(hint).substring(0, hintMaxWidth)}...`"
            class="text-caption hint"
            v-on="on"
          />
        </template>
        <span v-safe-html="$sanitize(hint)" />
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
      beginValue: null,
      endValue: null,
      isHintVisible: false
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
    value (newVal, oldVal) {
      this.beginValue = newVal.begin
      this.endValue = newVal.end
    }
  },

  mounted () {
    this.beginValue = this.value.begin
    this.endValue = this.value.end
  },

  methods: {
    showHint () {
      this.isHintVisible = true
    },
    hideHint () {
      this.isHintVisible = false
    },
    beginDate (newValue) {
      this.$emit('update-begin-date', newValue)
    },
    endDate (newValue) {
      this.$emit('update-end-date', newValue)
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
</style>
