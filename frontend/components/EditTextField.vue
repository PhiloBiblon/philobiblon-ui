<template>
  <v-text-field
    ref="myTextField"
    v-model="currentText"
    v-bind="{ ...$attrs, ...commonAttrs }"
    v-on="$listeners"
    @blur="blur"
    @focus="focus"
  >
    <template v-for="(_, scopedSlotName) in $scopedSlots" #[scopedSlotName]="slotData">
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
    <template #append>
      <v-btn
        v-if="focussed"
        text
        icon
        @click="edit"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
      <v-btn
        v-if="focussed"
        text
        icon
        @click="restore"
      >
        <v-icon>mdi-close</v-icon>
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
    save: {
      type: Function,
      required: true
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
    }
  },
  mounted () {
    this.currentText = this.value
    this.consolidatedText = this.value
  },
  methods: {
    blur () {
      this.focussed = false
      this.restore()
    },

    focus () {
      this.focussed = true
    },

    async edit (label) {
      await this.save(this.currentText)
        .then((response) => {
          if (!response.success) {
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
      this.$refs.myTextField.blur()
    },

    restore () {
      this.currentText = this.consolidatedText
    }
  }
}
</script>
