<template>
  <v-text-field density="compact" v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData || {}" />
    </template>
    <template #message="{ message }">
      <v-tooltip max-width="40%" location="bottom" open-delay="200">
        <template #activator="{ props: tooltipProps }">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-bind="tooltipProps" v-html="message && message.length < hintMaxWidth ? $sanitize(message) : $sanitize(message).substring(0, hintMaxWidth) + '...'" />
        </template>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="$sanitize(message)" />
      </v-tooltip>
    </template>
  </v-text-field>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  hintMaxWidth: { type: Number, default: 50 }
})

const { $sanitize } = useNuxtApp()
</script>
