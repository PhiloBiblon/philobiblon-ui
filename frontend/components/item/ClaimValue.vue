<template>
  <v-row dense class="value">
    <v-col :cols="value.qualifiers ? 3 : 12">
      <item-value-base :claim="value" :value="value.mainsnak" type="claim" />
    </v-col>
    <v-col>
      <v-row>
        <v-col
          v-for="(values, property) in value.qualifiers"
          :key="keyValue+'-'+property"
          :cols="Math.max(12 / value.qualifiers)"
          class="qualifier"
        >
          <item-qualifier
            type="qualifier"
            :property="property"
            :claim="value"
            :values="values"
            :key_value="keyValue+'-'+property"
          />
        </v-col>
      </v-row>
    </v-col>
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
.qualifier {
  padding-top: 5px;
  padding-left: 50px;
}
</style>
