<template>
  <v-container class="mt-2">
    <div class="grey--text">
      Count of witnesses: {{ cnums.length }}
    </div>
    <item-cnum
      v-for="(value, index) in cnums"
      :key="'cnum-' + index"
      :index="index"
      :value="value"
      class="mt-2"
    />
  </v-container>
</template>

<script>
export default {
  props: {
    cnums: {
      type: Array,
      default: () => []
    }
  }
}
</script>
