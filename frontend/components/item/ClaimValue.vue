<template>
  <v-row dense class="value">
    <v-col :cols="value.qualifiers || isMonolingualText ? 3 : 12">
      <item-value-base :claim="value" :value="value.mainsnak" type="claim" />
    </v-col>
    <item-qualifier
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
  },
  computed: {
    isMonolingualText () {
      return this.value.mainsnak.datatype === 'monolingualtext';
    },
  }
}
</script>

<style scoped>
.value {
  padding-top: 20px;
  padding-left: 30px;
}
</style>
