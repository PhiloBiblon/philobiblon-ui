<template>
  <v-tooltip
    right
    open-delay="200"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        icon
        x-small
        v-bind="attrs"
        v-on="on"
      >
        <v-icon x-small>
          mdi-help-circle-outline
        </v-icon>
      </v-btn>
    </template>
    <span>{{ text }}</span>
  </v-tooltip>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    text: {
      type: String,
      default: 'TODO'
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
