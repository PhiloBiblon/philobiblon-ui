<template>
  <div>
    <div class="flex-container">
      <v-menu v-model="activeBegin" offset-y :close-on-content-click="false">
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="beginValue"
            class="date-input"
            :disabled="disabled"
            :label="label + '. ' + $t('common.from')"
            dense
            v-bind="attrs"
            v-on="on"
            @focus="showHint"
            @blur="hideHint"
            @change="beginDate"
          />
        </template>
        <v-date-picker v-model="beginValue" @input="onBeginDateSelect" />
      </v-menu>
      <v-menu v-model="activeEnd" offset-y :close-on-content-click="false">
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="endValue"
            class="date-input"
            :disabled="disabled"
            :label="$t('common.to')"
            dense
            v-bind="attrs"
            v-on="on"
            @blur="hideHint"
            @focus="showHint"
            @change="endDate"
          />
        </template>
        <v-date-picker v-model="endValue" @input="onEndDateSelect" />
      </v-menu>
    </div>
    <div v-if="isHintVisible" class="message-container">
      <v-tooltip max-width="40%" bottom ligth open-delay="200">
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

.v-menu__content {
  min-width: 0 !important;
  width: 290px !important;
}

.date-input {
  width: 165px;
}
</style>
