<template>
  <v-row dense class="value">
    <v-col :cols="value.qualifiers ? 3 : 12">
      <value-viewer :claim="value" :value="value.mainsnak" type="claim" />
    </v-col>
    <qualifier-viewer
      v-for="(values, property) in value.qualifiers"
      :key="keyValue+'-'+property"
      type="qualifier"
      :property="property"
      :claim="value"
      :values="values"
      :key_value="keyValue+'-'+property"
    />
  </v-row>
</template>

<script>
export default {
  props: {
    keyValue: {
      type: String,
      default: null
    },
    value: {
      type: Object,
      default: null
    }
  }
}
</script>

<style scoped>
.value {
  padding-top: 20px;
  padding-left: 30px;
}
</style>
