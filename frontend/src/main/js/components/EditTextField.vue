<template>
  <v-text-field
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
    }
  },
  data () {
    return {
      currentText: null,
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
  },
  methods: {
    blur () {
      this.focussed = false
    },

    focus () {
      this.focussed = true
    },

    edit (label) {
      this.$emit('save', this.currentText)
    },

    restore () {
      this.currentText = this.value
    }
  }
}
</script>
