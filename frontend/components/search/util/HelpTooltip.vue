<template>
  <v-tooltip
    location="right"
    open-delay="200"
  >
    <template #activator="{ props: btnProps }">
      <v-btn
        icon
        size="x-small"
        v-bind="btnProps"
      >
        <v-icon size="x-small">
          mdi-help-circle-outline
        </v-icon>
      </v-btn>
    </template>
    <span>{{ text }}</span>
  </v-tooltip>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  text: { type: String, default: 'TODO' }
})
</script>
