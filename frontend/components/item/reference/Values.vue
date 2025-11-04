<template>
  <div>
    <item-reference-value
      v-for="(value, index) in values"
      :key="index + '-' + values.length"
      :database="database"
      :claim="claim"
      :value="value"
      :reference="reference"
      @create-reference="$emit('create-reference', $event)"
      @delete-reference="$emit('delete-reference', $event)"
    />
  </div>
</template>

<script>
export default {
  props: {
    database: {
      type: String,
      default: null
    },
    claim: {
      type: Object,
      required: true
    },
    reference: {
      type: Object,
      required: true
    },
    values: {
      type: Array,
      required: true
    }
  }
}
</script>
