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
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-on="on" v-html="message && message.length &lt; hintMaxWidth ? message : message.substring(0, hintMaxWidth) + '...'" />
        </template>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="message" />
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
