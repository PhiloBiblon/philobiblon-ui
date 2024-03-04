<template>
  <v-autocomplete
    :label="label"
    ref="autocomplete"
    v-model="currentText"
    :items="options"
    :value="value"
    item-text="label"
    @blur="blur"
    @focus="focus"
    return-object
    @change="onchange"
    required
    @update:search-input="$emit('input', $event)"
    variant="outlined"
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
      default: null
    },
    label: {
      required: false,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    save: {
      type: Function,
      required: true
    },
    callbackParams: {
      type: Array,
      required: false,
      default: () => []
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
  mounted () {
    if (!this.value) {
      this.currentText = {...this.options[0] }
    } else {
      this.currentText = this.value
    }
    this.consolidatedText = {...this.currentText}
    this.consolidatedOptions = JSON.parse(JSON.stringify(this.options))
  },
  methods: {
    onchange () {
      this.focussed = true
    },
    focus (e) {
      this.focussed = true
    },
    blur () {
      if (!this.currentText) {
        this.restore()
      }
      this.focussed = false
    },
    async edit () {
      this.focussed = false
      this.$refs.autocomplete.blur()
      if (this.currentText && (this.value || this.currentText.id !== this.consolidatedText.id)) {
        await this.save(this.currentText, ...this.callbackParams)
          .then((response) => {
            if (response && !response.success) {
              throw new Error(response.info)
            }
            this.consolidatedText = this.currentText
          })
          .catch((error) => {
            // workaround to avoid weird error if the session is expired
            // the first time that we want edit the wikibase
            if (error.message === 'query is undefined') {
              error = 'Error: Session expired.'
            }
            this.$notification.error(error)
          })
      } else if (!this.currentText){
        this.$notification.error('Please fill inputs')
      }
    },

    restore () {
      this.currentText = this.consolidatedText
      this.$emit('update-options', this.consolidatedOptions)
      this.$refs.autocomplete.blur()
    }
  }
}
</script>
