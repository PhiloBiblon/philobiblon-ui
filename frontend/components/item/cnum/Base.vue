<template>
  <v-container class="mt-2">
    <div class="text-subtitle-2 red--text">
      Number of
      <span v-if="table !=='manid'">
        witnesses
      </span>
      <span v-else>
        texts in volume
      </span>
      {{ cnums.length }}
    </div>
    <item-cnum-value
      v-for="(value, index) in cnums"
      :key="'cnum-' + index"
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
    cnums: {
      type: Array,
      default: () => []
    }
  }
}
</script>
