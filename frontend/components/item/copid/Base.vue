<template>
  <v-container class="mt-2">
    <div class="text-subtitle-2 red--text">
      Number of additional copies of edition {{ copids.length }}
    </div>
    <item-copid-value
      v-for="(value, index) in copids"
      :key="'copid-' + index"
      :index="index"
      :table="table"
      :value="value"
      class="mt-2"
    />
  </v-container>
</template>

<script>
export default {
  props: {
    table: {
      type: String,
      required: true
    },
    copids: {
      type: Array,
      default: () => []
    }
  }
}
</script>
