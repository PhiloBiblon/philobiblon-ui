<template>
  <v-text-field v-bind="{ ...$attrs, ...commonAttrs }" v-on="$listeners">
    <template v-for="(_, scopedSlotName) in $scopedSlots" #[scopedSlotName]="slotData">
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
    <template #message="{ message }">
      <v-tooltip max-width="40%" bottom open-delay="200">
        <template #activator="{ on }">
          <span
            v-safe-html="message && message.length < hintMaxWidth ? $sanitize(message) : `${$sanitize(message).substring(0, hintMaxWidth)}...`"
            v-on="on"
          />
        </template>
        <span v-safe-html="$sanitize(message)" />
      </v-tooltip>
    </template>
  </v-text-field>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    hintMaxWidth: {
      type: Number,
      default: 50
    }
  },
  computed: {
    commonAttrs () {
      return {
        dense: true
      }
    }
  }
}
</script>
