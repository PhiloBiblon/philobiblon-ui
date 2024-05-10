<template>
  <v-row dense :class="{'even-row': index % 2 === 0, 'odd-row': index % 2 !== 0}">
    <v-col :cols="value.qualifiers ? 3 : 12">
      <item-value-base :claim="value" :value="value.mainsnak" type="claim" />
    </v-col>
    <v-col v-if="value.qualifiers">
      <v-container>
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
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    index: {
      type: Number,
      default: null
    },
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
.even-row {
  background-color: rgb(247, 245, 245);
  padding: 3px;
  margin: 5px;
  border-radius: 5px;
}
.odd-row {
  background-color: rgb(247, 245, 245);
  padding: 3px;
  margin: 5px;
  border-radius: 5px;
}
</style>
